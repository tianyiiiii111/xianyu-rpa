/**
 * websocket.js - WebSocket实时通知服务
 * 
 * 功能：
 * 1. 实时任务状态推送
 * 2. 客户端连接管理
 * 3. 消息广播
 */

import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';

// 连接管理
const clients = new Map();

/**
 * 创建WebSocket服务器
 * @param {Server} server - HTTP服务器
 * @returns {WebSocketServer}
 */
export function createWSServer(server) {
  const wss = new WebSocketServer({ server, path: '/ws' });

  wss.on('connection', (ws, req) => {
    const clientId = generateClientId();
    const clientInfo = {
      id: clientId,
      ws,
      ip: req.socket.remoteAddress,
      connectedAt: new Date().toISOString(),
      subscriptions: new Set()
    };
    
    clients.set(clientId, clientInfo);
    
    console.log(`📡 WebSocket客户端连接: ${clientId}`);
    
    // 发送连接成功消息
    sendToClient(ws, {
      type: 'connected',
      data: {
        clientId,
        message: '连接成功'
      }
    });

    // 处理消息
    ws.on('message', (data) => {
      try {
        const message = JSON.parse(data.toString());
        handleMessage(clientId, message);
      } catch (err) {
        console.error('❌ 消息解析失败:', err.message);
      }
    });

    // 处理断开
    ws.on('close', () => {
      clients.delete(clientId);
      console.log(`📡 WebSocket客户端断开: ${clientId}`);
    });

    // 处理错误
    ws.on('error', (err) => {
      console.error(`❌ WebSocket错误 [${clientId}]:`, err.message);
    });
  });

  return wss;
}

/**
 * 处理客户端消息
 */
function handleMessage(clientId, message) {
  const client = clients.get(clientId);
  if (!client) return;

  switch (message.type) {
    case 'subscribe':
      // 订阅任务更新
      if (message.taskId) {
        client.subscriptions.add(message.taskId);
        sendToClient(client.ws, {
          type: 'subscribed',
          data: { taskId: message.taskId }
        });
      }
      break;

    case 'unsubscribe':
      // 取消订阅
      if (message.taskId) {
        client.subscriptions.delete(message.taskId);
      }
      break;

    case 'ping':
      // 心跳
      sendToClient(client.ws, { type: 'pong' });
      break;

    default:
      console.log(`未知消息类型: ${message.type}`);
  }
}

/**
 * 发送消息给单个客户端
 */
function sendToClient(ws, message) {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(message));
  }
}

/**
 * 广播消息给所有客户端
 * @param {string} type - 消息类型
 * @param {any} data - 消息数据
 */
export function broadcast(type, data) {
  const message = JSON.stringify({ type, data, timestamp: Date.now() });
  
  for (const [id, client] of clients) {
    if (client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(message);
    }
  }
}

/**
 * 发送任务状态更新
 * @param {string} taskId - 任务ID
 * @param {string} status - 状态
 * @param {any} result - 结果
 */
export function broadcastTaskUpdate(taskId, status, result = {}) {
  const message = {
    type: 'task_update',
    data: {
      taskId,
      status,
      result,
      timestamp: new Date().toISOString()
    }
  };

  // 发送给订阅该任务的客户端
  for (const [id, client] of clients) {
    if (client.subscriptions.has(taskId)) {
      sendToClient(client.ws, message);
    }
  }

  // 也广播给所有人
  broadcast('task_update', message.data);
}

/**
 * 发送搜索完成通知
 * @param {string} searchId - 搜索ID
 * @param {number} count - 结果数量
 */
export function notifySearchComplete(searchId, count) {
  broadcast('search_complete', {
    searchId,
    count,
    timestamp: new Date().toISOString()
  });
}

/**
 * 发送发布完成通知
 * @param {string} taskId - 任务ID
 * @param {Object} result - 发布结果
 */
export function notifyPublishComplete(taskId, result) {
  broadcastTaskUpdate(taskId, 'completed', result);
}

/**
 * 获取连接统计
 */
export function getStats() {
  return {
    totalConnections: clients.size,
    clients: Array.from(clients.values()).map(c => ({
      id: c.id,
      ip: c.ip,
      connectedAt: c.connectedAt,
      subscriptions: c.subscriptions.size
    }))
  };
}

/**
 * 关闭所有连接
 */
export function closeAll() {
  for (const [id, client] of clients) {
    if (client.ws.readyState === WebSocket.OPEN) {
      client.ws.close();
    }
  }
  clients.clear();
}

// 生成客户端ID
function generateClientId() {
  return `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// 心跳保活
setInterval(() => {
  for (const [id, client] of clients) {
    if (client.ws.readyState !== WebSocket.OPEN) {
      clients.delete(id);
      continue;
    }
    
    // 发送ping
    sendToClient(client.ws, { type: 'ping' });
  }
}, 30000);

export default {
  createWSServer,
  broadcast,
  broadcastTaskUpdate,
  notifySearchComplete,
  notifyPublishComplete,
  getStats,
  closeAll
};