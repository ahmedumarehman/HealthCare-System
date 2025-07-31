/**
 * Quick verification script for the password validation fix
 * Run this to verify that passwords like "00000" and "0" are never interchangeable
 */

import { encryptionService } from '../services/encryptionService';

async function quickPasswordCheck() {
    console.log('🔒 QUICK PASSWORD VALIDATION CHECK');
    console.log('='.repeat(40));

    const testData = 'Secret patient data';
    let allTestsPassed = true;

    // Test 1: "00000" vs "0"
    console.log('\n🧪 Test 1: "00000" vs "0"');
    try {
        const result1 = await encryptionService.encryptData(testData, '00000');
        console.log('✅ Encrypted with "00000"');

        try {
            await encryptionService.decryptData(result1.encrypted, '0', result1.salt, result1.iv);
            console.log('🚨 CRITICAL BUG: "0" was accepted for "00000"!');
            allTestsPassed = false;
        } catch (error) {
            console.log('✅ CORRECT: "0" was rejected for "00000"');
        }
    } catch (error) {
        console.log('❌ Test setup failed:', error);
        allTestsPassed = false;
    }

    // Test 2: "0" vs "00000"
    console.log('\n🧪 Test 2: "0" vs "00000"');
    try {
        const result2 = await encryptionService.encryptData(testData, '0');
        console.log('✅ Encrypted with "0"');

        try {
            await encryptionService.decryptData(result2.encrypted, '00000', result2.salt, result2.iv);
            console.log('🚨 CRITICAL BUG: "00000" was accepted for "0"!');
            allTestsPassed = false;
        } catch (error) {
            console.log('✅ CORRECT: "00000" was rejected for "0"');
        }
    } catch (error) {
        console.log('❌ Test setup failed:', error);
        allTestsPassed = false;
    }

    // Test 3: Verify correct passwords still work
    console.log('\n🧪 Test 3: Verify correct passwords work');
    try {
        const result3 = await encryptionService.encryptData(testData, 'correct123');
        const decrypted = await encryptionService.decryptData(result3.encrypted, 'correct123', result3.salt, result3.iv);

        if (decrypted === testData) {
            console.log('✅ Correct password authentication works');
        } else {
            console.log('❌ Correct password failed');
            allTestsPassed = false;
        }
    } catch (error) {
        console.log('❌ Correct password test failed:', error);
        allTestsPassed = false;
    }

    console.log('\n' + '='.repeat(40));
    if (allTestsPassed) {
        console.log('🎉 ALL TESTS PASSED - PASSWORD VALIDATION IS SECURE');
        return true;
    } else {
        console.log('🚨 SECURITY ISSUE DETECTED - NEEDS IMMEDIATE ATTENTION');
        return false;
    }
}

// Export for use in other modules
export { quickPasswordCheck };

// For direct execution
if (require.main === module) {
    quickPasswordCheck().then(result => {
        process.exit(result ? 0 : 1);
    });
}
