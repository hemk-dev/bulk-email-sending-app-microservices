import { Sender, SenderProvider } from '../entities/sender.entity';

export interface CreateSenderDto {
  name: string;
  fromEmail: string;
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpPassword: string;
  provider?: SenderProvider;
}

export interface UpdateSenderDto {
  name?: string;
  fromEmail?: string;
  smtpHost?: string;
  smtpPort?: number;
  smtpUser?: string;
  smtpPassword?: string;
  provider?: SenderProvider;
  isActive?: boolean;
}

export interface SenderResponseDto {
  id: string;
  userId: string;
  name: string;
  fromEmail: string;
  provider: SenderProvider;
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Validation utilities for sender data
 */
export class SenderValidator {
  private static readonly EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  private static readonly MAX_NAME_LENGTH = 255;
  private static readonly MAX_EMAIL_LENGTH = 255;
  private static readonly MAX_HOST_LENGTH = 255;
  private static readonly MAX_USER_LENGTH = 255;
  private static readonly MIN_PORT = 1;
  private static readonly MAX_PORT = 65535;
  private static readonly HOSTNAME_REGEX = /^([a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$|^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;

  /**
   * Validate email format
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
   * Validate SMTP host (hostname or IP address)
   */
  static validateHost(host: string): boolean {
    if (!host || typeof host !== 'string') {
      return false;
    }
    if (host.length > this.MAX_HOST_LENGTH) {
      return false;
    }
    return this.HOSTNAME_REGEX.test(host.trim());
  }

  /**
   * Validate SMTP port
   */
  static validatePort(port: number): boolean {
    if (typeof port !== 'number' || isNaN(port)) {
      return false;
    }
    return port >= this.MIN_PORT && port <= this.MAX_PORT && Number.isInteger(port);
  }

  /**
   * Validate create sender DTO
   */
  static validateCreateDto(dto: CreateSenderDto): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!dto.name || typeof dto.name !== 'string' || dto.name.trim().length === 0) {
      errors.push('name is required and must be a non-empty string');
    } else if (dto.name.length > this.MAX_NAME_LENGTH) {
      errors.push(`name must be at most ${this.MAX_NAME_LENGTH} characters`);
    }

    if (!dto.fromEmail || !this.validateEmail(dto.fromEmail)) {
      errors.push('fromEmail is required and must be a valid email address');
    }

    if (!dto.smtpHost || !this.validateHost(dto.smtpHost)) {
      errors.push('smtpHost is required and must be a valid hostname or IP address');
    }

    if (!this.validatePort(dto.smtpPort)) {
      errors.push(`smtpPort must be an integer between ${this.MIN_PORT} and ${this.MAX_PORT}`);
    }

    if (!dto.smtpUser || typeof dto.smtpUser !== 'string' || dto.smtpUser.trim().length === 0) {
      errors.push('smtpUser is required and must be a non-empty string');
    } else if (dto.smtpUser.length > this.MAX_USER_LENGTH) {
      errors.push(`smtpUser must be at most ${this.MAX_USER_LENGTH} characters`);
    }

    if (!dto.smtpPassword || typeof dto.smtpPassword !== 'string' || dto.smtpPassword.length === 0) {
      errors.push('smtpPassword is required and must be a non-empty string');
    }

    if (dto.provider !== undefined && dto.provider !== SenderProvider.SMTP) {
      errors.push(`provider must be one of: ${Object.values(SenderProvider).join(', ')}`);
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate update sender DTO
   */
  static validateUpdateDto(dto: UpdateSenderDto): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (dto.name !== undefined) {
      if (typeof dto.name !== 'string' || dto.name.trim().length === 0) {
        errors.push('name must be a non-empty string');
      } else if (dto.name.length > this.MAX_NAME_LENGTH) {
        errors.push(`name must be at most ${this.MAX_NAME_LENGTH} characters`);
      }
    }

    if (dto.fromEmail !== undefined && !this.validateEmail(dto.fromEmail)) {
      errors.push('fromEmail must be a valid email address');
    }

    if (dto.smtpHost !== undefined && !this.validateHost(dto.smtpHost)) {
      errors.push('smtpHost must be a valid hostname or IP address');
    }

    if (dto.smtpPort !== undefined && !this.validatePort(dto.smtpPort)) {
      errors.push(`smtpPort must be an integer between ${this.MIN_PORT} and ${this.MAX_PORT}`);
    }

    if (dto.smtpUser !== undefined) {
      if (typeof dto.smtpUser !== 'string' || dto.smtpUser.trim().length === 0) {
        errors.push('smtpUser must be a non-empty string');
      } else if (dto.smtpUser.length > this.MAX_USER_LENGTH) {
        errors.push(`smtpUser must be at most ${this.MAX_USER_LENGTH} characters`);
      }
    }

    if (dto.smtpPassword !== undefined) {
      if (typeof dto.smtpPassword !== 'string' || dto.smtpPassword.length === 0) {
        errors.push('smtpPassword must be a non-empty string');
      }
    }

    if (dto.provider !== undefined && dto.provider !== SenderProvider.SMTP) {
      errors.push(`provider must be one of: ${Object.values(SenderProvider).join(', ')}`);
    }

    if (dto.isActive !== undefined && typeof dto.isActive !== 'boolean') {
      errors.push('isActive must be a boolean');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Convert Sender entity to response DTO (excludes smtpPassword)
   */
  static toResponseDto(sender: Sender): SenderResponseDto {
    return {
      id: sender.id,
      userId: sender.userId,
      name: sender.name,
      fromEmail: sender.fromEmail,
      provider: sender.provider,
      smtpHost: sender.smtpHost,
      smtpPort: sender.smtpPort,
      smtpUser: sender.smtpUser,
      isActive: sender.isActive,
      createdAt: sender.createdAt,
      updatedAt: sender.updatedAt,
    };
  }
}
