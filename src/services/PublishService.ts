/**
 * services/PublishService.ts - 商品发布服务
 */

import { createBrowser, humanDelay, saveCookies, type BrowserInstance } from '../utils/browser.js';

// 发布选项
export interface PublishOptions {
  product: {
    title: string;
    price: number;
    description?: string;
    images?: string[];
    originalPrice?: number;
  };
  accountId?: string;
}

// 发布结果
export interface PublishResult {
  productId: string;
  success: boolean;
  error?: string;
  publishedUrl?: string;
}

// 黑名单关键词
const BLACKLIST_KEYWORDS = [
  '色情', '赌博', '毒品', '枪支', '假币', '作弊', '代写', '代考',
  '外挂', '病毒', '木马', '诈骗', '传销', '盗版', '侵权'
];

// 敏感词检测
function containsBlacklistedContent(text: string): boolean {
  const lowerText = text.toLowerCase();
  return BLACKLIST_KEYWORDS.some(keyword => lowerText.includes(keyword));
}

// 清理标题
function sanitizeTitle(title: string): string {
  let sanitized = title
    .replace(/[<>]/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '')
    .trim();
  
  if (sanitized.length > 60) {
    sanitized = sanitized.substring(0, 57) + '...';
  }
  
  return sanitized;
}

// 验证商品数据
function validateProductData(product: PublishOptions['product']): string | null {
  if (!product.title || product.title.trim().length === 0) {
    return '商品标题不能为空';
  }
  
  if (product.title.length > 60) {
    return '商品标题不能超过60个字符';
  }
  
  if (product.price <= 0 || product.price > 999999) {
    return '商品价格必须在0-999999之间';
  }
  
  if (product.description && product.description.length > 5000) {
    return '商品描述不能超过5000个字符';
  }
  
  if (containsBlacklistedContent(product.title)) {
    return '商品标题包含敏感关键词';
  }
  
  if (product.description && containsBlacklistedContent(product.description)) {
    return '商品描述包含敏感关键词';
  }
  
  return null;
}

/**
 * 发布单个商品
 */
export async function publishProduct(options: PublishOptions): Promise<PublishResult> {
  const { product, accountId = '' } = options;
  
  console.log(`📤 开始发布商品: ${product.title}`);
  
  // 验证数据
  const validationError = validateProductData(product);
  if (validationError) {
    return {
      productId: '',
      success: false,
      error: validationError
    };
  }
  
  const sanitizedTitle = sanitizeTitle(product.title);
  let browserInstance: BrowserInstance | null = null;
  
  try {
    browserInstance = await createBrowser(accountId);
    const { page, cookiePath } = browserInstance;
    
    // 访问发布页面
    const publishUrl = 'https://www.goofish.com/publish';
    await page.goto(publishUrl, { waitUntil: 'networkidle', timeout: 30000 });
    await humanDelay(1000, 2000);
    
    // 检查是否需要登录
    const needsLogin = await page.$('.login-required, .not-logged-in');
    if (needsLogin) {
      return {
        productId: '',
        success: false,
        error: '请先登录闲鱼账号'
      };
    }
    
    // 填写商品信息
    const titleInput = await page.$('input[name="title"], #title, input[placeholder*="标题"]');
    if (titleInput) {
      await titleInput.fill(sanitizedTitle);
    }
    
    const priceInput = await page.$('input[name="price"], #price, input[placeholder*="价格"]');
    if (priceInput) {
      await priceInput.fill(String(product.price));
    }
    
    if (product.description) {
      const descInput = await page.$('textarea[name="description"], #description, textarea[placeholder*="描述"]');
      if (descInput) {
        await descInput.fill(product.description);
      }
    }
    
    await humanDelay(500, 1000);
    
    // 点击发布按钮
    const publishButton = await page.$('button[type="submit"], button:has-text("发布"), button:has-text("提交")');
    if (publishButton) {
      await publishButton.click();
      await humanDelay(2000, 3000);
    }
    
    // 保存Cookie
    await saveCookies(browserInstance.context, cookiePath);
    
    // 提取发布后的商品URL
    const publishedUrl = page.url();
    
    const productId = `product_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    console.log(`  ✅ 商品发布成功: ${publishedUrl}`);
    
    return {
      productId,
      success: true,
      publishedUrl
    };
  } catch (error) {
    console.error(`  ❌ 发布失败: ${(error as Error).message}`);
    return {
      productId: '',
      success: false,
      error: (error as Error).message
    };
  } finally {
    if (browserInstance) {
      await browserInstance.browser.close();
    }
  }
}

/**
 * 批量发布商品
 */
export async function publishBatch(
  products: PublishOptions['product'][],
  accountId = '',
  onProgress?: (current: number, total: number, result: PublishResult) => void
): Promise<PublishResult[]> {
  const results: PublishResult[] = [];
  
  console.log(`📤 开始批量发布 ${products.length} 个商品`);
  
  for (let i = 0; i < products.length; i++) {
    const result = await publishProduct({ product: products[i], accountId });
    results.push(result);
    
    if (onProgress) {
      onProgress(i + 1, products.length, result);
    }
    
    // 间隔时间
    if (i < products.length - 1) {
      const delay = Math.floor(Math.random() * 5000) + 3000;
      await humanDelay(delay, delay + 2000);
    }
  }
  
  const successCount = results.filter(r => r.success).length;
  console.log(`  📊 批量发布完成: 成功 ${successCount}/${products.length}`);
  
  return results;
}

export default { publishProduct, publishBatch };