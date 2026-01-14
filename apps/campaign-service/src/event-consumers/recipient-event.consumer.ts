import Redis from 'ioredis';
import { loadConfig } from '@packages/config';
import { logInfo, logError } from '@packages/logger';
import { campaignRecipientRepository } from '../repositories/campaign-recipient.repository';

const config = loadConfig();

/**
 * Recipient Event Consumer
 * Listens to recipient.created and recipient.updated events from recipient-service
 */
export function createRecipientEventConsumer(): Redis {
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
    logInfo('Recipient event consumer connected to Redis');
  });

  // Subscribe to recipient events
  subscriber.subscribe(`${channelPrefix}:recipient.created`, `${channelPrefix}:recipient.updated`);

  subscriber.on('message', async (channel, message) => {
    try {
      const recipientData = JSON.parse(message);

      logInfo('Received recipient event', {
        channel,
        recipientId: recipientData.id,
        campaignId: recipientData.campaignId,
      });

      // Update recipient cache
      await campaignRecipientRepository.upsert({
        id: recipientData.id,
        campaignId: recipientData.campaignId,
        email: recipientData.email,
        name: recipientData.name || null,
        metadata: recipientData.metadata || null,
      });

      logInfo('Recipient cache updated', {
        recipientId: recipientData.id,
        campaignId: recipientData.campaignId,
      });
    } catch (error: any) {
      logError('Error processing recipient event', {
        error: error.message,
        channel,
        stack: error.stack,
      });
      // Don't throw - continue processing other events
    }
  });

  logInfo('Recipient event consumer started', {
    channels: [`${channelPrefix}:recipient.created`, `${channelPrefix}:recipient.updated`],
  });

  return subscriber;
}
