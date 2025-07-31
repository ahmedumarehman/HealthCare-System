import CryptoJS from 'crypto-js';

// Test the exact same logic as the encryptionService
function deriveKey(password: string, salt: string): string {
    return CryptoJS.PBKDF2(password, salt, {
        keySize: 256 / 32,
        iterations: 100000
    }).toString();
}

function createVerificationToken(password: string, salt: string): string {
    const verificationString = `VERIFY_PASSWORD_${password}_WITH_SALT_${salt}_MAGIC_HEALTHSYS_2024_SECURE`;
    return CryptoJS.SHA256(verificationString).toString();
}

function createIntegrityHash(data: string, password: string, salt: string): string {
    const integrityString = `INTEGRITY_${data}_PASSWORD_${password}_SALT_${salt}`;
    return CryptoJS.SHA256(integrityString).toString();
}

async function testStrictPasswordValidation() {
    console.log('🧪 Testing STRICT password validation...');

    const testData = 'This is critical healthcare data that must be protected';
    const correctPassword = 'CorrectPassword123!';
    const wrongPasswords = [
        'WrongPassword456!',
        'CorrectPassword123@', // Very similar
        'correctpassword123!', // Case different
        'CorrectPassword123',  // Missing character
        'CorrectPassword123!!', // Extra character
        '',                    // Empty
        ' CorrectPassword123!', // Extra space
        'CorrectPassword123! ', // Trailing space
    ];

    // Step 1: Encrypt with correct password
    console.log('\n📝 Step 1: Encrypting data...');
    const salt = CryptoJS.lib.WordArray.random(128 / 8).toString();
    const verificationToken = createVerificationToken(correctPassword, salt);
    const integrityHash = createIntegrityHash(testData, correctPassword, salt);
    const key = deriveKey(correctPassword, salt);

    const payload = {
        magic: 'HEALTHSYS_v2_SECURE',
        verificationToken: verificationToken,
        integrityHash: integrityHash,
        timestamp: new Date().toISOString(),
        dataLength: testData.length,
        dataHash: CryptoJS.SHA256(testData).toString(),
        data: testData,
        endMarker: 'END_OF_HEALTHSYS_DATA'
    };

    const encrypted = CryptoJS.AES.encrypt(JSON.stringify(payload), key).toString();
    console.log('✅ Encryption completed');
    console.log(`Salt: ${salt}`);
    console.log(`Verification token: ${verificationToken.substring(0, 20)}...`);

    // Step 2: Test correct password
    console.log('\n📝 Step 2: Testing CORRECT password...');
    try {
        const correctKey = deriveKey(correctPassword, salt);
        const decryptedBytes = CryptoJS.AES.decrypt(encrypted, correctKey);
        const decryptedString = decryptedBytes.toString(CryptoJS.enc.Utf8);

        if (!decryptedString) {
            throw new Error('Empty decryption result');
        }

        const decryptedPayload = JSON.parse(decryptedString);

        // Verify all components
        if (decryptedPayload.magic !== 'HEALTHSYS_v2_SECURE') {
            throw new Error('Magic header mismatch');
        }

        const expectedToken = createVerificationToken(correctPassword, salt);
        if (decryptedPayload.verificationToken !== expectedToken) {
            throw new Error('Verification token mismatch');
        }

        const expectedIntegrity = createIntegrityHash(decryptedPayload.data, correctPassword, salt);
        if (decryptedPayload.integrityHash !== expectedIntegrity) {
            throw new Error('Integrity hash mismatch');
        }

        if (decryptedPayload.data !== testData) {
            throw new Error('Data mismatch');
        }

        console.log('✅ CORRECT password test: PASSED');
        console.log(`Decrypted data: "${decryptedPayload.data}"`);

    } catch (error) {
        console.log('❌ CORRECT password test: FAILED');
        console.error('Error:', error);
        return false;
    }

    // Step 3: Test wrong passwords
    console.log('\n📝 Step 3: Testing WRONG passwords...');
    let allWrongPasswordsRejected = true;

    for (let i = 0; i < wrongPasswords.length; i++) {
        const wrongPassword = wrongPasswords[i];
        console.log(`\n🔍 Testing wrong password ${i + 1}: "${wrongPassword}"`);

        try {
            const wrongKey = deriveKey(wrongPassword, salt);
            const decryptedBytes = CryptoJS.AES.decrypt(encrypted, wrongKey);
            const decryptedString = decryptedBytes.toString(CryptoJS.enc.Utf8);

            console.log(`Decrypted string length: ${decryptedString.length}`);
            console.log(`Decrypted string (first 100 chars): "${decryptedString.substring(0, 100)}"`);

            // Check if it's empty (most common case)
            if (!decryptedString || decryptedString.trim() === '') {
                console.log('✅ Wrong password properly rejected: Empty result');
                continue;
            }

            // Check for garbage characters
            const hasGarbage = decryptedString.split('').some(char => {
                const code = char.charCodeAt(0);
                return (code >= 0 && code <= 8) || (code >= 14 && code <= 31) || (code >= 127 && code <= 159);
            });

            if (hasGarbage) {
                console.log('✅ Wrong password properly rejected: Contains garbage characters');
                continue;
            }

            // Try to parse as JSON
            let wrongPayload;
            try {
                wrongPayload = JSON.parse(decryptedString);
            } catch (jsonError) {
                console.log('✅ Wrong password properly rejected: Invalid JSON');
                continue;
            }

            // Check magic header
            if (!wrongPayload || wrongPayload.magic !== 'HEALTHSYS_v2_SECURE') {
                console.log('✅ Wrong password properly rejected: Invalid magic header');
                continue;
            }

            // Check verification token
            const wrongExpectedToken = createVerificationToken(wrongPassword, salt);
            if (wrongPayload.verificationToken !== wrongExpectedToken) {
                console.log('✅ Wrong password properly rejected: Verification token mismatch');
                continue;
            }

            // If we reach here, it's a security issue
            console.log('🚨 CRITICAL SECURITY ISSUE: Wrong password was accepted!');
            console.log('Payload:', wrongPayload);
            allWrongPasswordsRejected = false;

        } catch (error) {
            console.log('✅ Wrong password properly rejected: Exception thrown');
        }
    }

    // Final result
    if (allWrongPasswordsRejected) {
        console.log('\n🎉 ALL TESTS PASSED: Password validation is SECURE!');
        console.log('✅ Correct password works');
        console.log('✅ All wrong passwords rejected');
        return true;
    } else {
        console.log('\n🚨 SECURITY FAILURE: Some wrong passwords were accepted!');
        return false;
    }
}

// Export for use
export { testStrictPasswordValidation, deriveKey, createVerificationToken, createIntegrityHash };
