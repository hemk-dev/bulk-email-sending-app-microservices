import pino from 'pino';
import { getContext } from './context';
import { TraceContext } from '@packages/tracing';

const isDevelopment = process.env.NODE_ENV === 'development';

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  base: {
    service: process.env.SERVICE_NAME,
    env: process.env.NODE_ENV
  },
  timestamp: pino.stdTimeFunctions.isoTime,
  transport: isDevelopment ? {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'SYS:standard',
      ignore: 'pid,hostname',
      singleLine: false
    }
  } : undefined,
  mixin() {
    return {
      traceId: TraceContext.getTraceId()
    };
  },
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
