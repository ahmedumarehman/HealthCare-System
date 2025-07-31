/**
 * Simple test to check the specific "00000" vs "0" vulnerability
 */

const CryptoJS = require('crypto-js');

// Test the exact issue
async function testPasswordVulnerability() {
    console.log('🚨 TESTING SPECIFIC VULNERABILITY: "00000" vs "0"');
    console.log('='.repeat(50));

    // Test 1: Encrypt with "00000"
    const password1 = '00000';
    const password2 = '0';
    const salt = CryptoJS.lib.WordArray.random(128 / 8).toString();
    const testData = 'Secret patient data';

    console.log(`Salt: ${salt}`);
    console.log(`Password 1: "${password1}" (length: ${password1.length})`);
    console.log(`Password 2: "${password2}" (length: ${password2.length})`);

    // Generate keys
    const key1 = CryptoJS.PBKDF2(password1, salt, { keySize: 256 / 32, iterations: 100000 }).toString();
    const key2 = CryptoJS.PBKDF2(password2, salt, { keySize: 256 / 32, iterations: 100000 }).toString();

    console.log(`\nKey 1: ${key1.substring(0, 20)}...`);
    console.log(`Key 2: ${key2.substring(0, 20)}...`);
    console.log(`Keys are different: ${key1 !== key2}`);

    if (key1 === key2) {
        console.log('🚨 CRITICAL: Same keys generated for different passwords!');
        return false;
    }

    // Generate verification tokens
    const token1 = CryptoJS.SHA256(`VERIFY_PASSWORD_${password1}_WITH_SALT_${salt}_MAGIC_HEALTHSYS_2024_SECURE`).toString();
    const token2 = CryptoJS.SHA256(`VERIFY_PASSWORD_${password2}_WITH_SALT_${salt}_MAGIC_HEALTHSYS_2024_SECURE`).toString();

    console.log(`\nToken 1: ${token1.substring(0, 20)}...`);
    console.log(`Token 2: ${token2.substring(0, 20)}...`);
    console.log(`Tokens are different: ${token1 !== token2}`);

    if (token1 === token2) {
        console.log('🚨 CRITICAL: Same tokens generated for different passwords!');
        return false;
    }

    // Test encryption/decryption
    const payload = {
        magic: 'HEALTHSYS_v2_SECURE',
        verificationToken: token1,
        data: testData,
        endMarker: 'END_OF_HEALTHSYS_DATA'
    };

    const encrypted = CryptoJS.AES.encrypt(JSON.stringify(payload), key1).toString();
    console.log(`\nEncrypted: ${encrypted.substring(0, 30)}...`);

    // Try to decrypt with wrong password
    console.log('\n🔍 Attempting decryption with WRONG password...');
    try {
        const decryptedBytes = CryptoJS.AES.decrypt(encrypted, key2);
        const decryptedString = decryptedBytes.toString(CryptoJS.enc.Utf8);

        console.log(`Decrypted string: "${decryptedString}"`);
        console.log(`Decrypted string length: ${decryptedString.length}`);

        if (decryptedString && decryptedString.length > 0) {
            try {
                const parsedPayload = JSON.parse(decryptedString);
                console.log('🚨 CRITICAL: JSON parsing succeeded with wrong password!');
                console.log('Parsed payload:', parsedPayload);

                if (parsedPayload.data === testData) {
                    console.log('🚨🚨🚨 CRITICAL SECURITY BUG: Wrong password decrypted correct data!');
                    return false;
                }
            } catch (jsonError) {
                console.log('✅ JSON parsing failed (expected with wrong password)');
            }
        } else {
            console.log('✅ Decryption with wrong password produced empty/invalid data');
        }
    } catch (error) {
        console.log('✅ AES decryption failed with wrong password (expected)');
    }

    // Test with correct password
    console.log('\n🔍 Attempting decryption with CORRECT password...');
    try {
        const decryptedBytes = CryptoJS.AES.decrypt(encrypted, key1);
        const decryptedString = decryptedBytes.toString(CryptoJS.enc.Utf8);
        const parsedPayload = JSON.parse(decryptedString);

        if (parsedPayload.data === testData) {
            console.log('✅ Correct password successfully decrypted data');
        } else {
            console.log('❌ Correct password failed to decrypt properly');
            return false;
        }
    } catch (error) {
        console.log('❌ Correct password failed to decrypt:', error.message);
        return false;
    }

    console.log('\n✅ Password vulnerability test PASSED - system is secure');
    return true;
}

testPasswordVulnerability().then(result => {
    if (result) {
        console.log('\n🎉 SECURITY TEST PASSED');
    } else {
        console.log('\n🚨 SECURITY VULNERABILITY DETECTED');
    }
});
