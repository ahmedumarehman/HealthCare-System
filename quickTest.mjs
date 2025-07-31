// Simple direct test of the encryption service
async function testPasswordSecurity() {
    console.log('🧪 Testing password security...');

    // Import the encryption service
    const { encryptionService } = await import('./src/services/encryptionService.js');

    const testData = 'Sensitive patient data';
    const password1 = '00000';
    const password2 = '0';

    try {
        // Test 1: Encrypt with "00000"
        console.log('Encrypting with "00000"...');
        const result = await encryptionService.encryptData(testData, password1);
        console.log('✅ Encryption successful');

        // Test 2: Try to decrypt with correct password
        console.log('Decrypting with correct password "00000"...');
        const correctDecryption = await encryptionService.decryptData(result.encrypted, password1, result.salt);
        console.log('✅ Correct password works:', correctDecryption === testData);

        // Test 3: Try to decrypt with wrong password "0"
        console.log('Attempting decryption with wrong password "0"...');
        try {
            const wrongDecryption = await encryptionService.decryptData(result.encrypted, password2, result.salt);
            console.log('🚨 SECURITY BUG: Wrong password accepted!');
            console.log('Decrypted:', wrongDecryption);
            return false;
        } catch (error) {
            console.log('✅ Wrong password correctly rejected:', error.message);
            return true;
        }

    } catch (error) {
        console.error('Test failed:', error.message);
        return false;
    }
}

testPasswordSecurity().then(success => {
    if (success) {
        console.log('🎉 Password security test PASSED');
    } else {
        console.log('❌ Password security test FAILED');
    }
});
