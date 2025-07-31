// Critical password security test
// Testing Ahmed's exact issue: wrong passwords being accepted during decryption

console.log('🚨 AHMED\'S PASSWORD SECURITY TEST 🚨');
console.log('Testing if wrong passwords are incorrectly accepted during decryption\n');

// Test basic password validation logic
function testPasswordEquality() {
    console.log('1. Testing basic password equality...');

    const correctPassword = 'ahmed@2003';
    const wrongPasswords = [
        'ahmed@2004',
        'Ahmed@2003',
        'wrongpassword',
        '12345',
        ''
    ];

    console.log(`Correct password: "${correctPassword}"`);

    wrongPasswords.forEach((wrong, index) => {
        const isEqual = (correctPassword === wrong);
        const stringEquals = (String(correctPassword) === String(wrong));

        console.log(`\nTest ${index + 1}: "${wrong}"`);
        console.log(`  Basic equality: ${isEqual ? '❌ EQUAL (BUG!)' : '✅ Different'}`);
        console.log(`  String equality: ${stringEquals ? '❌ EQUAL (BUG!)' : '✅ Different'}`);

        if (isEqual || stringEquals) {
            console.log('🚨 CRITICAL: Passwords are being treated as equal!');
        }
    });
}

// Test if empty strings or special cases cause issues
function testEdgeCases() {
    console.log('\n2. Testing edge cases...');

    const password = 'ahmed@2003';
    const edgeCases = [
        null,
        undefined,
        '',
        ' ',
        'ahmed@2003 ',
        ' ahmed@2003',
        '\nahmad@2003',
        'ahmed@2003\n'
    ];

    edgeCases.forEach((edge, index) => {
        const edgeStr = String(edge);
        const passwordStr = String(password);
        const isEqual = (edgeStr === passwordStr);

        console.log(`\nEdge case ${index + 1}: ${JSON.stringify(edge)}`);
        console.log(`  String value: "${edgeStr}"`);
        console.log(`  Equals password: ${isEqual ? '❌ YES (BUG!)' : '✅ No'}`);

        if (isEqual) {
            console.log('🚨 CRITICAL: Edge case matches password!');
        }
    });
}

// Simulate the decryption validation process
function simulateDecryptionValidation() {
    console.log('\n3. Simulating decryption validation...');

    const correctPassword = 'ahmed@2003';
    const wrongPassword = 'wrongpassword';

    // Simulate what happens in the decryption process
    console.log('Simulating decryptData function...');

    // Step 1: String conversion (what the actual code does)
    const exactPassword = String(wrongPassword);  // This is what the decryptData function does
    const storedPassword = String(correctPassword); // This would be in the verification data

    console.log(`Input password: "${wrongPassword}"`);
    console.log(`Converted to String: "${exactPassword}"`);
    console.log(`Stored password: "${storedPassword}"`);

    // Step 2: Check if they're equal (this is the critical test)
    const passwordsMatch = (exactPassword === storedPassword);
    console.log(`Passwords match: ${passwordsMatch ? '❌ YES (BUG!)' : '✅ No'}`);

    if (passwordsMatch) {
        console.log('🚨 FOUND THE BUG: Wrong password is being treated as correct!');
        return false;
    }

    return true;
}

// Main test execution
function runTests() {
    console.log('Starting comprehensive password security tests...\n');

    testPasswordEquality();
    testEdgeCases();
    const validationPassed = simulateDecryptionValidation();

    console.log('\n' + '='.repeat(60));
    console.log('TEST SUMMARY');
    console.log('='.repeat(60));

    if (validationPassed) {
        console.log('✅ Basic password validation logic appears correct');
        console.log('❓ The issue might be in the crypto operations or JSON parsing');
        console.log('💡 Recommendation: Check if decryption somehow succeeds with wrong keys');
    } else {
        console.log('🚨 CRITICAL BUG FOUND in password validation logic!');
        console.log('❌ Wrong passwords are being treated as correct');
        console.log('🔧 IMMEDIATE FIX REQUIRED');
    }

    console.log('\n📋 Next steps:');
    console.log('1. Test actual encryption/decryption with real crypto operations');
    console.log('2. Check if AES decryption fails gracefully with wrong passwords');
    console.log('3. Verify that JSON parsing catches corrupted data');
    console.log('4. Ensure verification tokens are properly validated');
}

// Run the tests
runTests();
