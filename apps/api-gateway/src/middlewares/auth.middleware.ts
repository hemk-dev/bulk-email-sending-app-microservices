import { Request, Response, NextFunction } from 'express';
import { logError } from '@packages/logger';
import { UnauthorizedException } from '@packages/errors';
import { verifyAccessToken } from '../shared/utils/jwt';

/**
 * Extend Express Request to include user information
 */
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        firstName?: string;
        lastName?: string;
      };
    }
  }
}

/**
 * Authentication Middleware
 * Verifies JWT access token from Authorization header
 * Attaches user information to request object if token is valid
 */
export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedException('Authorization header is required');
    }

    // Check if Bearer token format is correct
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      throw new UnauthorizedException('Invalid authorization header format. Expected: Bearer <token>');
    }

    const token = parts[1];

    if (!token) {
      throw new UnauthorizedException('Access token is required');
    }

    // Verify token
    const decoded = verifyAccessToken(token);

    // Attach user information to request object
    req.user = {
      id: decoded.id,
      email: decoded.email
    };

    next();
  } catch (error: any) {
    logError('Authentication error', { error: error.message, path: req.path });

    if (error instanceof UnauthorizedException) {
      throw error;
    }

    if (error.message === 'Token has expired') {
      throw new UnauthorizedException('Token has expired');
    }

    if (error.message === 'Invalid token') {
      throw new UnauthorizedException('Invalid access token');
    }

    throw new UnauthorizedException('Authentication failed');
  }
}
