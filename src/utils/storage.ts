/**
 * utils/storage.ts - 存储管理
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import { config } from '../config/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '../..');

const DATA_DIR = path.join(ROOT, 'data');
const SEARCH_RESULTS_FILE = path.join(DATA_DIR, 'search-results.json');

// 确保数据目录存在
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// 文件锁
let lockAcquired = false;
let lockTimeout: ReturnType<typeof setTimeout> | null = null;

async function acquireLock(): Promise<void> {
  const start = Date.now();
  const maxWait = 5000;
  
  while (lockAcquired) {
    if (Date.now() - start > maxWait) {
      throw new Error('获取文件锁超时');
    }
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  lockAcquired = true;
  lockTimeout = setTimeout(() => {
    lockAcquired = false;
  }, 30000);
}

function releaseLock(): void {
  if (lockTimeout) {
    clearTimeout(lockTimeout);
    lockTimeout = null;
  }
  lockAcquired = false;
}

// 搜索结果接口
export interface SearchResult {
  id: string;
  keyword: string;
  accountId?: string;
  products: unknown[];
  timestamp: string;
  count: number;
}

// 读取搜索结果
export function loadSearchResults(): SearchResult[] {
  try {
    if (fs.existsSync(SEARCH_RESULTS_FILE)) {
      const data = fs.readFileSync(SEARCH_RESULTS_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('读取搜索结果失败:', error);
  }
  return [];
}

// 保存搜索结果
export function saveSearchResults(results: SearchResult[]): void {
  try {
    // 创建备份
    if (fs.existsSync(SEARCH_RESULTS_FILE)) {
      const backupFile = path.join(DATA_DIR, `search-results.backup-${Date.now()}.json`);
      fs.copyFileSync(SEARCH_RESULTS_FILE, backupFile);
      
      // 清理旧备份
      const backups = fs.readdirSync(DATA_DIR)
        .filter(f => f.startsWith('search-results.backup-'))
        .sort()
        .reverse();
      
      backups.slice(config.STORAGE_BACKUP_RETENTION).forEach(f => {
        fs.unlinkSync(path.join(DATA_DIR, f));
      });
    }
    
    fs.writeFileSync(SEARCH_RESULTS_FILE, JSON.stringify(results, null, 2));
  } catch (error) {
    console.error('保存搜索结果失败:', error);
    throw error;
  }
}

// 添加搜索结果
export function addSearchResult(result: SearchResult): void {
  const results = loadSearchResults();
  results.unshift(result);
  
  // 限制存储数量
  if (results.length > 100) {
    results.splice(100);
  }
  
  saveSearchResults(results);
}

// 获取搜索结果
export function getSearchResult(id: string): SearchResult | undefined {
  const results = loadSearchResults();
  return results.find(r => r.id === id);
}

// 获取所有搜索结果
export function getAllSearchResults(): SearchResult[] {
  return loadSearchResults();
}

// 删除搜索结果
export function deleteSearchResult(id: string): void {
  const results = loadSearchResults();
  const filtered = results.filter(r => r.id !== id);
  saveSearchResults(filtered);
}

// 保存图片
export async function saveImage(url: string, productId: string): Promise<string> {
  const response = await fetch(url);
  const buffer = Buffer.from(await response.arrayBuffer());
  
  const ext = path.extname(new URL(url).pathname) || '.jpg';
  const filename = `${productId}-${crypto.randomBytes(4).toString('hex')}${ext}`;
  const imagesDir = path.join(ROOT, 'data', 'images');
  
  if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir, { recursive: true });
  }
  
  const filepath = path.join(imagesDir, filename);
  fs.writeFileSync(filepath, buffer);
  
  return filepath;
}

// 清理旧数据
export function cleanupOldData(days = 7): void {
  try {
    const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
    const results = loadSearchResults();
    const filtered = results.filter(r => new Date(r.timestamp).getTime() > cutoff);
    saveSearchResults(filtered);
  } catch (error) {
    console.error('清理旧数据失败:', error);
  }
}

export default {
  loadSearchResults,
  saveSearchResults,
  addSearchResult,
  getSearchResult,
  getAllSearchResults,
  deleteSearchResult,
  saveImage,
  cleanupOldData
};