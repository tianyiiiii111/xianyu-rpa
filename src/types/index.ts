/**
 * types/index.ts - 全局类型定义
 */

// 环境变量配置
export interface EnvConfig {
  ALIBABA_CLOUD_API_KEY: string;
  PORT: number;
  LOG_LEVEL: 'trace' | 'debug' | 'info' | 'warn' | 'error';
  NODE_ENV: 'development' | 'production' | 'test';
  XIANYU_BASE_URL: string;
  XIANYU_TIMEOUT: number;
  CRAWLER_HEADLESS: boolean;
  CRAWLER_MAX_PRODUCTS: number;
  CRAWLER_RETRY: number;
  PUBLISH_MAX_CONCURRENT: number;
  PUBLISH_DELAY_MIN: number;
  PUBLISH_DELAY_MAX: number;
  STORAGE_BACKUP_RETENTION: number;
  STORAGE_CLEANUP_DAYS: number;
  REDIS_HOST: string;
  REDIS_PORT: number;
  REDIS_PASSWORD?: string;
  RATE_LIMIT_MAX: number;
  RATE_LIMIT_SEARCH: number;
  RATE_LIMIT_PUBLISH: number;
  AI_MODEL: string;
  AI_BASE_URL: string;
  AI_TIMEOUT: number;
  LOG_RETENTION_DAYS: number;
}

// 商品类型
export interface Product {
  id: string;
  title: string;
  price: number;
  originalPrice?: number;
  description?: string;
  images: string[];
  seller?: string;
  location?: string;
  sold?: boolean;
  collected?: boolean;
  url: string;
}

// 搜索结果类型
export interface SearchResult {
  id: string;
  keyword: string;
  accountId?: string;
  products: Product[];
  timestamp: string;
  count: number;
}

// 发布结果类型
export interface PublishResult {
  productId: string;
  success: boolean;
  error?: string;
  publishedUrl?: string;
}

// API响应类型
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    name: string;
    code: string;
    message: string;
    details?: unknown;
    timestamp: string;
  };
}

// 健康检查结果
export interface HealthCheckResult {
  ok: boolean;
  checks: {
    name: string;
    status: 'pass' | 'fail' | 'warn';
    message?: string;
  }[];
  timestamp: string;
}

// 任务状态
export type TaskStatus = 'pending' | 'running' | 'completed' | 'failed';

// 队列任务数据
export interface QueueJobData {
  type: 'search' | 'publish';
  searchId?: string;
  keyword?: string;
  accountId?: string;
}

// 限流器选项
export interface RateLimiterOptions {
  windowMs: number;
  maxRequests: number;
}

// 重试选项
export interface RetryOptions {
  maxRetries: number;
  delay: number;
  backoff: number;
  onRetry?: (attempt: number, error: Error) => void;
  retryCondition?: (error: Error) => boolean;
}

// 日志级别
export type LogLevel = 'trace' | 'debug' | 'info' | 'warn' | 'error';

// WebSocket消息
export interface WSMessage {
  type: string;
  data?: unknown;
  timestamp?: number;
}

// 客户端信息
export interface ClientInfo {
  id: string;
  ip: string;
  connectedAt: string;
  subscriptions: Set<string>;
}

// 验证错误详情
export interface ValidationErrorDetail {
  field: string;
  message: string;
  value?: unknown;
}

// 指标数据
export interface MetricsData {
  uptime: number;
  counters: Record<string, { total: number; success: number; failed: number }>;
  averages: Record<string, number>;
  successRates: Record<string, number>;
  memory: {
    rss: number;
    heapUsed: number;
    heapTotal: number;
    external: number;
  };
}

// Express请求扩展
export interface RequestWithId extends Request {
  id: string;
  validatedBody?: unknown;
}