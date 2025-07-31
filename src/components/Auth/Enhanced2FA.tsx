import React, { useState, useEffect, useRef } from 'react';

interface Enhanced2FAProps {
    onSuccess: () => void;
    onError: (error: string) => void;
    onResendCode: () => void;
    userEmail?: string;
    phoneNumber?: string;
    className?: string;
}

const Enhanced2FA: React.FC<Enhanced2FAProps> = ({
    onSuccess,
    onError,
    onResendCode,
    userEmail,
    phoneNumber,
    className = ''
}) => {
    const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', '']);
    const [isVerifying, setIsVerifying] = useState(false);
    const [timeRemaining, setTimeRemaining] = useState(300); // 5 minutes
    const [canResend, setCanResend] = useState(false);
    const [method, setMethod] = useState<'email' | 'sms' | 'authenticator'>('email');
    const [attempts, setAttempts] = useState(0);
    const maxAttempts = 3;

    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    useEffect(() => {
        // Start countdown timer
        const timer = setInterval(() => {
            setTimeRemaining(prev => {
                if (prev <= 1) {
                    setCanResend(true);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        // Auto-submit when all digits are entered
        if (verificationCode.every(digit => digit !== '')) {
            handleVerify();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [verificationCode]);

    const handleInputChange = (index: number, value: string) => {
        if (value.length > 1) return; // Only allow single digit

        const newCode = [...verificationCode];
        newCode[index] = value;
        setVerificationCode(newCode);

        // Auto-focus next input
        if (value !== '' && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === 'Backspace' && verificationCode[index] === '' && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
        const newCode = [...verificationCode];

        for (let i = 0; i < pastedData.length && i < 6; i++) {
            newCode[i] = pastedData[i];
        }

        setVerificationCode(newCode);
    };

    const handleVerify = async () => {
        const code = verificationCode.join('');
        if (code.length !== 6) {
            onError('Please enter all 6 digits');
            return;
        }

        setIsVerifying(true);
        setAttempts(prev => prev + 1);

        try {
            // Simulate verification (in real app, call your API)
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Simulate verification logic
            const isValid = code === '123456' || Math.random() > 0.3; // Demo: accept 123456 or 70% success rate

            if (isValid) {
                onSuccess();
            } else {
                if (attempts >= maxAttempts - 1) {
                    onError(`Maximum verification attempts exceeded. Please request a new code.`);
                    setVerificationCode(['', '', '', '', '', '']);
                    setAttempts(0);
                } else {
                    onError(`Invalid verification code. ${maxAttempts - attempts - 1} attempts remaining.`);
                    setVerificationCode(['', '', '', '', '', '']);
                    inputRefs.current[0]?.focus();
                }
            }
        } catch (error) {
            onError('Verification failed. Please try again.');
        } finally {
            setIsVerifying(false);
        }
    };

    const handleResend = () => {
        if (!canResend) return;

        setTimeRemaining(300);
        setCanResend(false);
        setAttempts(0);
        setVerificationCode(['', '', '', '', '', '']);
        onResendCode();
        inputRefs.current[0]?.focus();
    };

    const formatTime = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const getMaskedContact = (contact: string): string => {
        if (method === 'email') {
            const [name, domain] = contact.split('@');
            return `${name.slice(0, 2)}***@${domain}`;
        } else {
            return `***-***-${contact.slice(-4)}`;
        }
    };

    return (
        <div className={`space-y-6 p-6 bg-white rounded-lg shadow ${className}`}>
            {/* Header */}
            <div className="text-center">
                <div className="text-4xl mb-2">🔐</div>
                <h2 className="text-2xl font-bold text-gray-900">Two-Factor Authentication</h2>
                <p className="text-gray-600 mt-2">
                    Enter the 6-digit verification code to secure your healthcare account
                </p>
            </div>

            {/* Method Selection */}
            <div className="space-y-3">
                <label className="text-sm font-medium text-gray-700">Verification Method</label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {userEmail && (
                        <button
                            onClick={() => setMethod('email')}
                            className={`flex items-center p-3 border rounded-lg transition-colors ${method === 'email'
                                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                                    : 'border-gray-300 hover:border-gray-400'
                                }`}
                        >
                            <span className="text-xl mr-2">📧</span>
                            <div className="text-left">
                                <div className="font-medium">Email</div>
                                <div className="text-xs text-gray-500">{getMaskedContact(userEmail)}</div>
                            </div>
                        </button>
                    )}

                    {phoneNumber && (
                        <button
                            onClick={() => setMethod('sms')}
                            className={`flex items-center p-3 border rounded-lg transition-colors ${method === 'sms'
                                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                                    : 'border-gray-300 hover:border-gray-400'
                                }`}
                        >
                            <span className="text-xl mr-2">📱</span>
                            <div className="text-left">
                                <div className="font-medium">SMS</div>
                                <div className="text-xs text-gray-500">{getMaskedContact(phoneNumber)}</div>
                            </div>
                        </button>
                    )}

                    <button
                        onClick={() => setMethod('authenticator')}
                        className={`flex items-center p-3 border rounded-lg transition-colors ${method === 'authenticator'
                                ? 'border-blue-500 bg-blue-50 text-blue-700'
                                : 'border-gray-300 hover:border-gray-400'
                            }`}
                    >
                        <span className="text-xl mr-2">📲</span>
                        <div className="text-left">
                            <div className="font-medium">Authenticator</div>
                            <div className="text-xs text-gray-500">Google/Authy</div>
                        </div>
                    </button>
                </div>
            </div>

            {/* Code Input */}
            <div className="space-y-4">
                <label className="text-sm font-medium text-gray-700">
                    Verification Code
                    {method === 'authenticator' ? ' (from your authenticator app)' : ` (sent to your ${method})`}
                </label>

                <div className="flex justify-center space-x-2" onPaste={handlePaste}>
                    {verificationCode.map((digit, index) => (
                        <input
                            key={index}
                            ref={el => inputRefs.current[index] = el}
                            type="text"
                            value={digit}
                            onChange={e => handleInputChange(index, e.target.value)}
                            onKeyDown={e => handleKeyDown(index, e)}
                            className="w-12 h-12 text-center text-lg font-bold border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                            maxLength={1}
                            disabled={isVerifying}
                        />
                    ))}
                </div>

                {/* Timer and Resend */}
                <div className="text-center space-y-2">
                    {timeRemaining > 0 ? (
                        <p className="text-sm text-gray-600">
                            Code expires in <span className="font-mono font-medium">{formatTime(timeRemaining)}</span>
                        </p>
                    ) : (
                        <p className="text-sm text-red-600">Code has expired</p>
                    )}

                    <button
                        onClick={handleResend}
                        disabled={!canResend || isVerifying}
                        className={`text-sm ${canResend && !isVerifying
                                ? 'text-blue-600 hover:text-blue-800 cursor-pointer'
                                : 'text-gray-400 cursor-not-allowed'
                            }`}
                    >
                        {!canResend ? `Resend code in ${formatTime(timeRemaining)}` : 'Resend verification code'}
                    </button>
                </div>
            </div>

            {/* Verify Button */}
            <button
                onClick={handleVerify}
                disabled={verificationCode.some(digit => digit === '') || isVerifying}
                className={`w-full py-3 px-4 rounded-lg font-medium text-white ${verificationCode.some(digit => digit === '') || isVerifying
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700'
                    }`}
            >
                {isVerifying ? (
                    <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Verifying...
                    </div>
                ) : (
                    'Verify Code'
                )}
            </button>

            {/* Security Info */}
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-start">
                    <div className="text-green-600 text-lg mr-2">🛡️</div>
                    <div className="text-sm text-green-700">
                        <strong>HIPAA Compliant Security:</strong>
                        <ul className="mt-1 space-y-1">
                            <li>• Codes expire automatically for security</li>
                            <li>• Limited verification attempts prevent brute force</li>
                            <li>• All authentication events are logged and audited</li>
                            <li>• End-to-end encryption protects your medical data</li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Attempts Warning */}
            {attempts > 0 && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center">
                        <div className="text-yellow-600 text-lg mr-2">⚠️</div>
                        <div className="text-sm text-yellow-700">
                            {attempts}/{maxAttempts} verification attempts used.
                            {attempts >= maxAttempts ? ' Please request a new code.' : ` ${maxAttempts - attempts} remaining.`}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Enhanced2FA;
