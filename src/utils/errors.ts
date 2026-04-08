/**
 * utils/errors.ts - 统一错误类型
 */

// 错误码枚举
export const ErrorCodes = {
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  UNAUTHORIZED: 'UNAUTHORIZED',
  SEARCH_FAILED: 'SEARCH_FAILED',
  SEARCH_TIMEOUT: 'SEARCH_TIMEOUT',
  NO_SEARCH_RESULTS: 'NO_SEARCH_RESULTS',
  PUBLISH_FAILED: 'PUBLISH_FAILED',
  PUBLISH_TIMEOUT: 'PUBLISH_TIMEOUT',
  LOGIN_REQUIRED: 'LOGIN_REQUIRED',
  COOKIE_EXPIRED: 'COOKIE_EXPIRED',
  PRODUCT_DATA_INVALID: 'PRODUCT_DATA_INVALID',
  AI_SERVICE_ERROR: 'AI_SERVICE_ERROR',
  AI_API_KEY_MISSING: 'AI_API_KEY_MISSING',
  AI_RATE_LIMIT: 'AI_RATE_LIMIT',
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT_ERROR: 'TIMEOUT_ERROR',
  STORAGE_ERROR: 'STORAGE_ERROR',
  FILE_NOT_FOUND: 'FILE_NOT_FOUND',
  QUEUE_ERROR: 'QUEUE_ERROR',
  JOB_NOT_FOUND: 'JOB_NOT_FOUND',
  REDIS_CONNECTION_ERROR: 'REDIS_CONNECTION_ERROR'
} as const;

// 错误类定义
export class XianyuError extends Error {
  code: string;
  details: Record<string, unknown>;
  timestamp: string;

  constructor(message: string, code: string = 'UNKNOWN_ERROR', details: Record<string, unknown> = {}) {
    super(message);
    this.name = 'XianyuError';
    this.code = code;
    this.details = details;
    this.timestamp = new Date().toISOString();
    
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, XianyuError);
    }
  }

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

export class ValidationError extends XianyuError {
  constructor(message: string, details: Record<string, unknown> = {}) {
    super(message, ErrorCodes.VALIDATION_ERROR, details);
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends XianyuError {
  constructor(message: string, details: Record<string, unknown> = {}) {
    super(message, ErrorCodes.NOT_FOUND, details);
    this.name = 'NotFoundError';
  }
}

export class NetworkError extends XianyuError {
  constructor(message: string, details: Record<string, unknown> = {}) {
    super(message, ErrorCodes.NETWORK_ERROR, details);
    this.name = 'NetworkError';
  }
}

export class TimeoutError extends XianyuError {
  constructor(message: string, details: Record<string, unknown> = {}) {
    super(message, ErrorCodes.TIMEOUT_ERROR, details);
    this.name = 'TimeoutError';
  }
}

export class StorageError extends XianyuError {
  constructor(message: string, details: Record<string, unknown> = {}) {
    super(message, ErrorCodes.STORAGE_ERROR, details);
    this.name = 'StorageError';
  }
}

export class QueueError extends XianyuError {
  constructor(message: string, details: Record<string, unknown> = {}) {
    super(message, ErrorCodes.QUEUE_ERROR, details);
    this.name = 'QueueError';
  }
}

// 错误工厂函数
export function createError(code: string, message: string, details: Record<string, unknown> = {}): XianyuError {
  const errorClasses: Record<string, new (msg: string, d: Record<string, unknown>) => XianyuError> = {
    [ErrorCodes.VALIDATION_ERROR]: ValidationError,
    [ErrorCodes.NOT_FOUND]: NotFoundError,
    [ErrorCodes.NETWORK_ERROR]: NetworkError,
    [ErrorCodes.TIMEOUT_ERROR]: TimeoutError,
    [ErrorCodes.STORAGE_ERROR]: StorageError,
    [ErrorCodes.QUEUE_ERROR]: QueueError
  };
  
  const ErrorClass = errorClasses[code] || XianyuError;
  // 使用类型断言避免TypeScript错误
  const err = new ErrorClass(message, details as never);
  // 确保code属性被正确设置
  if (code !== ErrorCodes.UNKNOWN_ERROR && !(code in errorClasses)) {
    err.code = code;
  }
  return err;
}

function getStatusCode(code: string): number {
  const statusMap: Record<string, number> = {
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

// 错误处理中间件
export function errorHandler(err: Error, req: unknown, res: unknown, _next: unknown) {
  const httpRes = res as { status: (code: number) => { json: (data: unknown) => void } };
  
  console.error('❌ 错误:', {
    name: err.name,
    message: err.message,
    ...(err instanceof XianyuError ? { code: err.code, details: err.details } : {})
  });
  
  if (err instanceof XianyuError) {
    return httpRes.status(getStatusCode(err.code)).json({
      success: false,
      error: err.toJSON()
    });
  }
  
  httpRes.status(500).json({
    success: false,
    error: {
      name: err.name || 'Error',
      code: ErrorCodes.UNKNOWN_ERROR,
      message: process.env.NODE_ENV === 'production' ? '服务器内部错误' : err.message,
      timestamp: new Date().toISOString()
    }
  });
}

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