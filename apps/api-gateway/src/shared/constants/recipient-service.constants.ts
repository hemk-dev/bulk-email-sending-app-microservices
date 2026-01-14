import { loadConfig } from '@packages/config';

const config = loadConfig();

/**
 * Recipient Service Constants
 * All endpoints and configurations for Recipient Service
 */
export const RECIPIENT_SERVICE_CONSTANTS = {
  BASE_URL: config.serviceUrls.recipientService,
  
  ENDPOINTS: {
    // Add recipient endpoints here as needed
    // CREATE: `${config.serviceUrls.recipientService}/api/recipients`,
    // GET_ALL: `${config.serviceUrls.recipientService}/api/recipients`,
    // GET_BY_ID: (id: string) => `${config.serviceUrls.recipientService}/api/recipients/${id}`,
    // UPDATE: (id: string) => `${config.serviceUrls.recipientService}/api/recipients/${id}`,
    // DELETE: (id: string) => `${config.serviceUrls.recipientService}/api/recipients/${id}`,
  },
} as const;
