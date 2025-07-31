// Simple test to reproduce Ahmed's exact issue
console.log('🚨 Testing Ahmed\'s exact password issue...\n');

// Simulate what happens in the browser
const testData = 'MEDICAL RECORD TEST DATA';
const correctPassword = 'ahmed@2003';
const wrongPassword = 'wrongpassword';

// Create a simple test
async function testPasswordValidation() {
    console.log('1. Testing password validation logic...');

    // Test password string handling
    console.log(`Correct password: "${correctPassword}" (length: ${correctPassword.length})`);
    console.log(`Wrong password: "${wrongPassword}" (length: ${wrongPassword.length})`);

    // Test string conversion
    const exactCorrect = String(correctPassword);
    const exactWrong = String(wrongPassword);

    console.log(`String(correct): "${exactCorrect}"`);
    console.log(`String(wrong): "${exactWrong}"`);

    // Test if they're different
    if (exactCorrect === exactWrong) {
        console.log('🚨 CRITICAL: Passwords are being treated as equal!');
    } else {
        console.log('✅ Passwords are correctly different');
    }

    // Test basic crypto operations (if available)
    if (typeof window !== 'undefined' && window.crypto) {
        console.log('✅ Browser crypto API available');
    } else {
        console.log('❌ Browser crypto API not available');
    }
}

testPasswordValidation();
