import { chromium } from 'playwright';
import fs from 'fs';
import pinyin from 'pinyin';
import path from 'path';

/**
 * 闲鱼扫码登录并保存 Cookie (增强版)
 */
export async function loginAndSaveCookie() {
    const cookieDir = path.resolve('cookies');
    if (!fs.existsSync(cookieDir)) {
        fs.mkdirSync(cookieDir, { recursive: true });
    }

    console.log(`🚀 正在启动浏览器，准备登录闲鱼...`);

    const browser = await chromium.launch({ 
        headless: false, 
        args: ['--start-maximized'] 
    });

    const context = await browser.newContext({ viewport: null });
    const page = await context.newPage();

    try {
        await page.goto('https://www.goofish.com/', { waitUntil: 'networkidle' });
        console.log('📢 请在浏览器中完成扫码登录...');

        // 1. 判定逻辑：等待并检查 .item--m9jSTUup 是否有 href 属性
        const loginTrigger = page.locator('.item--m9jSTUup');
        
        // 持续检测直到 href 出现
        await page.waitForFunction(() => {
            const el = document.querySelector('.item--m9jSTUup');
            return el && el.hasAttribute('href');
        }, { timeout: 0 });

        console.log('✅ 登录判定成功（已检测到 href 属性）');

        // 2. 获取账号昵称
        const nickElement = page.locator('.nick--RyNYtDXM');
        await nickElement.waitFor({ state: 'visible' });
        const nickName = (await nickElement.textContent() || "unknown").trim();
        // 转化拼音逻辑：style: pinyin.STYLE_NORMAL 表示不带声调
        const pinyinArray = pinyin.default(nickName, {
            style: pinyin.default.STYLE_NORMAL, 
            heteronym: false
        });
        // 将二维数组转为字符串，去掉空格并转为小写
        const pyNick = pinyinArray.flat().join('').replace(/\s+/g, '').toLowerCase();
        console.log(`👤 识别到账号名称: ${nickName}->${pyNick}`);

        // 3. 获取 Cookies (纯数组格式)
        const cookies = await context.cookies();

        // 4. 生成动态文件名 (昵称拼音.json)
        const fileName = `${pyNick}.json`;
        const cookiePath = path.join(cookieDir, fileName);

        // 5. 写入文件
        fs.writeFileSync(cookiePath, JSON.stringify(cookies, null, 2));

        console.log(`💾 Cookie 已成功保存至: ${cookiePath}`);
        
        return fileName;

    } catch (error) {
        console.error('❌ 登录过程中出现错误:', error.message);
        return null;
    } finally {
        await new Promise(resolve => setTimeout(resolve, 3000));
        await browser.close();
    }
}