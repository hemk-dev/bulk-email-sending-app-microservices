import { Repository, In } from 'typeorm';
import { AppDataSource } from '../config/data-source';
import { Recipient } from '../shared/entities/recipient.entity';

/**
 * Recipient Repository
 * Handles all database operations for Recipient entity
 * Optimized for batch operations and deduplication
 */
class RecipientRepository {
  private repository: Repository<Recipient>;

  constructor() {
    this.repository = AppDataSource.getRepository(Recipient);
  }

  /**
   * Find a recipient by ID
   */
  async findById(id: string): Promise<Recipient | null> {
    return await this.repository.findOne({
      where: { id },
    });
  }

  /**
   * Find recipients by campaignId with pagination
   */
  async findByCampaignId(campaignId: string, limit: number, offset: number): Promise<Recipient[]> {
    return await this.repository.find({
      where: { campaignId },
      take: limit,
      skip: offset,
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Count recipients by campaignId
   */
  async countByCampaignId(campaignId: string): Promise<number> {
    return await this.repository.count({
      where: { campaignId },
    });
  }

  /**
   * Create a single recipient
   */
  async create(recipient: Partial<Recipient>): Promise<Recipient> {
    const newRecipient = this.repository.create(recipient);
    return await this.repository.save(newRecipient);
  }

  /**
   * Bulk create recipients efficiently
   * Uses TypeORM's save() with array for batch insert
   */
  async bulkCreate(recipients: Partial<Recipient>[]): Promise<Recipient[]> {
    if (recipients.length === 0) {
      return [];
    }

    // Process in chunks if batch size > 1000
    const chunkSize = 1000;
    const results: Recipient[] = [];

    for (let i = 0; i < recipients.length; i += chunkSize) {
      const chunk = recipients.slice(i, i + chunkSize);
      const createdRecipients = this.repository.create(chunk);
      const saved = await this.repository.save(createdRecipients);
      results.push(...saved);
    }

    return results;
  }

  /**
   * Check if a recipient exists by campaignId and email
   */
  async existsByCampaignAndEmail(campaignId: string, email: string): Promise<boolean> {
    const count = await this.repository.count({
      where: { campaignId, email: email.toLowerCase() },
    });
    return count > 0;
  }

  /**
   * Bulk check for existing emails in a campaign
   * Returns a Set of existing email addresses (lowercase)
   */
  async bulkExistsCheck(campaignId: string, emails: string[]): Promise<Set<string>> {
    if (emails.length === 0) {
      return new Set();
    }

    // Normalize emails to lowercase for comparison
    const normalizedEmails = emails.map(email => email.toLowerCase());
    
    const existingRecipients = await this.repository.find({
      where: {
        campaignId,
        email: In(normalizedEmails),
      },
      select: ['email'],
    });

    return new Set(existingRecipients.map(r => r.email.toLowerCase()));
  }
}

// Export a singleton instance
export const recipientRepository = new RecipientRepository();
