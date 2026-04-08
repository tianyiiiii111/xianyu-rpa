/**
 * logger.js - 日志系统
 * 
 * 功能：
 * 1. 统一日志输出格式
 * 2. 支持多级别日志 (trace, debug, info, warn, error)
 * 3. 可配置输出目标
 */

import pino from 'pino';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..', '..');
const LOG_DIR = path.join(ROOT, 'logs');

// 确保日志目录存在
import fs from 'fs';
fs.mkdirSync(LOG_DIR, { recursive: true });

// 创建日志记录器
const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: {
    targets: [
      // 控制台输出
      {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'HH:MM:ss',
          ignore: 'pid,hostname'
        },
        level: 'info'
      },
      // 文件输出 - 错误日志
      {
        target: 'pino/file',
        options: {
          destination: path.join(LOG_DIR, 'error.log'),
          mkdir: true
        },
        level: 'error'
      },
      // 文件输出 - 全部日志
      {
        target: 'pino/file',
        options: {
          destination: path.join(LOG_DIR, 'app.log'),
          mkdir: true
        },
        level: 'trace'
      }
    ]
  },
  // 自定义日志级别名称
  levelKey: 'level',
  // 启用时间戳
  timestamp: pino.stdTimeFunctions.isoTime,
  // 序列化
  serializers: {
    err: pino.stdSerializers.err,
    req: pino.stdSerializers.req,
    res: pino.stdSerializers.res
  }
});

// 便捷方法
export const log = {
  trace: (msg, ...args) => logger.trace(msg, ...args),
  debug: (msg, ...args) => logger.debug(msg, ...args),
  info: (msg, ...args) => logger.info(msg, ...args),
  warn: (msg, ...args) => logger.warn(msg, ...args),
  error: (msg, ...args) => logger.error(msg, ...args),
  
  // 业务日志便捷方法
  search: (msg, ...args) => logger.info(`[搜索] ${msg}`, ...args),
  publish: (msg, ...args) => logger.info(`[发布] ${msg}`, ...args),
  ai: (msg, ...args) => logger.info(`[AI] ${msg}`, ...args),
  browser: (msg, ...args) => logger.info(`[浏览器] ${msg}`, ...args),
  storage: (msg, ...args) => logger.info(`[存储] ${msg}`, ...args),
  
  // 性能日志
  time: (label) => logger.time(label),
  timeEnd: (label) => logger.timeEnd(label)
};

export default logger;