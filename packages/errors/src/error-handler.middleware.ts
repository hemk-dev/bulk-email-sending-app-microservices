import { Request, Response, NextFunction } from 'express';
import { logError } from '@packages/logger';
import { TraceContext } from '@packages/tracing';
import { BaseException } from './exceptions/base.exception';
import axios from 'axios';

export interface ErrorResponse {
  statusCode: number;
  error: string;
  message: string;
  details?: any;
  timestamp?: string;
  path?: string;
  traceId?: string;
}

export function errorHandlerMiddleware(
  error: Error | BaseException,
  req: Request,
  res: Response,
  next: NextFunction
) {
  const traceId = TraceContext.getTraceId();

  // If it's our custom exception, use it directly
  if (error instanceof BaseException) {
    const errorResponse: ErrorResponse = {
      ...error.toJSON(),
      timestamp: new Date().toISOString(),
      path: req.path,
      ...(traceId && { traceId }),
    };

    logError('Request failed', {
      error: error.message,
      statusCode: error.statusCode,
      path: req.path,
      method: req.method,
      traceId,
    });

    return res.status(error.statusCode).json(errorResponse);
  }

  // Handle Axios errors (from service-to-service calls)
  if (axios.isAxiosError(error)) {
    const axiosError = error as any;
    
    // Network error (service unavailable)
    if (!axiosError.response) {
      const errorResponse: ErrorResponse = {
        statusCode: 503,
        error: 'Service Unavailable',
        message: 'The requested service is currently unavailable',
        timestamp: new Date().toISOString(),
        path: req.path,
        ...(traceId && { traceId }),
      };

      logError('Service unavailable', {
        error: axiosError.message,
        path: req.path,
        method: req.method,
        traceId,
      });

      return res.status(503).json(errorResponse);
    }

    // Service returned an error response
    const serviceError = axiosError.response.data;
    const statusCode = axiosError.response.status || 500;
    
    const errorResponse: ErrorResponse = {
      statusCode,
      error: serviceError?.error || 'Service Error',
      message: serviceError?.message || axiosError.message || 'An error occurred',
      ...(serviceError?.details && { details: serviceError.details }),
      timestamp: new Date().toISOString(),
      path: req.path,
      ...(traceId && { traceId }),
    };

    logError('Service error', {
      error: serviceError?.message || axiosError.message,
      statusCode,
      path: req.path,
      method: req.method,
      traceId,
    });

    return res.status(statusCode).json(errorResponse);
  }

  // Handle validation errors (e.g., from express-validator)
  if (error.name === 'ValidationError') {
    const errorResponse: ErrorResponse = {
      statusCode: 400,
      error: 'Validation Error',
      message: error.message,
      timestamp: new Date().toISOString(),
      path: req.path,
      ...(traceId && { traceId }),
    };

    logError('Validation error', {
      error: error.message,
      path: req.path,
      method: req.method,
      traceId,
    });

    return res.status(400).json(errorResponse);
  }

  // Default: Internal Server Error
  const errorResponse: ErrorResponse = {
    statusCode: 500,
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'production' 
      ? 'An unexpected error occurred' 
      : error.message,
    timestamp: new Date().toISOString(),
    path: req.path,
    ...(traceId && { traceId }),
  };

  logError('Unhandled error', {
    error: error.message,
    stack: error.stack,
    path: req.path,
    method: req.method,
    traceId,
  });

  return res.status(500).json(errorResponse);
}
