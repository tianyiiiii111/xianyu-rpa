/**
 * utils/requestLogger.ts - HTTP请求日志中间件
 */

import { generateRequestId } from './security.js';

interface LoggerOptions {
  logBody?: boolean;
  logResponse?: boolean;
  excludePaths?: string[];
}

interface RequestWithId {
  id?: string;
  path: string;
  ip: string;
  headers: Record<string, string>;
  method: string;
}

interface ResponseWithStatus {
  statusCode: number;
  setHeader: (key: string, value: string) => void;
  on: (event: string, cb: () => void) => void;
}

export function createRequestLogger(options: LoggerOptions = {}) {
  const { excludePaths = ['/health', '/api/health'] } = options;

  return (req: RequestWithId, res: ResponseWithStatus, next: () => void) => {
    if (excludePaths.some(p => req.path.startsWith(p))) {
      return next();
    }

    req.id = req.headers['x-request-id'] || generateRequestId();
    res.setHeader('X-Request-ID', req.id);

    const startTime = Date.now();
    const { method } = req;

    console.log(`📥 ${method} ${req.path} [${req.id}] ip: ${req.ip}`);

    res.on('finish', () => {
      const duration = Date.now() - startTime;
      const status = res.statusCode;
      const color = status >= 500 ? '\x1b[31m' : status >= 400 ? '\x1b[33m' : status >= 200 ? '\x1b[32m' : '\x1b[0m';
      console.log(`📤 ${method} ${req.path} [${req.id}] ${color}${status}\x1b[0m ${duration}ms`);
    });

    next();
  };
}

export function performanceMonitor(req: RequestWithId, res: ResponseWithStatus, next: () => void) {
  const start = process.hrtime.bigint();
  
  res.on('finish', () => {
    const end = process.hrtime.bigint();
    const duration = Number(end - start) / 1e6;
    
    if (duration > 1000) {
      console.warn(`⚠️ 慢请求: ${duration.toFixed(2)}ms`);
    }
  });
  
  next();
}

export default { createRequestLogger, performanceMonitor };