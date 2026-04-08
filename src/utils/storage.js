/**
 * storage.js - 存储操作工具
 * 
 * 功能：
 * 1. 管理商品数据存储
 * 2. 管理搜索结果存储
 * 3. 提供数据统计功能
 * 
 * 特性：
 * - 文件锁机制防止并发写入冲突
 * - 自动备份机制
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..', '..');
const DATA_DIR = path.join(ROOT, 'data');
const SEARCH_RESULTS_FILE = path.join(DATA_DIR, 'search_results.json');
const LOCK_FILE = path.join(DATA_DIR, '.search_results.lock');
const BACKUP_DIR = path.join(DATA_DIR, 'backups');

// 确保目录存在
fs.mkdirSync(DATA_DIR, { recursive: true });
fs.mkdirSync(BACKUP_DIR, { recursive: true });

// 文件锁相关
let lockFd = null;

/**
 * 获取文件锁
 * @param {number} timeout - 超时时间（毫秒）
 * @returns {boolean} 是否获取成功
 */
function acquireLock(timeout = 5000) {
  const startTime = Date.now();
  while (lockFd === null) {
    try {
      lockFd = fs.openSync(LOCK_FILE, 'wx');
      return true;
    } catch (err) {
      if (err.code !== 'EEXIST') throw err;
      if (Date.now() - startTime > timeout) {
        console.warn('获取文件锁超时');
        return false;
      }
      // 等待后重试
      const waitTime = Math.floor(Math.random() * 100) + 50;
      const waitPromise = new Promise(resolve => setTimeout(resolve, waitTime));
      // 同步等待
      const end = Date.now() + waitTime;
      while (Date.now() < end) { /* busy wait for sync */ }
    }
  }
  return false;
}

/**
 * 释放文件锁
 */
function releaseLock() {
  if (lockFd !== null) {
    try {
      fs.closeSync(lockFd);
      fs.unlinkSync(LOCK_FILE);
    } catch (err) {
      console.warn('释放文件锁失败:', err.message);
    }
    lockFd = null;
  }
}

/**
 * 创建备份
 */
function createBackup() {
  try {
    if (!fs.existsSync(SEARCH_RESULTS_FILE)) return;
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFile = path.join(BACKUP_DIR, `search_results_${timestamp}.json`);
    fs.copyFileSync(SEARCH_RESULTS_FILE, backupFile);
    console.log(`  💾 已创建备份: ${backupFile}`);
    
    // 清理旧备份（保留最近10个）
    const backups = fs.readdirSync(BACKUP_DIR)
      .filter(f => f.startsWith('search_results_') && f.endsWith('.json'))
      .map(f => ({ name: f, time: fs.statSync(path.join(BACKUP_DIR, f)).mtime }))
      .sort((a, b) => b.time - a.time);
    
    if (backups.length > 10) {
      for (let i = 10; i < backups.length; i++) {
        fs.unlinkSync(path.join(BACKUP_DIR, backups[i].name));
      }
    }
  } catch (err) {
    console.warn('创建备份失败:', err.message);
  }
}

/**
 * 存储服务类
 * 说明：提供搜索结果的存储和管理功能
 */
export class StorageService {
  /**
   * 读取所有搜索结果
   * @returns {Object} 搜索结果对象
   */
  static readSearchResults() {
    try {
      if (!fs.existsSync(SEARCH_RESULTS_FILE)) {
        return {};
      }
      const data = fs.readFileSync(SEARCH_RESULTS_FILE, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      console.error('读取搜索结果失败:', error);
      return {};
    }
  }

  /**
   * 写入搜索结果
   * @param {Object} data - 搜索结果对象
   */
  static writeSearchResults(data) {
    // 获取锁
    if (!acquireLock()) {
      console.warn('无法获取文件锁，数据可能不一致');
    }
    
    try {
      // 先创建备份
      createBackup();
      fs.writeFileSync(SEARCH_RESULTS_FILE, JSON.stringify(data, null, 2));
    } catch (error) {
      console.error('写入搜索结果失败:', error);
    } finally {
      releaseLock();
    }
  }

  /**
   * 保存搜索结果
   * @param {string} searchId - 搜索ID
   * @param {Object} searchData - 搜索数据
   */
  static saveSearchResults(searchId, searchData) {
    const allSearchResults = this.readSearchResults();
    allSearchResults[searchId] = searchData;
    this.writeSearchResults(allSearchResults);
  }

  /**
   * 获取搜索历史
   * @returns {Array} 搜索历史列表
   */
  static getSearchHistory() {
    const allSearchResults = this.readSearchResults();
    return Object.entries(allSearchResults)
      .map(([id, data]) => ({
        id,
        keyword: data.keyword,
        accountId: data.accountId,
        productCount: data.products?.length || 0,
        timestamp: data.timestamp
      }))
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }

  /**
   * 获取指定搜索结果
   * @param {string} searchId - 搜索ID
   * @returns {Object} 搜索结果
   */
  static getSearchResults(searchId) {
    const allSearchResults = this.readSearchResults();
    return allSearchResults[searchId] || null;
  }

  /**
   * 删除搜索结果
   * @param {string} searchId - 搜索ID
   * @returns {boolean} 是否删除成功
   */
  static deleteSearchResults(searchId) {
    if (!acquireLock()) return false;
    
    try {
      const allSearchResults = this.readSearchResults();
      if (allSearchResults[searchId]) {
        createBackup(); // 删除前先备份
        delete allSearchResults[searchId];
        this.writeSearchResults(allSearchResults);
        return true;
      }
      return false;
    } catch (error) {
      console.error('删除搜索结果失败:', error);
      return false;
    } finally {
      releaseLock();
    }
  }

  /**
   * 清理搜索历史
   * @param {number} days - 保留天数
   * @returns {number} 删除的搜索记录数量
   */
  static cleanupSearchHistory(days = 7) {
    if (!acquireLock()) return 0;
    
    try {
      const allSearchResults = this.readSearchResults();
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);
      
      let deletedCount = 0;
      for (const [id, data] of Object.entries(allSearchResults)) {
        if (new Date(data.timestamp) < cutoffDate) {
          delete allSearchResults[id];
          deletedCount++;
        }
      }
      
      if (deletedCount > 0) {
        createBackup();
        this.writeSearchResults(allSearchResults);
      }
      
      return deletedCount;
    } catch (error) {
      console.error('清理搜索历史失败:', error);
      return 0;
    } finally {
      releaseLock();
    }
  }
  
}