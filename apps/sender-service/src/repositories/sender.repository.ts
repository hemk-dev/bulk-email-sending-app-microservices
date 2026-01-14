import { Repository } from 'typeorm';
import { AppDataSource } from '../config/data-source';
import { Sender } from '../shared/entities/sender.entity';

/**
 * Sender Repository
 * Handles all database operations for Sender entity
 * This layer separates data access logic from business logic
 */
class SenderRepository {
  private repository: Repository<Sender>;

  constructor() {
    this.repository = AppDataSource.getRepository(Sender);
  }

  /**
   * Find a sender by ID with ownership check
   */
  async findById(id: string, userId: string): Promise<Sender | null> {
    return await this.repository.findOne({
      where: { id, userId },
    });
  }

  /**
   * Find senders by userId with pagination
   */
  async findByUserId(userId: string, limit: number, offset: number): Promise<Sender[]> {
    return await this.repository.find({
      where: { userId },
      take: limit,
      skip: offset,
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Find a sender by email and userId (for validation)
   */
  async findByEmailAndUserId(email: string, userId: string): Promise<Sender | null> {
    return await this.repository.findOne({
      where: { fromEmail: email.toLowerCase().trim(), userId, isActive: true },
    });
  }

  async create(senderData: Partial<Sender>): Promise<Sender> {
    const sender = this.repository.create(senderData);
    return await this.repository.save(sender);
  }

  async update(id: string, userId: string, updates: Partial<Sender>): Promise<Sender> {
    const sender = await this.findById(id, userId);
    if (!sender) {
      throw new Error('Sender not found or access denied');
    }
    Object.assign(sender, updates);
    return await this.repository.save(sender);
  }

  /**
   * Soft delete a sender (sets isActive=false) with ownership check
   */
  async delete(id: string, userId: string): Promise<void> {
    const sender = await this.findById(id, userId);
    if (!sender) {
      throw new Error('Sender not found or access denied');
    }
    sender.isActive = false;
    await this.repository.save(sender);
  }
}

// Export a singleton instance
export const senderRepository = new SenderRepository();
