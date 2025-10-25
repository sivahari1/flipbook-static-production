# 🚀 Complete FlipBook DRM Setup Guide

## ⚡ **Quick Setup (5 minutes)**

### **Step 1: Create Supabase Database**

1. **Go to [supabase.com](https://supabase.com)**
2. **Click "Start your project"** → Sign up with GitHub/Google
3. **Create New Project**:
   - Name: `flipbook-drm`
   - Database Password: `FlipBook123!`
   - Region: Choose closest to you
   - Click "Create new project"
4. **Wait 2 minutes** for setup to complete

### **Step 2: Setup Database Schema**

1. **In Supabase Dashboard**: Click "SQL Editor" in left sidebar
2. **Click "New query"**
3. **Copy and paste this SQL**:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS "User" (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    email TEXT UNIQUE NOT NULL,
    "passwordHash" TEXT,
    role TEXT NOT NULL DEFAULT 'SUBSCRIBER',
    "emailVerified" BOOLEAN DEFAULT false,
    "emailVerificationToken" TEXT,
    "emailVerificationExpires" TIMESTAMP,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Documents table
CREATE TABLE IF NOT EXISTS "Document" (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    "ownerId" TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    "pageCount" INTEGER NOT NULL DEFAULT 1,
    "storageKey" TEXT NOT NULL,
    "tilePrefix" TEXT,
    "drmOptions" TEXT,
    "hasPassphrase" BOOLEAN DEFAULT false,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS "User_email_idx" ON "User"(email);
CREATE INDEX IF NOT EXISTS "Document_ownerId_idx" ON "Document"("ownerId");
```

4. **Click "Run"** to execute the SQL

### **Step 3: Get Database Connection String**

1. **In Supabase**: Go to Settings → Database
2. **Find "Connection string"** section
3. **Copy the URI format** (looks like):
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.xxx.supabase.co:5432/postgres
   ```
4. **Replace `[YOUR-PASSWORD]` with `FlipBook123!`**

### **Step 4: Configure AWS Amplify**

1. **Open [AWS Amplify Console](https://console.aws.amazon.com/amplify)**
2. **Select your FlipBook DRM app**
3. **Click "Environment variables"** → "Manage variables"
4. **Add these 5 variables**:

| Key | Value |
|-----|-------|
| `DATABASE_URL` | `postgresql://postgres:FlipBook123!@db.xxx.supabase.co:5432/postgres` |
| `NEXTAUTH_SECRET` | `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6` |
| `NEXTAUTH_URL` | `https://main.d39m2583vv0xam.amplifyapp.com` |
| `NEXT_PUBLIC_APP_URL` | `https://main.d39m2583vv0xam.amplifyapp.com` |
| `NODE_ENV` | `production` |

5. **Click "Save"**

### **Step 5: Redeploy**

1. **In AWS Amplify**: Go to "App settings" → "Build settings"
2. **Click "Redeploy this version"**
3. **Wait 3-5 minutes** for deployment

### **Step 6: Test Your Setup**

After deployment completes:

1. **Test Database Connection**:
   ```
   https://main.d39m2583vv0xam.amplifyapp.com/api/debug/db
   ```
   Should return: `{"status":"success","message":"Database connection successful"}`

2. **Test Document Upload**:
   - Go to your app
   - Try uploading a PDF
   - Should work without errors!

## 🔧 **Troubleshooting**

### **Common Issues:**

1. **"Database connection failed"**
   - Check DATABASE_URL format
   - Ensure password is correct (`FlipBook123!`)
   - Verify Supabase project is active

2. **"Tables don't exist"**
   - Run the SQL schema in Supabase SQL Editor
   - Check table names match exactly (case-sensitive)

3. **"Environment variables not set"**
   - Verify all 5 variables are added in Amplify
   - Redeploy after adding variables
   - Check for typos in variable names

### **Debug Commands:**

```bash
# Check environment variables
curl https://main.d39m2583vv0xam.amplifyapp.com/api/debug/env

# Test database connection
curl https://main.d39m2583vv0xam.amplifyapp.com/api/debug/db

# Initialize database (if needed)
curl -X POST https://main.d39m2583vv0xam.amplifyapp.com/api/init-db
```

## ✅ **Success Checklist**

- [ ] Supabase project created
- [ ] Database schema created (SQL executed)
- [ ] Connection string copied correctly
- [ ] All 5 environment variables added to Amplify
- [ ] Application redeployed
- [ ] Database connection test passes
- [ ] Document upload works

## 🎉 **Expected Result**

After completing these steps:
- ✅ Document uploads work perfectly
- ✅ User accounts and authentication work
- ✅ Full application functionality available
- ✅ No more 503 errors

**Total setup time: ~5 minutes**

## 📞 **Need Help?**

If you encounter issues:
1. Check the troubleshooting section above
2. Run the debug commands to identify the problem
3. Verify each step was completed correctly
4. Ensure Supabase project is active and accessible