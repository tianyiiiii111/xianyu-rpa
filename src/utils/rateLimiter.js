/**
 * rateLimiter.js - 请求限流器
 * 
 * 功能：
 * 1. 滑动窗口限流
 * 2. 支持多通道限流
 * 3. 可配置请求速率
 */

import { performance } from 'perf_hooks';

/**
 * 滑动窗口限流器
 */
export class RateLimiter {
  /**
   * @param {number} maxRequests - 窗口内最大请求数
   * @param {number} windowMs - 窗口大小（毫秒）
   */
  constructor(maxRequests, windowMs) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
    this.requests = [];
  }

  /**
   * 获取许可（等待直到可以执行）
   * @returns {Promise<void>}
   */
  async acquire() {
    const now = performance.now();
    
    // 清理过期的请求记录
    this.requests = this.requests.filter(time => now - time < this.windowMs);
    
    // 如果已达上限，等待
    if (this.requests.length >= this.maxRequests) {
      const oldestRequest = this.requests[0];
      const waitTime = this.windowMs - (now - oldestRequest);
      
      if (waitTime > 0) {
        // 精确等待
        await this._精准等待(waitTime);
      }
      
      // 再次清理
      this.requests = this.requests.filter(time => performance.now() - time < this.windowMs);
    }
    
    // 记录这次请求
    this.requests.push(performance.now());
  }

  /**
   * 精确等待
   * @param {number} ms - 毫秒
   */
  async _精准等待(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 尝试获取许可（非阻塞）
   * @returns {boolean} 是否获取成功
   */
  tryAcquire() {
    const now = performance.now();
    this.requests = this.requests.filter(time => now - time < this.windowMs);
    
    if (this.requests.length < this.maxRequests) {
      this.requests.push(now);
      return true;
    }
    
    return false;
  }

  /**
   * 获取当前请求速率
   * @returns {number} 每分钟请求数
   */
  getRate() {
    const now = performance.now();
    this.requests = this.requests.filter(time => now - time < this.windowMs);
    return (this.requests.length / this.windowMs) * 60000;
  }

  /**
   * 重置
   */
  reset() {
    this.requests = [];
  }
}

/**
 * 多通道限流器管理器
 */
export class MultiLimiter {
  constructor() {
    this.limiters = new Map();
  }

  /**
   * 获取或创建限流器
   * @param {string} name - 通道名称
   * @param {number} maxRequests - 最大请求数
   * @param {number} windowMs - 窗口大小
   * @returns {RateLimiter}
   */
  getLimiter(name, maxRequests = 30, windowMs = 60000) {
    if (!this.limiters.has(name)) {
      this.limiters.set(name, new RateLimiter(maxRequests, windowMs));
    }
    return this.limiters.get(name);
  }

  /**
   * 获取命名限流器
   * @param {string} name 
   */
  async acquire(name) {
    const limiter = this.limiters.get(name);
    if (limiter) {
      await limiter.acquire();
    }
  }

  /**
   * 重置所有限流器
   */
  resetAll() {
    for (const limiter of this.limiters.values()) {
      limiter.reset();
    }
  }
}

// 创建全局限流器实例
export const globalLimiter = new MultiLimiter();

// 便捷方法
export const searchLimiter = globalLimiter.getLimiter('search', 10, 60000);
export const publishLimiter = globalLimiter.getLimiter('publish', 5, 60000);
export const apiLimiter = globalLimiter.getLimiter('api', 30, 60000);

export default {
  RateLimiter,
  MultiLimiter,
  globalLimiter,
  searchLimiter,
  publishLimiter,
  apiLimiter
};