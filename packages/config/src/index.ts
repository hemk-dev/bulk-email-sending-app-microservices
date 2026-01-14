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

  const database = {
    'type': String(process.env.DB_TYPE),
    'dbName':   process.env.DB_NAME,
    'userName': process.env.DB_USER,
    'password': process.env.DB_PASSWORD,
    'port': Number(process.env.DB_PORT),
    'host': process.env.DB_HOST,
    'logging': Boolean(process.env.DB_LOGGING),
    'sync': Boolean(process.env.DB_SYNC)
  }

  const saltRounds = Number(process.env.SALT_ROUNDS);
  const jwtSecret = String(process.env.JWT_SECRET);

  const serviceUrls = {
    userService: process.env.USER_SERVICE_URL || 'http://localhost:5001',
    campaignService: process.env.CAMPAIGN_SERVICE_URL || 'http://localhost:5002',
    recipientService: process.env.RECIPIENT_SERVICE_URL || 'http://localhost:5003',
    workerService: process.env.WORKER_SERVICE_URL || 'http://localhost:5004',
  };

  return {
    port: Number(port),
    redisHost,
    redisPort,
    serviceName,
    database,
    env,
    saltRounds,
    jwtSecret,
    serviceUrls
  };
}
