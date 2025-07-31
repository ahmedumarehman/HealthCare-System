import React, { useState, useRef, useEffect } from 'react';
import { encryptionService } from '../../services/encryptionService';
import { EncryptionJob } from '../../types';

interface DoctorEncryptionDashboardProps {
    className?: string;
}

// Password strength calculator
const calculatePasswordStrength = (password: string) => {
    if (!password) return { strength: 'none', score: 0, feedback: 'Enter a password' };

    let score = 0;
    const feedback: string[] = [];

    // Length check
    if (password.length >= 8) {
        score += 2;
    } else if (password.length >= 6) {
        score += 1;
        feedback.push('Use at least 8 characters');
    } else {
        feedback.push('Password too short (minimum 6 characters)');
    }

    // Character type checks
    if (/[a-z]/.test(password)) score += 1;
    else feedback.push('Add lowercase letters');

    if (/[A-Z]/.test(password)) score += 1;
    else feedback.push('Add uppercase letters');

    if (/[0-9]/.test(password)) score += 1;
    else feedback.push('Add numbers');

    if (/[^A-Za-z0-9]/.test(password)) score += 2;
    else feedback.push('Add special characters (!@#$%^&*)');

    // Determine strength
    let strength: 'weak' | 'medium' | 'strong' | 'very-strong' | 'none';
    if (score <= 2) strength = 'weak';
    else if (score <= 4) strength = 'medium';
    else if (score <= 6) strength = 'strong';
    else strength = 'very-strong';

    return { strength, score, feedback };
};

const DoctorEncryptionDashboard: React.FC<DoctorEncryptionDashboardProps> = ({ className = '' }) => {
    // File encryption states
    const [operation, setOperation] = useState<'encrypt' | 'decrypt'>('encrypt');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [password, setPassword] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [jobs, setJobs] = useState<EncryptionJob[]>([]);
    const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info' | 'warning'; text: string } | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Password validation test states
    const [testPassword1, setTestPassword1] = useState('00000');
    const [testPassword2, setTestPassword2] = useState('0');
    const [testResults, setTestResults] = useState<string[]>([]);
    const [isTestRunning, setIsTestRunning] = useState(false);

    // Calculate password strength
    const passwordStrength = calculatePasswordStrength(password);

    useEffect(() => {
        const interval = setInterval(() => {
            setJobs(encryptionService.getJobs());
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const showMessage = (type: 'success' | 'error' | 'info' | 'warning', text: string) => {
        setMessage({ type, text });
        setTimeout(() => setMessage(null), 8000);
    };

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            setMessage(null);
        }
    };

    const validateInputs = (): boolean => {
        if (!selectedFile) {
            showMessage('error', '📁 Please select a file first');
            return false;
        }
        if (!password.trim()) {
            showMessage('error', '🔐 Please enter a password');
            return false;
        }
        if (operation === 'encrypt' && password.length < 6) {
            showMessage('error', '🔐 Password must be at least 6 characters long for security');
            return false;
        }
        if (operation === 'encrypt' && passwordStrength.strength === 'weak') {
            showMessage('warning', '⚠️ Using a weak password. Consider using a stronger password for better security.');
        }
        return true;
    };

    const handleProcess = async () => {
        if (!validateInputs()) return;

        setIsProcessing(true);
        setMessage(null);

        try {
            if (operation === 'encrypt') {
                showMessage('info', '🔒 Encrypting file with military-grade security...');
                await encryptionService.encryptFile(selectedFile!, password);
                showMessage('success', `✅ File encrypted successfully! Download will start automatically.`);
            } else {
                showMessage('info', '🔓 Decrypting file...');
                await encryptionService.decryptFile(selectedFile!, password);
                showMessage('success', `✅ File decrypted successfully! Download will start automatically.`);
            }

            // Reset form after successful operation
            setSelectedFile(null);
            setPassword('');
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Operation failed';
            console.error('File operation failed:', error);

            // Provide specific and user-friendly error messages for password issues
            if (errorMessage.includes('Invalid password') ||
                errorMessage.includes('verification failed') ||
                errorMessage.includes('wrong password') ||
                errorMessage.includes('password fingerprint') ||
                errorMessage.includes('password hash') ||
                errorMessage.includes('password length') ||
                errorMessage.includes('password proof') ||
                errorMessage.includes('character code sum') ||
                errorMessage.includes('character position')) {
                showMessage('error', `🚫 INCORRECT PASSWORD ENTERED - The password you entered is wrong. Please enter the correct password and try again. ${operation === 'decrypt' ? 'Make sure you use the exact same password that was used for encryption.' : ''}`);
            } else if (errorMessage.includes('corrupted') || errorMessage.includes('invalid format')) {
                showMessage('error', '📁 FILE ERROR - The selected file appears to be corrupted or not a valid encrypted file.');
            } else if (errorMessage.includes('JSON') || errorMessage.includes('not valid JSON')) {
                showMessage('error', '📁 INVALID FILE - Please select a valid encrypted file (.json format).');
            } else if (errorMessage.includes('AES decryption failed') || errorMessage.includes('decryption failed')) {
                showMessage('error', '🚫 INCORRECT PASSWORD ENTERED - Decryption failed because the password is wrong. Please enter the correct password and try again.');
            } else if (errorMessage.includes('UTF-8') || errorMessage.includes('decode')) {
                showMessage('error', '🚫 INCORRECT PASSWORD ENTERED - Cannot decode decrypted data, indicating the password is wrong. Please enter the correct password.');
            } else if (errorMessage.includes('garbage') || errorMessage.includes('invalid characters')) {
                showMessage('error', '🚫 INCORRECT PASSWORD ENTERED - Decrypted data is corrupted, indicating the password is wrong. Please enter the correct password.');
            } else {
                showMessage('error', `❌ ${operation.toUpperCase()} FAILED: The password you entered is incorrect. Please enter the correct password and try again.`);
            }
        } finally {
            setIsProcessing(false);
        }
    };

    const generateSecurePassword = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
        let result = '';
        for (let i = 0; i < 16; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        setPassword(result);
        showMessage('success', '🎲 Secure password generated! Copy it before proceeding.');
    };

    // Get password strength color and text
    const getPasswordStrengthDisplay = () => {
        if (!password) return null;

        const { strength, feedback } = passwordStrength;

        const strengthConfig = {
            weak: { color: 'text-red-600', bg: 'bg-red-100', text: '❌ Weak', border: 'border-red-300' },
            medium: { color: 'text-yellow-600', bg: 'bg-yellow-100', text: '⚠️ Medium', border: 'border-yellow-300' },
            strong: { color: 'text-blue-600', bg: 'bg-blue-100', text: '💪 Strong', border: 'border-blue-300' },
            'very-strong': { color: 'text-green-600', bg: 'bg-green-100', text: '🛡️ Very Strong', border: 'border-green-300' },
            none: { color: 'text-gray-600', bg: 'bg-gray-100', text: 'Enter password', border: 'border-gray-300' }
        } as const;

        const config = strengthConfig[strength as keyof typeof strengthConfig];

        return (
            <div className={`mt-2 p-2 rounded-lg border ${config.bg} ${config.border}`}>
                <div className="flex items-center justify-between">
                    <span className={`text-sm font-medium ${config.color}`}>
                        Password Strength: {config.text}
                    </span>
                    {strength !== 'none' && (
                        <span className="text-xs text-gray-500">
                            {password.length} characters
                        </span>
                    )}
                </div>
                {Array.isArray(feedback) && feedback.length > 0 && (
                    <div className="mt-1">
                        <p className="text-xs text-gray-600">Suggestions:</p>
                        <ul className="text-xs text-gray-600 ml-2">
                            {feedback.slice(0, 2).map((item: string, index: number) => (
                                <li key={index}>• {item}</li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        );
    };

    // Password validation test functions
    const addTestResult = (message: string) => {
        setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
    };

    const runPasswordValidationTest = async () => {
        setIsTestRunning(true);
        setTestResults([]);

        addTestResult('🚨 Starting CRITICAL password validation test...');
        addTestResult(`Testing encryption password: "${testPassword1}" vs decryption password: "${testPassword2}"`);

        try {
            const testData = 'SENSITIVE PATIENT DATA - This must be protected with correct password validation';

            // Test 1: Encrypt with first password, try to decrypt with second
            addTestResult(`📝 Step 1: Encrypting with password: "${testPassword1}"`);
            const result1 = await encryptionService.encryptData(testData, testPassword1);
            addTestResult('✅ Encryption completed successfully');

            addTestResult(`🔓 Step 2: Attempting decryption with WRONG password: "${testPassword2}"`);
            addTestResult('⚠️ Expected result: SHOULD FAIL with wrong password error');

            try {
                const decrypted1 = await encryptionService.decryptData(result1.encrypted, testPassword2, result1.salt, result1.iv);
                addTestResult('🚨🚨🚨 CRITICAL SECURITY VULNERABILITY DETECTED!');
                addTestResult(`❌ Wrong password "${testPassword2}" was INCORRECTLY ACCEPTED`);
                addTestResult(`❌ Decrypted data: ${decrypted1}`);
                addTestResult('❌ IMMEDIATE SECURITY PATCH REQUIRED - SYSTEM COMPROMISED');
                showMessage('error', '🚨 CRITICAL SECURITY BUG: Wrong passwords are being accepted!');
            } catch (error) {
                addTestResult('✅ CORRECT BEHAVIOR: Wrong password was properly rejected');
                addTestResult(`✅ Error message: ${error instanceof Error ? error.message : String(error)}`);
            }

            // Test 2: Verify correct password still works
            addTestResult(`🔓 Step 3: Verifying correct password: "${testPassword1}"`);
            try {
                const decrypted2 = await encryptionService.decryptData(result1.encrypted, testPassword1, result1.salt, result1.iv);
                if (decrypted2 === testData) {
                    addTestResult('✅ Correct password authentication works perfectly');
                    addTestResult('✅ Data integrity verified');
                } else {
                    addTestResult('❌ Data corruption detected with correct password');
                }
            } catch (error) {
                addTestResult('❌ CRITICAL ERROR: Correct password was rejected!');
                addTestResult(`❌ Error: ${error instanceof Error ? error.message : String(error)}`);
            }

            // Test 3: Reverse test for thoroughness
            addTestResult(`📝 Step 4: Reverse test - Encrypting with: "${testPassword2}"`);
            const result2 = await encryptionService.encryptData(testData, testPassword2);

            addTestResult(`🔓 Step 5: Attempting decryption with WRONG password: "${testPassword1}"`);
            try {
                const decrypted3 = await encryptionService.decryptData(result2.encrypted, testPassword1, result2.salt, result2.iv);
                addTestResult('🚨🚨🚨 CRITICAL SECURITY VULNERABILITY DETECTED!');
                addTestResult(`❌ Wrong password "${testPassword1}" was INCORRECTLY ACCEPTED`);
                addTestResult(`❌ Decrypted data: ${decrypted3}`);
                addTestResult('❌ BIDIRECTIONAL VULNERABILITY CONFIRMED');
            } catch (error) {
                addTestResult('✅ CORRECT: Reverse test also properly rejected wrong password');
            }

            addTestResult('🏁 PASSWORD VALIDATION TEST COMPLETED');

        } catch (error) {
            addTestResult(`❌ Test execution failed: ${error instanceof Error ? error.message : String(error)}`);
            showMessage('error', 'Password validation test failed to execute');
        }

        setIsTestRunning(false);
    };

    return (
        <div className={`space-y-6 ${className}`}>
            {/* Message Display */}
            {message && (
                <div className={`p-4 rounded-lg border-l-4 ${message.type === 'success' ? 'bg-green-50 border-green-400 text-green-700' :
                    message.type === 'error' ? 'bg-red-50 border-red-400 text-red-700' :
                        message.type === 'warning' ? 'bg-yellow-50 border-yellow-400 text-yellow-700' :
                            'bg-blue-50 border-blue-400 text-blue-700'
                    }`}>
                    <p className="font-medium">{message.text}</p>
                </div>
            )}

            {/* Main File Encryption Panel */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">🔒 Secure File Encryption for Healthcare Data</h2>

                <div className="space-y-6">
                    {/* Operation Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">Select Operation</label>
                        <div className="flex space-x-4">
                            <button
                                onClick={() => {
                                    setOperation('encrypt');
                                    setPassword('');
                                    setMessage(null);
                                }}
                                className={`px-6 py-3 rounded-lg font-medium transition-colors ${operation === 'encrypt'
                                    ? 'bg-blue-600 text-white shadow-md'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                🔒 Encrypt File
                            </button>
                            <button
                                onClick={() => {
                                    setOperation('decrypt');
                                    setPassword('');
                                    setMessage(null);
                                }}
                                className={`px-6 py-3 rounded-lg font-medium transition-colors ${operation === 'decrypt'
                                    ? 'bg-green-600 text-white shadow-md'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                🔓 Decrypt File
                            </button>
                        </div>
                    </div>

                    {/* File Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            📁 Select File {operation === 'encrypt' ? '(Original Document)' : '(Encrypted File)'}
                        </label>
                        <input
                            ref={fileInputRef}
                            type="file"
                            onChange={handleFileSelect}
                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 border border-gray-300 rounded-lg"
                            accept={operation === 'decrypt' ? '.json' : '*'}
                        />
                        {selectedFile && (
                            <div className="mt-3 p-3 bg-gray-50 rounded-lg border">
                                <p className="text-sm font-medium text-gray-700">📄 Selected File:</p>
                                <p className="text-sm text-gray-600">
                                    {selectedFile.name} ({(selectedFile.size / 1024).toFixed(2)} KB)
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Password Input Section */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            🔐 {operation === 'encrypt' ? 'Set Encryption Password' : 'Enter Decryption Password'}
                        </label>
                        <div className="space-y-2">
                            <div className="flex space-x-2">
                                <div className="relative flex-1">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder={operation === 'encrypt' ? 'Create a strong password' : 'Enter the exact password used for encryption'}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-10"
                                        disabled={isProcessing}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        {showPassword ? '🙈' : '👁️'}
                                    </button>
                                </div>
                                {operation === 'encrypt' && (
                                    <button
                                        onClick={generateSecurePassword}
                                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm whitespace-nowrap"
                                        disabled={isProcessing}
                                    >
                                        🎲 Generate
                                    </button>
                                )}
                            </div>

                            {/* Password Strength Indicator */}
                            {operation === 'encrypt' && getPasswordStrengthDisplay()}

                            {operation === 'decrypt' && (
                                <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                                    <p className="text-sm text-yellow-800">
                                        ⚠️ <strong>Important:</strong> Enter the EXACT password used during encryption.
                                        Passwords are case-sensitive and must match exactly.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Process Button */}
                    <button
                        onClick={handleProcess}
                        disabled={isProcessing || !selectedFile || !password}
                        className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${isProcessing || !selectedFile || !password
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : operation === 'encrypt'
                                ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md'
                                : 'bg-green-600 text-white hover:bg-green-700 shadow-md'
                            }`}
                    >
                        {isProcessing
                            ? `🔄 ${operation === 'encrypt' ? 'Encrypting' : 'Decrypting'}...`
                            : `${operation === 'encrypt' ? '🔒 Encrypt' : '🔓 Decrypt'} File`
                        }
                    </button>
                </div>
            </div>

            {/* Password Validation Test Panel */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">🧪 Password Security Validation Test</h3>
                <p className="text-gray-600 mb-4">
                    Test the encryption system to ensure wrong passwords (like "00000" vs "0") are never accepted.
                </p>

                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Encryption Password
                            </label>
                            <input
                                type="text"
                                value={testPassword1}
                                onChange={(e) => setTestPassword1(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="e.g., 00000"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Wrong Password Test
                            </label>
                            <input
                                type="text"
                                value={testPassword2}
                                onChange={(e) => setTestPassword2(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="e.g., 0"
                            />
                        </div>
                    </div>

                    <div className="flex space-x-3">
                        <button
                            onClick={runPasswordValidationTest}
                            disabled={isTestRunning}
                            className={`px-4 py-2 rounded-lg font-medium ${isTestRunning
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                : 'bg-red-600 text-white hover:bg-red-700'
                                }`}
                        >
                            {isTestRunning ? '🔄 Testing...' : '🚨 Run Security Test'}
                        </button>

                        <button
                            onClick={() => setTestResults([])}
                            disabled={isTestRunning}
                            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                        >
                            🗑️ Clear Results
                        </button>
                    </div>

                    {/* Test Results */}
                    {testResults.length > 0 && (
                        <div className="mt-4 bg-gray-900 rounded-lg p-4 max-h-64 overflow-y-auto">
                            <h4 className="text-white font-medium mb-2">🔍 Test Results:</h4>
                            <div className="space-y-1">
                                {testResults.map((result, index) => (
                                    <div
                                        key={index}
                                        className={`text-sm font-mono p-2 rounded ${result.includes('🚨') || result.includes('❌')
                                            ? 'bg-red-900 text-red-200'
                                            : result.includes('✅')
                                                ? 'bg-green-900 text-green-200'
                                                : result.includes('🔓') || result.includes('📝')
                                                    ? 'bg-blue-900 text-blue-200'
                                                    : 'bg-gray-800 text-gray-300'
                                            }`}
                                    >
                                        {result}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Jobs History */}
            {jobs.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">📋 Recent Operations</h3>
                    <div className="space-y-3">
                        {jobs.slice(-5).reverse().map((job) => (
                            <div key={job.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div className="flex-1">
                                    <div className="flex items-center space-x-2">
                                        <span className="font-medium">{job.fileName}</span>
                                        <span className={`px-2 py-1 text-xs rounded-full ${job.status === 'completed' ? 'bg-green-100 text-green-800' :
                                            job.status === 'failed' ? 'bg-red-100 text-red-800' :
                                                'bg-yellow-100 text-yellow-800'
                                            }`}>
                                            {job.status}
                                        </span>
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        {job.operation} • {new Date(job.timestamp).toLocaleString()}
                                    </div>
                                </div>
                                {job.status === 'completed' && job.outputPath && (
                                    <a
                                        href={job.outputPath}
                                        download
                                        className="ml-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
                                    >
                                        📥 Download
                                    </a>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-semibold text-yellow-800 mb-2">⚠️ Important Security Notes:</h4>
                <ul className="text-yellow-700 text-sm space-y-1">
                    <li>• Always use strong, unique passwords for encryption</li>
                    <li>• Store passwords securely - they cannot be recovered if lost</li>
                    <li>• Wrong passwords should ALWAYS be rejected during decryption</li>
                    <li>• Run the security test regularly to verify password validation</li>
                    <li>• Report any security issues immediately to the IT team</li>
                </ul>
            </div>
        </div>
    );
};

export default DoctorEncryptionDashboard;
