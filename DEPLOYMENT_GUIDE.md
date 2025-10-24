# 🚀 Production Deployment Guide

## Recommended Deployment Platform: **Vercel** (Best for Next.js)

### Why Vercel?
- **Native Next.js Support**: Built by the Next.js team
- **Zero Configuration**: Deploy with a single command
- **Global CDN**: Fast content delivery worldwide
- **Automatic HTTPS**: SSL certificates included
- **Serverless Functions**: Perfect for API routes
- **Indian Data Centers**: Low latency for Indian users
- **Cost Effective**: Generous free tier, reasonable pricing

## 🛠️ Pre-Deployment Checklist

### 1. Database Setup
```bash
# Switch to PostgreSQL for production
npm install pg @types/pg
```

Update `prisma/schema.prisma`:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

### 2. Email Service Setup
**Recommended**: Gmail SMTP or SendGrid
- Enable 2FA on Gmail
- Generate App Password
- Update SMTP credentials in environment variables

### 3. Payment Integration
**For India**: Razorpay (already integrated)
- Get live API keys from Razorpay dashboard
- Set up webhooks for payment verification
- Configure GST settings

### 4. File Storage
**Recommended**: AWS S3 with CloudFront
- Create S3 bucket in `ap-south-1` (Mumbai) region
- Set up CloudFront distribution
- Configure CORS for file uploads

## 📋 Step-by-Step Deployment

### Option 1: Vercel (Recommended)

#### Step 1: Prepare Repository
```bash
# Remove development files
rm -rf test-*.js create-*.js check-*.js
rm -rf .next node_modules

# Install dependencies
npm install
```

#### Step 2: Set up Database
```bash
# Use Vercel Postgres or external PostgreSQL
# Example with Vercel Postgres:
npm i @vercel/postgres
```

#### Step 3: Configure Environment Variables
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add all variables from `.env.production.template`

#### Step 4: Deploy
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Option 2: Railway (Alternative)

#### Why Railway?
- **Database Included**: PostgreSQL with automatic backups
- **Simple Deployment**: Git-based deployments
- **Indian Pricing**: Affordable for Indian market
- **Redis Included**: Built-in Redis for caching

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway link
railway up
```

### Option 3: DigitalOcean App Platform

#### Why DigitalOcean?
- **Bangalore Data Center**: Low latency for Indian users
- **Managed Database**: PostgreSQL with automated backups
- **Competitive Pricing**: Good value for money
- **Indian Payment Methods**: Supports Indian cards/UPI

## 🔧 Production Configuration

### 1. Environment Variables Setup

Create `.env.production`:
```env
# Database (PostgreSQL)
DATABASE_URL="postgresql://user:pass@host:5432/flipbook_drm"

# Application
NEXTAUTH_URL="https://your-domain.com"
NEXTAUTH_SECRET="your-32-character-secret"

# Email (Gmail SMTP)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-business-email@gmail.com"
SMTP_PASS="your-app-password"

# Razorpay (Live Keys)
RAZORPAY_KEY_ID="rzp_live_xxxxxxxxx"
RAZORPAY_KEY_SECRET="your_live_secret"

# AWS S3 (Mumbai Region)
AWS_ACCESS_KEY_ID="your_access_key"
AWS_SECRET_ACCESS_KEY="your_secret_key"
AWS_REGION="ap-south-1"
S3_BUCKET_NAME="your-production-bucket"

# Redis
REDIS_URL="redis://your-redis-url:6379"
```

### 2. Database Migration
```bash
# Run migrations on production database
npx prisma migrate deploy
npx prisma generate
```

### 3. Build Optimization
```bash
# Test production build
npm run build
npm start
```

## 🔐 Security Hardening

### 1. Environment Security
- Use strong, unique secrets
- Enable database SSL
- Set up proper CORS policies
- Configure rate limiting

### 2. Authentication Flow
- Fix registration to use real database
- Enable email verification
- Set up proper session management
- Add password reset functionality

### 3. File Security
- Implement virus scanning
- Add file type validation
- Set up proper access controls
- Enable audit logging

## 💳 Payment Integration (Razorpay)

### 1. Razorpay Setup
```bash
# Already integrated, just need live keys
# Update .env with live Razorpay credentials
```

### 2. Webhook Configuration
- Set up webhook endpoint: `https://your-domain.com/api/payment/webhook`
- Configure payment success/failure flows
- Add subscription management

## 📊 Monitoring & Analytics

### 1. Error Tracking
```bash
npm install @sentry/nextjs
```

### 2. Performance Monitoring
- Set up Vercel Analytics
- Configure Google Analytics
- Add performance metrics

## 🌐 Domain & SSL

### 1. Custom Domain
- Purchase domain from GoDaddy/Namecheap
- Configure DNS settings
- Set up SSL certificates (automatic with Vercel)

### 2. CDN Configuration
- Configure CloudFront for S3 assets
- Set up proper caching headers
- Optimize image delivery

## 💰 Cost Estimation (Monthly)

### Vercel Deployment:
- **Vercel Pro**: $20/month
- **Vercel Postgres**: $20/month
- **AWS S3**: ~$5-10/month
- **Domain**: ~$1/month
- **Total**: ~$46-51/month (~₹3,800-4,200)

### Railway Deployment:
- **Railway Pro**: $20/month
- **Database**: Included
- **Domain**: ~$1/month
- **Total**: ~$21/month (~₹1,750)

## 🎯 My Recommendation: **Vercel + Vercel Postgres**

### Why This Stack?
1. **Seamless Integration**: Built for Next.js
2. **Indian Users**: Good performance in India
3. **Scalability**: Handles traffic spikes automatically
4. **Developer Experience**: Easy deployments and monitoring
5. **Cost Effective**: Reasonable pricing for features provided

### Quick Start Commands:
```bash
# 1. Install Vercel CLI
npm i -g vercel

# 2. Login to Vercel
vercel login

# 3. Deploy
vercel --prod

# 4. Set up database
# Go to Vercel Dashboard → Storage → Create Database → Postgres

# 5. Configure environment variables in Vercel dashboard
```

## 🔄 Post-Deployment Tasks

1. **Test all functionality**:
   - User registration and email verification
   - Document upload and sharing
   - Payment processing
   - Email notifications

2. **Set up monitoring**:
   - Error tracking
   - Performance monitoring
   - Uptime monitoring

3. **Configure backups**:
   - Database backups
   - File storage backups
   - Configuration backups

4. **Security audit**:
   - Penetration testing
   - Security headers
   - SSL configuration

Would you like me to help you set up any specific part of this deployment process?