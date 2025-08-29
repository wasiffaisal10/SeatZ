# Azure Ubuntu Backend + Vercel Frontend Deployment Checklist

## Architecture Overview
- **Backend**: Azure Ubuntu VM (Free Tier B1s)
- **Frontend**: Vercel (Free hosting)
- **Database**: SQLite (file-based, no server costs)

## Quick Start (3 minutes)

### 1. Create Azure VM (Backend Only)
```bash
# Run these on your local machine
az login
az group create --name seatz-student-rg --location southeastasia
az vm create --resource-group seatz-student-rg --name seatz-vm --image Ubuntu2204 --size Standard_B1s --admin-username azureuser --generate-ssh-keys
az vm open-port --resource-group seatz-student-rg --name seatz-vm --port 8000
```

### 2. Connect and Deploy Backend
```bash
ssh azureuser@YOUR_VM_IP
# Then run the setup script on the VM:
wget -O setup-backend.sh https://raw.githubusercontent.com/YOUR_REPO/main/setup-azure-vm.sh
chmod +x setup-backend.sh
./setup-backend.sh
```

### 3. Deploy Frontend to Vercel
```bash
# On your local machine
cd frontend
npm install
npm run build
vercel --prod
```

### 4. Configure Environment Variables

**Backend (.env)**:
```bash
DATABASE_URL=sqlite:///./seatz.db
CORS_ORIGINS=https://your-frontend.vercel.app,http://localhost:3000
REACT_APP_API_URL=http://YOUR_VM_IP:8000
```

**Vercel Environment Variables**:
- `REACT_APP_API_URL`: `http://YOUR_VM_IP:8000`

## Access Points
- **Backend API**: `http://YOUR_VM_IP:8000`
- **API Documentation**: `http://YOUR_VM_IP:8000/docs`
- **Frontend**: `https://your-frontend.vercel.app`

## Cost Optimization
✅ **Backend only on Azure** - Saves ~50% of VM resources
✅ **SQLite database** - No PostgreSQL costs (~$15/month saved)
✅ **Vercel free tier** - Frontend hosting at no cost
✅ **B1s VM size** - Free with student subscription
✅ **Single port (8000)** - Minimal firewall configuration

## Monthly Costs
- **Azure VM**: $0 (student subscription)
- **Storage**: ~$1-3/month (SQLite + logs)
- **Vercel**: $0 (free tier)
- **Total**: $1-3/month vs $20-50 traditional setup

## Support Commands
```bash
# Check backend status
pm2 status
pm2 logs

# Update backend
./update.sh

# Configure CORS for new frontend URL
./configure-cors.sh

# Manual backup
./backup.sh
```

## Security Notes
- CORS configured for Vercel domains only
- No Nginx required (direct FastAPI)
- SQLite file permissions secured
- Firewall only allows port 8000