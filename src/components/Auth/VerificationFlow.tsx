import React, { useState } from 'react';
import QuickCameraVerification from './QuickCameraVerification';
import EnhancedTwoFactorAuth from './EnhancedTwoFactorAuth';

interface VerificationFlowProps {
    isOpen: boolean;
    onClose: () => void;
    onComplete: () => void;
    onFailure?: (error: string) => void;
}

const VerificationFlow: React.FC<VerificationFlowProps> = ({
    isOpen,
    onClose,
    onComplete,
    onFailure
}) => {
    const [currentStep, setCurrentStep] = useState<'biometric' | 'twofa' | 'complete'>('biometric');
    const [isLoading, setIsLoading] = useState(false);

    const handleBiometricSuccess = () => {
        console.log('✅ Biometric verification successful, proceeding to 2FA...');
        setCurrentStep('twofa');
    };

    const handleBiometricFailure = (error: string) => {
        console.error('❌ Biometric verification failed:', error);
        onFailure?.(error);
    };

    const handleTwoFactorSuccess = (code: string) => {
        setIsLoading(true);

        // Simulate 2FA verification
        setTimeout(() => {
            // Accept any 6-digit code for demo purposes
            if (code.length === 6 && /^\d+$/.test(code)) {
                console.log('✅ Two-factor authentication successful!');
                setCurrentStep('complete');
                setIsLoading(false);

                // Complete the verification process
                setTimeout(() => {
                    onComplete();
                }, 1000);
            } else {
                console.error('❌ Invalid 2FA code format');
                setIsLoading(false);
                onFailure?.('Invalid verification code format');
            }
        }, 2000);
    };

    const handleClose = () => {
        // Reset the flow when closing
        setCurrentStep('biometric');
        setIsLoading(false);
        onClose();
    };

    const renderCurrentStep = () => {
        switch (currentStep) {
            case 'biometric':
                return (
                    <QuickCameraVerification
                        isOpen={isOpen}
                        onClose={handleClose}
                        onSuccess={handleBiometricSuccess}
                        onFailure={handleBiometricFailure}
                    />
                );

            case 'twofa':
                return (
                    <EnhancedTwoFactorAuth
                        isOpen={isOpen}
                        onClose={handleClose}
                        onVerify={handleTwoFactorSuccess}
                        isLoading={isLoading}
                    />
                );

            case 'complete':
                return null; // The flow is complete, component will close

            default:
                return null;
        }
    };

    return renderCurrentStep();
};

export default VerificationFlow;
