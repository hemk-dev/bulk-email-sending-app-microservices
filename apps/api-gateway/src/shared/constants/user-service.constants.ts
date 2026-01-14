import { loadConfig } from '@packages/config';

const config = loadConfig();

/**
 * User Service Constants
 * All endpoints and configurations for User Service
 */
export const USER_SERVICE_CONSTANTS = {
  BASE_URL: config.serviceUrls.userService,
  
  ENDPOINTS: {
    REGISTER: `${config.serviceUrls.userService}/api/user/register`,
    LOGIN: `${config.serviceUrls.userService}/api/user/login`,
    GET_USER: (id: string) => `${config.serviceUrls.userService}/api/user/${id}`,
  },
} as const;
