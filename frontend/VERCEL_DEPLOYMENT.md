# 🚀 Vercel Frontend Deployment Guide - SeatZ

## 📋 **Quick Deployment Steps**

### **1. Vercel CLI Setup**
```bash
# Install Vercel CLI globally
npm i -g vercel

# Login to Vercel
vercel login
```

### **2. Environment Setup**
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Build for production
npm run build
```

### **3. Deploy to Vercel**

#### **Option A: Vercel CLI (Recommended)**
```bash
# Deploy with interactive setup
vercel

# Deploy to production
vercel --prod
```

#### **Option B: Vercel Dashboard**
1. Go to [vercel.com](https://vercel.com)
2. Import GitHub repository: `wasiffaisal10/SeatZ`
3. Select `frontend` directory as root
4. Configure environment variables
5. Deploy

### **4. Environment Variables Setup**

#### **Required Variables**
```bash
# In Vercel dashboard or CLI
REACT_APP_API_URL=https://your-azure-vm-ip
REACT_APP_ENV=production
```

#### **Optional Variables**
```bash
# Analytics (Google Analytics)
REACT_APP_GA_TRACKING_ID=G-XXXXXXXXXX

# Error Tracking (Sentry)
REACT_APP_SENTRY_DSN=https://your-sentry-dsn
```

## 🔧 **Configuration Details**

### **File: `vercel.json`**
- **Build Command**: `npm run build`
- **Output Directory**: `build`
- **Caching**: 1 year for static assets
- **Rewrites**: API calls to Azure backend

### **File: `.env.production`**
Pre-configured for production deployment

## 🎯 **Azure Backend Integration**

### **Step 1: Get Azure VM IP**
```bash
# After Azure deployment, get your VM's public IP
# Update REACT_APP_API_URL in Vercel dashboard
```

### **Step 2: Update Environment Variables**
```bash
# In Vercel dashboard:
REACT_APP_API_URL=https://your-azure-vm-ip
```

### **Step 3: Test Integration**
```bash
# Test API connectivity
curl https://your-azure-vm-ip/api/health

# Test frontend
curl https://your-frontend-vercel-url.vercel.app
```

## 📊 **Performance Optimizations**

### **Included Optimizations**
- ✅ **Static Asset Caching**: 1-year cache headers
- ✅ **Compression**: Automatic gzip compression
- ✅ **CDN**: Global edge network
- ✅ **Lazy Loading**: Optimized bundle splitting

### **Bundle Analysis**
```bash
# Check bundle size
npm run analyze

# Optimize build
npm run build --prod
```

## 🔍 **Testing & Monitoring**

### **Health Checks**
```bash
# Frontend health
curl https://your-frontend-vercel-url.vercel.app

# API connectivity
curl https://your-frontend-vercel-url.vercel.app/api/health

# CORS check
curl -H "Origin: https://your-frontend-vercel-url.vercel.app" \
     https://your-azure-vm-ip/api/courses/search?q=CS
```

### **Monitoring Setup**
- **Vercel Analytics**: Built-in performance monitoring
- **Error Tracking**: Sentry integration ready
- **Uptime**: Automatic uptime monitoring

## 🚨 **Troubleshooting**

### **Common Issues**

#### **CORS Error**
```bash
# Ensure Azure backend allows Vercel domain
# Update backend .env:
CORS_ORIGINS=["https://your-frontend-vercel-url.vercel.app"]
```

#### **API Connection Failed**
```bash
# Check Azure VM firewall
# Ensure port 8000 is open
# Verify backend is running
```

#### **Build Failed**
```bash
# Clear cache and rebuild
vercel --prod --force

# Check build logs
vercel logs --follow
```

## 🔄 **Deployment Commands**

### **Quick Commands**
```bash
# Deploy staging
vercel

# Deploy production
vercel --prod

# View logs
vercel logs

# Environment variables
vercel env ls
vercel env add REACT_APP_API_URL production
```

## 📋 **Deployment Checklist**

- [ ] Azure backend deployed and accessible
- [ ] Azure VM IP obtained
- [ ] Environment variables configured in Vercel
- [ ] CORS configured on Azure backend
- [ ] Frontend deployed successfully
- [ ] API connectivity tested
- [ ] Health checks passing

## 🌐 **Access URLs**

| Service | URL | Notes |
|---------|-----|--------|
| **Frontend** | `https://your-frontend-vercel-url.vercel.app` | Vercel deployment |
| **Backend API** | `https://your-azure-vm-ip` | Azure VM |
| **API Docs** | `https://your-azure-vm-ip/docs` | FastAPI docs |

## 🎯 **Success Verification**

After deployment, verify:
1. Frontend loads at Vercel URL
2. API calls work from frontend
3. Course search functionality
4. Real-time updates work
5. Email notifications function

**🚀 Ready to deploy? Start with `vercel` command in the frontend directory!**