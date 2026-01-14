import Redis from 'ioredis';
import { loadConfig } from '@packages/config';
import { logInfo, logError } from '@packages/logger';
import { campaignSenderCacheRepository } from '../repositories/campaign-sender-cache.repository';

const config = loadConfig();

/**
 * Sender Event Consumer
 * Listens to sender.created and sender.updated events from sender-service
 */
export function createSenderEventConsumer(): Redis {
  const channelPrefix = process.env.EVENT_BUS_CHANNEL_PREFIX || 'email-events';
  const subscriber = new Redis({
    host: config.redisHost || process.env.REDIS_HOST || 'localhost',
    port: config.redisPort || Number(process.env.REDIS_PORT) || 6379,
    retryStrategy: (times: number) => {
      const delay = Math.min(times * 50, 2000);
      return delay;
    },
  });

  subscriber.on('error', (err) => {
    logError('Redis subscriber error', { error: err.message });
  });

  subscriber.on('connect', () => {
    logInfo('Sender event consumer connected to Redis');
  });

  // Subscribe to sender events
  subscriber.subscribe(`${channelPrefix}:sender.created`, `${channelPrefix}:sender.updated`);

  subscriber.on('message', async (channel, message) => {
    try {
      const senderData = JSON.parse(message);

      logInfo('Received sender event', {
        channel,
        senderId: senderData.id || senderData.senderId,
      });

      // Update sender cache
      await campaignSenderCacheRepository.upsert({
        senderId: senderData.id || senderData.senderId,
        userId: senderData.userId,
        fromEmail: senderData.fromEmail,
        name: senderData.name,
        smtpHost: senderData.smtpHost,
        smtpPort: senderData.smtpPort,
        smtpUser: senderData.smtpUser,
        smtpPassword: senderData.smtpPassword,
        isActive: senderData.isActive !== undefined ? senderData.isActive : true,
      });

      logInfo('Sender cache updated', {
        senderId: senderData.id || senderData.senderId,
      });
    } catch (error: any) {
      logError('Error processing sender event', {
        error: error.message,
        channel,
        stack: error.stack,
      });
      // Don't throw - continue processing other events
    }
  });

  logInfo('Sender event consumer started', {
    channels: [`${channelPrefix}:sender.created`, `${channelPrefix}:sender.updated`],
  });

  return subscriber;
}
