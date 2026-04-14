// src/services/AiService.js
import OpenAI from "openai";

// 确保这里只有纯英文和数字
const apiKey = process.env.ALIBABA_CLOUD_API_KEY;
const openai = new OpenAI({
    apiKey: apiKey,
    baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1",
    // 强制指定请求不带中文 Header
    defaultHeaders: {
        "Accept-Charset": "utf-8"
    }
});

export async function checkForbiddenWords(text) {
    console.log('  🤖 AI 正在进行合规性重组与文案脱敏...');
    try {
        const completion = await openai.chat.completions.create({
            model: "qwen-plus",
            messages: [
                {
                    role: "system",
                    content: `你是一个深谙闲鱼交易风格的卖家，说话风趣
                        任务：在保留原文本痛点的基础上，进行脱敏重组。

                        1. 核心去风险（防封印术）：
                        - 禁止提到：Gemini, Claude, GPT, Adobe, 账号, 会员, 充值, 永久, 微信。
                        - 禁止提到“xx向”后缀（如：技术向、专业向、资源向、学习向）。

                        2. 注入梗文化（增加亲和力）：
                        - 痛点挖掘：别说“功能强大”，要说“拯救深夜改稿的头发”、“拒绝无效加班”。

                        3. 写作风格规整 观看感受舒适：

                        4. 返回格式：必须严格返回 JSON：
                        {"isSafe": boolean, "reason": "风险点吐槽", "filteredText": "优化后很有梗的文案"}`
                },
                {
                    role: "user",
                    content: `请将以下内容重组为合规的技术交流文案：\n\n${text}`
                }
            ],
            response_format: { type: "json_object" }
        });
        return JSON.parse(completion.choices[0].message.content);
    } catch (error) {
        console.error(`  ❌ AI 审核异常: ${error.message}`);
        return { isSafe: true, reason: "跳过检测", filteredText: text };
    }
}