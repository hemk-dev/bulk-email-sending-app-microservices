import { Repository } from 'typeorm';
import { AppDataSource } from '../config/data-source';
import { EmailLog, EmailLogStatus } from '../shared/entities/email-log.entity';

/**
 * Email Log Repository
 * Handles all database operations for EmailLog entity
 */
class EmailLogRepository {
  private repository: Repository<EmailLog>;

  constructor() {
    this.repository = AppDataSource.getRepository(EmailLog);
  }

  /**
   * Create a new email log entry
   */
  async create(logData: Partial<EmailLog>): Promise<EmailLog> {
    const emailLog = this.repository.create(logData);
    return await this.repository.save(emailLog);
  }

  /**
   * Update email log by BullMQ job ID
   */
  async updateByJobId(jobId: string, updates: Partial<EmailLog>): Promise<EmailLog | null> {
    const emailLog = await this.repository.findOne({ where: { jobId } });
    if (!emailLog) {
      return null;
    }
    Object.assign(emailLog, updates);
    return await this.repository.save(emailLog);
  }

  /**
   * Find email log by job ID
   */
  async findByJobId(jobId: string): Promise<EmailLog | null> {
    return await this.repository.findOne({ where: { jobId } });
  }

  /**
   * Find all logs for a campaign
   */
  async findByCampaignId(campaignId: string): Promise<EmailLog[]> {
    return await this.repository.find({
      where: { campaignId },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Count logs by campaign ID and status
   */
  async countByCampaignIdAndStatus(campaignId: string, status: EmailLogStatus): Promise<number> {
    return await this.repository.count({
      where: { campaignId, status },
    });
  }

  /**
   * Find pending logs for a campaign
   */
  async findPendingByCampaignId(campaignId: string): Promise<EmailLog[]> {
    return await this.repository.find({
      where: { campaignId, status: EmailLogStatus.PENDING },
    });
  }

  /**
   * Get all logs for a campaign grouped by status
   */
  async getCampaignStats(campaignId: string): Promise<{
    sent: number;
    failed: number;
    pending: number;
  }> {
    const [sent, failed, pending] = await Promise.all([
      this.countByCampaignIdAndStatus(campaignId, EmailLogStatus.SENT),
      this.countByCampaignIdAndStatus(campaignId, EmailLogStatus.FAILED),
      this.countByCampaignIdAndStatus(campaignId, EmailLogStatus.PENDING),
    ]);

    return { sent, failed, pending };
  }
}

// Export a singleton instance
export const emailLogRepository = new EmailLogRepository();
