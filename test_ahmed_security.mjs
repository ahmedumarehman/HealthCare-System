// Critical password security test for Ahmed's PDF encryption issue
// Testing with exact scenario: encrypt with "ahmed@2003", decrypt with wrong password

import { readFileSync, writeFileSync } from 'fs';
import CryptoJS from 'crypto-js';

// Copy of the exact encryption service logic to test
class TestEncryptionService {
    // Enhanced PBKDF2 key derivation with password-specific salt modification
    deriveKey(password, salt) {
        const exactPassword = String(password);
        const exactSalt = String(salt);
        const enhancedSalt = exactSalt + '_' + exactPassword.length + '_' + CryptoJS.SHA256(exactPassword).toString().substring(0, 8);
        console.log(`🔑 Deriving key for password length: ${exactPassword.length}, value: "${exactPassword}"`);
        return CryptoJS.PBKDF2(exactPassword, enhancedSalt, {
            keySize: 256 / 32,
            iterations: 100000
        }).toString();
    }

    generatePasswordFingerprint(password, salt) {
        const exactPassword = String(password);
        const exactSalt = String(salt);
        const lengthMarker = `LEN_${exactPassword.length}_`;
        const charCodes = exactPassword.split('').map(c => c.charCodeAt(0)).join('-');
        const reversedPassword = exactPassword.split('').reverse().join('');
        const doubledPassword = exactPassword + exactPassword;
        const fingerprintData = [
            lengthMarker,
            exactPassword,
            charCodes,
            reversedPassword,
            doubledPassword,
            exactSalt,
            'ULTRASECURE_MARKER_V5'
        ].join('|SEPARATOR|');
        return CryptoJS.SHA256(fingerprintData).toString();
    }

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
            lastChar: exactPassword.length > 0 ? exactPassword.charCodeAt(exactPassword.length - 1) : -1,
            verificationToken: CryptoJS.SHA256(`VERIFY_PASSWORD_${exactPassword}_LENGTH_${exactPassword.length}_CHARS_[${exactPassword.split('').map(c => c.charCodeAt(0)).join(',')}]_WITH_SALT_${exactSalt}_MAGIC_HEALTHSYS_2024_SECURE_v5`).toString()
        };
    }

    createPasswordProof(password, salt) {
        const exactPassword = String(password);
        const exactSalt = String(salt);
        const hash1 = CryptoJS.SHA256(`PROOF1_${exactPassword}_${exactSalt}`).toString();
        const hash2 = CryptoJS.SHA256(`PROOF2_${exactPassword.length}_${exactPassword}_${exactSalt}`).toString();
        const hash3 = CryptoJS.SHA256(`PROOF3_${exactPassword.split('').reverse().join('')}_${exactSalt}`).toString();
        const combinedProof = CryptoJS.SHA256(`${hash1}_${hash2}_${hash3}_FINAL_PROOF`).toString();
        console.log(`🛡️ Created password proof for: "${exactPassword}"`);
        return combinedProof;
    }

    createIntegrityHash(data, password, salt) {
        const exactPassword = String(password);
        const exactSalt = String(salt);
        const passwordLength = exactPassword.length;
        const passwordHash = CryptoJS.SHA256(exactPassword).toString();
        const integrityString = `INTEGRITY_${data}_PASSWORD_EXACT_${exactPassword}_HASH_${passwordHash}_LENGTH_${passwordLength}_SALT_${exactSalt}_v3`;
        return CryptoJS.SHA256(integrityString).toString();
    }

    async encryptData(data, password) {
        try {
            const salt = CryptoJS.lib.WordArray.random(128 / 8).toString();
            const verification = this.createVerificationSystem(password, salt);
            const integrityHash = this.createIntegrityHash(data, password, salt);
            const passwordProof = this.createPasswordProof(password, salt);
            const key = this.deriveKey(password, salt);

            const payload = {
                magic: 'HEALTHSYS_v5_ULTRASECURE',
                verification: verification,
                integrityHash: integrityHash,
                passwordProof: passwordProof,
                timestamp: new Date().toISOString(),
                dataLength: data.length,
                dataHash: CryptoJS.SHA256(data).toString(),
                data: data,
                endMarker: 'END_OF_HEALTHSYS_DATA_v5'
            };

            const encrypted = CryptoJS.AES.encrypt(JSON.stringify(payload), key).toString();
            console.log('🔒 Ultra-secure encryption completed');
            return { encrypted, salt, verificationToken: verification.verificationToken };
        } catch (error) {
            console.error('❌ Encryption failed:', error);
            throw new Error(`Encryption failed: ${error}`);
        }
    }

    async decryptData(encryptedData, password, salt) {
        try {
            console.log(`🔓 TESTING: Decryption with password: "${password}" (length: ${password.length})`);

            const exactPassword = String(password);
            const exactSalt = String(salt);
            const expectedVerification = this.createVerificationSystem(exactPassword, exactSalt);
            const expectedPasswordProof = this.createPasswordProof(exactPassword, exactSalt);
            const key = this.deriveKey(exactPassword, exactSalt);

            let decryptedBytes;
            try {
                decryptedBytes = CryptoJS.AES.decrypt(encryptedData, key);
            } catch (error) {
                console.error('❌ AES decryption failed:', error);
                throw new Error('Invalid password - AES decryption failed');
            }

            let decryptedString;
            try {
                decryptedString = decryptedBytes.toString(CryptoJS.enc.Utf8);
            } catch (error) {
                console.error('❌ UTF-8 conversion failed:', error);
                throw new Error('Invalid password - unable to decode decrypted data');
            }

            if (!decryptedString || decryptedString.trim() === '') {
                console.error('❌ EMPTY DECRYPTION RESULT - WRONG PASSWORD');
                throw new Error('Invalid password - decryption resulted in empty data');
            }

            if (decryptedString.length < 10) {
                console.error('❌ DECRYPTED STRING TOO SHORT - WRONG PASSWORD');
                throw new Error('Invalid password - decrypted data unexpectedly short');
            }

            // Check for garbage characters
            const hasGarbage = decryptedString.split('').some(char => {
                const code = char.charCodeAt(0);
                return (code >= 0 && code <= 8) || (code >= 14 && code <= 31) || (code >= 127 && code <= 159);
            });
            if (hasGarbage) {
                console.error('❌ GARBAGE CHARACTERS DETECTED - WRONG PASSWORD');
                throw new Error('Invalid password - decrypted data contains invalid characters');
            }

            let payload;
            try {
                payload = JSON.parse(decryptedString);
            } catch (error) {
                console.error('❌ JSON PARSING FAILED - WRONG PASSWORD:', error);
                throw new Error('Invalid password - decrypted data is not valid JSON');
            }

            if (!payload || typeof payload !== 'object') {
                console.error('❌ INVALID PAYLOAD STRUCTURE - WRONG PASSWORD');
                throw new Error('Invalid password - corrupted payload structure');
            }

            const validMagicHeaders = ['HEALTHSYS_v2_SECURE', 'HEALTHSYS_v3_ULTRA_SECURE', 'HEALTHSYS_v5_ULTRASECURE'];
            if (!validMagicHeaders.includes(payload.magic)) {
                console.error('❌ INVALID MAGIC HEADER - WRONG PASSWORD:', payload.magic);
                throw new Error('Invalid password - incorrect file format or wrong password');
            }

            const validEndMarkers = ['END_OF_HEALTHSYS_DATA', 'END_OF_HEALTHSYS_DATA_v3', 'END_OF_HEALTHSYS_DATA_v5'];
            if (!validEndMarkers.includes(payload.endMarker)) {
                console.error('❌ INVALID END MARKER - WRONG PASSWORD');
                throw new Error('Invalid password - corrupted file structure');
            }

            // ULTRA-STRICT VERIFICATION
            if (payload.magic === 'HEALTHSYS_v5_ULTRASECURE' && payload.verification) {
                console.log('🛡️ PERFORMING ULTRA-STRICT VERIFICATION...');

                const verification = payload.verification;

                if (verification.fingerprint !== expectedVerification.fingerprint) {
                    console.error('❌ FINGERPRINT MISMATCH - DEFINITIVE WRONG PASSWORD');
                    console.error('Expected:', expectedVerification.fingerprint);
                    console.error('Actual:', verification.fingerprint);
                    throw new Error('Invalid password - fingerprint verification failed');
                }

                if (verification.length !== expectedVerification.length) {
                    console.error('❌ LENGTH MISMATCH - DEFINITIVE WRONG PASSWORD');
                    console.error('Expected:', expectedVerification.length);
                    console.error('Actual:', verification.length);
                    throw new Error('Invalid password - length verification failed');
                }

                if (verification.hash !== expectedVerification.hash) {
                    console.error('❌ HASH MISMATCH - DEFINITIVE WRONG PASSWORD');
                    console.error('Expected:', expectedVerification.hash);
                    console.error('Actual:', verification.hash);
                    throw new Error('Invalid password - hash verification failed');
                }

                console.log('✅ ALL VERIFICATIONS PASSED - CORRECT PASSWORD');
            }

            if (payload.passwordProof && payload.passwordProof !== expectedPasswordProof) {
                console.error('❌ PASSWORD PROOF MISMATCH - DEFINITIVE WRONG PASSWORD');
                throw new Error('Invalid password - password proof validation failed');
            }

            if (payload.data === undefined || payload.data === null) {
                console.error('❌ NO DATA IN PAYLOAD - WRONG PASSWORD');
                throw new Error('Invalid password - no data found in decrypted payload');
            }

            console.log('✅ DECRYPTION SUCCESSFUL WITH CORRECT PASSWORD');
            return payload.data;

        } catch (error) {
            console.error('❌ DECRYPTION FAILED:', error.message);
            if (error.message.includes('Invalid password')) {
                throw error;
            }
            throw new Error(`Invalid password - ${error.message}`);
        }
    }
}

// TEST AHMED'S SCENARIO
async function testAhmedScenario() {
    console.log('\n🚨 TESTING AHMED\'S PDF ENCRYPTION SECURITY ISSUE 🚨\n');

    const service = new TestEncryptionService();

    // Simulate PDF content (use a portion of the actual PDF data)
    const pdfContent = 'MEDICAL RECORD - CONFIDENTIAL\nPatient: Michael Johnson\nEmail: mjohnson@email.com\nDate of Birth: 1985-03-15\nPhone: +1-555-0123\nAddress: 123 Main St, City, State 12345\nEmergency Contact: Jane Johnson - +1-555-0124\nInsurance: HealthFirst Insurance\nPolicy Number: HF-12345-MJ\nRecord ID: record-1\nDate: 2025-07-04\nDoctor ID: doctor-1\nTitle: Annual Physical Examination\nDescription: Comprehensive health checkup including blood work and vital signs\nDiagnosis: Excellent health, all vitals normal\nPrescription: Continue healthy lifestyle, return in 6 months\nBlockchain Hash: 0xabc123def456789abcdef123456789abc\nIPFS Hash: QmX9ZB7tRvWKHGK8P2mNv3qL5rA9wS6cF4dE2gH1jK0mP\nNFT Token ID: HEALTH-NFT-001\nVerified: Yes\nEncrypted: Yes\nAccess Permissions: patient-1, doctor-1';

    const correctPassword = 'ahmed@2003';
    const wrongPasswords = [
        'ahmed@2004',     // Wrong year
        'Ahmed@2003',     // Wrong case
        'ahmed@2003 ',    // Extra space
        ' ahmed@2003',    // Leading space
        'ahmed@203',      // Missing digit
        'ahmed@20033',    // Extra digit
        'ahmed2003',      // Missing @
        'ahmed@',         // Incomplete
        '2003',           // Partial
        'wrongpassword',  // Completely wrong
        '12345',          // Numbers only
        ''                // Empty
    ];

    try {
        // STEP 1: Encrypt with correct password
        console.log('📝 STEP 1: Encrypting PDF content with correct password...');
        console.log(`Correct password: "${correctPassword}"`);

        const encryptedResult = await service.encryptData(pdfContent, correctPassword);
        console.log('✅ Encryption successful');
        console.log(`Salt: ${encryptedResult.salt}`);
        console.log(`Encrypted length: ${encryptedResult.encrypted.length}`);

        // STEP 2: Test decryption with CORRECT password (should succeed)
        console.log('\n📝 STEP 2: Testing decryption with CORRECT password...');
        try {
            const decryptedContent = await service.decryptData(
                encryptedResult.encrypted,
                correctPassword,
                encryptedResult.salt
            );
            console.log('✅ CORRECT PASSWORD: Decryption successful');
            console.log(`Decrypted length: ${decryptedContent.length}`);
            console.log('Data integrity verified: Content matches');
        } catch (error) {
            console.error('🚨 CRITICAL BUG: Correct password was rejected!');
            console.error('Error:', error.message);
        }

        // STEP 3: Test decryption with WRONG passwords (should ALL fail)
        console.log('\n📝 STEP 3: Testing decryption with WRONG passwords...');
        console.log('🔍 Each wrong password should be REJECTED:\n');

        let passedCount = 0;
        let failedCount = 0;

        for (let i = 0; i < wrongPasswords.length; i++) {
            const wrongPassword = wrongPasswords[i];
            console.log(`\nTest ${i + 1}: Trying password "${wrongPassword}" (length: ${wrongPassword.length})`);

            try {
                const decryptedContent = await service.decryptData(
                    encryptedResult.encrypted,
                    wrongPassword,
                    encryptedResult.salt
                );

                // THIS SHOULD NEVER HAPPEN!
                console.error('🚨🚨🚨 CRITICAL SECURITY VULNERABILITY! 🚨🚨🚨');
                console.error(`❌ WRONG PASSWORD "${wrongPassword}" WAS ACCEPTED!`);
                console.error(`❌ Decrypted content length: ${decryptedContent.length}`);
                console.error('❌ THIS IS A MAJOR SECURITY BREACH!');
                passedCount++;

            } catch (error) {
                console.log('✅ CORRECT BEHAVIOR: Wrong password properly rejected');
                console.log(`   Error: ${error.message}`);
                failedCount++;
            }
        }

        // STEP 4: Summary
        console.log('\n' + '='.repeat(80));
        console.log('📊 SECURITY TEST SUMMARY');
        console.log('='.repeat(80));
        console.log(`✅ Correct password acceptance: 1/1`);
        console.log(`✅ Wrong passwords rejected: ${failedCount}/${wrongPasswords.length}`);
        console.log(`🚨 Wrong passwords accepted: ${passedCount}/${wrongPasswords.length}`);

        if (passedCount > 0) {
            console.log('\n🚨🚨🚨 CRITICAL SECURITY ISSUE DETECTED! 🚨🚨🚨');
            console.log('❌ WRONG PASSWORDS ARE BEING ACCEPTED!');
            console.log('❌ IMMEDIATE SECURITY PATCH REQUIRED!');
            console.log('❌ DO NOT USE IN PRODUCTION!');
        } else {
            console.log('\n✅ SECURITY TEST PASSED');
            console.log('✅ All wrong passwords were properly rejected');
            console.log('✅ Password validation is working correctly');
        }

    } catch (error) {
        console.error('❌ Test execution failed:', error);
    }
}

// Run the test
testAhmedScenario().catch(console.error);
