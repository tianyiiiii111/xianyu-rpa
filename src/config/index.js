/**
 * config/index.js - 统一配置管理
 * 
 * 功能：
 * 1. 集中管理所有配置项
 * 2. 支持环境变量覆盖
 * 3. 提供类型提示和默认值
 */

import 'dotenv/config';

// 基础配置
const config = {
  // ==================== 闲鱼平台配置 ====================
  xianyu: {
    // 基础URL
    baseUrl: process.env.XIANYU_BASE_URL || 'https://www.goofish.com',
    // 搜索页面
    searchUrl: process.env.XIANYU_SEARCH_URL || 'https://www.goofish.com/search',
    // 发布页面
    publishUrl: process.env.XIANYU_PUBLISH_URL || 'https://www.goofish.com/publish',
    // 首页
    homeUrl: process.env.XIANYU_HOME_URL || 'https://www.goofish.com/',
    // 页面超时（毫秒）
    timeout: parseInt(process.env.XIANYU_TIMEOUT) || 30000,
    // 导航超时
    navigationTimeout: parseInt(process.env.XIANYU_NAV_TIMEOUT) || 30000,
  },

  // ==================== 爬虫配置 ====================
  crawler: {
    // 最多采集商品数
    maxProducts: parseInt(process.env.CRAWLER_MAX_PRODUCTS) || 20,
    // 请求间隔（毫秒）
    delayBetweenRequests: {
      min: parseInt(process.env.CRAWLER_DELAY_MIN) || 1000,
      max: parseInt(process.env.CRAWLER_DELAY_MAX) || 2000,
    },
    // 重试次数
    retryAttempts: parseInt(process.env.CRAWLER_RETRY) || 3,
    // 浏览器无头模式
    headless: process.env.CRAWLER_HEADLESS === 'true',
    // 每次搜索后等待时间
    searchDelay: {
      min: 3000,
      max: 4000,
    },
    // 详情页加载延迟
    detailDelay: {
      min: 1500,
      max: 2500,
    },
  },

  // ==================== 发布配置 ====================
  publish: {
    // 最大并发发布数
    maxConcurrent: parseInt(process.env.PUBLISH_MAX_CONCURRENT) || 1,
    // 发布时间隔（毫秒）
    delayBetweenPublish: {
      min: parseInt(process.env.PUBLISH_DELAY_MIN) || 5000,
      max: parseInt(process.env.PUBLISH_DELAY_MAX) || 10000,
    },
    // 原始价格倍数（售价的倍数）
    originalPriceMultiplier: parseFloat(process.env.PUBLISH_PRICE_MULTIPLIER) || 1.2,
    // 最多上传图片数
    maxImages: parseInt(process.env.PUBLISH_MAX_IMAGES) || 5,
  },

  // ==================== 存储配置 ====================
  storage: {
    // 数据目录
    dataDir: process.env.STORAGE_DATA_DIR || 'data',
    // 搜索结果文件
    searchResultsFile: 'search_results.json',
    // Cookie目录
    cookiesDir: 'cookies',
    // 备份目录
    backupDir: 'backups',
    // 备份保留数量
    backupRetention: parseInt(process.env.STORAGE_BACKUP_RETENTION) || 10,
    // 清理历史天数
    cleanupDays: parseInt(process.env.STORAGE_CLEANUP_DAYS) || 7,
  },

  // ==================== 日志配置 ====================
  logging: {
    // 日志级别: trace, debug, info, warn, error
    level: process.env.LOG_LEVEL || 'info',
    // 日志目录
    logDir: 'logs',
    // 日志文件保留天数
    retentionDays: parseInt(process.env.LOG_RETENTION_DAYS) || 30,
  },

  // ==================== AI 服务配置 ====================
  ai: {
    // API密钥
    apiKey: process.env.ALIBABA_CLOUD_API_KEY,
    // 模型名称
    model: process.env.AI_MODEL || 'qwen-plus',
    // API基础URL
    baseURL: process.env.AI_BASE_URL || 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    // 请求超时
    timeout: parseInt(process.env.AI_TIMEOUT) || 30000,
  },

  // ==================== 限流配置 ====================
  rateLimit: {
    // 每分钟最大请求数
    maxRequestsPerMinute: parseInt(process.env.RATE_LIMIT_MAX) || 30,
    // 窗口大小（毫秒）
    windowMs: 60000,
    // 搜索限流
    search: {
      maxRequestsPerMinute: parseInt(process.env.RATE_LIMIT_SEARCH) || 10,
    },
    // 发布限流
    publish: {
      maxRequestsPerMinute: parseInt(process.env.RATE_LIMIT_PUBLISH) || 5,
    },
  },
};

// 验证必需的配置
function validateConfig() {
  const errors = [];

  // 检查AI配置
  if (!config.ai.apiKey) {
    errors.push('缺少 ALIBABA_CLOUD_API_KEY 环境变量');
  }

  // 检查超时配置
  if (config.xianyu.timeout < 5000) {
    errors.push('XIANYU_TIMEOUT 至少需要 5000 毫秒');
  }

  // 检查重试配置
  if (config.crawler.retryAttempts < 1 || config.crawler.retryAttempts > 10) {
    errors.push('CRAWLER_RETRY 应在 1-10 之间');
  }

  return errors;
}

// 初始化配置验证
const validationErrors = validateConfig();
if (validationErrors.length > 0) {
  console.warn('⚠️ 配置验证警告:');
  validationErrors.forEach(err => console.warn(`  - ${err}`));
}

// 导出配置（添加 getter 支持）
export default new Proxy(config, {
  get(target, prop) {
    if (prop in target) {
      return target[prop];
    }
    console.warn(`⚠️ 尝试访问不存在的配置项: ${prop}`);
    return undefined;
  }
});

// 导出验证函数
export { validateConfig, config as defaultConfig };