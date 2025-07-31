import { encryptionService } from '../services/encryptionService';

// Define interfaces for type safety
interface EncryptionResult {
    encrypted: string;
    salt: string; // Salt used in key derivation
}

interface EncryptionService {
    encryptData(data: string, password: string): Promise<EncryptionResult>;
    decryptData(encrypted: string, password: string, salt: string, iv: string): Promise<string>;
}

// Ensure encryptionService conforms to the interface
const typedEncryptionService: EncryptionService = encryptionService;

// Hypothetical assert function for testing (replace with Jest/Mocha assertions)
const assert = {
    equal(actual: any, expected: any, message: string): void {
        if (actual !== expected) {
            throw new Error(`${message}: Expected ${expected}, but got ${actual}`);
        }
    },
    throws(func: () => Promise<any>, expectedMessage: string): Promise<void> {
        return func().then(
            () => {
                throw new Error(`Expected error "${expectedMessage}", but no error was thrown`);
            },
            (error) => {
                if (error.message !== expectedMessage) {
                    throw new Error(`Expected error "${expectedMessage}", but got "${error.message}"`);
                }
            }
        );
    }
};

/**
 * Tests encryption and decryption with a correct and incorrect password pair.
 * @param correctPassword - The password used for encryption.
 * @param wrongPassword - The password that should fail decryption.
 * @param testName - Name of the test for logging purposes.
 */
async function testPasswordPair(
    correctPassword: string,
    wrongPassword: string,
    testName: string
): Promise<void> {
    console.log(`🧪 Testing ${testName}`);
    const testData = 'This is healthcare data';

    try {
        // Encrypt with correct password
        console.log(`🔒 Encrypting with password "${correctPassword}"...`);
        const { encrypted, salt } = await typedEncryptionService.encryptData(testData, correctPassword);

        // Validate encryption result
        assert.equal(typeof encrypted, 'string', 'Encrypted data should be a string');
        assert.equal(typeof salt, 'string', 'Salt should be a string');
        console.log('✅ Encryption successful');

        // Test decryption with correct password
        console.log(`\n🔓 Testing correct password "${correctPassword}"...`);
        const iv = 'test-iv'; // Replace with actual IV generation logic if needed
        const decryptedCorrect = await typedEncryptionService.decryptData(encrypted, correctPassword, salt, iv);
        assert.equal(decryptedCorrect, testData, 'Decryption with correct password failed');
        console.log('✅ Correct password works');

        // Test decryption with wrong password
        console.log(`\n🔍 Testing wrong password "${wrongPassword}"...`);
        await assert.throws(
            () => typedEncryptionService.decryptData(encrypted, wrongPassword, salt, iv),
            'Invalid password',
        );
        console.log(`✅ Wrong password "${wrongPassword}" properly rejected`);
    } catch (error: unknown) {
        console.error(`❌ Test "${testName}" failed:`, error instanceof Error ? error.message : error);
        throw error; // Rethrow to fail the test
    }
}

/**
 * Runs tests for the specific password issue ("00000" vs "0" and reverse).
 */
async function runPasswordTests(): Promise<void> {
    try {
        await testPasswordPair('00000', '0', 'Password "00000" vs "0"');
        await testPasswordPair('0', '00000', 'Password "0" vs "00000"');
        console.log('✅ All tests passed');
    } catch (error) {
        console.error('❌ One or more tests failed');
        throw error;
    }
}

export { testPasswordPair, runPasswordTests };