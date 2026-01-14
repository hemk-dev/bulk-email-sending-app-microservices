import { loadConfig } from '@packages/config';

const config = loadConfig();

/**
 * Sender Service Constants
 * All endpoints and configurations for Sender Service
 */
export const SENDER_SERVICE_CONSTANTS = {
  BASE_URL: config.serviceUrls.senderService,
  
  ENDPOINTS: {
    CREATE: `${config.serviceUrls.senderService}/api/senders`,
    GET_ALL: `${config.serviceUrls.senderService}/api/senders`,
    GET_BY_ID: (id: string) => `${config.serviceUrls.senderService}/api/senders/${id}`,
    UPDATE: (id: string) => `${config.serviceUrls.senderService}/api/senders/${id}`,
    DELETE: (id: string) => `${config.serviceUrls.senderService}/api/senders/${id}`,
    VALIDATE_EMAIL: `${config.serviceUrls.senderService}/api/senders/validate-email`,
  },
} as const;
