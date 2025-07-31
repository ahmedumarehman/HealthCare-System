import React, { useState } from 'react';
import { encryptionService } from '../../services/encryptionService';

const EncryptionDebugger: React.FC = () => {
    const [debugResults, setDebugResults] = useState<string[]>([]);
    const [isRunning, setIsRunning] = useState(false);

    const log = (message: string) => {
        console.log(message);
        setDebugResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
    };

    const runComprehensiveTest = async () => {
        setIsRunning(true);
        setDebugResults([]);

        try {
            log('🧪 Starting ULTRA-STRICT password validation test...');

            // Test 1: Basic encryption/decryption
            log('📝 Test 1: Basic encryption/decryption');
            const testData = 'Critical healthcare data that MUST be protected';
            const correctPassword = 'TestPassword123!';

            const { encrypted, salt, iv } = await encryptionService.encryptData(testData, correctPassword);
            log(`✅ Encryption successful. Salt: ${salt.substring(0, 10)}...`);

            // Test correct password
            const decrypted = await encryptionService.decryptData(encrypted, correctPassword, salt, iv);
            if (decrypted === testData) {
                log('✅ Correct password decryption: PASSED');
            } else {
                log('❌ Correct password decryption: FAILED - Data mismatch');
                return;
            }

            // Test 2: Multiple wrong passwords (CRITICAL TEST)
            log('📝 Test 2: STRICT wrong password rejection (CRITICAL)');
            const wrongPasswords = [
                'WrongPassword456!',
                'TestPassword123@',   // Very similar
                'testpassword123!',   // Case different  
                'TestPassword123',    // Missing character
                'TestPassword123!!',  // Extra character
                '',                   // Empty
                ' TestPassword123!',  // Leading space
                'TestPassword123! ',  // Trailing space
                'TestPassword124!',   // One digit different
                'TestPassword1234!',  // Extra digit
            ];

            let allRejected = true;
            let rejectedCount = 0;

            for (let i = 0; i < wrongPasswords.length; i++) {
                const wrongPassword = wrongPasswords[i];
                log(`🔍 Testing wrong password ${i + 1}: "${wrongPassword}"`);

                try {
                    const wrongResult = await encryptionService.decryptData(encrypted, wrongPassword, salt, iv);
                    log(`🚨 CRITICAL SECURITY ISSUE: Wrong password "${wrongPassword}" was ACCEPTED!`);
                    log(`Decrypted result: "${wrongResult}"`);
                    allRejected = false;
                } catch (error) {
                    if (error instanceof Error && error.message.includes('Invalid password')) {
                        log(`✅ Wrong password "${wrongPassword}" properly rejected`);
                        rejectedCount++;
                    } else {
                        log(`❌ Wrong password "${wrongPassword}" failed with unexpected error: ${error}`);
                    }
                }
            }

            log(`📊 Wrong password test results: ${rejectedCount}/${wrongPasswords.length} rejected`);

            if (allRejected) {
                log('✅ ALL WRONG PASSWORDS REJECTED - SECURITY PASSED');
            } else {
                log('🚨 SECURITY FAILURE - SOME WRONG PASSWORDS ACCEPTED');
                return;
            }

            log('🎉 All security tests completed successfully!');

        } catch (error) {
            log(`❌ Test failed with error: ${error}`);
        } finally {
            setIsRunning(false);
        }
    };

    const clearLogs = () => {
        setDebugResults([]);
    };

    return (
        <div className="space-y-6 p-6 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900">🔍 Ultra-Strict Encryption Debugger</h3>
                <div className="space-x-2">
                    <button
                        onClick={runComprehensiveTest}
                        disabled={isRunning}
                        className={`px-4 py-2 text-sm rounded-lg font-medium ${isRunning
                            ? 'bg-gray-400 text-gray-700 cursor-not-allowed'
                            : 'bg-red-600 text-white hover:bg-red-700'
                            }`}
                    >
                        {isRunning ? '⏳ Running Security Tests...' : '🔒 Run STRICT Security Test'}
                    </button>
                    <button
                        onClick={clearLogs}
                        className="px-4 py-2 text-sm rounded-lg font-medium bg-gray-600 text-white hover:bg-gray-700"
                    >
                        🗑️ Clear Logs
                    </button>
                </div>
            </div>

            <div className="bg-black text-green-400 p-4 rounded-lg font-mono text-sm max-h-96 overflow-y-auto">
                {debugResults.length === 0 ? (
                    <div className="text-gray-500">Click "Run STRICT Security Test" to test password validation...</div>
                ) : (
                    debugResults.map((result, index) => (
                        <div key={index} className={`mb-1 ${result.includes('🚨') ? 'text-red-400 font-bold' :
                            result.includes('✅') ? 'text-green-400' :
                                result.includes('❌') ? 'text-red-400' :
                                    result.includes('📝') ? 'text-blue-400 font-bold' :
                                        'text-gray-300'
                            }`}>
                            {result}
                        </div>
                    ))
                )}
            </div>

            {debugResults.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h4 className="font-bold text-yellow-800 mb-2">🔍 Security Test Summary</h4>
                    <p className="text-yellow-700 text-sm">
                        Look for <span className="font-bold text-red-600">🚨 CRITICAL SECURITY ISSUE</span> messages.
                        If any appear, wrong passwords are being accepted (major vulnerability).
                        All tests should show <span className="font-bold text-green-600">✅ rejected</span> for wrong passwords.
                    </p>
                </div>
            )}
        </div>
    );
};

export default EncryptionDebugger;