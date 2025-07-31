import React, { useState } from 'react';
import { encryptionService } from '../../services/encryptionService';

interface PasswordValidationTestProps {
    className?: string;
}

const PasswordValidationTest: React.FC<PasswordValidationTestProps> = ({ className = '' }) => {
    const [testResults, setTestResults] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [customPassword1, setCustomPassword1] = useState('00000');
    const [customPassword2, setCustomPassword2] = useState('0');

    const addResult = (message: string) => {
        setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
    };

    const runSpecificTest = async () => {
        setIsLoading(true);
        setTestResults([]);

        addResult('🚨 Starting CRITICAL password validation test...');
        addResult(`Testing password "${customPassword1}" vs "${customPassword2}"`);

        try {
            const testData = 'This is sensitive patient data that must be protected.';

            // Test 1: Encrypt with first password, try to decrypt with second
            addResult(`📝 Encrypting with password: "${customPassword1}"`);
            const result1 = await encryptionService.encryptData(testData, customPassword1);
            addResult('✅ Encryption successful');

            addResult(`🔓 Attempting decryption with WRONG password: "${customPassword2}"`);
            try {
                const decrypted1 = await encryptionService.decryptData(result1.encrypted, customPassword2, result1.salt, result1.iv);
                addResult('🚨🚨🚨 CRITICAL SECURITY BUG: Wrong password was accepted!');
                addResult(`❌ Decrypted data: ${decrypted1}`);
                addResult('❌ TEST FAILED - IMMEDIATE SECURITY PATCH REQUIRED');
            } catch (error) {
                addResult('✅ CORRECT: Wrong password was rejected');
                addResult(`✅ Error: ${error instanceof Error ? error.message : String(error)}`);
            }

            // Test 2: Verify correct password still works
            addResult(`🔓 Verifying correct password: "${customPassword1}"`);
            try {
                const decrypted2 = await encryptionService.decryptData(result1.encrypted, customPassword1, result1.salt, result1.iv);
                addResult('✅ Correct password works as expected');
                addResult(`✅ Data verified: ${decrypted2.substring(0, 30)}...`);
            } catch (error) {
                addResult('❌ BUG: Correct password was rejected!');
                addResult(`❌ Error: ${error instanceof Error ? error.message : String(error)}`);
            }

            // Test 3: Reverse test
            addResult(`📝 Reverse test - Encrypting with: "${customPassword2}"`);
            const result2 = await encryptionService.encryptData(testData, customPassword2);

            addResult(`🔓 Attempting decryption with WRONG password: "${customPassword1}"`);
            try {
                const decrypted3 = await encryptionService.decryptData(result2.encrypted, customPassword1, result2.salt, result2.iv);
                addResult('🚨🚨🚨 CRITICAL SECURITY BUG: Wrong password was accepted!');
                addResult(`❌ Decrypted data: ${decrypted3}`);
                addResult('❌ TEST FAILED - IMMEDIATE SECURITY PATCH REQUIRED');
            } catch (error) {
                addResult('✅ CORRECT: Wrong password was rejected');
                addResult(`✅ Error: ${error instanceof Error ? error.message : String(error)}`);
            }

            addResult('🎉 PASSWORD VALIDATION TEST COMPLETED');

        } catch (error) {
            addResult(`❌ Test execution failed: ${error instanceof Error ? error.message : String(error)}`);
        }

        setIsLoading(false);
    };

    const runEdgeCaseTests = async () => {
        setIsLoading(true);
        setTestResults([]);

        addResult('🔍 Running edge case password tests...');

        const testCases = [
            { correct: '00000', wrong: '0' },
            { correct: '0', wrong: '00000' },
            { correct: 'password', wrong: 'Password' },
            { correct: '12345', wrong: '123456' },
            { correct: 'admin', wrong: 'admi' },
            { correct: 'test123', wrong: 'test124' },
            { correct: 'a', wrong: 'aa' },
            { correct: '', wrong: ' ' }
        ];

        let allPassed = true;

        for (const testCase of testCases) {
            addResult(`\n🧪 Testing: "${testCase.correct}" vs "${testCase.wrong}"`);

            try {
                const result = await encryptionService.encryptData('test data', testCase.correct);

                try {
                    await encryptionService.decryptData(result.encrypted, testCase.wrong, result.salt, result.iv);
                    addResult(`🚨 SECURITY BUG: Wrong password "${testCase.wrong}" was accepted for "${testCase.correct}"!`);
                    allPassed = false;
                } catch (error) {
                    addResult(`✅ Correct: Wrong password "${testCase.wrong}" was rejected`);
                }
            } catch (error) {
                addResult(`❌ Test setup failed: ${error instanceof Error ? error.message : String(error)}`);
            }
        }

        if (allPassed) {
            addResult('\n🎉 ALL EDGE CASE TESTS PASSED - SYSTEM IS SECURE');
        } else {
            addResult('\n🚨 SECURITY VULNERABILITIES DETECTED');
        }

        setIsLoading(false);
    };

    return (
        <div className={`space-y-6 ${className}`}>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">🔒 Password Validation Security Test</h2>
                <p className="text-gray-600 mb-6">
                    This component tests for the critical security vulnerability where similar passwords
                    (like "00000" vs "0") might be incorrectly accepted during decryption.
                </p>

                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Password 1 (for encryption)
                            </label>
                            <input
                                type="text"
                                value={customPassword1}
                                onChange={(e) => setCustomPassword1(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Enter first password"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Password 2 (wrong password test)
                            </label>
                            <input
                                type="text"
                                value={customPassword2}
                                onChange={(e) => setCustomPassword2(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Enter second password"
                            />
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={runSpecificTest}
                            disabled={isLoading}
                            className={`px-4 py-2 rounded-lg font-medium ${isLoading
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                : 'bg-red-600 text-white hover:bg-red-700'
                                }`}
                        >
                            {isLoading ? '🔄 Testing...' : '🚨 Run Critical Test'}
                        </button>

                        <button
                            onClick={runEdgeCaseTests}
                            disabled={isLoading}
                            className={`px-4 py-2 rounded-lg font-medium ${isLoading
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                : 'bg-blue-600 text-white hover:bg-blue-700'
                                }`}
                        >
                            {isLoading ? '🔄 Testing...' : '🔍 Run Edge Case Tests'}
                        </button>

                        <button
                            onClick={() => setTestResults([])}
                            disabled={isLoading}
                            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                        >
                            🗑️ Clear Results
                        </button>
                    </div>
                </div>
            </div>

            {testResults.length > 0 && (
                <div className="bg-gray-900 rounded-lg p-6">
                    <h3 className="text-lg font-bold text-white mb-4">🔍 Test Results</h3>
                    <div className="space-y-1 max-h-96 overflow-y-auto">
                        {testResults.map((result, index) => (
                            <div
                                key={index}
                                className={`text-sm font-mono p-2 rounded ${result.includes('🚨') || result.includes('❌')
                                    ? 'bg-red-900 text-red-200'
                                    : result.includes('✅') || result.includes('🎉')
                                        ? 'bg-green-900 text-green-200'
                                        : result.includes('🔄') || result.includes('🧪')
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

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-semibold text-yellow-800 mb-2">⚠️ What This Test Does:</h4>
                <ul className="text-yellow-700 text-sm space-y-1">
                    <li>• Encrypts data with one password (e.g., "00000")</li>
                    <li>• Attempts to decrypt with a different password (e.g., "0")</li>
                    <li>• Verifies that wrong passwords are always rejected</li>
                    <li>• Tests multiple edge cases and similar passwords</li>
                    <li>• Confirms that correct passwords still work</li>
                </ul>
                <p className="text-yellow-700 text-sm mt-2 font-medium">
                    If any wrong password is accepted, it indicates a critical security vulnerability.
                </p>
            </div>
        </div>
    );
};

export default PasswordValidationTest;
