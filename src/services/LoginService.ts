/**
 * services/LoginService.ts - 登录服务
 */

import { createBrowser, humanDelay, saveCookies, type BrowserInstance } from '../utils/browser.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '../..');
const COOKIES_DIR = path.join(ROOT, 'cookies');

// 确保目录存在
if (!fs.existsSync(COOKIES_DIR)) {
  fs.mkdirSync(COOKIES_DIR, { recursive: true });
}

// 登录选项
export interface LoginOptions {
  accountId: string;
  cookies?: Array<{ name: string; value: string; domain: string; path: string }>;
}

// 登录结果
export interface LoginResult {
  success: boolean;
  accountId: string;
  cookiePath?: string;
  error?: string;
}

/**
 * 通过Cookie登录
 */
export async function loginWithCookies(options: LoginOptions): Promise<LoginResult> {
  const { accountId, cookies = [] } = options;
  
  console.log(`🔐 通过Cookie登录账号: ${accountId}`);
  
  const cookiePath = path.join(COOKIES_DIR, `${accountId}.json`);
  
  if (cookies.length > 0) {
    // 保存提供的Cookie
    try {
      fs.writeFileSync(cookiePath, JSON.stringify(cookies, null, 2));
      console.log(`  ✅ Cookie已保存: ${cookiePath}`);
      
      return {
        success: true,
        accountId,
        cookiePath
      };
    } catch (error) {
      return {
        success: false,
        accountId,
        error: `保存Cookie失败: ${(error as Error).message}`
      };
    }
  }
  
  // 使用已有Cookie验证登录
  if (fs.existsSync(cookiePath)) {
    try {
      const savedCookies = JSON.parse(fs.readFileSync(cookiePath, 'utf-8'));
      
      // 验证Cookie是否有效
      const isValid = await verifyCookies(accountId);
      
      if (isValid) {
        console.log(`  ✅ Cookie验证成功`);
        return {
          success: true,
          accountId,
          cookiePath
        };
      } else {
        console.log(`  ⚠️ Cookie已过期`);
        return {
          success: false,
          accountId,
          error: 'Cookie已过期，请重新登录'
        };
      }
    } catch (error) {
      return {
        success: false,
        accountId,
        error: `读取Cookie失败: ${(error as Error).message}`
      };
    }
  }
  
  return {
    success: false,
    accountId,
    error: '未找到Cookie，请先通过浏览器登录'
  };
}

/**
 * 验证Cookie是否有效
 */
async function verifyCookies(accountId: string): Promise<boolean> {
  let browserInstance: BrowserInstance | null = null;
  
  try {
    browserInstance = await createBrowser(accountId);
    const { page } = browserInstance;
    
    // 访问个人中心页面
    await page.goto('https://www.goofish.com/user', { waitUntil: 'networkidle', timeout: 15000 });
    await humanDelay(1000, 2000);
    
    // 检查是否需要登录
    const loginButton = await page.$('button:has-text("登录"), a:has-text("登录")');
    
    if (loginButton) {
      return false;
    }
    
    // 检查用户信息是否存在
    const userInfo = await page.$('.user-info, .profile, [class*="user"]');
    
    return !!userInfo;
  } catch {
    return false;
  } finally {
    if (browserInstance) {
      await browserInstance.browser.close();
    }
  }
}

/**
 * 获取登录状态
 */
export async function getLoginStatus(accountId: string): Promise<{ loggedIn: boolean; cookiePath?: string }> {
  const cookiePath = path.join(COOKIES_DIR, `${accountId}.json`);
  
  if (!fs.existsSync(cookiePath)) {
    return { loggedIn: false };
  }
  
  const isValid = await verifyCookies(accountId);
  
  return {
    loggedIn: isValid,
    cookiePath: isValid ? cookiePath : undefined
  };
}

/**
 * 登出账号
 */
export async function logout(accountId: string): Promise<boolean> {
  const cookiePath = path.join(COOKIES_DIR, `${accountId}.json`);
  
  try {
    if (fs.existsSync(cookiePath)) {
      fs.unlinkSync(cookiePath);
      console.log(`  ✅ 已登出账号: ${accountId}`);
    }
    return true;
  } catch (error) {
    console.error(`  ❌ 登出失败: ${(error as Error).message}`);
    return false;
  }
}

/**
 * 列出所有已登录的账号
 */
export function listAccounts(): Array<{ accountId: string; hasCookie: boolean }> {
  try {
    const files = fs.readdirSync(COOKIES_DIR);
    return files
      .filter(f => f.endsWith('.json'))
      .map(f => ({
        accountId: f.replace('.json', ''),
        hasCookie: true
      }));
  } catch {
    return [];
  }
}

export default { loginWithCookies, getLoginStatus, logout, listAccounts };