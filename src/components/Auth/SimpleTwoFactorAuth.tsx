import React, { useState } from 'react';

interface SimpleTwoFactorAuthProps {
    onVerify: (code: string) => Promise<void>;
    isLoading?: boolean;
}

const SimpleTwoFactorAuth: React.FC<SimpleTwoFactorAuthProps> = ({
    onVerify,
    isLoading = false
}) => {
    const [code, setCode] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onVerify(code);
    };

    const handleInputChange = (value: string) => {
        // Only allow numbers and limit to 6 digits
        const numericValue = value.replace(/\D/g, '').slice(0, 6);
        setCode(numericValue);
    };

    return (
        <div className="space-y-6">
            <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">📱</span>
                </div>
                <h3 className="text-lg font-medium text-gray-900">Enter Verification Code</h3>
                <p className="text-sm text-gray-600 mt-2">
                    Enter the 6-digit code from your authenticator app
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <input
                        type="text"
                        value={code}
                        onChange={(e) => handleInputChange(e.target.value)}
                        placeholder="000000"
                        className="w-full px-4 py-3 text-center text-2xl font-mono border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 tracking-widest"
                        maxLength={6}
                        required
                        disabled={isLoading}
                    />
                </div>

                <button
                    type="submit"
                    disabled={isLoading || code.length !== 6}
                    className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${isLoading || code.length !== 6
                            ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                >
                    {isLoading ? (
                        <div className="flex items-center justify-center space-x-2">
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            <span>Verifying...</span>
                        </div>
                    ) : (
                        'Verify Code'
                    )}
                </button>
            </form>

            <div className="text-center space-y-2">
                <button
                    type="button"
                    className="text-sm text-blue-600 hover:text-blue-800"
                    disabled={isLoading}
                >
                    Resend Code
                </button>
                <p className="text-xs text-gray-500">
                    Code expires in 5:00
                </p>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-xs text-yellow-800">
                    <strong>Demo Mode:</strong> Use code 123456 for testing
                </p>
            </div>
        </div>
    );
};

export default SimpleTwoFactorAuth;
