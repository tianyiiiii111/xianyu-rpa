/**
 * services/AiService.ts - AI服务
 */

import OpenAI from 'openai';
import { config } from '../config/index.js';

// AI响应接口
export interface AIResponse {
  success: boolean;
  data?: string;
  error?: string;
}

// 创建OpenAI客户端
function createOpenAIClient(): OpenAI {
  return new OpenAI({
    apiKey: config.ALIBABA_CLOUD_API_KEY,
    baseURL: config.AI_BASE_URL
  });
}

/**
 * 使用AI优化商品标题
 */
export async function optimizeTitle(title: string): Promise<AIResponse> {
  if (!config.ALIBABA_CLOUD_API_KEY) {
    return { success: false, error: '未配置AI API Key' };
  }
  
  try {
    const client = createOpenAIClient();
    
    const response = await client.chat.completions.create({
      model: config.AI_MODEL,
      messages: [
        {
          role: 'system',
          content: '你是一个电商文案优化专家，请优化商品标题使其更吸引人、更容易获得曝光。'
        },
        {
          role: 'user',
          content: `请优化以下商品标题，要求：\n1. 简洁有力，不超过30字\n2. 突出商品卖点\n3. 符合闲鱼平台风格\n\n原始标题：${title}`
        }
      ],
      temperature: 0.7,
      max_tokens: 100
    });
    
    const optimizedTitle = response.choices[0]?.message?.content?.trim();
    
    if (optimizedTitle) {
      return { success: true, data: optimizedTitle };
    }
    
    return { success: false, error: 'AI返回内容为空' };
  } catch (error) {
    console.error(`AI优化标题失败: ${(error as Error).message}`);
    return { success: false, error: (error as Error).message };
  }
}

/**
 * 使用AI生成商品描述
 */
export async function generateDescription(productInfo: {
  title: string;
  category?: string;
  condition?: string;
}): Promise<AIResponse> {
  if (!config.ALIBABA_CLOUD_API_KEY) {
    return { success: false, error: '未配置AI API Key' };
  }
  
  try {
    const client = createOpenAIClient();
    
    const response = await client.chat.completions.create({
      model: config.AI_MODEL,
      messages: [
        {
          role: 'system',
          content: '你是一个电商文案撰写专家，请根据商品信息生成吸引人的商品描述。'
        },
        {
          role: 'user',
          content: `请为以下商品生成一段描述（100-200字）：\n商品标题：${productInfo.title}\n类别：${productInfo.category || '未指定'}\n新旧程度：${productInfo.condition || '二手'}`
        }
      ],
      temperature: 0.8,
      max_tokens: 300
    });
    
    const description = response.choices[0]?.message?.content?.trim();
    
    if (description) {
      return { success: true, data: description };
    }
    
    return { success: false, error: 'AI返回内容为空' };
  } catch (error) {
    console.error(`AI生成描述失败: ${(error as Error).message}`);
    return { success: false, error: (error as Error).message };
  }
}

/**
 * 使用AI回答问题
 */
export async function chat(prompt: string): Promise<AIResponse> {
  if (!config.ALIBABA_CLOUD_API_KEY) {
    return { success: false, error: '未配置AI API Key' };
  }
  
  try {
    const client = createOpenAIClient();
    
    const response = await client.chat.completions.create({
      model: config.AI_MODEL,
      messages: [
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 1000
    });
    
    const content = response.choices[0]?.message?.content?.trim();
    
    if (content) {
      return { success: true, data: content };
    }
    
    return { success: false, error: 'AI返回内容为空' };
  } catch (error) {
    console.error(`AI对话失败: ${(error as Error).message}`);
    return { success: false, error: (error as Error).message };
  }
}

export default { optimizeTitle, generateDescription, chat };