# AWS Amplify Deployment Troubleshooting Guide

## Common Deployment Issues and Solutions

### 1. **Build Failures**

#### Issue: Native Module Compilation Errors
**Symptoms:** Errors with `canvas`, `argon2`, `sodium-native`, or `sharp`
**Solution:** 
- Updated `next.config.ts` to exclude native modules from client bundle
- Added `serverExternalPackages` configuration
- Use `--legacy-peer-deps` flag in npm install

#### Issue: Prisma Client Generation
**Symptoms:** `@prisma/client` not found errors
**Solution:**
- Added `npx prisma generate` to preBuild phase
- Ensure `DATABASE_URL` is set in environment variables

### 2. **Environment Variables**

#### Required Environment Variables:
```bash
# AWS Cognito (Required)
NEXT_PUBLIC_AWS_REGION=ap-south-1
NEXT_PUBLIC_AWS_USER_POOL_ID=your_user_pool_id
NEXT_PUBLIC_AWS_USER_POOL_WEB_CLIENT_ID=your_client_id
AWS_COGNITO_CLIENT_SECRET=your_client_secret

# Database (Required)
DATABASE_URL=your_postgresql_connection_string

# NextAuth (Required)
NEXTAUTH_SECRET=your_random_32_char_secret
NEXTAUTH_URL=https://your-amplify-domain.amplifyapp.com

# Razorpay (Required for payments)
NEXT_PUBLIC_RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret

# Application (Required)
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-amplify-domain.amplifyapp.com
```

### 3. **Deployment Steps**

1. **Set Environment Variables in Amplify Console:**
   - Go to AWS Amplify Console
   - Select your app
   - Go to "Environment variables" in left sidebar
   - Add all required variables from above

2. **Database Setup:**
   - Ensure PostgreSQL database is accessible from AWS
   - Run migrations: `npx prisma migrate deploy`
   - Generate client: `npx prisma generate`

3. **Redeploy:**
   - Trigger a new deployment from Amplify console
   - Or push changes to GitHub to auto-deploy

### 4. **Build Configuration Issues**

#### Issue: Memory/Timeout Errors
**Solution:** Update build settings in Amplify console:
```yaml
# In Amplify Console > Build settings
Build image: Amazon Linux:2023
Node.js version: 18.x or 20.x
```

#### Issue: Package Installation Failures
**Solution:** Use legacy peer deps:
```bash
npm ci --legacy-peer-deps
```

### 5. **Runtime Errors**

#### Issue: 500 Internal Server Error
**Causes:**
- Missing environment variables
- Database connection issues
- Native module loading errors

**Debug Steps:**
1. Check CloudWatch logs in AWS Console
2. Verify all environment variables are set
3. Test database connectivity
4. Check for native module imports in client-side code

### 6. **Performance Optimization**

#### Build Optimization:
- Enable caching for `node_modules` and `.next/cache`
- Use `output: 'standalone'` in next.config.ts
- Exclude unnecessary files from build

#### Runtime Optimization:
- Use CDN for static assets
- Enable compression
- Implement proper caching headers

### 7. **Security Configuration**

#### Headers:
- All security headers are configured in `next.config.ts`
- Additional headers in `amplify.yml`

#### HTTPS:
- Amplify automatically provides HTTPS
- Update `NEXTAUTH_URL` to use HTTPS domain

### 8. **Monitoring and Debugging**

#### CloudWatch Logs:
- Access logs: AWS Console > CloudWatch > Log groups
- Look for application errors and build failures

#### Build Logs:
- Available in Amplify Console > Build history
- Check each phase: Provision, Build, Deploy, Verify

### 9. **Common Error Messages**

#### "Module not found: Can't resolve 'canvas'"
**Solution:** Already fixed in updated `next.config.ts`

#### "Prisma Client is not configured"
**Solution:** Ensure `npx prisma generate` runs in preBuild

#### "NEXTAUTH_URL environment variable is not set"
**Solution:** Set `NEXTAUTH_URL` to your Amplify domain

#### "Database connection failed"
**Solution:** 
- Verify `DATABASE_URL` format
- Ensure database allows connections from AWS
- Check VPC/security group settings if using RDS

### 10. **Testing Deployment**

#### Local Testing:
```bash
# Test production build locally
npm run build
npm start
```

#### Staging Environment:
- Use Amplify branch deployments for testing
- Test with production-like environment variables

## Quick Fix Checklist

- [ ] All environment variables set in Amplify Console
- [ ] Database accessible from AWS
- [ ] Updated `amplify.yml` and `next.config.ts` files
- [ ] No native modules imported in client-side code
- [ ] Prisma client generation in build process
- [ ] HTTPS URLs in environment variables
- [ ] Build image set to Amazon Linux:2023 with Node.js 18.x+

## Support

If issues persist:
1. Check AWS Amplify documentation
2. Review CloudWatch logs for specific errors
3. Test locally with production environment variables
4. Consider using AWS support if on paid plan