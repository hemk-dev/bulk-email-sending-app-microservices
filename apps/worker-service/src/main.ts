import { loadConfig } from '@packages/config';
import { logInfo, logError } from '@packages/logger';
import "reflect-metadata";
import { AppDataSource } from './config/data-source';
import { createEmailWorker } from './queue/email-queue.worker';
import { initializeEncryptionUtil } from './shared/utils/encryption.util';

const config = loadConfig();

// Initialize encryption util with config
initializeEncryptionUtil(config.encryptionKey);

logInfo('Bootstrapping Worker Service', {
  service: config.serviceName,
  env: config.env
});

/**
 * Worker Service Main Entry Point
 * Initializes database connection and starts the email queue worker
 */
AppDataSource.initialize()
  .then(() => {
    logInfo('Database connection established');
    
    // Create and start email worker after database connection is ready
    const worker = createEmailWorker();

    logInfo('Worker service started successfully');
  })
  .catch((error: Error) => {
    logError('Database connection failed', { error });
    process.exit(1);
  });
