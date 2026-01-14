import { loadConfig } from '@packages/config';

const config = loadConfig();

/**
 * Campaign Service Constants
 * All endpoints and configurations for Campaign Service
 */
export const CAMPAIGN_SERVICE_CONSTANTS = {
  BASE_URL: config.serviceUrls.campaignService,
  
  ENDPOINTS: {
    CREATE: `${config.serviceUrls.campaignService}/campaign`,
    GET_ALL: `${config.serviceUrls.campaignService}/campaign`,
    GET_BY_ID: (id: string) => `${config.serviceUrls.campaignService}/campaign/${id}`,
    UPDATE: (id: string) => `${config.serviceUrls.campaignService}/campaign/${id}`,
    DELETE: (id: string) => `${config.serviceUrls.campaignService}/campaign/${id}`,
    PREPARE: (id: string) => `${config.serviceUrls.campaignService}/campaign/${id}/prepare`,
    START: (id: string) => `${config.serviceUrls.campaignService}/campaign/${id}/start`,
    GET_STATUS: (id: string) => `${config.serviceUrls.campaignService}/campaign/${id}/status`,
    GET_METRICS: (id: string) => `${config.serviceUrls.campaignService}/campaign/${id}/metrics`,
  },
} as const;
