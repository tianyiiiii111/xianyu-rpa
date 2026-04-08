/**
 * retry.test.js - 重试机制测试
 */

import { describe, it, expect, vi } from 'vitest';
import { withRetry } from '../src/utils/retry.ts';

describe('withRetry 重试机制', () => {
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
      delay: 10,
      backoff: 2
    });
    
    expect(result).toBe('success');
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('应该在达到最大重试次数后抛出错误', async () => {
    const fn = vi.fn().mockRejectedValue(new Error('always fail'));
    
    await expect(
      withRetry(fn, { maxRetries: 2, delay: 10 })
    ).rejects.toThrow('always fail');
    
    expect(fn).toHaveBeenCalledTimes(3); // 初始1次 + 2次重试
  });

  it('应该触发onRetry回调', async () => {
    const fn = vi.fn().mockRejectedValue(new Error('fail'));
    const onRetry = vi.fn();
    
    await expect(
      withRetry(fn, { maxRetries: 2, delay: 10, onRetry })
    ).rejects.toThrow();
    
    expect(onRetry).toHaveBeenCalledTimes(2);
  });

  it('应该使用retryCondition过滤错误', async () => {
    const fn = vi.fn()
      .mockRejectedValueOnce(new Error('retryable'))
      .mockResolvedValue('success');
    
    const result = await withRetry(fn, {
      maxRetries: 3,
      delay: 10,
      retryCondition: (err) => err.message === 'retryable'
    });
    
    expect(result).toBe('success');
  });
});

describe('fetchWithRetry 带重试的fetch', () => {
  it('应该处理4xx错误不重试', async () => {
    const mockResponse = { status: 400, ok: false };
    global.fetch = vi.fn().mockResolvedValue(mockResponse);
    
    const result = await import('../src/utils/retry.ts')
      .then(m => m.fetchWithRetry('http://test.com'));
    
    expect(result.status).toBe(400);
  });
});