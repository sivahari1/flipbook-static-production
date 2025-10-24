# FlipBook DRM - GitHub Push Script
Write-Host "🚀 Pushing FlipBook DRM to GitHub..." -ForegroundColor Green

# Check if Git is installed
try {
    $gitVersion = git --version
    Write-Host "✅ Git is available: $gitVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Git not found. Install from: https://git-scm.com/download/win" -ForegroundColor Red
    exit 1
}

# Initialize repository if needed
if (-not (Test-Path ".git")) {
    Write-Host "📁 Initializing Git repository..." -ForegroundColor Yellow
    git init
}

# Add remote repository
try {
    git remote add origin https://github.com/sivahari1/FlipBook-DRM.git
} catch {
    Write-Host "Remote already exists" -ForegroundColor Yellow
}

# Configure Git user if needed
try {
    $userName = git config user.name
    if (-not $userName) {
        $username = Read-Host "Enter your name"
        $email = Read-Host "Enter your email"
        git config user.name "$username"
        git config user.email "$email"
    }
} catch {
    Write-Host "Git user configuration skipped" -ForegroundColor Yellow
}

# Add, commit, and push
Write-Host "📦 Adding files..." -ForegroundColor Yellow
git add .

Write-Host "💬 Creating commit..." -ForegroundColor Yellow
git commit -m "Production ready - FlipBook DRM v1.0"

Write-Host "🌿 Setting main branch..." -ForegroundColor Yellow
git branch -M main

Write-Host "🚀 Pushing to GitHub..." -ForegroundColor Yellow
git push -u origin main

Write-Host "🎉 SUCCESS! Check: https://github.com/sivahari1/FlipBook-DRM" -ForegroundColor Green