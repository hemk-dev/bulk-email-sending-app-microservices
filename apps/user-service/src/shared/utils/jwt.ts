import jwt from 'jsonwebtoken';
import { loadConfig } from '@packages/config';

const config = loadConfig();

export function signAccessToken(payload: object) {
  return jwt.sign(payload, config.jwtSecret, {
    expiresIn: '60m',
  });
}

export function verifyAccessToken(token: string) {
  return jwt.verify(token, config.jwtSecret);
}