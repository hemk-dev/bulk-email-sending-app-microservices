import { Repository } from 'typeorm';
import { AppDataSource } from '../config/data-source';
import { CampaignSenderCache } from '../shared/entities/campaign-sender-cache.entity';

/**
 * Campaign Sender Cache Repository
 * Handles all database operations for CampaignSenderCache entity (read model)
 */
class CampaignSenderCacheRepository {
  private repository: Repository<CampaignSenderCache>;

  constructor() {
    this.repository = AppDataSource.getRepository(CampaignSenderCache);
  }

  /**
   * Insert or update sender snapshot
   */
  async upsert(senderData: Partial<CampaignSenderCache>): Promise<CampaignSenderCache> {
    const existing = await this.repository.findOne({
      where: { senderId: senderData.senderId },
    });

    if (existing) {
      Object.assign(existing, {
        ...senderData,
        lastSyncedAt: new Date(),
      });
      return await this.repository.save(existing);
    } else {
      const senderCache = this.repository.create({
        ...senderData,
        lastSyncedAt: new Date(),
      });
      return await this.repository.save(senderCache);
    }
  }

  /**
   * Find sender by email and userId
   */
  async findByEmailAndUserId(email: string, userId: string): Promise<CampaignSenderCache | null> {
    return await this.repository.findOne({
      where: {
        fromEmail: email.toLowerCase().trim(),
        userId,
        isActive: true,
      },
    });
  }

  /**
   * Find sender by senderId
   */
  async findById(senderId: string): Promise<CampaignSenderCache | null> {
    return await this.repository.findOne({
      where: { senderId },
    });
  }

  /**
   * Find all active senders for a user
   */
  async findByUserId(userId: string): Promise<CampaignSenderCache[]> {
    return await this.repository.find({
      where: { userId, isActive: true },
      order: { createdAt: 'DESC' },
    });
  }
}

// Export a singleton instance
export const campaignSenderCacheRepository = new CampaignSenderCacheRepository();
