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
                    content: `你是一个深谙闲鱼套路的“老六”卖家，说话风趣，自带极客梗，能把枯燥的描述写成“圈内暗号”。
                        任务：在保留原文本痛点的基础上，进行脱敏重组。

                        1. 核心去风险（防封印术）：
                        - 禁止提到：Gemini, Claude, GPT, Adobe, 账号, 会员, 充值, 永久, 微信。
                        - 话术替代：把“买账号”说成“入坑指南”或“学术研究配置”；把“全家桶”说成“生产力大礼包”。

                        2. 注入梗文化（增加亲和力）：
                        - 使用自嘲梗：比如“代码敲累了，回口血”、“生产力工具，用了都说好”、“拒绝当大冤种”。
                        - 圈内黑话：比如“懂的都懂”、“由于众所周知的原因”、“路走宽了”、“建议收藏，防止失联”。
                        - 痛点挖掘：别说“功能强大”，要说“拯救深夜改稿的头发”、“拒绝无效加班”。

                        3. 拒绝死板：
                        - 严禁使用过多的 ✅🚀✨ 表情（这种像微商的文案最容易被封）。
                        - 语气要像真人在吐槽或分享，多用空格和自然换行。

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