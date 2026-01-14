import Redis from 'ioredis';
import { loadConfig } from '@packages/config';
import { logInfo, logError } from '@packages/logger';
import { Sender } from '../shared/entities/sender.entity';

const config = loadConfig();

/**
 * Event Publisher Service for Sender Service
 * Publishes sender events to Redis Pub/Sub
 */
class EventPublisherService {
  private publisher: Redis | null = null;
  private readonly channelPrefix: string;

  constructor() {
    this.channelPrefix = process.env.EVENT_BUS_CHANNEL_PREFIX || 'email-events';
  }

  /**
   * Get Redis publisher client
   */
  private getPublisher(): Redis {
    if (!this.publisher) {
      this.publisher = new Redis({
        host: config.redisHost || process.env.REDIS_HOST || 'localhost',
        port: config.redisPort || Number(process.env.REDIS_PORT) || 6379,
        retryStrategy: (times: number) => {
          const delay = Math.min(times * 50, 2000);
          return delay;
        },
      });

      this.publisher.on('error', (err) => {
        logError('Redis publisher error', { error: err.message });
      });

      this.publisher.on('connect', () => {
        logInfo('Redis publisher connected');
      });
    }

    return this.publisher;
  }

  /**
   * Publish sender.created event
   */
  async publishSenderCreated(sender: Sender): Promise<void> {
    try {
      const channel = `${this.channelPrefix}:sender.created`;
      const payload = JSON.stringify({
        id: sender.id,
        senderId: sender.id,
        userId: sender.userId,
        fromEmail: sender.fromEmail,
        name: sender.name,
        smtpHost: sender.smtpHost,
        smtpPort: sender.smtpPort,
        smtpUser: sender.smtpUser,
        smtpPassword: sender.smtpPassword,
        isActive: sender.isActive,
      });

      await this.getPublisher().publish(channel, payload);

      logInfo('Published sender.created event', {
        senderId: sender.id,
      });
    } catch (error: any) {
      logError('Failed to publish sender.created event', {
        error: error.message,
        senderId: sender.id,
      });
      // Don't throw - event publishing failure shouldn't break the operation
    }
  }

  /**
   * Publish sender.updated event
   */
  async publishSenderUpdated(sender: Sender): Promise<void> {
    try {
      const channel = `${this.channelPrefix}:sender.updated`;
      const payload = JSON.stringify({
        id: sender.id,
        senderId: sender.id,
        userId: sender.userId,
        fromEmail: sender.fromEmail,
        name: sender.name,
        smtpHost: sender.smtpHost,
        smtpPort: sender.smtpPort,
        smtpUser: sender.smtpUser,
        smtpPassword: sender.smtpPassword,
        isActive: sender.isActive,
      });

      await this.getPublisher().publish(channel, payload);

      logInfo('Published sender.updated event', {
        senderId: sender.id,
      });
    } catch (error: any) {
      logError('Failed to publish sender.updated event', {
        error: error.message,
        senderId: sender.id,
      });
      // Don't throw - event publishing failure shouldn't break the operation
    }
  }
}

// Export singleton instance
export const eventPublisherService = new EventPublisherService();
