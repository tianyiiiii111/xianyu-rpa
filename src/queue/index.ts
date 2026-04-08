/**
 * queue/index.ts - BullMQ任务队列
 */

import { Queue, Worker, Job } from 'bullmq';
import { config } from '../config/index.js';
import { searchProducts } from '../services/SearchService.js';
import { publishProduct } from '../services/PublishService.js';

// Redis连接配置
const connection = {
  host: config.REDIS_HOST,
  port: config.REDIS_PORT,
  password: config.REDIS_PASSWORD
};

// 定义队列
export const searchQueue = new Queue('search', { connection });
export const publishQueue = new Queue('publish', { connection });

// 任务数据接口
export interface SearchJobData {
  keyword: string;
  accountId?: string;
  maxProducts?: number;
  headless?: boolean;
}

export interface PublishJobData {
  product: {
    title: string;
    price: number;
    description?: string;
    images?: string[];
    originalPrice?: number;
  };
  accountId?: string;
}

// 搜索任务处理器
async function handleSearchJob(job: Job<SearchJobData>): Promise<unknown> {
  const { keyword, accountId, maxProducts, headless } = job.data;
  
  console.log(`📦 处理搜索任务 [${job.id}]: ${keyword}`);
  
  try {
    const result = await searchProducts({
      keyword,
      accountId,
      maxProducts,
      headless
    });
    
    // 保存结果
    const { addSearchResult } = await import('../utils/storage.js');
    addSearchResult(result);
    
    return { success: true, result };
  } catch (error) {
    console.error(`搜索任务失败: ${(error as Error).message}`);
    throw error;
  }
}

// 发布任务处理器
async function handlePublishJob(job: Job<PublishJobData>): Promise<unknown> {
  const { product, accountId } = job.data;
  
  console.log(`📦 处理发布任务 [${job.id}]: ${product.title}`);
  
  try {
    const result = await publishProduct({ product, accountId });
    return result;
  } catch (error) {
    console.error(`发布任务失败: ${(error as Error).message}`);
    throw error;
  }
}

// 创建Worker
export const searchWorker = new Worker('search', handleSearchJob, {
  connection,
  concurrency: 5,
  limiter: {
    max: 10,
    duration: 1000
  }
});

export const publishWorker = new Worker('publish', handlePublishJob, {
  connection,
  concurrency: config.PUBLISH_MAX_CONCURRENT,
  limiter: {
    max: config.PUBLISH_MAX_CONCURRENT,
    duration: 1000
  }
});

// Worker事件监听
searchWorker.on('completed', (job) => {
  console.log(`✅ 搜索任务完成: ${job.id}`);
});

searchWorker.on('failed', (job, error) => {
  console.error(`❌ 搜索任务失败 [${job?.id}]: ${error.message}`);
});

publishWorker.on('completed', (job) => {
  console.log(`✅ 发布任务完成: ${job.id}`);
});

publishWorker.on('failed', (job, error) => {
  console.error(`❌ 发布任务失败 [${job?.id}]: ${error.message}`);
});

// 添加搜索任务
export async function addSearchJob(data: SearchJobData): Promise<string> {
  const job = await searchQueue.add('search', data, {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000
    },
    removeOnComplete: true,
    removeOnFail: false
  });
  
  return job.id!;
}

// 添加发布任务
export async function addPublishJob(data: PublishJobData): Promise<string> {
  const job = await publishQueue.add('publish', data, {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000
    },
    removeOnComplete: true,
    removeOnFail: false
  });
  
  return job.id!;
}

// 获取队列状态
export async function getQueueStats(): Promise<{
  search: { waiting: number; active: number; completed: number; failed: number };
  publish: { waiting: number; active: number; completed: number; failed: number };
}> {
  const [searchCounts, publishCounts] = await Promise.all([
    searchQueue.getJobCounts('waiting', 'active', 'completed', 'failed'),
    publishQueue.getJobCounts('waiting', 'active', 'completed', 'failed')
  ]);
  
  return {
    search: {
      waiting: searchCounts.waiting,
      active: searchCounts.active,
      completed: searchCounts.completed,
      failed: searchCounts.failed
    },
    publish: {
      waiting: publishCounts.waiting,
      active: publishCounts.active,
      completed: publishCounts.completed,
      failed: publishCounts.failed
    }
  };
}

// 关闭队列
export async function closeQueues(): Promise<void> {
  await Promise.all([
    searchQueue.close(),
    publishQueue.close(),
    searchWorker.close(),
    publishWorker.close()
  ]);
  
  console.log('🔒 队列已关闭');
}

export default {
  searchQueue,
  publishQueue,
  searchWorker,
  publishWorker,
  addSearchJob,
  addPublishJob,
  getQueueStats,
  closeQueues
};