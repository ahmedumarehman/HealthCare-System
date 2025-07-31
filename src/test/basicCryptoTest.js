const CryptoJS = require('crypto-js');

// Test PBKDF2 key derivation directly
function testKeyDerivation() {
    console.log('🔍 Testing PBKDF2 key derivation...');

    const salt = 'test_salt';
    const key1 = CryptoJS.PBKDF2('00000', salt, { keySize: 256 / 32, iterations: 100000 }).toString();
    const key2 = CryptoJS.PBKDF2('0', salt, { keySize: 256 / 32, iterations: 100000 }).toString();

    console.log('Key for "00000":', key1);
    console.log('Key for "0":', key2);
    console.log('Keys are different:', key1 !== key2);

    if (key1 === key2) {
        console.log('🚨 CRITICAL BUG: Same key generated for different passwords!');
        return false;
    }

    return true;
}

// Test verification token generation
function testVerificationTokens() {
    console.log('\n🔍 Testing verification token generation...');

    const salt = 'test_salt';
    const token1 = CryptoJS.SHA256(`VERIFY_PASSWORD_00000_WITH_SALT_${salt}_MAGIC_HEALTHSYS_2024_SECURE`).toString();
    const token2 = CryptoJS.SHA256(`VERIFY_PASSWORD_0_WITH_SALT_${salt}_MAGIC_HEALTHSYS_2024_SECURE`).toString();

    console.log('Token for "00000":', token1);
    console.log('Token for "0":', token2);
    console.log('Tokens are different:', token1 !== token2);

    if (token1 === token2) {
        console.log('🚨 CRITICAL BUG: Same verification token for different passwords!');
        return false;
    }

    return true;
}

// Test basic AES encryption/decryption
function testAESEncryption() {
    console.log('\n🔍 Testing AES encryption/decryption...');

    const data = 'test data';
    const key1 = 'key_from_00000';
    const key2 = 'key_from_0';

    const encrypted = CryptoJS.AES.encrypt(data, key1).toString();
    console.log('Encrypted with key1:', encrypted.substring(0, 20) + '...');

    try {
        const decrypted1 = CryptoJS.AES.decrypt(encrypted, key1).toString(CryptoJS.enc.Utf8);
        console.log('Decryption with correct key1:', decrypted1);
    } catch (error) {
        console.log('Failed to decrypt with correct key1:', error);
    }

    try {
        const decrypted2 = CryptoJS.AES.decrypt(encrypted, key2).toString(CryptoJS.enc.Utf8);
        console.log('Decryption with wrong key2:', decrypted2);
        if (decrypted2 === data) {
            console.log('🚨 CRITICAL BUG: Wrong key decrypted successfully!');
            return false;
        }
    } catch (error) {
        console.log('✅ Correct: Wrong key2 failed to decrypt');
    }

    return true;
}

function runBasicCryptoTests() {
    console.log('🧪 BASIC CRYPTOGRAPHY TESTS');
    console.log('='.repeat(40));

    const test1 = testKeyDerivation();
    const test2 = testVerificationTokens();
    const test3 = testAESEncryption();

    if (test1 && test2 && test3) {
        console.log('\n✅ All basic crypto tests passed');
    } else {
        console.log('\n❌ Basic crypto tests failed');
    }
}

runBasicCryptoTests();
