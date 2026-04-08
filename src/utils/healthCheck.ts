/**
 * utils/healthCheck.ts - 健康检查
 */

import { config } from '../config/index.js';
import type { HealthCheckResult } from '../types/index.js';

/**
 * 执行健康检查
 */
export async function performHealthCheck(): Promise<HealthCheckResult> {
  const checks: HealthCheckResult['checks'] = [];
  
  // 检查Node.js版本
  const nodeVersion = process.version;
  checks.push({
    name: 'node-version',
    status: nodeVersion >= 'v18' ? 'pass' : 'warn',
    message: `Node.js ${nodeVersion}`
  });
  
  // 检查环境变量
  if (config.ALIBABA_CLOUD_API_KEY) {
    checks.push({ name: 'api-key', status: 'pass', message: '已配置' });
  } else {
    checks.push({ name: 'api-key', status: 'warn', message: '未配置API Key' });
  }
  
  // 检查目录存在
  const dirs = ['./cookies', './data', './logs'];
  for (const dir of dirs) {
    try {
      const { existsSync } = await import('fs');
      const exists = existsSync(dir);
      checks.push({ name: `dir-${dir}`, status: exists ? 'pass' : 'warn', message: exists ? '存在' : '不存在' });
    } catch {
      checks.push({ name: `dir-${dir}`, status: 'warn', message: '检查失败' });
    }
  }
  
  // 检查端口可用
  try {
    const net = await import('net');
    const portAvailable = await new Promise<boolean>(resolve => {
      const server = net.createServer();
      server.once('error', () => resolve(false));
      server.once('listening', () => { server.close(); resolve(true); });
      server.listen(0);
    });
    checks.push({ name: 'port', status: portAvailable ? 'pass' : 'fail', message: portAvailable ? `端口${config.PORT}可用` : '端口被占用' });
  } catch {
    checks.push({ name: 'port', status: 'warn', message: '检查失败' });
  }
  
  const ok = !checks.some(c => c.status === 'fail');
  
  return {
    ok,
    checks,
    timestamp: new Date().toISOString()
  };
}

// 默认健康检查
export const healthCheck = performHealthCheck;

export default { performHealthCheck, healthCheck };