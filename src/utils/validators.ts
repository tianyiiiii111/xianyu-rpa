/**
 * utils/validators.ts - 数据验证工具
 */

import Joi from 'joi';
import type { ValidationErrorDetail } from '../types/index.js';

// 搜索请求验证
export const searchSchema = Joi.object({
  keyword: Joi.string()
    .min(1)
    .max(100)
    .required()
    .trim()
    .messages({
      'string.empty': '搜索关键词不能为空',
      'string.min': '搜索关键词至少1个字符',
      'string.max': '搜索关键词最多100个字符',
      'any.required': '缺少搜索关键词参数'
    }),
  
  accountId: Joi.string()
    .max(50)
    .trim()
    .allow('')
    .messages({
      'string.max': '账号ID最多50个字符'
    })
});

// 批量发布请求验证
export const publishSchema = Joi.object({
  searchId: Joi.string()
    .min(1)
    .max(100)
    .required()
    .trim()
    .messages({
      'string.empty': '搜索结果ID不能为空',
      'any.required': '缺少搜索结果ID参数'
    }),
  
  accountId: Joi.string()
    .max(50)
    .trim()
    .allow('')
    .messages({
      'string.max': '账号ID最多50个字符'
    })
});

// 单个商品发布请求验证
export const singlePublishSchema = Joi.object({
  product: Joi.object({
    price: Joi.number()
      .positive()
      .required()
      .messages({
        'number.positive': '商品价格必须为正数',
        'any.required': '缺少商品价格'
      }),
    
    description: Joi.string()
      .max(5000)
      .allow('')
      .messages({
        'string.max': '商品描述最多5000个字符'
      }),
    
    images: Joi.array()
      .items(Joi.string().uri())
      .max(9)
      .messages({
        'array.max': '最多上传9张图片',
        'string.uri': '图片必须是有效的URL'
      }),
    
    originalPrice: Joi.number()
      .positive()
      .allow(null)
    
  }).required(),
  
  accountId: Joi.string()
    .max(50)
    .trim()
    .allow('')
});

// 编辑商品请求验证
export const editProductSchema = Joi.object({
  productId: Joi.string()
    .min(1)
    .required(),
  
  updates: Joi.object({
    price: Joi.number().positive(),
    description: Joi.string().max(5000),
    title: Joi.string().max(200),
    images: Joi.array().items(Joi.string().uri()).max(9)
  }).min(1)
});

// 分页参数验证
export const paginationSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20)
});

// 验证并返回错误信息
export function validate<T>(schema: Joi.Schema, data: T): { value: T; error?: Joi.ValidationError } {
  return schema.validate(data, {
    abortEarly: false,
    stripUnknown: true
  });
}

// 快速验证函数
export function assert<T>(schema: Joi.Schema, data: T): T {
  const { error, value } = validate(schema, data);
  if (error) {
    const messages = error.details.map(d => d.message).join(', ');
    const err = new Error(`Validation failed: ${messages}`);
    err.name = 'ValidationError';
    throw err;
  }
  return value;
}

// 创建带验证的中间件
export function validateMiddleware(schema: Joi.Schema) {
  return (req: { body: unknown }, res: { status: (code: number) => { json: (data: unknown) => void } }, next: () => void) => {
    try {
      const { error, value } = validate(schema, req.body);
      
      if (error) {
        const messages = error.details.map(d => d.message).join(', ');
        return res.status(400).json({
          success: false,
          error: 'Validation Error',
          details: messages
        });
      }
      
      (req as { validatedBody?: unknown }).validatedBody = value;
      next();
    } catch (err) {
      next();
    }
  };
}

export default {
  searchSchema,
  publishSchema,
  singlePublishSchema,
  editProductSchema,
  paginationSchema,
  validate,
  assert,
  validateMiddleware
};