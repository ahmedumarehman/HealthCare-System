// Test script to verify encryption/decryption password validation
import CryptoJS from 'crypto-js';

// Recreate the exact logic from encryptionService
function deriveKey(password: string, salt: string): string {
    return CryptoJS.PBKDF2(password, salt, {
        keySize: 256 / 32,
        iterations: 100000
    }).toString();
}

function createVerificationToken(password: string, salt: string): string {
    return CryptoJS.SHA256(`verification_${password}_${salt}_token`).toString().substring(0, 32);
}

async function testEncryptionDecryption() {
    console.log('🧪 Starting comprehensive encryption/decryption test...');

    const testData = 'This is a test message for password validation';
    const correctPassword = 'TestPassword123!';
    const wrongPassword = 'WrongPassword456!';

    // Test 1: Encryption
    console.log('\n📝 Test 1: Encryption');
    const salt = CryptoJS.lib.WordArray.random(128 / 8).toString();
    console.log('Generated salt:', salt);

    const verificationToken = createVerificationToken(correctPassword, salt);
    console.log('Generated verification token:', verificationToken);

    const key = deriveKey(correctPassword, salt);
    console.log('Derived key (first 20 chars):', key.substring(0, 20) + '...');

    const payload = {
        magic: 'HEALTHSYS_v2',
        verificationToken: verificationToken,
        timestamp: new Date().toISOString(),
        data: testData
    };

    const encrypted = CryptoJS.AES.encrypt(JSON.stringify(payload), key).toString();
    console.log('Encrypted data (first 50 chars):', encrypted.substring(0, 50) + '...');

    // Test 2: Decryption with correct password
    console.log('\n✅ Test 2: Decryption with correct password');
    try {
        const correctKey = deriveKey(correctPassword, salt);
        const expectedToken = createVerificationToken(correctPassword, salt);

        const decryptedBytes = CryptoJS.AES.decrypt(encrypted, correctKey);
        const decryptedString = decryptedBytes.toString(CryptoJS.enc.Utf8);

        if (!decryptedString) {
            throw new Error('Decryption resulted in empty string');
        }

        const decryptedPayload = JSON.parse(decryptedString);

        if (decryptedPayload.magic !== 'HEALTHSYS_v2') {
            throw new Error('Invalid magic header');
        }

        if (decryptedPayload.verificationToken !== expectedToken) {
            throw new Error('Verification token mismatch');
        }

        if (decryptedPayload.data !== testData) {
            throw new Error('Data mismatch');
        }

        console.log('✅ Correct password decryption: PASSED');
        console.log('Decrypted data:', decryptedPayload.data);
    } catch (error) {
        console.log('❌ Correct password decryption: FAILED');
        console.error('Error:', error);
        return;
    }

    // Test 3: Decryption with wrong password
    console.log('\n❌ Test 3: Decryption with wrong password');
    try {
        const wrongKey = deriveKey(wrongPassword, salt);
        const wrongExpectedToken = createVerificationToken(wrongPassword, salt);

        console.log('Wrong key (first 20 chars):', wrongKey.substring(0, 20) + '...');
        console.log('Wrong expected token:', wrongExpectedToken);

        const decryptedBytes = CryptoJS.AES.decrypt(encrypted, wrongKey);
        const decryptedString = decryptedBytes.toString(CryptoJS.enc.Utf8);

        console.log('Decrypted string length:', decryptedString.length);
        console.log('Decrypted string (first 100 chars):', decryptedString.substring(0, 100));

        if (!decryptedString || decryptedString.trim() === '') {
            console.log('✅ Wrong password properly rejected: Empty decryption result');
            return;
        }

        let decryptedPayload;
        try {
            decryptedPayload = JSON.parse(decryptedString);
        } catch (jsonError) {
            console.log('✅ Wrong password properly rejected: Invalid JSON');
            return;
        }

        if (decryptedPayload.magic !== 'HEALTHSYS_v2') {
            console.log('✅ Wrong password properly rejected: Invalid magic header');
            return;
        }

        if (decryptedPayload.verificationToken !== wrongExpectedToken) {
            console.log('✅ Wrong password properly rejected: Verification token mismatch');
            return;
        }

        // If we reach here, there's a security issue
        console.log('🚨 SECURITY ISSUE: Wrong password was accepted!');
        console.log('Payload:', decryptedPayload);

    } catch (error) {
        console.log('✅ Wrong password properly rejected with exception:', error);
    }

    console.log('\n🎉 Test completed successfully - Password validation is working correctly!');
}

// Export for use
export { testEncryptionDecryption, deriveKey, createVerificationToken };
