import { logInfo, logError } from '@packages/logger';
import { emailLogRepository } from '../repositories/email-log.repository';
import { campaignRepository } from '../repositories/campaign.repository';
import { EmailLogStatus } from '../shared/entities/email-log.entity';
import { CampaignStatus } from '../shared/entities/campaign.entity';

/**
 * Email Log Service
 * Handles email log operations and campaign metrics updates
 */
export const emailLogService = {
  /**
   * Handle email.sent event
   */
  async handleEmailSentEvent(eventData: {
    campaignId: string;
    jobId: string;
    recipientEmail: string;
    sentAt?: Date;
    attempts: number;
  }): Promise<void> {
    try {
      logInfo('Handling email.sent event', {
        campaignId: eventData.campaignId,
        jobId: eventData.jobId,
      });

      // Find or create email log
      let emailLog = await emailLogRepository.findByJobId(eventData.jobId);

      if (!emailLog) {
        // Create new log entry
        emailLog = await emailLogRepository.create({
          jobId: eventData.jobId,
          campaignId: eventData.campaignId,
          recipientEmail: eventData.recipientEmail,
          status: EmailLogStatus.SENT,
          attempts: eventData.attempts,
          sentAt: eventData.sentAt || new Date(),
        });
      } else {
        // Update existing log
        emailLog.status = EmailLogStatus.SENT;
        emailLog.attempts = eventData.attempts;
        emailLog.sentAt = eventData.sentAt || new Date();
        emailLog.error = null;
        await emailLogRepository.updateByJobId(eventData.jobId, emailLog);
      }

      // Update campaign metrics
      await this.updateCampaignMetrics(eventData.campaignId);

      logInfo('Email sent event processed successfully', {
        campaignId: eventData.campaignId,
        jobId: eventData.jobId,
      });
    } catch (error: any) {
      logError('Error handling email.sent event', {
        error,
        campaignId: eventData.campaignId,
        jobId: eventData.jobId,
      });
      throw error;
    }
  },

  /**
   * Handle email.failed event
   */
  async handleEmailFailedEvent(eventData: {
    campaignId: string;
    jobId: string;
    recipientEmail: string;
    error?: string;
    failedAt?: Date;
    attempts: number;
  }): Promise<void> {
    try {
      logInfo('Handling email.failed event', {
        campaignId: eventData.campaignId,
        jobId: eventData.jobId,
      });

      // Find or create email log
      let emailLog = await emailLogRepository.findByJobId(eventData.jobId);

      if (!emailLog) {
        // Create new log entry
        emailLog = await emailLogRepository.create({
          jobId: eventData.jobId,
          campaignId: eventData.campaignId,
          recipientEmail: eventData.recipientEmail,
          status: EmailLogStatus.FAILED,
          error: eventData.error || 'Unknown error',
          attempts: eventData.attempts,
          failedAt: eventData.failedAt || new Date(),
        });
      } else {
        // Update existing log
        emailLog.status = EmailLogStatus.FAILED;
        emailLog.attempts = eventData.attempts;
        emailLog.error = eventData.error || 'Unknown error';
        emailLog.failedAt = eventData.failedAt || new Date();
        await emailLogRepository.updateByJobId(eventData.jobId, emailLog);
      }

      // Update campaign metrics
      await this.updateCampaignMetrics(eventData.campaignId);

      logInfo('Email failed event processed successfully', {
        campaignId: eventData.campaignId,
        jobId: eventData.jobId,
      });
    } catch (error: any) {
      logError('Error handling email.failed event', {
        error,
        campaignId: eventData.campaignId,
        jobId: eventData.jobId,
      });
      throw error;
    }
  },

  /**
   * Get campaign email statistics
   */
  async getCampaignEmailStats(campaignId: string): Promise<{
    sentCount: number;
    failedCount: number;
    pendingCount: number;
  }> {
    try {
      const stats = await emailLogRepository.getCampaignStats(campaignId);
      return {
        sentCount: stats.sent,
        failedCount: stats.failed,
        pendingCount: stats.pending,
      };
    } catch (error: any) {
      logError('Error getting campaign email stats', { error, campaignId });
      throw error;
    }
  },

  /**
   * Update campaign metrics from email_logs
   */
  async updateCampaignMetrics(campaignId: string): Promise<void> {
    try {
      const stats = await emailLogRepository.getCampaignStats(campaignId);
      await campaignRepository.updateMetrics(campaignId, stats.sent, stats.failed);

      // Check if campaign should be marked as completed
      await this.checkAndCompleteCampaign(campaignId, stats);
    } catch (error: any) {
      logError('Error updating campaign metrics', { error, campaignId });
      throw error;
    }
  },

  /**
   * Check if all emails are processed and mark campaign as completed
   */
  async checkAndCompleteCampaign(
    campaignId: string,
    stats?: { sent: number; failed: number; pending: number }
  ): Promise<void> {
    try {
      if (!stats) {
        stats = await emailLogRepository.getCampaignStats(campaignId);
      }

      // Get campaign to check total recipients
      const campaign = await campaignRepository.findById(campaignId, ''); // userId not needed for this check
      if (!campaign) {
        logError('Campaign not found when checking completion', { campaignId });
        return;
      }

      const totalProcessed = stats.sent + stats.failed;
      const totalRecipients = campaign.totalRecipients;

      // If all recipients have been processed (no pending), mark campaign as completed or failed
      if (stats.pending === 0 && totalProcessed === totalRecipients) {
        if (stats.failed === totalRecipients) {
          // All failed
          await campaignRepository.updateStatus(campaignId, campaign.userId, CampaignStatus.FAILED);
          logInfo('Campaign marked as FAILED', { campaignId });
        } else {
          // At least some succeeded
          await campaignRepository.updateStatus(campaignId, campaign.userId, CampaignStatus.COMPLETED);
          logInfo('Campaign marked as COMPLETED', { campaignId });
        }
      } else if (campaign.status === CampaignStatus.QUEUED && totalProcessed > 0) {
        // Start sending - update status to SENDING
        await campaignRepository.updateStatus(campaignId, campaign.userId, CampaignStatus.SENDING);
        logInfo('Campaign status updated to SENDING', { campaignId });
      }
    } catch (error: any) {
      logError('Error checking campaign completion', { error, campaignId });
      // Don't throw - this is a background operation
    }
  },
};
