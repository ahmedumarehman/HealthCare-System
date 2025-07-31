/**
 * COMPREHENSIVE PASSWORD VALIDATION TEST
 * This tests the exact "00000" vs "0" issue step by step
 */

// Import the encryption service using ES modules syntax for Node.js
import { encryptionService } from './src/services/encryptionService.js';

async function comprehensivePasswordTest() {
    console.log('🔒 COMPREHENSIVE PASSWORD VALIDATION TEST');
    console.log('==========================================');
    console.log('Testing the reported issue: "00000" vs "0" passwords\n');

    const testData = 'This is sensitive patient data that must remain secure';
    const password1 = '00000';
    const password2 = '0';

    console.log(`Test data: "${testData}"`);
    console.log(`Password 1: "${password1}" (length: ${password1.length})`);
    console.log(`Password 2: "${password2}" (length: ${password2.length})`);
    console.log('');

    try {
        // Test 1: Encrypt with "00000"
        console.log('🔐 Step 1: Encrypting with password "00000"...');
        const encryptionResult = await encryptionService.encryptData(testData, password1);
        console.log('✅ Encryption completed successfully');
        console.log(`Salt: ${encryptionResult.salt}`);
        console.log(`Encrypted data length: ${encryptionResult.encrypted.length}`);
        console.log('');

        // Test 2: Try to decrypt with correct password "00000"
        console.log('🔓 Step 2: Attempting decryption with CORRECT password "00000"...');
        try {
            const correctDecryption = await encryptionService.decryptData(
                encryptionResult.encrypted,
                password1,
                encryptionResult.salt
            );

            if (correctDecryption === testData) {
                console.log('✅ SUCCESS: Correct password works perfectly');
                console.log('✅ Data integrity verified');
            } else {
                console.log('❌ ERROR: Correct password produced wrong data');
                console.log(`Expected: "${testData}"`);
                console.log(`Got: "${correctDecryption}"`);
                return false;
            }
        } catch (error) {
            console.log('❌ CRITICAL ERROR: Correct password was rejected!');
            console.log(`Error: ${error.message}`);
            return false;
        }
        console.log('');

        // Test 3: Try to decrypt with WRONG password "0"
        console.log('🔓 Step 3: Attempting decryption with WRONG password "0"...');
        console.log('⚠️  EXPECTED RESULT: This should FAIL and throw an error');

        try {
            const wrongDecryption = await encryptionService.decryptData(
                encryptionResult.encrypted,
                password2,
                encryptionResult.salt
            );

            // If we reach this point, the wrong password was accepted - BIG PROBLEM!
            console.log('🚨🚨🚨 CRITICAL SECURITY VULNERABILITY DETECTED! 🚨🚨🚨');
            console.log('❌ Wrong password "0" was INCORRECTLY ACCEPTED for data encrypted with "00000"');
            console.log(`❌ Decrypted data: "${wrongDecryption}"`);
            console.log('❌ This is a MAJOR SECURITY FLAW that allows unauthorized access!');
            console.log('❌ IMMEDIATE SECURITY PATCH REQUIRED!');
            return false;

        } catch (error) {
            console.log('✅ EXCELLENT: Wrong password "0" was properly rejected');
            console.log(`✅ Rejection reason: ${error.message}`);
            console.log('✅ Security validation working correctly');
        }
        console.log('');

        // Test 4: Reverse test - Encrypt with "0", try decrypt with "00000"
        console.log('🔐 Step 4: Reverse test - Encrypting with password "0"...');
        const reverseEncryption = await encryptionService.encryptData(testData, password2);
        console.log('✅ Encryption with "0" completed');

        console.log('🔓 Step 5: Attempting decryption with WRONG password "00000"...');
        try {
            const reverseWrongDecryption = await encryptionService.decryptData(
                reverseEncryption.encrypted,
                password1,
                reverseEncryption.salt
            );

            console.log('🚨🚨🚨 CRITICAL SECURITY VULNERABILITY DETECTED! 🚨🚨🚨');
            console.log('❌ Wrong password "00000" was INCORRECTLY ACCEPTED for data encrypted with "0"');
            console.log(`❌ Decrypted data: "${reverseWrongDecryption}"`);
            console.log('❌ BIDIRECTIONAL VULNERABILITY CONFIRMED!');
            return false;

        } catch (error) {
            console.log('✅ EXCELLENT: Wrong password "00000" was properly rejected');
            console.log(`✅ Rejection reason: ${error.message}`);
        }

        console.log('\n' + '='.repeat(60));
        console.log('🎉 ALL SECURITY TESTS PASSED! 🎉');
        console.log('✅ Password validation system is working correctly');
        console.log('✅ Wrong passwords are properly rejected');
        console.log('✅ The "00000" vs "0" vulnerability has been FIXED');
        console.log('✅ System is secure against password substitution attacks');
        return true;

    } catch (error) {
        console.log('❌ Test execution failed:', error.message);
        console.log('❌ Unable to complete security validation');
        return false;
    }
}

// Run the comprehensive test
comprehensivePasswordTest().then(success => {
    if (success) {
        console.log('\n🔒 SECURITY STATUS: SECURE ✅');
        process.exit(0);
    } else {
        console.log('\n🚨 SECURITY STATUS: VULNERABLE ❌');
        console.log('IMMEDIATE ACTION REQUIRED TO FIX SECURITY FLAW');
        process.exit(1);
    }
}).catch(error => {
    console.error('Test framework error:', error);
    process.exit(1);
});
