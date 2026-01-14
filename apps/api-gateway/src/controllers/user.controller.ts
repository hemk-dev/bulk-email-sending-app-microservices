import { Request, Response } from 'express';
import { logInfo } from '@packages/logger';
import { asyncHandler, InternalServerErrorException } from '@packages/errors';

export const userController = {
  getUser: asyncHandler(async (req: Request, res: Response) => {
    // req.currentUser is populated by getUserMiddleware
    // This check is a safety measure in case middleware chain is broken
    if (!req.currentUser) {
      throw new InternalServerErrorException('User information not available. Please authenticate again.');
    }

    logInfo('Get user profile request processed successfully', {
      userId: req.currentUser.id,
      email: req.currentUser.email,
    });

    // Return user profile
    res.status(200).json({
      statusCode: 200,
      message: 'User profile retrieved successfully',
      data: {
        user: req.currentUser,
      },
    });
  }),
};
