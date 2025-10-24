# 🚀 Production Deployment Checklist

## Pre-Deployment Setup

### 1. Database Setup (Railway)
- [ ] Create Railway account at [railway.app](https://railway.app)
- [ ] Deploy PostgreSQL database
- [ ] Copy connection string
- [ ] Test database connection
- [ ] Run migrations: `npm run db:migrate:deploy`

### 2. Email Service Setup (Resend)
- [ ] Create Resend account at [resend.com](https://resend.com)
- [ ] Verify your domain
- [ ] Get API key
- [ ] Test email sending

### 3. Payment Gateway Setup (Razorpay)
- [ ] Create Razorpay account at [razorpay.com](https://razorpay.com)
- [ ] Complete KYC verification
- [ ] Get test API keys
- [ ] Get live API keys (after testing)
- [ ] Test payment flow

### 4. File Storage Setup (AWS S3 or Cloudinary)
#### Option A: AWS S3
- [ ] Create AWS account
- [ ] Create S3 bucket in `ap-south-1` region
- [ ] Create IAM user with S3 permissions
- [ ] Get access keys
- [ ] Test file upload

#### Option B: Cloudinary
- [ ] Create Cloudinary account
- [ ] Get API credentials
- [ ] Test file upload

### 5. Environment Variables
- [ ] Copy `.env.production.template` to `.env.production`
- [ ] Fill in all required values:
  - [ ] `DATABASE_URL`
  - [ ] `NEXTAUTH_URL`
  - [ ] `NEXTAUTH_SECRET`
  - [ ] `RESEND_API_KEY`
  - [ ] `FROM_EMAIL`
  - [ ] `RAZORPAY_KEY_ID`
  - [ ] `RAZORPAY_KEY_SECRET`
  - [ ] `AWS_ACCESS_KEY_ID` (or Cloudinary credentials)
  - [ ] `AWS_SECRET_ACCESS_KEY`
  - [ ] `AWS_S3_BUCKET`
  - [ ] `ENCRYPTION_KEY`

## Code Preparation

### 6. Code Quality Checks
- [ ] Run type checking: `npm run type-check`
- [ ] Run linting: `npm run lint`
- [ ] Fix all TypeScript errors
- [ ] Fix all ESLint warnings
- [ ] Test build locally: `npm run build`

### 7. Database Migration
- [ ] Generate Prisma client: `npm run db:generate`
- [ ] Create migration for PostgreSQL: `npx prisma migrate dev --name init`
- [ ] Test migration on staging database

### 8. Security Review
- [ ] Review all environment variables
- [ ] Ensure no secrets in code
- [ ] Check CORS settings
- [ ] Verify security headers in `next.config.ts`
- [ ] Test authentication flows

## Deployment to Vercel

### 9. Vercel Setup
- [ ] Create Vercel account at [vercel.com](https://vercel.com)
- [ ] Install Vercel CLI: `npm i -g vercel`
- [ ] Login: `vercel login`
- [ ] Connect GitHub repository

### 10. Environment Variables in Vercel
- [ ] Add all production environment variables in Vercel dashboard
- [ ] Verify variable names match exactly
- [ ] Test with preview deployment first

### 11. Domain Configuration
- [ ] Add custom domain in Vercel dashboard
- [ ] Update DNS records as instructed
- [ ] Wait for SSL certificate provisioning
- [ ] Update `NEXTAUTH_URL` to use custom domain

### 12. Final Deployment
- [ ] Deploy to production: `vercel --prod`
- [ ] Verify deployment success
- [ ] Test all critical paths:
  - [ ] Homepage loads correctly
  - [ ] User registration works
  - [ ] Email verification works
  - [ ] Sign-in works
  - [ ] Payment flow works
  - [ ] File upload works
  - [ ] Document sharing works

## Post-Deployment

### 13. Monitoring Setup
- [ ] Set up error tracking (Sentry)
- [ ] Configure uptime monitoring
- [ ] Set up performance monitoring
- [ ] Configure log aggregation

### 14. Testing
- [ ] Test user registration flow
- [ ] Test email verification
- [ ] Test payment processing
- [ ] Test document upload and sharing
- [ ] Test on mobile devices
- [ ] Test with different browsers

### 15. Performance Optimization
- [ ] Check Core Web Vitals
- [ ] Optimize images and assets
- [ ] Test loading speeds
- [ ] Verify CDN is working

### 16. Security Verification
- [ ] Run security scan
- [ ] Test HTTPS enforcement
- [ ] Verify security headers
- [ ] Test authentication security

## Launch Preparation

### 17. Content and Legal
- [ ] Add privacy policy
- [ ] Add terms of service
- [ ] Add contact information
- [ ] Prepare launch announcement

### 18. Backup and Recovery
- [ ] Set up database backups
- [ ] Document recovery procedures
- [ ] Test backup restoration
- [ ] Set up monitoring alerts

## Quick Commands

```bash
# Prepare for deployment
npm run deploy:prep

# Deploy to Vercel
npm run vercel:deploy

# Check database
npm run db:studio

# Run migrations
npm run db:migrate:deploy
```

## Troubleshooting

### Common Issues
1. **Database Connection**: Ensure connection string includes `?sslmode=require`
2. **Email Not Sending**: Check domain verification in Resend
3. **Payment Failing**: Verify Razorpay webhook URLs
4. **File Upload Issues**: Check S3 bucket permissions
5. **Build Errors**: Run `npm run type-check` locally first

### Support Resources
- [Vercel Documentation](https://vercel.com/docs)
- [Railway Documentation](https://docs.railway.app)
- [Resend Documentation](https://resend.com/docs)
- [Razorpay Documentation](https://razorpay.com/docs)

## Estimated Timeline
- **Setup Phase**: 2-4 hours
- **Testing Phase**: 1-2 hours
- **Deployment**: 30 minutes
- **Verification**: 1 hour

**Total**: 4-7 hours for complete production setup

---

✅ **Ready for Production!** Once all items are checked, your Flipbook DRM platform will be live and ready for users.