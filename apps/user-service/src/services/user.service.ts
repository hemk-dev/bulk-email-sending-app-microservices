import { logInfo, logError } from '@packages/logger';
import {
  BadRequestException,
  ConflictException,
  UnauthorizedException,
  NotFoundException,
} from '@packages/errors';
import { userRepository } from '../repositories/user.repository';
import { hashPassword, comparePassword } from '../shared/utils/password';
import { signAccessToken } from '../shared/utils/jwt';
import { RegisterUserDto, LoginUserDto } from '../shared/dto/user.dto';

// UUID validation regex
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const userService = {
  async register(userData: RegisterUserDto) {
    try {
      logInfo('Starting user registration', { email: userData.email });
      
      // Validation: Check required fields
      if (!userData.firstName || !userData.lastName || !userData.email || !userData.password) {
        throw new BadRequestException('Missing required fields: firstName, lastName, email, password');
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(userData.email)) {
        throw new BadRequestException('Invalid email format');
      }

      if (userData.password.length < 6) {
        throw new BadRequestException('Password must be at least 6 characters long');
      }

      // Check if user already exists using repository
      const existingUser = await userRepository.findByEmail(userData.email);
      
      if (existingUser) {
        throw new ConflictException('User with this email already exists');
      }
      
      const hashedPassword = await hashPassword(userData.password);
      
      // Create and save user using repository
      const savedUser = await userRepository.create({
        firstName: userData.firstName.trim(),
        lastName: userData.lastName.trim(),
        email: userData.email.toLowerCase().trim(),
        password: hashedPassword,
      });
      
      const token = signAccessToken({
        id: savedUser.id,
        firstName: savedUser.firstName,
        lastName: savedUser.lastName,
        email: savedUser.email,
      });
      
      logInfo('User registered successfully', { userId: savedUser.id, email: savedUser.email });
      
      return {
        statusCode: 201,
        message: 'User registered successfully',
        data: {
          user: {
            id: savedUser.id,
            firstName: savedUser.firstName,
            lastName: savedUser.lastName,
            email: savedUser.email,
            createdAt: savedUser.createdAt,
          },
          token,
        },
      };
    } catch (error: any) {
      logError('User registration error', { error });
      throw error;
    }
  },

  async login(credentials: LoginUserDto) {
    try {
      logInfo('Starting user login', { email: credentials.email });
      
      if (!credentials.email || !credentials.password) {
        throw new BadRequestException('Missing required fields: email, password');
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(credentials.email)) {
        throw new BadRequestException('Invalid email format');
      }

      const user = await userRepository.findByEmail(credentials.email);
      
      if (!user) {
        throw new UnauthorizedException('Invalid email or password');
      }
      
      const isPasswordValid = await comparePassword(credentials.password, user.password);
      
      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid email or password');
      }
      
      const token = signAccessToken({
        id: user.id,
        email: user.email,
      });
      
      logInfo('User logged in successfully', { userId: user.id, email: user.email });
      
      return {
        statusCode: 200,
        message: 'Login successful',
        data: {
          user: {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            createdAt: user.createdAt,
          },
          token,
        },
      };
    } catch (error: any) {
      logError('User login error', { error });
      throw error;
    }
  },

  async getUser(userId: string) {
    try {
      logInfo('Starting get user', { userId });
      
      if (!userId || !UUID_REGEX.test(userId)) {
        throw new BadRequestException('Invalid user ID');
      }

      const user = await userRepository.findById(userId);
      
      if (!user) {
        throw new NotFoundException('User not found');
      }
      
      logInfo('User fetched successfully', { userId: user.id, email: user.email });
      
      return {
        statusCode: 200,
        message: 'User fetched successfully',
        data: {
          user: {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
          },
        },
      };
    } catch (error: any) {
      logError('Get user error', { error, userId });
      throw error;
    }
  },
};
