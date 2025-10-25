# Quick Database Setup for FlipBook DRM

## 🚀 **Immediate Solution (Demo Mode)**

Your application now works in **demo mode** without a database! You can upload documents immediately.

**Demo mode features:**
- ✅ Document upload works
- ✅ Files are saved locally
- ✅ Basic functionality available
- ⚠️ No user data persistence
- ⚠️ No sharing/analytics features

## 🗄️ **Setup Full Database (5 minutes)**

### **Option 1: Supabase (Recommended - Free)**

1. **Create Account**: Go to [supabase.com](https://supabase.com) → Sign up
2. **New Project**: Click "New Project" → Choose name and password
3. **Get Connection String**:
   - Go to Settings → Database
   - Copy "Connection string" (URI format)
   - Replace `[YOUR-PASSWORD]` with your project password

4. **Add to AWS Amplify**:
   - AWS Amplify Console → Your App → Environment Variables
   - Add: `DATABASE_URL` = `postgresql://postgres:[password]@[host]:5432/postgres`

### **Option 2: Railway (Alternative)**

1. **Create Account**: Go to [railway.app](https://railway.app)
2. **New Project**: Click "New Project" → "Provision PostgreSQL"
3. **Get Connection String**: Copy the DATABASE_URL from the Variables tab
4. **Add to Amplify**: Same as above

### **Required Environment Variables**

Add these in **AWS Amplify Console → Environment Variables**:

```bash
# Database (Required for full functionality)
DATABASE_URL=postgresql://postgres:[password]@[host]:5432/postgres

# Authentication (Generate random 32-char string)
NEXTAUTH_SECRET=your-random-32-character-secret-here

# Application URLs
NEXTAUTH_URL=https://main.d39m2583vv0xam.amplifyapp.com
NEXT_PUBLIC_APP_URL=https://main.d39m2583vv0xam.amplifyapp.com
NODE_ENV=production
```

### **Generate NEXTAUTH_SECRET**

Use any of these methods:
```bash
# Method 1: Online generator
# Go to: https://generate-secret.vercel.app/32

# Method 2: Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Method 3: OpenSSL
openssl rand -hex 32
```

## 🔄 **After Database Setup**

1. **Redeploy**: Trigger new deployment in AWS Amplify
2. **Test**: Upload documents - should work with full features
3. **Verify**: Check that user data persists between sessions

## 🛠️ **Troubleshooting**

### **Test Database Connection**
```bash
curl -H "x-debug-key: debug-db-check" https://main.d39m2583vv0xam.amplifyapp.com/api/debug/db
```

### **Check Environment Variables**
```bash
curl -H "x-debug-key: debug-env-check" https://main.d39m2583vv0xam.amplifyapp.com/api/debug/env
```

### **Common Issues**

1. **Wrong DATABASE_URL format**: Must start with `postgresql://`
2. **Missing password**: Replace `[YOUR-PASSWORD]` with actual password
3. **Network access**: Ensure database allows connections from anywhere (0.0.0.0/0)

## 📋 **What Each Mode Provides**

| Feature | Demo Mode | Full Database |
|---------|-----------|---------------|
| Document Upload | ✅ | ✅ |
| File Storage | ✅ Local | ✅ Persistent |
| User Accounts | ❌ | ✅ |
| Document Sharing | ❌ | ✅ |
| Analytics | ❌ | ✅ |
| Access Control | ❌ | ✅ |
| Multi-user | ❌ | ✅ |

## 🎯 **Recommendation**

1. **Start with demo mode** - Upload documents immediately
2. **Set up database** - Get full functionality in 5 minutes
3. **Test thoroughly** - Verify all features work

Your application is now functional! The demo mode allows you to test document uploads while you set up the database for full functionality.