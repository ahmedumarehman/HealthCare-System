import React, { useState, useRef, useEffect, useCallback } from 'react';
import Modal from '../UI/Modal';
import Badge from '../UI/Badge';
import CameraTroubleshootingGuide from './CameraTroubleshootingGuide';

interface EnhancedBiometricVerificationProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    onFailure?: (error: string) => void;
    isLoading?: boolean;
}

const EnhancedBiometricVerification: React.FC<EnhancedBiometricVerificationProps> = ({
    isOpen,
    onClose,
    onSuccess,
    onFailure,
    isLoading = false
}) => {
    const [verificationStep, setVerificationStep] = useState<'init' | 'camera' | 'processing' | 'success' | 'error'>('init');
    const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
    const [faceDetected, setFaceDetected] = useState(false);
    const [countdown, setCountdown] = useState(5);
    const [errorMessage, setErrorMessage] = useState('');
    const [showTroubleshooting, setShowTroubleshooting] = useState(false);
    const [debugMode, setDebugMode] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const handleCaptureFace = useCallback(async () => {
        if (!videoRef.current || !canvasRef.current) return;

        setVerificationStep('processing');

        const canvas = canvasRef.current;
        const video = videoRef.current;
        const context = canvas.getContext('2d');

        if (context) {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            context.drawImage(video, 0, 0);

            // Simulate biometric processing
            setTimeout(() => {
                // Stop camera stream
                if (cameraStream) {
                    cameraStream.getTracks().forEach(track => track.stop());
                    setCameraStream(null);
                }

                // Simulate successful face recognition
                const success = Math.random() > 0.1; // 90% success rate for demo

                if (success) {
                    setVerificationStep('success');
                    setTimeout(() => {
                        onSuccess();
                    }, 1500);
                } else {
                    setErrorMessage('Face recognition failed. Please try again.');
                    setVerificationStep('error');
                    onFailure?.('Face recognition failed');
                }
            }, 3000);
        }
    }, [cameraStream, onSuccess, onFailure]);

    useEffect(() => {
        if (verificationStep === 'camera' && countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        } else if (verificationStep === 'camera' && countdown === 0) {
            handleCaptureFace();
        }
    }, [verificationStep, countdown, handleCaptureFace]);

    useEffect(() => {
        return () => {
            if (cameraStream) {
                cameraStream.getTracks().forEach(track => track.stop());
            }
        };
    }, [cameraStream]);

    const checkCameraPermissions = async (): Promise<{ hasPermission: boolean; error?: string }> => {
        try {
            // Check if we're in a secure context (HTTPS or localhost)
            if (!window.isSecureContext &&
                window.location.hostname !== 'localhost' &&
                window.location.hostname !== '127.0.0.1' &&
                !window.location.hostname.endsWith('.local')) {
                return {
                    hasPermission: false,
                    error: 'Camera access requires HTTPS or localhost. Please ensure you are using a secure connection.'
                };
            }

            // Check if mediaDevices is supported
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                return {
                    hasPermission: false,
                    error: 'Your browser does not support camera access. Please use Chrome, Firefox, or Safari.'
                };
            }

            // Check if we can enumerate devices
            try {
                const devices = await navigator.mediaDevices.enumerateDevices();
                const videoDevices = devices.filter(device => device.kind === 'videoinput');
                if (videoDevices.length === 0) {
                    return {
                        hasPermission: false,
                        error: 'No camera devices found on this system.'
                    };
                }
            } catch (enumError) {
                console.log('Device enumeration failed:', enumError);
                // Continue anyway, as this might work even if enumeration fails
            }

            // Try to get camera permissions without actually starting the camera
            try {
                const permissionStatus = await navigator.permissions.query({ name: 'camera' as PermissionName });
                if (permissionStatus.state === 'denied') {
                    return {
                        hasPermission: false,
                        error: 'Camera permission is permanently denied. Please check your browser settings.'
                    };
                }
            } catch (permissionError) {
                // Permissions API might not be supported, we'll try getUserMedia directly
                console.log('Permissions API not available, will attempt direct camera access');
            }

            return { hasPermission: true };
        } catch (error: any) {
            return {
                hasPermission: false,
                error: `Permission check failed: ${error.message}`
            };
        }
    };

    const testBasicCameraAccess = async (): Promise<{ success: boolean; error?: string }> => {
        try {
            // Try the most basic camera access possible
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { width: 1, height: 1 },
                audio: false
            });

            // Immediately stop the stream since this is just a test
            stream.getTracks().forEach(track => track.stop());

            return { success: true };
        } catch (error: any) {
            console.log('Basic camera test failed:', error);
            return {
                success: false,
                error: error.message || 'Camera test failed'
            };
        }
    };

    const startCameraSimulation = () => {
        console.log('🎭 Starting camera simulation mode (no actual camera access)...');
        setVerificationStep('camera');
        setCountdown(5);
        setErrorMessage('');
        setDebugMode(true);

        // Simulate face detection without actual camera
        setTimeout(() => {
            setFaceDetected(true);
            console.log('👤 Simulated face detection successful');
        }, 2000);
    };

    const startCamera = async () => {
        try {
            setVerificationStep('camera');
            setCountdown(5);
            setErrorMessage('');

            console.log('🎥 Starting camera verification process...');

            // First check permissions and basic setup
            const permissionCheck = await checkCameraPermissions();
            if (!permissionCheck.hasPermission) {
                console.log('⚠️ Permission check failed, falling back to simulation mode');
                startCameraSimulation();
                return;
            }

            console.log('✅ Permission check passed, attempting camera access...');

            // Test basic camera access first
            const basicTest = await testBasicCameraAccess();
            if (!basicTest.success) {
                console.log('⚠️ Basic camera test failed, falling back to simulation mode');
                startCameraSimulation();
                return;
            }

            console.log('✅ Basic camera test passed, starting full camera stream...');

            // Start with more permissive camera constraints
            let stream: MediaStream;

            try {
                // Try with ideal constraints first
                console.log('Attempting ideal camera constraints...');
                stream = await navigator.mediaDevices.getUserMedia({
                    video: {
                        width: { ideal: 640, min: 320 },
                        height: { ideal: 480, min: 240 },
                        facingMode: 'user'
                    },
                    audio: false
                });
                console.log('✅ Ideal constraints successful');
            } catch (constraintError) {
                console.log('⚠️ Ideal constraints failed, trying basic constraints:', constraintError);
                try {
                    // Fallback to basic constraints
                    stream = await navigator.mediaDevices.getUserMedia({
                        video: true,
                        audio: false
                    });
                    console.log('✅ Basic constraints successful');
                } catch (basicError) {
                    console.log('⚠️ Basic constraints also failed, trying minimal constraints:', basicError);
                    try {
                        // Last resort: minimal constraints
                        stream = await navigator.mediaDevices.getUserMedia({
                            video: { facingMode: 'user' },
                            audio: false
                        });
                        console.log('✅ Minimal constraints successful');
                    } catch (minimalError) {
                        console.log('❌ All constraint attempts failed, falling back to simulation mode:', minimalError);
                        startCameraSimulation();
                        return;
                    }
                }
            }

            console.log('✅ Camera stream obtained successfully');
            setCameraStream(stream);
            setDebugMode(false);

            if (videoRef.current) {
                videoRef.current.srcObject = stream;

                // Handle video load events
                videoRef.current.onloadedmetadata = () => {
                    if (videoRef.current) {
                        console.log('✅ Video metadata loaded, attempting to play...');
                        videoRef.current.play().catch(playError => {
                            console.error('❌ Video play failed:', playError);
                            setErrorMessage('Failed to start video playback. Your browser might be blocking autoplay. Please click play manually or enable autoplay for this site.');
                            setVerificationStep('error');
                        });
                    }
                };

                videoRef.current.onplay = () => {
                    console.log('✅ Video is now playing successfully');
                };

                videoRef.current.onerror = (videoError) => {
                    console.error('❌ Video error:', videoError);
                    setErrorMessage('Video stream error occurred. Please check your camera connection and try again.');
                    setVerificationStep('error');
                };
            }

            // Simulate face detection after a delay
            setTimeout(() => {
                console.log('👤 Simulating face detection...');
                setFaceDetected(true);
            }, 2000);

        } catch (error: any) {
            console.error('❌ Camera access error, falling back to simulation:', error);
            startCameraSimulation();
        }
    };

    const handleRetry = () => {
        setVerificationStep('init');
        setFaceDetected(false);
        setCountdown(5);
        setErrorMessage('');
        setDebugMode(false);
        if (cameraStream) {
            cameraStream.getTracks().forEach(track => track.stop());
            setCameraStream(null);
        }
    };

    const renderContent = () => {
        switch (verificationStep) {
            case 'init':
                return (
                    <div className="text-center space-y-6">
                        <div className="mx-auto h-20 w-20 flex items-center justify-center rounded-full bg-gradient-to-r from-blue-100 to-purple-100 mb-4">
                            <svg className="h-10 w-10 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                🔐 Biometric Face Verification
                            </h3>
                            <p className="text-sm text-gray-600 mb-4">
                                Secure your healthcare data with advanced facial recognition technology
                            </p>

                            {/* Camera Permission Guide */}
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                                <h4 className="text-sm font-semibold text-blue-900 mb-2">📸 Camera Permission Required</h4>
                                <div className="text-xs text-blue-800 space-y-1 text-left">
                                    <p>• Your browser will ask for camera permission</p>
                                    <p>• Click "Allow" to enable face verification</p>
                                    <p>• Ensure good lighting for best results</p>
                                    <p>• Position your face clearly in view</p>
                                </div>
                            </div>

                            {/* System Requirements */}
                            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
                                <h4 className="text-sm font-semibold text-gray-900 mb-2">⚙️ System Requirements</h4>
                                <div className="text-xs text-gray-700 space-y-1 text-left">
                                    <p>✅ Working camera/webcam</p>
                                    <p>✅ Modern browser (Chrome, Firefox, Safari)</p>
                                    <p>✅ HTTPS connection (secure)</p>
                                    <p>✅ Camera not in use by other apps</p>
                                </div>
                            </div>

                            <div className="flex justify-center space-x-2 mb-6">
                                <Badge variant="success" size="sm">🛡️ Secure</Badge>
                                <Badge variant="primary" size="sm">⚡ Fast</Badge>
                                <Badge variant="secondary" size="sm">🔒 Private</Badge>
                            </div>
                        </div>
                        <div className="space-y-3">
                            <button
                                onClick={startCamera}
                                disabled={isLoading}
                                className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 font-medium"
                            >
                                {isLoading ? '🔄 Initializing Camera...' : '📷 Start Face Verification'}
                            </button>
                            <button
                                onClick={() => setShowTroubleshooting(true)}
                                className="w-full border border-blue-300 text-blue-700 py-2 px-4 rounded-lg hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            >
                                🛠️ Camera Help & Requirements
                            </button>
                            <button
                                onClick={() => {
                                    console.log('⚠️ User chose to skip biometric verification');
                                    onSuccess(); // Proceed directly to 2FA
                                }}
                                className="w-full border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                            >
                                ⏭️ Skip Camera & Use 2FA Only
                            </button>
                        </div>
                    </div>
                );

            case 'camera':
                return (
                    <div className="text-center space-y-4">
                        <div className="relative">
                            {!debugMode ? (
                                <video
                                    ref={videoRef}
                                    className="w-full max-w-md mx-auto rounded-lg border-4 border-dashed border-indigo-300"
                                    autoPlay
                                    muted
                                    playsInline
                                />
                            ) : (
                                <div className="w-full max-w-md mx-auto h-64 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-lg border-4 border-dashed border-indigo-300 flex items-center justify-center">
                                    <div className="text-center">
                                        <div className="text-4xl mb-2">🎭</div>
                                        <p className="text-sm text-indigo-700">Simulation Mode</p>
                                        <p className="text-xs text-indigo-600">Camera access not available</p>
                                    </div>
                                </div>
                            )}
                            <canvas ref={canvasRef} className="hidden" />

                            {/* Face detection overlay */}
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <div className={`w-48 h-48 rounded-full border-4 ${faceDetected ? 'border-green-500' : 'border-yellow-500'} ${faceDetected ? 'animate-pulse' : ''}`}>
                                    <div className="w-full h-full flex items-center justify-center">
                                        {faceDetected && (
                                            <svg className="w-8 h-8 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-center space-x-2">
                                <Badge variant={faceDetected ? "success" : "secondary"} size="sm">
                                    {faceDetected ? "✓ Face Detected" : "🔍 Detecting Face..."}
                                </Badge>
                                {debugMode && (
                                    <Badge variant="warning" size="sm">
                                        🎭 Simulation
                                    </Badge>
                                )}
                            </div>

                            <div className="text-lg font-mono font-bold text-indigo-600">
                                {countdown > 0 ? `Capturing in ${countdown}...` : 'Processing...'}
                            </div>

                            <p className="text-sm text-gray-600">
                                {debugMode
                                    ? "Simulating facial recognition for demo purposes"
                                    : "Please look directly at the camera and remain still"
                                }
                            </p>
                        </div>
                    </div>
                );

            case 'processing':
                return (
                    <div className="text-center space-y-6">
                        <div className="mx-auto h-20 w-20 flex items-center justify-center rounded-full bg-gradient-to-r from-yellow-100 to-orange-100">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-yellow-600"></div>
                        </div>
                        <div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                🔄 Processing Biometric Data
                            </h3>
                            <p className="text-sm text-gray-600">
                                Analyzing facial features and matching against secure database...
                            </p>
                        </div>
                        <div className="bg-blue-50 p-4 rounded-lg">
                            <p className="text-sm text-blue-700">
                                🔒 Your biometric data is processed locally and never stored permanently
                            </p>
                        </div>
                    </div>
                );

            case 'success':
                return (
                    <div className="text-center space-y-6">
                        <div className="mx-auto h-20 w-20 flex items-center justify-center rounded-full bg-gradient-to-r from-green-100 to-emerald-100">
                            <svg className="h-12 w-12 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="text-xl font-semibold text-green-900 mb-2">
                                ✅ Biometric Verification Successful
                            </h3>
                            <p className="text-sm text-gray-600">
                                Face recognition completed successfully. Proceeding to two-factor authentication...
                            </p>
                        </div>
                        <Badge variant="success" size="lg">Verified ✓</Badge>
                    </div>
                );

            case 'error':
                return (
                    <div className="text-center space-y-6">
                        <div className="mx-auto h-20 w-20 flex items-center justify-center rounded-full bg-gradient-to-r from-red-100 to-pink-100">
                            <svg className="h-12 w-12 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="text-xl font-semibold text-red-900 mb-4">
                                ❌ Camera Verification Failed
                            </h3>
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                                <pre className="text-sm text-red-800 whitespace-pre-wrap text-left">
                                    {errorMessage || 'Biometric verification could not be completed'}
                                </pre>
                            </div>
                        </div>

                        {/* Troubleshooting Tips */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                            <h4 className="font-semibold text-blue-900 mb-2">💡 Quick Fixes:</h4>
                            <div className="text-sm text-blue-800 text-left space-y-1">
                                <p>• Refresh the page and try again</p>
                                <p>• Check if another app is using your camera</p>
                                <p>• Ensure camera permissions are enabled</p>
                                <p>• Try a different browser (Chrome/Firefox/Safari)</p>
                                <p>• Use HTTPS or localhost for camera access</p>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <button
                                onClick={handleRetry}
                                className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                            >
                                🔄 Try Camera Again
                            </button>
                            <button
                                onClick={() => setShowTroubleshooting(true)}
                                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                            >
                                🛠️ Get Help & Troubleshooting
                            </button>
                            <button
                                onClick={() => {
                                    // Skip biometric verification and proceed to 2FA
                                    console.log('⚠️ Biometric verification skipped due to camera issues');
                                    onSuccess(); // Proceed to next step
                                }}
                                className="w-full bg-yellow-600 text-white py-3 px-4 rounded-lg hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 font-medium"
                            >
                                ⏭️ Skip Camera & Use 2FA Only
                            </button>
                            <button
                                onClick={onClose}
                                className="w-full border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                                ❌ Cancel
                            </button>
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <>
            <Modal isOpen={isOpen} onClose={onClose} title="" size="lg" showCloseButton={verificationStep === 'init' || verificationStep === 'error'}>
                <div className="p-2">
                    {renderContent()}
                </div>
            </Modal>

            <CameraTroubleshootingGuide
                isOpen={showTroubleshooting}
                onClose={() => setShowTroubleshooting(false)}
                onRetry={() => {
                    setShowTroubleshooting(false);
                    handleRetry();
                }}
                onSkip={() => {
                    setShowTroubleshooting(false);
                    console.log('⚠️ User skipped biometric verification via troubleshooting guide');
                    onSuccess();
                }}
            />
        </>
    );
};

export default EnhancedBiometricVerification;
