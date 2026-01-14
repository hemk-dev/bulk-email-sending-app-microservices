import Redis from 'ioredis';
import { loadConfig } from '@packages/config';
import { logInfo, logError } from '@packages/logger';

const config = loadConfig();

class RedisClient {
  private client: Redis | null = null;

  getClient(): Redis {
    if (!this.client) {
      this.client = new Redis({
        host: config.redisHost || 'localhost',
        port: config.redisPort || 6379,
        retryStrategy: (times: number) => {
          const delay = Math.min(times * 50, 2000);
          return delay;
        },
        reconnectOnError: (err: Error) => {
          const targetError = 'READONLY';
          if (err.message.includes(targetError)) {
            return true;
          }
          return false;
        },
      });

      this.client.on('connect', () => {
        logInfo('Redis client connected');
      });

      this.client.on('error', (err) => {
        logError('Redis client error', { error: err.message });
      });

      this.client.on('close', () => {
        logInfo('Redis client connection closed');
      });
    }

    return this.client;
  }

  /**
   * Close Redis connection
   */
  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.quit();
      this.client = null;
    }
  }
}

// Export singleton instance
export const redisClient = new RedisClient();
