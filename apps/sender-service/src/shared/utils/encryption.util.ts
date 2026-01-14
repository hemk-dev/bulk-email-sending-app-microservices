import { createCipheriv, createDecipheriv, randomBytes, scrypt } from 'crypto';
import { promisify } from 'util';
import { logError } from '@packages/logger';
import { InternalServerErrorException } from '@packages/errors';

const scryptAsync = promisify(scrypt);

class EncryptionUtil {
  private readonly algorithm = 'aes-256-gcm';
  private readonly keyLength = 32; 
  private readonly ivLength = 16; 
  private readonly saltLength = 16; 
  private readonly tagLength = 16;
  private readonly encryptionKey: string | undefined;


 

  constructor(encryptionKey?: string) {
    this.encryptionKey = encryptionKey;
  }

  private async getEncryptionKey(): Promise<Buffer> {
    if (!this.encryptionKey) {
      throw new InternalServerErrorException('ENCRYPTION_KEY is not set in config');
    }

    let keyBuffer: Buffer;
    try {
      keyBuffer = Buffer.from(this.encryptionKey, 'base64');
    } catch {
      try {
        keyBuffer = Buffer.from(this.encryptionKey, 'hex');
      } catch {
        throw new InternalServerErrorException('ENCRYPTION_KEY must be base64 or hex encoded');
      }
    }

    if (keyBuffer.length !== this.keyLength) {
      if (keyBuffer.length < 16) {
        throw new InternalServerErrorException('ENCRYPTION_KEY must be at least 16 bytes (32 bytes recommended)');
      }
      const salt = Buffer.alloc(this.saltLength, 0);
      keyBuffer = (await scryptAsync(keyBuffer, salt, this.keyLength)) as Buffer;
    }

    return keyBuffer;
  }

  async encrypt(plaintext: string): Promise<string> {
    try {
      if (!plaintext || typeof plaintext !== 'string') {
        throw new Error('Plaintext must be a non-empty string');
      }

      const key = await this.getEncryptionKey();
      const iv = randomBytes(this.ivLength);
      const salt = randomBytes(this.saltLength);

      const derivedKey = (await scryptAsync(key, salt, this.keyLength)) as Buffer;

      const cipher = createCipheriv(this.algorithm, derivedKey, iv);
      
      let encrypted = cipher.update(plaintext, 'utf8', 'base64');
      encrypted += cipher.final('base64');
      
      const tag = cipher.getAuthTag();

      const result = Buffer.concat([
        salt,
        iv,
        tag,
        Buffer.from(encrypted, 'base64')
      ]).toString('base64');

      return result;
    } catch (error: any) {
      logError('Encryption error', { error: error.message, stack: error.stack });
      throw new InternalServerErrorException('Failed to encrypt data');
    }
  }

  /**
   * Decrypt ciphertext string
   * Expects base64 encoded string: salt:iv:tag:ciphertext
   */
  async decrypt(ciphertext: string): Promise<string> {
    try {
      if (!ciphertext || typeof ciphertext !== 'string') {
        throw new Error('Ciphertext must be a non-empty string');
      }

      const key = await this.getEncryptionKey();
      
      // Decode base64
      const data = Buffer.from(ciphertext, 'base64');
      
      // Extract components
      const salt = data.subarray(0, this.saltLength);
      const iv = data.subarray(this.saltLength, this.saltLength + this.ivLength);
      const tag = data.subarray(this.saltLength + this.ivLength, this.saltLength + this.ivLength + this.tagLength);
      const encrypted = data.subarray(this.saltLength + this.ivLength + this.tagLength);

      // Derive key from master key and salt
      const derivedKey = (await scryptAsync(key, salt, this.keyLength)) as Buffer;

      const decipher = createDecipheriv(this.algorithm, derivedKey, iv);
      decipher.setAuthTag(tag);

      let decrypted = decipher.update(encrypted, undefined, 'utf8');
      decrypted += decipher.final('utf8');

      return decrypted;
    } catch (error: any) {
      logError('Decryption error', { error: error.message, stack: error.stack });
      throw new InternalServerErrorException('Failed to decrypt data');
    }
  }
}

// Module-level singleton instance
let encryptionUtilInstance: EncryptionUtil | null = null;

// Export function to initialize encryption util with config
export function initializeEncryptionUtil(encryptionKey: string | undefined): void {
  encryptionUtilInstance = new EncryptionUtil(encryptionKey);
}

// Export singleton instance getter
export function getEncryptionUtil(): EncryptionUtil {
  if (!encryptionUtilInstance) {
    throw new InternalServerErrorException('EncryptionUtil not initialized. Call initializeEncryptionUtil() first.');
  }
  return encryptionUtilInstance;
}

// Export singleton instance for backward compatibility
export const encryptionUtil = new Proxy({} as EncryptionUtil, {
  get(_target, prop) {
    return getEncryptionUtil()[prop as keyof EncryptionUtil];
  }
});
