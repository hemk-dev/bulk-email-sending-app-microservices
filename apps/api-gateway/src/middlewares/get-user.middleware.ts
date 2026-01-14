import { Request, Response, NextFunction } from 'express';
import { logError, logInfo } from '@packages/logger';
import {
  UnauthorizedException,
  NotFoundException,
  InternalServerErrorException,
} from '@packages/errors';
import { userService } from '../services/user.service';

export interface UserObject {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

declare global {
  namespace Express {
    interface Request {
      currentUser?: UserObject;
    }
  }
}

export async function getUserMiddleware(req: Request, res: Response, next: NextFunction) {
  try {
    // Validate user is authenticated (from authMiddleware)
    if (!req.user || !req.user.id || !req.user.email) {
      throw new UnauthorizedException('User not authenticated');
    }

    const userId = req.user.id;
    const userEmail = req.user.email;

    logInfo('Fetching user object from user service', { userId, email: userEmail });

    // Fetch full user object from user service
    const result = await userService.getUserById(userId);

    // Validate response structure
    if (!result || !result.data || !result.data.user) {
      logError('Invalid response structure from user service', {
        userId,
        hasResult: !!result,
        hasData: !!(result?.data),
        hasUser: !!(result?.data?.user),
      });
      throw new NotFoundException('User not found');
    }

    const userData = result.data.user;

    // Security check: Verify email matches between token and fetched user
    if (userData.email !== userEmail) {
      logError('Email mismatch detected in getUser middleware', {
        tokenEmail: userEmail,
        userEmail: userData.email,
        userId,
      });
      throw new UnauthorizedException('User data mismatch. Authentication failed.');
    }

    // Attach full user object to request
    req.currentUser = {
      id: userData.id,
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
      createdAt: userData.createdAt,
      updatedAt: userData.updatedAt,
    };

    logInfo('User object attached to request successfully', {
      userId: req.currentUser.id,
      email: req.currentUser.email,
    });

    next();
  } catch (error: any) {
    // If it's already a BaseException, re-throw it
    if (error instanceof UnauthorizedException || error instanceof NotFoundException) {
      logError('GetUser middleware error', {
        error: error.message,
        statusCode: error.statusCode,
        userId: req.user?.id,
        path: req.path,
      });
      throw error;
    }

    // For unexpected errors, wrap in InternalServerErrorException
    logError('Unexpected error in getUser middleware', {
      error: error.message,
      stack: error.stack,
      userId: req.user?.id,
      path: req.path,
    });
    throw new InternalServerErrorException('Failed to retrieve user information. Please try again later.');
  }
}
