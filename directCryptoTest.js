const CryptoJS = require('crypto-js');

// Direct test of the core encryption/decryption logic
function testPasswordIssue() {
    console.log('🔍 DIRECT ENCRYPTION TEST');
    console.log('Testing "00000" vs "0" vulnerability...\n');

    const password1 = '00000';
    const password2 = '0';
    const testData = 'Test sensitive data';
    const salt = 'test_salt_123';

    // Step 1: Generate keys
    console.log('Step 1: Generating encryption keys...');
    const key1 = CryptoJS.PBKDF2(password1, salt, { keySize: 256 / 32, iterations: 100000 }).toString();
    const key2 = CryptoJS.PBKDF2(password2, salt, { keySize: 256 / 32, iterations: 100000 }).toString();

    console.log(`Key for "${password1}": ${key1.substring(0, 20)}...`);
    console.log(`Key for "${password2}": ${key2.substring(0, 20)}...`);
    console.log(`Keys are different: ${key1 !== key2}`);

    if (key1 === key2) {
        console.log('🚨 CRITICAL BUG: Same keys generated for different passwords!');
        return false;
    }

    // Step 2: Test basic AES encryption/decryption
    console.log('\nStep 2: Testing AES encryption/decryption...');

    // Encrypt with key1 (password "00000")
    const encrypted = CryptoJS.AES.encrypt(testData, key1).toString();
    console.log(`Encrypted data: ${encrypted.substring(0, 30)}...`);

    // Try to decrypt with key1 (correct key)
    try {
        const decrypted1 = CryptoJS.AES.decrypt(encrypted, key1).toString(CryptoJS.enc.Utf8);
        console.log(`Decryption with correct key: "${decrypted1}"`);

        if (decrypted1 === testData) {
            console.log('✅ Correct key works');
        } else {
            console.log('❌ Correct key failed');
        }
    } catch (error) {
        console.log('❌ Correct key decryption failed:', error.message);
    }

    // Try to decrypt with key2 (wrong key)
    try {
        const decrypted2 = CryptoJS.AES.decrypt(encrypted, key2).toString(CryptoJS.enc.Utf8);
        console.log(`Decryption with wrong key: "${decrypted2}"`);

        if (decrypted2 === testData) {
            console.log('🚨 CRITICAL BUG: Wrong key produced correct data!');
            return false;
        } else if (decrypted2 && decrypted2.length > 0) {
            console.log('⚠️ Wrong key produced some data (garbage)');
        } else {
            console.log('✅ Wrong key produced empty/invalid data');
        }
    } catch (error) {
        console.log('✅ Wrong key decryption failed as expected:', error.message);
    }

    return true;
}

// Run the test
console.log('Testing core crypto functionality...\n');
const result = testPasswordIssue();

if (result) {
    console.log('\n✅ Core crypto test passed - different passwords produce different keys');
} else {
    console.log('\n❌ Core crypto test failed - vulnerability detected');
}
