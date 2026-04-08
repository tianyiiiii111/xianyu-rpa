# Xianyu RPA

闲鱼 RPA 自动化工具，使用Playwright浏览器自动化技术，用于批量采集、编辑和发布商品。

## 功能特性

- **批量采集**：自动搜索并采集商品信息
- **批量发布**：自动发布商品到闲鱼平台
- **AI违禁词检测**：自动检测商品描述是否包含违禁词
- **任务队列**：支持异步任务队列（需要Redis）
- **REST API**：提供完整的API接口
- **实时通知**：WebSocket支持任务状态实时推送

## 快速开始

### 安装

```bash
git clone https://github.com/tianyiiiii111/xianyu-rpa.git
cd xianyu-rpa
npm install
```

### 环境配置

创建 `.env` 文件：

```bash
# 必需
ALIBABA_CLOUD_API_KEY=your-api-key-here

# 可选配置
PORT=3000
LOG_LEVEL=info
CRAWLER_HEADLESS=true

# Redis（任务队列需要）
REDIS_HOST=localhost
REDIS_PORT=6379
```

### 启动

```bash
# 开发模式
npm run dev

# 生产模式
npm start

# 任务队列（需要Redis）
npm run queue

# 运行测试
npm test
```

## API文档

启动服务后访问：
- Swagger UI: http://localhost:3000/api-docs
- 健康检查: http://localhost:3000/api/health

### 主要端点

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/` | API信息 |
| GET | `/api/health` | 健康检查 |
| POST | `/api/search` | 搜索商品 |
| POST | `/api/publish` | 批量发布 |
| GET | `/api/history` | 搜索历史 |
| GET | `/api/results/:id` | 获取结果 |
| DELETE | `/api/results/:id` | 删除结果 |

## 环境变量

| 变量 | 必需 | 默认值 | 说明 |
|------|------|--------|------|
| `ALIBABA_CLOUD_API_KEY` | ✅ | - | 阿里云通义千问API Key |
| `PORT` | - | 3000 | 服务端口 |
| `LOG_LEVEL` | - | info | 日志级别 |
| `XIANYU_BASE_URL` | - | https://www.goofish.com | 闲鱼地址 |
| `CRAWLER_HEADLESS` | - | false | 浏览器无头模式 |
| `CRAWLER_MAX_PRODUCTS` | - | 20 | 最大采集数 |
| `CRAWLER_RETRY` | - | 3 | 重试次数 |
| `REDIS_HOST` | - | localhost | Redis地址 |
| `REDIS_PORT` | - | 6379 | Redis端口 |
| `RATE_LIMIT_MAX` | - | 30 | 每分钟最大请求 |
| `STORAGE_BACKUP_RETENTION` | - | 10 | 备份保留数 |

## Docker部署

```bash
# 启动所有服务
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止
docker-compose down
```

## 项目结构

```
xianyu-rpa/
├── src/
│   ├── api/           # API服务
│   │   ├── server.js       # 主服务器
│   │   ├── docs.js         # Swagger文档
│   │   └── websocket.js    # WebSocket
│   ├── config/       # 配置
│   │   └── index.js
│   ├── queue/        # 任务队列
│   ├── services/     # 业务逻辑
│   │   ├── SearchService.js
│   │   ├── PublishService.js
│   │   ├── AiServes.js
│   │   └── LoginServies.js
│   └── utils/        # 工具函数
│       ├── browser.js
│       ├── storage.js
│       ├── logger.js
│       ├── retry.js
│       ├── rateLimiter.js
│       ├── validators.js
│       ├── errors.js
│       ├── metrics.js
│       ├── healthCheck.js
│       └── security.js
├── tests/            # 测试
├── Dockerfile
├── docker-compose.yml
└── package.json
```

## 技术栈

- **Node.js 18+**: 运行环境
- **Playwright**: 浏览器自动化
- **Express**: API 服务器
- **BullMQ**: 任务队列（需要Redis）
- **Pino**: 日志系统
- **Vitest**: 单元测试
- **Docker**: 容器化

## License

MIT