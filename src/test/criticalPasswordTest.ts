/**
 * CRITICAL PASSWORD VALIDATION TEST
 * Tests for the specific issue where password "00000" can be decrypted with "0"
 */

import { encryptionService } from '../services/encryptionService';

async function criticalPasswordTest() {
    console.log('🚨 CRITICAL PASSWORD VALIDATION TEST');
    console.log('Testing for password "00000" vs "0" vulnerability...\n');

    const testData = 'This is sensitive patient data that must be secure.';

    try {
        // Test 1: Encrypt with "00000", try to decrypt with "0"
        console.log('Test 1: Encrypt with "00000", decrypt with "0"');
        console.log('Expected: SHOULD FAIL (wrong password)');

        const result1 = await encryptionService.encryptData(testData, '00000');
        console.log('✅ Encryption with "00000" successful');

        try {
            const decrypted1 = await encryptionService.decryptData(result1.encrypted, '0', result1.salt, result1.iv);
            console.log('🚨 CRITICAL SECURITY BUG: Wrong password "0" was accepted!');
            console.log('Decrypted data:', decrypted1);
            console.log('❌ TEST FAILED - SECURITY VULNERABILITY CONFIRMED');
            return false;
        } catch (error) {
            console.log('✅ Correct: Wrong password "0" was rejected');
            console.log('Error:', error instanceof Error ? error.message : String(error));
        }

        // Test 2: Encrypt with "0", try to decrypt with "00000"
        console.log('\nTest 2: Encrypt with "0", decrypt with "00000"');
        console.log('Expected: SHOULD FAIL (wrong password)');

        const result2 = await encryptionService.encryptData(testData, '0');
        console.log('✅ Encryption with "0" successful');

        try {
            const decrypted2 = await encryptionService.decryptData(result2.encrypted, '00000', result2.salt, result2.iv);
            console.log('🚨 CRITICAL SECURITY BUG: Wrong password "00000" was accepted!');
            console.log('Decrypted data:', decrypted2);
            console.log('❌ TEST FAILED - SECURITY VULNERABILITY CONFIRMED');
            return false;
        } catch (error) {
            console.log('✅ Correct: Wrong password "00000" was rejected');
            console.log('Error:', error instanceof Error ? error.message : String(error));
        }

        // Test 3: Verify correct passwords still work
        console.log('\nTest 3: Verify correct passwords still work');

        try {
            const decrypted3 = await encryptionService.decryptData(result1.encrypted, '00000', result1.salt, result1.iv);
            console.log('✅ Correct password "00000" works');
            console.log('Decrypted length:', decrypted3.length);
        } catch (error) {
            console.log('🚨 BUG: Correct password was rejected!');
            console.log('Error:', error instanceof Error ? error.message : String(error));
            return false;
        }

        try {
            const decrypted4 = await encryptionService.decryptData(result2.encrypted, '0', result2.salt, result2.iv);
            console.log('✅ Correct password "0" works');
            console.log('Decrypted length:', decrypted4.length);
        } catch (error) {
            console.log('🚨 BUG: Correct password was rejected!');
            console.log('Error:', error instanceof Error ? error.message : String(error));
            return false;
        }

        console.log('\n✅ ALL TESTS PASSED - PASSWORD VALIDATION IS SECURE');
        return true;

    } catch (error) {
        console.error('❌ Test execution failed:', error);
        return false;
    }
}

// Additional edge case tests
async function edgeCaseTests() {
    console.log('\n🔍 EDGE CASE PASSWORD TESTS');

    const testCases = [
        { correct: 'password123', wrong: 'password124' },
        { correct: 'admin', wrong: 'Admin' },
        { correct: '12345', wrong: '123456' },
        { correct: 'test', wrong: 'tes' },
        { correct: 'a', wrong: 'aa' },
        { correct: '', wrong: ' ' },
        { correct: 'special!@#', wrong: 'special!@' }
    ];

    for (const testCase of testCases) {
        console.log(`\nTesting: "${testCase.correct}" vs "${testCase.wrong}"`);

        try {
            const result = await encryptionService.encryptData('test data', testCase.correct);

            try {
                await encryptionService.decryptData(result.encrypted, testCase.wrong, result.salt, result.iv);
                console.log(`🚨 SECURITY BUG: Wrong password "${testCase.wrong}" was accepted for "${testCase.correct}"!`);
                return false;
            } catch (error) {
                console.log(`✅ Correct: Wrong password "${testCase.wrong}" was rejected`);
            }
        } catch (error) {
            console.log(`❌ Test setup failed for "${testCase.correct}":`, error instanceof Error ? error.message : String(error));
        }
    }

    console.log('\n✅ ALL EDGE CASE TESTS PASSED');
    return true;
}

// Run the tests
export async function runCriticalPasswordTests() {
    console.log('='.repeat(60));
    console.log('🚨 RUNNING CRITICAL PASSWORD SECURITY TESTS');
    console.log('='.repeat(60));

    const mainTestPassed = await criticalPasswordTest();
    const edgeTestPassed = await edgeCaseTests();

    if (mainTestPassed && edgeTestPassed) {
        console.log('\n🎉 ALL SECURITY TESTS PASSED - SYSTEM IS SECURE');
        return true;
    } else {
        console.log('\n🚨 SECURITY VULNERABILITIES DETECTED - IMMEDIATE ATTENTION REQUIRED');
        return false;
    }
}

// For direct execution
if (require.main === module) {
    runCriticalPasswordTests().then(result => {
        process.exit(result ? 0 : 1);
    });
}
