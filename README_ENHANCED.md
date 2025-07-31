# 🏥 EMRChains - Blockchain-Powered Healthcare Security System

A modern, secure healthcare management system with advanced cybersecurity features and blockchain integration. This system converts the Python wallet hardening toolkit into a professional React frontend for healthcare applications.

## 🚀 Features

### 🔐 Advanced Security Features
- **File Encryption/Decryption**: Military-grade AES encryption for patient records
- **Clipboard Security Monitoring**: Real-time detection of sensitive data copying
- **Biometric Authentication**: Fingerprint, Face ID, and Touch ID support
- **Two-Factor Authentication**: Email, SMS, and authenticator app support
- **Session Management**: Auto-logout and session extension for compliance
- **Security Event Logging**: Comprehensive audit trails for HIPAA compliance

### ⛓️ Blockchain Integration
- **Multi-Wallet Support**: MetaMask, WalletConnect, Coinbase Wallet
- **Transaction History**: On-chain verification of medical records
- **Smart Contract Interaction**: Store records, mint health NFTs, manage consent
- **Network Switching**: Support for Ethereum, Polygon, and testnets
- **QR Code Verification**: Instant wallet verification and record sharing

### 🛡️ Healthcare Compliance
- **HIPAA Compliant**: Meets healthcare data protection standards
- **End-to-End Encryption**: All data encrypted in transit and at rest
- **Access Control**: Role-based permissions for patients, doctors, admins
- **Audit Logging**: Complete activity tracking for compliance reporting
- **Data Integrity**: Blockchain verification ensures tamper-proof records

## 🛠️ Installation & Setup

### Prerequisites
- Node.js 16+ and npm/yarn
- Modern web browser with crypto wallet support
- Git for version control

### Quick Start

1. **Clone and Install**
   ```bash
   git clone <repository-url>
   cd healthcare-system
   npm install
   ```

2. **Install Additional Dependencies**
   ```bash
   npm install tailwindcss @types/crypto-js qrcode.js
   ```

3. **Setup Tailwind CSS**
   ```bash
   npx tailwindcss init -p
   ```

4. **Start Development Server**
   ```bash
   npm start
   ```

5. **Open Application**
   - Navigate to `http://localhost:3000`
   - Follow the authentication flow (Biometric → 2FA)

## 🎯 Usage Guide

### Authentication Flow
1. **Biometric Login**: Use fingerprint/face recognition (simulated)
2. **Two-Factor Authentication**: Enter 6-digit code (try "123456" for demo)
3. **Dashboard Access**: Access all security and blockchain features

### Security Dashboard
- **Real-time Monitoring**: Session time, security alerts, encryption status
- **Clipboard Monitor**: Toggle on/off, detects crypto addresses and sensitive data
- **Security Events**: View all security incidents with severity levels
- **Statistics**: Overview of system security metrics

### File Encryption
- **Encrypt Files**: Upload any file, set password, download encrypted version
- **Decrypt Files**: Upload .encrypted files, enter password, recover original
- **Password Generator**: Create secure passwords with copy functionality
- **Job History**: Track all encryption/decryption operations

### Blockchain Features
- **Connect Wallet**: MetaMask, WalletConnect, or Coinbase integration
- **View Transactions**: See blockchain history of medical records
- **Network Support**: Switch between Ethereum, Polygon, testnets
- **Smart Actions**: Store records, mint NFTs, grant access, sign consent

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the root directory:

```env
REACT_APP_BLOCKCHAIN_NETWORK=ethereum
REACT_APP_IPFS_GATEWAY=https://gateway.pinata.cloud
REACT_APP_API_BASE_URL=http://localhost:3001
REACT_APP_ENCRYPTION_STRENGTH=256
```

### Tailwind Configuration
Update `tailwind.config.js`:

```javascript
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#3B82F6',
        secondary: '#64748B',
        success: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444',
      }
    },
  },
  plugins: [],
}
```

## 🏗️ Architecture

### Component Structure
```
src/
├── components/
│   ├── Auth/
│   │   ├── EnhancedBiometricLogin.tsx
│   │   ├── Enhanced2FA.tsx
│   │   └── ...
│   ├── Security/
│   │   ├── SecurityDashboard.tsx
│   │   ├── FileEncryptor.tsx
│   │   └── ...
│   ├── Blockchain/
│   │   ├── EnhancedWalletConnect.tsx
│   │   └── ...
│   └── Dashboard/
│       └── HealthcareSecurityDashboard.tsx
├── services/
│   ├── encryptionService.ts
│   ├── clipboardMonitorService.ts
│   └── blockchain.ts
└── types/
    └── index.ts
```

### Key Services

#### Encryption Service
- **PBKDF2 Key Derivation**: 100,000 iterations for security
- **AES Encryption**: Industry-standard symmetric encryption
- **File Handling**: Browser-based file encryption/decryption
- **Password Generation**: Cryptographically secure random passwords

#### Clipboard Monitor Service
- **Pattern Detection**: Ethereum addresses, Bitcoin addresses, private keys
- **Security Alerts**: Real-time notifications for suspicious activity
- **Browser Integration**: Uses Clipboard API with permission handling
- **Audio Alerts**: Sound notifications for critical events

#### Blockchain Service
- **Multi-Provider**: Support for multiple wallet providers
- **Transaction Tracking**: Monitor on-chain activity
- **Smart Contract**: Interaction with healthcare contracts
- **Network Management**: Chain switching and configuration

## 🎨 UI/UX Features

### Security-First Design
- **Visual Security Indicators**: Green checkmarks, security badges, encryption icons
- **Real-time Status**: Live session timers, connection status, alert counters
- **Progressive Authentication**: Step-by-step security verification
- **Accessibility**: Screen reader support, keyboard navigation

### Blockchain UX
- **Wallet Integration**: Seamless connection and switching
- **Transaction Visualization**: Clear history with gas fees and confirmations
- **QR Code Support**: Easy verification and sharing
- **Network Indicators**: Visual chain identification

### Healthcare Theming
- **Medical Icons**: Healthcare-specific emoji and icons
- **Professional Colors**: Blue/green medical color scheme
- **Compliance Badges**: HIPAA, encryption, verification indicators
- **Clean Layout**: Minimal, professional healthcare interface

## 🔒 Security Features Detail

### File Encryption
- **Algorithm**: AES-256 with PBKDF2 key derivation
- **Salt**: Random 16-byte salt for each encryption
- **Iterations**: 100,000 PBKDF2 iterations
- **Browser-based**: No server upload required for privacy

### Clipboard Security
- **Monitoring**: Real-time clipboard content analysis
- **Pattern Recognition**: Crypto addresses, private keys, seed phrases
- **Alert System**: Audio and visual warnings for hijacking attempts
- **Permission-based**: Respects browser clipboard permissions

### Authentication
- **Biometric**: WebAuthn API for fingerprint/face recognition
- **2FA**: Time-based codes with 5-minute expiry
- **Session Management**: Auto-logout after inactivity
- **Attempt Limiting**: Maximum 3 verification attempts

## 🧪 Testing & Demo

### Demo Credentials
- **2FA Code**: Use "123456" for quick demo access
- **Test Wallet**: Connect any testnet wallet for blockchain features
- **Sample Files**: Encrypt any text file to test encryption

### Test Scenarios
1. **Security Alert**: Copy a crypto address to trigger clipboard monitoring
2. **File Encryption**: Upload a text file, encrypt, then decrypt
3. **Wallet Connection**: Connect MetaMask and view transaction history
4. **Session Timeout**: Wait for session warning and extension

## 📱 Browser Compatibility

### Supported Browsers
- **Chrome 90+**: Full feature support including WebAuthn
- **Firefox 88+**: Core features, limited biometric support
- **Safari 14+**: iOS biometric integration
- **Edge 90+**: Full compatibility

### Required Permissions
- **Clipboard Access**: For security monitoring (optional)
- **Notifications**: For security alerts (optional)
- **Camera/Microphone**: For biometric authentication (optional)

## 🚀 Deployment

### Production Build
```bash
npm run build
```

### Environment Setup
- Configure HTTPS for WebAuthn support
- Set up proper CSP headers for security
- Configure wallet provider endpoints
- Set up IPFS gateway for file storage

### Security Considerations
- Use HTTPS in production for WebAuthn
- Implement proper CORS policies
- Set up rate limiting for API calls
- Monitor security events in production

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- 📧 Email: support@emrchains.health
- 📚 Documentation: [docs.emrchains.health](https://docs.emrchains.health)
- 🐛 Issues: [GitHub Issues](https://github.com/emrchains/healthcare-system/issues)

## 🏆 Acknowledgments

- **Original Python Toolkit**: Converted from desktop GUI to modern web app
- **React Community**: For excellent ecosystem and components
- **Crypto Libraries**: crypto-js for encryption, ethers.js for blockchain
- **Design System**: Tailwind CSS for professional healthcare UI

---

**🔐 EMRChains - Securing Healthcare Data with Blockchain Technology**
