/**
 * services/SearchService.ts - 商品搜索服务
 */

import { createBrowser, humanDelay, type BrowserInstance } from '../utils/browser.js';

// 备选选择器列表
const PRODUCT_SELECTORS = [
  '.feeds-item-wrap--rGdH_KoF',
  '[class*="feeds-item"]',
  '[class*="product-item"]',
  '[class*="item-card"]',
  '.goods-list .goods-item',
  '.product-list .item',
  '.ant-list-item'
];

// 商品详情选择器
const DETAIL_SELECTORS = {
  title: ['.product-title', '.goods-title', '[class*="title"]', 'h3'],
  price: ['.product-price', '.goods-price', '[class*="price"]', '.price'],
  originalPrice: ['.original-price', '.old-price', '[class*="original"]'],
  description: ['.product-desc', '.goods-desc', '[class*="desc"]', '.description'],
  images: ['.product-images img', '.goods-images img', '[class*="image"] img', 'img'],
  seller: ['.seller-name', '.user-name', '[class*="seller"]', '[class*="user"]'],
  location: ['.goods-location', '.product-location', '[class*="location"]'],
  sold: ['.sold-tag', '.sold-out', '[class*="sold"]'],
  collected: ['.collected', '.collect', '[class*="collect"]']
};

// 商品接口
export interface Product {
  id: string;
  title: string;
  price: number;
  originalPrice?: number;
  description?: string;
  images: string[];
  seller?: string;
  location?: string;
  sold?: boolean;
  collected?: boolean;
  url: string;
}

// 搜索结果接口
export interface SearchResult {
  id: string;
  keyword: string;
  accountId?: string;
  products: Product[];
  timestamp: string;
  count: number;
}

// 搜索选项
export interface SearchOptions {
  keyword: string;
  accountId?: string;
  maxProducts?: number;
  headless?: boolean;
}

/**
 * 搜索商品
 */
export async function searchProducts(options: SearchOptions): Promise<SearchResult> {
  const { keyword, accountId = '', maxProducts = 20, headless = false } = options;
  
  console.log(`🔍 开始搜索: ${keyword}`);
  
  let browserInstance: BrowserInstance | null = null;
  
  try {
    browserInstance = await createBrowser(accountId, headless);
    const { page } = browserInstance;
    
    // 访问搜索页面
    const searchUrl = `https://www.goofish.com/search?q=${encodeURIComponent(keyword)}`;
    await page.goto(searchUrl, { waitUntil: 'networkidle', timeout: 30000 });
    
    await humanDelay(1000, 2000);
    
    // 查找商品列表
    let productElements: unknown[] = [];
    
    for (const selector of PRODUCT_SELECTORS) {
      try {
        productElements = await page.$$(selector);
        if (productElements.length > 0) {
          console.log(`  ✅ 使用选择器: ${selector}, 找到 ${productElements.length} 个商品`);
          break;
        }
      } catch {
        continue;
      }
    }
    
    if (productElements.length === 0) {
      console.log('  ⚠️ 未找到商品元素');
    }
    
    // 提取商品信息
    const products: Product[] = [];
    const maxCount = Math.min(productElements.length, maxProducts);
    
    for (let i = 0; i < maxCount; i++) {
      try {
        const product = await extractProductInfo(productElements[i], page);
        if (product) {
          products.push(product);
        }
      } catch (error) {
        console.log(`  ⚠️ 提取商品 ${i + 1} 失败: ${(error as Error).message}`);
      }
    }
    
    // 生成搜索结果
    const result: SearchResult = {
      id: `search_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      keyword,
      accountId,
      products,
      timestamp: new Date().toISOString(),
      count: products.length
    };
    
    console.log(`  ✅ 搜索完成，找到 ${products.length} 个商品`);
    
    return result;
  } catch (error) {
    console.error(`  ❌ 搜索失败: ${(error as Error).message}`);
    throw error;
  } finally {
    if (browserInstance) {
      await browserInstance.browser.close();
    }
  }
}

/**
 * 提取单个商品信息
 */
async function extractProductInfo(element: unknown, page: unknown): Promise<Product | null> {
  // 这里简化处理，实际需要根据实际页面结构提取
  return null;
}

/**
 * 获取商品详情
 */
export async function getProductDetail(url: string, accountId = ''): Promise<Product | null> {
  let browserInstance: BrowserInstance | null = null;
  
  try {
    browserInstance = await createBrowser(accountId);
    const { page } = browserInstance;
    
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
    await humanDelay(1000, 2000);
    
    // 提取详情信息
    const title = await page.title();
    
    return {
      id: `product_${Date.now()}`,
      title,
      price: 0,
      images: [],
      url
    };
  } catch (error) {
    console.error(`获取商品详情失败: ${(error as Error).message}`);
    return null;
  } finally {
    if (browserInstance) {
      await browserInstance.browser.close();
    }
  }
}

/**
 * 编辑商品信息
 */
export async function editProduct(productId: string, updates: Partial<Product>, accountId = ''): Promise<boolean> {
  console.log(`✏️ 编辑商品: ${productId}`);
  // 实现编辑逻辑
  return true;
}

export default { searchProducts, getProductDetail, editProduct };