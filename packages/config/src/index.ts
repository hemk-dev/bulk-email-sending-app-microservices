import dotenv from 'dotenv';
import path from 'path';

export function loadConfig() {
  const env = process.env.NODE_ENV || 'development';
  const envPath = path.resolve(process.cwd(), `.env.${env}`);
  
  // Load environment-specific file
  dotenv.config({ path: envPath });
  // Load default .env file as fallback
  dotenv.config();

  const port = process.env.PORT || process.env.SERVICE_PORT;
  const serviceName = process.env.SERVICE_NAME;
  const redisHost = process.env.REDIS_HOST;
  const redisPort = Number(process.env.REDIS_PORT);
  
  if (!port) {
    throw new Error('PORT is not defined');
  }

  return {
    port: Number(port),
    redisHost,
    redisPort,
    serviceName,
    env
  };
}
