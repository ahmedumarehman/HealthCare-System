# 🚀 SecureHealth Setup Script

Write-Host "🏥 Setting up SecureHealth - Blockchain Healthcare System..." -ForegroundColor Cyan
Write-Host ""

# Check if Node.js is installed
$nodeVersion = node --version 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Node.js is not installed. Please install Node.js 16+ from https://nodejs.org/" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Node.js version: $nodeVersion" -ForegroundColor Green

# Install dependencies
Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
npm install

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Dependencies installed successfully!" -ForegroundColor Green

# Create environment file
if (!(Test-Path ".env")) {
    Write-Host "🔧 Creating environment configuration..." -ForegroundColor Yellow
    
    $envContent = @"
# SecureHealth Environment Configuration
REACT_APP_BLOCKCHAIN_NETWORK=ethereum
REACT_APP_API_URL=https://api.securehealth.com
REACT_APP_IPFS_GATEWAY=https://ipfs.io/ipfs/
REACT_APP_ENCRYPTION_KEY=securehealth-demo-key-2025
GENERATE_SOURCEMAP=false
"@
    
    $envContent | Out-File -FilePath ".env" -Encoding UTF8
    Write-Host "✅ Environment file created!" -ForegroundColor Green
}

# Create gitignore if it doesn't exist
if (!(Test-Path ".gitignore")) {
    Write-Host "📝 Creating .gitignore..." -ForegroundColor Yellow
    
    $gitignoreContent = @"
# Dependencies
node_modules/
/.pnp
.pnp.js

# Testing
/coverage

# Production
/build

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Blockchain
.secret
*.key
"@
    
    $gitignoreContent | Out-File -FilePath ".gitignore" -Encoding UTF8
    Write-Host "✅ .gitignore created!" -ForegroundColor Green
}

Write-Host ""
Write-Host "🎉 Setup completed successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "🚀 To start the development server:" -ForegroundColor Cyan
Write-Host "   npm start" -ForegroundColor White
Write-Host ""
Write-Host "🔐 Demo Credentials:" -ForegroundColor Cyan
Write-Host "   Email: Any email address" -ForegroundColor White
Write-Host "   Password: Any password" -ForegroundColor White
Write-Host "   2FA Code: 123456" -ForegroundColor White
Write-Host ""
Write-Host "🌟 Features included:" -ForegroundColor Cyan
Write-Host "   ✅ Two-Factor Authentication" -ForegroundColor White
Write-Host "   ✅ MetaMask Wallet Integration" -ForegroundColor White
Write-Host "   ✅ Blockchain Record Storage" -ForegroundColor White
Write-Host "   ✅ Medical NFT Minting" -ForegroundColor White
Write-Host "   ✅ Real-time Security Monitoring" -ForegroundColor White
Write-Host "   ✅ Audit Logging" -ForegroundColor White
Write-Host "   ✅ Session Management" -ForegroundColor White
Write-Host "   ✅ End-to-End Encryption" -ForegroundColor White
Write-Host ""
Write-Host "📖 Read README.md for detailed documentation" -ForegroundColor Yellow
