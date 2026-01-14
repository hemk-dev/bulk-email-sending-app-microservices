import { Request, Response } from 'express';
import { logInfo } from '@packages/logger';
import { asyncHandler } from '@packages/errors';
import { userService } from '../services/user.service';
import { RegisterUserDto, LoginUserDto } from '../shared/dto/user.dto';

export const userController = {
  register: asyncHandler(async (req: Request, res: Response) => {
    logInfo('User registration request received');
    
    const userData: RegisterUserDto = req.body;
    
    const result = await userService.register(userData);
    
    res.status(result.statusCode).json(result);
  }),

  login: asyncHandler(async (req: Request, res: Response) => {
    logInfo('User login request received');
    
    const credentials: LoginUserDto = req.body;
    
    const result = await userService.login(credentials);
    
    res.status(result.statusCode).json(result);
  }),

  getUser: asyncHandler(async (req: Request, res: Response) => {
    logInfo('Get user request received', { userId: req.params.id });
    
    const userId = req.params.id;
    
    const result = await userService.getUser(userId);
    
    res.status(result.statusCode).json(result);
  }),
};
