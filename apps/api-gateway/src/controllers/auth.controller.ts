import { Request, Response } from 'express';
import { logInfo } from '@packages/logger';
import { asyncHandler, BadRequestException } from '@packages/errors';
import { authService } from '../services/auth.service';
import { LoginUserDto, RegisterUserDto } from '../shared/interfaces/auth.interface';

export const authController = {
  signup: asyncHandler(async (req: Request, res: Response) => {
    logInfo('User registration request received in API Gateway', { email: req.body?.email });
    
    const userData: RegisterUserDto = req.body;

    // Validate request body exists
    if (!userData) {
      throw new BadRequestException('Request body is required');
    }

    // Validate required fields
    if (!userData.email || !userData.password) {
      throw new BadRequestException('Missing required fields: email and password are required');
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userData.email)) {
      throw new BadRequestException('Invalid email format');
    }

    // Validate password length
    if (userData.password.length < 6) {
      throw new BadRequestException('Password must be at least 6 characters long');
    }

    const result = await authService.registerUser(userData);

    res.status(result.statusCode || 201).json(result);
  }),

  login: asyncHandler(async (req: Request, res: Response) => {
    logInfo('User login request received in API Gateway', { email: req.body?.email });
    
    const credentials: LoginUserDto = req.body;

    // Validate request body exists
    if (!credentials) {
      throw new BadRequestException('Request body is required');
    }

    // Validate required fields
    if (!credentials.email || !credentials.password) {
      throw new BadRequestException('Missing required fields: email and password are required');
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(credentials.email)) {
      throw new BadRequestException('Invalid email format');
    }

    const result = await authService.loginUser(credentials);

    res.status(result.statusCode || 200).json(result);
  }),
};
