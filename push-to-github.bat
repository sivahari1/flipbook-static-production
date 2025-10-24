@echo off
echo 🚀 Pushing FlipBook DRM to GitHub...
echo.

REM Check if Git is installed
git --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Git is not installed or not in PATH
    echo Please install Git from: https://git-scm.com/download/win
    echo Then run this script again.
    pause
    exit /b 1
)

echo ✅ Git is available
echo.

REM Initialize repository if needed
if not exist ".git" (
    echo 📁 Initializing Git repository...
    git init
    echo ✅ Repository initialized
) else (
    echo ✅ Git repository already exists
)

REM Add remote if not exists
git remote get-url origin >nul 2>&1
if errorlevel 1 (
    echo 🔗 Adding remote repository...
    git remote add origin https://github.com/sivahari1/FlipBook-DRM.git
    echo ✅ Remote repository added
) else (
    echo ✅ Remote repository already configured
)

REM Configure Git user if needed
git config user.name >nul 2>&1
if errorlevel 1 (
    echo 👤 Please configure Git user:
    set /p username="Enter your name: "
    set /p email="Enter your email: "
    git config user.name "%username%"
    git config user.email "%email%"
    echo ✅ Git user configured
)

echo.
echo 📦 Adding files to Git...
git add .

echo.
echo 💬 Creating commit...
git commit -m "Production ready - FlipBook DRM v1.0

✨ Features:
- Complete document protection platform
- AWS Cognito authentication with 15-minute idle timeout
- Razorpay payment integration with multiple plans
- Modern animated UI with accessibility support
- Plan-specific subscription flow
- Document upload, sharing, and DRM protection
- Mobile-responsive design

🔧 Technical Stack:
- Next.js 15 with App Router
- TypeScript, Tailwind CSS, Framer Motion
- Prisma ORM with PostgreSQL
- AWS Amplify deployment ready

🚀 Ready for production deployment!"

echo.
echo 🌿 Setting main branch...
git branch -M main

echo.
echo 🚀 Pushing to GitHub...
echo ⚠️  You may be prompted for GitHub credentials
echo 💡 Use Personal Access Token as password if you have 2FA enabled
git push -u origin main

if errorlevel 1 (
    echo.
    echo ❌ Push failed. Common solutions:
    echo 1. Check your GitHub credentials
    echo 2. Use Personal Access Token instead of password
    echo 3. Verify repository permissions
    echo 4. Check internet connection
    echo.
    echo 📖 See GITHUB_PUSH_GUIDE.md for detailed troubleshooting
    pause
    exit /b 1
)

echo.
echo 🎉 SUCCESS! FlipBook DRM has been pushed to GitHub!
echo.
echo 🔗 Repository URL: https://github.com/sivahari1/FlipBook-DRM
echo.
echo 📋 Next Steps:
echo 1. Visit your GitHub repository to verify the code
echo 2. Follow DEPLOY_TO_AWS_AMPLIFY.md to deploy to AWS Amplify
echo 3. Configure production environment variables
echo 4. Go live with your document protection platform!
echo.
pause