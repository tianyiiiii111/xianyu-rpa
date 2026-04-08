/**
 * utils/metrics.ts - 性能监控指标
 */

interface Counter {
  total: number;
  success: number;
  failed: number;
}

interface ResponseTimeEntry {
  timestamp: number;
  duration: number;
}

interface TimelineEntry {
  event: string;
  timestamp: number;
  [key: string]: unknown;
}

const processMetrics = { startTime: Date.now(), restarts: 0 };

class MetricsCollector {
  counters: Record<string, Counter> = {
    search: { total: 0, success: 0, failed: 0 },
    publish: { total: 0, success: 0, failed: 0 },
    ai: { total: 0, success: 0, failed: 0 },
    api: { total: 0, success: 0, failed: 0 }
  };
  
  responseTimes: Record<string, ResponseTimeEntry[]> = {
    search: [],
    publish: [],
    ai: [],
    api: []
  };
  
  timeline: TimelineEntry[] = [];

  recordCount(type: string, success = true) {
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

  recordResponseTime(type: string, duration: number) {
    if (!this.responseTimes[type]) {
      this.responseTimes[type] = [];
    }
    
    this.responseTimes[type].push({ timestamp: Date.now(), duration });
    
    if (this.responseTimes[type].length > 100) {
      this.responseTimes[type].shift();
    }
  }

  getAverageResponseTime(type: string): number {
    const times = this.responseTimes[type];
    if (!times || times.length === 0) return 0;
    
    const sum = times.reduce((acc, t) => acc + t.duration, 0);
    return Math.round(sum / times.length);
  }

  getSuccessRate(type: string): number {
    const counter = this.counters[type];
    if (!counter || counter.total === 0) return 0;
    return Math.round((counter.success / counter.total) * 100);
  }

  getSummary() {
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
        rss: Math.round(memUsage.rss / 1024 / 1024),
        heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
        heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
        external: Math.round(memUsage.external / 1024 / 1024)
      },
      timeline: this.timeline.slice(-50)
    };
  }

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

export const metrics = new MetricsCollector();

export const recordSearch = (success: boolean, duration?: number) => {
  metrics.recordCount('search', success);
  if (duration) metrics.recordResponseTime('search', duration);
};

export const recordPublish = (success: boolean, duration?: number) => {
  metrics.recordCount('publish', success);
  if (duration) metrics.recordResponseTime('publish', duration);
};

export const recordAI = (success: boolean, duration?: number) => {
  metrics.recordCount('ai', success);
  if (duration) metrics.recordResponseTime('ai', duration);
};

export const recordAPI = (success: boolean, duration?: number) => {
  metrics.recordCount('api', success);
  if (duration) metrics.recordResponseTime('api', duration);
};

export default { metrics, recordSearch, recordPublish, recordAI, recordAPI };