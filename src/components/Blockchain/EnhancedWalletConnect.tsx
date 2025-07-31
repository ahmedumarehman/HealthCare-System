import React, { useState, useEffect } from 'react';
import { WalletConnection, Transaction } from '../../types';

interface EnhancedWalletConnectProps {
    className?: string;
}

const EnhancedWalletConnect: React.FC<EnhancedWalletConnectProps> = ({ className = '' }) => {
    const [walletConnection, setWalletConnection] = useState<WalletConnection | null>(null);
    const [isConnecting, setIsConnecting] = useState(false);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [showQR, setShowQR] = useState(false);

    // Simulate blockchain transactions for demo
    const mockTransactions: Transaction[] = [
        {
            id: '1',
            hash: '0xabc123...def456',
            type: 'record_upload',
            timestamp: new Date(Date.now() - 3600000).toISOString(),
            status: 'confirmed',
            gasUsed: '21000',
            gasPrice: '20',
            blockNumber: 18745623
        },
        {
            id: '2',
            hash: '0x789xyz...321abc',
            type: 'access_grant',
            timestamp: new Date(Date.now() - 7200000).toISOString(),
            status: 'confirmed',
            gasUsed: '45000',
            gasPrice: '22',
            blockNumber: 18745589
        },
        {
            id: '3',
            hash: '0xdef789...456ghi',
            type: 'prescription_mint',
            timestamp: new Date(Date.now() - 300000).toISOString(),
            status: 'pending',
            gasUsed: '65000',
            gasPrice: '25'
        }
    ];

    useEffect(() => {
        // Check if wallet is already connected
        checkExistingConnection();
        setTransactions(mockTransactions);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const checkExistingConnection = async () => {
        if (typeof window.ethereum !== 'undefined') {
            try {
                const accounts = await window.ethereum.request({ method: 'eth_accounts' });
                if (accounts.length > 0) {
                    const chainId = await window.ethereum.request({ method: 'eth_chainId' });
                    const balance = await window.ethereum.request({
                        method: 'eth_getBalance',
                        params: [accounts[0], 'latest']
                    });

                    setWalletConnection({
                        address: accounts[0],
                        provider: 'metamask',
                        chainId: parseInt(chainId, 16),
                        isConnected: true,
                        balance: (parseInt(balance, 16) / 1e18).toFixed(4)
                    });
                }
            } catch (error) {
                console.error('Error checking wallet connection:', error);
            }
        }
    };

    const connectMetaMask = async () => {
        if (typeof window.ethereum === 'undefined') {
            alert('MetaMask is not installed. Please install MetaMask to continue.');
            return;
        }

        setIsConnecting(true);
        try {
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            const chainId = await window.ethereum.request({ method: 'eth_chainId' });
            const balance = await window.ethereum.request({
                method: 'eth_getBalance',
                params: [accounts[0], 'latest']
            });

            setWalletConnection({
                address: accounts[0],
                provider: 'metamask',
                chainId: parseInt(chainId, 16),
                isConnected: true,
                balance: (parseInt(balance, 16) / 1e18).toFixed(4)
            });

        } catch (error) {
            console.error('Error connecting to MetaMask:', error);
            alert('Failed to connect to MetaMask');
        } finally {
            setIsConnecting(false);
        }
    };

    const connectWalletConnect = async () => {
        setIsConnecting(true);
        try {
            // Simulate WalletConnect connection process
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Mock successful connection
            setWalletConnection({
                address: '0x742d35Cc6551C0532a0fD0f7a7e2f1B987B5e9c4',
                provider: 'walletconnect',
                chainId: 1,
                isConnected: true,
                balance: '2.5431'
            });

            alert('✅ WalletConnect connected successfully!\n\nNote: This is a demo connection. In production, this would:\n• Generate a QR code for mobile wallets\n• Support 100+ mobile wallets\n• Enable cross-device signing');
        } catch (error) {
            alert('❌ WalletConnect connection failed');
        } finally {
            setIsConnecting(false);
        }
    };

    const connectCoinbase = async () => {
        setIsConnecting(true);
        try {
            // Simulate Coinbase Wallet connection
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Mock successful connection
            setWalletConnection({
                address: '0x8Ba1f109551bD432803012645Hac136c22ABB49d',
                provider: 'coinbase',
                chainId: 1,
                isConnected: true,
                balance: '1.8732'
            });

            alert('✅ Coinbase Wallet connected successfully!\n\nNote: This is a demo connection. In production, this would:\n• Use Coinbase Wallet SDK\n• Support direct exchange integration\n• Enable fiat on/off ramps');
        } catch (error) {
            alert('❌ Coinbase Wallet connection failed');
        } finally {
            setIsConnecting(false);
        }
    };

    const disconnectWallet = () => {
        setWalletConnection(null);
    };

    const switchNetwork = async (chainId: number) => {
        if (typeof window.ethereum !== 'undefined') {
            try {
                await window.ethereum.request({
                    method: 'wallet_switchEthereumChain',
                    params: [{ chainId: `0x${chainId.toString(16)}` }],
                });
            } catch (error) {
                console.error('Error switching network:', error);
            }
        }
    };

    const getNetworkName = (chainId: number): string => {
        switch (chainId) {
            case 1: return 'Ethereum Mainnet';
            case 5: return 'Goerli Testnet';
            case 137: return 'Polygon Mainnet';
            case 80001: return 'Mumbai Testnet';
            default: return `Chain ID: ${chainId}`;
        }
    };

    const getTransactionIcon = (type: Transaction['type']): string => {
        switch (type) {
            case 'record_upload': return '📄';
            case 'access_grant': return '🔐';
            case 'prescription_mint': return '💊';
            case 'consent_update': return '✍️';
            default: return '⚡';
        }
    };

    const getStatusColor = (status: Transaction['status']): string => {
        switch (status) {
            case 'confirmed': return 'text-green-600 bg-green-100';
            case 'pending': return 'text-yellow-600 bg-yellow-100';
            case 'failed': return 'text-red-600 bg-red-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };

    const shortenAddress = (address: string): string => {
        return `${address.slice(0, 6)}...${address.slice(-4)}`;
    };

    const copyToClipboard = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text);
            alert('Copied to clipboard!');
        } catch (error) {
            console.error('Failed to copy:', error);
        }
    };

    const handleBlockchainAction = (actionType: string) => {
        const actionMap: { [key: string]: () => void } = {
            'store-record': () => {
                if (window.confirm('📄 Store Medical Record on Blockchain\n\nThis will:\n• Encrypt your medical record\n• Store hash on blockchain\n• Generate immutable proof\n• Cost: ~0.002 ETH gas fees\n\nProceed?')) {
                    const newTx: Transaction = {
                        id: String(transactions.length + 1),
                        hash: `0x${Math.random().toString(16).substr(2, 40)}`,
                        type: 'record_upload',
                        timestamp: new Date().toISOString(),
                        status: 'pending',
                        gasUsed: '52000',
                        gasPrice: '23'
                    };
                    setTransactions([newTx, ...transactions]);

                    setTimeout(() => {
                        setTransactions(prev => prev.map(tx =>
                            tx.id === newTx.id
                                ? { ...tx, status: 'confirmed' as Transaction['status'], blockNumber: 18745724 }
                                : tx
                        ));
                    }, 3000);
                }
            },
            'mint-nft': () => {
                if (window.confirm('🎖️ Mint Health Achievement NFT\n\nThis will:\n• Create unique health certificate\n• Mint as NFT on blockchain\n• Enable sharing/verification\n• Cost: ~0.003 ETH gas fees\n\nProceed?')) {
                    const newTx: Transaction = {
                        id: String(transactions.length + 1),
                        hash: `0x${Math.random().toString(16).substr(2, 40)}`,
                        type: 'prescription_mint',
                        timestamp: new Date().toISOString(),
                        status: 'pending',
                        gasUsed: '85000',
                        gasPrice: '25'
                    };
                    setTransactions([newTx, ...transactions]);

                    setTimeout(() => {
                        setTransactions(prev => prev.map(tx =>
                            tx.id === newTx.id
                                ? { ...tx, status: 'confirmed' as Transaction['status'], blockNumber: 18745725 }
                                : tx
                        ));
                    }, 4000);
                }
            },
            'sign-consent': () => {
                if (window.confirm('✍️ Sign Digital Consent Form\n\nThis will:\n• Create digital signature\n• Store consent on chain\n• Enable audit trail\n• Cost: ~0.001 ETH gas fees\n\nProceed?')) {
                    const newTx: Transaction = {
                        id: String(transactions.length + 1),
                        hash: `0x${Math.random().toString(16).substr(2, 40)}`,
                        type: 'consent_update',
                        timestamp: new Date().toISOString(),
                        status: 'pending',
                        gasUsed: '31000',
                        gasPrice: '20'
                    };
                    setTransactions([newTx, ...transactions]);

                    setTimeout(() => {
                        setTransactions(prev => prev.map(tx =>
                            tx.id === newTx.id
                                ? { ...tx, status: 'confirmed' as Transaction['status'], blockNumber: 18745726 }
                                : tx
                        ));
                    }, 2000);
                }
            },
            'grant-access': () => {
                if (window.confirm('🔐 Grant Data Access Permission\n\nThis will:\n• Create access token\n• Set permission levels\n• Log access grants\n• Cost: ~0.0015 ETH gas fees\n\nProceed?')) {
                    const newTx: Transaction = {
                        id: String(transactions.length + 1),
                        hash: `0x${Math.random().toString(16).substr(2, 40)}`,
                        type: 'access_grant',
                        timestamp: new Date().toISOString(),
                        status: 'pending',
                        gasUsed: '42000',
                        gasPrice: '22'
                    };
                    setTransactions([newTx, ...transactions]);

                    setTimeout(() => {
                        setTransactions(prev => prev.map(tx =>
                            tx.id === newTx.id
                                ? { ...tx, status: 'confirmed' as Transaction['status'], blockNumber: 18745727 }
                                : tx
                        ));
                    }, 3500);
                }
            }
        };

        const action = actionMap[actionType];
        if (action) {
            action();
        }
    };

    return (
        <div className={`space-y-6 p-6 ${className}`}>
            {/* Header */}
            <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">🔗 Blockchain Wallet Connection</h2>
                <p className="text-gray-600">
                    Connect your crypto wallet to access blockchain features and verify your identity on the decentralized network.
                </p>
            </div>

            {/* Connection Status */}
            {walletConnection ? (
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center">
                            <div className="text-green-600 text-2xl mr-3">✅</div>
                            <div>
                                <h3 className="text-lg font-medium text-gray-900">Wallet Connected</h3>
                                <p className="text-sm text-gray-600">Successfully connected via {walletConnection.provider}</p>
                            </div>
                        </div>
                        <button
                            onClick={disconnectWallet}
                            className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700"
                        >
                            Disconnect
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-3">
                            <div>
                                <label className="text-sm font-medium text-gray-700">Wallet Address</label>
                                <div className="flex items-center mt-1">
                                    <code className="text-sm bg-gray-100 px-2 py-1 rounded flex-1">
                                        {shortenAddress(walletConnection.address)}
                                    </code>
                                    <button
                                        onClick={() => copyToClipboard(walletConnection.address)}
                                        className="ml-2 p-1 text-gray-600 hover:text-gray-800"
                                        title="Copy full address"
                                    >
                                        📋
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-gray-700">Balance</label>
                                <p className="text-lg font-bold text-gray-900">{walletConnection.balance} ETH</p>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div>
                                <label className="text-sm font-medium text-gray-700">Network</label>
                                <div className="flex items-center mt-1">
                                    <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                        {getNetworkName(walletConnection.chainId)}
                                    </span>
                                </div>
                            </div>

                            <div className="flex space-x-2">
                                <button
                                    onClick={() => switchNetwork(1)}
                                    className="px-3 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                                >
                                    Mainnet
                                </button>
                                <button
                                    onClick={() => switchNetwork(137)}
                                    className="px-3 py-1 text-xs bg-purple-200 text-purple-700 rounded hover:bg-purple-300"
                                >
                                    Polygon
                                </button>
                                <button
                                    onClick={() => switchNetwork(5)}
                                    className="px-3 py-1 text-xs bg-yellow-200 text-yellow-700 rounded hover:bg-yellow-300"
                                >
                                    Testnet
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Connect Your Wallet</h3>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* MetaMask */}
                        <button
                            onClick={connectMetaMask}
                            disabled={isConnecting}
                            className="flex flex-col items-center p-6 border-2 border-gray-200 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-colors"
                        >
                            <div className="text-4xl mb-2">🦊</div>
                            <h4 className="font-medium text-gray-900">MetaMask</h4>
                            <p className="text-sm text-gray-600 text-center mt-1">
                                Most popular browser wallet
                            </p>
                            {isConnecting && <div className="animate-spin text-orange-500 mt-2">⏳</div>}
                        </button>

                        {/* WalletConnect */}
                        <button
                            onClick={connectWalletConnect}
                            className="flex flex-col items-center p-6 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
                        >
                            <div className="text-4xl mb-2">📱</div>
                            <h4 className="font-medium text-gray-900">WalletConnect</h4>
                            <p className="text-sm text-gray-600 text-center mt-1">
                                Connect with mobile wallets
                            </p>
                        </button>

                        {/* Coinbase Wallet */}
                        <button
                            onClick={connectCoinbase}
                            className="flex flex-col items-center p-6 border-2 border-gray-200 rounded-lg hover:border-blue-600 hover:bg-blue-50 transition-colors"
                        >
                            <div className="text-4xl mb-2">💙</div>
                            <h4 className="font-medium text-gray-900">Coinbase</h4>
                            <p className="text-sm text-gray-600 text-center mt-1">
                                Coinbase Wallet integration
                            </p>
                        </button>
                    </div>

                    <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                        <div className="flex items-start">
                            <div className="text-blue-600 text-lg mr-2">ℹ️</div>
                            <div className="text-sm text-blue-700">
                                <strong>Why connect a wallet?</strong>
                                <ul className="mt-2 space-y-1">
                                    <li>• Verify your identity on the blockchain</li>
                                    <li>• Sign transactions for medical records</li>
                                    <li>• Access decentralized healthcare features</li>
                                    <li>• Ensure data integrity and ownership</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Blockchain Actions */}
            {walletConnection && (
                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">🚀 Blockchain Actions</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <button
                            onClick={() => handleBlockchainAction('store-record')}
                            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors"
                        >
                            <div className="text-2xl mr-3">📄</div>
                            <div className="text-left">
                                <h4 className="font-medium text-gray-900">Store Medical Record</h4>
                                <p className="text-sm text-gray-600">Upload encrypted health data to blockchain</p>
                            </div>
                        </button>

                        <button
                            onClick={() => handleBlockchainAction('mint-nft')}
                            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-green-50 hover:border-green-300 transition-colors"
                        >
                            <div className="text-2xl mr-3">🎖️</div>
                            <div className="text-left">
                                <h4 className="font-medium text-gray-900">Mint Health NFT</h4>
                                <p className="text-sm text-gray-600">Create achievement certificate as NFT</p>
                            </div>
                        </button>

                        <button
                            onClick={() => handleBlockchainAction('sign-consent')}
                            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-purple-50 hover:border-purple-300 transition-colors"
                        >
                            <div className="text-2xl mr-3">✍️</div>
                            <div className="text-left">
                                <h4 className="font-medium text-gray-900">Sign Consent Form</h4>
                                <p className="text-sm text-gray-600">Digital signature for medical consent</p>
                            </div>
                        </button>

                        <button
                            onClick={() => handleBlockchainAction('grant-access')}
                            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-yellow-50 hover:border-yellow-300 transition-colors"
                        >
                            <div className="text-2xl mr-3">🔐</div>
                            <div className="text-left">
                                <h4 className="font-medium text-gray-900">Grant Access</h4>
                                <p className="text-sm text-gray-600">Authorize data access to healthcare providers</p>
                            </div>
                        </button>
                    </div>
                </div>
            )}

            {/* Transaction History */}
            {walletConnection && transactions.length > 0 && (
                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">📜 Blockchain Transaction History</h3>

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Transaction
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Action
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Timestamp
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Gas
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {transactions.map((tx) => (
                                    <tr key={tx.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <span className="text-lg mr-2">{getTransactionIcon(tx.type)}</span>
                                                <div>
                                                    <button
                                                        onClick={() => copyToClipboard(tx.hash)}
                                                        className="text-sm font-mono text-blue-600 hover:text-blue-800"
                                                        title="Copy transaction hash"
                                                    >
                                                        {shortenAddress(tx.hash)}
                                                    </button>
                                                    {tx.blockNumber && (
                                                        <p className="text-xs text-gray-500">Block: {tx.blockNumber}</p>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm text-gray-900 capitalize">
                                                {tx.type.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(tx.timestamp).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(tx.status)}`}>
                                                {tx.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {tx.gasUsed && tx.gasPrice ? (
                                                <div>
                                                    <div>{tx.gasUsed} gas</div>
                                                    <div className="text-xs">{tx.gasPrice} gwei</div>
                                                </div>
                                            ) : (
                                                '—'
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Verification QR Code */}
            {walletConnection && (
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-medium text-gray-900">📱 Wallet Verification QR</h3>
                        <button
                            onClick={() => setShowQR(!showQR)}
                            className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
                        >
                            {showQR ? 'Hide QR' : 'Show QR'}
                        </button>
                    </div>

                    {showQR && (
                        <div className="text-center">
                            <div className="inline-block p-4 bg-white border-2 border-gray-300 rounded-lg">
                                {/* In real implementation, use react-qr-code */}
                                <div className="w-48 h-48 bg-gray-100 flex items-center justify-center text-4xl">
                                    📱
                                </div>
                            </div>
                            <p className="text-sm text-gray-600 mt-2">
                                Scan to verify wallet: {shortenAddress(walletConnection.address)}
                            </p>
                        </div>
                    )}
                </div>
            )}

            {/* Usage Instructions */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">📖 How to Use Wallet Connections</h3>

                <div className="space-y-4">
                    <div className="border-l-4 border-orange-400 pl-4">
                        <h4 className="font-medium text-orange-800 flex items-center">
                            <span className="text-xl mr-2">🦊</span>
                            MetaMask (Recommended)
                        </h4>
                        <p className="text-sm text-orange-700 mt-1">
                            • Install MetaMask browser extension from metamask.io<br />
                            • Create or import your wallet<br />
                            • Click "MetaMask" button above to connect<br />
                            • Approve the connection in the MetaMask popup<br />
                            • <strong>Real blockchain interaction</strong> - works with actual ETH networks
                        </p>
                    </div>

                    <div className="border-l-4 border-blue-400 pl-4">
                        <h4 className="font-medium text-blue-800 flex items-center">
                            <span className="text-xl mr-2">📱</span>
                            WalletConnect (Demo Mode)
                        </h4>
                        <p className="text-sm text-blue-700 mt-1">
                            • Simulates connecting to mobile wallets like Trust Wallet, Rainbow, etc.<br />
                            • In production: Shows QR code for mobile wallet scanning<br />
                            • Supports 100+ mobile wallet apps<br />
                            • <strong>Currently simulated</strong> - shows demo wallet data
                        </p>
                    </div>

                    <div className="border-l-4 border-blue-600 pl-4">
                        <h4 className="font-medium text-blue-800 flex items-center">
                            <span className="text-xl mr-2">💙</span>
                            Coinbase Wallet (Demo Mode)
                        </h4>
                        <p className="text-sm text-blue-700 mt-1">
                            • Simulates Coinbase Wallet integration<br />
                            • In production: Uses Coinbase Wallet SDK<br />
                            • Supports direct exchange integration and fiat on/off ramps<br />
                            • <strong>Currently simulated</strong> - shows demo wallet data
                        </p>
                    </div>
                </div>

                <div className="mt-4 p-3 bg-white rounded border border-gray-200">
                    <p className="text-sm text-gray-600">
                        <strong>💡 Development Note:</strong> MetaMask connections are fully functional.
                        WalletConnect and Coinbase connections are simulated for demonstration purposes.
                        In production, these would integrate with their respective SDKs for real functionality.
                    </p>
                </div>
            </div>
        </div>
    );
};

// Extend window interface for TypeScript
declare global {
    interface Window {
        ethereum?: any;
    }
}

export default EnhancedWalletConnect;
