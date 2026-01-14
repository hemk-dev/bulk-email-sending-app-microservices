import axios from 'axios';
import { logInfo, logError } from '@packages/logger';
import { mapAxiosErrorToException, InternalServerErrorException } from '@packages/errors';
import { USER_SERVICE_CONSTANTS } from '../shared/constants/user-service.constants';
import { TraceContext } from '@packages/tracing';

export const userService = {
  async getUserById(userId: number) {
    try {
      logInfo('Calling user service to get user', { userId });
      
      const traceId = TraceContext.getTraceId();
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      if (traceId) {
        headers['X-Trace-Id'] = traceId;
      }
      
      const response = await axios.get(
        USER_SERVICE_CONSTANTS.ENDPOINTS.GET_USER(userId.toString()),
        { headers }
      );

      logInfo('User retrieved successfully via user service', { userId });
      return response.data;
    } catch (error: any) {
      logError('Failed to get user from user service', {
        error: error.message,
        userId,
        stack: error.stack,
      });
      
      // Map Axios errors to appropriate exceptions
      if (axios.isAxiosError(error)) {
        throw mapAxiosErrorToException(error);
      }
      
      // For unexpected errors, throw internal server error
      throw new InternalServerErrorException('Failed to retrieve user information. Please try again later.');
    }
  },
};
