import { createCipheriv, createDecipheriv, randomBytes, scrypt } from 'crypto';
import { promisify } from 'util';
import { logError } from '@packages/logger';
import { InternalServerErrorException } from '@packages/errors';

const scryptAsync = promisify(scrypt);

/**
 * Encryption utility for SMTP passwords
 * Uses AES-256-GCM for authenticated encryption
 */
class EncryptionUtil {
  private readonly algorithm = 'aes-256-gcm';
  private readonly keyLength = 32; // 32 bytes for AES-256
  private readonly ivLength = 16; // 16 bytes for GCM
  private readonly saltLength = 16; // 16 bytes for salt
  private readonly tagLength = 16; // 16 bytes for authentication tag
  private readonly encryptionKey: string | undefined;

  /**
   * Constructor to initialize encryption utility with encryption key from config
   * 
   * @param encryptionKey - Encryption key from config (can be base64 or hex encoded)
   * 
   * ENCRYPTION_KEY requirements:
   * - Must be a cryptographically secure random key
   * - Minimum 16 bytes (32 bytes recommended for AES-256)
   * - Can be base64 or hex encoded
   * - Generate using: node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
   * - Or hex: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   * - Example base64: R42yDGno7cIg0L72SaRyUYC8teRl4812kPjuxjy9qco=
   * - Example hex: 478d728c69e8edc220d0bef649a4725180bcb5e465e3cd7690f8eec63cbdabc
   */
  constructor(encryptionKey?: string) {
    this.encryptionKey = encryptionKey;
  }

  /**
   * Get encryption key from config
   * Supports both base64 and hex encoded keys
   */
  private async getEncryptionKey(): Promise<Buffer> {
    if (!this.encryptionKey) {
      throw new InternalServerErrorException('ENCRYPTION_KEY is not set in config');
    }

    // Try to decode as base64 first, then hex
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

    // If key is not 32 bytes, derive it using scrypt
    if (keyBuffer.length !== this.keyLength) {
      if (keyBuffer.length < 16) {
        throw new InternalServerErrorException('ENCRYPTION_KEY must be at least 16 bytes (32 bytes recommended)');
      }
      // Derive 32-byte key using scrypt
      const salt = Buffer.alloc(this.saltLength, 0);
      keyBuffer = (await scryptAsync(keyBuffer, salt, this.keyLength)) as Buffer;
    }

    return keyBuffer;
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
