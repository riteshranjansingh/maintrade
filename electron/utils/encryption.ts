import * as crypto from 'crypto';

export class EncryptionService {
  private key: Buffer;
  private algorithm = 'aes-256-cbc';

  constructor() {
    const encryptionKey = process.env.ENCRYPTION_KEY;
    if (!encryptionKey) {
      throw new Error('ENCRYPTION_KEY environment variable is required');
    }
    
    // Convert hex string to buffer and ensure it's 32 bytes for AES-256
    this.key = Buffer.from(encryptionKey, 'hex').slice(0, 32);
    
    if (this.key.length !== 32) {
      throw new Error('ENCRYPTION_KEY must be a 64-character hex string (32 bytes)');
    }
  }

  encrypt(text: string): string {
    try {
      // Generate a random initialization vector
      const iv = crypto.randomBytes(16);
      
      // Create cipher with key and IV
      const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);
      
      // Encrypt the text
      let encrypted = cipher.update(text, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      
      // Combine IV and encrypted data (IV:encrypted)
      return iv.toString('hex') + ':' + encrypted;
    } catch (error) {
      console.error('❌ Encryption failed:', error);
      throw new Error('Failed to encrypt data');
    }
  }

  decrypt(encryptedData: string): string {
    try {
      // Split IV and encrypted data
      const parts = encryptedData.split(':');
      if (parts.length !== 2) {
        throw new Error('Invalid encrypted data format');
      }
      
      const iv = Buffer.from(parts[0], 'hex');
      const encrypted = parts[1];
      
      // Create decipher with key and IV
      const decipher = crypto.createDecipheriv(this.algorithm, this.key, iv);
      
      // Decrypt the data
      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      
      return decrypted;
    } catch (error) {
      console.error('❌ Decryption failed:', error);
      throw new Error('Failed to decrypt data');
    }
  }

  // Test method to verify encryption/decryption works
  test(): boolean {
    try {
      const testText = 'test_encryption_12345';
      const encrypted = this.encrypt(testText);
      const decrypted = this.decrypt(encrypted);
      return testText === decrypted;
    } catch (error) {
      console.error('❌ Encryption test failed:', error);
      return false;
    }
  }
}