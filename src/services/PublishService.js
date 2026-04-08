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
  console.log(`\n📦 开始发布商品: ${product.title?.slice(0, 20) || '未知商品'}...`);
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
    const salePrice = product.price;
    const originalPrice = product.originalPrice || (parseFloat(salePrice) * 1.2).toFixed(2);
    await fillPrice(page, salePrice, originalPrice);

    // 4. 填写描述 (白名单模式，彻底过滤所有 Emoji)
    const desc = product.desc || product.description || "";
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
  console.log('  🔍 正在调起 AI 进行内容合规性审核与文案美化...');

  try {
    // 1. 调用 AI 获取优化后的文案
    const aiResult = await checkForbiddenWords(rawDescription);

    let finalContent = "";
    if (aiResult.isSafe) {
      console.log('    ✅ AI 审核通过，使用原描述或微调文案');
      finalContent = aiResult.filteredText || rawDescription;
    } else {
      console.log(`    ⚠️ AI 拦截违禁内容，原因: ${aiResult.reason}`);
      finalContent = aiResult.filteredText;
      console.log('    ✨ 已自动替换为 AI 生成的合规高转化文案');
    }

    // 2. 基础字符净化 (防止特殊不可见字符导致浏览器崩溃)
    // 保留汉字、英文字母、数字、空格、换行以及常用中文标点和符号
    finalContent = finalContent.replace(/[^\u4e00-\u9fa5a-zA-Z0-9\s\r\t.,，。！？!?；;：:（）()【】[\]"「」""'-]/g, '');

    // 3. 网页操作：定位输入框
    const editableDiv = page.locator('[contenteditable="true"]').first();
    await editableDiv.waitFor({ state: 'visible', timeout: 5000 });

    // 4. 清空原有内容并模拟真实输入
    await editableDiv.click();
    await page.keyboard.press('Control+A');
    await page.keyboard.press('Backspace');

    // 使用 fill 快速填充大段文本
    await editableDiv.fill(finalContent);

    // 5. 关键：强制触发网页的 input 事件，否则“下一步”按钮可能无法点亮
    await editableDiv.evaluate(el => {
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
    });

    console.log('    📖 描述文字填充完毕');

  } catch (error) {
    console.error(`    ❌ 描述环节出现异常: ${error.message}`);
    // 兜底：如果 AI 或操作失败，尝试直接填充原始文字
    await page.locator('[contenteditable="true"]').first().fill(rawDescription).catch(() => { });
  }
}

/**
 * 自动化选择分类及属性 (强化级联检测)
 */
async function selectCategory(page) {
  console.log('🚀 开始分类选择与纠错流程...');
  const excludeKeywords = ['AI定制设计', '软件/程序/网站开发', '会员/租号'];
  const maxAttempts = 20;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    // 等待页面静止（加载动画消失）
    await page.waitForSelector('.ant-spin-spinning', { state: 'hidden', timeout: 5000 }).catch(() => { });

    const selectors = page.locator('.categoryList--lqyn7MJb .ant-select-selector');
    const count = await selectors.count();
    let hasAction = false;

    for (let i = 0; i < count; i++) {
      const current = selectors.nth(i);
      const item = current.locator('.ant-select-selection-item');
      const placeholder = current.locator('.ant-select-selection-placeholder');

      let needSelect = false;
      if (await placeholder.isVisible()) {
        needSelect = true;
      } else if (await item.isVisible()) {
        const txt = (await item.textContent() || "").trim();
        // 如果已选的是排除项，强制重选
        if (excludeKeywords.some(k => txt.includes(k))) needSelect = true;
      }

      if (needSelect) {
        await current.scrollIntoViewIfNeeded();
        await current.click();

        const optLoc = page.locator('.ant-select-item-option:visible');
        try {
          await optLoc.first().waitFor({ state: 'visible', timeout: 4000 });
          const options = await optLoc.all();
          let target = null;
          for (const o of options) {
            const ot = await o.textContent();
            if (!excludeKeywords.some(k => ot.includes(k))) { target = o; break; }
          }
          if (target) await target.click();
          else if (options.length > 0) await options[0].click();

          hasAction = true;
          // 选完后必须等待，给级联框冒出来的时间
          await page.waitForTimeout(1200);
          break; // 级联会导致 DOM 变化，处理完一个立刻跳出重扫
        } catch (e) {
          await page.mouse.click(0, 0);
        }
      }
    }

    // 二次确认：如果没有操作了，多等一会看看会不会又冒出级联框
    if (!hasAction) {
      await page.waitForTimeout(1000);
      const finalCount = await page.locator('.categoryList--lqyn7MJb .ant-select-selector:has(.ant-select-selection-placeholder)').count();
      if (finalCount === 0) {
        console.log('🎉 分类全部选毕');
        break;
      }
    }
  }
}

/**
 * 提交发布 (多重跳转判定)
 */
async function submitPublish(page) {
  console.log('  🚀 提交发布...');
  try {
    await page.waitForSelector('.ant-spin-spinning', { state: 'hidden', timeout: 5000 }).catch(() => { });

    const btn = page.locator('button[type="submit"], button:has-text("发布"), .ant-btn-primary').last();
    await btn.scrollIntoViewIfNeeded();
    await btn.click();

    console.log('    🖱️ 已点击，等待响应...');
    await Promise.race([
      page.waitForURL(u => u.href.includes('/item') || u.href.includes('/detail'), { timeout: 25000 }),
      page.waitForSelector('.ant-result-success', { timeout: 25000 })
    ]).catch(() => { });
  } catch (e) {
    console.log(`    ⚠️ 提交环节异常: ${e.message}`);
  }
  const isSuccess = /item|detail|success/i.test(page.url());
  return { success: isSuccess, url: page.url() };
}

/**
 * 上传图片
 */
async function uploadImages(page, images) {
  console.log('  📷 上传图片...');
  const uploadInput = await page.$('input[name="file"]');
  if (!uploadInput) return;
  for (let url of images) {
    try {
      await page.evaluate(async (imgUrl) => {
        const resp = await fetch(imgUrl);
        const blob = await resp.blob();
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(new File([blob], 'img.jpg', { type: blob.type }));
        const input = document.querySelector('input[name="file"]');
        input.files = dataTransfer.files;
        input.dispatchEvent(new Event('change', { bubbles: true }));
      }, url);
      await humanDelay(2000, 3000);
    } catch (e) { console.log(`    ⚠️ 图片上传失败: ${e.message}`); }
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