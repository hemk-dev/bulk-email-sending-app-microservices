import { Repository } from 'typeorm';
import { AppDataSource } from '../config/data-source';
import { Campaign, CampaignStatus } from '../shared/entities/campaign.entity';

/**
 * Campaign Repository
 * Handles all database operations for Campaign entity
 * This layer separates data access logic from business logic
 */
class CampaignRepository {
  private repository: Repository<Campaign>;

  constructor() {
    this.repository = AppDataSource.getRepository(Campaign);
  }

  /**
   * Find a campaign by ID with ownership check
   */
  async findById(id: string, userId: string): Promise<Campaign | null> {
    return await this.repository.findOne({
      where: { id, userId },
    });
  }

  /**
   * Find campaigns by userId with pagination
   */
  async findByUserId(userId: string, limit: number, offset: number): Promise<Campaign[]> {
    return await this.repository.find({
      where: { userId },
      take: limit,
      skip: offset,
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Create a new campaign
   */
  async create(campaignData: Partial<Campaign>): Promise<Campaign> {
    const campaign = this.repository.create(campaignData);
    return await this.repository.save(campaign);
  }

  /**
   * Update a campaign (with ownership check)
   */
  async update(id: string, userId: string, updates: Partial<Campaign>): Promise<Campaign> {
    const campaign = await this.findById(id, userId);
    if (!campaign) {
      throw new Error('Campaign not found or access denied');
    }
    Object.assign(campaign, updates);
    return await this.repository.save(campaign);
  }

  /**
   * Delete a campaign (with ownership check)
   */
  async delete(id: string, userId: string): Promise<void> {
    const result = await this.repository.delete({ id, userId });
    if (result.affected === 0) {
      throw new Error('Campaign not found or access denied');
    }
  }

  /**
   * Update campaign status (with ownership check)
   */
  async updateStatus(id: string, userId: string, status: CampaignStatus): Promise<Campaign> {
    const campaign = await this.findById(id, userId);
    if (!campaign) {
      throw new Error('Campaign not found or access denied');
    }
    campaign.status = status;
    return await this.repository.save(campaign);
  }

  /**
   * Update campaign metrics
   */
  async updateMetrics(id: string, sentCount: number, failedCount: number): Promise<void> {
    await this.repository.update(id, { sentCount, failedCount });
  }
}

// Export a singleton instance
export const campaignRepository = new CampaignRepository();
