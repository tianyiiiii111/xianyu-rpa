/**
 * metrics.js - 性能监控指标
 * 
 * 功能：
 * 1. 请求计数统计
 * 2. 响应时间跟踪
 * 3. 错误率监控
 * 4. 自定义业务指标
 */

import { performance } from 'perf_hooks';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..', '..');
const METRICS_FILE = path.join(ROOT, 'data', 'metrics.json');

// 内存指标
const processMetrics = {
  startTime: Date.now(),
  restarts: 0
};

// 内存使用记录
const memorySnapshots = [];

/**
 * 指标收集器
 */
class MetricsCollector {
  constructor() {
    // 计数器
    this.counters = {
      search: { total: 0, success: 0, failed: 0 },
      publish: { total: 0, success: 0, failed: 0 },
      ai: { total: 0, success: 0, failed: 0 },
      api: { total: 0, success: 0, failed: 0 }
    };
    
    // 响应时间记录
    this.responseTimes = {
      search: [],
      publish: [],
      ai: [],
      api: []
    };
    
    // 时序数据
    this.timeline = [];
    
    // 限制内存使用
    this.maxTimelineEntries = 1000;
    this.maxResponseTimeEntries = 100;
  }

  /**
   * 记录计数
   * @param {string} type - 类型 (search/publish/ai/api)
   * @param {boolean} success - 是否成功
   */
  recordCount(type, success = true) {
    if (!this.counters[type]) {
      this.counters[type] = { total: 0, success: 0, failed: 0 };
    }
    
    this.counters[type].total++;
    if (success) {
      this.counters[type].success++;
    } else {
      this.counters[type].failed++;
    }
  }

  /**
   * 记录响应时间
   * @param {string} type - 类型
   * @param {number} duration - 耗时(毫秒)
   */
  recordResponseTime(type, duration) {
    if (!this.responseTimes[type]) {
      this.responseTimes[type] = [];
    }
    
    this.responseTimes[type].push({
      timestamp: Date.now(),
      duration
    });
    
    // 限制数组大小
    if (this.responseTimes[type].length > this.maxResponseTimeEntries) {
      this.responseTimes[type].shift();
    }
  }

  /**
   * 记录时序事件
   * @param {string} event - 事件名
   * @param {Object} data - 数据
   */
  recordEvent(event, data = {}) {
    this.timeline.push({
      event,
      timestamp: Date.now(),
      ...data
    });
    
    // 限制数组大小
    if (this.timeline.length > this.maxTimelineEntries) {
      this.timeline.shift();
    }
  }

  /**
   * 获取平均响应时间
   * @param {string} type - 类型
   */
  getAverageResponseTime(type) {
    const times = this.responseTimes[type];
    if (!times || times.length === 0) return 0;
    
    const sum = times.reduce((acc, t) => acc + t.duration, 0);
    return Math.round(sum / times.length);
  }

  /**
   * 获取成功率
   * @param {string} type - 类型
   */
  getSuccessRate(type) {
    const counter = this.counters[type];
    if (!counter || counter.total === 0) return 0;
    return Math.round((counter.success / counter.total) * 100);
  }

  /**
   * 获取统计摘要
   */
  getSummary() {
    // 计算内存使用
    const memUsage = process.memoryUsage();
    
    return {
      uptime: Math.floor((Date.now() - processMetrics.startTime) / 1000),
      counters: this.counters,
      averages: {
        searchResponseTime: this.getAverageResponseTime('search'),
        publishResponseTime: this.getAverageResponseTime('publish'),
        aiResponseTime: this.getAverageResponseTime('ai')
      },
      successRates: {
        search: this.getSuccessRate('search'),
        publish: this.getSuccessRate('publish'),
        ai: this.getSuccessRate('ai')
      },
      memory: {
        rss: Math.round(memUsage.rss / 1024 / 1024), // MB
        heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
        heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
        external: Math.round(memUsage.external / 1024 / 1024)
      },
      timeline: this.timeline.slice(-50) // 最近50条
    };
  }

  /**
   * 保存到文件
   */
  save() {
    try {
      const dataDir = path.dirname(METRICS_FILE);
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
      
      fs.writeFileSync(METRICS_FILE, JSON.stringify(this.getSummary(), null, 2));
    } catch (err) {
      console.warn('保存指标失败:', err.message);
    }
  }

  /**
   * 重置
   */
  reset() {
    this.counters = {
      search: { total: 0, success: 0, failed: 0 },
      publish: { total: 0, success: 0, failed: 0 },
      ai: { total: 0, success: 0, failed: 0 },
      api: { total: 0, success: 0, failed: 0 }
    };
    this.responseTimes = {
      search: [],
      publish: [],
      ai: [],
      api: []
    };
    this.timeline = [];
  }
}

// 创建全局实例
export const metrics = new MetricsCollector();

// 快捷记录函数
export const recordSearch = (success, duration) => {
  metrics.recordCount('search', success);
  if (duration) metrics.recordResponseTime('search', duration);
};

export const recordPublish = (success, duration) => {
  metrics.recordCount('publish', success);
  if (duration) metrics.recordResponseTime('publish', duration);
};

export const recordAI = (success, duration) => {
  metrics.recordCount('ai', success);
  if (duration) metrics.recordResponseTime('ai', duration);
};

export const recordAPI = (success, duration) => {
  metrics.recordCount('api', success);
  if (duration) metrics.recordResponseTime('api', duration);
};

// 定时保存指标（每5分钟）
setInterval(() => {
  metrics.save();
}, 5 * 60 * 1000);

// 定时记录内存快照（每分钟）
setInterval(() => {
  const mem = process.memoryUsage();
  memorySnapshots.push({
    timestamp: Date.now(),
    heapUsed: mem.heapUsed
  });
  
  // 保留最近60个快照
  if (memorySnapshots.length > 60) {
    memorySnapshots.shift();
  }
}, 60 * 1000);

// 优雅退出时保存
process.on('beforeExit', () => {
  metrics.save();
});

export default {
  metrics,
  recordSearch,
  recordPublish,
  recordAI,
  recordAPI
};