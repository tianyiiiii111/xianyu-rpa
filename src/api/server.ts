/**
 * api/server.ts - Express API服务
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from '../config/index.js';
import { createRequestLogger } from '../utils/requestLogger.js';
import { securityHeaders } from '../utils/security.js';
import { createRateLimiter } from '../utils/rateLimiter.js';
import { errorHandler } from '../utils/errors.js';
import { searchSchema, publishSchema } from '../utils/validators.js';
import { performHealthCheck } from '../utils/healthCheck.js';
import { metrics, recordAPI } from '../utils/metrics.js';
import { searchProducts } from '../services/SearchService.js';
import { publishProduct, publishBatch } from '../services/PublishService.js';
import { optimizeTitle, generateDescription, chat as aiChat } from '../services/AiService.js';
import { getAllSearchResults, getSearchResult, deleteSearchResult } from '../utils/storage.js';
import { setupSwagger } from './docs.js';
import { setupWebSocket } from './websocket.js';

const app = express();

// 中间件
app.use(cors());
app.use(helmet());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(securityHeaders);
app.use(createRequestLogger() as unknown as express.RequestHandler);
app.use(createRateLimiter());

// 健康检查端点
app.get('/health', async (_req, res) => {
  const start = Date.now();
  const health = await performHealthCheck();
  const duration = Date.now() - start;
  recordAPI(true, duration);
  
  res.status(health.ok ? 200 : 503).json(health);
});

app.get('/api/health', async (_req, res) => {
  const health = await performHealthCheck();
  res.json(health);
});

// 搜索端点
app.post('/api/search', async (req, res, next) => {
  const start = Date.now();
  
  try {
    const { keyword, accountId, maxProducts, headless } = req.body;
    
    // 验证
    const { error } = searchSchema.validate({ keyword, accountId });
    if (error) {
      recordAPI(false, Date.now() - start);
      return res.status(400).json({ success: false, error: error.message });
    }
    
    const result = await searchProducts({
      keyword,
      accountId,
      maxProducts: maxProducts || 20,
      headless: headless || false
    });
    
    // 保存结果
    const { addSearchResult } = await import('../utils/storage.js');
    addSearchResult(result);
    
    recordAPI(true, Date.now() - start);
    res.json({ success: true, data: result });
  } catch (err) {
    recordAPI(false, Date.now() - start);
    next(err);
  }
});

// 获取搜索结果列表
app.get('/api/search', (_req, res) => {
  const results = getAllSearchResults();
  res.json({ success: true, data: results });
});

// 获取单个搜索结果
app.get('/api/search/:id', (req, res) => {
  const { id } = req.params;
  const result = getSearchResult(id);
  
  if (!result) {
    return res.status(404).json({ success: false, error: '搜索结果不存在' });
  }
  
  res.json({ success: true, data: result });
});

// 删除搜索结果
app.delete('/api/search/:id', (req, res) => {
  const { id } = req.params;
  deleteSearchResult(id);
  res.json({ success: true });
});

// 发布端点 - 批量发布
app.post('/api/publish', async (req, res, next) => {
  const start = Date.now();
  
  try {
    const { searchId, accountId } = req.body;
    
    const { error } = publishSchema.validate({ searchId, accountId });
    if (error) {
      recordAPI(false, Date.now() - start);
      return res.status(400).json({ success: false, error: error.message });
    }
    
    // 获取搜索结果
    const searchResult = getSearchResult(searchId);
    if (!searchResult) {
      recordAPI(false, Date.now() - start);
      return res.status(404).json({ success: false, error: '搜索结果不存在' });
    }
    
    // 批量发布
    const products = searchResult.products.map((p: { title: string; price: number; description?: string; images: string[] }) => ({
      title: p.title,
      price: p.price,
      description: p.description || '',
      images: p.images
    }));
    
    const results = await publishBatch(products, accountId);
    
    recordAPI(true, Date.now() - start);
    res.json({ success: true, data: results });
  } catch (err) {
    recordAPI(false, Date.now() - start);
    next(err);
  }
});

// 单个商品发布
app.post('/api/publish/single', async (req, res, next) => {
  const start = Date.now();
  
  try {
    const { product, accountId } = req.body;
    
    const result = await publishProduct({ product, accountId });
    
    recordAPI(true, Date.now() - start);
    res.json({ success: true, data: result });
  } catch (err) {
    recordAPI(false, Date.now() - start);
    next(err);
  }
});

// AI端点
app.post('/api/ai/optimize-title', async (req, res, next) => {
  const start = Date.now();
  
  try {
    const { title } = req.body;
    
    if (!title) {
      recordAPI(false, Date.now() - start);
      return res.status(400).json({ success: false, error: '标题不能为空' });
    }
    
    const result = await optimizeTitle(title);
    
    recordAPI(result.success, Date.now() - start);
    res.json(result);
  } catch (err) {
    recordAPI(false, Date.now() - start);
    next(err);
  }
});

app.post('/api/ai/generate-description', async (req, res, next) => {
  const start = Date.now();
  
  try {
    const { title, category, condition } = req.body;
    
    if (!title) {
      recordAPI(false, Date.now() - start);
      return res.status(400).json({ success: false, error: '商品标题不能为空' });
    }
    
    const result = await generateDescription({ title, category, condition });
    
    recordAPI(result.success, Date.now() - start);
    res.json(result);
  } catch (err) {
    recordAPI(false, Date.now() - start);
    next(err);
  }
});

app.post('/api/ai/chat', async (req, res, next) => {
  const start = Date.now();
  
  try {
    const { prompt } = req.body;
    
    if (!prompt) {
      recordAPI(false, Date.now() - start);
      return res.status(400).json({ success: false, error: '提示不能为空' });
    }
    
    const result = await aiChat(prompt);
    
    recordAPI(result.success, Date.now() - start);
    res.json(result);
  } catch (err) {
    recordAPI(false, Date.now() - start);
    next(err);
  }
});

// 指标端点
app.get('/api/metrics', (_req, res) => {
  const summary = metrics.getSummary();
  res.json({ success: true, data: summary });
});

// 错误处理
app.use(errorHandler);

// 启动服务器
const PORT = config.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log(`🚀 服务器已启动: http://localhost:${PORT}`);
  console.log(`📚 API文档: http://localhost:${PORT}/api-docs`);
  
  // 设置WebSocket
  setupWebSocket(server);
  
  // 设置Swagger
  setupSwagger(app);
});

export default server;