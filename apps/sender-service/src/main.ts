import { loadConfig } from '@packages/config';
import { logInfo, logError } from '@packages/logger';
import "reflect-metadata";
import { AppDataSource } from './config/data-source';
import { startServer } from './server';
import { initializeEncryptionUtil } from './shared/utils/encryption.util';

const config = loadConfig();

// Initialize encryption util with config
initializeEncryptionUtil(config.encryptionKey);

logInfo('Bootstrapping Sender Service', {
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
