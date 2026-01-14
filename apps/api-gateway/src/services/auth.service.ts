import axios from 'axios';
import { logInfo, logError } from '@packages/logger';
import { mapAxiosErrorToException, InternalServerErrorException } from '@packages/errors';
import { USER_SERVICE_CONSTANTS } from '../shared/constants/user-service.constants';
import { TraceContext } from '@packages/tracing';
import { LoginUserDto, RegisterUserDto } from '../shared/interfaces/auth.interface';

export const authService = {
  async registerUser(userData: RegisterUserDto) {
    try {
      logInfo('Calling user service to register user', { email: userData.email });
      
      const traceId = TraceContext.getTraceId();
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      if (traceId) {
        headers['X-Trace-Id'] = traceId;
      }
      
      const response = await axios.post(
        USER_SERVICE_CONSTANTS.ENDPOINTS.REGISTER,
        userData,
        { headers }
      );

      logInfo('User registered successfully via user service', { email: userData.email });
      return response.data;
    } catch (error: any) {
      logError('Failed to register user', {
        error: error.message,
        email: userData.email,
        stack: error.stack,
      });
      
      // Map Axios errors to appropriate exceptions
      if (axios.isAxiosError(error)) {
        throw mapAxiosErrorToException(error);
      }
      
      // For unexpected errors, throw internal server error
      throw new InternalServerErrorException('Failed to register user. Please try again later.');
    }
  },

  async loginUser(credentials: LoginUserDto) {
    try {
      logInfo('Calling user service to login user', { email: credentials.email });
      
      const traceId = TraceContext.getTraceId();
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      if (traceId) {
        headers['X-Trace-Id'] = traceId;
      }
      
      const response = await axios.post(
        USER_SERVICE_CONSTANTS.ENDPOINTS.LOGIN,
        credentials,
        { headers }
      );

      logInfo('User logged in successfully via user service', { email: credentials.email });
      return response.data;
    } catch (error: any) {
      logError('Failed to login user', {
        error: error.message,
        email: credentials.email,
        stack: error.stack,
      });
      
      // Map Axios errors to appropriate exceptions
      if (axios.isAxiosError(error)) {
        throw mapAxiosErrorToException(error);
      }
      
      // For unexpected errors, throw internal server error
      throw new InternalServerErrorException('Failed to login user. Please try again later.');
    }
  },
};
