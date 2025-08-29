# Azure Free Tier Ubuntu Backend Deployment Guide - SeatZ

## Overview
Optimized backend-only deployment for Azure Free Tier Student subscription running Ubuntu 20.04/22.04 LTS. Frontend will be hosted on Vercel, reducing Azure resource usage.

## Prerequisites
- Azure Student Subscription (Free Tier)
- Vercel account for frontend hosting
- Basic knowledge of Linux commands

## Azure VM Setup

### 1. Create Ubuntu VM (Free Tier)

```bash
# Login to Azure
az login

# Create resource group
az group create --name seatz-student-rg --location southeastasia

# Create Ubuntu VM (Free Tier - B1s)
az vm create \
  --resource-group seatz-student-rg \
  --name seatz-vm \
  --image Ubuntu2204 \
  --size Standard_B1s \
  --admin-username azureuser \
  --generate-ssh-keys \
  --public-ip-sku Standard

# Open port 8000 for backend API
az vm open-port --resource-group seatz-student-rg --name seatz-vm --port 8000

# Get public IP
az vm show -d -g seatz-student-rg -n seatz-vm --query publicIps -o tsv
```

### 2. Connect to VM

```bash
ssh azureuser@YOUR_VM_IP
```

## Server Setup

### 1. Update System

```bash
sudo apt update && sudo apt upgrade -y
```

### 2. Install Required Packages

```bash
# Install Python 3.11 and pip
sudo apt install python3.11 python3.11-venv python3.11-dev python3-pip git -y

# Install PM2 for process management
sudo npm install -g pm2
```

### 3. Configure Firewall

```bash
sudo ufw allow 8000
sudo ufw allow 22
sudo ufw --force enable
```

## Backend Deployment

### 1. Clone Repository

```bash
cd /home/azureuser
git clone YOUR_REPOSITORY_URL seatz-backend
cd seatz-backend
```

### 2. Backend Setup (Optimized)

```bash
# Create virtual environment
python3.11 -m venv venv
source venv/bin/activate

# Install dependencies (SQLite-only)
pip install --upgrade pip
pip install -r requirements-azure.txt

# Copy and configure environment
cp backend/.env.example backend/.env
```

### 3. Configure Backend for Vercel Frontend

Edit `backend/.env`:
```bash
# Database Configuration (SQLite - Low Resource)
DATABASE_URL=sqlite:///./seatz.db

# Email Configuration
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password
FROM_EMAIL=SeatZ Notifications <notifications@seatz.app>

# API Configuration
API_HOST=0.0.0.0
API_PORT=8000

# Environment
ENVIRONMENT=production
DEBUG=False

# CORS for Vercel frontend
CORS_ORIGINS=https://your-frontend.vercel.app,http://localhost:3000

# BRACU Connect API
BRACU_API_URL=https://bracu-connect-rg-hchcffasd6gnahdt.southeastasia-01.azurewebsites.net/raw-schedule
BRACU_API_TIMEOUT=30

# Background Tasks (Conservative for Free Tier)
SYNC_INTERVAL_MINUTES=30
NOTIFICATION_INTERVAL_MINUTES=60
```

### 4. Update CORS Configuration

Check your FastAPI CORS settings in `backend/app/main.py`:

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://your-frontend.vercel.app", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## Process Management with PM2

### 1. Create PM2 Configuration

Create `/home/azureuser/seatz-backend/backend/ecosystem.config.js`:
```javascript
module.exports = {
  apps: [{
    name: 'seatz-backend',
    script: 'venv/bin/python',
    args: '-m uvicorn app.main:app --host 0.0.0.0 --port 8000',
    cwd: '/home/azureuser/seatz-backend/backend',
    interpreter: 'none',
    env: {
      PYTHONPATH: '/home/azureuser/seatz-backend/backend',
      PATH: '/home/azureuser/seatz-backend/backend/venv/bin:' + process.env.PATH
    },
    instances: 1,
    exec_mode: 'fork',
    watch: false,
    max_memory_restart: '400M',
    error_file: '/home/azureuser/seatz-backend/logs/backend-error.log',
    out_file: '/home/azureuser/seatz-backend/logs/backend-out.log',
    log_file: '/home/azureuser/seatz-backend/logs/backend-combined.log',
    time: true
  }]
}
```

## Start Services

### 1. Create Log Directory

```bash
mkdir -p /home/azureuser/seatz-backend/logs
```

### 2. Start Backend

```bash
cd /home/azureuser/seatz-backend/backend
source venv/bin/activate
pm2 start ecosystem.config.js
```

### 3. Save PM2 Configuration

```bash
pm2 save
pm2 startup
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u azureuser --hp /home/azureuser
```

## Vercel Frontend Configuration

### 1. Deploy Frontend to Vercel

```bash
# On your local machine
cd frontend
npm install
npm run build

# Deploy to Vercel
vercel --prod

# Or use Vercel dashboard
```

### 2. Configure Vercel Environment Variables

In Vercel dashboard, set these environment variables:
- `REACT_APP_API_URL`: `http://YOUR_VM_IP:8000`

### 3. Update Frontend API URL

Edit `frontend/.env`:
```bash
REACT_APP_API_URL=http://YOUR_VM_IP:8000
```

## Monitoring & Maintenance

### 1. Check Status

```bash
# Check PM2 processes
pm2 status

# Check logs
pm2 logs seatz-backend

# Check system resources
htop
df -h
```

### 2. Backup Script

Create `/home/azureuser/backup.sh`:
```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/home/azureuser/backups"
mkdir -p $BACKUP_DIR

# Backup database
cp /home/azureuser/seatz-backend/backend/seatz.db $BACKUP_DIR/seatz_$DATE.db

# Backup logs
tar -czf $BACKUP_DIR/logs_$DATE.tar.gz /home/azureuser/seatz-backend/logs/

# Keep only last 7 days
find $BACKUP_DIR -name "*.db" -mtime +7 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete

echo "Backup completed: $DATE"
```

Make executable:
```bash
chmod +x /home/azureuser/backup.sh
```

### 3. Auto-backup with Cron

```bash
crontab -e
# Add: 0 2 * * * /home/azureuser/backup.sh
```

## Security Hardening

### 1. Configure Firewall

```bash
# Only allow necessary ports
sudo ufw enable
sudo ufw status
```

### 2. Update System Regularly

```bash
sudo apt update && sudo apt upgrade -y
```

## Access Your Backend

- **Backend API**: `http://YOUR_VM_IP:8000`
- **API Documentation**: `http://YOUR_VM_IP:8000/docs`
- **Health Check**: `http://YOUR_VM_IP:8000/health`

## Update Application

### 1. Pull Latest Code

```bash
cd /home/azureuser/seatz-backend
git pull origin main
```

### 2. Update Dependencies

```bash
cd backend
source venv/bin/activate
pip install -r requirements-azure.txt
```

### 3. Restart Service

```bash
pm2 restart seatz-backend
```

## Troubleshooting

### Common Issues

1. **CORS Issues**: Ensure frontend URL is in CORS_ORIGINS
2. **Memory Issues**: Monitor with `free -h` and `pm2 monit`
3. **Port Conflicts**: Check with `sudo lsof -i :8000`
4. **Permission Issues**: Ensure azureuser owns all files

### Debug Commands

```bash
# Check backend status
pm2 status
pm2 logs seatz-backend

# Test API
curl http://YOUR_VM_IP:8000/health

# Check database
sqlite3 /home/azureuser/seatz-backend/backend/seatz.db ".tables"
```

## Cost Optimization

### Azure Free Tier Benefits
- **B1s VM**: Free with student subscription
- **Storage**: ~$2-5/month for database and logs
- **Total**: $2-5/month vs $20-50 for traditional setup

### Resource Limits
- **Memory**: 400MB max for backend
- **Storage**: SQLite database (typically < 100MB)
- **Bandwidth**: Suitable for student project usage

## Support Commands

```bash
# Quick status check
pm2 status

# View logs
pm2 logs seatz-backend

# Restart service
pm2 restart seatz-backend

# Update application
cd /home/azureuser/seatz-backend
git pull origin main
cd backend
source venv/bin/activate
pip install -r requirements-azure.txt
pm2 restart seatz-backend
```