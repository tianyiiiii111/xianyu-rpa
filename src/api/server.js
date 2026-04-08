/**
 * server.js - API 服务层
 * 
 * 功能：
 * 1. 提供RESTful API接口
 * 2. 搜索商品接口
 * 3. 发布商品接口
 * 4. 任务状态查询
 * 5. 健康检查
 */

import express from 'express';
import cors from 'cors';
import { searchProducts, getSearchResults, getSearchHistory, deleteSearchResults, editProduct } from '../services/SearchService.js';
import { batchPublish, publishProduct } from '../services/PublishService.js';
import { StorageService } from '../utils/storage.js';
import config from '../config/index.js';
import { healthCheck, printHealthCheck } from '../utils/healthCheck.js';

const app = express();

// 中间件
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// 请求日志中间件
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`  📡 ${req.method} ${req.path} ${res.statusCode} - ${duration}ms`);
  });
  next();
});

// 根路径
app.get('/', (req, res) => {
  res.json({
    name: '闲鱼RPA API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: 'GET /api/health',
      search: 'POST /api/search',
      publish: 'POST /api/publish',
      results: 'GET /api/results/:searchId',
      history: 'GET /api/history',
      delete: 'DELETE /api/results/:searchId',
    }
  });
});

// 健康检查
app.get('/api/health', async (req, res) => {
  const result = await healthCheck();
  printHealthCheck(result);
  res.json(result);
});

// ==================== 搜索相关 ====================

/**
 * POST /api/search
 * 搜索商品
 * Body: { keyword: string, accountId?: string }
 */
app.post('/api/search', async (req, res) => {
  try {
    const { keyword, accountId } = req.body;
    
    if (!keyword) {
      return res.status(400).json({ success: false, error: '缺少 keyword 参数' });
    }

    console.log(`\n🔍 API: 搜索关键词 "${keyword}"`);
    const result = await searchProducts(keyword, accountId);
    
    res.json({ success: true, data: result });
  } catch (err) {
    console.error('❌ 搜索失败:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/results/:searchId
 * 获取搜索结果
 */
app.get('/api/results/:searchId', (req, res) => {
  try {
    const { searchId } = req.params;
    const result = getSearchResults(searchId);
    
    if (!result) {
      return res.status(404).json({ success: false, error: '搜索结果不存在' });
    }
    
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/history
 * 获取搜索历史
 */
app.get('/api/history', (req, res) => {
  try {
    const history = StorageService.getSearchHistory();
    res.json({ success: true, data: history });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * DELETE /api/results/:searchId
 * 删除搜索结果
 */
app.delete('/api/results/:searchId', (req, res) => {
  try {
    const { searchId } = req.params;
    const success = deleteSearchResults(searchId);
    
    res.json({ success, message: success ? '删除成功' : '删除失败' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * PUT /api/products/:searchId/:productId
 * 编辑商品信息
 */
app.put('/api/products/:searchId/:productId', (req, res) => {
  try {
    const { searchId, productId } = req.params;
    const updates = req.body;
    
    const success = editProduct(searchId, productId, updates);
    res.json({ success, message: success ? '编辑成功' : '编辑失败' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==================== 发布相关 ====================

/**
 * POST /api/publish
 * 批量发布商品
 * Body: { searchId: string, accountId?: string }
 */
app.post('/api/publish', async (req, res) => {
  try {
    const { searchId, accountId } = req.body;
    
    if (!searchId) {
      return res.status(400).json({ success: false, error: '缺少 searchId 参数' });
    }

    console.log(`\n📦 API: 批量发布 searchId=${searchId}`);
    const results = await batchPublish(searchId, accountId);
    
    // 统计成功失败
    const successCount = results.filter(r => r.success).length;
    const failCount = results.length - successCount;
    
    res.json({ 
      success: true, 
      data: results,
      summary: {
        total: results.length,
        success: successCount,
        failed: failCount
      }
    });
  } catch (err) {
    console.error('❌ 发布失败:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/publish/single
 * 发布单个商品
 * Body: { product: object, accountId?: string }
 */
app.post('/api/publish/single', async (req, res) => {
  try {
    const { product, accountId } = req.body;
    
    if (!product) {
      return res.status(400).json({ success: false, error: '缺少 product 参数' });
    }

    console.log(`\n📦 API: 发布单个商品`);
    const result = await publishProduct(product, accountId);
    
    res.json({ success: true, data: result });
  } catch (err) {
    console.error('❌ 发布失败:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==================== 错误处理 ====================

// 404处理
app.use((req, res) => {
  res.status(404).json({ success: false, error: '接口不存在' });
});

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error('❌ 服务器错误:', err);
  res.status(500).json({ success: false, error: err.message });
});

// ==================== 启动服务 ====================

const PORT = process.env.PORT || 3000;

export function startServer(port = PORT) {
  return app.listen(port, () => {
    console.log(`
╔═══════════════════════════════════════════════════════╗
║                                                       ║
║   🚀 闲鱼RPA API 服务已启动                            ║
║                                                       ║
║   本地: http://localhost:${port}                        ║
║   文档: http://localhost:${port}/                       ║
║                                                       ║
╚═══════════════════════════════════════════════════════╝
    `);
  });
}

// 如果直接运行此文件
if (import.meta.url === `file://${process.argv[1]}`) {
  startServer();
}

export default app;