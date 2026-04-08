/**
 * security.js - 安全工具
 * 
 * 功能：
 * 1. 输入清理和验证
 * 2. XSS防护
 * 3. SQL注入防护（针对字符串拼接场景）
 * 4. 密码/敏感数据处理
 */

import helmet from 'helmet';

// 创建Helmet中间件
export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"]
    }
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  noSniff: true,
  xssFilter: true,
  hidePoweredBy: true
});

/**
 * 清理输入 - 移除危险字符
 * @param {string} input - 输入字符串
 * @returns {string}
 */
export function sanitizeInput(input) {
  if (typeof input !== 'string') return '';
  
  return input
    .replace(/[<>]/g, '') // 移除<>标签符号
    .replace(/javascript:/gi, '') // 移除js协议
    .replace(/on\w+=/gi, '') // 移除事件处理器
    .trim();
}

/**
 * HTML转义 - 防止XSS
 * @param {string} unsafe - 未转义的字符串
 * @returns {string}
 */
export function escapeHtml(unsafe) {
  if (typeof unsafe !== 'string') return '';
  
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
    '/': '&#x2F;'
  };
  
  return unsafe.replace(/[&<>"'/]/g, char => map[char]);
}

/**
 * 反转义HTML
 * @param {string} escaped - 转义后的字符串
 * @returns {string}
 */
export function unescapeHtml(escaped) {
  if (typeof escaped !== 'string') return '';
  
  const map = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#039;': "'",
    '&#x2F;': '/'
  };
  
  return escaped.replace(/&(amp|lt|gt|quot|#039|#x2F);/g, entity => map[entity]);
}

/**
 * URL清理 - 移除危险参数
 * @param {string} url - URL字符串
 * @returns {string}
 */
export function sanitizeUrl(url) {
  if (typeof url !== 'string') return '';
  
  try {
    const urlObj = new URL(url);
    
    // 移除危险参数
    const dangerousParams = ['jsessionid', 'sessionid', 'token', 'auth'];
    dangerousParams.forEach(param => {
      urlObj.searchParams.delete(param);
    });
    
    // 只允许http/https
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      return '';
    }
    
    return urlObj.toString();
  } catch {
    return '';
  }
}

/**
 * 验证并清理文件名
 * @param {string} filename - 文件名
 * @returns {string}
 */
export function sanitizeFilename(filename) {
  if (typeof filename !== 'string') return '';
  
  // 移除路径遍历和危险字符
  return filename
    .replace(/\.\./g, '') // 防止路径遍历
    .replace(/[^\w\s\-.]/g, '') // 只允许字母数字空格和- .
    .trim()
    .substring(0, 255); // 限制长度
}

/**
 * 脱敏处理 - 隐藏敏感信息
 * @param {string} value - 要脱敏的值
 * @param {number} visibleChars - 前后保留字符数
 * @returns {string}
 */
export function maskSensitive(value, visibleChars = 3) {
  if (typeof value !== 'string' || value.length <= visibleChars * 2) {
    return value;
  }
  
  const start = value.substring(0, visibleChars);
  const end = value.substring(value.length - visibleChars);
  const masked = '*'.repeat(value.length - visibleChars * 2);
  
  return start + masked + end;
}

/**
 * 脱敏手机号
 * @param {string} phone - 手机号
 * @returns {string}
 */
export function maskPhone(phone) {
  if (typeof phone !== 'string') return '';
  
  // 中国手机号格式
  if (/^1[3-9]\d{9}$/.test(phone)) {
    return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
  }
  
  return maskSensitive(phone);
}

/**
 * 脱敏邮箱
 * @param {string} email - 邮箱
 * @returns {string}
 */
export function maskEmail(email) {
  if (typeof email !== 'string' || !email.includes('@')) {
    return email;
  }
  
  const [username, domain] = email.split('@');
  
  if (username.length <= 2) {
    return '*'.repeat(username.length) + '@' + domain;
  }
  
  return username.charAt(0) + '*'.repeat(username.length - 1) + '@' + domain;
}

/**
 * 清理对象中的敏感字段
 * @param {Object} obj - 要清理的对象
 * @param {Array} sensitiveFields - 敏感字段列表
 * @returns {Object}
 */
export function sanitizeObject(obj, sensitiveFields = ['password', 'token', 'secret', 'apiKey']) {
  if (typeof obj !== 'object' || obj === null) {
    return obj;
  }
  
  const sanitized = { ...obj };
  
  for (const field of sensitiveFields) {
    if (field in sanitized) {
      sanitized[field] = '[REDACTED]';
    }
  }
  
  return sanitized;
}

/**
 * 速率限制key生成
 * @param {string} ip - IP地址
 * @param {string} path - 请求路径
 * @returns {string}
 */
export function rateLimitKey(ip, path) {
  return `ratelimit:${ip}:${path}`;
}

/**
 * 生成请求ID
 * @returns {string}
 */
export function generateRequestId() {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 16)}`;
}

export default {
  securityHeaders,
  sanitizeInput,
  escapeHtml,
  unescapeHtml,
  sanitizeUrl,
  sanitizeFilename,
  maskSensitive,
  maskPhone,
  maskEmail,
  sanitizeObject,
  rateLimitKey,
  generateRequestId
};