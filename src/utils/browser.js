/**
 * browser.js - 浏览器操作工具
 * 
 * 功能：
 * 1. 创建浏览器实例
 * 2. 保存和加载 cookies
 * 3. 模拟人类操作延迟
 * 4. 截图功能
 * 
 * 注释说明：
 * - 本文件是浏览器操作的工具模块，提供浏览器相关的功能
 * - 代码中添加了详细的注释，确保小白能理解
 * - 支持无头模式和有头模式
 */

import playwright from 'playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..', '..');
const COOKIES_DIR = path.join(ROOT, 'cookies');
const SCREENSHOTS_DIR = path.join(ROOT, 'screenshots');

// 确保目录存在
fs.mkdirSync(COOKIES_DIR, { recursive: true });
fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });

/**
 * 创建浏览器实例
 * @param {string} accountId - 账号ID，默认 'account1'
 * @param {boolean} headless - 是否无头模式，默认 true
 * @returns {Object} 浏览器实例和相关对象
 */
export async function createBrowser(accountId = '', headless = false) {
  console.log(`  🖥️  启动浏览器 (账号: ${accountId})`);
  
  const browser = await playwright.chromium.launch({
    headless: headless,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--disable-gpu'
    ]
  });

  const context = await browser.newContext();
  const page = await context.newPage();

  // 加载 cookies
  const cookiePath = path.join(COOKIES_DIR, `${accountId}.json`);
  if (fs.existsSync(cookiePath)) {
    try {
      const cookies = JSON.parse(fs.readFileSync(cookiePath, 'utf-8'));
      await context.addCookies(cookies);
      console.log(`  🍪 已加载账号 [${accountId}] 的 Cookie`);
    } catch (error) {
      console.log(`  ⚠️  Cookie 加载失败: ${error.message}`);
    }
  } else {
    console.log(`  ⚠️  未找到账号 [${accountId}] 的 Cookie，请先登录`);
  }

  return { browser, context, page, cookiePath };
}

/**
 * 保存 cookies
 * @param {Object} context - 浏览器上下文
 * @param {string} cookiePath - cookies 保存路径
 */
export async function saveCookies(context, cookiePath) {
  try {
    const cookies = await context.cookies();
    fs.writeFileSync(cookiePath, JSON.stringify(cookies, null, 2));
    console.log(`  🍪 Cookie 已保存`);
  } catch (error) {
    console.log(`  ⚠️  Cookie 保存失败: ${error.message}`);
  }
}

/**
 * 模拟人类操作延迟
 * @param {number} min - 最小延迟时间（毫秒）
 * @param {number} max - 最大延迟时间（毫秒）
 */
export async function humanDelay(min = 1000, max = 2000) {
  const delay = Math.floor(Math.random() * (max - min + 1)) + min;
  await new Promise(resolve => setTimeout(resolve, delay));
}

/**
 * 截图功能
 * @param {Object} page - 页面对象
 * @param {string} name - 截图名称
 */
export async function screenshot(page, name) {
  // const timestamp = Date.now();
  // const filename = `${name}-${timestamp}.png`;
  // const filePath = path.join(SCREENSHOTS_DIR, filename);
  
  // try {
  //   await page.screenshot({ path: filePath, fullPage: true });
  //   console.log(`  📸 已截图: ${filename}`);
  // } catch (error) {
  //   console.log(`  ⚠️  截图失败: ${error.message}`);
  // }
}

/**
 * 模拟人类输入
 * @param {Object} element - 页面元素
 * @param {string} text - 要输入的文本
 * @param {number} minDelay - 最小输入延迟（毫秒）
 * @param {number} maxDelay - 最大输入延迟（毫秒）
 */
export async function humanType(element, text, minDelay = 50, maxDelay = 150) {
  for (const char of text) {
    await element.type(char, { delay: Math.floor(Math.random() * (maxDelay - minDelay + 1)) + minDelay });
  }
}