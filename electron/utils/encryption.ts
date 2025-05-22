import * as crypto from 'crypto'

class EncryptionService {
  private algorithm = 'aes-256-gcm'
  private keyLength = 32 // 256 bits
  private ivLength = 16 // 128 bits
  private saltLength = 64 // 512 bits  
  private tagLength = 16 // 128 bits

  // Generate a secure encryption key
  generateKey(): string {
    return crypto.randomBytes(this.keyLength).toString('hex')
  }

  // Derive key from password using PBKDF2
  private deriveKey(password: string, salt: Buffer): Buffer {
    return crypto.pbkdf2Sync(password, salt, 100000, this.keyLength, 'sha512')
  }

  // Encrypt sensitive data (API keys, secrets)
  encrypt(plaintext: string, masterKey?: string): string {
    try {
      // Use provided key or generate one
      const password = masterKey || process.env.ENCRYPTION_KEY || 'default-key-change-me'
      
      // Generate random salt and IV
      const salt = crypto.randomBytes(this.saltLength)
      const iv = crypto.randomBytes(this.ivLength)
      
      // Derive key from password and salt
      const key = this.deriveKey(password, salt)
      
      // Create cipher
      const cipher = crypto.createCipher(this.algorithm, key)
      cipher.setAAD(salt) // Additional authenticated data
      
      // Encrypt the plaintext
      let encrypted = cipher.update(plaintext, 'utf8', 'hex')
      encrypted += cipher.final('hex')
      
      // Get the authentication tag
      const tag = cipher.getAuthTag()
      
      // Combine salt + iv + tag + encrypted data
      const combined = Buffer.concat([
        salt,
        iv, 
        tag,
        Buffer.from(encrypted, 'hex')
      ])
      
      return combined.toString('base64')
    } catch (error) {
      console.error('❌ Encryption failed:', error)
      throw new Error('Failed to encrypt data')
    }
  }

  // Decrypt sensitive data
  decrypt(encryptedData: string, masterKey?: string): string {
    try {
      const password = masterKey || process.env.ENCRYPTION_KEY || 'default-key-change-me'
      
      // Parse the combined data
      const combined = Buffer.from(encryptedData, 'base64')
      
      const salt = combined.subarray(0, this.saltLength)
      const iv = combined.subarray(this.saltLength, this.saltLength + this.ivLength)
      const tag = combined.subarray(this.saltLength + this.ivLength, this.saltLength + this.ivLength + this.tagLength)
      const encrypted = combined.subarray(this.saltLength + this.ivLength + this.tagLength)
      
      // Derive key from password and salt
      const key = this.deriveKey(password, salt)
      
      // Create decipher
      const decipher = crypto.createDecipher(this.algorithm, key)
      decipher.setAAD(salt)
      decipher.setAuthTag(tag)
      
      // Decrypt the data
      let decrypted = decipher.update(encrypted, undefined, 'utf8')
      decrypted += decipher.final('utf8')
      
      return decrypted
    } catch (error) {
      console.error('❌ Decryption failed:', error)
      throw new Error('Failed to decrypt data - invalid key or corrupted data')
    }
  }

  // Hash sensitive data for verification (one-way)
  hash(data: string): string {
    return crypto.createHash('sha256').update(data).digest('hex')
  }

  // Verify if data matches hash
  verifyHash(data: string, hash: string): boolean {
    return this.hash(data) === hash
  }
}

export default new EncryptionService()