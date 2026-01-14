import Redis from 'ioredis';
import { loadConfig } from '@packages/config';
import { logInfo, logError } from '@packages/logger';

const config = loadConfig();

/**
 * Event Publisher Service
 * Publishes events to Redis Pub/Sub for event-driven updates
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
   * Publish email.sent event
   */
  async publishEmailSentEvent(eventData: {
    campaignId: string;
    jobId: string;
    recipientEmail: string;
    sentAt?: Date;
    attempts: number;
  }): Promise<void> {
    try {
      const channel = `${this.channelPrefix}:email.sent`;
      const payload = JSON.stringify({
        ...eventData,
        sentAt: eventData.sentAt || new Date().toISOString(),
        status: 'SENT',
      });

      await this.getPublisher().publish(channel, payload);

      logInfo('Published email.sent event', {
        campaignId: eventData.campaignId,
        jobId: eventData.jobId,
      });
    } catch (error: any) {
      logError('Failed to publish email.sent event', {
        error: error.message,
        campaignId: eventData.campaignId,
        jobId: eventData.jobId,
      });
      throw error;
    }
  }

  /**
   * Publish email.failed event
   */
  async publishEmailFailedEvent(eventData: {
    campaignId: string;
    jobId: string;
    recipientEmail: string;
    error?: string;
    failedAt?: Date;
    attempts: number;
  }): Promise<void> {
    try {
      const channel = `${this.channelPrefix}:email.failed`;
      const payload = JSON.stringify({
        ...eventData,
        failedAt: eventData.failedAt || new Date().toISOString(),
        status: 'FAILED',
      });

      await this.getPublisher().publish(channel, payload);

      logInfo('Published email.failed event', {
        campaignId: eventData.campaignId,
        jobId: eventData.jobId,
      });
    } catch (error: any) {
      logError('Failed to publish email.failed event', {
        error: error.message,
        campaignId: eventData.campaignId,
        jobId: eventData.jobId,
      });
      throw error;
    }
  }

  /**
   * Close Redis connection
   */
  async close(): Promise<void> {
    if (this.publisher) {
      await this.publisher.quit();
      this.publisher = null;
    }
  }
}

// Export singleton instance
export const eventPublisherService = new EventPublisherService();
