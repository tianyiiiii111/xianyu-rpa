/**
 * queue/index.js - 任务队列管理
 * 
 * 功能：
 * 1. 发布任务队列
 * 2. 搜索任务队列
 * 3. 任务状态跟踪
 * 4. 失败重试
 */

import { Queue, Worker, Job } from 'bullmq';
import { publishProduct } from '../services/PublishService.js';
import { searchProducts } from '../services/SearchService.js';
import config from '../config/index.js';
import { log } from '../utils/logger.js';

// Redis连接配置
const getRedisOptions = () => ({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT) || 6379,
  password: process.env.REDIS_PASSWORD,
  maxRetriesPerRequest: null, // 对于BullMQ是必需的
});

// 创建队列实例
export const publishQueue = new Queue('xianyu-publish', {
  connection: getRedisOptions(),
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000
    },
    removeOnComplete: 100,
    removeOnFail: 200
  }
});

export const searchQueue = new Queue('xianyu-search', {
  connection: getRedisOptions(),
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000
    },
    removeOnComplete: 100,
    removeOnFail: 200
  }
});

/**
 * 添加发布任务
 * @param {Object} product - 商品数据
 * @param {string} accountId - 账号ID
 * @param {Object} options - 任务选项
 * @returns {Promise<Job>}
 */
export async function addPublishJob(product, accountId, options = {}) {
  const job = await publishQueue.add('publish-product', {
    product,
    accountId,
    ...options
  }, {
    priority: options.priority || 2,
    delay: options.delay || 0,
  });
  
  log.publish(`添加发布任务 #${job.id}`);
  return job;
}

/**
 * 添加搜索任务
 * @param {string} keyword - 搜索关键词
 * @param {string} accountId - 账号ID
 * @param {Object} options - 任务选项
 * @returns {Promise<Job>}
 */
export async function addSearchJob(keyword, accountId, options = {}) {
  const job = await searchQueue.add('search-keyword', {
    keyword,
    accountId,
    ...options
  }, {
    priority: options.priority || 1,
  });
  
  log.search(`添加搜索任务 #${job.id}, 关键词: ${keyword}`);
  return job;
}

/**
 * 批量添加发布任务
 * @param {Array} products - 商品列表
 * @param {string} accountId - 账号ID
 */
export async function addBatchPublishJobs(products, accountId) {
  const jobs = await Promise.all(
    products.map((product, index) => 
      addPublishJob(product, accountId, { 
        delay: index * 5000 // 每个任务延迟5秒
      })
    )
  );
  
  log.publish(`批量添加 ${jobs.length} 个发布任务`);
  return jobs;
}

// ==================== Worker 处理器 ====================

// 发布任务处理器
const publishWorker = new Worker('xianyu-publish', async (job) => {
  log.publish(`开始处理任务 #${job.id}`);
  const startTime = Date.now();
  
  try {
    const { product, accountId } = job.data;
    const result = await publishProduct(product, accountId);
    
    const duration = Date.now() - startTime;
    log.publish(`任务 #${job.id} 完成，耗时 ${duration}ms`);
    
    return {
      success: result.success,
      productId: product.id,
      duration,
      result
    };
  } catch (err) {
    log.error(`任务 #${job.id} 失败: ${err.message}`);
    throw err;
  }
}, {
  connection: getRedisOptions(),
  concurrency: 2, // 并发数
  limiter: {
    max: 5,
    duration: 60000 // 每分钟最多5个
  }
});

// 搜索任务处理器
const searchWorker = new Worker('xianyu-search', async (job) => {
  log.search(`开始处理任务 #${job.id}`);
  const startTime = Date.now();
  
  try {
    const { keyword, accountId } = job.data;
    const result = await searchProducts(keyword, accountId);
    
    const duration = Date.now() - startTime;
    log.search(`任务 #${job.id} 完成，耗时 ${duration}ms`);
    
    return {
      success: true,
      keyword,
      duration,
      result
    };
  } catch (err) {
    log.error(`搜索任务 #${job.id} 失败: ${err.message}`);
    throw err;
  }
}, {
  connection: getRedisOptions(),
  concurrency: 1, // 搜索并发为1
  limiter: {
    max: 10,
    duration: 60000
  }
});

// ==================== 事件监听 ====================

// 任务完成事件
publishWorker.on('completed', (job, result) => {
  log.publish(`✅ 任务 #${job.id} 已完成`);
});

publishWorker.on('failed', (job, err) => {
  log.error(`❌ 任务 #${job.id} 失败: ${err.message}`);
});

searchWorker.on('completed', (job, result) => {
  log.search(`✅ 搜索任务 #${job.id} 完成`);
});

searchWorker.on('failed', (job, err) => {
  log.error(`❌ 搜索任务 #${job.id} 失败: ${err.message}`);
});

// ==================== 队列状态查询 ====================

/**
 * 获取队列状态
 */
export async function getQueuesStatus() {
  const [publishJobs, searchJobs] = await Promise.all([
    publishQueue.getJobCounts('waiting', 'active', 'completed', 'failed'),
    searchQueue.getJobCounts('waiting', 'active', 'completed', 'failed')
  ]);
  
  return {
    publish: publishJobs,
    search: searchJobs
  };
}

/**
 * 获取任务进度
 * @param {string} queueName - 队列名称
 * @param {string} jobId - 任务ID
 */
export async function getJobProgress(queueName, jobId) {
  const queue = queueName === 'publish' ? publishQueue : searchQueue;
  const job = await queue.getJob(jobId);
  
  if (!job) return null;
  
  return {
    id: job.id,
    status: await job.getState(),
    progress: job.progress,
    data: job.data,
    returnValue: job.returnvalue,
    failedReason: job.failedReason
  };
}

/**
 * 清除所有任务（谨慎使用）
 */
export async function clearAllJobs() {
  await Promise.all([
    publishQueue.drain(),
    searchQueue.drain()
  ]);
  log.info('已清除所有队列任务');
}

/**
 * 关闭队列连接
 */
export async function closeQueues() {
  await Promise.all([
    publishWorker.close(),
    searchWorker.close(),
    publishQueue.close(),
    searchQueue.close()
  ]);
  log.info('队列连接已关闭');
}

export default {
  publishQueue,
  searchQueue,
  addPublishJob,
  addSearchJob,
  addBatchPublishJobs,
  getQueuesStatus,
  getJobProgress,
  clearAllJobs,
  closeQueues
};