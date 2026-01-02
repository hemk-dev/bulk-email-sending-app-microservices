import pino from 'pino';
import { getContext } from './context';

const logger = pino({
  level: process.env.LOG_LEVEL || 'trace',
  base: undefined,
  timestamp: pino.stdTimeFunctions.isoTime,
  formatters: {
    log(object) {
      const ctx = getContext();
      return {
        ...ctx,
        ...object
      };
    }
  }
});

export function logInfo(message: string, meta?: object) {
  logger.info(meta || {}, message);
}

export function logTrace(message: string, meta?: object) {
  logger.trace(meta || {}, message);
}

export function logError(message: string, meta?: object) {
  logger.error(meta || {}, message);
}

export function logDebug(message: string, meta?: object) {
  logger.debug(meta || {}, message);
}

export function logWarn(message: string, meta?: object) {
  logger.warn(meta || {}, message);
}
