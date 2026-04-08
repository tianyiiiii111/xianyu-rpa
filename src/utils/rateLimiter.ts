/**
 * utils/rateLimiter.ts - 限流器
 */

import type { RateLimiterOptions } from '../types/index.js';
import { config } from '../config/index.js';

// 内存限流存储
const requestCounts = new Map<string, { windowStart: number; count: number }>();

/**
 * 创建限流中间件
 */
export function createRateLimiter(options: Partial<RateLimiterOptions> = {}): (req: { ip: string }, res: { setHeader: (key: string, value: string) => void; status: (code: number) => { json: (data: unknown) => void } }, next: () => void) => void {
  const { windowMs = 60000, maxRequests = config.RATE_LIMIT_MAX } = options;

  return (req, res, next) => {
    const key = req.ip;
    const now = Date.now();
    
    let record = requestCounts.get(key);
    if (!record || now - record.windowStart > windowMs) {
      record = { windowStart: now, count: 0 };
      requestCounts.set(key, record);
    }
    
    record.count += 1;
    
    if (record.count > maxRequests) {
      res.setHeader('Retry-After', String(Math.ceil(windowMs / 1000)));
      return res.status(429).json({
        success: false,
        error: { name: 'TooManyRequests', message: '请求过于频繁' }
      });
    }
    
    res.setHeader('X-RateLimit-Limit', String(maxRequests));
    res.setHeader('X-RateLimit-Remaining', String(maxRequests - record.count));
    res.setHeader('X-RateLimit-Reset', String(Math.ceil((record.windowStart + windowMs) / 1000)));
    
    next();
  };
}

// 定期清理过期记录
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of requestCounts) {
    if (now - record.windowStart > 60000) {
      requestCounts.delete(key);
    }
  }
}, 60000);

export default { createRateLimiter };