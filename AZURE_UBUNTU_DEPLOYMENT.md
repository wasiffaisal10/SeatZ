# 🚀 Azure Ubuntu Production Deployment Guide - SeatZ

Complete step-by-step guide for deploying SeatZ on Azure Ubuntu VM with production-grade configuration.

## 📋 **Deployment Overview**

### 🎯 **What You'll Build**
- **Backend**: FastAPI server on Ubuntu 22.04 LTS
- **Frontend**: React app served via Nginx
- **Database**: SQLite with automated backups
- **Process Management**: PM2 for reliability
- **Monitoring**: Health checks and logging
- **Security**: SSL/TLS with Let's Encrypt

### 💰 **Cost Optimization**
- **Azure Free Tier**: B1s VM (750 hours/month free)
- **Total Monthly Cost**: $0 with Azure for Students
- **Bandwidth**: 15 GB free per month
- **Storage**: 64 GB premium SSD included

---

## 🏗️ **Pre-Deployment Checklist**

### ✅ **Prerequisites**
- [ ] Azure account with active subscription
- [ ] GitHub repository access
- [ ] Domain name (optional, for SSL)
- [ ] Email service credentials (Gmail SMTP)

### 📊 **Resource Requirements**
- **VM Size**: Standard B1s (1 vCPU, 1 GB RAM)
- **OS**: Ubuntu 22.04 LTS
- **Storage**: Premium SSD LRS (64 GB)
- **Location**: Southeast Asia (for Bangladesh proximity)

---

## 🔧 **Step 1: Azure VM Creation**

### 📋 **Azure Portal Setup**

#### **1.1 Create Virtual Machine**
```bash
# Configuration Summary
Resource Group: seatz-rg
VM Name: seatz-vm
Region: Southeast Asia
Availability Options: No infrastructure redundancy
Security Type: Standard
Image: Ubuntu Server 22.04 LTS (minimal)
Size: Standard B1s (1 vCPU, 1 GB RAM)
Authentication: SSH public key
Username: azureuser
SSH Key: Generate new or use existing
Public Inbound Ports: HTTP, HTTPS, SSH
```

#### **1.2 Networking Configuration**
```bash
# Create Virtual Network
Name: seatz-vnet
Address Space: 10.0.0.0/16
Subnet: default (10.0.0.0/24)
Public IP: Static (Standard)
Network Security Group: Basic
```

#### **1.3 Security Rules**
```bash
# Inbound Rules
Priority 100: AllowSSH (Port 22)
Priority 110: AllowHTTP (Port 80)
Priority 120: AllowHTTPS (Port 443)
Priority 130: AllowBackend (Port 8000)
Priority 140: AllowFrontend (Port 3000)
```

---

## 🚀 **Step 2: Automated Deployment**

### ⚡ **One-Command Setup**

#### **2.1 Connect to VM**
```bash
# Get VM IP from Azure Portal
ssh azureuser@YOUR_VM_IP

# Update system
sudo apt update && sudo apt upgrade -y
```

#### **2.2 Run Automated Script**
```bash
# Download and execute automated setup
curl -sSL https://raw.githubusercontent.com/wasiffaisal10/SeatZ/master/setup-azure-vm.sh | bash
```

#### **2.3 Verify Installation**
```bash
# Check service status
pm2 status
sudo systemctl status nginx

# Test backend
curl http://localhost:8000/health
```

---

## 🔧 **Step 3: Manual Deployment (Alternative)**

### 🛠️ **System Setup**

#### **3.1 Install Dependencies**
```bash
# Update package lists
sudo apt update && sudo apt upgrade -y

# Install essential packages
sudo apt install -y \
    python3.11 \
    python3-pip \
    python3.11-venv \
    nodejs \
    npm \
    nginx \
    git \
    curl \
    wget \
    supervisor \
    fail2ban \
    ufw

# Install PM2 globally
sudo npm install -g pm2
```

#### **3.2 Configure Firewall**
```bash
# Enable UFW
sudo ufw enable
sudo ufw allow ssh
sudo ufw allow http
sudo ufw allow https
sudo ufw allow 8000
```

### 📁 **Application Setup**

#### **3.3 Clone Repository**
```bash
# Navigate to home directory
cd /home/azureuser

# Clone repository
git clone https://github.com/wasiffaisal10/SeatZ.git
cd SeatZ
```

#### **3.4 Backend Configuration**
```bash
# Create virtual environment
python3.11 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create production environment file
cp backend/.env.example backend/.env
```

#### **3.5 Environment Variables**
```bash
# Edit backend/.env
DATABASE_URL=sqlite:///./seatz_production.db
SECRET_KEY=your-super-secret-key-here
CORS_ORIGINS=["https://your-domain.com"]

# Email configuration
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password
FROM_EMAIL=SeatZ Alerts <alerts@your-domain.com>
```

#### **3.6 Initialize Database**
```bash
# Navigate to backend
cd backend

# Initialize database
python -c "from app.database import init_db; init_db()"

# Create admin user (optional)
python -c "from app.crud import create_user; create_user('admin@seatz.com', 'admin123')"
```

---

## 🚀 **Step 4: Process Management**

### 📊 **PM2 Configuration**

#### **4.1 Backend Service**
```bash
# Create PM2 ecosystem file
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [
    {
      name: 'seatz-backend',
      script: 'venv/bin/uvicorn',
      args: 'app.main:app --host 0.0.0.0 --port 8000',
      cwd: '/home/azureuser/SeatZ/backend',
      interpreter: 'python3',
      env: {
        PYTHONPATH: '/home/azureuser/SeatZ/backend',
        ENVIRONMENT: 'production'
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      error_file: '/home/azureuser/logs/backend-error.log',
      out_file: '/home/azureuser/logs/backend-out.log',
      log_file: '/home/azureuser/logs/backend-combined.log'
    }
  ]
};
EOF

# Start backend
pm2 start ecosystem.config.js
pm2 save
```

#### **4.2 Frontend Build & Serve**
```bash
# Navigate to frontend
cd /home/azureuser/SeatZ/frontend

# Install dependencies
npm install

# Build for production
npm run build

# Serve with PM2
pm2 start "npx serve -s build -p 3000" --name seatz-frontend
```

#### **4.3 PM2 Startup**
```bash
# Configure PM2 to start on boot
pm2 startup systemd -u azureuser --hp /home/azureuser
sudo systemctl enable pm2-azureuser
```

---

## 🌐 **Step 5: Nginx Configuration**

### 🔄 **Reverse Proxy Setup**

#### **5.1 Create Nginx Config**
```bash
# Create Nginx configuration
sudo tee /etc/nginx/sites-available/seatz << 'EOF'
upstream backend {
    server 127.0.0.1:8000;
    keepalive 32;
}

server {
    listen 80;
    server_name _;
    
    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    
    # Frontend
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    # Backend API
    location /api/ {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # CORS headers
        add_header Access-Control-Allow-Origin *;
        add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS";
        add_header Access-Control-Allow-Headers "DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization";
        
        # Handle preflight requests
        if ($request_method = 'OPTIONS') {
            add_header Access-Control-Allow-Origin *;
            add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS";
            add_header Access-Control-Allow-Headers "DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization";
            add_header Access-Control-Max-Age 1728000;
            add_header Content-Type 'text/plain; charset=utf-8';
            add_header Content-Length 0;
            return 204;
        }
    }
    
    # Health check
    location /health {
        proxy_pass http://backend/health;
        access_log off;
    }
    
    # Static files (if served directly)
    location /static/ {
        alias /home/azureuser/SeatZ/backend/static/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
EOF

# Enable site
sudo ln -s /etc/nginx/sites-available/seatz /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default
```

#### **5.2 Test & Reload Nginx**
```bash
# Test configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

---

## 🔐 **Step 6: SSL Certificate (Let's Encrypt)**

### 🔒 **HTTPS Setup**

#### **6.1 Install Certbot**
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y
```

#### **6.2 Generate Certificate**
```bash
# Generate SSL certificate (replace with your domain)
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Test auto-renewal
sudo certbot renew --dry-run
```

#### **6.3 Auto-renewal Setup**
```bash
# Add cron job for auto-renewal
echo "0 12 * * * root /usr/bin/certbot renew --quiet" | sudo tee -a /etc/crontab
```

---

## 📊 **Step 7: Monitoring & Maintenance**

### 📈 **System Monitoring**

#### **7.1 Health Checks**
```bash
# Create health check script
cat > /home/azureuser/health-check.sh << 'EOF'
#!/bin/bash
# Backend health check
BACKEND_HEALTH=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/health)
if [ $BACKEND_HEALTH -eq 200 ]; then
    echo "$(date): Backend is healthy"
else
    echo "$(date): Backend is down - restarting"
    pm2 restart seatz-backend
fi

# Frontend health check
FRONTEND_HEALTH=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000)
if [ $FRONTEND_HEALTH -eq 200 ]; then
    echo "$(date): Frontend is healthy"
else
    echo "$(date): Frontend is down - restarting"
    pm2 restart seatz-frontend
fi
EOF

chmod +x /home/azureuser/health-check.sh

# Add to crontab
echo "*/5 * * * * /home/azureuser/health-check.sh >> /home/azureuser/logs/health-check.log 2>&1" | crontab -
```

#### **7.2 Log Management**
```bash
# Create log directory
mkdir -p /home/azureuser/logs

# Configure log rotation
sudo tee /etc/logrotate.d/seatz << 'EOF'
/home/azureuser/logs/*.log {
    daily
    rotate 7
    compress
    delaycompress
    missingok
    notifempty
    create 0644 azureuser azureuser
    postrotate
        pm2 reload all > /dev/null 2>&1 || true
    endscript
}
EOF
```

### 🔄 **Backup Strategy**

#### **7.3 Database Backup**
```bash
# Create backup script
cat > /home/azureuser/backup.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/home/azureuser/backups"
DB_PATH="/home/azureuser/SeatZ/backend/seatz.db"

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup database
cp $DB_PATH $BACKUP_DIR/seatz_backup_$DATE.db

# Keep only last 7 backups
find $BACKUP_DIR -name "seatz_backup_*.db" -mtime +7 -delete

# Log backup completion
echo "$(date): Database backup completed - seatz_backup_$DATE.db" >> /home/azureuser/logs/backup.log
EOF

chmod +x /home/azureuser/backup.sh

# Add to crontab (daily at 2 AM)
echo "0 2 * * * /home/azureuser/backup.sh" | crontab -
```

---

## 🧪 **Step 8: Testing & Validation**

### ✅ **Deployment Verification**

#### **8.1 Health Check URLs**
```bash
# Test backend
curl -I http://YOUR_VM_IP/health

# Test frontend
curl -I http://YOUR_VM_IP

# Test API
curl http://YOUR_VM_IP/api/courses/search?q=CS
```

#### **8.2 Browser Testing**
1. **Access**: http://YOUR_VM_IP
2. **Test Features**: Course search, alert creation
3. **Check Console**: No JavaScript errors
4. **Mobile Responsive**: Test on mobile devices

#### **8.3 Email Testing**
```bash
# Test email notifications
curl -X POST http://YOUR_VM_IP/api/alerts \
  -H "Content-Type: application/json" \
  -d '{
    "email": "your-test-email@gmail.com",
    "course_id": "CS101",
    "notification_type": "seat_available"
  }'
```

---

## 🔧 **Step 9: Troubleshooting**

### 🚨 **Common Issues**

#### **9.1 Port Issues**
```bash
# Check if ports are open
sudo netstat -tlnp | grep :8000
sudo ufw status

# Restart services
sudo systemctl restart nginx
pm2 restart all
```

#### **9.2 Permission Issues**
```bash
# Fix file permissions
sudo chown -R azureuser:azureuser /home/azureuser/SeatZ
sudo chmod -R 755 /home/azureuser/SeatZ
```

#### **9.3 Database Issues**
```bash
# Reset database (backup first!)
cd backend
source venv/bin/activate
python -c "from app.database import init_db; init_db()"
```

#### **9.4 PM2 Issues**
```bash
# View logs
pm2 logs seatz-backend
pm2 logs seatz-frontend

# Restart services
pm2 restart seatz-backend
pm2 restart seatz-frontend
```

### 📞 **Support Resources**
- **GitHub Issues**: https://github.com/wasiffaisal10/SeatZ/issues
- **Azure Docs**: https://docs.microsoft.com/azure/
- **PM2 Docs**: https://pm2.keymetrics.io/docs/

---

## 📊 **Performance Benchmarks**

### ⚡ **Expected Performance**
- **Response Time**: < 200ms for API calls
- **Concurrent Users**: 50+ simultaneous users
- **Memory Usage**: < 512 MB total
- **CPU Usage**: < 50% under normal load
- **Uptime**: 99.9% availability

### 📈 **Scaling Recommendations**
- **Vertical Scaling**: B2s (2 vCPU, 4 GB RAM) for 100+ users
- **Horizontal Scaling**: Load balancer with multiple VMs
- **Database**: Azure SQL Database for production scale

---

## 🎯 **Quick Reference**

### 📋 **Useful Commands**
```bash
# Service Management
pm2 status                    # Check all services
pm2 logs seatz-backend        # View backend logs
pm2 restart seatz-backend     # Restart backend
sudo systemctl status nginx  # Check Nginx status

# Database
sqlite3 backend/seatz.db ".tables"  # Check tables
sqlite3 backend/seatz.db "SELECT COUNT(*) FROM courses"  # Count courses

# Logs
tail -f logs/backend-out.log  # Real-time logs
tail -f logs/nginx-error.log  # Nginx errors

# Updates
git pull origin master        # Update code
pm2 restart all              # Restart services
```

### 🔗 **Access URLs**
- **Main App**: http://YOUR_VM_IP
- **API Docs**: http://YOUR_VM_IP/docs
- **Health Check**: http://YOUR_VM_IP/health

---

**🎉 Congratulations! Your SeatZ system is now deployed and ready for production use!**

**Next Steps**: Configure your email settings and start adding courses to monitor! 🚀