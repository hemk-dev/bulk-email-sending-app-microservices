import { loadConfig } from '@packages/config';

const config = loadConfig();

/**
 * Campaign Service Constants
 * All endpoints and configurations for Campaign Service
 */
export const CAMPAIGN_SERVICE_CONSTANTS = {
  BASE_URL: config.serviceUrls.campaignService,
  
  ENDPOINTS: {
    // Add campaign endpoints here as needed
    // CREATE: `${config.serviceUrls.campaignService}/api/campaigns`,
    // GET_ALL: `${config.serviceUrls.campaignService}/api/campaigns`,
    // GET_BY_ID: (id: string) => `${config.serviceUrls.campaignService}/api/campaigns/${id}`,
    // UPDATE: (id: string) => `${config.serviceUrls.campaignService}/api/campaigns/${id}`,
    // DELETE: (id: string) => `${config.serviceUrls.campaignService}/api/campaigns/${id}`,
  },
} as const;
