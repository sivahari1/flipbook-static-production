# AWS Amplify Deployment Fix Guide

## 🚨 Current Issue: HTTP ERROR 500

The Amplify deployment is failing with a 500 error. Here's how to fix it:

## 🔧 Quick Fix Steps

### 1. **Set Environment Variables in Amplify Console**

Go to your Amplify app console and add these environment variables:

```bash
# Required for build
DATABASE_URL=postgresql://build:build@localhost:5432/build
NEXTAUTH_SECRET=your-32-character-secret-key-here
NEXTAUTH_URL=https://main.d39m2583vv0xam.amplifyapp.com
NODE_ENV=production

# Optional but recommended
NEXT_PUBLIC_APP_URL=https://main.d39m2583vv0xam.amplifyapp.com
NEXT_TELEMETRY_DISABLED=1
```

### 2. **Trigger a New Deployment**

After setting the environment variables:
1. Go to your Amplify console
2. Click "Redeploy this version" or push a new commit
3. Monitor the build logs

### 3. **Alternative: Manual Redeploy**

If the above doesn't work, try this approach:

```bash
# In your local project
git add .
git commit -m "Fix Amplify deployment configuration"
git push origin main
```

## 🔍 Build Process Explanation

The updated configuration:
- ✅ Sets default environment variables during build
- ✅ Generates Prisma client properly
- ✅ Uses simplified build process
- ✅ Handles missing dependencies gracefully

## 📋 Environment Variables Needed

### **Minimum Required (for build to work):**
```bash
DATABASE_URL=postgresql://build:build@localhost:5432/build
NEXTAUTH_SECRET=build-time-secret-placeholder-32chars-long
NEXTAUTH_URL=https://main.d39m2583vv0xam.amplifyapp.com
```

### **Production Ready (for full functionality):**
```bash
# Database
DATABASE_URL=your_actual_production_database_url

# Authentication
NEXTAUTH_SECRET=your_secure_32_character_secret
NEXTAUTH_URL=https://main.d39m2583vv0xam.amplifyapp.com

# AWS Cognito (if using)
NEXT_PUBLIC_AWS_REGION=ap-south-1
NEXT_PUBLIC_AWS_USER_POOL_ID=your_user_pool_id
NEXT_PUBLIC_AWS_USER_POOL_WEB_CLIENT_ID=your_client_id
AWS_COGNITO_CLIENT_SECRET=your_client_secret

# Payments (if using)
NEXT_PUBLIC_RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret
```

## 🚀 Expected Result

After applying these fixes, you should see:
- ✅ Build completes successfully
- ✅ Application loads without 500 error
- ✅ Landing page displays properly
- ✅ DRM protection features work

## 🔧 Troubleshooting

If you still see issues:

1. **Check Build Logs**: Look for specific error messages in Amplify console
2. **Verify Node Version**: Ensure Amplify is using Node 18+
3. **Database Connection**: The build uses a placeholder DB URL, but runtime needs real DB
4. **Environment Variables**: Double-check all required vars are set

## 📞 Need Help?

If the deployment still fails:
1. Check the Amplify build logs for specific errors
2. Verify all environment variables are properly set
3. Ensure the GitHub repository has the latest code
4. Try a fresh deployment from the Amplify console

---

**Note**: The current configuration allows the build to complete even without a real database connection, but you'll need proper environment variables for full functionality in production.