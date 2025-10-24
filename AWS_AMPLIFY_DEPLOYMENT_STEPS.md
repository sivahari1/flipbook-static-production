# 🚀 AWS Amplify Deployment Guide for FlipBook DRM

## 📋 Prerequisites

Before deploying to AWS Amplify, ensure you have:
- AWS Account with appropriate permissions
- GitHub/GitLab repository with your code
- All required environment variables ready
- Production database setup (RDS PostgreSQL recommended)

## 🔧 Step 1: Prepare Your Application

### 1.1 Clean Up Development Files
```bash
# Remove test and debug files (optional for production)
rm -rf test-*.js debug-*.js setup-*.js
rm -rf src/app/test-* src/app/debug-* src/app/*-working
rm -rf src/components/dev/ src/components/examples/
```

### 1.2 Verify Build Configuration
```bash
# Test production build locally
npm run build
npm start
```

### 1.3 Update Next.js Configuration
Ensure your `next.config.ts` is optimized for production:

```typescript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    domains: ['your-domain.com'],
    formats: ['image/webp', 'image/avif'],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig
```

## 🏗️ Step 2: Set Up AWS Services

### 2.1 Create RDS PostgreSQL Database
1. Go to AWS RDS Console
2. Create Database → PostgreSQL
3. Choose production template
4. Configure:
   - **Instance**: db.t3.micro (for testing) or db.t3.small (for production)
   - **Region**: ap-south-1 (Mumbai) for Indian users
   - **Storage**: 20GB minimum
   - **Backup**: 7 days retention
   - **Security Group**: Allow connections from Amplify

### 2.2 Set Up AWS Cognito (if not already done)
1. Go to AWS Cognito Console
2. Create User Pool
3. Configure:
   - **Sign-in options**: Email
   - **Password policy**: Strong passwords
   - **MFA**: Optional (recommended for production)
   - **Email verification**: Required
4. Create App Client
5. Note down:
   - User Pool ID
   - App Client ID
   - App Client Secret

### 2.3 Configure Razorpay (Production Keys)
1. Login to Razorpay Dashboard
2. Switch to Live Mode
3. Get Live API Keys:
   - Key ID (starts with `rzp_live_`)
   - Key Secret
4. Set up Webhooks:
   - URL: `https://your-domain.com/api/payment/webhook`
   - Events: payment.captured, payment.failed

## 🚀 Step 3: Deploy to AWS Amplify

### 3.1 Access AWS Amplify Console
1. Go to [AWS Amplify Console](https://console.aws.amazon.com/amplify/)
2. Click "New app" → "Host web app"

### 3.2 Connect Repository
1. Choose your Git provider (GitHub/GitLab)
2. Authorize AWS Amplify to access your repository
3. Select your FlipBook DRM repository
4. Choose the main/master branch

### 3.3 Configure Build Settings
1. **App name**: `flipbook-drm-production`
2. **Environment**: `production`
3. **Build and test settings**: Use existing `amplify.yml`

Your existing `amplify.yml` looks good, but let's optimize it:

```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm ci
        - echo "Installing dependencies..."
    build:
      commands:
        - echo "Building Next.js application..."
        - npm run build
        - echo "Build completed successfully!"
  artifacts:
    baseDirectory: .next
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
      - .next/cache/**/*
  customHeaders:
    - pattern: '**/*'
      headers:
        - key: 'X-Content-Type-Options'
          value: 'nosniff'
        - key: 'X-Frame-Options'
          value: 'DENY'
        - key: 'X-XSS-Protection'
          value: '1; mode=block'
        - key: 'Strict-Transport-Security'
          value: 'max-age=31536000; includeSubDomains'
    - pattern: '/api/**'
      headers:
        - key: 'Cache-Control'
          value: 'no-cache, no-store, must-revalidate'
    - pattern: '/_next/static/**'
      headers:
        - key: 'Cache-Control'
          value: 'public, max-age=31536000, immutable'
```

### 3.4 Configure Environment Variables
In the Amplify Console, go to Environment Variables and add:

```env
# Database Configuration
DATABASE_URL=postgresql://username:password@your-rds-endpoint:5432/flipbook_drm

# AWS Cognito Configuration
NEXT_PUBLIC_AWS_REGION=ap-south-1
NEXT_PUBLIC_AWS_USER_POOL_ID=ap-south-1_xxxxxxxxx
NEXT_PUBLIC_AWS_USER_POOL_WEB_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxx
AWS_COGNITO_CLIENT_SECRET=your_client_secret_here

# Razorpay Configuration (LIVE KEYS)
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_live_razorpay_secret

# NextAuth Configuration
NEXTAUTH_SECRET=your_32_character_random_secret_here
NEXTAUTH_URL=https://your-amplify-domain.amplifyapp.com

# Application Configuration
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-amplify-domain.amplifyapp.com

# Email Configuration (Optional - for custom SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-business-email@gmail.com
SMTP_PASS=your_app_password

# Security
ENCRYPTION_KEY=your_32_character_encryption_key_here
```

### 3.5 Deploy Application
1. Click "Save and deploy"
2. Wait for the build to complete (usually 5-10 minutes)
3. Check build logs for any errors

## 🌐 Step 4: Configure Custom Domain (Optional)

### 4.1 Add Custom Domain
1. In Amplify Console → Domain management
2. Click "Add domain"
3. Enter your domain name
4. Choose subdomain configuration:
   - `www.yourdomain.com` → Primary
   - `yourdomain.com` → Redirect to www

### 4.2 DNS Configuration
If using Route 53:
1. AWS will automatically configure DNS
2. Wait for SSL certificate provisioning (up to 24 hours)

If using external DNS provider:
1. Add CNAME records as shown in Amplify Console
2. Wait for DNS propagation

## 🔧 Step 5: Post-Deployment Configuration

### 5.1 Database Migration
Run database migrations on your production database:

```bash
# Connect to your production database and run:
npx prisma migrate deploy
npx prisma generate
```

### 5.2 Test Application Functionality
1. **Authentication Flow**:
   - User registration
   - Email verification
   - Login/logout

2. **Document Management**:
   - Upload documents
   - View documents
   - Share documents
   - Delete documents

3. **Payment Flow**:
   - Select subscription plan
   - Complete payment with Razorpay
   - Verify subscription activation

4. **Email Notifications**:
   - Registration confirmation
   - Payment confirmation
   - Document sharing notifications

### 5.3 Set Up Monitoring
1. **CloudWatch Logs**: Automatically enabled
2. **Amplify Monitoring**: Built-in metrics
3. **Custom Monitoring** (Optional):
   ```bash
   npm install @sentry/nextjs
   ```

## 🔐 Step 6: Security Hardening

### 6.1 Environment Security
- ✅ All secrets in environment variables
- ✅ No hardcoded credentials in code
- ✅ Strong database passwords
- ✅ Proper CORS configuration

### 6.2 AWS Security
1. **IAM Roles**: Amplify uses managed roles
2. **Security Groups**: Configure RDS access
3. **VPC**: Consider using VPC for database
4. **WAF**: Enable AWS WAF for DDoS protection

### 6.3 Application Security
1. **Rate Limiting**: Implement API rate limiting
2. **Input Validation**: Validate all user inputs
3. **File Upload Security**: Scan uploaded files
4. **Session Security**: Secure session management

## 📊 Step 7: Performance Optimization

### 7.1 Caching Strategy
- Static assets cached via CloudFront
- API responses with appropriate cache headers
- Database query optimization

### 7.2 Image Optimization
- Use Next.js Image component
- Configure image domains in next.config.ts
- Enable WebP/AVIF formats

### 7.3 Bundle Optimization
- Analyze bundle size: `npm run build`
- Remove unused dependencies
- Enable tree shaking

## 💰 Cost Estimation

### AWS Amplify Hosting:
- **Build minutes**: $0.01 per minute
- **Data transfer**: $0.15 per GB
- **Requests**: $0.20 per million requests
- **Estimated monthly cost**: $10-50 for small to medium traffic

### Additional AWS Services:
- **RDS PostgreSQL (db.t3.micro)**: ~$15/month
- **Cognito**: Free tier covers most usage
- **CloudWatch**: ~$5/month for basic monitoring
- **Total estimated cost**: $30-70/month

## 🚨 Troubleshooting Common Issues

### Build Failures
```bash
# Check build logs in Amplify Console
# Common issues:
1. Missing environment variables
2. TypeScript errors
3. Missing dependencies
4. Build timeout (increase build timeout in settings)
```

### Runtime Errors
```bash
# Check CloudWatch logs
# Common issues:
1. Database connection errors
2. Missing environment variables
3. CORS issues
4. Authentication configuration errors
```

### Performance Issues
```bash
# Monitor in Amplify Console
# Common solutions:
1. Enable caching
2. Optimize images
3. Reduce bundle size
4. Use CDN for static assets
```

## ✅ Deployment Checklist

### Pre-Deployment:
- [ ] Code is tested and working locally
- [ ] All environment variables are configured
- [ ] Database is set up and accessible
- [ ] Razorpay is configured with live keys
- [ ] AWS Cognito is properly configured

### During Deployment:
- [ ] Repository is connected to Amplify
- [ ] Build settings are configured
- [ ] Environment variables are set
- [ ] Custom domain is configured (if needed)

### Post-Deployment:
- [ ] Application is accessible and working
- [ ] All features are tested in production
- [ ] Monitoring is set up
- [ ] Security measures are in place
- [ ] Performance is optimized

## 🎉 Congratulations!

Your FlipBook DRM application is now live on AWS Amplify! 

### Next Steps:
1. **Monitor Performance**: Keep an eye on metrics and logs
2. **User Feedback**: Collect and act on user feedback
3. **Security Updates**: Regularly update dependencies
4. **Feature Development**: Continue adding new features
5. **Scaling**: Monitor usage and scale resources as needed

### Support Resources:
- [AWS Amplify Documentation](https://docs.amplify.aws/)
- [Next.js Deployment Guide](https://nextjs.org/docs/deployment)
- [AWS Support](https://aws.amazon.com/support/)

Your application is now ready to serve users worldwide! 🚀