import { Request, Response, NextFunction } from 'express';
import { logWarn, logError } from '@packages/logger';
import { TooManyRequestsException } from '@packages/errors';
import { redisClient } from '../shared/redis/redis.client';

export interface RateLimiterOptions {
  /**
   * Maximum number of requests allowed
   */
  maxRequests: number;
  
  /**
   * Time window in minutes
   */
  windowMinutes: number;
  
  /**
   * Optional custom key generator (defaults to IP address)
   */
  keyGenerator?: (req: Request) => string;
  
  /**
   * Optional custom message for rate limit exceeded
   */
  message?: string;
}

/**
 * Get client IP address from request
 * Handles proxy scenarios (X-Forwarded-For, X-Real-IP)
 */
function getClientIp(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim();
  }
  
  const realIp = req.headers['x-real-ip'];
  if (typeof realIp === 'string') {
    return realIp;
  }
  
  return req.socket.remoteAddress || 'unknown';
}

/**
 * Create rate limiter middleware
 * Uses Redis sliding window algorithm to limit requests per IP
 * 
 * @param options - Rate limiter configuration options
 * @returns Express middleware function
 * 
 * @example
 * // Limit to 5 requests per minute per IP
 * const loginRateLimiter = createRateLimiter({ maxRequests: 5, windowMinutes: 1 });
 * router.post('/login', loginRateLimiter, authController.login);
 */
export function createRateLimiter(options: RateLimiterOptions) {
  const {
    maxRequests,
    windowMinutes,
    keyGenerator = (req: Request) => {
      const ip = getClientIp(req);
      const path = req.path;
      return `rate-limit:${path}:${ip}`;
    },
    message = 'Too Many Requests, please retry after sometime',
  } = options;

  const windowSeconds = windowMinutes * 60;
  const redis = redisClient.getClient();

  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const key = keyGenerator(req);
      const now = Date.now();
      const windowStart = now - windowSeconds * 1000;

      const pipeline = redis.pipeline();

      pipeline.zremrangebyscore(key, 0, windowStart);

      pipeline.zcard(key);

      pipeline.zadd(key, now, `${now}-${Math.random()}`);

      pipeline.expire(key, windowSeconds + 10);

      const results = await pipeline.exec();

      if (!results || results.length < 2) {
        logWarn('Rate limiter Redis operation failed, allowing request', { key });
        return next();
      }

      const currentCount = results[1][1] as number;

      if (currentCount >= maxRequests) {
        const oldestRequest = await redis.zrange(key, 0, 0, 'WITHSCORES');
        let retryAfter = windowSeconds;
        
        if (oldestRequest && oldestRequest.length >= 2) {
          const oldestTimestamp = parseInt(oldestRequest[1] as string, 10);
          retryAfter = Math.ceil((oldestTimestamp + windowSeconds * 1000 - now) / 1000);
        }

        res.setHeader('X-RateLimit-Limit', maxRequests.toString());
        res.setHeader('X-RateLimit-Remaining', '0');
        res.setHeader('Retry-After', retryAfter.toString());

        logWarn('Rate limit exceeded', {
          ip: getClientIp(req),
          path: req.path,
          currentCount,
          maxRequests,
          retryAfter,
        });

        throw new TooManyRequestsException(message);
      }

      const remaining = Math.max(0, maxRequests - currentCount - 1);
      res.setHeader('X-RateLimit-Limit', maxRequests.toString());
      res.setHeader('X-RateLimit-Remaining', remaining.toString());

      next();
    } catch (error: any) {
      if (error instanceof TooManyRequestsException) {
        throw error;
      }

      logWarn('Rate limiter error, allowing request', {
        error: error.message,
        ip: getClientIp(req),
        path: req.path,
      });
      next();
    }
  };
}

export const rateLimiters = {

  login: createRateLimiter({
    maxRequests: 5,
    windowMinutes: 1,
    message: 'Too Many Requests, Please retry after sometime!',
  }),

  register: createRateLimiter({
    maxRequests: 3,
    windowMinutes: 10,
    message: 'Too Many Requests, Please retry after sometime!',
  }),

  getUser: createRateLimiter({
    maxRequests: 10,
    windowMinutes: 1,
    message: 'Too Many Requests, Please retry after sometime!',
  }),
};
