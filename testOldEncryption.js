// Test the OLD encryption.ts service to see if it has the vulnerability
const CryptoJS = require('crypto-js');

// Copy the old EncryptionService logic from encryption.ts
class OldEncryptionService {
    constructor() {
        this.secretKey = 'default-secret-key';
    }

    deriveKey(password, salt) {
        return CryptoJS.PBKDF2(password, salt, {
            keySize: 256 / 32,
            iterations: 100000
        }).toString();
    }

    // This is the old encryptWithPassword method - POTENTIALLY VULNERABLE
    encryptWithPassword(data, password) {
        try {
            const salt = CryptoJS.lib.WordArray.random(128 / 8).toString();
            const key = this.deriveKey(password, salt);
            const verification = CryptoJS.SHA256(password + salt).toString();

            const dataWithVerification = JSON.stringify({
                verification: verification,
                originalData: data
            });

            const encryptedData = CryptoJS.AES.encrypt(dataWithVerification, key).toString();

            return {
                encryptedData,
                salt,
                verification
            };
        } catch (error) {
            console.error('Password encryption failed:', error);
            throw new Error('Failed to encrypt data with password');
        }
    }

    // This is the old decryptWithPassword method - POTENTIALLY VULNERABLE
    decryptWithPassword(encryptedData, password, salt, expectedVerification) {
        try {
            const key = this.deriveKey(password, salt);
            const passwordVerification = CryptoJS.SHA256(password + salt).toString();

            const bytes = CryptoJS.AES.decrypt(encryptedData, key);
            const decryptedString = bytes.toString(CryptoJS.enc.Utf8);

            if (!decryptedString) {
                throw new Error('Invalid password - decryption resulted in empty data');
            }

            let decryptedData;
            try {
                decryptedData = JSON.parse(decryptedString);
            } catch (error) {
                throw new Error('Invalid password or corrupted data - unable to parse decrypted content');
            }

            // Verify the password using the embedded verification hash
            if (decryptedData.verification) {
                if (decryptedData.verification !== passwordVerification) {
                    throw new Error('Invalid password - verification failed');
                }
                return decryptedData.originalData;
            } else if (expectedVerification) {
                if (expectedVerification !== passwordVerification) {
                    throw new Error('Invalid password - verification failed');
                }
                return decryptedString;
            } else {
                console.warn('Decryption performed without password verification');
                return decryptedString;
            }
        } catch (error) {
            console.error('Password decryption failed:', error);
            if (error instanceof Error && error.message.includes('Invalid password')) {
                throw error;
            }
            throw new Error('Failed to decrypt data with password');
        }
    }
}

// Test the old encryption service for the vulnerability
async function testOldEncryptionService() {
    console.log('🚨 TESTING OLD ENCRYPTION SERVICE FOR VULNERABILITY');
    console.log('===================================================');

    const oldService = new OldEncryptionService();

    const testData = "Confidential healthcare data";
    const password1 = "00000"; // 5 zeros
    const password2 = "0";     // 1 zero

    console.log(`\n📋 Test Setup:`);
    console.log(`Password 1: "${password1}" (length: ${password1.length})`);
    console.log(`Password 2: "${password2}" (length: ${password2.length})`);
    console.log(`Test data: "${testData}"`);

    try {
        // Step 1: Encrypt with password1 ("00000")
        console.log('\n🔒 Step 1: Encrypting with password1 ("00000") using OLD service');
        const { encryptedData, salt, verification } = oldService.encryptWithPassword(testData, password1);
        console.log(`✅ Old encryption successful`);
        console.log(`Salt: ${salt}`);
        console.log(`Verification: ${verification.substring(0, 20)}...`);

        // Step 2: Try to decrypt with correct password
        console.log('\n🔓 Step 2: Decrypting with CORRECT password ("00000")');
        try {
            const decrypted1 = oldService.decryptWithPassword(encryptedData, password1, salt);
            console.log(`✅ Correct password decryption: SUCCESS`);
            console.log(`Decrypted data: "${decrypted1}"`);
            console.log(`Data matches original: ${decrypted1 === testData}`);
        } catch (error) {
            console.log(`❌ Correct password decryption FAILED: ${error.message}`);
            return false;
        }

        // Step 3: CRITICAL TEST - Try to decrypt with wrong password
        console.log('\n🔍 Step 3: CRITICAL TEST - Attempting decryption with WRONG password ("0")');
        console.log('🚨 THIS SHOULD FAIL - if it succeeds, we found the vulnerability source!');

        try {
            const decrypted2 = oldService.decryptWithPassword(encryptedData, password2, salt);

            // If we get here without an error, that's the vulnerability!
            console.log('\n🚨🚨🚨 VULNERABILITY FOUND IN OLD ENCRYPTION SERVICE! 🚨🚨🚨');
            console.log(`❌ Wrong password "${password2}" successfully decrypted the data!`);
            console.log(`❌ Decrypted result: "${decrypted2}"`);
            console.log(`❌ Data matches original: ${decrypted2 === testData}`);
            console.log('🚨 THIS IS THE SOURCE OF THE VULNERABILITY!');

            return 'VULNERABILITY_FOUND';

        } catch (error) {
            console.log(`✅ Wrong password correctly rejected by old service: ${error.message}`);
            return true;
        }

    } catch (error) {
        console.error('❌ Test setup failed:', error);
        return false;
    }
}

// Test additional edge cases with the old service
async function testOldServiceEdgeCases() {
    console.log('\n\n🧪 Testing Old Service Edge Cases');
    console.log('==================================');

    const oldService = new OldEncryptionService();
    const edgeCases = [
        ['0', '00'],
        ['1', '01'],
        ['password', 'Password'],
        ['123', '0123']
    ];

    for (const [pwd1, pwd2] of edgeCases) {
        console.log(`\n🔍 Testing old service: "${pwd1}" vs "${pwd2}"`);

        try {
            const { encryptedData, salt } = oldService.encryptWithPassword('test data', pwd1);

            try {
                const decrypted = oldService.decryptWithPassword(encryptedData, pwd2, salt);
                console.log(`🚨 OLD SERVICE VULNERABILITY: "${pwd2}" successfully decrypted data encrypted with "${pwd1}"`);
            } catch (error) {
                console.log(`✅ Old service correctly rejected "${pwd2}" for data encrypted with "${pwd1}"`);
            }

        } catch (error) {
            console.log(`⚠️  Test skipped due to encryption error: ${error.message}`);
        }
    }
}

// Run the tests
async function runOldServiceTests() {
    try {
        const mainResult = await testOldEncryptionService();
        await testOldServiceEdgeCases();

        console.log('\n\n📊 OLD SERVICE TEST RESULTS');
        console.log('===========================');

        if (mainResult === 'VULNERABILITY_FOUND') {
            console.log('🚨 VULNERABILITY CONFIRMED: OLD ENCRYPTION SERVICE IS THE SOURCE');
            console.log('🚨 The old encryption.ts service has the "00000" vs "0" vulnerability');
            console.log('💡 SOLUTION: Ensure all components use the NEW encryptionService.ts instead');
        } else if (mainResult === true) {
            console.log('✅ Old encryption service seems secure');
            console.log('💡 The vulnerability might be elsewhere or fixed');
        } else {
            console.log('❌ Could not complete the test');
        }

    } catch (error) {
        console.error('❌ Test execution failed:', error);
    }
}

runOldServiceTests();
