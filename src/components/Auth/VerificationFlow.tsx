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
        // The current camera flow is a demo interaction, not verified biometric auth.
        if (process.env.NODE_ENV === 'production') {
            onFailure?.('Biometric verification is not configured for production.');
            return;
        }
        setCurrentStep('twofa');
    };

    const handleBiometricFailure = (error: string) => {
        onFailure?.(error);
    };

    const handleTwoFactorSuccess = (code: string) => {
        setIsLoading(true);
        setTimeout(() => {
            try {
                // Demo-only acceptance. Never use this code path to authenticate
                // production users; production deployment is blocked in the parent.
                if (process.env.NODE_ENV === 'production') {
                    onFailure?.('Two-factor authentication is not configured for production.');
                    return;
                }

                if (code.length === 6 && /^\d+$/.test(code)) {
                    setCurrentStep('complete');
                    setTimeout(() => onComplete(), 1000);
                } else {
                    onFailure?.('Enter a six-digit demo code.');
                }
            } finally {
                setIsLoading(false);
            }
        }, 500);
    };

    const handleClose = () => {
        setCurrentStep('biometric');
        setIsLoading(false);
        onClose();
    };

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
            return null;
        default:
            return null;
    }
};

export default VerificationFlow;
