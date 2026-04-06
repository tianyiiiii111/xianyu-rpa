/**
 * storage.js - 存储操作工具
 * 
 * 功能：
 * 1. 管理商品数据存储
 * 2. 管理搜索结果存储
 * 3. 提供数据统计功能
 * 
 * 注释说明：
 * - 本文件是存储操作的工具模块，提供数据存储和管理功能
 * - 代码中添加了详细的注释，确保小白能理解
 * - 使用本地文件系统进行存储
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..', '..');
const DATA_DIR = path.join(ROOT, 'data');
const SEARCH_RESULTS_FILE = path.join(DATA_DIR, 'search_results.json');

// 确保目录存在
fs.mkdirSync(DATA_DIR, { recursive: true });

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
    try {
      fs.writeFileSync(SEARCH_RESULTS_FILE, JSON.stringify(data, null, 2));
    } catch (error) {
      console.error('写入搜索结果失败:', error);
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
    const allSearchResults = this.readSearchResults();
    if (allSearchResults[searchId]) {
      delete allSearchResults[searchId];
      this.writeSearchResults(allSearchResults);
      return true;
    }
    return false;
  }

  /**
   * 清理搜索历史
   * @param {number} days - 保留天数
   * @returns {number} 删除的搜索记录数量
   */
  static cleanupSearchHistory(days = 7) {
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
      this.writeSearchResults(allSearchResults);
    }
    
    return deletedCount;
  }
  
}