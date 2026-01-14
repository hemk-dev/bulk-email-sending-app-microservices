import { AxiosError } from 'axios';
import {
  BadRequestException,
  UnauthorizedException,
  ForbiddenException,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
} from './exceptions';

/**
 * Maps Axios error status codes to appropriate exception types
 * @param axiosError - The Axios error to map
 * @returns The appropriate exception instance based on the HTTP status code
 */
export function mapAxiosErrorToException(axiosError: AxiosError<{ message?: string }>) {
  const statusCode = axiosError.response?.status || 500;
  const errorMessage = axiosError.response?.data?.message || axiosError.message || 'An error occurred';

  switch (statusCode) {
    case 400:
      return new BadRequestException(errorMessage);
    case 401:
      return new UnauthorizedException(errorMessage);
    case 403:
      return new ForbiddenException(errorMessage);
    case 404:
      return new NotFoundException(errorMessage);
    case 409:
      return new ConflictException(errorMessage);
    default:
      return new InternalServerErrorException(errorMessage);
  }
}
