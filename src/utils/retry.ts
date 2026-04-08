/**
 * utils/retry.ts - 重试机制
 */

import { config } from '../config/index.js';
import type { RetryOptions } from '../types/index.js';
import { logger } from './logger.js';

/**
 * 带重试的函数执行
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: Partial<RetryOptions> = {}
): Promise<T> {
  const {
    maxRetries = 3,
    delay = 1000,
    backoff = 2,
    onRetry,
    retryCondition = () => true
  } = options;

  let lastError: Error;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      if (attempt < maxRetries && retryCondition(lastError)) {
        const waitTime = delay * Math.pow(backoff, attempt);
        
        logger.warn(`重试 ${attempt + 1}/${maxRetries}, 等待 ${waitTime}ms: ${lastError.message}`);
        
        if (onRetry) {
          onRetry(attempt + 1, lastError);
        }
        
        await new Promise(resolve => setTimeout(resolve, waitTime));
      } else {
        break;
      }
    }
  }
  
  throw lastError!;
}

/**
 * 带重试的fetch
 */
export async function fetchWithRetry(
  url: string,
  options: RequestInit & { retryOptions?: Partial<RetryOptions> } = {}
): Promise<Response> {
  const { retryOptions, ...fetchOptions } = options;
  
  return withRetry(
    async () => {
      const response = await fetch(url, fetchOptions);
      
      // 不对4xx错误重试
      if (response.status >= 400 && response.status < 500) {
        return response;
      }
      
      // 对5xx和网络错误重试
      if (response.status >= 500 || !response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return response;
    },
    {
      maxRetries: retryOptions?.maxRetries ?? config.CRAWLER_RETRY,
      delay: retryOptions?.delay ?? 1000,
      backoff: retryOptions?.backoff ?? 2
    }
  );
}

/**
 * 指数退避计算
 */
export function calculateBackoff(attempt: number, baseDelay: number, maxDelay: number, backoff: number): number {
  const delay = baseDelay * Math.pow(backoff, attempt);
  return Math.min(delay, maxDelay);
}

export default { withRetry, fetchWithRetry, calculateBackoff };