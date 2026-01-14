
import { loadConfig } from '@packages/config';
import bcrypt from 'bcrypt';

const config = loadConfig();

export const hashPassword = (password: string) =>
  bcrypt.hash(password, config.saltRounds);

export const comparePassword = (password: string, hash: string) =>
  bcrypt.compare(password, hash);
