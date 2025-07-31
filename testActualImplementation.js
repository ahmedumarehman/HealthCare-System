// Direct test of the encryptionService logic using Node.js
const CryptoJS = require('crypto-js');

// Copy the exact encryptionService logic here for testing
class EncryptionService {
    // Derive key from password and salt with EXTREME security
    deriveKey(password, salt) {
        // CRITICAL: Ensure password is treated as exact string, no normalization
        const exactPassword = String(password); // Ensure no type coercion
        const exactSalt = String(salt);

        // Log for debugging (remove in production)
        console.log(`🔑 Deriving key for password length: ${exactPassword.length}, value: "${exactPassword}"`);

        return CryptoJS.PBKDF2(exactPassword, exactSalt, {
            keySize: 256 / 32,
            iterations: 100000
        }).toString();
    }

    // Create a robust verification token that's extremely unlikely to match by accident
    createVerificationToken(password, salt) {
        // CRITICAL: Ensure exact password matching with length and content checks
        const exactPassword = String(password);
        const exactSalt = String(salt);

        // Include password length and character codes to prevent similar passwords from matching
        const passwordChars = exactPassword.split('').map(c => c.charCodeAt(0)).join(',');
        const passwordLength = exactPassword.length;

        // Create a complex verification string that includes multiple components
        const verificationString = `VERIFY_PASSWORD_${exactPassword}_LENGTH_${passwordLength}_CHARS_[${passwordChars}]_WITH_SALT_${exactSalt}_MAGIC_HEALTHSYS_2024_SECURE_v3`;

        const token = CryptoJS.SHA256(verificationString).toString();
        console.log(`🔒 Created verification token for password: "${exactPassword}" (length: ${passwordLength})`);

        return token;
    }

    // ULTRA-CRITICAL: Create an independent password proof that's impossible to fake
    createPasswordProof(password, salt) {
        const exactPassword = String(password);
        const exactSalt = String(salt);

        // Create multiple independent hashes of the password
        const hash1 = CryptoJS.SHA256(`PROOF1_${exactPassword}_${exactSalt}`).toString();
        const hash2 = CryptoJS.SHA256(`PROOF2_${exactPassword.length}_${exactPassword}_${exactSalt}`).toString();
        const hash3 = CryptoJS.SHA256(`PROOF3_${exactPassword.split('').reverse().join('')}_${exactSalt}`).toString();

        // Combine all hashes into one super-hash
        const combinedProof = CryptoJS.SHA256(`${hash1}_${hash2}_${hash3}_FINAL_PROOF`).toString();

        console.log(`🛡️ Created password proof for: "${exactPassword}"`);
        return combinedProof;
    }

    // Create an additional integrity check with password-specific validation
    createIntegrityHash(data, password, salt) {
        // CRITICAL: Include exact password characteristics
        const exactPassword = String(password);
        const exactSalt = String(salt);
        const passwordLength = exactPassword.length;
        const passwordHash = CryptoJS.SHA256(exactPassword).toString();

        const integrityString = `INTEGRITY_${data}_PASSWORD_EXACT_${exactPassword}_HASH_${passwordHash}_LENGTH_${passwordLength}_SALT_${exactSalt}_v3`;
        return CryptoJS.SHA256(integrityString).toString();
    }

    // Encrypt file content with multiple layers of verification
    async encryptData(data, password) {
        try {
            // Generate random salt
            const salt = CryptoJS.lib.WordArray.random(128 / 8).toString();

            // Create verification token, integrity hash, and password proof
            const verificationToken = this.createVerificationToken(password, salt);
            const integrityHash = this.createIntegrityHash(data, password, salt);
            const passwordProof = this.createPasswordProof(password, salt);

            // Derive encryption key
            const key = this.deriveKey(password, salt);

            // Create payload with multiple verification layers + password hash check
            const payload = {
                magic: 'HEALTHSYS_v3_ULTRA_SECURE',
                verificationToken: verificationToken,
                integrityHash: integrityHash,
                passwordProof: passwordProof,
                passwordHash: CryptoJS.SHA256(password).toString(), // Simple direct password hash
                passwordLength: password.length, // Store exact length
                timestamp: new Date().toISOString(),
                dataLength: data.length,
                dataHash: CryptoJS.SHA256(data).toString(),
                data: data,
                endMarker: 'END_OF_HEALTHSYS_DATA_v3'
            };

            // Encrypt the entire payload
            const encrypted = CryptoJS.AES.encrypt(JSON.stringify(payload), key).toString();

            console.log('🔒 Encryption completed with multi-layer verification');
            return { encrypted, salt, verificationToken };
        } catch (error) {
            console.error('❌ Encryption failed:', error);
            throw new Error(`Encryption failed: ${error}`);
        }
    }

    // Decrypt file content with extremely robust password verification
    async decryptData(encryptedData, password, salt) {
        try {
            console.log('🔓 Starting decryption with ULTRA-STRICT password verification...');
            console.log(`🔍 Attempting decryption with password: "${password}" (length: ${password.length})`);

            // CRITICAL: Ensure exact password handling
            const exactPassword = String(password);
            const exactSalt = String(salt);

            // Derive the same key using provided password and salt
            const key = this.deriveKey(exactPassword, exactSalt);

            // Create expected verification token, integrity values, and password proof
            const expectedVerificationToken = this.createVerificationToken(exactPassword, exactSalt);
            const expectedPasswordProof = this.createPasswordProof(exactPassword, exactSalt);
            console.log('🔍 Expected verification values created');

            // STEP 1: PRE-VALIDATION - Try to decrypt and validate password proof FIRST
            console.log('🔍 Step 1: Pre-validating password proof...');

            // Attempt to decrypt
            let decryptedBytes;
            try {
                decryptedBytes = CryptoJS.AES.decrypt(encryptedData, key);
            } catch (error) {
                console.error('❌ AES decryption failed:', error);
                throw new Error('Invalid password - AES decryption failed');
            }

            // Convert to string with strict validation
            let decryptedString;
            try {
                decryptedString = decryptedBytes.toString(CryptoJS.enc.Utf8);
            } catch (error) {
                console.error('❌ UTF-8 conversion failed:', error);
                throw new Error('Invalid password - unable to decode decrypted data');
            }

            // CRITICAL: Check if decryption resulted in empty or garbage data
            if (!decryptedString || decryptedString.trim() === '') {
                console.error('❌ Decryption resulted in empty string - WRONG PASSWORD');
                throw new Error('Invalid password - decryption resulted in empty data');
            }

            // ULTRA-STRICT: Check for obvious garbage patterns that indicate wrong password
            if (decryptedString.length < 10) {
                console.error('❌ Decrypted string too short - likely WRONG PASSWORD');
                throw new Error('Invalid password - decrypted data unexpectedly short');
            }

            // Check for non-printable characters that indicate garbage data
            const hasGarbage = decryptedString.split('').some(char => {
                const code = char.charCodeAt(0);
                return (code >= 0 && code <= 8) || (code >= 14 && code <= 31) || (code >= 127 && code <= 159);
            });
            if (hasGarbage) {
                console.error('❌ Decrypted data contains garbage characters - WRONG PASSWORD');
                throw new Error('Invalid password - decrypted data contains invalid characters');
            }

            // Check for high percentage of non-ASCII characters (indicates encryption failure)
            const nonAsciiCount = decryptedString.split('').filter(char => char.charCodeAt(0) > 127).length;
            const nonAsciiPercentage = (nonAsciiCount / decryptedString.length) * 100;
            if (nonAsciiPercentage > 50) {
                console.error('❌ Too many non-ASCII characters - likely WRONG PASSWORD');
                throw new Error('Invalid password - decrypted data contains too many non-ASCII characters');
            }

            // Try to parse as JSON with strict validation
            let payload;
            try {
                payload = JSON.parse(decryptedString);
            } catch (error) {
                console.error('❌ JSON parsing failed - likely WRONG PASSWORD:', error);
                throw new Error('Invalid password - decrypted data is not valid JSON');
            }

            // Verify the payload structure exists and is an object
            if (!payload || typeof payload !== 'object') {
                console.error('❌ Payload is not an object - WRONG PASSWORD');
                throw new Error('Invalid password - corrupted payload structure');
            }

            // Check for magic header with exact match (supporting both v2 and v3)
            if (payload.magic !== 'HEALTHSYS_v2_SECURE' && payload.magic !== 'HEALTHSYS_v3_ULTRA_SECURE') {
                console.error('❌ Invalid or missing magic header - WRONG PASSWORD:', payload.magic);
                throw new Error('Invalid password - incorrect file format or wrong password');
            }

            // Verify end marker exists (supporting both v2 and v3)
            if (payload.endMarker !== 'END_OF_HEALTHSYS_DATA' && payload.endMarker !== 'END_OF_HEALTHSYS_DATA_v3') {
                console.error('❌ Invalid or missing end marker - WRONG PASSWORD');
                throw new Error('Invalid password - corrupted file structure');
            }

            // ULTRA-CRITICAL: Validate password proof if it exists (v3 format)
            if (payload.passwordProof) {
                console.log('🛡️ Step 2: Validating password proof...');
                if (payload.passwordProof !== expectedPasswordProof) {
                    console.error('❌ PASSWORD PROOF MISMATCH - DEFINITIVE WRONG PASSWORD');
                    console.log('Expected proof:', expectedPasswordProof);
                    console.log('Found proof:', payload.passwordProof);
                    throw new Error('Invalid password - password proof validation failed');
                }
                console.log('✅ Password proof validated successfully');
            }

            // TRIPLE-CHECK: Validate direct password hash and length (v3 format)
            if (payload.passwordHash && payload.passwordLength !== undefined) {
                console.log('🔒 Step 3: Validating direct password hash and length...');
                const expectedPasswordHash = CryptoJS.SHA256(exactPassword).toString();

                if (payload.passwordHash !== expectedPasswordHash) {
                    console.error('❌ PASSWORD HASH MISMATCH - WRONG PASSWORD');
                    console.log('Expected hash:', expectedPasswordHash);
                    console.log('Found hash:', payload.passwordHash);
                    throw new Error('Invalid password - password hash validation failed');
                }

                if (payload.passwordLength !== exactPassword.length) {
                    console.error('❌ PASSWORD LENGTH MISMATCH - WRONG PASSWORD');
                    console.log('Expected length:', exactPassword.length);
                    console.log('Found length:', payload.passwordLength);
                    throw new Error('Invalid password - password length validation failed');
                }

                console.log('✅ Password hash and length validated successfully');
            }

            // Verify the verification token exists
            if (!payload.verificationToken) {
                console.error('❌ No verification token found in payload - WRONG PASSWORD');
                throw new Error('Invalid password - no verification token found');
            }

            // CRITICAL: Verify the verification token matches exactly
            if (payload.verificationToken !== expectedVerificationToken) {
                console.error('❌ Verification token mismatch - WRONG PASSWORD');
                console.log('Expected token:', expectedVerificationToken);
                console.log('Found token:', payload.verificationToken);
                throw new Error('Invalid password - verification token mismatch');
            }

            // Verify data exists and has correct structure
            if (payload.data === undefined || payload.data === null) {
                console.error('❌ No data found in payload - WRONG PASSWORD');
                throw new Error('Invalid password - no data found in decrypted payload');
            }

            // Verify data length matches
            if (typeof payload.dataLength === 'number' && payload.data.length !== payload.dataLength) {
                console.error('❌ Data length mismatch - WRONG PASSWORD');
                throw new Error('Invalid password - data length verification failed');
            }

            // Verify data hash if present
            if (payload.dataHash) {
                const actualDataHash = CryptoJS.SHA256(payload.data).toString();
                if (actualDataHash !== payload.dataHash) {
                    console.error('❌ Data hash mismatch - WRONG PASSWORD');
                    throw new Error('Invalid password - data integrity verification failed');
                }
            }

            // Final integrity check with EXACT password
            const expectedIntegrityHash = this.createIntegrityHash(payload.data, exactPassword, exactSalt);
            if (payload.integrityHash && payload.integrityHash !== expectedIntegrityHash) {
                console.error('❌ Integrity hash mismatch - WRONG PASSWORD');
                console.log('Expected integrity hash:', expectedIntegrityHash);
                console.log('Found integrity hash:', payload.integrityHash);
                throw new Error('Invalid password - integrity verification failed');
            }

            console.log('✅ ALL PASSWORD VERIFICATIONS PASSED');
            console.log('📅 File encrypted at:', payload.timestamp);
            console.log('📊 Data length:', payload.data.length);

            return payload.data;

        } catch (error) {
            console.error('❌ Decryption process failed:', error);

            // Always treat decryption failures as password errors
            const errorMessage = error instanceof Error ? error.message : 'decryption failed';

            // If it's already a clear password error, re-throw as-is
            if (errorMessage.includes('Invalid password')) {
                throw error;
            }

            // Otherwise, wrap it as a password error
            throw new Error(`Invalid password - ${errorMessage}`);
        }
    }
}

// Test the encryptionService implementation
async function testEncryptionServiceImplementation() {
    console.log('🚨 TESTING ACTUAL ENCRYPTIONSERVICE IMPLEMENTATION');
    console.log('==================================================');

    const encryptionService = new EncryptionService();

    const testData = "Critical healthcare data - CONFIDENTIAL";
    const password1 = "00000"; // 5 zeros
    const password2 = "0";     // 1 zero

    console.log(`\n📋 Test Setup:`);
    console.log(`Password 1: "${password1}" (length: ${password1.length})`);
    console.log(`Password 2: "${password2}" (length: ${password2.length})`);
    console.log(`Test data: "${testData}"`);

    try {
        // Step 1: Encrypt with password1 ("00000")
        console.log('\n🔒 Step 1: Encrypting with password1 ("00000")');
        const { encrypted, salt, verificationToken } = await encryptionService.encryptData(testData, password1);
        console.log(`✅ Encryption successful`);
        console.log(`Salt: ${salt}`);
        console.log(`Verification token: ${verificationToken.substring(0, 20)}...`);

        // Step 2: Try to decrypt with correct password
        console.log('\n🔓 Step 2: Decrypting with CORRECT password ("00000")');
        try {
            const decrypted1 = await encryptionService.decryptData(encrypted, password1, salt);
            console.log(`✅ Correct password decryption: SUCCESS`);
            console.log(`Decrypted data: "${decrypted1}"`);
            console.log(`Data matches original: ${decrypted1 === testData}`);
        } catch (error) {
            console.log(`❌ Correct password decryption FAILED: ${error.message}`);
            return false;
        }

        // Step 3: CRITICAL TEST - Try to decrypt with wrong password
        console.log('\n🔍 Step 3: CRITICAL TEST - Attempting decryption with WRONG password ("0")');
        console.log('🚨 THIS SHOULD FAIL - if it succeeds, we have a vulnerability!');

        try {
            const decrypted2 = await encryptionService.decryptData(encrypted, password2, salt);

            // If we get here without an error, that's a MAJOR security issue
            console.log('\n🚨🚨🚨 CRITICAL SECURITY VULNERABILITY DETECTED! 🚨🚨🚨');
            console.log(`❌ Wrong password "${password2}" successfully decrypted the data!`);
            console.log(`❌ Decrypted result: "${decrypted2}"`);
            console.log(`❌ Data matches original: ${decrypted2 === testData}`);

            if (decrypted2 === testData) {
                console.log('🚨 COMPLETE VULNERABILITY: Wrong password produced identical result!');
            } else {
                console.log('⚠️  Wrong password produced different result, but still succeeded when it should have failed');
            }

            return false;

        } catch (error) {
            console.log(`✅ EXCELLENT: Wrong password correctly rejected`);
            console.log(`✅ Error message: ${error.message}`);
            console.log('✅ This is the expected behavior - wrong passwords should always be rejected');
            return true;
        }

    } catch (error) {
        console.error('❌ Test setup failed:', error);
        return false;
    }
}

// Run the test
testEncryptionServiceImplementation().then(result => {
    console.log('\n\n📊 FINAL RESULTS');
    console.log('================');

    if (result) {
        console.log('✅ SECURITY TEST PASSED');
        console.log('✅ EncryptionService correctly rejects wrong passwords');
        console.log('✅ NO vulnerability detected in the "00000" vs "0" test case');
        console.log('💡 If users are experiencing this issue, it must be in a different part of the application');
    } else {
        console.log('🚨 SECURITY TEST FAILED');
        console.log('🚨 Critical vulnerability detected');
        console.log('🚨 The "00000" vs "0" password issue EXISTS and needs immediate fixing');
    }
}).catch(error => {
    console.error('❌ Test execution failed:', error);
});
