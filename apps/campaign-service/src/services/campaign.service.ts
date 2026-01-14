import { logInfo, logError } from '@packages/logger';
import {
  BadRequestException,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@packages/errors';
import { campaignRepository } from '../repositories/campaign.repository';
import { Campaign, CampaignStatus } from '../shared/entities/campaign.entity';
import {
  CreateCampaignDto,
  UpdateCampaignDto,
  CampaignResponseDto,
  CampaignStatusResponseDto,
  CampaignMetricsResponseDto,
  CampaignValidator,
} from '../shared/dto/campaign.dto';
import { recipientServiceClient } from './recipient.service';
import { campaignSenderCacheRepository } from '../repositories/campaign-sender-cache.repository';
import { campaignRecipientRepository } from '../repositories/campaign-recipient.repository';
import { enqueueEmailJob } from '@packages/queue';
import { v4 as uuidv4 } from 'uuid';
import { TraceContext } from '@packages/tracing';

/**
 * Campaign Service
 * Business logic layer for campaign management
 */
export const campaignService = {
  /**
   * State machine validation
   */
  validateStateTransition(currentStatus: CampaignStatus, action: string): boolean {
    const transitions: Record<CampaignStatus, string[]> = {
      [CampaignStatus.DRAFT]: ['prepare', 'update', 'delete'],
      [CampaignStatus.READY]: ['start'],
      [CampaignStatus.QUEUED]: [], // No transitions allowed while queued
      [CampaignStatus.SENDING]: [], // No transitions allowed during sending
      [CampaignStatus.COMPLETED]: [], // Final state
      [CampaignStatus.FAILED]: [], // Final state
    };

    return transitions[currentStatus]?.includes(action.toLowerCase()) || false;
  },

  canUpdate(status: CampaignStatus): boolean {
    return status === CampaignStatus.DRAFT;
  },

  canDelete(status: CampaignStatus): boolean {
    return status === CampaignStatus.DRAFT;
  },

  canPrepare(status: CampaignStatus): boolean {
    return status === CampaignStatus.DRAFT;
  },

  canSend(status: CampaignStatus): boolean {
    return status === CampaignStatus.READY;
  },

  canStart(status: CampaignStatus): boolean {
    return status === CampaignStatus.READY;
  },

  /**
   * Create a new campaign
   */
  async createCampaign(userId: string, data: CreateCampaignDto): Promise<CampaignResponseDto> {
    try {
      logInfo('Starting campaign creation', { userId });

      // Validate input
      const validation = CampaignValidator.validateCreateDto(data);
      if (!validation.valid) {
        throw new BadRequestException(`Validation failed: ${validation.errors.join(', ')}`);
      }

      // Create campaign with DRAFT status
      // Note: senderEmail validation is done at API Gateway level before this call
      const senderEmail = data.senderEmail.toLowerCase().trim();
      const campaign = await campaignRepository.create({
        userId,
        name: data.name.trim(),
        subject: data.subject.trim(),
        bodyHtml: data.bodyHtml.trim(),
        bodyText: data.bodyText.trim(),
        senderEmail,
        status: CampaignStatus.DRAFT,
        totalRecipients: 0,
        sentCount: 0,
        failedCount: 0,
      });

      logInfo('Campaign created successfully', { campaignId: campaign.id, userId });

      return CampaignValidator.toResponseDto(campaign);
    } catch (error: any) {
      logError('Campaign creation error', { error, userId });
      throw error;
    }
  },

  /**
   * Get campaign by ID with ownership validation
   */
  async getCampaignById(id: string, userId: string): Promise<CampaignResponseDto> {
    try {
      logInfo('Starting get campaign', { campaignId: id, userId });

      const campaign = await campaignRepository.findById(id, userId);
      if (!campaign) {
        throw new NotFoundException('Campaign not found');
      }

      logInfo('Campaign fetched successfully', { campaignId: campaign.id, userId });

      return CampaignValidator.toResponseDto(campaign);
    } catch (error: any) {
      logError('Get campaign error', { error, campaignId: id, userId });
      throw error;
    }
  },

  /**
   * Get campaigns with pagination
   */
  async getCampaigns(userId: string, page: number = 1, limit: number = 10): Promise<CampaignResponseDto[]> {
    try {
      logInfo('Starting get campaigns', { userId, page, limit });

      const offset = (page - 1) * limit;
      const campaigns = await campaignRepository.findByUserId(userId, limit, offset);

      logInfo('Campaigns fetched successfully', { userId, count: campaigns.length });

      return campaigns.map(CampaignValidator.toResponseDto);
    } catch (error: any) {
      logError('Get campaigns error', { error, userId });
      throw error;
    }
  },

  /**
   * Update campaign (only if DRAFT)
   */
  async updateCampaign(id: string, userId: string, data: UpdateCampaignDto): Promise<CampaignResponseDto> {
    try {
      logInfo('Starting campaign update', { campaignId: id, userId });

      // Get existing campaign
      const campaign = await campaignRepository.findById(id, userId);
      if (!campaign) {
        throw new NotFoundException('Campaign not found');
      }

      // Check if update is allowed
      if (!this.canUpdate(campaign.status)) {
        throw new ConflictException(`Cannot update campaign with status ${campaign.status}. Only DRAFT campaigns can be updated.`);
      }

      // Validate input
      const validation = CampaignValidator.validateUpdateDto(data);
      if (!validation.valid) {
        throw new BadRequestException(`Validation failed: ${validation.errors.join(', ')}`);
      }

      // Prepare updates
      // Note: senderEmail validation is done at API Gateway level before this call
      const updates: Partial<Campaign> = {};
      if (data.name !== undefined) updates.name = data.name.trim();
      if (data.subject !== undefined) updates.subject = data.subject.trim();
      if (data.bodyHtml !== undefined) updates.bodyHtml = data.bodyHtml.trim();
      if (data.bodyText !== undefined) updates.bodyText = data.bodyText.trim();
      if (data.senderEmail !== undefined) updates.senderEmail = data.senderEmail.toLowerCase().trim();

      const updatedCampaign = await campaignRepository.update(id, userId, updates);

      logInfo('Campaign updated successfully', { campaignId: updatedCampaign.id, userId });

      return CampaignValidator.toResponseDto(updatedCampaign);
    } catch (error: any) {
      logError('Campaign update error', { error, campaignId: id, userId });
      throw error;
    }
  },

  /**
   * Delete campaign (only if DRAFT)
   */
  async deleteCampaign(id: string, userId: string): Promise<void> {
    try {
      logInfo('Starting campaign deletion', { campaignId: id, userId });

      // Get existing campaign
      const campaign = await campaignRepository.findById(id, userId);
      if (!campaign) {
        throw new NotFoundException('Campaign not found');
      }

      // Check if deletion is allowed
      if (!this.canDelete(campaign.status)) {
        throw new ConflictException(`Cannot delete campaign with status ${campaign.status}. Only DRAFT campaigns can be deleted.`);
      }

      await campaignRepository.delete(id, userId);

      logInfo('Campaign deleted successfully', { campaignId: id, userId });
    } catch (error: any) {
      logError('Campaign deletion error', { error, campaignId: id, userId });
      throw error;
    }
  },

  /**
   * Prepare campaign (DRAFT → READY) with validation
   */
  async prepareCampaign(id: string, userId: string): Promise<CampaignResponseDto> {
    try {
      logInfo('Starting campaign preparation', { campaignId: id, userId });

      // Get existing campaign
      const campaign = await campaignRepository.findById(id, userId);
      if (!campaign) {
        throw new NotFoundException('Campaign not found');
      }

      // Check if preparation is allowed
      if (!this.canPrepare(campaign.status)) {
        throw new ConflictException(`Cannot prepare campaign with status ${campaign.status}. Only DRAFT campaigns can be prepared.`);
      }

      // Validate campaign before marking as READY
      const validationErrors: string[] = [];

      if (!campaign.subject || campaign.subject.trim().length === 0) {
        validationErrors.push('subject is required');
      }

      if ((!campaign.bodyHtml || campaign.bodyHtml.trim().length === 0) &&
          (!campaign.bodyText || campaign.bodyText.trim().length === 0)) {
        validationErrors.push('either bodyHtml or bodyText is required');
      }

      if (!campaign.senderEmail || !CampaignValidator.validateEmail(campaign.senderEmail)) {
        validationErrors.push('senderEmail is required and must be valid');
      }

      // Check recipient count via Recipient Service
      let recipientCount = 0;
      try {
        recipientCount = await recipientServiceClient.getRecipientCount(id);
        logInfo('Recipient count retrieved', { campaignId: id, recipientCount });
      } catch (error: any) {
        logError('Failed to get recipient count', { error, campaignId: id });
        validationErrors.push('unable to verify recipient count');
      }

      if (recipientCount <= 0) {
        validationErrors.push('campaign must have at least one recipient');
      }

      if (validationErrors.length > 0) {
        throw new BadRequestException(`Campaign validation failed: ${validationErrors.join(', ')}`);
      }

      const updatedCampaign = await campaignRepository.update(id, userId, {
        status: CampaignStatus.READY,
        totalRecipients: recipientCount,
      });

      logInfo('Campaign prepared successfully', { campaignId: updatedCampaign.id, userId, recipientCount });

      return CampaignValidator.toResponseDto(updatedCampaign);
    } catch (error: any) {
      logError('Campaign preparation error', { error, campaignId: id, userId });
      throw error;
    }
  },

  async getCampaignStatus(id: string, userId: string): Promise<CampaignStatusResponseDto> {
    try {
      logInfo('Starting get campaign status', { campaignId: id, userId });

      const campaign = await campaignRepository.findById(id, userId);
      if (!campaign) {
        throw new NotFoundException('Campaign not found');
      }

      logInfo('Campaign status fetched successfully', { campaignId: campaign.id, userId, status: campaign.status });

      return CampaignValidator.toStatusResponseDto(campaign);
    } catch (error: any) {
      logError('Get campaign status error', { error, campaignId: id, userId });
      throw error;
    }
  },

  async getCampaignMetrics(id: string, userId: string): Promise<CampaignMetricsResponseDto> {
    try {
      logInfo('Starting get campaign metrics', { campaignId: id, userId });

      const campaign = await campaignRepository.findById(id, userId);
      if (!campaign) {
        throw new NotFoundException('Campaign not found');
      }

      logInfo('Campaign metrics fetched successfully', { campaignId: campaign.id, userId });

      return CampaignValidator.toMetricsResponseDto(campaign);
    } catch (error: any) {
      logError('Get campaign metrics error', { error, campaignId: id, userId });
      throw error;
    }
  },

  /**
   * Start campaign execution (READY → QUEUED)
   * Enqueues email jobs for all recipients
   */
  async startCampaign(id: string, userId: string): Promise<CampaignResponseDto> {
    try {
      logInfo('Starting campaign execution', { campaignId: id, userId });

      // Get existing campaign
      const campaign = await campaignRepository.findById(id, userId);
      if (!campaign) {
        throw new NotFoundException('Campaign not found');
      }

      // Check if start is allowed
      if (!this.canStart(campaign.status)) {
        throw new ConflictException(
          `Cannot start campaign with status ${campaign.status}. Only READY campaigns can be started.`
        );
      }

      // Read sender from local read model (NO SERVICE CALL)
      const sender = await campaignSenderCacheRepository.findByEmailAndUserId(
        campaign.senderEmail,
        userId
      );

      if (!sender || !sender.isActive) {
        throw new BadRequestException(
          `Sender not found or inactive for email ${campaign.senderEmail}. Please ensure sender is created and active.`
        );
      }

      // Read recipients from local read model (NO SERVICE CALL)
      const recipients = await campaignRecipientRepository.findByCampaignId(id);

      if (recipients.length === 0) {
        throw new BadRequestException('Campaign has no recipients. Please add recipients before starting.');
      }

      logInfo('Found sender and recipients', {
        campaignId: id,
        senderId: sender.senderId,
        recipientCount: recipients.length,
      });

      // Get trace ID from context
      const traceId = TraceContext.getTraceId() || '';

      // Enqueue one job per recipient
      const jobIds: string[] = [];
      for (const recipient of recipients) {
        const jobId = uuidv4();
        
        try {
          await enqueueEmailJob({
            jobId,
            campaignId: id,
            recipientId: recipient.id,
            to: recipient.email,
            subject: campaign.subject,
            html: campaign.bodyHtml,
            traceId,
            sender: {
              email: sender.fromEmail,
              name: sender.name,
              smtp: {
                host: sender.smtpHost,
                port: sender.smtpPort,
                secure: sender.smtpPort === 465, // Typically 465 is secure
                username: sender.smtpUser,
                passwordEncrypted: sender.smtpPassword,
              },
            },
          });

          jobIds.push(jobId);
          logInfo('Email job enqueued', {
            campaignId: id,
            recipientId: recipient.id,
            jobId,
          });
        } catch (error: any) {
          logError('Failed to enqueue email job', {
            error,
            campaignId: id,
            recipientId: recipient.id,
          });
          // Continue with other recipients even if one fails
        }
      }

      if (jobIds.length === 0) {
        throw new BadRequestException('Failed to enqueue any email jobs. Please try again.');
      }

      // Update campaign status to QUEUED
      const updatedCampaign = await campaignRepository.updateStatus(id, userId, CampaignStatus.QUEUED);

      logInfo('Campaign started successfully', {
        campaignId: updatedCampaign.id,
        userId,
        jobsEnqueued: jobIds.length,
        totalRecipients: recipients.length,
      });

      return CampaignValidator.toResponseDto(updatedCampaign);
    } catch (error: any) {
      logError('Campaign start error', { error, campaignId: id, userId });
      throw error;
    }
  },
};
