/**
 * validators.js - 数据验证工具
 * 
 * 功能：
 * 1. API请求参数验证
 * 2. 商品数据验证
 * 3. 配置验证
 */

import Joi from 'joi';

/**
 * 搜索请求验证
 */
export const searchSchema = Joi.object({
  // 搜索关键词 - 必需，1-100字符
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
  
  // 账号ID - 可选，最多50字符
  accountId: Joi.string()
    .max(50)
    .trim()
    .allow('')
    .messages({
      'string.max': '账号ID最多50个字符'
    })
});

/**
 * 批量发布请求验证
 */
export const publishSchema = Joi.object({
  // 搜索结果ID - 必需
  searchId: Joi.string()
    .min(1)
    .max(100)
    .required()
    .trim()
    .messages({
      'string.empty': '搜索结果ID不能为空',
      'any.required': '缺少搜索结果ID参数'
    }),
  
  // 账号ID - 可选
  accountId: Joi.string()
    .max(50)
    .trim()
    .allow('')
    .messages({
      'string.max': '账号ID最多50个字符'
    })
});

/**
 * 单个商品发布请求验证
 */
export const singlePublishSchema = Joi.object({
  // 商品数据 - 必需
  product: Joi.object({
    // 价格 - 必需，正数
    price: Joi.number()
      .positive()
      .required()
      .messages({
        'number.positive': '商品价格必须为正数',
        'any.required': '缺少商品价格'
      }),
    
    // 描述 - 可选，最多5000字符
    description: Joi.string()
      .max(5000)
      .allow('')
      .messages({
        'string.max': '商品描述最多5000个字符'
      }),
    
    // 图片 - 可选，数组
    images: Joi.array()
      .items(Joi.string().uri())
      .max(9)
      .messages({
        'array.max': '最多上传9张图片',
        'string.uri': '图片必须是有效的URL'
      }),
    
    // 原价 - 可选
    originalPrice: Joi.number()
      .positive()
      .allow(null)
    
  }).required(),
  
  // 账号ID - 可选
  accountId: Joi.string()
    .max(50)
    .trim()
    .allow('')
});

/**
 * 编辑商品请求验证
 */
export const editProductSchema = Joi.object({
  // 商品ID - 必需
  productId: Joi.string()
    .min(1)
    .required(),
  
  // 更新字段 - 至少提供一个
  updates: Joi.object({
    price: Joi.number().positive(),
    description: Joi.string().max(5000),
    title: Joi.string().max(200),
    images: Joi.array().items(Joi.string().uri()).max(9)
  }).min(1)
});

/**
 * 分页参数验证
 */
export const paginationSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20)
});

/**
 * 验证并返回错误信息
 * @param {Joi.Schema} schema - Joi验证模式
 * @param {Object} data - 要验证的数据
 * @returns {Object} { value, error }
 */
export function validate(schema, data) {
  return schema.validate(data, {
    abortEarly: false, // 返回所有错误
    stripUnknown: true // 移除未知字段
  });
}

/**
 * 快速验证函数
 * @param {Joi.Schema} schema 
 * @param {Object} data 
 * @throws 如果验证失败抛出错误
 */
export function assert(schema, data) {
  const { error, value } = validate(schema, data);
  if (error) {
    const messages = error.details.map(d => d.message).join(', ');
    const err = new Error(`Validation failed: ${messages}`);
    err.name = 'ValidationError';
    err.details = error.details;
    throw err;
  }
  return value;
}

/**
 * 创建带验证的中间件
 * @param {Joi.Schema} schema 
 * @returns {Function} Express中间件
 */
export function validateMiddleware(schema) {
  return (req, res, next) => {
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
      
      req.validatedBody = value;
      next();
    } catch (err) {
      next(err);
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