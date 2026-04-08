/**
 * requestLogger.js - HTTP请求日志中间件
 * 
 * 功能：
 * 1. 请求日志记录
 * 2. 响应时间统计
 * 3. 请求ID追踪
 */

import { generateRequestId } from './security.js';

/**
 * 创建请求日志中间件
 * @param {Object} options - 配置选项
 * @param {boolean} options.logBody - 是否记录请求体
 * @param {boolean} options.logResponse - 是否记录响应体
 * @param {string[]} options.excludePaths - 跳过日志的路径
 */
export function createRequestLogger(options = {}) {
  const { 
    logBody = false, 
    logResponse = false,
    excludePaths = ['/health', '/api/health']
  } = options;

  return async (req, res, next) => {
    // 跳过指定路径
    if (excludePaths.some(path => req.path.startsWith(path))) {
      return next();
    }

    // 生成请求ID
    req.id = req.headers['x-request-id'] || generateRequestId();
    res.setHeader('X-Request-ID', req.id);

    const startTime = Date.now();
    const { method, url, headers } = req;

    // 记录请求开始
    console.log(
      `📥 ${method} ${url} [${req.id}] ` +
      `ip: ${req.ip} ` +
      `ua: ${headers['user-agent']?.substring(0, 50) || 'unknown'}`
    );

    // 记录请求体（可选）
    if (logBody && req.method !== 'GET' && req.body) {
      const bodySize = JSON.stringify(req.body).length;
      console.log(`   body: ${bodySize} bytes`);
    }

    // 监听响应完成
    res.on('finish', () => {
      const duration = Date.now() - startTime;
      const statusColor = getStatusColor(res.statusCode);
      
      console.log(
        `📤 ${method} ${url} [${req.id}] ` +
        `${statusColor}${res.statusCode}${'\x1b[0m'} ` +
        `${duration}ms `
      );
    });

    // 监听错误
    res.on('error', (err) => {
      console.error(
        `❌ ${method} ${url} [${req.id}] ` +
        `error: ${err.message}`
      );
    });

    next();
  };
}

/**
 * 获取状态码对应的颜色
 */
function getStatusColor(statusCode) {
  if (statusCode >= 500) return '\x1b[31m'; // 红色 - 服务器错误
  if (statusCode >= 400) return '\x1b[33m'; // 黄色 - 客户端错误
  if (statusCode >= 300) return '\x1b[36m'; // 青色 - 重定向
  if (statusCode >= 200) return '\x1b[32m'; // 绿色 - 成功
  return '\x1b[0m'; // 默认
}

/**
 * 性能监控中间件
 */
export function performanceMonitor(req, res, next) {
  const start = process.hrtime.bigint();
  
  res.on('finish', () => {
    const end = process.hrtime.bigint();
    const duration = Number(end - start) / 1e6; // 转换为毫秒
    
    // 记录性能指标
    if (duration > 1000) {
      console.warn(`⚠️ 慢请求: ${req.method} ${req.path} 耗时 ${duration.toFixed(2)}ms`);
    }
    
    // 可以发送到指标系统
    // recordAPI(req.route?.path || req.path, duration, res.statusCode < 400);
  });
  
  next();
}

/**
 * 请求限流中间件（基于内存）
 */
const requestCounts = new Map();

export function rateLimitMiddleware(options = {}) {
  const { 
    windowMs = 60000, 
    maxRequests = 100 
  } = options;

  return (req, res, next) => {
    const key = req.ip;
    const now = Date.now();
    
    // 获取或初始化计数
    let record = requestCounts.get(key);
    if (!record || now - record.windowStart > windowMs) {
      record = { windowStart: now, count: 0 };
      requestCounts.set(key, record);
    }
    
    // 检查限制
    record.count++;
    
    if (record.count > maxRequests) {
      res.setHeader('Retry-After', Math.ceil(windowMs / 1000));
      return res.status(429).json({
        success: false,
        error: {
          name: 'TooManyRequests',
          message: '请求过于频繁，请稍后再试',
          retryAfter: Math.ceil(windowMs / 1000)
        }
      });
    }
    
    // 设置响应头
    res.setHeader('X-RateLimit-Limit', maxRequests);
    res.setHeader('X-RateLimit-Remaining', maxRequests - record.count);
    res.setHeader('X-RateLimit-Reset', Math.ceil((record.windowStart + windowMs) / 1000));
    
    next();
  };
}

// 定期清理过期记录（每分钟）
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of requestCounts) {
    if (now - record.windowStart > 60000) {
      requestCounts.delete(key);
    }
  }
}, 60000);

export default {
  createRequestLogger,
  performanceMonitor,
  rateLimitMiddleware
};