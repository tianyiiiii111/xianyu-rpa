/**
 * utils/logger.ts - 日志系统
 */

import { createRequire } from 'module';
import { config } from '../config/index.js';

const require = createRequire(import.meta.url);
const pino = require('pino');

// 创建logger实例
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const logger: any = pino({
  level: config.LOG_LEVEL,
  transport: config.NODE_ENV === 'development' 
    ? { target: 'pino-pretty', options: { colorize: true } }
    : undefined,
  formatters: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    level: (label: any) => ({ level: label })
  },
  timestamp: pino.stdTimeFunctions.isoTime,
  base: { service: 'xianyu-rpa' }
});

// 便捷方法
export const createLogger = (name: string) => logger.child({ module: name });

// 导出常用方法
export const log = {
  trace: (msg: string, ...args: unknown[]) => logger.trace(msg, ...args),
  debug: (msg: string, ...args: unknown[]) => logger.debug(msg, ...args),
  info: (msg: string, ...args: unknown[]) => logger.info(msg, ...args),
  warn: (msg: string, ...args: unknown[]) => logger.warn(msg, ...args),
  error: (msg: string, ...args: unknown[]) => logger.error(msg, ...args)
};

export default logger;