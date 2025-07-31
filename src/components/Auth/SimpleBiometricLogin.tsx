import React, { useState, useEffect } from 'react';

interface SimpleBiometricLoginProps {
    onSuccess: () => Promise<void>;
    isLoading?: boolean;
}

const SimpleBiometricLogin: React.FC<SimpleBiometricLoginProps> = ({
    onSuccess,
    isLoading = false
}) => {
    const [scanning, setScanning] = useState(false);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        if (scanning) {
            const interval = setInterval(() => {
                setProgress(prev => {
                    if (prev >= 100) {
                        clearInterval(interval);
                        setScanning(false);
                        onSuccess();
                        return 100;
                    }
                    return prev + 10;
                });
            }, 200);

            return () => clearInterval(interval);
        }
    }, [scanning, onSuccess]);

    const handleStartScan = () => {
        setScanning(true);
        setProgress(0);
    };

    return (
        <div className="text-center space-y-6">
            <div className="flex items-center justify-center">
                <div className={`w-32 h-32 rounded-full border-4 flex items-center justify-center transition-all duration-300 ${scanning ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50'
                    }`}>
                    <div className="text-4xl">
                        {scanning ? '🔍' : '👤'}
                    </div>
                </div>
            </div>

            {scanning && (
                <div className="space-y-2">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-200"
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>
                    <p className="text-sm text-gray-600">Scanning biometric data... {progress}%</p>
                </div>
            )}

            <div className="space-y-2">
                <h3 className="text-lg font-medium text-gray-900">Biometric Verification</h3>
                <p className="text-sm text-gray-600">
                    {scanning
                        ? 'Please hold still while we verify your identity...'
                        : 'Click the button below to start biometric verification'
                    }
                </p>
            </div>

            <button
                onClick={handleStartScan}
                disabled={isLoading || scanning}
                className={`w-full py-3 px-6 rounded-lg font-medium transition-colors ${isLoading || scanning
                        ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                        : 'bg-green-600 text-white hover:bg-green-700'
                    }`}
            >
                {scanning ? (
                    <div className="flex items-center justify-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Scanning...</span>
                    </div>
                ) : isLoading ? (
                    'Processing...'
                ) : (
                    'Start Biometric Scan'
                )}
            </button>

            <div className="text-xs text-gray-500 space-y-1">
                <p>🔒 Your biometric data is encrypted and never stored</p>
                <p>✨ Demo mode: Automatic verification in progress</p>
            </div>
        </div>
    );
};

export default SimpleBiometricLogin;
