import jwt from 'jsonwebtoken';
import { loadConfig } from '@packages/config';

const config = loadConfig();

export function verifyAccessToken(token: string): any {
  try {
    return jwt.verify(token, config.jwtSecret);
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('Token has expired');
    }
    if (error.name === 'JsonWebTokenError') {
      throw new Error('Invalid token');
    }
    throw error;
  }
}
