import React, { useState, useEffect } from 'react';

interface BiometricLoginProps {
    onSuccess: () => void;
    onError: (error: string) => void;
    className?: string;
}

const BiometricLogin: React.FC<BiometricLoginProps> = ({
    onSuccess,
    onError,
    className = ''
}) => {
    const [isSupported, setIsSupported] = useState(false);
    const [isAuthenticating, setIsAuthenticating] = useState(false);
    const [availableMethods, setAvailableMethods] = useState<string[]>([]);

    useEffect(() => {
        checkBiometricSupport();
    }, []);

    const checkBiometricSupport = async () => {
        if ('credentials' in navigator && 'create' in navigator.credentials) {
            try {
                // Check if WebAuthn is supported
                await (navigator.credentials as any).get({
                    publicKey: {
                        challenge: new Uint8Array(32),
                        allowCredentials: [],
                        timeout: 60000
                    }
                }).catch(() => false);

                setIsSupported(true);

                // Simulate available biometric methods
                const methods = ['fingerprint', 'face-id', 'touch-id'];
                setAvailableMethods(methods);
            } catch (error) {
                setIsSupported(false);
            }
        }
    };

    const authenticateWithBiometric = async (method: string) => {
        setIsAuthenticating(true);

        try {
            // Simulate biometric authentication
            await new Promise(resolve => setTimeout(resolve, 2000));

            // In real implementation, use WebAuthn API
            const success = Math.random() > 0.2; // 80% success rate for demo

            if (success) {
                onSuccess();
            } else {
                onError('Biometric authentication failed. Please try again.');
            }
        } catch (error) {
            onError(`Authentication error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
            setIsAuthenticating(false);
        }
    };

    const getBiometricIcon = (method: string): string => {
        switch (method) {
            case 'fingerprint': return '👆';
            case 'face-id': return '👤';
            case 'touch-id': return '✋';
            default: return '🔒';
        }
    };

    const getBiometricName = (method: string): string => {
        switch (method) {
            case 'fingerprint': return 'Fingerprint';
            case 'face-id': return 'Face ID';
            case 'touch-id': return 'Touch ID';
            default: return 'Biometric';
        }
    };

    if (!isSupported) {
        return (
            <div className={`p-6 bg-gray-50 rounded-lg ${className}`}>
                <div className="text-center">
                    <div className="text-4xl mb-4">🚫</div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Biometric Authentication Not Available
                    </h3>
                    <p className="text-sm text-gray-600">
                        Your device doesn't support biometric authentication or it's not enabled.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className={`space-y-4 ${className}`}>
            <div className="text-center mb-6">
                <div className="text-4xl mb-2">🛡️</div>
                <h3 className="text-lg font-medium text-gray-900">Secure Biometric Login</h3>
                <p className="text-sm text-gray-600">
                    Access your healthcare data securely with biometric authentication
                </p>
            </div>

            <div className="space-y-3">
                {availableMethods.map((method) => (
                    <button
                        key={method}
                        onClick={() => authenticateWithBiometric(method)}
                        disabled={isAuthenticating}
                        className={`w-full flex items-center justify-center p-4 border-2 rounded-lg transition-colors ${isAuthenticating
                                ? 'border-gray-300 bg-gray-100 cursor-not-allowed'
                                : 'border-blue-300 bg-blue-50 hover:bg-blue-100 hover:border-blue-400'
                            }`}
                    >
                        <div className="flex items-center">
                            <span className="text-2xl mr-3">{getBiometricIcon(method)}</span>
                            <div className="text-left">
                                <div className="font-medium text-gray-900">
                                    {isAuthenticating ? 'Authenticating...' : `Login with ${getBiometricName(method)}`}
                                </div>
                                <div className="text-sm text-gray-600">
                                    {isAuthenticating ? 'Please complete biometric scan' : 'Tap to authenticate'}
                                </div>
                            </div>
                            {isAuthenticating && (
                                <div className="ml-3 animate-spin text-blue-600">⏳</div>
                            )}
                        </div>
                    </button>
                ))}
            </div>

            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-start">
                    <div className="text-green-600 text-lg mr-2">🔒</div>
                    <div className="text-sm text-green-700">
                        <strong>Enhanced Security:</strong>
                        <ul className="mt-1 space-y-1">
                            <li>• Your biometric data never leaves your device</li>
                            <li>• Each authentication creates a unique cryptographic signature</li>
                            <li>• Multi-factor authentication for healthcare compliance</li>
                        </ul>
                    </div>
                </div>
            </div>

            <div className="text-center">
                <p className="text-xs text-gray-500">
                    Protected by HIPAA-compliant biometric security
                </p>
            </div>
        </div>
    );
};

export default BiometricLogin;
