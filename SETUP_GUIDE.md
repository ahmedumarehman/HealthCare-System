# 🚀 How to Run EMRChains Healthcare Security System

## 📋 Prerequisites

Before you start, make sure you have the following installed:

- **Node.js** (version 16 or higher) - [Download here](https://nodejs.org/)
- **npm** or **yarn** package manager
- **Git** for version control
- A modern web browser (Chrome, Firefox, Safari, Edge)
- **MetaMask** browser extension (optional, for blockchain features)

## 🛠️ Installation Steps

### Step 1: Install Dependencies

Open your terminal/command prompt in the project directory and run:

```bash
# Install all dependencies
npm install

# If you encounter any issues, try clearing cache first:
npm cache clean --force
npm install
```

### Step 2: Install Additional Required Packages

```bash
# Install missing Tailwind CSS and form plugins
npm install @tailwindcss/forms @tailwindcss/typography

# Install crypto and blockchain dependencies  
npm install @types/crypto-js crypto-js ethers

# Install UI and utility packages
npm install react-qr-code qrcode.js date-fns
```

### Step 3: Initialize Tailwind CSS (if not already done)

```bash
# Initialize Tailwind CSS configuration
npx tailwindcss init -p
```

### Step 4: Set up Environment Variables (Optional)

Create a `.env` file in the root directory:

```env
# Blockchain Configuration
REACT_APP_BLOCKCHAIN_NETWORK=ethereum
REACT_APP_IPFS_GATEWAY=https://gateway.pinata.cloud

# API Configuration  
REACT_APP_API_BASE_URL=http://localhost:3001

# Security Configuration
REACT_APP_ENCRYPTION_STRENGTH=256
REACT_APP_SESSION_TIMEOUT=1800

# Demo Mode
REACT_APP_DEMO_MODE=true
```

## 🚀 Running the Application

### Development Mode

```bash
# Start the development server
npm start
```

The application will open automatically in your browser at `http://localhost:3000`

### Production Build

```bash
# Create optimized production build
npm run build

# Serve the production build (optional)
npx serve -s build
```

## 🔐 Using the Healthcare Security System

### Authentication Flow

1. **Application Launch**: The app starts with a beautiful authentication screen
2. **Step 1 - Biometric Login**: 
   - Click on any biometric method (Fingerprint, Face ID, Touch ID)
   - Wait for the 2-second simulation
   - Success rate is 80% for demo purposes
3. **Step 2 - Two-Factor Authentication**:
   - Enter the 6-digit code: **123456** (for demo)
   - Or wait for the auto-submit when all digits are filled
4. **Dashboard Access**: You'll be redirected to the main security dashboard

### 🛡️ Security Features

#### Security Dashboard
- **Real-time monitoring**: Session timer, security alerts, encrypted files count
- **Clipboard monitoring**: Toggle on/off to detect crypto addresses and sensitive data  
- **Security events**: View all security incidents with severity levels

#### File Encryption
- **Encrypt files**: Upload any file, set a password, download encrypted version
- **Decrypt files**: Upload .encrypted files, enter password, recover original
- **Password generator**: Create secure passwords with copy to clipboard

#### Blockchain Features
- **Connect Wallet**: Click "Connect Wallet" and choose MetaMask (if installed)
- **View Transactions**: See simulated blockchain history
- **Network Switching**: Switch between Ethereum, Polygon, testnets

### 🧪 Demo Features & Test Data

#### Authentication
- **Biometric**: Any method works (80% success rate for realism)
- **2FA Code**: Use `123456` for instant access
- **Session**: Auto-logout after 30 minutes with 2-minute warning

#### File Encryption
- **Test files**: Upload any text file (.txt, .json, .csv)
- **Passwords**: Generated passwords are cryptographically secure
- **Demo tip**: Try encrypting a simple text file first

#### Clipboard Monitoring
- **Test addresses**: Copy any Ethereum address (starts with 0x...)
- **Security alerts**: Copy different addresses to trigger hijack detection
- **Audio alerts**: Enable browser sound to hear security notifications

#### Blockchain Integration
- **MetaMask**: Connect if you have it installed
- **Demo data**: Pre-populated transaction history
- **QR Codes**: Generate verification QR codes

## 🎨 UI/UX Features

### Healthcare Theme
- **Medical icons**: Healthcare-specific emojis and symbols
- **Professional colors**: Blue/green medical color scheme  
- **HIPAA badges**: Compliance and security indicators throughout
- **Responsive design**: Works on desktop, tablet, and mobile

### Security Indicators
- **Real-time status**: Live session timers, connection status
- **Visual feedback**: Green checkmarks, security badges, encryption icons
- **Progressive authentication**: Step-by-step security verification
- **Alert system**: Visual and audio notifications for security events

## 🔧 Troubleshooting

### Common Issues & Solutions

#### 1. Tailwind CSS not working
```bash
# Reinstall Tailwind and its dependencies
npm uninstall tailwindcss @tailwindcss/forms @tailwindcss/typography
npm install tailwindcss @tailwindcss/forms @tailwindcss/typography
npx tailwindcss init -p
```

#### 2. Crypto-js errors
```bash
# Install correct crypto-js types
npm install --save-dev @types/crypto-js
```

#### 3. Component import errors
```bash
# Clear node modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### 4. Port already in use
```bash
# Run on different port
PORT=3001 npm start
```

### Browser Issues

#### Clipboard API not working
- **Chrome/Edge**: Should work by default
- **Firefox**: May require manual permission
- **Safari**: Limited support, some features may not work

#### Biometric Authentication
- **Note**: Uses simulated authentication for demo
- **Real implementation**: Would require WebAuthn API setup

#### MetaMask Integration
- **Install**: Download from [metamask.io](https://metamask.io/)
- **Network**: Switch to Ethereum mainnet or testnet
- **Demo**: Works with or without MetaMask installed

## 📱 Browser Compatibility

### Fully Supported
- **Chrome 90+**: All features including WebAuthn simulation
- **Edge 90+**: Full compatibility
- **Safari 14+**: Most features (limited clipboard access)

### Partially Supported  
- **Firefox 88+**: Core features, limited biometric simulation
- **Mobile browsers**: Responsive design, may have limited crypto features

## 🌐 Production Deployment

### Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Netlify
```bash
# Build the project
npm run build

# Deploy build folder to Netlify
```

### Traditional Hosting
```bash
# Build the project
npm run build

# Upload 'build' folder to your web server
```

## 🔒 Security Considerations

### Development
- All encryption happens client-side
- No sensitive data sent to servers
- Demo credentials are hardcoded for testing only

### Production Checklist
- [ ] Replace demo credentials with real authentication
- [ ] Implement proper backend API integration
- [ ] Set up real blockchain network connections
- [ ] Configure proper HTTPS and CSP headers
- [ ] Implement real audit logging
- [ ] Set up monitoring and alerting

## 📞 Support

If you encounter any issues:

1. **Check the browser console** for error messages
2. **Verify all dependencies** are installed correctly
3. **Try clearing browser cache** and restarting
4. **Test in incognito/private mode** to rule out extensions

### Demo Credentials Reference
- **2FA Code**: `123456`
- **Any email/password**: Works for demo login
- **Biometric**: All methods work (simulated)
- **Wallet**: MetaMask connection optional

---

**🎉 You're ready to experience the future of healthcare security with blockchain technology!**

The application showcases advanced cybersecurity features, blockchain integration, and professional healthcare UI - all converted from the original Python toolkit into a modern, production-ready React application.
