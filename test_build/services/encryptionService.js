"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.encryptionService = void 0;
const crypto_js_1 = __importDefault(require("crypto-js"));
class EncryptionService {
    constructor() {
        this.jobs = [];
    }
    // Derive key from password and salt with EXTREME security
    deriveKey(password, salt) {
        // CRITICAL: Ensure password is treated as exact string, no normalization
        const exactPassword = String(password); // Ensure no type coercion
        const exactSalt = String(salt);
        // Log for debugging (remove in production)
        console.log(`🔑 Deriving key for password length: ${exactPassword.length}, value: "${exactPassword}"`);
        return crypto_js_1.default.PBKDF2(exactPassword, exactSalt, {
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
        const token = crypto_js_1.default.SHA256(verificationString).toString();
        console.log(`🔒 Created verification token for password: "${exactPassword}" (length: ${passwordLength})`);
        return token;
    }
    // ULTRA-CRITICAL: Create an independent password proof that's impossible to fake
    createPasswordProof(password, salt) {
        const exactPassword = String(password);
        const exactSalt = String(salt);
        // Create multiple independent hashes of the password
        const hash1 = crypto_js_1.default.SHA256(`PROOF1_${exactPassword}_${exactSalt}`).toString();
        const hash2 = crypto_js_1.default.SHA256(`PROOF2_${exactPassword.length}_${exactPassword}_${exactSalt}`).toString();
        const hash3 = crypto_js_1.default.SHA256(`PROOF3_${exactPassword.split('').reverse().join('')}_${exactSalt}`).toString();
        // Combine all hashes into one super-hash
        const combinedProof = crypto_js_1.default.SHA256(`${hash1}_${hash2}_${hash3}_FINAL_PROOF`).toString();
        console.log(`🛡️ Created password proof for: "${exactPassword}"`);
        return combinedProof;
    }
    // Create an additional integrity check with password-specific validation
    createIntegrityHash(data, password, salt) {
        // CRITICAL: Include exact password characteristics
        const exactPassword = String(password);
        const exactSalt = String(salt);
        const passwordLength = exactPassword.length;
        const passwordHash = crypto_js_1.default.SHA256(exactPassword).toString();
        const integrityString = `INTEGRITY_${data}_PASSWORD_EXACT_${exactPassword}_HASH_${passwordHash}_LENGTH_${passwordLength}_SALT_${exactSalt}_v3`;
        return crypto_js_1.default.SHA256(integrityString).toString();
    }
    // Encrypt file content with multiple layers of verification
    async encryptData(data, password) {
        try {
            // Generate random salt
            const salt = crypto_js_1.default.lib.WordArray.random(128 / 8).toString();
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
                passwordHash: crypto_js_1.default.SHA256(password).toString(),
                passwordLength: password.length,
                timestamp: new Date().toISOString(),
                dataLength: data.length,
                dataHash: crypto_js_1.default.SHA256(data).toString(),
                data: data,
                endMarker: 'END_OF_HEALTHSYS_DATA_v3'
            };
            // Encrypt the entire payload
            const encrypted = crypto_js_1.default.AES.encrypt(JSON.stringify(payload), key).toString();
            console.log('🔒 Encryption completed with multi-layer verification');
            return { encrypted, salt, verificationToken };
        }
        catch (error) {
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
                decryptedBytes = crypto_js_1.default.AES.decrypt(encryptedData, key);
            }
            catch (error) {
                console.error('❌ AES decryption failed:', error);
                throw new Error('Invalid password - AES decryption failed');
            }
            // Convert to string with strict validation
            let decryptedString;
            try {
                decryptedString = decryptedBytes.toString(crypto_js_1.default.enc.Utf8);
            }
            catch (error) {
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
            }
            catch (error) {
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
                const expectedPasswordHash = crypto_js_1.default.SHA256(exactPassword).toString();
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
                const actualDataHash = crypto_js_1.default.SHA256(payload.data).toString();
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
        }
        catch (error) {
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
    // Handle file encryption (browser-based)
    async encryptFile(file, password) {
        const jobId = `enc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const job = {
            id: jobId,
            fileName: file.name,
            operation: 'encrypt',
            status: 'processing',
            timestamp: new Date().toISOString()
        };
        this.jobs.push(job);
        try {
            console.log('🔒 Starting file encryption for:', file.name);
            const text = await file.text();
            const { encrypted, salt, verificationToken } = await this.encryptData(text, password);
            // Create encrypted file with metadata
            const encryptedFileData = {
                encrypted,
                salt,
                verificationToken,
                originalName: file.name,
                encryptedAt: new Date().toISOString(),
                version: '2.0'
            };
            const encryptedFile = new Blob([JSON.stringify(encryptedFileData, null, 2)], {
                type: 'application/json'
            });
            const url = URL.createObjectURL(encryptedFile);
            job.status = 'completed';
            job.outputPath = url;
            console.log('✅ File encryption completed successfully');
            return job;
        }
        catch (error) {
            console.error('❌ File encryption failed:', error);
            job.status = 'failed';
            job.error = error instanceof Error ? error.message : 'Unknown error';
            throw error;
        }
    } // Handle file decryption (browser-based)
    async decryptFile(file, password) {
        const jobId = `dec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const job = {
            id: jobId,
            fileName: file.name,
            operation: 'decrypt',
            status: 'processing',
            timestamp: new Date().toISOString()
        };
        this.jobs.push(job);
        try {
            console.log('🔓 Starting file decryption for:', file.name);
            const text = await file.text();
            let fileData;
            try {
                fileData = JSON.parse(text);
            }
            catch (error) {
                console.error('❌ Invalid file format - not valid JSON');
                throw new Error('Invalid encrypted file format - unable to parse JSON');
            }
            // Check for required fields
            if (!fileData.encrypted || !fileData.salt) {
                console.error('❌ Missing required encryption data');
                throw new Error('Invalid encrypted file - missing required encryption data');
            }
            const { encrypted, salt, originalName, version } = fileData;
            // Validate password and decrypt data - no verification token parameter needed
            const decrypted = await this.decryptData(encrypted, password, salt);
            // Create download blob
            const decryptedFile = new Blob([decrypted], { type: 'text/plain' });
            const url = URL.createObjectURL(decryptedFile);
            job.status = 'completed';
            job.outputPath = url;
            job.fileName = originalName || 'decrypted_file.txt';
            console.log(`✅ Successfully decrypted file: ${originalName || file.name}`);
            if (version) {
                console.log(`📋 File was encrypted with version: ${version}`);
            }
            return job;
        }
        catch (error) {
            console.error('❌ File decryption failed:', error);
            job.status = 'failed';
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            job.error = errorMessage;
            // Throw the error to be caught by the UI
            throw new Error(errorMessage);
        }
    }
    // Get all encryption jobs
    getJobs() {
        return this.jobs;
    }
    // Clear completed jobs
    clearCompletedJobs() {
        this.jobs = this.jobs.filter(job => job.status === 'processing');
    }
    // Generate secure random password
    generateSecurePassword(length = 16) {
        const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
        let password = '';
        for (let i = 0; i < length; i++) {
            password += charset.charAt(Math.floor(Math.random() * charset.length));
        }
        return password;
    }
    // Hash data for integrity verification
    hashData(data) {
        return crypto_js_1.default.SHA256(data).toString();
    }
}
exports.encryptionService = new EncryptionService();
