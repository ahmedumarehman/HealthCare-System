import { EncryptionJob } from '../types';

// Web Crypto API for authenticated encryption (AES-GCM)
class AuthenticatedEncryption {
    // Convert string to ArrayBuffer
    private stringToArrayBuffer(str: string): ArrayBuffer {
        const encoder = new TextEncoder();
        return encoder.encode(str);
    }

    // Convert ArrayBuffer to string
    private arrayBufferToString(buffer: ArrayBuffer): string {
        const decoder = new TextDecoder();
        return decoder.decode(buffer);
    }

    // Convert ArrayBuffer to base64
    private arrayBufferToBase64(buffer: ArrayBuffer): string {
        const bytes = new Uint8Array(buffer);
        let binary = '';
        for (let i = 0; i < bytes.byteLength; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return btoa(binary);
    }

    // Convert base64 to ArrayBuffer
    private base64ToArrayBuffer(base64: string): ArrayBuffer {
        const binary = atob(base64);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
            bytes[i] = binary.charCodeAt(i);
        }
        return bytes.buffer;
    }

    // Derive key using PBKDF2
    private async deriveKey(password: string, salt: ArrayBuffer): Promise<CryptoKey> {
        const keyMaterial = await crypto.subtle.importKey(
            'raw',
            this.stringToArrayBuffer(password),
            { name: 'PBKDF2' },
            false,
            ['deriveKey']
        );

        return crypto.subtle.deriveKey(
            {
                name: 'PBKDF2',
                salt: salt,
                iterations: 100000,
                hash: 'SHA-256'
            },
            keyMaterial,
            { name: 'AES-GCM', length: 256 },
            false,
            ['encrypt', 'decrypt']
        );
    }

    // Authenticated encryption using AES-GCM
    async encrypt(data: string, password: string): Promise<{ encrypted: string; salt: string; iv: string }> {
        // Generate random salt and IV
        const salt = crypto.getRandomValues(new Uint8Array(16));
        const iv = crypto.getRandomValues(new Uint8Array(12)); // GCM uses 96-bit IV

        // Derive key from password
        const key = await this.deriveKey(password, salt.buffer);

        // Convert data to ArrayBuffer
        const dataBuffer = this.stringToArrayBuffer(data);

        // Encrypt with AES-GCM (provides both confidentiality and authenticity)
        const encryptedBuffer = await crypto.subtle.encrypt(
            {
                name: 'AES-GCM',
                iv: iv
            },
            key,
            dataBuffer
        );

        return {
            encrypted: this.arrayBufferToBase64(encryptedBuffer),
            salt: this.arrayBufferToBase64(salt.buffer),
            iv: this.arrayBufferToBase64(iv.buffer)
        };
    }

    // Authenticated decryption using AES-GCM
    async decrypt(encryptedData: string, password: string, salt: string, iv: string): Promise<string> {
        try {
            // Convert base64 back to ArrayBuffers
            const saltBuffer = this.base64ToArrayBuffer(salt);
            const ivBuffer = this.base64ToArrayBuffer(iv);
            const encryptedBuffer = this.base64ToArrayBuffer(encryptedData);

            // Derive the same key from password and salt
            const key = await this.deriveKey(password, saltBuffer);

            // Decrypt with AES-GCM
            // This will automatically fail if the password is wrong or data is tampered with
            const decryptedBuffer = await crypto.subtle.decrypt(
                {
                    name: 'AES-GCM',
                    iv: new Uint8Array(ivBuffer)
                },
                key,
                encryptedBuffer
            );

            // Convert back to string
            return this.arrayBufferToString(decryptedBuffer);
        } catch (error) {
            // AES-GCM will throw an error if password is wrong or data is corrupted
            console.error('❌ AES-GCM decryption failed (wrong password or corrupted data):', error);
            throw new Error('Invalid password - authentication failed');
        }
    }
}

const authenticatedCrypto = new AuthenticatedEncryption();

class EncryptionService {
    private jobs: EncryptionJob[] = [];

    // Enhanced password validation logic
    validatePassword(password: string): void {
        if (!password || password.trim() === '') {
            throw new Error('Password cannot be empty');
        }

        if (password.length < 8) {
            throw new Error('Password must be at least 8 characters long');
        }

        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumber = /[0-9]/.test(password);
        const hasSpecialChar = /[!@#$%^&*]/.test(password);

        if (!hasUpperCase || !hasLowerCase || !hasNumber || !hasSpecialChar) {
            throw new Error('Password must include uppercase, lowercase, number, and special character');
        }
    }

    // Simple data encryption using authenticated AES-GCM
    async encryptData(data: string, password: string): Promise<{ encrypted: string; salt: string; iv: string }> {
        try {
            console.log('🔒 Starting authenticated encryption...');

            // Validate password strength
            this.validatePassword(password);

            // Validate input
            if (!data || data.trim() === '') {
                throw new Error('Data cannot be empty');
            }

            // Use authenticated encryption (AES-GCM)
            const result = await authenticatedCrypto.encrypt(data, password);

            console.log('✅ Authenticated encryption completed successfully');
            return result;
        } catch (error) {
            console.error('❌ Encryption failed:', error);
            throw new Error(`Encryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    // Simple data decryption using authenticated AES-GCM
    async decryptData(encryptedData: string, password: string, salt: string, iv: string): Promise<string> {
        try {
            console.log('🔓 Starting authenticated decryption...');
            console.log(`🔍 Password: "${password}" (length: ${password.length})`);

            // Validate input
            if (!password || password.trim() === '') {
                throw new Error('Invalid password - password cannot be empty');
            }

            if (!encryptedData || !salt || !iv) {
                throw new Error('Invalid encrypted data - missing required fields');
            }

            // Use authenticated decryption (AES-GCM)
            const result = await authenticatedCrypto.decrypt(encryptedData, password, salt, iv);
            console.log('✅ Authenticated decryption successful');
            return result;
        } catch (error) {
            console.error('❌ Decryption failed:', error);
            throw new Error('Invalid password - authentication failed');
        }
    }

    // Handle file encryption (browser-based) with authenticated encryption
    async encryptFile(file: File, password: string): Promise<EncryptionJob> {
        const jobId = `enc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const job: EncryptionJob = {
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
            const { encrypted, salt, iv } = await this.encryptData(text, password);

            // Create encrypted file with metadata using authenticated format
            const encryptedFileData = {
                encrypted,
                salt,
                iv,
                originalName: file.name,
                encryptedAt: new Date().toISOString(),
                version: '3.0',
                format: 'AES-GCM'
            };

            // Update the file name to have a consistent .enc extension
            const baseName = file.name.includes('.')
                ? file.name.substring(0, file.name.lastIndexOf('.'))
                : file.name;
            const encryptedFileName = `${baseName}.enc`;
            job.fileName = encryptedFileName;

            // Ensure the file is saved with a consistent .enc extension
            const encryptedFile = new File([
                JSON.stringify(encryptedFileData, null, 2)
            ], encryptedFileName, {
                type: 'application/json'
            });

            const url = URL.createObjectURL(encryptedFile);

            job.status = 'completed';
            job.outputPath = url;

            console.log('✅ File encryption completed successfully with authenticated encryption');
            return job;
        } catch (error) {
            console.error('❌ File encryption failed:', error);
            job.status = 'failed';
            job.error = error instanceof Error ? error.message : 'Unknown error';
            throw error;
        }
    }

    // Handle file decryption (browser-based) with authenticated encryption
    async decryptFile(file: File, password: string): Promise<EncryptionJob> {
        const jobId = `dec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const job: EncryptionJob = {
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
            } catch (error) {
                console.error('❌ Invalid file format - not valid JSON');
                throw new Error('Invalid encrypted file format - unable to parse JSON');
            }

            // Check for required fields
            if (!fileData.encrypted || !fileData.salt || !fileData.iv) {
                console.error('❌ Missing required encryption data');
                throw new Error('Invalid encrypted file - missing required encryption data');
            }

            const { encrypted, salt, iv, originalName, version } = fileData;

            // Decrypt with authentication
            const decrypted = await this.decryptData(encrypted, password, salt, iv);

            // Determine the MIME type based on the original file extension
            const extension = (originalName || '').split('.').pop()?.toLowerCase();
            let mimeType = 'text/plain';
            if (extension === 'pdf') {
                mimeType = 'application/pdf';
            } else if (extension === 'json') {
                mimeType = 'application/json';
            } else if (['txt'].includes(extension || '')) {
                mimeType = 'text/plain';
            }

            // Create download blob
            const decryptedFile = new Blob([decrypted], { type: mimeType });
            const url = URL.createObjectURL(decryptedFile);

            job.status = 'completed';
            job.outputPath = url;
            job.fileName = originalName || `decrypted_file.${extension || 'txt'}`;

            console.log(`✅ Successfully decrypted file: ${originalName || file.name}`);
            if (version) {
                console.log(`📋 File was encrypted with version: ${version}`);
            }

            return job;
        } catch (error) {
            console.error('❌ File decryption failed:', error);
            job.status = 'failed';
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            job.error = errorMessage;

            // Throw the error to be caught by the UI
            throw new Error(errorMessage);
        }
    }

    // Get all encryption jobs
    getJobs(): EncryptionJob[] {
        return this.jobs;
    }

    // Clear completed jobs
    clearCompletedJobs(): void {
        this.jobs = this.jobs.filter(job => job.status === 'processing');
    }

    // Generate secure random password
    generateSecurePassword(length: number = 16): string {
        const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
        let password = '';
        const randomValues = crypto.getRandomValues(new Uint8Array(length));
        for (let i = 0; i < length; i++) {
            password += charset.charAt(randomValues[i] % charset.length);
        }
        return password;
    }

    // Hash data for integrity verification
    async hashData(data: string): Promise<string> {
        const encoder = new TextEncoder();
        const dataBuffer = encoder.encode(data);
        const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
        return Array.from(new Uint8Array(hashBuffer))
            .map(b => b.toString(16).padStart(2, '0'))
            .join('');
    }
}

export const encryptionService = new EncryptionService();