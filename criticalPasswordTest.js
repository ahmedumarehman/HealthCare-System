// Critical Password Test - Verify the specific "00000" vs "0" issue
const CryptoJS = require('crypto-js');

console.log('🚨 CRITICAL PASSWORD TEST: "00000" vs "0" vulnerability check');
console.log('=====================================================');

// Test the exact issue reported: "00000" and "0" being interchangeable
async function testCriticalPasswordIssue() {
    const testData = "Critical healthcare data that must be protected";
    const password1 = "00000"; // 5 zeros
    const password2 = "0";     // 1 zero

    console.log(`\n📋 Test Setup:`);
    console.log(`Password 1: "${password1}" (length: ${password1.length})`);
    console.log(`Password 2: "${password2}" (length: ${password2.length})`);
    console.log(`Test data: "${testData}"`);

    // Generate a random salt
    const salt = CryptoJS.lib.WordArray.random(128 / 8).toString();
    console.log(`Salt: ${salt}`);

    // Test 1: Direct PBKDF2 key derivation
    console.log('\n🔑 Step 1: Testing PBKDF2 key derivation');
    const key1 = CryptoJS.PBKDF2(password1, salt, { keySize: 256 / 32, iterations: 100000 }).toString();
    const key2 = CryptoJS.PBKDF2(password2, salt, { keySize: 256 / 32, iterations: 100000 }).toString();

    console.log(`Key from "${password1}": ${key1.substring(0, 20)}...`);
    console.log(`Key from "${password2}": ${key2.substring(0, 20)}...`);
    console.log(`Keys are identical: ${key1 === key2}`);

    if (key1 === key2) {
        console.log('🚨 CRITICAL ISSUE: Different passwords produce identical keys!');
        return false;
    } else {
        console.log('✅ PBKDF2 correctly produces different keys for different passwords');
    }

    // Test 2: AES encryption/decryption
    console.log('\n🔒 Step 2: Testing AES encryption/decryption');

    // Encrypt with password1
    const encrypted = CryptoJS.AES.encrypt(testData, key1).toString();
    console.log(`Encrypted data: ${encrypted.substring(0, 50)}...`);

    // Try to decrypt with both keys
    console.log('\n🔓 Step 3: Testing decryption attempts');

    // Decrypt with correct key (password1)
    try {
        const decrypted1 = CryptoJS.AES.decrypt(encrypted, key1).toString(CryptoJS.enc.Utf8);
        console.log(`✅ Decryption with correct password "${password1}": SUCCESS`);
        console.log(`Decrypted: "${decrypted1}"`);
        console.log(`Data matches original: ${decrypted1 === testData}`);
    } catch (error) {
        console.log(`❌ Decryption with correct password "${password1}": FAILED - ${error.message}`);
    }

    // Try to decrypt with wrong key (password2)
    try {
        const decrypted2 = CryptoJS.AES.decrypt(encrypted, key2).toString(CryptoJS.enc.Utf8);

        if (decrypted2 === testData) {
            console.log(`🚨 CRITICAL SECURITY VULNERABILITY: Wrong password "${password2}" successfully decrypted data!`);
            console.log(`Decrypted: "${decrypted2}"`);
            return false;
        } else if (decrypted2 && decrypted2.trim() !== '') {
            console.log(`⚠️  Wrong password "${password2}" produced garbage data: "${decrypted2}"`);
            console.log('✅ This is expected behavior - garbage output indicates wrong password');
        } else {
            console.log(`✅ Wrong password "${password2}" correctly failed to decrypt (empty result)`);
        }
    } catch (error) {
        console.log(`✅ Wrong password "${password2}" correctly failed: ${error.message}`);
    }

    // Test 3: Verification tokens
    console.log('\n🛡️ Step 4: Testing verification token approach');

    const createVerificationToken = (password, salt) => {
        const exactPassword = String(password);
        const exactSalt = String(salt);
        const passwordChars = exactPassword.split('').map(c => c.charCodeAt(0)).join(',');
        const passwordLength = exactPassword.length;
        const verificationString = `VERIFY_PASSWORD_${exactPassword}_LENGTH_${passwordLength}_CHARS_[${passwordChars}]_WITH_SALT_${exactSalt}_MAGIC_HEALTHSYS_2024_SECURE_v3`;
        return CryptoJS.SHA256(verificationString).toString();
    };

    const token1 = createVerificationToken(password1, salt);
    const token2 = createVerificationToken(password2, salt);

    console.log(`Token for "${password1}": ${token1.substring(0, 20)}...`);
    console.log(`Token for "${password2}": ${token2.substring(0, 20)}...`);
    console.log(`Tokens are identical: ${token1 === token2}`);

    if (token1 === token2) {
        console.log('🚨 CRITICAL ISSUE: Different passwords produce identical verification tokens!');
        return false;
    } else {
        console.log('✅ Verification tokens correctly differ for different passwords');
    }

    return true;
}

// Test additional edge cases
async function testAdditionalEdgeCases() {
    console.log('\n\n🧪 Additional Edge Case Tests');
    console.log('=============================');

    const edgeCases = [
        ['0', '00'],
        ['1', '01'],
        ['', ' '],
        ['password', 'Password'],
        ['123', '0123']
    ];

    for (const [pwd1, pwd2] of edgeCases) {
        console.log(`\n🔍 Testing: "${pwd1}" vs "${pwd2}"`);

        const salt = CryptoJS.lib.WordArray.random(128 / 8).toString();
        const key1 = CryptoJS.PBKDF2(pwd1, salt, { keySize: 256 / 32, iterations: 100000 }).toString();
        const key2 = CryptoJS.PBKDF2(pwd2, salt, { keySize: 256 / 32, iterations: 100000 }).toString();

        if (key1 === key2) {
            console.log(`🚨 ISSUE: Passwords "${pwd1}" and "${pwd2}" produce identical keys!`);
        } else {
            console.log(`✅ Passwords correctly produce different keys`);
        }
    }
}

// Run the tests
async function runAllTests() {
    try {
        const mainTestPassed = await testCriticalPasswordIssue();
        await testAdditionalEdgeCases();

        console.log('\n\n📊 FINAL RESULTS');
        console.log('================');

        if (mainTestPassed) {
            console.log('✅ SECURITY TEST PASSED: Cryptographic functions correctly handle different passwords');
            console.log('✅ The "00000" vs "0" vulnerability does NOT exist at the crypto level');
            console.log('⚠️  If this issue exists in the app, it must be in the application logic, not the crypto functions');
        } else {
            console.log('🚨 SECURITY TEST FAILED: Critical vulnerability detected in cryptographic functions');
        }

    } catch (error) {
        console.error('❌ Test execution failed:', error);
    }
}

runAllTests();
