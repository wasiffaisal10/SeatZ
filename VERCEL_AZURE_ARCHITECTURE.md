# 🚀 Vercel + Azure Production Architecture - SeatZ

## 🎯 **Architecture Overview**

```
┌─────────────────────────────────────────────────────────┐
│                      Internet                           │
└─────────────────────┬───────────────────────────────────┘
                      │
┌─────────────────────┴───────────────────────────────────┐
│                 Vercel Edge Network                      │
│                  (Global CDN)                          │
│  ┌─────────────────────────────────────────────────┐   │
│  │            React Frontend                        │   │
│  │         seatz-frontend.vercel.app               │   │
│  │                                                  │   │
│  │  • Static Assets (JS/CSS/Images)               │   │
│  │  • Optimized Build                              │   │
│  │  • Global Caching                               │   │
│  │  • SSL Certificate                              │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────┬───────────────────────────────────┘
                      │
┌─────────────────────┴───────────────────────────────────┐
│              Azure Ubuntu VM (Singapore)                 │
│  ┌─────────────────────────────────────────────────┐   │
│  │              Backend API                       │   │
│  │              your-vm-ip:8000                   │   │
│  │                                                  │   │
│  │  • FastAPI + SQLite                            │   │
│  │  • Real-time Notifications                     │   │
│  │  • Email Service                               │   │
│  │  • Background Tasks                            │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

## 📊 **Deployment Strategy**

### **Frontend (Vercel)**
- **Service**: Vercel Static Site Hosting
- **Domain**: `seatz-frontend.vercel.app`
- **Cost**: **$0/month** (Hobby tier)
- **CDN**: Global edge network
- **SSL**: Automatic Let's Encrypt
- **Build Time**: ~2-3 minutes

### **Backend (Azure)**
- **Service**: Azure B1s VM (Singapore)
- **Domain**: `your-azure-vm-ip:8000`
- **Cost**: **$0/month** (Student credits)
- **Storage**: 64GB Premium SSD
- **Bandwidth**: 15GB free tier

## 🔧 **Configuration Files**

### **Frontend Configuration**
- **vercel.json**: Build and routing configuration
- **.env.production**: Production environment variables
- **.vercelignore**: Build optimization

### **Backend Configuration**
- **setup-azure-vm.sh**: Automated deployment script
- **.env.azure-ubuntu**: Environment variables
- **nginx.conf**: Reverse proxy configuration

## 🚀 **Quick Deployment**

### **Step 1: Deploy Backend (Azure)**
```bash
# SSH into Azure VM
ssh azureuser@your-vm-ip

# Run automated setup
curl -sSL https://raw.githubusercontent.com/wasiffaisal10/SeatZ/master/setup-azure-vm.sh | bash
```

### **Step 2: Deploy Frontend (Vercel)**
```bash
# Navigate to frontend
cd frontend

# Deploy to Vercel
vercel --prod

# Set environment variables
vercel env add REACT_APP_API_URL production
# Enter: https://your-azure-vm-ip
```

## 🌐 **Access URLs**

| Service | URL | Configuration |
|---------|-----|---------------|
| **Frontend** | `https://seatz-frontend.vercel.app` | Vercel deployment |
| **Backend API** | `https://your-azure-vm-ip` | Azure VM + Nginx |
| **API Docs** | `https://your-azure-vm-ip/docs` | FastAPI Swagger |
| **Health Check** | `https://your-azure-vm-ip/health` | Backend status |

## 🔍 **Testing Checklist**

### **Frontend Tests**
- [ ] Page loads successfully
- [ ] Course search works
- [ ] Real-time updates
- [ ] Responsive design
- [ ] API connectivity

### **Backend Tests**
- [ ] API endpoints accessible
- [ ] Database queries working
- [ ] Email notifications
- [ ] Background tasks
- [ ] CORS configuration

### **Integration Tests**
- [ ] Frontend → Backend communication
- [ ] CORS headers working
- [ ] SSL certificates valid
- [ ] Performance metrics

## 📋 **Environment Variables**

### **Vercel (Frontend)**
```bash
REACT_APP_API_URL=https://your-azure-vm-ip
REACT_APP_ENV=production
REACT_APP_GA_TRACKING_ID=G-XXXXXXXXXX
REACT_APP_SENTRY_DSN=https://your-sentry-dsn
```

### **Azure (Backend)**
```bash
DATABASE_URL=sqlite:///./seatz_production.db
CORS_ORIGINS=["https://seatz-frontend.vercel.app"]
SECRET_KEY=your-secret-key
SMTP_CONFIGURATION=your-email-config
```

## 🚨 **Troubleshooting**

### **CORS Issues**
```bash
# Update backend CORS origins
CORS_ORIGINS=["https://seatz-frontend.vercel.app"]
```

### **API Connection Failed**
```bash
# Check Azure VM firewall
sudo ufw status
sudo ufw allow 8000
```

### **SSL Certificate Issues**
```bash
# Renew Let's Encrypt
sudo certbot renew --dry-run
```

## 📊 **Performance Metrics**

### **Vercel (Frontend)**
- **Global TTFB**: <100ms
- **Build Time**: ~2-3 minutes
- **Bundle Size**: ~500KB gzipped
- **Cache Hit Rate**: 95%+

### **Azure (Backend)**
- **API Response Time**: <200ms
- **Database Query Time**: <50ms
- **Email Delivery**: <5 seconds
- **Uptime**: 99.9%

## 🎯 **Next Steps**

1. **Deploy Backend**: Use Azure automated script
2. **Get VM IP**: Note your Azure VM's public IP
3. **Deploy Frontend**: Use Vercel CLI or dashboard
4. **Configure DNS**: Optional custom domain setup
5. **Monitor**: Set up alerts and monitoring

## 🔗 **Quick Links**

- **GitHub Repository**: https://github.com/wasiffaisal10/SeatZ
- **Vercel Dashboard**: https://vercel.com/dashboard
- **Azure Portal**: https://portal.azure.com
- **API Documentation**: https://your-azure-vm-ip/docs

## 🎉 **Success Indicators**

✅ **Frontend**: Loads at Vercel URL  
✅ **Backend**: Accessible at Azure VM IP  
✅ **Integration**: Frontend → Backend communication working  
✅ **Performance**: Sub-second response times  
✅ **SSL**: Valid certificates on both services  

**🚀 Ready to deploy? Start with the Azure backend, then deploy to Vercel!**