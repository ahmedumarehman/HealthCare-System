import React, { useState } from 'react';
import VerificationFlow from './VerificationFlow';
import Badge from '../UI/Badge';

const VerificationFlowDemo: React.FC = () => {
    const [showFlow, setShowFlow] = useState(false);
    const [verificationStatus, setVerificationStatus] = useState<'idle' | 'success' | 'failed'>('idle');
    const [lastError, setLastError] = useState<string>('');

    const startVerification = () => {
        setVerificationStatus('idle');
        setLastError('');
        setShowFlow(true);
    };

    const handleVerificationComplete = () => {
        setVerificationStatus('success');
        setShowFlow(false);
        console.log('🎉 Complete verification flow finished successfully!');
    };

    const handleVerificationFailure = (error: string) => {
        setVerificationStatus('failed');
        setLastError(error);
        setShowFlow(false);
        console.error('❌ Verification flow failed:', error);
    };

    const handleClose = () => {
        setShowFlow(false);
    };

    return (
        <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                    🔐 Enhanced Verification System Demo
                </h1>
                <p className="text-gray-600 mb-6">
                    Test the complete biometric face recognition + two-factor authentication flow
                </p>

                <div className="flex justify-center space-x-2 mb-6">
                    <Badge variant="primary" size="sm">👁️ Face Recognition</Badge>
                    <Badge variant="success" size="sm">📧 Email 2FA</Badge>
                    <Badge variant="secondary" size="sm">🛡️ Secure Flow</Badge>
                </div>
            </div>

            <div className="space-y-6">
                {/* Status Display */}
                <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-2">Verification Status:</h3>
                    <div className="flex items-center space-x-2">
                        {verificationStatus === 'idle' && <Badge variant="secondary">Ready to Start</Badge>}
                        {verificationStatus === 'success' && <Badge variant="success">✅ Verification Successful</Badge>}
                        {verificationStatus === 'failed' && <Badge variant="error">❌ Verification Failed</Badge>}
                    </div>
                    {lastError && (
                        <p className="text-sm text-red-600 mt-2">Error: {lastError}</p>
                    )}
                </div>

                {/* Configuration Display */}
                <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-blue-900 mb-2">📧 Email Configuration:</h3>
                    <div className="text-sm text-blue-800 space-y-1">
                        <p><strong>SMTP Email:</strong> ahmedumar475@gmail.com</p>
                        <p><strong>App Password:</strong> xxzzwqvkgewutobo</p>
                        <p><strong>Security:</strong> App-specific password authentication</p>
                    </div>
                </div>

                {/* Flow Steps */}
                <div className="bg-green-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-green-900 mb-2">🔄 Verification Flow:</h3>
                    <div className="text-sm text-green-800 space-y-1">
                        <p><strong>Step 1:</strong> Biometric face recognition via camera</p>
                        <p><strong>Step 2:</strong> Two-factor authentication via email</p>
                        <p><strong>Step 3:</strong> Complete verification and access granted</p>
                    </div>
                </div>

                {/* Start Button */}
                <div className="text-center">
                    <button
                        onClick={startVerification}
                        disabled={showFlow}
                        className="bg-indigo-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {showFlow ? 'Verification in Progress...' : 'Start Enhanced Verification'}
                    </button>
                </div>

                {/* Recent Results */}
                {verificationStatus !== 'idle' && (
                    <div className="bg-yellow-50 p-4 rounded-lg">
                        <h3 className="font-semibold text-yellow-900 mb-2">📊 Last Verification Result:</h3>
                        <div className="text-sm text-yellow-800">
                            {verificationStatus === 'success' && (
                                <div className="space-y-1">
                                    <p>✅ Biometric verification: Successful</p>
                                    <p>✅ Two-factor authentication: Verified</p>
                                    <p>✅ Overall status: Access granted</p>
                                </div>
                            )}
                            {verificationStatus === 'failed' && (
                                <div className="space-y-1">
                                    <p>❌ Verification failed</p>
                                    <p>Reason: {lastError}</p>
                                    <p>Action: Try again or contact support</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Verification Flow Modal */}
            <VerificationFlow
                isOpen={showFlow}
                onClose={handleClose}
                onComplete={handleVerificationComplete}
                onFailure={handleVerificationFailure}
            />
        </div>
    );
};

export default VerificationFlowDemo;
