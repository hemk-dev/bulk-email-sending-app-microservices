export type LogLevel =
  | 'trace'
  | 'debug'
  | 'info'
  | 'warn'
  | 'error'
  | 'fatal';

export interface LogContext {
  traceId?: string;
  spanId?: string;
  serviceName?: string;
}