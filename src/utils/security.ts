/**
 * utils/security.ts - 安全工具
 */

import helmet from 'helmet';

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
  hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  noSniff: true,
  xssFilter: true,
  hidePoweredBy: true
});

export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') return '';
  
  return input
    .replace(/[<>]/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '')
    .trim();
}

export function escapeHtml(unsafe: string): string {
  if (typeof unsafe !== 'string') return '';
  
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
    '/': '&#x2F;'
  };
  
  return unsafe.replace(/[&<>"'/]/g, char => map[char]);
}

export function sanitizeUrl(url: string): string {
  if (typeof url !== 'string') return '';
  
  try {
    const urlObj = new URL(url);
    const dangerousParams = ['jsessionid', 'sessionid', 'token', 'auth'];
    dangerousParams.forEach(param => urlObj.searchParams.delete(param));
    
    if (!['http:', 'https:'].includes(urlObj.protocol)) return '';
    
    return urlObj.toString();
  } catch {
    return '';
  }
}

export function sanitizeFilename(filename: string): string {
  if (typeof filename !== 'string') return '';
  
  return filename
    .replace(/\.\./g, '')
    .replace(/[^\w\s\-.]/g, '')
    .trim()
    .substring(0, 255);
}

export function maskSensitive(value: string, visibleChars = 3): string {
  if (typeof value !== 'string' || value.length <= visibleChars * 2) return value;
  
  const start = value.substring(0, visibleChars);
  const end = value.substring(value.length - visibleChars);
  const masked = '*'.repeat(value.length - visibleChars * 2);
  
  return start + masked + end;
}

export function maskPhone(phone: string): string {
  if (typeof phone !== 'string') return '';
  
  if (/^1[3-9]\d{9}$/.test(phone)) {
    return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
  }
  
  return maskSensitive(phone);
}

export function maskEmail(email: string): string {
  if (typeof email !== 'string' || !email.includes('@')) return email;
  
  const [username, domain] = email.split('@');
  
  if (username.length <= 2) {
    return '*'.repeat(username.length) + '@' + domain;
  }
  
  return username.charAt(0) + '*'.repeat(username.length - 1) + '@' + domain;
}

export function sanitizeObject(obj: Record<string, unknown>, sensitiveFields = ['password', 'token', 'secret', 'apiKey']): Record<string, unknown> {
  if (typeof obj !== 'object' || obj === null) return obj;
  
  const sanitized = { ...obj };
  
  for (const field of sensitiveFields) {
    if (field in sanitized) {
      sanitized[field] = '[REDACTED]';
    }
  }
  
  return sanitized;
}

export function rateLimitKey(ip: string, path: string): string {
  return `ratelimit:${ip}:${path}`;
}

export function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 16)}`;
}

export default {
  securityHeaders,
  sanitizeInput,
  escapeHtml,
  sanitizeUrl,
  sanitizeFilename,
  maskSensitive,
  maskPhone,
  maskEmail,
  sanitizeObject,
  rateLimitKey,
  generateRequestId
};