/**
 * utils/browser.ts - 浏览器操作工具
 */

import { chromium, Browser, BrowserContext, Page } from 'playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '../..');
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

function getRandomUserAgent(): string {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

// 浏览器实例类型
export interface BrowserInstance {
  browser: Browser;
  context: BrowserContext;
  page: Page;
  cookiePath: string;
}

/**
 * 创建浏览器实例
 */
export async function createBrowser(accountId = '', headless = false): Promise<BrowserInstance> {
  console.log(`  🖥️  启动浏览器 (账号: ${accountId})`);
  
  const userAgent = getRandomUserAgent();
  
  const browser = await chromium.launch({
    headless,
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
    userAgent,
    locale: 'zh-CN',
    timezoneId: 'Asia/Shanghai',
    viewport: { width: 1280, height: 720 },
    deviceScaleFactor: 1,
    hasTouch: false,
    isMobile: false,
    permissions: ['geolocation'],
    ignoreHTTPSErrors: true
  });

  // 添加反检测脚本 - 使用字符串形式
  const antiDetectScript = `
    Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
    Object.defineProperty(navigator, 'plugins', { get: () => [1, 2, 3, 4, 5] });
    Object.defineProperty(navigator, 'languages', { get: () => ['zh-CN', 'zh', 'en'] });
  `;
  await context.addInitScript(antiDetectScript);

  const page = await context.newPage();
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
      console.log(`  ⚠️  Cookie 加载失败: ${(error as Error).message}`);
    }
  } else {
    console.log(`  ⚠️  未找到账号 [${accountId}] 的 Cookie，请先登录`);
  }

  return { browser, context, page, cookiePath };
}

/**
 * 保存 cookies
 */
export async function saveCookies(context: BrowserContext, cookiePath: string): Promise<void> {
  try {
    const cookies = await context.cookies();
    fs.writeFileSync(cookiePath, JSON.stringify(cookies, null, 2));
    console.log(`  🍪 Cookie 已保存`);
  } catch (error) {
    console.log(`  ⚠️  Cookie 保存失败: ${(error as Error).message}`);
  }
}

/**
 * 模拟人类操作延迟
 */
export async function humanDelay(min = 1000, max = 2000): Promise<void> {
  const delay = Math.floor(Math.random() * (max - min + 1)) + min;
  await new Promise(resolve => setTimeout(resolve, delay));
}

/**
 * 截图功能
 */
export async function screenshot(_page: Page, _name: string): Promise<void> {
  // 暂时禁用截图功能以节省资源
}

/**
 * 模拟人类输入
 */
export async function humanType(element: { type: (text: string, options: { delay: number }) => Promise<void> }, text: string, minDelay = 50, maxDelay = 150): Promise<void> {
  for (const char of text) {
    const delay = Math.floor(Math.random() * (maxDelay - minDelay + 1)) + minDelay;
    await element.type(char, { delay });
  }
}

export default { createBrowser, saveCookies, humanDelay, screenshot, humanType };