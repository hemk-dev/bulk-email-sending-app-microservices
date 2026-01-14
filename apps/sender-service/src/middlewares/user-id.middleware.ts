import { Request, Response, NextFunction } from 'express';
import { BadRequestException } from '@packages/errors';

// UUID validation regex
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Extend Express Request to include userId
 */
declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

/**
 * Middleware to extract and validate userId from X-User-Id header
 * This header is set by API Gateway after authentication
 */
export function userIdMiddleware(req: Request, res: Response, next: NextFunction) {
  const userId = req.headers['x-user-id'] as string;

  if (!userId) {
    throw new BadRequestException('X-User-Id header is required');
  }

  if (!UUID_REGEX.test(userId)) {
    throw new BadRequestException('Invalid user ID format');
  }

  req.userId = userId;
  next();
}
