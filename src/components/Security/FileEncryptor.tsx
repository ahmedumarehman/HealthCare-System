import React, { useState, useRef, useEffect } from 'react';
import { EncryptionJob } from '../../types';
import { encryptionService } from '../../services/encryptionService';
import EncryptionDebugger from './EncryptionDebugger';
import PasswordValidationTest from './PasswordValidationTest';

interface FileEncryptorProps {
    className?: string;
}

const FileEncryptor: React.FC<FileEncryptorProps> = ({ className = '' }) => {
    const [operation, setOperation] = useState<'encrypt' | 'decrypt'>('encrypt');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [password, setPassword] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [jobs, setJobs] = useState<EncryptionJob[]>([]);
    const [showPasswordGenerator, setShowPasswordGenerator] = useState(false);
    const [generatedPassword, setGeneratedPassword] = useState('');
    const [testResults, setTestResults] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        // Update jobs list periodically
        const interval = setInterval(() => {
            setJobs(encryptionService.getJobs());
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setSelectedFile(file);
        }
    };

    const generatePassword = () => {
        const newPassword = encryptionService.generateSecurePassword(16);
        setGeneratedPassword(newPassword);
        setPassword(newPassword);
    };

    const copyToClipboard = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text);
            alert('Password copied to clipboard!');
        } catch (error) {
            console.error('Failed to copy password:', error);
        }
    };

    const handleProcess = async () => {
        if (!selectedFile || !password) {
            alert('Please select a file and enter a password');
            return;
        }

        // Additional validation for password strength on encryption
        if (operation === 'encrypt') {
            try {
                encryptionService.validatePassword(password);
            } catch (error) {
                alert(`Invalid password: ${error instanceof Error ? error.message : 'Unknown error'}`);
                return;
            }
        }

        setIsProcessing(true);
        try {
            let job: EncryptionJob;

            if (operation === 'encrypt') {
                console.log('🔒 Starting encryption process...');
                job = await encryptionService.encryptFile(selectedFile, password);
                console.log('✅ Encryption completed successfully');
            } else {
                console.log('🔓 Starting decryption process...');
                job = await encryptionService.decryptFile(selectedFile, password);
                console.log('✅ Decryption completed successfully');
            }

            // Trigger download
            if (job.outputPath) {
                const link = document.createElement('a');
                link.href = job.outputPath;
                link.download = operation === 'encrypt'
                    ? job.fileName || `${selectedFile.name}.enc`
                    : job.fileName || 'decrypted_file';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);

                // Show success message
                alert(`${operation === 'encrypt' ? 'Encryption' : 'Decryption'} completed successfully! File download started.`);
            }

            // Reset form
            setSelectedFile(null);
            setPassword('');
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }

        } catch (error) {
            console.error(`${operation} failed:`, error);
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';

            // Show specific error messages for common issues
            if (errorMessage.includes('Invalid password')) {
                alert(`❌ Decryption failed: Incorrect password entered. Please check your password and try again.`);
            } else if (errorMessage.includes('corrupted data') || errorMessage.includes('Invalid encrypted file')) {
                alert(`❌ ${operation} failed: The file appears to be corrupted or not properly encrypted.`);
            } else if (errorMessage.includes('missing required encryption data')) {
                alert(`❌ ${operation} failed: This file doesn't appear to be a valid encrypted file.`);
            } else {
                alert(`❌ ${operation} failed: ${errorMessage}`);
            }
        } finally {
            setIsProcessing(false);
        }
    };

    const getStatusColor = (status: EncryptionJob['status']) => {
        switch (status) {
            case 'completed': return 'text-green-600 bg-green-100';
            case 'processing': return 'text-blue-600 bg-blue-100';
            case 'failed': return 'text-red-600 bg-red-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };

    const clearCompletedJobs = () => {
        encryptionService.clearCompletedJobs();
        setJobs(encryptionService.getJobs());
    };

    // Test password validation functionality
    const testPasswordValidation = async () => {
        try {
            setTestResults('🧪 Testing password validation...');

            const testData = 'This is a test message for password validation';
            const correctPassword = 'TestPassword123!';
            const wrongPassword = 'WrongPassword456!';

            console.log('🔒 Starting password validation test...');
            console.log('Test data:', testData);
            console.log('Correct password:', correctPassword);
            console.log('Wrong password:', wrongPassword);

            // Test encryption
            const { encrypted, salt, iv } = await encryptionService.encryptData(testData, correctPassword);
            console.log('✅ Test data encrypted successfully');
            console.log('Salt:', salt);
            console.log('IV:', iv);
            console.log('Encrypted data (first 50 chars):', encrypted.substring(0, 50) + '...');

            // Test decryption with correct password
            try {
                const decryptedCorrect = await encryptionService.decryptData(encrypted, correctPassword, salt, iv);
                if (decryptedCorrect === testData) {
                    console.log('✅ Correct password test passed');
                } else {
                    throw new Error(`Decrypted data doesn't match original. Expected: "${testData}", Got: "${decryptedCorrect}"`);
                }
            } catch (error) {
                console.error('❌ Correct password test failed:', error);
                setTestResults('❌ Test failed: Correct password should work but failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
                return;
            }

            // Test decryption with wrong password
            try {
                console.log('🔍 Testing wrong password...');
                await encryptionService.decryptData(encrypted, wrongPassword, salt, iv);
                console.error('🚨 SECURITY ISSUE: Wrong password was accepted!');
                setTestResults('🚨 CRITICAL SECURITY ISSUE: Wrong password was accepted! This is a major vulnerability.');
                return;
            } catch (error) {
                if (error instanceof Error && error.message.includes('Invalid password')) {
                    console.log('✅ Wrong password test passed: Correctly rejected');
                    console.log('Rejection reason:', error.message);
                    setTestResults('✅ Password validation working correctly! Wrong passwords are properly rejected.');
                } else {
                    console.error('❌ Wrong password test failed with unexpected error:', error);
                    setTestResults('❌ Test failed: Unexpected error during validation - ' + (error instanceof Error ? error.message : 'Unknown error'));
                    return;
                }
            }

            // Additional test: Similar password
            const similarPassword = 'TestPassword123@';
            try {
                console.log('🔍 Testing similar password...');
                await encryptionService.decryptData(encrypted, similarPassword, salt, iv);
                console.error('🚨 SECURITY ISSUE: Similar password was accepted!');
                setTestResults('🚨 SECURITY ISSUE: Similar password was accepted!');
                return;
            } catch (error) {
                console.log('✅ Similar password properly rejected');
            }

            setTimeout(() => setTestResults(null), 8000);
        } catch (error) {
            console.error('❌ Password validation test failed:', error);
            setTestResults('❌ Test failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
            setTimeout(() => setTestResults(null), 8000);
        }
    };

    return (
        <div className={`space-y-6 p-6 ${className}`}>
            {/* Header */}
            <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">🔐 File Encryption & Security</h2>
                        <p className="text-gray-600">
                            Secure your healthcare files with military-grade encryption. Protect patient records,
                            prescriptions, and sensitive medical data.
                        </p>
                    </div>
                    <button
                        onClick={testPasswordValidation}
                        className="px-4 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                        🧪 Test Password Validation
                    </button>
                </div>

                {testResults && (
                    <div className={`mt-4 p-3 rounded-lg border ${testResults.includes('✅')
                        ? 'bg-green-50 border-green-200 text-green-700'
                        : testResults.includes('❌')
                            ? 'bg-red-50 border-red-200 text-red-700'
                            : 'bg-blue-50 border-blue-200 text-blue-700'
                        }`}>
                        <p className="text-sm font-medium">{testResults}</p>
                    </div>
                )}
            </div>

            {/* Operation Selection */}
            <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Select Operation</h3>
                <div className="flex space-x-4">
                    <label className="flex items-center cursor-pointer">
                        <input
                            type="radio"
                            name="operation"
                            value="encrypt"
                            checked={operation === 'encrypt'}
                            onChange={(e) => setOperation(e.target.value as 'encrypt')}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                        />
                        <span className="ml-2 text-sm font-medium text-gray-700">
                            🔒 Encrypt File (Secure sensitive data)
                        </span>
                    </label>
                    <label className="flex items-center cursor-pointer">
                        <input
                            type="radio"
                            name="operation"
                            value="decrypt"
                            checked={operation === 'decrypt'}
                            onChange={(e) => setOperation(e.target.value as 'decrypt')}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                        />
                        <span className="ml-2 text-sm font-medium text-gray-700">
                            🔓 Decrypt File (Access secured data)
                        </span>
                    </label>
                </div>
            </div>

            {/* File Selection */}
            <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                    {operation === 'encrypt' ? 'Select File to Encrypt' : 'Select Encrypted File'}
                </h3>

                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                    <div className="text-center">
                        <div className="text-4xl mb-2">
                            {operation === 'encrypt' ? '📄' : '🔐'}
                        </div>

                        {selectedFile ? (
                            <div className="space-y-2">
                                <p className="text-sm font-medium text-gray-900">{selectedFile.name}</p>
                                <p className="text-xs text-gray-500">
                                    Size: {(selectedFile.size / 1024).toFixed(2)} KB
                                </p>
                                <p className="text-xs text-gray-500">
                                    Type: {selectedFile.type || 'Unknown'}
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <p className="text-sm text-gray-600">
                                    {operation === 'encrypt'
                                        ? 'Upload PDF documents (reports), JSON files (patient data), images, or any medical file'
                                        : 'Upload an encrypted .encrypted file to decrypt'
                                    }
                                </p>
                            </div>
                        )}

                        <input
                            ref={fileInputRef}
                            type="file"
                            onChange={handleFileSelect}
                            className="hidden"
                            accept={operation === 'decrypt' ? '.encrypted' : '.pdf,.json,.txt,.doc,.docx,image/*'}
                        />

                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="mt-4 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
                        >
                            {selectedFile ? 'Change File' : 'Select File'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Password Section */}
            <div className="bg-white rounded-lg shadow p-6 mt-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">
                        {operation === 'encrypt' ? 'Set Encryption Password' : 'Enter Decryption Password'}
                    </h3>
                    {operation === 'encrypt' && (
                        <button
                            onClick={() => setShowPasswordGenerator(!showPasswordGenerator)}
                            className="text-sm text-blue-600 hover:text-blue-800"
                        >
                            🎲 Generate Secure Password
                        </button>
                    )}
                </div>

                <div className="space-y-4">
                    <div>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder={operation === 'encrypt' ? 'Create a strong password' : 'Enter your password'}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />

                        {password && (
                            <div className="mt-2 text-xs space-y-2">
                                <div className="flex items-center space-x-2">
                                    <span className="text-gray-600">Strength:</span>
                                    <div className={`px-2 py-1 rounded text-xs ${password.length < 8 ? 'bg-red-100 text-red-600' :
                                        password.length < 12 ? 'bg-yellow-100 text-yellow-600' :
                                            'bg-green-100 text-green-600'
                                        }`}>
                                        {password.length < 8 ? '❌ Weak (Min 8 chars)' :
                                            password.length < 12 ? '⚠️ Medium' :
                                                '✅ Strong'}
                                    </div>
                                </div>

                                {operation === 'encrypt' && (
                                    <div className="text-gray-500">
                                        <div className="flex items-center space-x-1">
                                            <span className={password.length >= 8 ? 'text-green-600' : 'text-red-600'}>
                                                {password.length >= 8 ? '✅' : '❌'}
                                            </span>
                                            <span>At least 8 characters</span>
                                        </div>
                                        <div className="flex items-center space-x-1">
                                            <span className={/[A-Z]/.test(password) ? 'text-green-600' : 'text-gray-400'}>
                                                {/[A-Z]/.test(password) ? '✅' : '○'}
                                            </span>
                                            <span>Uppercase letter</span>
                                        </div>
                                        <div className="flex items-center space-x-1">
                                            <span className={/[a-z]/.test(password) ? 'text-green-600' : 'text-gray-400'}>
                                                {/[a-z]/.test(password) ? '✅' : '○'}
                                            </span>
                                            <span>Lowercase letter</span>
                                        </div>
                                        <div className="flex items-center space-x-1">
                                            <span className={/[0-9]/.test(password) ? 'text-green-600' : 'text-gray-400'}>
                                                {/[0-9]/.test(password) ? '✅' : '○'}
                                            </span>
                                            <span>Number</span>
                                        </div>
                                        <div className="flex items-center space-x-1">
                                            <span className={/[!@#$%^&*]/.test(password) ? 'text-green-600' : 'text-gray-400'}>
                                                {/[!@#$%^&*]/.test(password) ? '✅' : '○'}
                                            </span>
                                            <span>Special character (!@#$%^&*)</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {showPasswordGenerator && operation === 'encrypt' && (
                        <div className="p-4 bg-gray-50 rounded-lg">
                            <div className="flex items-center space-x-2 mb-2">
                                <button
                                    onClick={generatePassword}
                                    className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                                >
                                    Generate
                                </button>
                                {generatedPassword && (
                                    <button
                                        onClick={() => copyToClipboard(generatedPassword)}
                                        className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                                    >
                                        Copy
                                    </button>
                                )}
                            </div>
                            {generatedPassword && (
                                <div className="p-2 bg-white border rounded font-mono text-sm break-all">
                                    {generatedPassword}
                                </div>
                            )}
                            <p className="text-xs text-gray-600 mt-2">
                                💡 Tip: Save this password securely. You'll need it to decrypt your file.
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Process Button */}
            <div className="bg-white rounded-lg shadow p-6">
                <button
                    onClick={handleProcess}
                    disabled={!selectedFile || !password || isProcessing}
                    className={`w-full py-3 px-4 rounded-lg font-medium text-white ${!selectedFile || !password || isProcessing
                        ? 'bg-gray-400 cursor-not-allowed'
                        : operation === 'encrypt'
                            ? 'bg-green-600 hover:bg-green-700'
                            : 'bg-blue-600 hover:bg-blue-700'
                        }`}
                >
                    {isProcessing ? (
                        <div className="flex items-center justify-center">
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                            {operation === 'encrypt' ? 'Encrypting...' : 'Decrypting...'}
                        </div>
                    ) : (
                        <>
                            {operation === 'encrypt' ? '🔒 Encrypt File' : '🔓 Decrypt File'}
                        </>
                    )}
                </button>

                {operation === 'decrypt' && (
                    <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-start">
                            <div className="text-blue-600 text-lg mr-2">🔍</div>
                            <div className="text-sm text-blue-700">
                                <strong>Password Verification:</strong> The system will validate your password during decryption.
                                If the password is incorrect, decryption will fail with a clear error message.
                            </div>
                        </div>
                    </div>
                )}

                {operation === 'encrypt' && (
                    <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="flex items-start">
                            <div className="text-yellow-600 text-lg mr-2">⚠️</div>
                            <div className="text-sm text-yellow-700">
                                <strong>Important:</strong> Keep your password safe! The encryption system uses AES-GCM
                                for authenticated encryption, ensuring only the correct password can decrypt the file.
                                Store it in a secure password manager.
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Jobs History */}
            {jobs.length > 0 && (
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-medium text-gray-900">📋 Encryption Jobs</h3>
                        <button
                            onClick={clearCompletedJobs}
                            className="text-sm text-red-600 hover:text-red-800"
                        >
                            Clear Completed
                        </button>
                    </div>

                    <div className="space-y-3">
                        {jobs.slice(0, 10).map((job) => (
                            <div key={job.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div className="flex-1">
                                    <div className="flex items-center">
                                        <span className="text-lg mr-2">
                                            {job.operation === 'encrypt' ? '🔒' : '🔓'}
                                        </span>
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">{job.fileName}</p>
                                            <p className="text-xs text-gray-500">
                                                {new Date(job.timestamp).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(job.status)}`}>
                                        {job.status}
                                    </span>

                                    {job.status === 'completed' && job.outputPath && (
                                        <a
                                            href={job.outputPath}
                                            download
                                            className="ml-2 text-blue-600 hover:text-blue-800 text-sm"
                                        >
                                            📥 Download
                                        </a>
                                    )}

                                    {job.status === 'failed' && job.error && (
                                        <span className="ml-2 text-xs text-red-600" title={job.error}>
                                            ❌
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Debug Component */}
            <EncryptionDebugger />

            {/* Critical Password Validation Test */}
            <PasswordValidationTest />
        </div>
    );
};

export default FileEncryptor;