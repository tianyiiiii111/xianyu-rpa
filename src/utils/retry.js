/**
 * retry.js - 重试机制工具
 * 
 * 功能：
 * 1. 指数退避重试
 * 2. 可配置重试次数和延迟
 * 3. 回调函数支持日志记录
 */

/**
 * 带重试的函数执行
 * @param {Function} fn - 要执行的异步函数
 * @param {Object} options - 配置选项
 * @param {number} options.maxRetries - 最大重试次数，默认3
 * @param {number} options.delay - 初始延迟（毫秒），默认1000
 * @param {number} options.backoff - 退避指数，默认2
 * @param {Function} options.onRetry - 重试时的回调函数 (error, attempt, maxAttempts)
 * @returns {Promise<any>} 函数执行结果
 */
export async function withRetry(fn, options = {}) {
  const { 
    maxRetries = 3, 
    delay = 1000, 
    backoff = 2, 
    onRetry = null 
  } = options;
  
  let lastError;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      
      // 如果是最后一次尝试，抛出错误
      if (i === maxRetries - 1) {
        throw err;
      }
      
      // 计算等待时间 (指数退避)
      const waitTime = delay * Math.pow(backoff, i);
      
      // 调用重试回调
      if (onRetry) {
        onRetry(err, i + 1, maxRetries, waitTime);
      } else {
        console.log(`  ⏳ 重试 ${i + 1}/${maxRetries}，等待 ${waitTime}ms...`);
      }
      
      // 等待后重试
      await new Promise(r => setTimeout(r, waitTime));
    }
  }
  
  // 理论上不会到达这里，但为了类型安全
  throw lastError;
}

/**
 * 创建带重试的HTTP请求包装器
 * @param {Object} options - withRetry选项 + fetch选项
 * @returns {Promise<Response>} fetch响应
 */
export async function fetchWithRetry(url, options = {}) {
  const { fetchOptions = {}, retryOptions = {} } = options;
  
  return withRetry(async () => {
    const response = await fetch(url, fetchOptions);
    
    // 如果是服务器错误(5xx)，也重试
    if (response.status >= 500) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return response;
  }, retryOptions);
}

/**
 * 装饰器：给任意函数添加重试能力
 * @param {Function} fn - 要包装的函数
 * @param {Object} options - 重试选项
 * @returns {Function} 包装后的函数
 */
export function withRetryDecorator(fn, options = {}) {
  return async (...args) => {
    return withRetry(() => fn(...args), options);
  };
}

export default withRetry;