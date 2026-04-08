/**
 * errors.test.js - 错误处理测试
 */

import { describe, it, expect } from 'vitest';
import { 
  XianyuError, 
  ValidationError,
  NotFoundError,
  ErrorCodes,
  createError 
} from '../src/utils/errors.js';

describe('XianyuError 错误类', () => {
  it('应该创建基本错误', () => {
    const error = new XianyuError('测试错误', ErrorCodes.UNKNOWN_ERROR);
    
    expect(error.message).toBe('测试错误');
    expect(error.code).toBe(ErrorCodes.UNKNOWN_ERROR);
    expect(error.name).toBe('XianyuError');
    expect(error.timestamp).toBeDefined();
  });

  it('应该包含details', () => {
    const error = new XianyuError('测试', ErrorCodes.NETWORK_ERROR, { 
      url: 'http://test.com' 
    });
    
    expect(error.details.url).toBe('http://test.com');
  });

  it('应该可以序列化为JSON', () => {
    const error = new XianyuError('测试', ErrorCodes.VALIDATION_ERROR);
    const json = error.toJSON();
    
    expect(json.message).toBe('测试');
    expect(json.code).toBe(ErrorCodes.VALIDATION_ERROR);
    expect(json.name).toBe('XianyuError');
  });
});

describe('特定错误类', () => {
  it('ValidationError应该使用正确代码', () => {
    const error = new ValidationError('验证失败');
    expect(error.code).toBe(ErrorCodes.VALIDATION_ERROR);
    expect(error.name).toBe('ValidationError');
  });

  it('NotFoundError应该使用正确代码', () => {
    const error = new NotFoundError('资源不存在');
    expect(error.code).toBe(ErrorCodes.NOT_FOUND);
  });
});

describe('createError 工厂函数', () => {
  it('应该创建正确类型的错误', () => {
    const error = createError(ErrorCodes.VALIDATION_ERROR, '参数错误');
    expect(error).toBeInstanceOf(ValidationError);
  });

  it('应该处理未知错误码', () => {
    const error = createError('UNKNOWN_CODE', '未知错误');
    expect(error).toBeInstanceOf(XianyuError);
    expect(error.code).toBe('UNKNOWN_CODE');
  });
});

describe('ErrorCodes 错误码', () => {
  it('应该包含所有必需的错误码', () => {
    expect(ErrorCodes.VALIDATION_ERROR).toBeDefined();
    expect(ErrorCodes.NOT_FOUND).toBeDefined();
    expect(ErrorCodes.SEARCH_FAILED).toBeDefined();
    expect(ErrorCodes.PUBLISH_FAILED).toBeDefined();
    expect(ErrorCodes.NETWORK_ERROR).toBeDefined();
  });
});