# 🎯 SeatZ - Real-Time University Course Seat Monitoring System

A comprehensive, production-ready web application for monitoring university course seat availability with real-time notifications and intelligent alerting.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python](https://img.shields.io/badge/Python-3.11+-blue.svg)](https://python.org/)
[![React](https://img.shields.io/badge/React-18+-61DAFB.svg)](https://reactjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688.svg)](https://fastapi.tiangolo.com/)
[![Azure](https://img.shields.io/badge/Azure-Cloud-blue.svg)](https://azure.microsoft.com/)

## 📋 Table of Contents

- [🎯 Overview](#-overview)
- [✨ Features](#-features)
- [🏗️ Architecture](#️-architecture)
- [🚀 Quick Start](#-quick-start)
- [🔧 Installation](#-installation)
- [☁️ Azure Deployment](#️-azure-deployment)
- [📊 API Documentation](#-api-documentation)
- [🎨 Frontend Guide](#-frontend-guide)
- [🔍 Monitoring & Logs](#-monitoring--logs)
- [🛡️ Security](#️-security)
- [📈 Performance](#-performance)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)

## 🎯 Overview

SeatZ is a sophisticated university course monitoring system that provides real-time seat availability tracking, automated notifications, and comprehensive analytics. Built with modern web technologies, it offers both student-friendly interfaces and robust backend services.

### 🎯 Key Objectives
- **Real-time Monitoring**: Track seat availability across university courses
- **Intelligent Alerts**: Configurable notifications via email and webhooks
- **Scalable Architecture**: Designed for high availability and performance
- **Cost-Effective**: Optimized for Azure free tier deployment

## ✨ Features

### 🔍 **Core Monitoring**
- **Real-time Seat Tracking**: Live updates every 5 minutes
- **Multi-Course Support**: Monitor multiple courses simultaneously
- **Historical Analytics**: Track seat trends over time
- **Course Search**: Advanced filtering and autocomplete

### 📧 **Notification System**
- **Email Alerts**: SMTP-based email notifications
- **Webhook Support**: Custom webhook integrations
- **Configurable Triggers**: Set custom alert conditions
- **Batch Notifications**: Grouped updates to prevent spam

### 👥 **User Management**
- **User Registration**: Secure account creation
- **Personalized Dashboards**: Custom monitoring views
- **Alert Management**: Create, modify, and delete alerts
- **Preferences**: Customizable notification settings

### 📱 **Modern Interface**
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Real-time Updates**: Live dashboard with WebSocket support
- **Dark/Light Mode**: Theme switching capability
- **Progressive Web App**: Installable on mobile devices

## 🏗️ Architecture

### 🏛️ **System Architecture**
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Frontend│    │   FastAPI       │    │   SQLite        │
│   (Vercel)      │◄──►│   Backend       │◄──►│   Database      │
│   Port: 3000    │    │   Port: 8000    │    │   File-based    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │              ┌─────────────────┐              │
         │              │   Background    │              │
         └──────────────┤   Scheduler     │──────────────┘
                        │   (APScheduler) │
                        └─────────────────┘
```

### 🔧 **Technology Stack**

**Backend:**
- **Framework**: FastAPI (Python 3.11+)
- **Database**: SQLite with SQLAlchemy ORM
- **Task Queue**: APScheduler for background jobs
- **Email**: SMTP with secure authentication
- **API**: RESTful endpoints with OpenAPI documentation

**Frontend:**
- **Framework**: React 18 with Hooks
- **Styling**: Tailwind CSS for responsive design
- **State Management**: React Context API
- **HTTP Client**: Axios for API communication
- **Icons**: Heroicons for consistent UI

**Infrastructure:**
- **Cloud**: Microsoft Azure (Southeast Asia region)
- **VM**: Ubuntu 22.04 LTS (Standard B1s)
- **Process Manager**: PM2 for Node.js and Python
- **Reverse Proxy**: Nginx for routing and SSL
- **CI/CD**: GitHub Actions ready

## 🚀 Quick Start

### 📋 **Prerequisites**
- **Node.js**: 18+ (for frontend development)
- **Python**: 3.11+ (for backend development)
- **Git**: Latest version
- **Azure Account**: With student credits (optional)

### 🏃 **Local Development**

1. **Clone Repository**
```bash
git clone https://github.com/wasiffaisal10/SeatZ.git
cd SeatZ
```

2. **Backend Setup**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

3. **Frontend Setup**
```bash
cd frontend
npm install
npm start
```

4. **Access Application**
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

## 🔧 Installation

### 🖥️ **Local Installation**

#### **Backend Installation**
```bash
# Create virtual environment
python -m venv seatz-backend
source seatz-backend/bin/activate

# Install dependencies
pip install -r backend/requirements.txt

# Initialize database
cd backend
python -c "from app.database import init_db; init_db()"

# Run development server
uvicorn app.main:app --reload --port 8000
```

#### **Frontend Installation**
```bash
# Install dependencies
cd frontend
npm install

# Configure environment
cp .env.example .env
# Edit .env file with your API URL

# Start development server
npm start
```

#### **Docker Installation**
```bash
# Build and run with Docker Compose
docker-compose up --build

# Access application
# Frontend: http://localhost:3000
# Backend: http://localhost:8000
```

## ☁️ Azure Deployment

### 🎯 **One-Command Deployment**

#### **Automated Azure VM Setup**
```bash
# After creating Azure VM, SSH into it:
ssh azureuser@YOUR_VM_IP

# Run automated setup
curl -sSL https://raw.githubusercontent.com/wasiffaisal10/SeatZ/master/setup-azure-vm.sh | bash
```

#### **Manual Deployment Steps**

1. **Create Azure Resources**
   - **VM**: Standard B1s (Southeast Asia)
   - **OS**: Ubuntu 22.04 LTS
   - **Ports**: 22 (SSH), 8000 (Backend)

2. **Configure VM**
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install dependencies
sudo apt install python3.11 python3-pip nodejs npm nginx git -y

# Install PM2 globally
sudo npm install -g pm2

# Clone repository
git clone https://github.com/wasiffaisal10/SeatZ.git
cd SeatZ
```

3. **Setup Backend**
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with production settings

# Start with PM2
pm2 start "uvicorn app.main:app --host 0.0.0.0 --port 8000" --name seatz-backend
```

4. **Setup Frontend**
```bash
cd frontend
npm install
npm run build

# Serve with PM2
pm2 start "npx serve -s build -p 3000" --name seatz-frontend
```

5. **Configure Nginx**
```bash
sudo cp nginx-config/nginx.conf /etc/nginx/sites-available/seatz
sudo ln -s /etc/nginx/sites-available/seatz /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 🔐 **Environment Configuration**

#### **Backend (.env)**
```bash
# Database
DATABASE_URL=sqlite:///./seatz.db

# Security
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Email (SMTP)
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password
FROM_EMAIL=SeatZ Alerts <alerts@seatz.com>

# CORS
CORS_ORIGINS=["https://seatz.vercel.app", "http://localhost:3000"]

# Monitoring
CHECK_INTERVAL_MINUTES=5
MAX_NOTIFICATIONS_PER_HOUR=10
```

#### **Frontend (.env)**
```bash
REACT_APP_API_URL=https://your-azure-vm-ip:8000
REACT_APP_ENV=production
```

## 📊 API Documentation

### 🔗 **Base URL**
- **Local**: `http://localhost:8000`
- **Production**: `https://your-azure-vm-ip:8000`

### 📋 **Endpoints Overview**

#### **Authentication**
```http
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/logout
GET    /api/auth/me
```

#### **Courses**
```http
GET    /api/courses/search?q=keyword
GET    /api/courses/{course_id}
GET    /api/courses/department/{dept}
GET    /api/courses/available
```

#### **Alerts**
```http
POST   /api/alerts
GET    /api/alerts
PUT    /api/alerts/{alert_id}
DELETE /api/alerts/{alert_id}
GET    /api/alerts/history
```

#### **Monitoring**
```http
GET    /api/monitoring/stats
GET    /api/monitoring/health
GET    /api/monitoring/logs
```

### 📖 **Interactive Documentation**
- **Swagger UI**: `/docs`
- **ReDoc**: `/redoc`
- **OpenAPI Schema**: `/openapi.json`

## 🎨 Frontend Guide

### 🖥️ **Pages Overview**

#### **Home Page** (`/`)
- **Features**: Landing page with system overview
- **Components**: Hero section, feature cards, statistics
- **Responsive**: Mobile-first design

#### **Dashboard** (`/dashboard`)
- **Real-time Updates**: Live seat availability
- **Charts**: Historical data visualization
- **Quick Actions**: Create alerts, search courses

#### **Courses** (`/courses`)
- **Search**: Advanced filtering by department, course number
- **List View**: Paginated course listings
- **Detail View**: Comprehensive course information

#### **My Alerts** (`/alerts`)
- **Active Alerts**: Current monitoring configurations
- **Alert History**: Past notifications
- **Settings**: Email preferences and thresholds

### 🎨 **Component Library**

#### **Reusable Components**
- **CourseCard**: Display course information
- **AlertModal**: Create/edit alert configurations
- **LoadingSpinner**: Loading states
- **RealTimeDashboard**: Live data display
- **SearchAutocomplete**: Course search with suggestions

#### **Styling System**
- **Tailwind CSS**: Utility-first styling
- **Custom Components**: Consistent design system
- **Responsive Grid**: Mobile-first layout
- **Dark Mode**: Theme switching support

## 🔍 Monitoring & Logs

### 📊 **System Health**
- **Endpoint**: `GET /api/monitoring/health`
- **Metrics**: CPU, Memory, Disk usage
- **Uptime**: Service availability tracking
- **Response Time**: API performance metrics

### 📝 **Logging**
- **Backend**: Structured logging with Python logging
- **Frontend**: Browser console and error tracking
- **Log Rotation**: Automatic log management
- **Log Levels**: DEBUG, INFO, WARNING, ERROR

### 🚨 **Alerting**
- **System Alerts**: Service downtime notifications
- **Error Tracking**: Exception monitoring
- **Performance**: Slow query detection
- **Security**: Failed authentication alerts

## 🛡️ Security

### 🔐 **Security Features**
- **Authentication**: JWT token-based authentication
- **Authorization**: Role-based access control
- **Data Encryption**: Password hashing with bcrypt
- **HTTPS**: SSL/TLS encryption in production
- **Rate Limiting**: API request throttling
- **Input Validation**: Comprehensive data sanitization

### 🛡️ **Security Best Practices**
- **Environment Variables**: Sensitive data in .env files
- **SQL Injection Prevention**: Parameterized queries
- **XSS Protection**: Input sanitization and validation
- **CORS Configuration**: Restricted origin policies
- **Security Headers**: CSP, HSTS, X-Frame-Options

## 📈 Performance

### ⚡ **Performance Optimizations**
- **Caching**: Redis for session and API caching
- **Database Indexing**: Optimized query performance
- **Lazy Loading**: Frontend code splitting
- **Image Optimization**: WebP format and compression
- **CDN**: Static asset delivery
- **Compression**: Gzip/Brotli for API responses

### 📊 **Performance Monitoring**
- **Response Times**: API endpoint monitoring
- **Database Queries**: Slow query analysis
- **Frontend Metrics**: Page load times
- **Resource Usage**: Memory and CPU optimization
- **Error Rates**: Failure tracking and alerting

## 🤝 Contributing

### 🎯 **Development Workflow**
1. **Fork Repository**: Create your own fork
2. **Create Branch**: `git checkout -b feature/your-feature`
3. **Make Changes**: Implement your feature
4. **Test**: Run comprehensive tests
5. **Commit**: Follow conventional commit messages
6. **Push**: `git push origin feature/your-feature`
7. **PR**: Create pull request with description

### 🧪 **Testing**
```bash
# Backend tests
cd backend
python -m pytest tests/

# Frontend tests
cd frontend
npm test

# End-to-end tests
npm run test:e2e
```

### 📋 **Code Standards**
- **Python**: PEP 8 with Black formatting
- **JavaScript**: ESLint with Airbnb configuration
- **Commit Messages**: Conventional Commits
- **Documentation**: Docstrings and JSDoc

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🆘 **Support**

### 📞 **Getting Help**
- **Issues**: [GitHub Issues](https://github.com/wasiffaisal10/SeatZ/issues)
- **Discussions**: [GitHub Discussions](https://github.com/wasiffaisal10/SeatZ/discussions)
- **Email**: support@seatz.com

### 📚 **Additional Resources**
- **Wiki**: [GitHub Wiki](https://github.com/wasiffaisal10/SeatZ/wiki)
- **API Docs**: [Interactive Documentation](https://your-api-url/docs)
- **Video Tutorials**: [YouTube Channel](https://youtube.com/seatz-tutorials)

---

**Built with ❤️ for students, by students.**

**Star ⭐ this repository if you find it helpful!**