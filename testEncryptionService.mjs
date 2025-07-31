// Test the actual encryptionService.ts implementation
import { encryptionService } from './src/services/encryptionService.js';

async function testEncryptionService() {
    console.log('🧪 Testing EncryptionService with "00000" vs "0" passwords');
    console.log('==========================================================');

    const testData = "Critical healthcare data - if you can read this with wrong password, there's a vulnerability";
    const password1 = "00000"; // 5 zeros
    const password2 = "0";     // 1 zero

    console.log(`\n📋 Test Setup:`);
    console.log(`Password 1: "${password1}" (length: ${password1.length})`);
    console.log(`Password 2: "${password2}" (length: ${password2.length})`);
    console.log(`Test data: "${testData}"`);

    try {
        // Step 1: Encrypt with password1
        console.log('\n🔒 Step 1: Encrypting with password1 ("00000")');
        const { encrypted, salt, verificationToken } = await encryptionService.encryptData(testData, password1);
        console.log(`✅ Encryption successful`);
        console.log(`Salt: ${salt}`);
        console.log(`Verification token: ${verificationToken.substring(0, 20)}...`);
        console.log(`Encrypted data: ${encrypted.substring(0, 50)}...`);

        // Step 2: Try to decrypt with correct password
        console.log('\n🔓 Step 2: Decrypting with correct password ("00000")');
        try {
            const decrypted1 = await encryptionService.decryptData(encrypted, password1, salt);
            console.log(`✅ Correct password decryption: SUCCESS`);
            console.log(`Decrypted data: "${decrypted1}"`);
            console.log(`Data matches original: ${decrypted1 === testData}`);
        } catch (error) {
            console.log(`❌ Correct password decryption FAILED: ${error.message}`);
            return false;
        }

        // Step 3: Try to decrypt with wrong password - THIS IS THE CRITICAL TEST
        console.log('\n🔍 Step 3: Attempting decryption with wrong password ("0")');
        console.log('🚨 This should FAIL - if it succeeds, we have a vulnerability!');

        try {
            const decrypted2 = await encryptionService.decryptData(encrypted, password2, salt);

            // If we get here without an error, that's a MAJOR security issue
            console.log('🚨🚨🚨 CRITICAL SECURITY VULNERABILITY DETECTED! 🚨🚨🚨');
            console.log(`Wrong password "${password2}" successfully decrypted the data!`);
            console.log(`Decrypted result: "${decrypted2}"`);
            console.log(`Data matches original: ${decrypted2 === testData}`);

            if (decrypted2 === testData) {
                console.log('🚨 COMPLETE VULNERABILITY: Wrong password produced identical result!');
            } else {
                console.log('⚠️  Wrong password produced different result, but still succeeded when it should have failed');
            }

            return false;

        } catch (error) {
            console.log(`✅ Wrong password correctly rejected: ${error.message}`);
            console.log('✅ This is the expected behavior - wrong passwords should always be rejected');
            return true;
        }

    } catch (error) {
        console.error('❌ Test setup failed:', error);
        return false;
    }
}

// Test additional variations
async function testAdditionalPasswordVariations() {
    console.log('\n\n🧪 Testing Additional Password Variations');
    console.log('=========================================');

    const testData = "Test data for additional variations";
    const passwordPairs = [
        ['0', '00'],
        ['1', '01'],
        ['password', 'Password'],
        ['123', '0123'],
        ['', ' '], // empty vs space
    ];

    for (const [pwd1, pwd2] of passwordPairs) {
        console.log(`\n🔍 Testing: "${pwd1}" vs "${pwd2}"`);

        try {
            // Encrypt with first password
            const { encrypted, salt } = await encryptionService.encryptData(testData, pwd1);

            // Try to decrypt with second password
            try {
                const decrypted = await encryptionService.decryptData(encrypted, pwd2, salt);
                console.log(`🚨 VULNERABILITY: "${pwd2}" successfully decrypted data encrypted with "${pwd1}"`);
                console.log(`Result: "${decrypted}"`);
            } catch (error) {
                console.log(`✅ "${pwd2}" correctly rejected when trying to decrypt data encrypted with "${pwd1}"`);
            }

        } catch (error) {
            console.log(`⚠️  Test skipped due to encryption error: ${error.message}`);
        }
    }
}

// Run the comprehensive test
async function runComprehensiveTest() {
    console.log('🚀 Starting Comprehensive EncryptionService Security Test');
    console.log('=========================================================');

    try {
        const mainTestPassed = await testEncryptionService();
        await testAdditionalPasswordVariations();

        console.log('\n\n📊 FINAL TEST RESULTS');
        console.log('====================');

        if (mainTestPassed) {
            console.log('✅ SECURITY TEST PASSED: EncryptionService correctly rejects wrong passwords');
            console.log('✅ No "00000" vs "0" vulnerability detected in the EncryptionService');
            console.log('💡 If users are experiencing this issue, it may be in the UI layer or a different code path');
        } else {
            console.log('🚨 SECURITY TEST FAILED: Critical vulnerability detected in EncryptionService');
            console.log('🚨 The "00000" vs "0" password issue EXISTS and needs immediate fixing');
        }

    } catch (error) {
        console.error('❌ Test execution failed:', error);
        console.log('🚨 Unable to complete security verification');
    }
}

runComprehensiveTest();
