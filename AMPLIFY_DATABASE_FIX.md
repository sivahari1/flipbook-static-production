# AWS Amplify Database Connection Fix

## Issue
The deployment was failing with:
```
Error [PrismaClientConstructorValidationError]: Invalid value undefined for datasource "db" provided to PrismaClient constructor.
```

## Root Cause
During the build process, AWS Amplify tries to statically analyze and pre-render pages, which causes Prisma to initialize without the `DATABASE_URL` environment variable being available.

## Solution Applied

### 1. **Updated Prisma Client Initialization** (`src/lib/prisma.ts`)
- Added fallback placeholder URL for build-time initialization
- Prevents Prisma from failing when `DATABASE_URL` is undefined during build

### 2. **Enhanced API Route Protection**
- Added database connection checks in API routes
- Returns proper error messages when database is not configured
- Prevents runtime errors in production

### 3. **Build-Time Environment Check** (`scripts/check-build-env.js`)
- Automatically sets placeholder values for required environment variables during build
- Ensures build process completes successfully
- Logs environment variable status for debugging

### 4. **Updated Build Configuration**
- Modified `amplify.yml` to run environment checks before build
- Updated `package.json` build scripts to include environment validation
- Added proper error handling for missing database connections

## Environment Variables Required in AWS Amplify

Set these in AWS Amplify Console → Environment Variables:

```bash
# Database (Required for runtime)
DATABASE_URL=postgresql://username:password@host:port/database

# Authentication (Required)
NEXTAUTH_SECRET=your-random-32-character-secret
NEXTAUTH_URL=https://your-amplify-domain.amplifyapp.com

# AWS Cognito (Required)
NEXT_PUBLIC_AWS_REGION=ap-south-1
NEXT_PUBLIC_AWS_USER_POOL_ID=your_user_pool_id
NEXT_PUBLIC_AWS_USER_POOL_WEB_CLIENT_ID=your_client_id
AWS_COGNITO_CLIENT_SECRET=your_client_secret

# Razorpay (Required for payments)
NEXT_PUBLIC_RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret

# Application URLs
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-amplify-domain.amplifyapp.com
```

## Deployment Steps

1. **Set Environment Variables** in AWS Amplify Console
2. **Trigger New Deployment** - the build should now succeed
3. **Verify Database Connection** - ensure your PostgreSQL database is accessible from AWS
4. **Test Application** - verify all features work correctly

## Build Process Flow

1. **preBuild Phase:**
   - Install dependencies with `--legacy-peer-deps`
   - Run environment check script
   - Generate Prisma client with placeholder URL

2. **Build Phase:**
   - Run environment check again
   - Build Next.js application with proper fallbacks
   - Static generation skips database-dependent routes

3. **Runtime:**
   - API routes check for valid database connection
   - Return appropriate errors if database not configured
   - Normal operation when all environment variables are set

## Testing Locally

```bash
# Test build process locally
npm run build

# Test with missing DATABASE_URL
unset DATABASE_URL
npm run build  # Should still succeed

# Test runtime behavior
npm start  # API routes will return database configuration errors
```

## Monitoring

- Check AWS Amplify build logs for environment variable status
- Monitor CloudWatch logs for database connection issues
- Verify API endpoints return proper error messages when database is unavailable

This fix ensures that:
- ✅ Build process completes successfully even without database access
- ✅ Runtime properly handles missing database configuration
- ✅ Clear error messages guide users to configure environment variables
- ✅ No breaking changes to existing functionality