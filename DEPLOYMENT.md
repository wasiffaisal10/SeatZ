# Deployment Guide - SeatZ

## Overview
This guide covers deploying the SeatZ application with FastAPI backend on Azure and React frontend on Vercel.

## Backend Deployment (Azure)

### Prerequisites
- Azure subscription
- Azure CLI installed
- Docker Desktop (optional, for local testing)

### 1. Azure Web App Setup

```bash
# Login to Azure
az login

# Create resource group
az group create --name seatz-rg --location southeastasia

# Create Azure Web App
az webapp create \
  --resource-group seatz-rg \
  --plan seatz-plan \
  --name seatz-backend \
  --runtime "PYTHON:3.11"

# Configure environment variables
az webapp config appsettings set \
  --resource-group seatz-rg \
  --name seatz-backend \
  --settings \
    DATABASE_URL="postgresql://user:pass@host:5432/seatz" \
    SMTP_HOST="smtp.gmail.com" \
    SMTP_PORT="587" \
    SMTP_USERNAME="your-email@gmail.com" \
    SMTP_PASSWORD="your-app-password" \
    BRACU_API_URL="https://bracu-connect-rg-hchcffasd6gnahdt.southeastasia-01.azurewebsites.net/raw-schedule" \
    SYNC_INTERVAL_MINUTES="15"
```

### 2. Deploy with GitHub Actions

1. Create GitHub repository
2. Add Azure service connection to GitHub secrets:
   - `AZURE_CREDENTIALS`: Service principal credentials
3. Push code to trigger deployment

### 3. Manual Deployment

```bash
# Build and deploy locally
cd backend
az webapp up --resource-group seatz-rg --name seatz-backend
```

## Frontend Deployment (Vercel)

### Prerequisites
- Vercel account
- GitHub repository

### 1. Deploy from GitHub

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy from frontend directory
cd frontend
vercel --prod
```

### 2. Configure Environment Variables

In Vercel dashboard:
- `REACT_APP_API_URL`: Your Azure backend URL

### 3. Build Configuration

The `vercel.json` file handles:
- Build process
- Environment variables
- Routing (SPA support)
- Static file serving

## Database Setup

### PostgreSQL on Azure

```bash
# Create PostgreSQL server
az postgres server create \
  --resource-group seatz-rg \
  --name seatz-postgres \
  --location southeastasia \
  --admin-user seatzadmin \
  --admin-password YourStrongPassword123! \
  --sku-name GP_Gen5_2 \
  --version 11

# Create database
az postgres db create \
  --resource-group seatz-rg \
  --server-name seatz-postgres \
  --name seatz

# Get connection string
az postgres server show \
  --resource-group seatz-rg \
  --name seatz-postgres \
  --query "fullyQualifiedDomainName" \
  --output tsv
```

## Email Configuration

### Gmail SMTP Setup

1. Enable 2-factor authentication
2. Generate app password
3. Use app password in SMTP_PASSWORD

### Alternative Email Providers

- SendGrid: `smtp.sendgrid.net`
- AWS SES: `email-smtp.region.amazonaws.com`
- Mailgun: `smtp.mailgun.org`

## Monitoring & Logs

### Azure Application Insights

```bash
# Enable Application Insights
az extension add --name application-insights
az monitor app-insights component create \
  --app seatz-insights \
  --location southeastasia \
  --resource-group seatz-rg
```

### Log Streaming

```bash
# Stream logs
az webapp log tail --resource-group seatz-rg --name seatz-backend
```

## Security Best Practices

### Backend Security
- Use HTTPS only
- Implement rate limiting
- Validate all inputs
- Use environment variables for secrets
- Regular security updates

### Frontend Security
- HTTPS enforcement
- Content Security Policy (CSP)
- Input validation
- XSS prevention
- Secure API communication

## Performance Optimization

### Backend
- Enable response compression
- Use connection pooling
- Implement caching (Redis)
- Optimize database queries

### Frontend
- Enable compression (gzip/brotli)
- Use CDN for static assets
- Implement lazy loading
- Optimize images

## Scaling

### Azure Auto-scaling

```bash
# Configure auto-scaling
az webapp plan update \
  --resource-group seatz-rg \
  --name seatz-plan \
  --number-of-workers 2 \
  --sku S1
```

### Vercel Edge Functions
- Automatic global CDN
- Edge caching
- Instant cache invalidation

## Troubleshooting

### Common Issues

1. **Database Connection**: Check firewall rules and connection string
2. **Email Delivery**: Verify SMTP credentials and port settings
3. **CORS Issues**: Ensure proper CORS configuration
4. **Memory Issues**: Monitor resource usage and scale as needed

### Health Checks

- Backend: `GET /health`
- Frontend: `GET /` (should load without errors)
- Database: Check connection status
- Email: Test notification delivery

## Maintenance

### Regular Tasks
- Monitor application logs
- Update dependencies
- Backup database
- Review security settings
- Check resource usage

### Automated Maintenance
- GitHub Actions for CI/CD
- Azure Monitor for alerts
- Automated dependency updates
- Regular security scans

## Support

For deployment issues:
1. Check application logs
2. Verify configuration
3. Test individual components
4. Review monitoring dashboards

Contact support: support@seatz.app