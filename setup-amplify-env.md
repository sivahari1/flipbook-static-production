# AWS Amplify Environment Setup

## 🔧 **Copy-Paste Environment Variables**

Go to **AWS Amplify Console → Your App → Environment Variables** and add these:

### **Minimal Setup (Demo Mode)**
```
NEXTAUTH_SECRET=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6
NEXTAUTH_URL=https://main.d39m2583vv0xam.amplifyapp.com
NEXT_PUBLIC_APP_URL=https://main.d39m2583vv0xam.amplifyapp.com
NODE_ENV=production
```

### **Full Setup (With Database)**
```
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@YOUR_HOST:5432/postgres
NEXTAUTH_SECRET=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6
NEXTAUTH_URL=https://main.d39m2583vv0xam.amplifyapp.com
NEXT_PUBLIC_APP_URL=https://main.d39m2583vv0xam.amplifyapp.com
NODE_ENV=production
```

## 📝 **Step-by-Step Instructions**

1. **Open AWS Amplify Console**
   - Go to: https://console.aws.amazon.com/amplify/
   - Select your FlipBook DRM app

2. **Navigate to Environment Variables**
   - Click "Environment variables" in the left sidebar
   - Click "Manage variables"

3. **Add Variables**
   - Click "Add variable" for each one
   - Copy the key-value pairs from above
   - Click "Save"

4. **Redeploy**
   - Go to "App settings" → "Build settings"
   - Click "Redeploy this version"

## 🎯 **Quick Database Options**

### **Supabase (Free)**
1. Go to [supabase.com](https://supabase.com)
2. Create project with password: `FlipBook123!`
3. Get connection string from Settings → Database
4. Replace `YOUR_PASSWORD` and `YOUR_HOST` in DATABASE_URL above

### **Railway (Free)**
1. Go to [railway.app](https://railway.app)
2. Create PostgreSQL database
3. Copy DATABASE_URL from Variables tab
4. Use as DATABASE_URL above

## ✅ **Verification**

After setup, test these URLs:

**Environment Check:**
```
https://main.d39m2583vv0xam.amplifyapp.com/api/debug/env
```

**Database Check (if configured):**
```
https://main.d39m2583vv0xam.amplifyapp.com/api/debug/db
```

**Upload Test:**
- Go to your app → Upload page
- Try uploading a PDF
- Should work in demo mode immediately
- Full features available after database setup

## 🚀 **Expected Results**

- **Without DATABASE_URL**: Demo mode works, uploads saved locally
- **With DATABASE_URL**: Full functionality, user accounts, sharing, analytics

Your app will work immediately with the minimal setup!