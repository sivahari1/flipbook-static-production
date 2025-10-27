# 🚀 Supabase + Vercel Deployment Guide

## Step 1: Set up Supabase Database

### 1.1 Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Choose your organization
4. Enter project details:
   - **Name**: `flipbook-drm-production`
   - **Database Password**: Generate a strong password (save this!)
   - **Region**: Choose closest to your users
5. Click "Create new project"

### 1.2 Get Database Connection String
1. In your Supabase dashboard, go to **Settings** → **Database**
2. Scroll down to **Connection string**
3. Copy the **URI** format connection string
4. It looks like: `postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres`

## Step 2: Configure Vercel Environment Variables

### 2.1 Go to Vercel Dashboard
1. Visit [vercel.com/dashboard](https://vercel.com/dashboard)
2. Find your `flipbook-static-production` project
3. Click on it → Go to **Settings** → **Environment Variables**

### 2.2 Add Required Environment Variables

Add these environment variables in Vercel:

#### Database Configuration
```
DATABASE_URL = postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
```

#### NextAuth Configuration
```
NEXTAUTH_SECRET = your-random-32-character-secret-here
NEXTAUTH_URL = https://your-vercel-app-url.vercel.app
```

#### Application Configuration
```
NODE_ENV = production
NEXT_PUBLIC_APP_URL = https://your-vercel-app-url.vercel.app
```

#### Security
```
ENCRYPTION_KEY = your-32-character-encryption-key-here
```

### 2.3 Generate Secure Keys

For `NEXTAUTH_SECRET` and `ENCRYPTION_KEY`, use this command:
```bash
openssl rand -base64 32
```

Or use this online generator: [generate-secret.vercel.app](https://generate-secret.vercel.app/32)

## Step 3: Deploy Database Schema

### 3.1 Install Prisma CLI (if not installed)
```bash
npm install -g prisma
```

### 3.2 Set Environment Variable Locally
Create a `.env` file in your project root:
```
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"
```

### 3.3 Deploy Schema to Supabase
```bash
npx prisma db push
```

This will create all the tables in your Supabase database.

### 3.4 Generate Prisma Client
```bash
npx prisma generate
```

## Step 4: Redeploy Vercel Application

### 4.1 Trigger Redeploy
1. Go to your Vercel project dashboard
2. Go to **Deployments** tab
3. Click the **...** menu on the latest deployment
4. Click **Redeploy**

OR push a small change to trigger auto-deploy:

```bash
git commit --allow-empty -m "Trigger redeploy with Supabase config"
git push
```

## Step 5: Verify Database Connection

### 5.1 Check Database Status
Visit your deployed app at: `https://your-app.vercel.app/api/health`

This should return database connection status.

### 5.2 Test Upload Functionality
1. Go to your app: `https://your-app.vercel.app`
2. Sign up for an account
3. Try uploading a PDF at `/upload`
4. Check if it saves to database

## Step 6: Optional - Set up Row Level Security (RLS)

### 6.1 Enable RLS in Supabase
1. Go to **Authentication** → **Policies**
2. Enable RLS for sensitive tables
3. Create policies for user data access

### 6.2 Example RLS Policy for Documents
```sql
-- Users can only see their own documents
CREATE POLICY "Users can view own documents" ON documents
FOR SELECT USING (auth.uid()::text = owner_id);

-- Users can only insert their own documents  
CREATE POLICY "Users can insert own documents" ON documents
FOR INSERT WITH CHECK (auth.uid()::text = owner_id);
```

## Step 7: Monitor and Debug

### 7.1 Check Vercel Logs
- Go to Vercel Dashboard → Your Project → Functions
- Check for any database connection errors

### 7.2 Check Supabase Logs
- Go to Supabase Dashboard → Logs
- Monitor database queries and errors

### 7.3 Test Key Features
- ✅ User registration/login
- ✅ PDF upload and storage
- ✅ Document viewing
- ✅ Sharing functionality
- ✅ Analytics tracking

## Troubleshooting

### Database Connection Issues
- Verify DATABASE_URL is correct
- Check Supabase project is not paused
- Ensure password is URL-encoded if it contains special characters

### Authentication Issues
- Verify NEXTAUTH_SECRET is set
- Check NEXTAUTH_URL matches your domain
- Ensure all auth environment variables are set

### Upload Issues
- Check file storage configuration
- Verify database tables exist
- Test with smaller PDF files first

## Success Indicators

When everything is working correctly:
- ✅ App loads without errors
- ✅ Users can register and sign in
- ✅ PDF uploads save to database
- ✅ Documents appear in dashboard
- ✅ Sharing links work
- ✅ Analytics are tracked

Your application will now be fully functional with persistent data storage!