import { loadConfig } from '@packages/config';
import { logInfo, logError } from '@packages/logger';
import "reflect-metadata";
import { AppDataSource } from './config/data-source';
import { startServer } from './server';

const config = loadConfig();

logInfo('Bootstrapping User Service', {
  service: config.serviceName,
  env: config.env
});

if (!config.port) {
  throw new Error('PORT is not defined');
}

AppDataSource.initialize()
  .then(() => {
    logInfo('Database connection established');
    startServer(config.port);
  })
  .catch((error: Error) => {
    logError('Database connection failed', { error });
    process.exit(1);
  });
