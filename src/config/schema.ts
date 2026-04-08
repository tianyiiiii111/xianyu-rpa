/**
 * config/schema.ts - 环境变量类型校验
 */

import { z } from 'zod';
import 'dotenv/config';

// 环境变量验证模式 - 使用字符串默认值
const envSchemaInternal = z.object({
  ALIBABA_CLOUD_API_KEY: z.string().min(1, 'ALIBABA_CLOUD_API_KEY is required'),
  PORT: z.string().default('3000'),
  LOG_LEVEL: z.enum(['trace', 'debug', 'info', 'warn', 'error']).default('info'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  XIANYU_BASE_URL: z.string().url().default('https://www.goofish.com'),
  XIANYU_TIMEOUT: z.string().default('30000'),
  CRAWLER_HEADLESS: z.enum(['true', 'false']).default('false'),
  CRAWLER_MAX_PRODUCTS: z.string().default('20'),
  CRAWLER_RETRY: z.string().default('3'),
  PUBLISH_MAX_CONCURRENT: z.string().default('1'),
  PUBLISH_DELAY_MIN: z.string().default('5000'),
  PUBLISH_DELAY_MAX: z.string().default('10000'),
  STORAGE_BACKUP_RETENTION: z.string().default('10'),
  STORAGE_CLEANUP_DAYS: z.string().default('7'),
  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.string().default('6379'),
  REDIS_PASSWORD: z.string().optional(),
  RATE_LIMIT_MAX: z.string().default('30'),
  RATE_LIMIT_SEARCH: z.string().default('10'),
  RATE_LIMIT_PUBLISH: z.string().default('5'),
  AI_MODEL: z.string().default('qwen-plus'),
  AI_BASE_URL: z.string().url().default('https://dashscope.aliyuncs.com/compatible-mode/v1'),
  AI_TIMEOUT: z.string().default('30000'),
  LOG_RETENTION_DAYS: z.string().default('30')
});

export type EnvConfig = {
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
};

/**
 * 解析并验证环境变量
 * @returns 验证后的配置对象
 */
export function parseEnv(): EnvConfig {
  const rawEnv = { ...process.env };
  
  try {
    const validated = envSchemaInternal.parse(rawEnv);
    
    return {
      ALIBABA_CLOUD_API_KEY: validated.ALIBABA_CLOUD_API_KEY,
      PORT: parseInt(validated.PORT, 10),
      LOG_LEVEL: validated.LOG_LEVEL,
      NODE_ENV: validated.NODE_ENV,
      XIANYU_BASE_URL: validated.XIANYU_BASE_URL,
      XIANYU_TIMEOUT: parseInt(validated.XIANYU_TIMEOUT, 10),
      CRAWLER_HEADLESS: validated.CRAWLER_HEADLESS === 'true',
      CRAWLER_MAX_PRODUCTS: parseInt(validated.CRAWLER_MAX_PRODUCTS, 10),
      CRAWLER_RETRY: parseInt(validated.CRAWLER_RETRY, 10),
      PUBLISH_MAX_CONCURRENT: parseInt(validated.PUBLISH_MAX_CONCURRENT, 10),
      PUBLISH_DELAY_MIN: parseInt(validated.PUBLISH_DELAY_MIN, 10),
      PUBLISH_DELAY_MAX: parseInt(validated.PUBLISH_DELAY_MAX, 10),
      STORAGE_BACKUP_RETENTION: parseInt(validated.STORAGE_BACKUP_RETENTION, 10),
      STORAGE_CLEANUP_DAYS: parseInt(validated.STORAGE_CLEANUP_DAYS, 10),
      REDIS_HOST: validated.REDIS_HOST,
      REDIS_PORT: parseInt(validated.REDIS_PORT, 10),
      REDIS_PASSWORD: validated.REDIS_PASSWORD,
      RATE_LIMIT_MAX: parseInt(validated.RATE_LIMIT_MAX, 10),
      RATE_LIMIT_SEARCH: parseInt(validated.RATE_LIMIT_SEARCH, 10),
      RATE_LIMIT_PUBLISH: parseInt(validated.RATE_LIMIT_PUBLISH, 10),
      AI_MODEL: validated.AI_MODEL,
      AI_BASE_URL: validated.AI_BASE_URL,
      AI_TIMEOUT: parseInt(validated.AI_TIMEOUT, 10),
      LOG_RETENTION_DAYS: parseInt(validated.LOG_RETENTION_DAYS, 10)
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ 环境变量验证失败:');
      error.errors.forEach(err => {
        console.error(`  - ${err.path.join('.')}: ${err.message}`);
      });
      console.error('\n请检查 .env 文件配置');
      // 测试环境下不退出
      if (process.env.NODE_ENV !== 'test') {
        process.exit(1);
      }
    }
    throw error;
  }
}

/**
 * 验证配置并返回结果
 * @returns 验证结果
 */
export function validateEnv(): { success: boolean; data?: EnvConfig; errors?: Array<{ path: string; message: string }> } {
  const rawEnv = { ...process.env };
  
  const result = envSchemaInternal.safeParse(rawEnv);
  
  if (result.success) {
    return { success: true, data: parseEnv() };
  }
  
  return {
    success: false,
    errors: result.error.errors.map(err => ({
      path: err.path.join('.'),
      message: err.message
    }))
  };
}

export const validatedEnv: EnvConfig = parseEnv();

export default { envSchemaInternal, parseEnv, validateEnv, validatedEnv };