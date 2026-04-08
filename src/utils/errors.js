/**
 * errors.js - 统一错误类型
 * 
 * 功能：
 * 1. 定义项目专用错误类
 * 2. 错误码标准化
 * 3. 错误处理中间件
 */

// 错误码枚举
export const ErrorCodes = {
  // 通用错误 (1xxx)
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  UNAUTHORIZED: 'UNAUTHORIZED',
  
  // 搜索相关 (2xxx)
  SEARCH_FAILED: 'SEARCH_FAILED',
  SEARCH_TIMEOUT: 'SEARCH_TIMEOUT',
  NO_SEARCH_RESULTS: 'NO_SEARCH_RESULTS',
  
  // 发布相关 (3xxx)
  PUBLISH_FAILED: 'PUBLISH_FAILED',
  PUBLISH_TIMEOUT: 'PUBLISH_TIMEOUT',
  LOGIN_REQUIRED: 'LOGIN_REQUIRED',
  COOKIE_EXPIRED: 'COOKIE_EXPIRED',
  PRODUCT_DATA_INVALID: 'PRODUCT_DATA_INVALID',
  
  // AI服务相关 (4xxx)
  AI_SERVICE_ERROR: 'AI_SERVICE_ERROR',
  AI_API_KEY_MISSING: 'AI_API_KEY_MISSING',
  AI_RATE_LIMIT: 'AI_RATE_LIMIT',
  
  // 网络相关 (5xxx)
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT_ERROR: 'TIMEOUT_ERROR',
  
  // 存储相关 (6xxx)
  STORAGE_ERROR: 'STORAGE_ERROR',
  FILE_NOT_FOUND: 'FILE_NOT_FOUND',
  
  // 队列相关 (7xxx)
  QUEUE_ERROR: 'QUEUE_ERROR',
  JOB_NOT_FOUND: 'JOB_NOT_FOUND',
  REDIS_CONNECTION_ERROR: 'REDIS_CONNECTION_ERROR'
};

// 错误类定义
export class XianyuError extends Error {
  /**
   * @param {string} message - 错误消息
   * @param {string} code - 错误码
   * @param {Object} details - 额外详情
   */
  constructor(message, code = ErrorCodes.UNKNOWN_ERROR, details = {}) {
    super(message);
    this.name = 'XianyuError';
    this.code = code;
    this.details = details;
    this.timestamp = new Date().toISOString();
    
    // 保持正确的堆栈跟踪
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, XianyuError);
    }
  }

  /**
   * 转换为JSON
   */
  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      details: this.details,
      timestamp: this.timestamp,
      stack: process.env.NODE_ENV === 'production' ? undefined : this.stack
    };
  }
}

// 特定错误类
export class ValidationError extends XianyuError {
  constructor(message, details = {}) {
    super(message, ErrorCodes.VALIDATION_ERROR, details);
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends XianyuError {
  constructor(message, details = {}) {
    super(message, ErrorCodes.NOT_FOUND, details);
    this.name = 'NotFoundError';
  }
}

export class NetworkError extends XianyuError {
  constructor(message, details = {}) {
    super(message, ErrorCodes.NETWORK_ERROR, details);
    this.name = 'NetworkError';
  }
}

export class TimeoutError extends XianyuError {
  constructor(message, details = {}) {
    super(message, ErrorCodes.TIMEOUT_ERROR, details);
    this.name = 'TimeoutError';
  }
}

export class StorageError extends XianyuError {
  constructor(message, details = {}) {
    super(message, ErrorCodes.STORAGE_ERROR, details);
    this.name = 'StorageError';
  }
}

export class QueueError extends XianyuError {
  constructor(message, details = {}) {
    super(message, ErrorCodes.QUEUE_ERROR, details);
    this.name = 'QueueError';
  }
}

// 错误工厂函数
export function createError(code, message, details = {}) {
  const errorClasses = {
    [ErrorCodes.VALIDATION_ERROR]: ValidationError,
    [ErrorCodes.NOT_FOUND]: NotFoundError,
    [ErrorCodes.NETWORK_ERROR]: NetworkError,
    [ErrorCodes.TIMEOUT_ERROR]: TimeoutError,
    [ErrorCodes.STORAGE_ERROR]: StorageError,
    [ErrorCodes.QUEUE_ERROR]: QueueError
  };
  
  const ErrorClass = errorClasses[code] || XianyuError;
  return new ErrorClass(message, details);
}

// 错误处理中间件
export function errorHandler(err, req, res, next) {
  // 记录错误日志
  console.error('❌ 错误:', {
    name: err.name,
    message: err.message,
    code: err.code,
    path: req.path,
    method: req.method,
    ...(err.details || {})
  });
  
  // 处理XianyuError
  if (err instanceof XianyuError) {
    return res.status(getStatusCode(err.code)).json({
      success: false,
      error: {
        name: err.name,
        code: err.code,
        message: err.message,
        details: err.details,
        timestamp: err.timestamp
      }
    });
  }
  
  // 处理验证错误
  if (err.name === 'ValidationError' || err.isJoi) {
    return res.status(400).json({
      success: false,
      error: {
        name: 'ValidationError',
        code: ErrorCodes.VALIDATION_ERROR,
        message: err.message,
        details: err.details || err.details,
        timestamp: new Date().toISOString()
      }
    });
  }
  
  // 处理JWT等认证错误
  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({
      success: false,
      error: {
        name: 'UnauthorizedError',
        code: ErrorCodes.UNAUTHORIZED,
        message: '未授权访问',
        timestamp: new Date().toISOString()
      }
    });
  }
  
  // 未知错误
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    error: {
      name: err.name || 'Error',
      code: ErrorCodes.UNKNOWN_ERROR,
      message: process.env.NODE_ENV === 'production' 
        ? '服务器内部错误' 
        : err.message,
      timestamp: new Date().toISOString()
    }
  });
}

/**
 * 根据错误码获取HTTP状态码
 */
function getStatusCode(code) {
  const statusMap = {
    [ErrorCodes.VALIDATION_ERROR]: 400,
    [ErrorCodes.NOT_FOUND]: 404,
    [ErrorCodes.UNAUTHORIZED]: 401,
    [ErrorCodes.LOGIN_REQUIRED]: 401,
    [ErrorCodes.COOKIE_EXPIRED]: 401,
    [ErrorCodes.AI_API_KEY_MISSING]: 500,
    [ErrorCodes.REDIS_CONNECTION_ERROR]: 503,
    [ErrorCodes.NETWORK_ERROR]: 502,
    [ErrorCodes.TIMEOUT_ERROR]: 504
  };
  
  return statusMap[code] || 500;
}

// 导出
export default {
  ErrorCodes,
  XianyuError,
  ValidationError,
  NotFoundError,
  NetworkError,
  TimeoutError,
  StorageError,
  QueueError,
  createError,
  errorHandler
};