#!/usr/bin/env node

/**
 * Final verification script for the password "00000" vs "0" vulnerability
 * This script tests the exact issue reported by the user
 */

const { encryptionService } = require('./src/services/encryptionService');

async function finalPasswordTest() {
    console.log('🔒 FINAL PASSWORD VULNERABILITY TEST');
    console.log('=====================================');
    console.log('Testing the specific issue: password "00000" vs "0"');
    console.log('Expected: These should NEVER be interchangeable\n');

    const testData = 'CRITICAL PATIENT DATA - Must be protected with exact password matching';
    let testsPassed = 0;
    let totalTests = 0;

    // Test 1: Encrypt with "00000", try to decrypt with "0"
    console.log('📝 Test 1: Encrypt with "00000", attempt decrypt with "0"');
    totalTests++;
    try {
        const result1 = await encryptionService.encryptData(testData, '00000');
        console.log('  ✅ Encryption with "00000" successful');

        try {
            const decrypted = await encryptionService.decryptData(result1.encrypted, '0', result1.salt);
            console.log('  🚨 CRITICAL SECURITY BUG: Wrong password "0" was accepted!');
            console.log('  ❌ Decrypted data:', decrypted);
            console.log('  ❌ TEST FAILED - VULNERABILITY EXISTS');
        } catch (error) {
            console.log('  ✅ CORRECT: Wrong password "0" was rejected');
            console.log('  ✅ Error:', error.message);
            testsPassed++;
        }
    } catch (error) {
        console.log('  ❌ Encryption setup failed:', error.message);
    }

    // Test 2: Encrypt with "0", try to decrypt with "00000"
    console.log('\n📝 Test 2: Encrypt with "0", attempt decrypt with "00000"');
    totalTests++;
    try {
        const result2 = await encryptionService.encryptData(testData, '0');
        console.log('  ✅ Encryption with "0" successful');

        try {
            const decrypted = await encryptionService.decryptData(result2.encrypted, '00000', result2.salt);
            console.log('  🚨 CRITICAL SECURITY BUG: Wrong password "00000" was accepted!');
            console.log('  ❌ Decrypted data:', decrypted);
            console.log('  ❌ TEST FAILED - VULNERABILITY EXISTS');
        } catch (error) {
            console.log('  ✅ CORRECT: Wrong password "00000" was rejected');
            console.log('  ✅ Error:', error.message);
            testsPassed++;
        }
    } catch (error) {
        console.log('  ❌ Encryption setup failed:', error.message);
    }

    // Test 3: Verify correct passwords still work
    console.log('\n📝 Test 3: Verify correct passwords still work');
    totalTests += 2;

    try {
        const result3a = await encryptionService.encryptData(testData, '00000');
        const decrypted3a = await encryptionService.decryptData(result3a.encrypted, '00000', result3a.salt);

        if (decrypted3a === testData) {
            console.log('  ✅ Correct password "00000" works perfectly');
            testsPassed++;
        } else {
            console.log('  ❌ Correct password "00000" failed data integrity check');
        }
    } catch (error) {
        console.log('  ❌ Correct password "00000" test failed:', error.message);
    }

    try {
        const result3b = await encryptionService.encryptData(testData, '0');
        const decrypted3b = await encryptionService.decryptData(result3b.encrypted, '0', result3b.salt);

        if (decrypted3b === testData) {
            console.log('  ✅ Correct password "0" works perfectly');
            testsPassed++;
        } else {
            console.log('  ❌ Correct password "0" failed data integrity check');
        }
    } catch (error) {
        console.log('  ❌ Correct password "0" test failed:', error.message);
    }

    // Final results
    console.log('\n' + '='.repeat(50));
    console.log(`FINAL RESULTS: ${testsPassed}/${totalTests} tests passed`);

    if (testsPassed === totalTests) {
        console.log('🎉 ALL TESTS PASSED - PASSWORD VALIDATION IS SECURE');
        console.log('✅ The "00000" vs "0" vulnerability has been FIXED');
        console.log('✅ Wrong passwords are properly rejected');
        console.log('✅ Correct passwords work as expected');
        return true;
    } else {
        console.log('🚨 SECURITY VULNERABILITY STILL EXISTS');
        console.log('❌ Wrong passwords are being accepted - CRITICAL ISSUE');
        console.log('❌ IMMEDIATE ATTENTION REQUIRED');
        return false;
    }
}

// Run the test
if (require.main === module) {
    finalPasswordTest().then(success => {
        process.exit(success ? 0 : 1);
    }).catch(error => {
        console.error('Test execution failed:', error);
        process.exit(1);
    });
}

module.exports = { finalPasswordTest };
