#!/bin/bash

# Azure Ubuntu VM Setup Script for SeatZ
# Run this script on your Azure Ubuntu VM

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
APP_DIR="/home/azureuser/seatz-app"
LOG_DIR="$APP_DIR/logs"
BACKUP_DIR="/home/azureuser/backups"

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root for initial setup
if [[ $EUID -eq 0 ]]; then
   print_error "This script should not be run as root. Please run as azureuser."
   exit 1
fi

print_status "Starting SeatZ deployment on Azure Ubuntu VM..."

# Update system
print_status "Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install required packages
print_status "Installing required packages..."
sudo apt install -y \
    python3.11 \
    python3.11-venv \
    python3.11-dev \
    python3-pip \
    nodejs \
    npm \
    nginx \
    git \
    curl \
    wget \
    unzip \
    htop

# Install PM2 globally
print_status "Installing PM2..."
sudo npm install -g pm2 serve

# Create directories
print_status "Creating application directories..."
mkdir -p "$LOG_DIR" "$BACKUP_DIR"

# Clone repository (replace with your repo URL)
if [ ! -d "$APP_DIR" ]; then
    print_status "Cloning repository..."
    git clone https://github.com/YOUR_USERNAME/seatz-app.git "$APP_DIR"
else
    print_status "Repository already exists, pulling latest changes..."
    cd "$APP_DIR"
    git pull origin main
fi

cd "$APP_DIR"

# Backend setup
print_status "Setting up backend..."
cd backend

# Create virtual environment
if [ ! -d "venv" ]; then
    python3.11 -m venv venv
fi

# Activate virtual environment and install dependencies
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements-azure.txt

# Copy environment file if it doesn't exist
if [ ! -f ".env" ]; then
    cp .env.example .env
    print_warning "Please edit backend/.env file with your configuration"
fi

cd ..

# Frontend setup
print_status "Setting up frontend..."
cd frontend

# Install dependencies and build
npm install
npm run build

# Copy environment file if it doesn't exist
if [ ! -f ".env" ]; then
    cp .env.example .env
    print_warning "Please edit frontend/.env file with your configuration"
fi

cd ..

# Create PM2 ecosystem files
print_status "Creating PM2 configuration..."

# Backend ecosystem file
cat > backend/ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'seatz-backend',
    script: 'venv/bin/python',
    args: '-m uvicorn app.main:app --host 0.0.0.0 --port 8000',
    cwd: '$APP_DIR/backend',
    interpreter: 'none',
    env: {
      PYTHONPATH: '$APP_DIR/backend',
      PATH: '$APP_DIR/backend/venv/bin:' + process.env.PATH
    },
    instances: 1,
    exec_mode: 'fork',
    watch: false,
    max_memory_restart: '400M',
    error_file: '$LOG_DIR/backend-error.log',
    out_file: '$LOG_DIR/backend-out.log',
    log_file: '$LOG_DIR/backend-combined.log',
    time: true
  }]
}
EOF

# Frontend ecosystem file
cat > frontend/ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'seatz-frontend',
    script: 'serve',
    args: '-s build -l 3000',
    cwd: '$APP_DIR/frontend',
    env: {
      NODE_ENV: 'production'
    },
    instances: 1,
    exec_mode: 'fork',
    watch: false,
    max_memory_restart: '300M',
    error_file: '$LOG_DIR/frontend-error.log',
    out_file: '$LOG_DIR/frontend-out.log',
    log_file: '$LOG_DIR/frontend-combined.log',
    time: true
  }]
}
EOF

# Create Nginx configuration
print_status "Configuring Nginx..."
sudo tee /etc/nginx/sites-available/seatz > /dev/null << EOF
upstream backend {
    server 127.0.0.1:8000;
}

server {
    listen 80;
    server_name _;

    # Frontend
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # Backend API
    location /api/ {
        proxy_pass http://backend/;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # Health check
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }

    # Static files caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        proxy_pass http://127.0.0.1:3000;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
EOF

# Enable site
sudo ln -sf /etc/nginx/sites-available/seatz /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration
sudo nginx -t

# Configure firewall
print_status "Configuring firewall..."
sudo ufw allow 'Nginx Full'
sudo ufw allow 22
sudo ufw --force enable

# Start services
print_status "Starting services..."
cd "$APP_DIR/backend"
pm2 start ecosystem.config.js

cd "$APP_DIR/frontend"
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save
pm2 startup
sudo env PATH=\$PATH:/usr/bin pm2 startup systemd -u azureuser --hp /home/azureuser

# Create backup script
print_status "Creating backup script..."
cat > /home/azureuser/backup.sh << EOF
#!/bin/bash
DATE=\$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

# Backup database
cp $APP_DIR/backend/seatz.db $BACKUP_DIR/seatz_\$DATE.db 2>/dev/null || true

# Backup logs
tar -czf $BACKUP_DIR/logs_\$DATE.tar.gz $LOG_DIR/ 2>/dev/null || true

# Keep only last 7 days
find $BACKUP_DIR -name "*.db" -mtime +7 -delete 2>/dev/null || true
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete 2>/dev/null || true

echo "Backup completed: \$DATE"
EOF

chmod +x /home/azureuser/backup.sh

# Create update script
print_status "Creating update script..."
cat > /home/azureuser/update.sh << EOF
#!/bin/bash
cd $APP_DIR

print_status() {
    echo -e "\033[0;32m[INFO]\033[0m \$1"
}

print_status "Pulling latest changes..."
git pull origin main

print_status "Updating backend..."
cd backend
source venv/bin/activate
pip install -r requirements-azure.txt
cd ..

print_status "Updating frontend..."
cd frontend
npm install
npm run build
cd ..

print_status "Restarting services..."
pm2 restart all

print_status "Update completed!"
EOF

chmod +x /home/azureuser/update.sh

# Create status script
print_status "Creating status script..."
cat > /home/azureuser/status.sh << EOF
#!/bin/bash
echo "=== SeatZ Application Status ==="
echo ""
echo "PM2 Processes:"
pm2 status
echo ""
echo "System Resources:"
free -h
df -h
echo ""
echo "Service Ports:"
sudo netstat -tlnp | grep -E ':(3000|8000|80)'
echo ""
echo "Recent Logs (last 10 lines):"
echo "Backend:"
tail -n 10 $LOG_DIR/backend-out.log 2>/dev/null || echo "No backend logs found"
echo ""
echo "Frontend:"
tail -n 10 $LOG_DIR/frontend-out.log 2>/dev/null || echo "No frontend logs found"
EOF

chmod +x /home/azureuser/status.sh

# Final steps
print_status "Starting Nginx..."
sudo systemctl restart nginx
sudo systemctl enable nginx

print_status "Setup completed!"
echo ""
echo "=== Next Steps ==="
echo "1. Edit configuration files:"
echo "   - $APP_DIR/backend/.env"
echo "   - $APP_DIR/frontend/.env"
echo ""
echo "2. Check service status:"
echo "   ./status.sh"
echo ""
echo "3. Access your application:"
echo "   Backend API: http://YOUR_VM_IP/api/docs"
echo "   Frontend: http://YOUR_VM_IP"
echo ""
echo "4. Useful commands:"
echo "   pm2 logs [backend|frontend] - View logs"
echo "   pm2 restart all - Restart all services"
echo "   ./update.sh - Update application"
echo "   ./backup.sh - Manual backup"
echo ""
echo "5. Set up SSL (optional):"
echo "   sudo apt install certbot python3-certbot-nginx"
echo "   sudo certbot --nginx -d your-domain.com"