import CryptoJS from 'crypto-js';

export class EncryptionService {
  private secretKey: string;

  constructor() {
    // In production, this should come from environment variables
    this.secretKey = process.env.REACT_APP_ENCRYPTION_KEY || 'default-secret-key';
  }

  encryptData(data: string): string {
    try {
      const encrypted = CryptoJS.AES.encrypt(data, this.secretKey).toString();
      return encrypted;
    } catch (error) {
      console.error('Encryption failed:', error);
      throw new Error('Failed to encrypt data');
    }
  }

  decryptData(encryptedData: string): string {
    try {
      const bytes = CryptoJS.AES.decrypt(encryptedData, this.secretKey);
      const decrypted = bytes.toString(CryptoJS.enc.Utf8);

      if (!decrypted) {
        throw new Error('Failed to decrypt data - invalid key or corrupted data');
      }

      return decrypted;
    } catch (error) {
      console.error('Decryption failed:', error);
      throw new Error('Failed to decrypt data');
    }
  }

  // Enhanced encryption with password and verification
  encryptWithPassword(data: string, password: string): { encryptedData: string, salt: string, verification: string } {
    try {
      const salt = CryptoJS.lib.WordArray.random(128 / 8).toString();
      const key = this.deriveKey(password, salt);
      const verification = CryptoJS.SHA256(password + salt).toString();

      const dataWithVerification = JSON.stringify({
        verification: verification,
        originalData: data
      });

      const encryptedData = CryptoJS.AES.encrypt(dataWithVerification, key).toString();

      return {
        encryptedData,
        salt,
        verification
      };
    } catch (error) {
      console.error('Password encryption failed:', error);
      throw new Error('Failed to encrypt data with password');
    }
  }

  // Enhanced decryption with password verification
  decryptWithPassword(encryptedData: string, password: string, salt: string, expectedVerification?: string): string {
    try {
      const key = this.deriveKey(password, salt);
      const passwordVerification = CryptoJS.SHA256(password + salt).toString();

      const bytes = CryptoJS.AES.decrypt(encryptedData, key);
      const decryptedString = bytes.toString(CryptoJS.enc.Utf8);

      if (!decryptedString) {
        throw new Error('Invalid password - decryption resulted in empty data');
      }

      let decryptedData;
      try {
        decryptedData = JSON.parse(decryptedString);
      } catch (error) {
        throw new Error('Invalid password or corrupted data - unable to parse decrypted content');
      }

      // Verify the password using the embedded verification hash
      if (decryptedData.verification) {
        if (decryptedData.verification !== passwordVerification) {
          throw new Error('Invalid password - verification failed');
        }
        return decryptedData.originalData;
      } else if (expectedVerification) {
        if (expectedVerification !== passwordVerification) {
          throw new Error('Invalid password - verification failed');
        }
        return decryptedString;
      } else {
        console.warn('Decryption performed without password verification');
        return decryptedString;
      }
    } catch (error) {
      console.error('Password decryption failed:', error);
      if (error instanceof Error && error.message.includes('Invalid password')) {
        throw error;
      }
      throw new Error('Failed to decrypt data with password');
    }
  }

  hashData(data: string): string {
    return CryptoJS.SHA256(data).toString();
  }

  generateSalt(): string {
    return CryptoJS.lib.WordArray.random(128 / 8).toString();
  }

  deriveKey(password: string, salt: string): string {
    return CryptoJS.PBKDF2(password, salt, {
      keySize: 256 / 32,
      iterations: 100000
    }).toString();
  }

  encryptMedicalRecord(record: any): { encryptedData: string, hash: string } {
    const jsonData = JSON.stringify(record);
    const encryptedData = this.encryptData(jsonData);
    const hash = this.hashData(jsonData);

    return {
      encryptedData,
      hash
    };
  }

  decryptMedicalRecord(encryptedData: string): any {
    const decryptedJson = this.decryptData(encryptedData);
    return JSON.parse(decryptedJson);
  }

  verifyRecordIntegrity(record: any, expectedHash: string): boolean {
    const currentHash = this.hashData(JSON.stringify(record));
    return currentHash === expectedHash;
  }
}

export const encryptionService = new EncryptionService();
