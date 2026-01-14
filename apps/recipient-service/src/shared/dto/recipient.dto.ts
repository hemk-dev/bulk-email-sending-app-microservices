import { Recipient } from '../entities/recipient.entity';

export interface CreateRecipientDto {
  campaignId: string;
  email: string;
  name?: string;
  metadata?: Record<string, any>;
}

export interface BulkCreateRecipientDto {
  recipients: CreateRecipientDto[];
}

export interface RecipientResponseDto {
  id: string;
  campaignId: string;
  email: string;
  name: string | null;
  metadata: Record<string, any> | null;
  createdAt: Date;
}

export interface RecipientBatchResponseDto {
  recipients: RecipientResponseDto[];
  total: number;
  limit: number;
  offset: number;
}

export interface BulkCreateResponseDto {
  created: number;
  skipped: number;
  errors: string[];
}

/**
 * Validation utilities for recipient data
 */
export class RecipientValidator {
  // RFC 5322 compliant email regex (simplified but effective)
  private static readonly EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  private static readonly UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  private static readonly MAX_EMAIL_LENGTH = 254; // RFC 5321 limit
  private static readonly MAX_NAME_LENGTH = 255;

  /**
   * Validate email format (RFC 5322 compliant)
   */
  static validateEmail(email: string): boolean {
    if (!email || typeof email !== 'string') {
      return false;
    }
    if (email.length > this.MAX_EMAIL_LENGTH) {
      return false;
    }
    return this.EMAIL_REGEX.test(email.trim());
  }

  /**
   * Validate UUID format
   */
  static validateUUID(uuid: string): boolean {
    if (!uuid || typeof uuid !== 'string') {
      return false;
    }
    return this.UUID_REGEX.test(uuid);
  }

  /**
   * Validate create recipient DTO
   */
  static validateCreateDto(dto: CreateRecipientDto): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!dto.campaignId || !this.validateUUID(dto.campaignId)) {
      errors.push('campaignId is required and must be a valid UUID');
    }

    if (!dto.email || !this.validateEmail(dto.email)) {
      errors.push('email is required and must be a valid email address');
    }

    if (dto.name !== undefined && dto.name !== null) {
      if (typeof dto.name !== 'string') {
        errors.push('name must be a string');
      } else if (dto.name.length > this.MAX_NAME_LENGTH) {
        errors.push(`name must be at most ${this.MAX_NAME_LENGTH} characters`);
      }
    }

    if (dto.metadata !== undefined && dto.metadata !== null) {
      if (typeof dto.metadata !== 'object' || Array.isArray(dto.metadata)) {
        errors.push('metadata must be an object');
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Convert Recipient entity to response DTO
   */
  static toResponseDto(recipient: Recipient): RecipientResponseDto {
    return {
      id: recipient.id,
      campaignId: recipient.campaignId,
      email: recipient.email,
      name: recipient.name,
      metadata: recipient.metadata,
      createdAt: recipient.createdAt,
    };
  }
}
