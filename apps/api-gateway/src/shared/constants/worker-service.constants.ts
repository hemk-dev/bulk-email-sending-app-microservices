import { loadConfig } from '@packages/config';

const config = loadConfig();

/**
 * Worker Service Constants
 * All endpoints and configurations for Worker Service
 */
export const WORKER_SERVICE_CONSTANTS = {
  BASE_URL: config.serviceUrls.workerService,
  
  ENDPOINTS: {
    // Add worker endpoints here as needed
    // PROCESS_QUEUE: `${config.serviceUrls.workerService}/api/worker/process`,
    // GET_STATUS: `${config.serviceUrls.workerService}/api/worker/status`,
  },
} as const;
