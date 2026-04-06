/**
 * SearchService.js - 商品搜索服务
 * 
 * 功能：
 * 1. 搜索指定关键词的商品
 * 2. 抓取搜索结果并存储
 * 3. 管理搜索历史
 * 4. 编辑已采集的商品信息
 * 
 * 注释说明：
 * - 本文件是搜索服务的核心模块，负责商品的批量采集和管理
 * - 代码中添加了详细的注释，确保小白能理解
 * - 支持模拟数据和真实数据两种模式
 */

import { createBrowser, humanDelay } from '../utils/browser.js';
import { StorageService } from '../utils/storage.js';

/**
 * 搜索商品
 * @param {string} keyword - 搜索关键词
 * @param {string} accountId - 账号ID，默认 'account1'
 * @returns {Array} 搜索到的商品列表
 */
export async function searchProducts(keyword, accountId = '') {
  console.log(`\n🔍 开始搜索关键词 "${keyword}"...`);

  try {
    // 1. 启动浏览器
    const { browser, page } = await createBrowser(accountId);
    
    // 2. 访问闲鱼搜索页面
    const searchUrl = `https://www.goofish.com/search?q=${encodeURIComponent(keyword)}`;
    console.log(`  🌐 访问搜索页面: ${searchUrl}`);
    
    await page.goto(searchUrl, {
      waitUntil: 'domcontentloaded',
      timeout: 30000,
    }); 

    // 3. 等待页面加载完成
    await humanDelay(3000, 4000);
    console.log('  ⏳ 等待搜索结果加载...');

    // 5. 抓取搜索结果
    const products = await scrapeSearchResults(page);
    
    // 6. 关闭浏览器
    await browser.close();
    
    // 7. 存储搜索结果
    const searchId = `search_${Date.now()}_${keyword.replace(/\s+/g, '_')}`;
    const searchResults = {
      keyword,
      accountId,
      timestamp: new Date().toISOString(),
      products
    };
    StorageService.saveSearchResults(searchId, searchResults);

    console.log(`✅ 搜索完成，共找到 ${products.length} 个商品`);
    console.log(`✅ 搜索结果已存储，ID: ${searchId}`);

    return { products, searchId };
  } catch (error) {
    console.error('❌ 搜索失败:', error);
    // 搜索失败时返回模拟数据
    return {'code': 500, 'msg': '搜索失败'};
  }
}

/**
 * 抓取搜索结果
 * @param {Object} page - 页面对象
 * @returns {Array} 商品列表
 */
async function scrapeSearchResults(page) {
  const products = [];

  console.log('  📦 开始抓取搜索结果...');

  // 使用 page.evaluate 在浏览器上下文中获取元素的 href 属性
  const productLinks = await page.evaluate(() => {
    console.log('  📦 开始抓取商品链接...');
    // 获取所有匹配的元素
    const items = document.querySelectorAll('.feeds-item-wrap--rGdH_KoF');
    console.log(`  📦 找到 ${items.length} 个商品元素`);
    // 提取每个元素的 href 属性
    const links = [];
    items.forEach(item => {
      const href = item.getAttribute('href');
      if (href) {
        links.push(href);
      }
    });
    return links;
  });

  console.log(`  📦 找到 ${productLinks.length} 个商品链接`);

  // 遍历链接，获取每个商品的详细信息
  for (const link of productLinks) {
    try {
      // 构造完整的商品URL
      const productUrl = link;
      
      // 打开商品详情页
      await page.goto(productUrl, {
        waitUntil: 'domcontentloaded',
        timeout: 30000,
      });

      // 等待页面加载
      await humanDelay(1500, 2500);

      // 提取商品信息
      const productInfo = await page.evaluate(() => {
        // 获取商品价格
        const priceEl = document.querySelector('.price--OEWLbcxC ');
        const priceText = priceEl ? priceEl.textContent.trim() : '0';
        const price = parseFloat(priceText.replace(/[^\d.]/g, '')) || 0;

        // 获取商品描述
        const descEl = document.querySelector('.main--Nu33bWl6');
        const description = descEl ? descEl.textContent.trim() : '';

        // 获取商品图片
        const imgEls = document.querySelectorAll('.item-main-window-list--od7DK4Fm img');
        const images = Array.from(imgEls).slice(0, 5).map(img => img.src).filter(src => src);

        return {
          price,
          description,
          images,
        };
      });

      // 生成商品ID
      const productId = `product_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // 构建商品对象
      const product = {
        id: productId,
        url: productUrl,
        ...productInfo,
        crawledAt: new Date().toISOString()
      };

      products.push(product);
      console.log(`    ✓ 已抓取: ${JSON.stringify(product, null, 2)} `);

      // 添加随机延迟，避免请求过快
      await humanDelay(1000, 2000);

    } catch (error) {
      console.log(`    ✗ 抓取失败: ${error.message}`);
      continue;
    }
  }

  console.log(`  ✅ 最终抓取 ${products.length} 个商品信息`);
  return products;
}

/**
 * 获取指定搜索结果
 * @param {string} searchId - 搜索ID
 * @returns {Object} 搜索结果
 */
export function getSearchResults(searchId) {
  return StorageService.getSearchResults(searchId);
}

/**
 * 删除搜索结果
 * @param {string} searchId - 搜索ID
 * @returns {boolean} 是否删除成功
 */
export function deleteSearchResults(searchId) {
  return StorageService.deleteSearchResults(searchId);
}

/**
 * 编辑单个商品信息
 * @param {string} searchId - 搜索ID
 * @param {string} productId - 商品ID
 * @param {Object} updates - 要更新的商品信息
 * @returns {boolean} 是否编辑成功
 */
export function editProduct(searchId, productId, updates) {
  console.log(`\n✏️  编辑商品: ${productId}`);
  
  // 获取搜索结果
  const searchResults = StorageService.getSearchResults(searchId);
  if (!searchResults) {
    console.error('❌ 搜索结果不存在');
    return false;
  }
  
  // 查找商品
  const productIndex = searchResults.products.findIndex(p => p.id === productId);
  if (productIndex === -1) {
    console.error('❌ 商品不存在');
    return false;
  }
  
  // 更新商品信息
  searchResults.products[productIndex] = {
    ...searchResults.products[productIndex],
    ...updates
  };
  
  // 保存更新后的搜索结果
  StorageService.saveSearchResults(searchId, searchResults);
  
  console.log(`✅ 商品编辑成功`);
  return true;
}