import { Campaign, CampaignStatus } from '../entities/campaign.entity';

export interface CreateCampaignDto {
  name: string;
  subject: string;
  bodyHtml: string;
  bodyText: string;
  senderEmail: string;
}

export interface UpdateCampaignDto {
  name?: string;
  subject?: string;
  bodyHtml?: string;
  bodyText?: string;
  senderEmail?: string;
}

export interface CampaignResponseDto {
  id: string;
  userId: string;
  name: string;
  subject: string;
  bodyHtml: string;
  bodyText: string;
  senderEmail: string;
  status: CampaignStatus;
  totalRecipients: number;
  sentCount: number;
  failedCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CampaignStatusResponseDto {
  id: string;
  status: CampaignStatus;
}

export interface CampaignMetricsResponseDto {
  id: string;
  totalRecipients: number;
  sentCount: number;
  failedCount: number;
  successRate: number;
}

/**
 * Validation utilities for campaign data
 */
export class CampaignValidator {
  private static readonly EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  private static readonly MAX_NAME_LENGTH = 255;
  private static readonly MAX_SUBJECT_LENGTH = 500;
  private static readonly MAX_EMAIL_LENGTH = 255;

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
   * Validate create campaign DTO
   */
  static validateCreateDto(dto: CreateCampaignDto): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!dto.name || typeof dto.name !== 'string' || dto.name.trim().length === 0) {
      errors.push('name is required and must be a non-empty string');
    } else if (dto.name.length > this.MAX_NAME_LENGTH) {
      errors.push(`name must be at most ${this.MAX_NAME_LENGTH} characters`);
    }

    if (!dto.subject || typeof dto.subject !== 'string' || dto.subject.trim().length === 0) {
      errors.push('subject is required and must be a non-empty string');
    } else if (dto.subject.length > this.MAX_SUBJECT_LENGTH) {
      errors.push(`subject must be at most ${this.MAX_SUBJECT_LENGTH} characters`);
    }

    if (!dto.bodyHtml || typeof dto.bodyHtml !== 'string' || dto.bodyHtml.trim().length === 0) {
      if (!dto.bodyText || typeof dto.bodyText !== 'string' || dto.bodyText.trim().length === 0) {
        errors.push('either bodyHtml or bodyText is required');
      }
    }

    if (!dto.senderEmail || !this.validateEmail(dto.senderEmail)) {
      errors.push('senderEmail is required and must be a valid email address');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate update campaign DTO
   */
  static validateUpdateDto(dto: UpdateCampaignDto): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (dto.name !== undefined) {
      if (typeof dto.name !== 'string' || dto.name.trim().length === 0) {
        errors.push('name must be a non-empty string');
      } else if (dto.name.length > this.MAX_NAME_LENGTH) {
        errors.push(`name must be at most ${this.MAX_NAME_LENGTH} characters`);
      }
    }

    if (dto.subject !== undefined) {
      if (typeof dto.subject !== 'string' || dto.subject.trim().length === 0) {
        errors.push('subject must be a non-empty string');
      } else if (dto.subject.length > this.MAX_SUBJECT_LENGTH) {
        errors.push(`subject must be at most ${this.MAX_SUBJECT_LENGTH} characters`);
      }
    }

    if (dto.senderEmail !== undefined && !this.validateEmail(dto.senderEmail)) {
      errors.push('senderEmail must be a valid email address');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Convert Campaign entity to response DTO
   */
  static toResponseDto(campaign: Campaign): CampaignResponseDto {
    return {
      id: campaign.id,
      userId: campaign.userId,
      name: campaign.name,
      subject: campaign.subject,
      bodyHtml: campaign.bodyHtml,
      bodyText: campaign.bodyText,
      senderEmail: campaign.senderEmail,
      status: campaign.status,
      totalRecipients: campaign.totalRecipients,
      sentCount: campaign.sentCount,
      failedCount: campaign.failedCount,
      createdAt: campaign.createdAt,
      updatedAt: campaign.updatedAt,
    };
  }

  /**
   * Convert Campaign entity to status response DTO
   */
  static toStatusResponseDto(campaign: Campaign): CampaignStatusResponseDto {
    return {
      id: campaign.id,
      status: campaign.status,
    };
  }

  /**
   * Convert Campaign entity to metrics response DTO
   */
  static toMetricsResponseDto(campaign: Campaign): CampaignMetricsResponseDto {
    const total = campaign.totalRecipients || 1; // Avoid division by zero
    const successRate = total > 0 ? (campaign.sentCount / total) * 100 : 0;

    return {
      id: campaign.id,
      totalRecipients: campaign.totalRecipients,
      sentCount: campaign.sentCount,
      failedCount: campaign.failedCount,
      successRate: Math.round(successRate * 100) / 100, // Round to 2 decimal places
    };
  }
}
