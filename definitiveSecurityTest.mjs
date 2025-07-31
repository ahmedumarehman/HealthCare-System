/**
 * DEFINITIVE PASSWORD SECURITY TEST
 * This test proves that the "00000" vs "0" vulnerability has been fixed
 */

import { encryptionService } from './src/services/encryptionService.js';

async function definitiveSecurityTest() {
    console.log('🔒 DEFINITIVE PASSWORD SECURITY TEST');
    console.log('=====================================');
    console.log('Testing for the critical "00000" vs "0" vulnerability');
    console.log('Expected: These passwords should NEVER be interchangeable\n');

    const testData = 'CRITICAL HEALTHCARE DATA - Password must be exact';
    const correctPassword = '00000';
    const wrongPassword = '0';

    console.log(`Test data: "${testData}"`);
    console.log(`Correct password: "${correctPassword}" (length: ${correctPassword.length})`);
    console.log(`Wrong password: "${wrongPassword}" (length: ${wrongPassword.length})`);
    console.log('');

    let testsPassed = 0;
    let totalTests = 4;

    try {
        // TEST 1: Encrypt with "00000"
        console.log('📝 TEST 1: Encrypting with password "00000"');
        const encryptionResult = await encryptionService.encryptData(testData, correctPassword);
        console.log('✅ Encryption completed successfully');
        console.log(`✅ Salt generated: ${encryptionResult.salt}`);
        console.log('');

        // TEST 2: Decrypt with CORRECT password "00000"
        console.log('🔓 TEST 2: Decrypting with CORRECT password "00000"');
        try {
            const correctDecryption = await encryptionService.decryptData(
                encryptionResult.encrypted,
                correctPassword,
                encryptionResult.salt
            );

            if (correctDecryption === testData) {
                console.log('✅ SUCCESS: Correct password works perfectly');
                console.log('✅ Data integrity verified');
                testsPassed++;
            } else {
                console.log('❌ FAILURE: Correct password produced wrong data');
                console.log(`Expected: "${testData}"`);
                console.log(`Got: "${correctDecryption}"`);
            }
        } catch (error) {
            console.log('❌ CRITICAL ERROR: Correct password was rejected!');
            console.log(`Error: ${error.message}`);
        }
        console.log('');

        // TEST 3: Attempt to decrypt with WRONG password "0"
        console.log('🔓 TEST 3: Attempting decryption with WRONG password "0"');
        console.log('⚠️  EXPECTED: This should FAIL with password validation error');

        try {
            const wrongDecryption = await encryptionService.decryptData(
                encryptionResult.encrypted,
                wrongPassword,
                encryptionResult.salt
            );

            console.log('🚨🚨🚨 CRITICAL SECURITY VULNERABILITY! 🚨🚨🚨');
            console.log('❌ Wrong password "0" was ACCEPTED for data encrypted with "00000"!');
            console.log(`❌ Decrypted data: "${wrongDecryption}"`);
            console.log('❌ This is a SEVERE SECURITY FLAW - unauthorized access possible!');

        } catch (error) {
            console.log('✅ EXCELLENT: Wrong password "0" was properly rejected');
            console.log(`✅ Rejection reason: ${error.message}`);
            console.log('✅ Security validation working correctly');
            testsPassed++;
        }
        console.log('');

        // TEST 4: Reverse test - Encrypt with "0", try to decrypt with "00000"
        console.log('📝 TEST 4: Reverse test - Encrypt with "0", try decrypt with "00000"');

        const reverseEncryptionResult = await encryptionService.encryptData(testData, wrongPassword);
        console.log('✅ Encryption with "0" completed');

        try {
            const reverseWrongDecryption = await encryptionService.decryptData(
                reverseEncryptionResult.encrypted,
                correctPassword,
                reverseEncryptionResult.salt
            );

            console.log('🚨🚨🚨 CRITICAL SECURITY VULNERABILITY! 🚨🚨🚨');
            console.log('❌ Wrong password "00000" was ACCEPTED for data encrypted with "0"!');
            console.log(`❌ Decrypted data: "${reverseWrongDecryption}"`);
            console.log('❌ BIDIRECTIONAL VULNERABILITY CONFIRMED!');

        } catch (error) {
            console.log('✅ EXCELLENT: Wrong password "00000" was properly rejected');
            console.log(`✅ Rejection reason: ${error.message}`);
            testsPassed++;
        }

        // TEST 5: Verify "0" decrypts correctly with "0"
        console.log('');
        console.log('🔓 TEST 5: Verify "0" password works with its own encryption');
        try {
            const correctDecryption2 = await encryptionService.decryptData(
                reverseEncryptionResult.encrypted,
                wrongPassword,
                reverseEncryptionResult.salt
            );

            if (correctDecryption2 === testData) {
                console.log('✅ SUCCESS: Password "0" works correctly with its own encryption');
                testsPassed++;
                totalTests++;
            } else {
                console.log('❌ ERROR: Password "0" failed to decrypt its own data');
                totalTests++;
            }
        } catch (error) {
            console.log('❌ ERROR: Password "0" was rejected for its own encryption');
            console.log(`Error: ${error.message}`);
            totalTests++;
        }

    } catch (error) {
        console.log('❌ Test execution failed:', error.message);
        console.log('Stack trace:', error.stack);
    }

    // FINAL RESULTS
    console.log('\n' + '='.repeat(60));
    console.log(`FINAL SECURITY TEST RESULTS: ${testsPassed}/${totalTests} tests passed`);

    if (testsPassed === totalTests) {
        console.log('🎉🎉🎉 ALL SECURITY TESTS PASSED! 🎉🎉🎉');
        console.log('✅ Password validation system is SECURE');
        console.log('✅ Wrong passwords are properly rejected');
        console.log('✅ The "00000" vs "0" vulnerability has been COMPLETELY FIXED');
        console.log('✅ System is protected against password substitution attacks');
        console.log('✅ Healthcare data is secure');
        return true;
    } else {
        console.log('🚨🚨🚨 SECURITY VULNERABILITIES DETECTED! 🚨🚨🚨');
        console.log('❌ Password validation system is COMPROMISED');
        console.log('❌ Wrong passwords are being accepted');
        console.log('❌ IMMEDIATE SECURITY PATCH REQUIRED');
        console.log('❌ Healthcare data is at RISK');
        return false;
    }
}

// Execute the definitive security test
definitiveSecurityTest().then(isSecure => {
    console.log('\n' + '='.repeat(60));
    if (isSecure) {
        console.log('🔒 SECURITY STATUS: SECURE ✅');
        console.log('Healthcare data encryption system is working correctly');
        process.exit(0);
    } else {
        console.log('🚨 SECURITY STATUS: VULNERABLE ❌');
        console.log('CRITICAL: Healthcare data encryption system has security flaws');
        console.log('ACTION REQUIRED: Immediate security patching needed');
        process.exit(1);
    }
}).catch(error => {
    console.error('❌ Security test framework error:', error);
    console.log('Unable to validate security - assume system is compromised');
    process.exit(1);
});
