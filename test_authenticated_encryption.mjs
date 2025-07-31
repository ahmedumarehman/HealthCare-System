// Test authenticated encryption security
// This test should PASS: wrong passwords should ALWAYS fail

import { authenticatedCrypto } from '../src/services/encryptionService.js';

// Mock Web Crypto API for Node.js environment
import { webcrypto } from 'crypto';
Object.defineProperty(globalThis, 'crypto', {
    value: webcrypto,
});

// Mock TextEncoder/TextDecoder
import { TextEncoder, TextDecoder } from 'util';
Object.defineProperty(globalThis, 'TextEncoder', {
    value: TextEncoder,
});
Object.defineProperty(globalThis, 'TextDecoder', {
    value: TextDecoder,
});

// Mock btoa/atob for base64 encoding
Object.defineProperty(globalThis, 'btoa', {
    value: (str) => Buffer.from(str, 'binary').toString('base64'),
});
Object.defineProperty(globalThis, 'atob', {
    value: (str) => Buffer.from(str, 'base64').toString('binary'),
});

async function testAuthenticatedEncryption() {
    console.log('🧪 Testing Authenticated Encryption (AES-GCM) Security...\n');

    const testData = "This is super secret medical data that should NEVER decrypt with wrong passwords!";
    const correctPassword = "mySecurePassword123!";
    const wrongPasswords = [
        "wrongPassword",
        "mySecurePassword123",  // Missing !
        "mySecurePassword123!!", // Extra !
        "",
        "123",
        "completely different",
        "MySecurePassword123!", // Wrong case
        " mySecurePassword123!", // Extra space
        "mySecurePassword123! " // Extra space at end
    ];

    try {
        // Test encryption with correct password
        console.log('🔒 Encrypting data with correct password...');
        const encrypted = await authenticatedCrypto.encrypt(testData, correctPassword);
        console.log('✅ Encryption successful');
        console.log(`📊 Encrypted data length: ${encrypted.encrypted.length}`);
        console.log(`🧂 Salt: ${encrypted.salt.substring(0, 20)}...`);
        console.log(`🔑 IV: ${encrypted.iv.substring(0, 20)}...\n`);

        // Test decryption with CORRECT password
        console.log('🔓 Testing decryption with CORRECT password...');
        try {
            const decrypted = await authenticatedCrypto.decrypt(
                encrypted.encrypted,
                correctPassword,
                encrypted.salt,
                encrypted.iv
            );

            if (decrypted === testData) {
                console.log('✅ CORRECT PASSWORD: Decryption successful and data matches!');
            } else {
                console.log('❌ CORRECT PASSWORD: Decryption successful but data doesn\'t match!');
                console.log(`Expected: "${testData}"`);
                console.log(`Got: "${decrypted}"`);
            }
        } catch (error) {
            console.log('❌ CORRECT PASSWORD: Unexpected decryption failure!');
            console.log('Error:', error.message);
        }

        console.log('\n' + '='.repeat(80));
        console.log('🚨 CRITICAL SECURITY TEST: Testing with WRONG passwords...');
        console.log('   (All of these should FAIL with authentication errors)');
        console.log('='.repeat(80) + '\n');

        let allWrongPasswordsFailed = true;
        let testCount = 0;

        // Test decryption with WRONG passwords
        for (const wrongPassword of wrongPasswords) {
            testCount++;
            console.log(`🔓 Test ${testCount}: Trying wrong password: "${wrongPassword}"`);

            try {
                const result = await authenticatedCrypto.decrypt(
                    encrypted.encrypted,
                    wrongPassword,
                    encrypted.salt,
                    encrypted.iv
                );

                // THIS SHOULD NEVER HAPPEN!
                console.log('🚨🚨🚨 CRITICAL SECURITY BUG: Wrong password succeeded!');
                console.log(`🚨 Decrypted result: "${result}"`);
                console.log('🚨 This is a MAJOR security vulnerability!');
                allWrongPasswordsFailed = false;
            } catch (error) {
                // This is the expected behavior
                console.log(`✅ SECURITY OK: Wrong password correctly failed with: ${error.message}`);
            }
            console.log('');
        }

        console.log('='.repeat(80));
        if (allWrongPasswordsFailed) {
            console.log('🎉 ALL SECURITY TESTS PASSED!');
            console.log('✅ Authenticated encryption is working correctly');
            console.log('✅ Wrong passwords ALWAYS fail (like Python Fernet)');
            console.log('✅ Only correct password succeeds');
        } else {
            console.log('🚨 SECURITY VULNERABILITY DETECTED!');
            console.log('❌ Some wrong passwords were accepted');
            console.log('❌ This is a critical security flaw');
        }
        console.log('='.repeat(80));

    } catch (error) {
        console.log('❌ Test failed with error:', error);
    }
}

// Run the test
testAuthenticatedEncryption().catch(console.error);
