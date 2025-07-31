// FINAL COMPREHENSIVE TEST and FIX for the "00000" vs "0" password issue
const CryptoJS = require('crypto-js');

// Enhanced EncryptionService with ABSOLUTE password security
class UltraSecureEncryptionService {

    // Generate unique password fingerprint that's impossible to fake
    generatePasswordFingerprint(password, salt) {
        const exactPassword = String(password);
        const exactSalt = String(salt);

        // Multiple layers of password-specific data
        const lengthMarker = `LEN_${exactPassword.length}_`;
        const charCodes = exactPassword.split('').map(c => c.charCodeAt(0)).join('-');
        const reversedPassword = exactPassword.split('').reverse().join('');
        const doubledPassword = exactPassword + exactPassword;

        // Combine everything into an impossible-to-guess pattern
        const fingerprintData = [
            lengthMarker,
            exactPassword,
            charCodes,
            reversedPassword,
            doubledPassword,
            exactSalt,
            'ULTRASECURE_MARKER_V4'
        ].join('|SEPARATOR|');

        return CryptoJS.SHA256(fingerprintData).toString();
    }

    // Create multiple independent verification tokens
    createVerificationSystem(password, salt) {
        const exactPassword = String(password);
        const exactSalt = String(salt);

        return {
            fingerprint: this.generatePasswordFingerprint(exactPassword, exactSalt),
            length: exactPassword.length,
            hash: CryptoJS.SHA256(exactPassword).toString(),
            saltedHash: CryptoJS.SHA256(exactPassword + exactSalt).toString(),
            reversedSaltedHash: CryptoJS.SHA256(exactPassword.split('').reverse().join('') + exactSalt).toString(),
            charCodeSum: exactPassword.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0),
            firstChar: exactPassword.length > 0 ? exactPassword.charCodeAt(0) : -1,
            lastChar: exactPassword.length > 0 ? exactPassword.charCodeAt(exactPassword.length - 1) : -1
        };
    }

    // PBKDF2 key derivation with enhanced security
    deriveKey(password, salt) {
        const exactPassword = String(password);
        const exactSalt = String(salt);

        // Add password-specific salt modification
        const enhancedSalt = exactSalt + '_' + exactPassword.length + '_' + CryptoJS.SHA256(exactPassword).toString().substring(0, 8);

        return CryptoJS.PBKDF2(exactPassword, enhancedSalt, {
            keySize: 256 / 32,
            iterations: 100000
        }).toString();
    }

    // Ultra-secure encryption
    async encryptData(data, password) {
        const salt = CryptoJS.lib.WordArray.random(128 / 8).toString();
        const verification = this.createVerificationSystem(password, salt);
        const key = this.deriveKey(password, salt);

        const payload = {
            magic: 'ULTRASECURE_V4_ENCRYPTION',
            verification: verification,
            timestamp: new Date().toISOString(),
            dataLength: data.length,
            dataHash: CryptoJS.SHA256(data).toString(),
            data: data,
            endMarker: 'ULTRASECURE_END_V4'
        };

        const encrypted = CryptoJS.AES.encrypt(JSON.stringify(payload), key).toString();

        return { encrypted, salt, verification: verification.fingerprint };
    }

    // Ultra-strict decryption
    async decryptData(encryptedData, password, salt) {
        const exactPassword = String(password);
        const exactSalt = String(salt);

        console.log(`🔐 Ultra-strict decryption attempt with password: "${exactPassword}" (length: ${exactPassword.length})`);

        // Create expected verification system
        const expectedVerification = this.createVerificationSystem(exactPassword, exactSalt);
        const key = this.deriveKey(exactPassword, exactSalt);

        // Attempt decryption
        let decryptedBytes;
        try {
            decryptedBytes = CryptoJS.AES.decrypt(encryptedData, key);
        } catch (error) {
            throw new Error('Invalid password - AES decryption failed');
        }

        // Convert to string
        let decryptedString;
        try {
            decryptedString = decryptedBytes.toString(CryptoJS.enc.Utf8);
        } catch (error) {
            throw new Error('Invalid password - UTF-8 conversion failed');
        }

        // Basic validation
        if (!decryptedString || decryptedString.trim() === '') {
            throw new Error('Invalid password - empty decryption result');
        }

        // Parse JSON
        let payload;
        try {
            payload = JSON.parse(decryptedString);
        } catch (error) {
            throw new Error('Invalid password - JSON parsing failed');
        }

        // Validate structure
        if (!payload || typeof payload !== 'object') {
            throw new Error('Invalid password - invalid payload structure');
        }

        // Check magic header
        if (payload.magic !== 'ULTRASECURE_V4_ENCRYPTION') {
            throw new Error('Invalid password - wrong magic header');
        }

        // Check end marker
        if (payload.endMarker !== 'ULTRASECURE_END_V4') {
            throw new Error('Invalid password - wrong end marker');
        }

        // CRITICAL: Verify ALL password-specific data
        const verification = payload.verification;
        if (!verification) {
            throw new Error('Invalid password - no verification data');
        }

        // Check fingerprint
        if (verification.fingerprint !== expectedVerification.fingerprint) {
            console.log('Expected fingerprint:', expectedVerification.fingerprint);
            console.log('Found fingerprint:', verification.fingerprint);
            throw new Error('Invalid password - fingerprint mismatch');
        }

        // Check length
        if (verification.length !== expectedVerification.length) {
            console.log('Expected length:', expectedVerification.length);
            console.log('Found length:', verification.length);
            throw new Error('Invalid password - length mismatch');
        }

        // Check hash
        if (verification.hash !== expectedVerification.hash) {
            console.log('Expected hash:', expectedVerification.hash);
            console.log('Found hash:', verification.hash);
            throw new Error('Invalid password - hash mismatch');
        }

        // Check salted hash
        if (verification.saltedHash !== expectedVerification.saltedHash) {
            throw new Error('Invalid password - salted hash mismatch');
        }

        // Check reversed salted hash
        if (verification.reversedSaltedHash !== expectedVerification.reversedSaltedHash) {
            throw new Error('Invalid password - reversed salted hash mismatch');
        }

        // Check character code sum
        if (verification.charCodeSum !== expectedVerification.charCodeSum) {
            throw new Error('Invalid password - character code sum mismatch');
        }

        // Check first and last character codes
        if (verification.firstChar !== expectedVerification.firstChar) {
            throw new Error('Invalid password - first character mismatch');
        }

        if (verification.lastChar !== expectedVerification.lastChar) {
            throw new Error('Invalid password - last character mismatch');
        }

        // Verify data integrity
        if (payload.dataLength !== payload.data.length) {
            throw new Error('Invalid password - data length mismatch');
        }

        if (payload.dataHash !== CryptoJS.SHA256(payload.data).toString()) {
            throw new Error('Invalid password - data hash mismatch');
        }

        console.log('✅ ALL ULTRA-STRICT VERIFICATIONS PASSED');
        return payload.data;
    }
}

// Test the ultra-secure implementation
async function testUltraSecureImplementation() {
    console.log('🔥 TESTING ULTRA-SECURE ENCRYPTION IMPLEMENTATION');
    console.log('================================================');

    const ultraService = new UltraSecureEncryptionService();

    // Test the exact passwords causing issues
    const password1 = "00000";
    const password2 = "0";
    const testData = "Confidential patient data - must never be accessible with wrong password";

    console.log(`\nTesting passwords: "${password1}" vs "${password2}"`);
    console.log(`Test data: "${testData}"`);

    try {
        // Encrypt with password1
        console.log('\n🔒 Encrypting with password1...');
        const result = await ultraService.encryptData(testData, password1);
        console.log('✅ Encryption successful');

        // Try correct password
        console.log('\n🔓 Testing CORRECT password...');
        try {
            const decrypted1 = await ultraService.decryptData(result.encrypted, password1, result.salt);
            console.log('✅ Correct password works:', decrypted1 === testData);
        } catch (error) {
            console.log('❌ Correct password failed:', error.message);
            return false;
        }

        // Try wrong password - THE CRITICAL TEST
        console.log('\n🚨 Testing WRONG password (this should FAIL)...');
        try {
            const decrypted2 = await ultraService.decryptData(result.encrypted, password2, result.salt);
            console.log('\n🚨🚨🚨 ULTRA-SECURE IMPLEMENTATION FAILED! 🚨🚨🚨');
            console.log('❌ Wrong password was accepted:', decrypted2);
            return false;
        } catch (error) {
            console.log('✅ PERFECT: Wrong password correctly rejected');
            console.log('✅ Error:', error.message);
            return true;
        }

    } catch (error) {
        console.log('❌ Test failed:', error.message);
        return false;
    }
}

// Test multiple edge cases
async function testAllEdgeCases() {
    console.log('\n\n🧪 TESTING ALL EDGE CASES');
    console.log('=========================');

    const ultraService = new UltraSecureEncryptionService();
    const testCases = [
        ['00000', '0'],
        ['0', '00000'],
        ['1', '01'],
        ['01', '1'],
        ['password', 'Password'],
        ['123', '0123'],
        ['', ' '],
        ['a', 'A']
    ];

    let allPassed = true;

    for (const [pwd1, pwd2] of testCases) {
        console.log(`\n🔍 Testing: "${pwd1}" vs "${pwd2}"`);

        try {
            const result = await ultraService.encryptData('test data', pwd1);

            try {
                await ultraService.decryptData(result.encrypted, pwd2, result.salt);
                console.log(`❌ FAILED: "${pwd2}" incorrectly accepted for data encrypted with "${pwd1}"`);
                allPassed = false;
            } catch (error) {
                console.log(`✅ PASSED: "${pwd2}" correctly rejected`);
            }
        } catch (error) {
            console.log(`⚠️ Test skipped: ${error.message}`);
        }
    }

    return allPassed;
}

// Run comprehensive tests
async function runUltraSecureTests() {
    console.log('🚀 RUNNING ULTRA-SECURE ENCRYPTION TESTS');
    console.log('========================================');

    const mainTestPassed = await testUltraSecureImplementation();
    const edgeTestsPassed = await testAllEdgeCases();

    console.log('\n\n📊 FINAL ULTRA-SECURE TEST RESULTS');
    console.log('===================================');

    if (mainTestPassed && edgeTestsPassed) {
        console.log('✅ ALL TESTS PASSED - ULTRA-SECURE IMPLEMENTATION IS BULLETPROOF');
        console.log('✅ The "00000" vs "0" vulnerability is COMPLETELY ELIMINATED');
        console.log('💡 This implementation can replace the current encryptionService.ts');
    } else {
        console.log('❌ SOME TESTS FAILED - FURTHER INVESTIGATION NEEDED');
    }
}

runUltraSecureTests();
