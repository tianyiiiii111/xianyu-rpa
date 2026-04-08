/**
 * config/schema.js - 环境变量类型校验
 * 
 * 使用Zod进行类型安全的配置验证
 */

import { z } from 'zod';
import 'dotenv/config';

/**
 * 环境变量验证模式
 */
export const envSchema = z.object({
  // 必需变量
  ALIBABA_CLOUD_API_KEY: z.string().min(1, 'ALIBABA_CLOUD_API_KEY is required'),
  
  // 可选字符串变量
  PORT: z.string().default('3000'),
  LOG_LEVEL: z.enum(['trace', 'debug', 'info', 'warn', 'error']).default('info'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  
  // 闲鱼配置
  XIANYU_BASE_URL: z.string().url().default('https://www.goofish.com'),
  XIANYU_TIMEOUT: z.string().default('30000'),
  
  // 爬虫配置
  CRAWLER_HEADLESS: z.enum(['true', 'false']).default('false'),
  CRAWLER_MAX_PRODUCTS: z.string().default('20'),
  CRAWLER_RETRY: z.string().default('3'),
  
  // 发布配置
  PUBLISH_MAX_CONCURRENT: z.string().default('1'),
  PUBLISH_DELAY_MIN: z.string().default('5000'),
  PUBLISH_DELAY_MAX: z.string().default('10000'),
  
  // 存储配置
  STORAGE_BACKUP_RETENTION: z.string().default('10'),
  STORAGE_CLEANUP_DAYS: z.string().default('7'),
  
  // Redis配置
  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.string().default('6379'),
  REDIS_PASSWORD: z.string().optional(),
  
  // 限流配置
  RATE_LIMIT_MAX: z.string().default('30'),
  RATE_LIMIT_SEARCH: z.string().default('10'),
  RATE_LIMIT_PUBLISH: z.string().default('5'),
  
  // AI配置
  AI_MODEL: z.string().default('qwen-plus'),
  AI_BASE_URL: z.string().url().default('https://dashscope.aliyuncs.com/compatible-mode/v1'),
  AI_TIMEOUT: z.string().default('30000'),
  
  // 日志配置
  LOG_RETENTION_DAYS: z.string().default('30')
});

/**
 * 解析并验证环境变量
 * @returns {Object} 验证后的配置对象
 */
export function parseEnv() {
  // 获取原始环境变量
  const rawEnv = { ...process.env };
  
  try {
    // 验证并转换
    const validated = envSchema.parse(rawEnv);
    
    // 转换为实际类型
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
      process.exit(1);
    }
    throw error;
  }
}

/**
 * 验证配置并返回结果
 * @returns {{ success: boolean, data?: Object, errors?: Array }}
 */
export function validateEnv() {
  const rawEnv = { ...process.env };
  
  const result = envSchema.safeParse(rawEnv);
  
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

// 导出验证后的配置
export const validatedEnv = parseEnv();

export default {
  envSchema,
  parseEnv,
  validateEnv,
  validatedEnv
};