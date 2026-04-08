/**
 * config/index.ts - 配置管理
 */

import dotenv from 'dotenv';
import { validateEnv, validatedEnv } from './schema.js';
import type { EnvConfig } from '../types/index.js';

// 加载环境变量
dotenv.config();

// 验证环境变量
validateEnv();

// 导出验证后的配置
export const config: EnvConfig = validatedEnv;

// 便捷访问函数
export function getConfig(): EnvConfig {
  return config;
}

export function getEnv(key: keyof EnvConfig): string | number | boolean | undefined {
  return config[key];
}

export default config;