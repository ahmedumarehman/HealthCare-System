import React, { useState } from 'react';
import Badge from '../UI/Badge';
import { WalletInfo, Transaction } from '../../types';

interface WalletConnectProps {
  onConnect: (wallet: WalletInfo) => void;
  onDisconnect: () => void;
  connectedWallet?: WalletInfo;
}

const WalletConnect: React.FC<WalletConnectProps> = ({
  onConnect,
  onDisconnect,
  connectedWallet
}) => {
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      // Simulate wallet connection
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockWallet: WalletInfo = {
        address: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
        chainId: 1,
        isConnected: true,
        balance: '2.5',
        network: 'Ethereum Mainnet'
      };
      
      onConnect(mockWallet);
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  if (connectedWallet?.isConnected) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Connected Wallet</h3>
          <Badge variant="success" size="sm">🔗 Connected</Badge>
        </div>

        <div className="space-y-4">
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-8 w-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-3">
                <h4 className="text-sm font-medium text-green-800">
                  Wallet Successfully Connected
                </h4>
                <p className="text-sm text-green-700">
                  Your wallet is now linked to your healthcare records
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Address</label>
              <p className="text-sm font-mono text-gray-900">
                {connectedWallet.address.substring(0, 10)}...{connectedWallet.address.substring(38)}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Network</label>
              <p className="text-sm text-gray-900">{connectedWallet.network}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Balance</label>
              <p className="text-sm text-gray-900">{connectedWallet.balance} ETH</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Chain ID</label>
              <p className="text-sm text-gray-900">{connectedWallet.chainId}</p>
            </div>
          </div>

          <div className="flex space-x-3">
            <button className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500">
              View Transactions
            </button>
            <button className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500">
              Mint Health NFT
            </button>
            <button
              onClick={onDisconnect}
              className="px-4 py-2 border border-red-300 rounded-md text-red-700 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              Disconnect
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="text-center">
        <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-gradient-to-r from-blue-100 to-purple-100 mb-4">
          <svg className="h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Connect Your Wallet
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Link your crypto wallet to enable blockchain features for your healthcare records
        </p>

        <div className="mb-6 flex justify-center space-x-2">
          <Badge variant="primary" size="sm">🔒 Secure Connection</Badge>
          <Badge variant="success" size="sm">🧱 Blockchain Powered</Badge>
        </div>

        <button
          onClick={handleConnect}
          disabled={isConnecting}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-6 rounded-lg hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isConnecting ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Connecting to MetaMask...
            </div>
          ) : (
            <div className="flex items-center justify-center">
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.46 12.65l-9.89-5.71a.75.75 0 00-.75 0L2.54 12.65a.75.75 0 000 1.3l9.89 5.71a.75.75 0 00.75 0l9.89-5.71a.75.75 0 000-1.3z" />
              </svg>
              Connect Wallet
            </div>
          )}
        </button>

        <div className="mt-6 bg-blue-50 p-4 rounded-lg">
          <h4 className="font-medium text-blue-800 mb-2">🧱 Blockchain Benefits</h4>
          <div className="text-sm text-blue-700 space-y-1">
            <div>✅ Immutable medical record storage</div>
            <div>✅ Secure, decentralized data access</div>
            <div>✅ Patient-controlled data ownership</div>
            <div>✅ Transparent audit trails</div>
          </div>
        </div>

        <div className="mt-4 bg-yellow-50 p-4 rounded-lg">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Privacy Notice
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                We never store your private keys. All wallet interactions are secured through MetaMask.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WalletConnect;
