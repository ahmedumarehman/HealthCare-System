import React, { useState, useRef, useEffect } from 'react';
import Modal from '../UI/Modal';

interface QuickCameraVerificationProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    onFailure?: (error: string) => void;
}

const QuickCameraVerification: React.FC<QuickCameraVerificationProps> = ({
    isOpen,
    onClose,
    onSuccess,
    onFailure
}) => {
    const [step, setStep] = useState<'start' | 'camera' | 'success'>('start');
    const [countdown, setCountdown] = useState(3); // Just 3 seconds
    const videoRef = useRef<HTMLVideoElement>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);

    // Quick camera access
    const startQuickCamera = async () => {
        try {
            console.log('📸 Starting quick camera verification...');
            setStep('camera');
            setCountdown(3);

            // Simple camera access - no complex checks
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: false
            });

            setStream(mediaStream);

            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
                videoRef.current.play().catch(console.error);
            }

            console.log('✅ Camera started successfully');

        } catch (error: any) {
            console.error('❌ Camera failed:', error);
            // If camera fails, just skip to 2FA
            skipToTwoFA();
        }
    };

    const skipToTwoFA = () => {
        console.log('⏭️ Skipping to 2FA verification');
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
        }
        onSuccess(); // Go directly to 2FA
    };

    // Countdown timer
    useEffect(() => {
        if (step === 'camera' && countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        } else if (step === 'camera' && countdown === 0) {
            // Quick success after 3 seconds
            setStep('success');
            setTimeout(() => {
                if (stream) {
                    stream.getTracks().forEach(track => track.stop());
                }
                onSuccess(); // Proceed to 2FA
            }, 1000);
        }
    }, [step, countdown, stream, onSuccess]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, [stream]);

    const renderContent = () => {
        switch (step) {
            case 'start':
                return (
                    <div className="text-center space-y-6">
                        <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-blue-100">
                            <svg className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">Quick Face Check</h3>
                            <p className="text-sm text-gray-600 mb-4">
                                Quick camera verification (3 seconds) then proceed to email verification
                            </p>
                        </div>
                        <div className="space-y-3">
                            <button
                                onClick={startQuickCamera}
                                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                            >
                                📸 Quick Camera Check (3s)
                            </button>
                            <button
                                onClick={skipToTwoFA}
                                className="w-full border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            >
                                ⏭️ Skip to Email Verification
                            </button>
                        </div>
                    </div>
                );

            case 'camera':
                return (
                    <div className="text-center space-y-4">
                        <div className="relative">
                            <video
                                ref={videoRef}
                                className="w-full max-w-sm mx-auto rounded-lg border-2 border-blue-300"
                                autoPlay
                                muted
                                playsInline
                            />
                        </div>

                        <div className="space-y-2">
                            <div className="text-2xl font-bold text-blue-600">
                                {countdown}
                            </div>
                            <p className="text-sm text-gray-600">
                                Camera active - proceeding to email verification...
                            </p>
                            <button
                                onClick={skipToTwoFA}
                                className="text-sm text-blue-600 hover:text-blue-800 underline"
                            >
                                Skip to email now
                            </button>
                        </div>
                    </div>
                );

            case 'success':
                return (
                    <div className="text-center space-y-6">
                        <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-green-100">
                            <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-green-900 mb-2">✅ Camera Check Complete</h3>
                            <p className="text-sm text-gray-600">Proceeding to email verification...</p>
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="" size="md">
            <div className="p-4">
                {renderContent()}
            </div>
        </Modal>
    );
};

export default QuickCameraVerification;
