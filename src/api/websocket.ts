/**
 * api/websocket.ts - WebSocket服务
 */

import { WebSocketServer, WebSocket } from 'ws';
import type { Server } from 'http';

// 客户端信息
interface Client {
  id: string;
  socket: WebSocket;
  ip: string;
  subscriptions: Set<string>;
  connectedAt: number;
}

// 消息类型
interface WSMessage {
  type: string;
  data?: unknown;
  timestamp?: number;
}

// 存储活跃客户端
const clients = new Map<string, Client>();

/**
 * 创建客户端ID
 */
function createClientId(): string {
  return `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * 发送JSON消息
 */
function sendJSON(socket: WebSocket, message: WSMessage): void {
  if (socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify({
      ...message,
      timestamp: message.timestamp || Date.now()
    }));
  }
}

/**
 * 广播消息给订阅者
 */
function broadcast(subscriptions: Set<string>, message: WSMessage): void {
  const messageStr = JSON.stringify(message);
  
  for (const client of clients.values()) {
    if (client.subscriptions.size === 0) {
      // 订阅空的客户端接收所有广播
      if (client.socket.readyState === WebSocket.OPEN) {
        client.socket.send(messageStr);
      }
    } else {
      // 检查订阅匹配
      for (const sub of subscriptions) {
        if (client.subscriptions.has(sub) && client.socket.readyState === WebSocket.OPEN) {
          client.socket.send(messageStr);
          break;
        }
      }
    }
  }
}

/**
 * 处理客户端消息
 */
function handleMessage(client: Client, message: WSMessage): void {
  const { type, data } = message;
  
  switch (type) {
    case 'subscribe':
      // 订阅频道
      if (typeof data === 'string') {
        client.subscriptions.add(data);
        sendJSON(client.socket, {
          type: 'subscribed',
          data: data
        });
      }
      break;
      
    case 'unsubscribe':
      // 取消订阅
      if (typeof data === 'string') {
        client.subscriptions.delete(data);
        sendJSON(client.socket, {
          type: 'unsubscribed',
          data: data
        });
      }
      break;
      
    case 'ping':
      // 心跳
      sendJSON(client.socket, { type: 'pong' });
      break;
      
    default:
      console.log(`📨 收到未知消息类型: ${type}`);
  }
}

/**
 * 设置WebSocket服务
 */
export function setupWebSocket(server: Server): WebSocketServer {
  const wss = new WebSocketServer({ server, path: '/ws' });
  
  console.log('🔌 WebSocket服务已启动: ws://localhost:3000/ws');
  
  wss.on('connection', (socket, req) => {
    const clientId = createClientId();
    const ip = req.socket.remoteAddress || 'unknown';
    
    console.log(`📱 新WebSocket连接: ${clientId} (${ip})`);
    
    const client: Client = {
      id: clientId,
      socket,
      ip,
      subscriptions: new Set(),
      connectedAt: Date.now()
    };
    
    clients.set(clientId, client);
    
    // 发送欢迎消息
    sendJSON(socket, {
      type: 'connected',
      data: { clientId, timestamp: Date.now() }
    });
    
    // 处理消息
    socket.on('message', (data) => {
      try {
        const message = JSON.parse(data.toString()) as WSMessage;
        handleMessage(client, message);
      } catch (error) {
        console.error(`解析WebSocket消息失败: ${(error as Error).message}`);
      }
    });
    
    // 处理关闭
    socket.on('close', () => {
      console.log(`👋 WebSocket断开: ${clientId}`);
      clients.delete(clientId);
    });
    
    // 处理错误
    socket.on('error', (error) => {
      console.error(`WebSocket错误 [${clientId}]: ${error.message}`);
    });
  });
  
  // 定期清理断开的连接
  setInterval(() => {
    const now = Date.now();
    for (const [id, client] of clients) {
      // 移除超过1小时的连接
      if (now - client.connectedAt > 3600000) {
        client.socket.terminate();
        clients.delete(id);
      }
    }
  }, 300000); // 每5分钟检查一次
  
  // 定期广播心跳
  setInterval(() => {
    broadcast(new Set(), { type: 'heartbeat', timestamp: Date.now() });
  }, 30000); // 每30秒一次
  
  return wss;
}

/**
 * 向所有客户端广播消息
 */
export function broadcastToAll(message: WSMessage): void {
  broadcast(new Set(), message);
}

/**
 * 向特定频道发送消息
 */
export function broadcastToChannel(channel: string, message: WSMessage): void {
  broadcast(new Set([channel]), message);
}

export default { setupWebSocket, broadcastToAll, broadcastToChannel };