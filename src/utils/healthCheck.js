/**
 * healthCheck.js - 环境检查工具
 * 
 * 功能：
 * 1. 检查必需的目录是否存在
 * 2. 检查环境变量配置
 * 3. 检查Playwright浏览器是否可用
 * 4. 检查网络连通性
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..', '..');

/**
 * 健康检查结果
 * @typedef {Object} HealthCheckResult
 * @property {boolean} ok - 是否全部通过
 * @property {Array<{type: string, message: string, severity: 'error'|'warning'}>} issues - 发现的问题
 */

/**
 * 执行环境检查
 * @returns {Promise<HealthCheckResult>}
 */
export async function healthCheck() {
  const issues = [];

  // 1. 检查目录结构
  checkDirectories(issues);

  // 2. 检查环境变量
  checkEnvironmentVariables(issues);

  // 3. 检查Playwright
  await checkPlaywright(issues);

  // 4. 检查网络
  checkNetwork(issues);

  // 5. 检查磁盘空间
  checkDiskSpace(issues);

  return {
    ok: !issues.some(i => i.severity === 'error'),
    issues
  };
}

/**
 * 检查必需目录
 */
function checkDirectories(issues) {
  const requiredDirs = [
    { name: 'cookies', path: path.join(ROOT, 'cookies'), create: true },
    { name: 'data', path: path.join(ROOT, 'data'), create: true },
    { name: 'logs', path: path.join(ROOT, 'logs'), create: true },
    { name: 'screenshots', path: path.join(ROOT, 'screenshots'), create: true },
  ];

  for (const dir of requiredDirs) {
    try {
      if (!fs.existsSync(dir.path)) {
        if (dir.create) {
          fs.mkdirSync(dir.path, { recursive: true });
          issues.push({
            type: 'directory',
            message: `📁 已创建目录: ${dir.name}`,
            severity: 'warning'
          });
        } else {
          issues.push({
            type: 'directory',
            message: `❌ 缺少目录: ${dir.name}`,
            severity: 'error'
          });
        }
      }
    } catch (err) {
      issues.push({
        type: 'directory',
        message: `❌ 目录 ${dir.name} 访问失败: ${err.message}`,
        severity: 'error'
      });
    }
  }
}

/**
 * 检查环境变量
 */
function checkEnvironmentVariables(issues) {
  const requiredVars = [
    'ALIBABA_CLOUD_API_KEY',
  ];

  const optionalVars = [
    'LOG_LEVEL',
    'XIANYU_BASE_URL',
    'CRAWLER_HEADLESS',
  ];

  // 检查必需变量
  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      issues.push({
        type: 'env',
        message: `⚠️ 缺少必需环境变量: ${varName}`,
        severity: 'error'
      });
    } else {
      // 检查变量是否有实际内容
      if (process.env[varName].trim() === '') {
        issues.push({
          type: 'env',
          message: `⚠️ 环境变量 ${varName} 为空`,
          severity: 'error'
        });
      }
    }
  }

  // 检查可选变量
  for (const varName of optionalVars) {
    if (process.env[varName]) {
      issues.push({
        type: 'env',
        message: `✅ 已配置: ${varName} = ${process.env[varName]}`,
        severity: 'warning'
      });
    }
  }
}

/**
 * 检查Playwright
 */
async function checkPlaywright(issues) {
  try {
    // 尝试加载playwright
    const playwright = await import('playwright');
    
    // 尝试启动浏览器
    const browser = await playwright.chromium.launch({
      headless: true,
      args: ['--no-sandbox']
    });
    
    await browser.close();
    
    issues.push({
      type: 'playwright',
      message: '✅ Playwright 浏览器可正常启动',
      severity: 'warning'
    });
  } catch (err) {
    issues.push({
      type: 'playwright',
      message: `❌ Playwright 检查失败: ${err.message}`,
      severity: 'error'
    });
  }
}

/**
 * 检查网络连通性
 */
function checkNetwork(issues) {
  const testUrls = [
    { name: '闲鱼', url: 'https://www.goofish.com' },
  ];

  for (const test of testUrls) {
    try {
      // 使用curl检查，更可靠
      execSync(`curl -s -o /dev/null -w "%{http_code}" --max-time 5 "${test.url}"`, {
        stdio: 'pipe',
        encoding: 'utf-8'
      });
      
      issues.push({
        type: 'network',
        message: `✅ ${test.name} 网络可达`,
        severity: 'warning'
      });
    } catch (err) {
      issues.push({
        type: 'network',
        message: `⚠️ ${test.name} 网络不可达: ${err.message}`,
        severity: 'warning'
      });
    }
  }
}

/**
 * 检查磁盘空间
 */
function checkDiskSpace(issues) {
  try {
    // 检查根目录可用空间
    const result = execSync('df -k . | tail -1 | awk \'{print $4}\'', {
      encoding: 'utf-8'
    });
    
    const availableKB = parseInt(result.trim());
    const availableMB = Math.floor(availableKB / 1024);
    
    if (availableMB < 100) {
      issues.push({
        type: 'disk',
        message: `⚠️ 磁盘空间不足: ${availableMB}MB`,
        severity: 'error'
      });
    } else if (availableMB < 500) {
      issues.push({
        type: 'disk',
        message: `⚠️ 磁盘空间较低: ${availableMB}MB`,
        severity: 'warning'
      });
    } else {
      issues.push({
        type: 'disk',
        message: `✅ 磁盘空间充足: ${availableMB}MB`,
        severity: 'warning'
      });
    }
  } catch (err) {
    // 忽略磁盘检查错误
  }
}

/**
 * 打印检查结果
 */
export function printHealthCheck(result) {
  console.log('\n🔍 === 环境检查结果 ===\n');
  
  if (result.ok) {
    console.log('✅ 所有检查通过！\n');
  } else {
    console.log('⚠️ 发现以下问题:\n');
  }
  
  for (const issue of result.issues) {
    console.log(`  ${issue.message}`);
  }
  
  console.log('');
  return result.ok;
}

export default healthCheck;