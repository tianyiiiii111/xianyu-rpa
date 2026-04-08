/**
 * validators.test.js - 验证器测试
 */

import { describe, it, expect } from 'vitest';
import { 
  searchSchema, 
  publishSchema, 
  singlePublishSchema,
  validate 
} from '../src/utils/validators.js';

describe('searchSchema 搜索验证', () => {
  it('应该通过有效的搜索参数', () => {
    const { error, value } = validate(searchSchema, { 
      keyword: 'iPhone', 
      accountId: 'test123' 
    });
    expect(error).toBeUndefined();
    expect(value.keyword).toBe('iPhone');
  });

  it('应该拒绝空的关键词', () => {
    const { error } = validate(searchSchema, { keyword: '' });
    expect(error).toBeDefined();
  });

  it('应该拒绝超过100字符的关键词', () => {
    const { error } = validate(searchSchema, { 
      keyword: 'a'.repeat(101) 
    });
    expect(error).toBeDefined();
  });

  it('应该允许空accountId', () => {
    const { error, value } = validate(searchSchema, { 
      keyword: 'test',
      accountId: '' 
    });
    expect(error).toBeUndefined();
  });
});

describe('publishSchema 发布验证', () => {
  it('应该通过有效的发布参数', () => {
    const { error, value } = validate(publishSchema, { 
      searchId: 'search_123',
      accountId: 'test' 
    });
    expect(error).toBeUndefined();
    expect(value.searchId).toBe('search_123');
  });

  it('应该拒绝空的searchId', () => {
    const { error } = validate(publishSchema, { searchId: '' });
    expect(error).toBeDefined();
  });
});

describe('singlePublishSchema 单个商品发布验证', () => {
  it('应该通过有效的商品数据', () => {
    const { error, value } = validate(singlePublishSchema, {
      product: {
        price: 99.99,
        description: '测试商品',
        images: ['https://example.com/img.jpg']
      }
    });
    expect(error).toBeUndefined();
    expect(value.product.price).toBe(99.99);
  });

  it('应该拒绝无效的价格', () => {
    const { error } = validate(singlePublishSchema, {
      product: {
        price: -10,
        description: 'test'
      }
    });
    expect(error).toBeDefined();
  });

  it('应该拒绝超过9张图片', () => {
    const { error } = validate(singlePublishSchema, {
      product: {
        price: 100,
        images: Array(10).fill('https://example.com/img.jpg')
      }
    });
    expect(error).toBeDefined();
  });
});