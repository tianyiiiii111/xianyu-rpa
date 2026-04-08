/**
 * retry.test.js - 重试机制测试
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { withRetry } from '../src/utils/retry.js';

describe('withRetry 重试机制', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  it('应该立即返回成功的结果', async () => {
    const fn = vi.fn().mockResolvedValue('success');
    const result = await withRetry(fn, { maxRetries: 3 });
    
    expect(result).toBe('success');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('应该在失败后重试', async () => {
    const fn = vi.fn()
      .mockRejectedValueOnce(new Error('fail 1'))
      .mockResolvedValue('success');
    
    const result = await withRetry(fn, { 
      maxRetries: 3, 
      delay: 1000,
      backoff: 2
    });
    
    expect(result).toBe('success');
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('应该在达到最大重试次数后抛出错误', async () => {
    const fn = vi.fn().mockRejectedValue(new Error('always fail'));
    
    await expect(
      withRetry(fn, { maxRetries: 2, delay: 100 })
    ).rejects.toThrow('always fail');
    
    expect(fn).toHaveBeenCalledTimes(3); // 初始1次 + 2次重试
  });

  it('应该触发onRetry回调', async () => {
    const fn = vi.fn().mockRejectedValue(new Error('fail'));
    const onRetry = vi.fn();
    
    await expect(
      withRetry(fn, { maxRetries: 2, delay: 100, onRetry })
    ).rejects.toThrow();
    
    expect(onRetry).toHaveBeenCalledTimes(2);
  });

  it('应该使用指数退避', async () => {
    const fn = vi.fn()
      .mockRejectedValueOnce(new Error('fail'))
      .mockRejectedValueOnce(new Error('fail'))
      .mockResolvedValue('success');
    
    const start = Date.now();
    await withRetry(fn, { maxRetries: 3, delay: 1000, backoff: 2 });
    const duration = Date.now() - start;
    
    // 1000 + 2000 = 3000ms (约等于)
    expect(duration).toBeGreaterThan(2500);
  });
});

describe('fetchWithRetry 带重试的fetch', () => {
  it('应该处理4xx错误不重试', async () => {
    const mockResponse = { status: 400 };
    global.fetch = vi.fn().mockResolvedValue(mockResponse);
    
    const result = await import('../src/utils/retry.js')
      .then(m => m.fetchWithRetry('http://test.com'));
    
    expect(result.status).toBe(400);
  });
});