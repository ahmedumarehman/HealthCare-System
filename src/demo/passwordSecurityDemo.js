/**
 * BROWSER-COMPATIBLE PASSWORD SECURITY DEMO
 * Run this in the doctor dashboard to verify the fix
 */

async function demonstratePasswordSecurity() {
    console.log('🔒 PASSWORD SECURITY DEMONSTRATION');
    console.log('==================================');

    // Import encryption service (adjust path as needed)
    const { encryptionService } = await import('./services/encryptionService.js');

    const results = [];
    const addResult = (message) => {
        results.push(message);
        console.log(message);
    };

    try {
        const testData = 'Sensitive Patient Information';
        const password1 = '00000';
        const password2 = '0';

        addResult('📝 Testing passwords "00000" vs "0"');
        addResult(`Test data: "${testData}"`);
        addResult('');

        // Encrypt with "00000"
        addResult('🔐 Encrypting with password "00000"...');
        const result = await encryptionService.encryptData(testData, password1);
        addResult('✅ Encryption successful');

        // Test correct password
        addResult('🔓 Testing CORRECT password "00000"...');
        try {
            const correct = await encryptionService.decryptData(result.encrypted, password1, result.salt);
            addResult('✅ Correct password works: ' + (correct === testData));
        } catch (error) {
            addResult('❌ Correct password failed: ' + error.message);
        }

        // Test wrong password
        addResult('🔓 Testing WRONG password "0"...');
        try {
            const wrong = await encryptionService.decryptData(result.encrypted, password2, result.salt);
            addResult('🚨 SECURITY BUG: Wrong password accepted!');
            addResult('🚨 Decrypted: ' + wrong);
        } catch (error) {
            addResult('✅ Wrong password correctly rejected');
            addResult('✅ Error: ' + error.message);
        }

        addResult('');
        addResult('🎉 Password security test completed!');

    } catch (error) {
        addResult('❌ Test failed: ' + error.message);
    }

    return results;
}

// Make it available globally for browser testing
window.demonstratePasswordSecurity = demonstratePasswordSecurity;

// Auto-run if in Node.js environment
if (typeof window === 'undefined') {
    demonstratePasswordSecurity();
}

export { demonstratePasswordSecurity };
