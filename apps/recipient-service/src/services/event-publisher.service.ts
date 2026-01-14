import Redis from 'ioredis';
import { loadConfig } from '@packages/config';
import { logInfo, logError } from '@packages/logger';
import { Recipient } from '../shared/entities/recipient.entity';

const config = loadConfig();

/**
 * Event Publisher Service for Recipient Service
 * Publishes recipient events to Redis Pub/Sub
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
   * Publish recipient.created event
   */
  async publishRecipientCreated(recipient: Recipient): Promise<void> {
    try {
      const channel = `${this.channelPrefix}:recipient.created`;
      const payload = JSON.stringify({
        id: recipient.id,
        campaignId: recipient.campaignId,
        email: recipient.email,
        name: recipient.name,
        metadata: recipient.metadata,
      });

      await this.getPublisher().publish(channel, payload);

      logInfo('Published recipient.created event', {
        recipientId: recipient.id,
        campaignId: recipient.campaignId,
      });
    } catch (error: any) {
      logError('Failed to publish recipient.created event', {
        error: error.message,
        recipientId: recipient.id,
      });
      // Don't throw - event publishing failure shouldn't break the operation
    }
  }

  /**
   * Publish recipient.updated event
   */
  async publishRecipientUpdated(recipient: Recipient): Promise<void> {
    try {
      const channel = `${this.channelPrefix}:recipient.updated`;
      const payload = JSON.stringify({
        id: recipient.id,
        campaignId: recipient.campaignId,
        email: recipient.email,
        name: recipient.name,
        metadata: recipient.metadata,
      });

      await this.getPublisher().publish(channel, payload);

      logInfo('Published recipient.updated event', {
        recipientId: recipient.id,
        campaignId: recipient.campaignId,
      });
    } catch (error: any) {
      logError('Failed to publish recipient.updated event', {
        error: error.message,
        recipientId: recipient.id,
      });
      // Don't throw - event publishing failure shouldn't break the operation
    }
  }
}

// Export singleton instance
export const eventPublisherService = new EventPublisherService();
