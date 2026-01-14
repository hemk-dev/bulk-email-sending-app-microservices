import { logInfo, logError } from '@packages/logger';
import {
  BadRequestException,
  NotFoundException,
} from '@packages/errors';
import { recipientRepository } from '../repositories/recipient.repository';
import { Recipient } from '../shared/entities/recipient.entity';
import { eventPublisherService } from './event-publisher.service';
import {
  CreateRecipientDto,
  RecipientResponseDto,
  RecipientBatchResponseDto,
  BulkCreateResponseDto,
  RecipientValidator,
} from '../shared/dto/recipient.dto';

/**
 * Recipient Service
 * Business logic layer for recipient management
 */
export const recipientService = {
  /**
   * Create a single recipient
   */
  async createRecipient(data: CreateRecipientDto): Promise<RecipientResponseDto> {
    try {
      logInfo('Starting recipient creation', { campaignId: data.campaignId, email: data.email });

      const validation = RecipientValidator.validateCreateDto(data);
      if (!validation.valid) {
        throw new BadRequestException(`Validation failed: ${validation.errors.join(', ')}`);
      }

      const exists = await recipientRepository.existsByCampaignAndEmail(
        data.campaignId,
        data.email
      );
      if (exists) {
        throw new BadRequestException('Recipient with this email already exists for this campaign');
      }

      const recipient = await recipientRepository.create({
        campaignId: data.campaignId,
        email: data.email.toLowerCase().trim(),
        name: data.name?.trim() || null,
        metadata: data.metadata || null,
      });

      logInfo('Recipient created successfully', { recipientId: recipient.id, campaignId: data.campaignId });

      // Emit recipient.created event
      await eventPublisherService.publishRecipientCreated(recipient);

      return RecipientValidator.toResponseDto(recipient);
    } catch (error: any) {
      logError('Recipient creation error', { error, campaignId: data.campaignId });
      throw error;
    }
  },

  async bulkCreateRecipients(
    campaignId: string,
    recipients: CreateRecipientDto[]
  ): Promise<BulkCreateResponseDto> {
    try {
      logInfo('Starting bulk recipient creation', { campaignId, count: recipients.length });

      if (recipients.length === 0) {
        throw new BadRequestException('No recipients provided');
      }

      if (!RecipientValidator.validateUUID(campaignId)) {
        throw new BadRequestException('Invalid campaignId format');
      }

      const errors: string[] = [];
      const validRecipients: CreateRecipientDto[] = [];

      recipients.forEach((recipient, index) => {
        const validation = RecipientValidator.validateCreateDto(recipient);
        if (!validation.valid) {
          errors.push(`Recipient ${index + 1}: ${validation.errors.join(', ')}`);
        } else {
          validRecipients.push({
            ...recipient,
            email: recipient.email.toLowerCase().trim(),
            campaignId,
          });
        }
      });

      if (validRecipients.length === 0) {
        throw new BadRequestException(`All recipients failed validation. Errors: ${errors.join('; ')}`);
      }

      // Deduplicate within the input batch
      const emailSet = new Set<string>();
      const deduplicatedRecipients: CreateRecipientDto[] = [];

      validRecipients.forEach((recipient, index) => {
        if (emailSet.has(recipient.email)) {
          errors.push(`Recipient ${index + 1}: duplicate email in batch: ${recipient.email}`);
        } else {
          emailSet.add(recipient.email);
          deduplicatedRecipients.push(recipient);
        }
      });

      // Check against existing recipients in database
      const existingEmails = await recipientRepository.bulkExistsCheck(
        campaignId,
        deduplicatedRecipients.map(r => r.email)
      );

      // Filter out existing recipients
      const newRecipients: CreateRecipientDto[] = [];
      deduplicatedRecipients.forEach((recipient, index) => {
        if (existingEmails.has(recipient.email)) {
          errors.push(`Recipient ${index + 1}: email already exists: ${recipient.email}`);
        } else {
          newRecipients.push(recipient);
        }
      });

      // Bulk insert new recipients
      let created = 0;
      if (newRecipients.length > 0) {
        const recipientEntities = newRecipients.map(r => ({
          campaignId: r.campaignId,
          email: r.email,
          name: r.name?.trim() || null,
          metadata: r.metadata || null,
        }));

        const createdRecipients = await recipientRepository.bulkCreate(recipientEntities);
        created = newRecipients.length;
        logInfo('Bulk recipients created successfully', { campaignId, created });

        // Emit recipient.created events for each created recipient
        for (const recipient of createdRecipients) {
          await eventPublisherService.publishRecipientCreated(recipient);
        }
      }

      const skipped = recipients.length - created;

      return {
        created,
        skipped,
        errors,
      };
    } catch (error: any) {
      logError('Bulk recipient creation error', { error, campaignId });
      throw error;
    }
  },

  /**
   * Get recipient count for a campaign
   */
  async getRecipientCount(campaignId: string): Promise<number> {
    try {
      logInfo('Starting get recipient count', { campaignId });

      if (!RecipientValidator.validateUUID(campaignId)) {
        throw new BadRequestException('Invalid campaignId format');
      }

      const count = await recipientRepository.countByCampaignId(campaignId);

      logInfo('Recipient count fetched successfully', { campaignId, count });

      return count;
    } catch (error: any) {
      logError('Get recipient count error', { error, campaignId });
      throw error;
    }
  },

  /**
   * Get recipients batch with pagination
   */
  async getRecipientsBatch(
    campaignId: string,
    limit: number = 100,
    offset: number = 0
  ): Promise<RecipientBatchResponseDto> {
    try {
      logInfo('Starting get recipients batch', { campaignId, limit, offset });

      if (!RecipientValidator.validateUUID(campaignId)) {
        throw new BadRequestException('Invalid campaignId format');
      }

      if (limit < 1 || limit > 1000) {
        throw new BadRequestException('Limit must be between 1 and 1000');
      }

      if (offset < 0) {
        throw new BadRequestException('Offset must be non-negative');
      }

      const recipients = await recipientRepository.findByCampaignId(campaignId, limit, offset);
      const total = await recipientRepository.countByCampaignId(campaignId);

      logInfo('Recipients batch fetched successfully', { campaignId, count: recipients.length, total });

      return {
        recipients: recipients.map(RecipientValidator.toResponseDto),
        total,
        limit,
        offset,
      };
    } catch (error: any) {
      logError('Get recipients batch error', { error, campaignId });
      throw error;
    }
  },

  /**
   * Validate and deduplicate recipients (internal helper)
   */
  async validateAndDeduplicate(
    campaignId: string,
    recipients: CreateRecipientDto[]
  ): Promise<CreateRecipientDto[]> {
    // This logic is already in bulkCreateRecipients, but extracted for potential reuse
    const emailSet = new Set<string>();
    const deduplicated: CreateRecipientDto[] = [];

    for (const recipient of recipients) {
      const normalizedEmail = recipient.email.toLowerCase().trim();
      if (!emailSet.has(normalizedEmail)) {
        emailSet.add(normalizedEmail);
        deduplicated.push({
          ...recipient,
          email: normalizedEmail,
          campaignId,
        });
      }
    }

    // Check against database
    const existingEmails = await recipientRepository.bulkExistsCheck(
      campaignId,
      deduplicated.map(r => r.email)
    );

    return deduplicated.filter(r => !existingEmails.has(r.email));
  },
};
