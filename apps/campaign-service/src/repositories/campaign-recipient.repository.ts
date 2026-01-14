import { Repository } from 'typeorm';
import { AppDataSource } from '../config/data-source';
import { CampaignRecipient } from '../shared/entities/campaign-recipient.entity';

/**
 * Campaign Recipient Repository
 * Handles all database operations for CampaignRecipient entity (read model)
 */
class CampaignRecipientRepository {
  private repository: Repository<CampaignRecipient>;

  constructor() {
    this.repository = AppDataSource.getRepository(CampaignRecipient);
  }

  /**
   * Insert or update recipient snapshot
   */
  async upsert(recipientData: Partial<CampaignRecipient>): Promise<CampaignRecipient> {
    const existing = await this.repository.findOne({
      where: { id: recipientData.id },
    });

    if (existing) {
      Object.assign(existing, {
        ...recipientData,
        lastSyncedAt: new Date(),
      });
      return await this.repository.save(existing);
    } else {
      const recipient = this.repository.create({
        ...recipientData,
        lastSyncedAt: new Date(),
      });
      return await this.repository.save(recipient);
    }
  }

  /**
   * Find all recipients for a campaign
   */
  async findByCampaignId(campaignId: string): Promise<CampaignRecipient[]> {
    return await this.repository.find({
      where: { campaignId },
      order: { createdAt: 'ASC' },
    });
  }

  /**
   * Count recipients for a campaign
   */
  async countByCampaignId(campaignId: string): Promise<number> {
    return await this.repository.count({
      where: { campaignId },
    });
  }

  /**
   * Delete all recipients for a campaign (if needed)
   */
  async deleteByCampaignId(campaignId: string): Promise<void> {
    await this.repository.delete({ campaignId });
  }

  /**
   * Find recipient by ID
   */
  async findById(id: string): Promise<CampaignRecipient | null> {
    return await this.repository.findOne({
      where: { id },
    });
  }
}

// Export a singleton instance
export const campaignRecipientRepository = new CampaignRecipientRepository();
