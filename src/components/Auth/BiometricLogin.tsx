import React, { useState } from 'react';
import Modal from '../UI/Modal';
import Badge from '../UI/Badge';

interface BiometricLoginProps {
  isOpen: boolean;
  onClose: () => void;
  onConnect: (walletType: string) => void;
  isConnecting?: boolean;
}

const BiometricLogin: React.FC<BiometricLoginProps> = ({
  isOpen,
  onClose,
  onConnect,
  isConnecting = false
}) => {
  const [selectedWallet, setSelectedWallet] = useState<string>('');

  const walletOptions = [
    {
      id: 'metamask',
      name: 'MetaMask',
      description: 'Connect using MetaMask wallet',
      icon: '🦊',
      available: typeof window !== 'undefined' && window.ethereum
    },
    {
      id: 'walletconnect',
      name: 'WalletConnect',
      description: 'Scan QR code with your mobile wallet',
      icon: '📱',
      available: true
    },
    {
      id: 'biometric',
      name: 'Biometric Login',
      description: 'Use fingerprint or face recognition',
      icon: '👆',
      available: 'credentials' in navigator
    },
    {
      id: 'hardware',
      name: 'Hardware Wallet',
      description: 'Connect Ledger or Trezor device',
      icon: '🔐',
      available: true
    }
  ];

  const handleConnect = (walletId: string) => {
    setSelectedWallet(walletId);
    onConnect(walletId);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="🔐 Secure Login Options" size="lg">
      <div className="space-y-6">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-gradient-to-r from-blue-100 to-purple-100 mb-4">
            <svg className="h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.031 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Choose Your Secure Login Method
          </h3>
          <p className="text-sm text-gray-600">
            Connect your wallet or use biometric authentication for maximum security
          </p>
          <div className="mt-2 flex justify-center space-x-2">
            <Badge variant="success" size="sm">🔒 Zero-Knowledge Proof</Badge>
            <Badge variant="primary" size="sm">🛡️ End-to-End Encrypted</Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {walletOptions.map((wallet) => (
            <div
              key={wallet.id}
              className={`relative p-4 border-2 rounded-lg cursor-pointer transition-all hover:shadow-md ${
                wallet.available
                  ? selectedWallet === wallet.id
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-gray-200 hover:border-gray-300'
                  : 'border-gray-100 bg-gray-50 cursor-not-allowed'
              }`}
              onClick={() => wallet.available && handleConnect(wallet.id)}
            >
              {!wallet.available && (
                <div className="absolute top-2 right-2">
                  <Badge variant="secondary" size="sm">Not Available</Badge>
                </div>
              )}

              <div className="flex items-start space-x-3">
                <div className="text-3xl">{wallet.icon}</div>
                <div className="flex-1">
                  <h4 className={`font-medium ${wallet.available ? 'text-gray-900' : 'text-gray-500'}`}>
                    {wallet.name}
                  </h4>
                  <p className={`text-sm ${wallet.available ? 'text-gray-600' : 'text-gray-400'}`}>
                    {wallet.description}
                  </p>

                  {wallet.id === 'metamask' && wallet.available && (
                    <div className="mt-2">
                      <Badge variant="success" size="sm">Detected</Badge>
                    </div>
                  )}

                  {wallet.id === 'biometric' && wallet.available && (
                    <div className="mt-2">
                      <Badge variant="primary" size="sm">Supported</Badge>
                    </div>
                  )}

                  {isConnecting && selectedWallet === wallet.id && (
                    <div className="mt-2 flex items-center text-sm text-indigo-600">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600 mr-2"></div>
                      Connecting...
                    </div>
                  )}
                </div>
              </div>

              {wallet.available && (
                <div className="mt-3 flex justify-end">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleConnect(wallet.id);
                    }}
                    disabled={isConnecting}
                    className="px-3 py-1 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
                  >
                    Connect
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="bg-yellow-50 p-4 rounded-lg">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Security Notice
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <ul className="list-disc list-inside space-y-1">
                  <li>Your wallet connection is encrypted and secure</li>
                  <li>We never store your private keys or seed phrases</li>
                  <li>All transactions require your explicit approval</li>
                  <li>Biometric data is processed locally on your device</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-medium text-blue-800 mb-2">🧱 Blockchain Benefits</h4>
          <div className="grid grid-cols-2 gap-4 text-sm text-blue-700">
            <div>
              <strong>Immutable Records:</strong> Your medical data cannot be tampered with
            </div>
            <div>
              <strong>Data Ownership:</strong> You control who accesses your information
            </div>
            <div>
              <strong>Global Access:</strong> Access your records from anywhere securely
            </div>
            <div>
              <strong>Privacy First:</strong> Zero-knowledge proofs protect your privacy
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default BiometricLogin;
