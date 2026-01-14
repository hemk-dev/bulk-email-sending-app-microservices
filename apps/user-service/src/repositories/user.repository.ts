import { Repository } from 'typeorm';
import { AppDataSource } from '../config/data-source';
import { User } from '../shared/entities/user.entity';

/**
 * User Repository
 * Handles all database operations for User entity
 * This layer separates data access logic from business logic
 */
class UserRepository {
  private repository: Repository<User>;

  constructor() {
    this.repository = AppDataSource.getRepository(User);
  }

  /**
   * Find a user by email
   */
  async findByEmail(email: string): Promise<User | null> {
    return await this.repository.findOne({
      where: { email: email.toLowerCase().trim() },
    });
  }

  /**
   * Find a user by ID
   */
  async findById(id: string): Promise<User | null> {
    return await this.repository.findOne({
      where: { id },
    });
  }

  /**
   * Create a new user
   */
  async create(userData: Partial<User>): Promise<User> {
    const user = this.repository.create(userData);
    return await this.repository.save(user);
  }

  /**
   * Save/Update a user
   */
  async save(user: User): Promise<User> {
    return await this.repository.save(user);
  }

  /**
   * Check if a user exists by email
   */
  async existsByEmail(email: string): Promise<boolean> {
    const count = await this.repository.count({
      where: { email: email.toLowerCase().trim() },
    });
    return count > 0;
  }
}

// Export a singleton instance
export const userRepository = new UserRepository();
