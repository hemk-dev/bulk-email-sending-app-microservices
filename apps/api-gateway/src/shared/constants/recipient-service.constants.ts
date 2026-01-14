import { loadConfig } from '@packages/config';

const config = loadConfig();

/**
 * Recipient Service Constants
 * All endpoints and configurations for Recipient Service
 */
export const RECIPIENT_SERVICE_CONSTANTS = {
  BASE_URL: config.serviceUrls.recipientService,
  
  ENDPOINTS: {
    CREATE_SINGLE: `${config.serviceUrls.recipientService}/api/recipients/single`,
    CREATE_BULK: `${config.serviceUrls.recipientService}/api/recipients/bulk`,
    GET_COUNT: (campaignId: string) => `${config.serviceUrls.recipientService}/api/recipients/count?campaignId=${campaignId}`,
    GET_BATCH: (campaignId: string, limit: number, offset: number) => 
      `${config.serviceUrls.recipientService}/api/recipients/batch?campaignId=${campaignId}&limit=${limit}&offset=${offset}`,
  },
} as const;
