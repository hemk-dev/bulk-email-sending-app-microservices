import dotenv from 'dotenv';

dotenv.config();

export function loadConfig() {
  const port = process.env.PORT;
  const serviceName = process.env.SERVICE_NAME;

  if (!serviceName) {
    throw new Error('SERVICE_NAME is not defined');
  }

  return {
    port: port ? Number(port) : undefined,
    serviceName,
    env: process.env.NODE_ENV || 'development'
  };
}
