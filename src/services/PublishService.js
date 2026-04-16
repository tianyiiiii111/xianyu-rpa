/**
 * PublishService.js - 商品发布服务 (全能稳定版)
 */
import { checkForbiddenWords } from './AiServes.js'; // 引入 AI 服务
import { createBrowser, saveCookies, humanDelay, screenshot } from '../utils/browser.js';
import { getSearchResults } from './SearchService.js';

/**
 * 发布单个商品主逻辑
 */
export async function publishProduct(product, accountId = '') {
  console.log(`\n📦 开始发布商品...`);
  const { browser, context, page, cookiePath } = await createBrowser(accountId, false);

  try {
    // 1. 进入发布页
    await page.goto('https://www.goofish.com/publish', {
      waitUntil: 'networkidle',
      timeout: 30000,
    });
    await humanDelay(2000, 3000);

    // 2. 上传图片 (维持原 DataTransfer 逻辑)
    if (product.images && product.images.length > 0) {
      await uploadImages(page, product.images);
    }

    // 3. 填写价格 (处理售价和原价两个输入框)
    // 如果没有原价，默认生成一个比售价高 20% 的原价
    // const salePrice = product.price;
    const salePrice = product.price;
    const originalPrice = (parseFloat(salePrice) * 1.2).toFixed(2);
    await fillPrice(page, salePrice, originalPrice);

    // 4. 填写描述 (白名单模式，彻底过滤所有 Emoji)
    const desc = product.description || "";
    await fillDescription(page, desc);

    // 5. 设置发货方式
    await setShipping(page, product.shipping);

    // 6. 选择分类及属性 (强化级联等待与强制纠错)
    await selectCategory(page);

    // 7. 提交发布 (多重结果判定)
    const result = await submitPublish(page);

    await saveCookies(context, cookiePath);
    return { ...result, product };

  } catch (err) {
    console.error(`  ❌ 流程中断: ${err.message}`);
    await screenshot(page, 'error-publish');
    return { success: false, error: err.message, product };
  } finally {
    await humanDelay(1000, 2000);
    await browser.close();
  }
}

/**
 * 填写价格 (精准识别两个输入框并验证)
 */
async function fillPrice(page, salePrice, originalPrice) {
  console.log('  💰 填写价格...');

  const performFill = async (locator, value, label) => {
    await locator.waitFor({ state: 'visible', timeout: 8000 });
    await locator.scrollIntoViewIfNeeded();
    const numValue = String(value).replace(/[^0-9.]/g, '');

    await locator.click();
    await page.keyboard.press('Control+A');
    await page.keyboard.press('Backspace');
    await page.waitForTimeout(200);

    // 尝试 fill 输入
    await locator.fill(numValue);

    // 强制触发同步
    await locator.evaluate((el, val) => {
      el.value = val;
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
      el.blur();
    }, numValue);

    // 二次验证，若为空则启动键盘逐字输入保底
    const actual = await locator.inputValue();
    if (!actual || actual === '0.00' || actual === '') {
      console.log(`    ⚠️ ${label} 填值同步失败，切换键盘逐字模拟...`);
      await locator.click();
      await page.keyboard.type(numValue, { delay: 50 });
    }

    // 最终检查
    const finalVal = await locator.inputValue();
    if (!finalVal || finalVal === '') throw new Error(`${label}填写最终验证失败`);
    console.log(`    ✓ ${label}已填写: ${finalVal}`);
  };

  try {
    const inputs = page.locator('.ant-input-number-input, input[placeholder="0.00"]');
    const count = await inputs.count();

    // 填写售价 (第一个框)
    await performFill(inputs.first(), salePrice, "售价");

    // 如果有原价框，填写原价 (第二个框)
    if (count > 1) {
      await performFill(inputs.nth(1), originalPrice, "原价");
    }
  } catch (e) {
    throw new Error(`价格环节异常: ${e.message}`);
  }
}

/**
 * 填入商品描述 (集成 AI 审核与美化)
 */
async function fillDescription(page, rawDescription) {
  try {
    // // 1. 调用 AI 获取优化后的文案
    // const aiResult = await checkForbiddenWords(rawDescription);

    let finalContent = "";
    // if (aiResult.isSafe) { 
    //   console.log('    ✅ AI 审核通过，使用原描述或微调文案');
    //   finalContent = aiResult.filteredText || rawDescription;
    // } else {
    //   console.log(`    ⚠️ AI 拦截违禁内容，结果: ${JSON.stringify(aiResult, null, 2)}`);
    //   finalContent = aiResult.filteredText;
    //   console.log('    ✨ 已自动替换为 AI 生成的合规高转化文案');
    // }

    finalContent = rawDescription;

    // 2. 第一步：强力清除所有种类的 Emoji 和图形符号 (包含你提到的漏网之鱼)
    // 涵盖了几乎所有彩色图标区间、装饰符号区以及 Unicode 属性定义
    // const strictEmojiRegex = [
    //     /\uD83C[\uDF00-\uDFFF]/g, // 杂项符号和图形
    //     /\uD83D[\uDC00-\uDDFF]/g, // 表情、交通、动物
    //     /\uD83E[\uDD00-\uDEFF]/g, // 补充符号（各种新出的表情）
    //     /[\u2600-\u27BF]/g        // 经典的装饰符号区
    // ];
    
    // strictEmojiRegex.forEach(reg => {
    //     finalContent = finalContent.replace(reg, '');
    // });

    // // --- 第二部分：清除不可见字符（网页端报错元凶） ---
    // // 仅仅针对那些看不见的、会导致网页发布非法字符的“尾巴”
    // finalContent = finalContent.replace(/[\u200D\uFE0F\u20E3\uFEFF]/g, '');

    // const forbiddenMap = {
    //     'Gemini?': 'gemi',
    //     'Claude?': '克劳德',
    //     'OpenAI|GPT-\\d': 'open-ai',
    //     '密钥': 'Key',
    //     '账号': '',
    //     '账户': '',
    //     '会员': '',
    //     '满血': '',
    //     '模型': '',
    //     '付费': '',
    //     // 'AI': '',
    // };

    // Object.keys(forbiddenMap).forEach(pattern => {
    //     const regex = new RegExp(pattern, 'gi');
    //     finalContent = finalContent.replace(regex, forbiddenMap[pattern]);
    // });

    // 3. 网页操作：定位输入框
    const descSelector = '[contenteditable="true"]';
    const editableDiv = page.locator(descSelector).first();
    await editableDiv.waitFor({ state: 'visible', timeout: 5000 });

    // 4. 调用物理换行输入函数 (核心修改点)
    console.log('    ⌨️ 正在模拟真人按键输入(含换行)...');
    await fillDescriptionWithBreaks(page, descSelector, finalContent);

    // 5. 关键：强制触发网页的 input 事件，否则“下一步”按钮可能无法点亮
    await editableDiv.evaluate(el => {
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
    });

    console.log('    📖 描述文字填充完毕');

  } catch (error) {
    console.error(`    ❌ 描述环节出现异常: ${error.message}`);
    // 兜底：如果 AI 或操作失败，尝试直接填充原始文字
    await page. locator('[contenteditable="true"]').first().fill(rawDescription).catch(() => { });
  }
}

/**
 * 带有物理换行的输入函数
 * @param {import('playwright').Page} page - Playwright 页面实例
 * @param {string} selector - 闲鱼描述输入框的选择器
 * @param {string} text - AI 优化后的文本内容
 */
async function fillDescriptionWithBreaks(page, selector, text) {
    // 1. 确保聚焦并清空原有内容
    const editor = page.locator(selector).first();
    await editor.click();
    await page.keyboard.press('Control+A'); // 或是 Command+A (Mac)
    await page.keyboard.press('Backspace');

    // 2. 将文本按换行符切割成数组
    // 兼容 \n (Unix) 和 \r\n (Windows)
    const lines = text.split(/\r?\n/);

    for (let i = 0; i < lines.length; i++) {
        // 输入当前行内容
        if (lines[i].trim() !== '') {
            await page.type(selector, lines[i], { delay: 10 }); 
        }
        
        // 如果不是最后一行，模拟按下物理回车键实现换行
        if (i < lines.length - 1) {
            await page.keyboard.press('Enter');
        }
    }
}

/**
 * 自动化选择分类 (修正版：强制重选第一级)
 */
async function selectCategory(page) {
  console.log('🚀 开始分类选择流程 (强制 AI 校验版)...');
  
  const sessionBlacklist = []; 
  const maxAttempts = 30; 

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    // 1. 获取所有选择框
    const categoryBoxes = page.locator('.categoryList--lqyn7MJb .ant-select-selector');
    if (await categoryBoxes.count() === 0) {
        await page.waitForTimeout(1000);
        continue;
    }

    // 2. 检查第一个框的内容
    const firstBox = categoryBoxes.first();
    const firstBoxText = (await firstBox.textContent() || "").trim();
    
    // 判定：第一个框是否已经包含 AI 且 不是初始提示
    const isFirstBoxAI = firstBoxText.toUpperCase().includes('AI') && 
                         !await firstBox.locator('.ant-select-selection-placeholder').isVisible();

    let targetBox;
    let mode = "";

    if (!isFirstBoxAI) {
      // --- 关键修改：如果第一个不是 AI，强制只操作第一个框 ---
      console.log(`    ⚠️ 主类目当前为: "${firstBoxText}"，不符合 AI 准入，强制重选...`);
      targetBox = firstBox;
      mode = "AI_ONLY";
    } else {
      // 第一个已经是 AI 了，寻找下一个待填的占位符
      const nextPlaceholder = page.locator('.categoryList--lqyn7MJb .ant-select-selector:has(.ant-select-selection-placeholder)').first();
      if (await nextPlaceholder.isVisible()) {
        targetBox = nextPlaceholder;
        mode = "BLIND_PICK";
      } else {
        // 没有占位符了，可能已经选完了
        const allFilled = await page.locator('.ant-select-selection-placeholder').count() === 0;
        if (allFilled) break;
        continue;
      }
    }

    // 3. 执行点击和选择
    await targetBox.click();
    const optLoc = page.locator('.ant-select-item-option:visible');
    await optLoc.first().waitFor({ state: 'visible', timeout: 3000 }).catch(() => {});
    
    const options = await optLoc.all();
    let selectedOpt = null;

    if (mode === "AI_ONLY") {
      // 过滤模式
      for (const opt of options) {
        const txt = (await opt.textContent() || "").trim();
        if (txt.toUpperCase().includes('AI') && !sessionBlacklist.includes(txt)) {
          selectedOpt = opt;
          break; 
        }
      }
    } else {
      // 盲选模式
      selectedOpt = options[0];
    }

    if (selectedOpt) {
      const txt = await selectedOpt.textContent();
      await selectedOpt.click();
      console.log(`    ✨ [${mode}] 已选择: ${txt.trim()}`);
      await page.waitForTimeout(1500);
      await page.waitForSelector('.ant-spin-spinning', { state: 'hidden', timeout: 5000 }).catch(() => {});
    } else {
      console.log(`    ⏳ 未找到合适选项，点击空白处重试...`);
      await page.mouse.click(0, 0);
      await page.waitForTimeout(2000);
    }
  }
  console.log('🎉 分类选择任务结束');
}


/**
 * 提交发布 (多重跳转判定)
 */
async function submitPublish(page) {
  console.log('  🚀 提交发布...');
  try {
    // 1. 强力等待加载遮罩消失（多次检查）
    await page.waitForTimeout(1000); 
    await page.waitForSelector('.ant-spin-spinning', { state: 'hidden', timeout: 10000 }).catch(() => { });

    // 2. 更加精准的按钮选择
    const btn = page.locator('button:has-text("发布")').last();
    
    // 3. 检查按钮是否被禁用
    const isDisabled = await btn.getAttribute('disabled');
    if (isDisabled !== null) {
      console.log('    ❌ 按钮处于禁用状态，可能表单未填完整');
      // 这里可以截图检查哪里没填对
      return { success: false, reason: 'form_incomplete' };
    }

    await btn.scrollIntoViewIfNeeded();
    
    // 4. 尝试两种点击模式：原生点击 + 强制 JS 点击
    await btn.click({ timeout: 5000 }).catch(async () => {
      console.log('    ⚠️ 标准点击失败，尝试 JS 强制点击...');
      await btn.evaluate(el => el.click());
    });

    console.log('    🖱️ 已执行点击，等待响应...');
    
    // ... 剩下的 Promise.race 逻辑 ...
  } catch (e) {
    console.log(`    ⚠️ 提交环节异常: ${e.message}`);
  }
}

/**
 * 上传图片 (兼容本地路径与 HTTP 链接)
 */
async function uploadImages(page, images) {
  console.log('  📷 正在准备上传图片...');
  
  const uploadInputSelector = 'input[type="file"], input[name="file"]';
  
  for (let url of images) {
    try {
      // 1. 判断是本地路径还是网络链接
      const isHttp = url.startsWith('http');

      if (isHttp) {
        // --- 方案 A: 远程 URL (维持你原本的 DataTransfer 逻辑) ---
        await page.evaluate(async ({imgUrl, selector}) => {
          const resp = await fetch(imgUrl);
          const blob = await resp.blob();
          const dataTransfer = new DataTransfer();
          dataTransfer.items.add(new File([blob], 'img.jpg', { type: blob.type }));
          const input = document.querySelector(selector);
          input.files = dataTransfer.files;
          input.dispatchEvent(new Event('change', { bubbles: true }));
        }, { imgUrl: url, selector: uploadInputSelector });
        
        console.log(`    ✓ 远程图片上传成功: ${url.slice(0, 30)}...`);
      } else {
        // --- 方案 B: 本地路径 (使用 Playwright 原生 API) ---
        const uploadInput = page.locator(uploadInputSelector).first();
        await uploadInput.setInputFiles(url);
        
        console.log(`    ✓ 本地图片上传成功: ${url.split('/').pop()}`);
      }

      // 每张图片上传后给予一定的响应时间
      await humanDelay(2000, 3000);
      
    } catch (e) {
      console.log(`    ⚠️ 图片上传失败 [${url}]: ${e.message}`);
    }
  }
}

/**
 * 设置发货方式
 */
async function setShipping(page, val = 3) {
  try {
    const radio = page.locator(`input[type="radio"][value="${val}"]`);
    await radio.click();
  } catch (e) { }
}

/**
 * 批量发布
 */
export async function batchPublish(resultsId, accountId = '') {
  const data = await getSearchResults(resultsId);
  const products = data.products || [];
  const results = [];
  for (let i = 0; i < products.length; i++) {
    const res = await publishProduct(products[i], accountId);
    results.push(res);
    if (i < products.length - 1) await humanDelay(5000, 10000);
  }
  return results;
}