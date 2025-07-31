// Simple test to demonstrate the issue
import CryptoJS from 'crypto-js';

console.log('🧪 Testing CryptoJS AES behavior with wrong passwords...');

const testData = 'Hello World';
const correctPassword = 'correct123';
const wrongPassword = 'wrong456';

// Encrypt with correct password
const encrypted = CryptoJS.AES.encrypt(testData, correctPassword).toString();
console.log('Encrypted:', encrypted.substring(0, 50) + '...');

// Try to decrypt with wrong password
console.log('\n🔍 Decrypting with WRONG password...');
const wrongDecrypted = CryptoJS.AES.decrypt(encrypted, wrongPassword);
const wrongString = wrongDecrypted.toString(CryptoJS.enc.Utf8);

console.log('Wrong decrypted (raw):', wrongDecrypted);
console.log('Wrong decrypted string:', wrongString);
console.log('Wrong string length:', wrongString.length);
console.log('Wrong string empty?', wrongString === '');

// Try with correct password
console.log('\n✅ Decrypting with CORRECT password...');
const correctDecrypted = CryptoJS.AES.decrypt(encrypted, correctPassword);
const correctString = correctDecrypted.toString(CryptoJS.enc.Utf8);

console.log('Correct decrypted string:', correctString);
console.log('Correct string length:', correctString.length);

export { };
