/**
 * browser.js - 浏览器操作工具
 * 
 * 功能：
 * 1. 创建浏览器实例
 * 2. 保存和加载 cookies
 * 3. 模拟人类操作延迟
 * 4. 截图功能
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

// 常用User-Agent列表
const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0'
];

function getRandomUserAgent() {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

/**
 * 创建浏览器实例
 * @param {string} accountId - 账号ID，默认 'account1'
 * @param {boolean} headless - 是否无头模式，默认 true
 * @returns {Object} 浏览器实例和相关对象
 */
export async function createBrowser(accountId = '', headless = false) {
  console.log(`  🖥️  启动浏览器 (账号: ${accountId})`);
  
  const userAgent = getRandomUserAgent();
  
  const browser = await playwright.chromium.launch({
    headless: headless,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--disable-gpu',
      '--disable-blink-features=AutomationControlled',
      '--disable-features=IsolateOrigins,site-per-process'
    ]
  });

  const context = await browser.newContext({
    userAgent: userAgent,
    locale: 'zh-CN',
    timezoneId: 'Asia/Shanghai',
    viewport: { width: 1280, height: 720 },
    deviceScaleFactor: 1,
    hasTouch: false,
    isMobile: false,
    permissions: ['geolocation'],
    ignoreHTTPSErrors: true
  });

  // 添加反检测脚本
  await context.addInitScript(() => {
    // 覆盖webdriver属性
    Object.defineProperty(navigator, 'webdriver', {
      get: () => undefined
    });
    // 覆盖plugins
    Object.defineProperty(navigator, 'plugins', {
      get: () => [1, 2, 3, 4, 5]
    });
    // 覆盖languages
    Object.defineProperty(navigator, 'languages', {
      get: () => ['zh-CN', 'zh', 'en']
    });
  });

  const page = await context.newPage();

  // 设置默认超时
  page.setDefaultTimeout(30000);
  page.setDefaultNavigationTimeout(30000);

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