# 🏥 SecureHealth - Blockchain Healthcare System

A modern, secure healthcare management system built with React TypeScript, featuring blockchain integration, advanced cybersecurity measures, and comprehensive patient record management.

## 🌟 Features

### 🔐 Advanced Security Features

- **Two-Factor Authentication (2FA)** - OTP verification via email/SMS
- **Biometric Login Integration** - MetaMask wallet and fingerprint authentication  
- **Session Management** - Auto-logout and security timers
- **Access Control** - Role-based permissions and audit trails
- **End-to-End Encryption** - All medical records are encrypted
- **Real-time Security Monitoring** - Suspicious activity detection

### 🧱 Blockchain Integration

- **Wallet Connection** - MetaMask, WalletConnect support
- **On-Chain Verification** - Immutable medical record storage
- **Transaction History** - Complete blockchain activity tracking
- **Medical NFTs** - Health certificates and prescriptions as NFTs
- **Smart Contract Interaction** - Decentralized consent management
- **IPFS Storage** - Distributed file storage for medical documents

### 🏥 Healthcare-Specific Features

- **Patient Record Management** - Complete CRUD operations
- **Doctor-Patient Communication** - Secure messaging system
- **Prescription Tracking** - Blockchain-verified prescriptions
- **Audit Logs** - Comprehensive activity monitoring
- **QR Code Verification** - Quick record authentication
- **Decentralized Consent Forms** - Patient-controlled data access
- **PDF Export** - Download medical records as PDFs with large "CONFIDENTIAL" watermark
- **Encryption Support** - Password-protected PDF downloads
- **Cross-Dashboard Sync** - Records created in any dashboard are visible across all authorized dashboards
- **Shared State Management** - Real-time synchronization between Patient and Doctor dashboards

## 🚀 Getting Started

### Prerequisites

- Node.js 16+ 
- npm or yarn
- MetaMask browser extension (for blockchain features)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/securehealth-frontend.git
   cd securehealth-frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000`

## 🎯 Demo Credentials

For testing the application, use these demo credentials:

- **Email**: Any email address
- **Password**: Any password
- **2FA Code**: `123456`

## 🏗️ Project Structure

```
src/
├── components/
│   ├── Auth/                    # Authentication components
│   │   ├── LoginForm.tsx       # Main login interface
│   │   ├── TwoFactorAuth.tsx   # 2FA verification modal
│   │   └── BiometricLogin.tsx  # Wallet/biometric login
│   ├── Dashboard/              # Main application screens
│   │   ├── MainDashboard.tsx   # Primary dashboard
│   │   ├── PatientRecords.tsx  # Medical records management
│   │   └── SecurityMonitor.tsx # Security monitoring
│   ├── Blockchain/             # Blockchain integration
│   │   ├── WalletConnect.tsx   # Wallet connection interface
│   │   ├── TransactionHistory.tsx
│   │   └── BlockchainVerification.tsx
│   ├── Security/               # Security features
│   │   ├── AuditLogs.tsx      # Activity logging
│   │   ├── SessionManager.tsx  # Session management
│   │   └── AccessControl.tsx   # Permission management
│   └── UI/                     # Reusable UI components
│       ├── Badge.tsx          # Status badges
│       ├── Modal.tsx          # Modal dialogs
│       └── Timer.tsx          # Session timers
├── hooks/                      # Custom React hooks
│   ├── useWallet.ts           # Wallet management
│   ├── useAuth.ts             # Authentication logic
│   └── useSession.ts          # Session handling
├── services/                   # External services
│   ├── blockchain.ts          # Blockchain interactions
│   ├── encryption.ts          # Encryption utilities
│   └── api.ts                 # API communications
├── types/                      # TypeScript definitions
│   └── index.ts
├── App.tsx                     # Main application component
└── index.tsx                   # Application entry point
```

## 🔐 Security Features

### Authentication & Authorization
- Multi-factor authentication with OTP
- Biometric login support
- Role-based access control (Patient, Doctor, Admin)
- Session timeout protection
- Suspicious activity detection

### Data Protection
- AES-256 encryption for sensitive data
- Zero-knowledge proofs for privacy
- Blockchain-verified data integrity
- HIPAA-compliant data handling
- Secure API communications

### Blockchain Security
- Immutable record storage on blockchain
- Smart contract-based access control
- Decentralized identity verification
- Transparent audit trails
- Patient-controlled data ownership

## 🧱 Blockchain Features

### Supported Networks
- Ethereum Mainnet
- Polygon (MATIC)
- Binance Smart Chain
- Arbitrum
- Test networks (Goerli, Mumbai)

### Smart Contracts
- **Medical Records Contract** - Stores record hashes
- **Access Control Contract** - Manages permissions
- **NFT Certificate Contract** - Issues medical certificates
- **Consent Management Contract** - Handles data access consent

### Wallet Integration
- MetaMask
- WalletConnect
- Coinbase Wallet
- Trust Wallet
- Hardware wallets (Ledger, Trezor)

## 🏥 Healthcare Workflows

### Patient Journey
1. **Registration** - Create account with 2FA
2. **Identity Verification** - Blockchain-based verification
3. **Medical Records** - Upload and encrypt records
4. **Access Control** - Grant/revoke doctor permissions
5. **NFT Certificates** - Receive verifiable health certificates

### Doctor Workflow
1. **Professional Verification** - Credential verification on blockchain
2. **Patient Access** - Request and receive patient data access
3. **Record Creation** - Create and encrypt medical records
4. **Prescription Issuance** - Issue blockchain-verified prescriptions
5. **Audit Compliance** - Maintain complete activity logs

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the root directory:

```env
REACT_APP_BLOCKCHAIN_NETWORK=ethereum
REACT_APP_API_URL=https://api.securehealth.com
REACT_APP_IPFS_GATEWAY=https://ipfs.io/ipfs/
REACT_APP_ENCRYPTION_KEY=your-encryption-key
```

### Blockchain Configuration
Update `src/services/blockchain.ts` with your smart contract addresses:

```typescript
export const CONTRACTS = {
  MEDICAL_RECORDS: '0x...',
  ACCESS_CONTROL: '0x...',
  NFT_CERTIFICATES: '0x...',
  CONSENT_MANAGEMENT: '0x...'
};
```

## 🎨 UI/UX Features

### Design System
- **Modern Interface** - Clean, healthcare-focused design
- **Responsive Design** - Mobile and desktop optimized
- **Accessibility** - WCAG 2.1 AA compliant
- **Dark Mode** - Optional dark theme
- **Internationalization** - Multi-language support

### Security UX Elements
- **Security Badges** - Visual security status indicators
- **Session Timers** - Real-time session countdown
- **2FA Modals** - User-friendly authentication flows
- **Audit Trails** - Transparent activity logging
- **Encryption Indicators** - Clear data protection status

## 📊 Analytics & Monitoring

### Security Metrics
- Failed login attempts
- Session duration tracking
- Data access patterns
- Blockchain transaction monitoring
- Suspicious activity alerts

### Healthcare Metrics
- Record creation frequency
- Doctor-patient interactions
- Prescription issuance tracking
- Consent management analytics
- Patient engagement metrics

## 🚀 Deployment

### Production Build
```bash
npm run build
```

### Docker Deployment
```bash
docker build -t securehealth-frontend .
docker run -p 3000:3000 securehealth-frontend
```

### Cloud Deployment
- AWS S3 + CloudFront
- Vercel
- Netlify
- Azure Static Web Apps

## 🧪 Testing

### Running Tests
```bash
npm test
```

### Test Coverage
```bash
npm run test:coverage
```

### E2E Testing
```bash
npm run test:e2e
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📞 Support

For support and questions:
- 📧 Email: support@securehealth.com
- 💬 Discord: [SecureHealth Community](https://discord.gg/securehealth)
- 📖 Documentation: [docs.securehealth.com](https://docs.securehealth.com)

## 🙏 Acknowledgments

- React Team for the amazing framework
- MetaMask for wallet integration
- Ethereum Foundation for blockchain infrastructure
- Healthcare community for domain expertise
- Open source contributors

---

**SecureHealth** - Revolutionizing healthcare with blockchain technology and advanced security measures. 🏥🔐🧱
