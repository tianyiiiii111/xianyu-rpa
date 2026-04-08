# 闲鱼RPA - Docker配置

## 目录结构
```
xianyu-rpa/
├── Dockerfile          # 应用镜像
├── docker-compose.yml  # 编排配置
├── .dockerignore       # 忽略文件
└── nginx/
    └── reverse.conf    # 反向代理配置（可选）
```

---

## Dockerfile

```dockerfile
# 构建阶段
FROM node:20-alpine AS builder

WORKDIR /app

# 安装依赖
COPY package*.json ./
RUN npm ci --only=production

# 复制源码
COPY . .

# 安装Playwright浏览器
RUN npx playwright install --with-deps chromium

# 生产阶段
FROM node:20-alpine

WORKDIR /app

# 创建非root用户
RUN addgroup -g 1001 -S appgroup && \
    adduser -u 1001 -S appuser -G appgroup

# 复制构建文件
COPY --from=builder --chown=appuser:appgroup /app/node_modules ./node_modules
COPY --from=builder --chown=appuser:appgroup /app ./

# 安装Playwright运行时
COPY --from=builder /ms-playwright /ms-playwright

ENV PLAYWRIGHT_BROWSERS_PATH=/ms-playwright

# 切换用户
USER appuser

# 暴露端口
EXPOSE 3000

# 启动命令
CMD ["node", "src/api/server.js"]
```

---

## docker-compose.yml

```yaml
version: '3.8'

services:
  # Redis 服务
  redis:
    image: redis:7-alpine
    container_name: xianyu-redis
    restart: unless-stopped
    ports:
      - "6379:6379"
    volumes:
      - redis-data:/data
    command: redis-server --appendonly yes
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  # 主应用
  app:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: xianyu-rpa
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      # 必需的环境变量
      - ALIBABA_CLOUD_API_KEY=${ALIBABA_CLOUD_API_KEY}
      
      # Redis配置
      - REDIS_HOST=redis
      - REDIS_PORT=6379
      
      # 日志配置
      - LOG_LEVEL=info
      
      # 爬虫配置
      - CRAWLER_HEADLESS=true
      - CRAWLER_MAX_PRODUCTS=20
    volumes:
      - ./cookies:/app/cookies
      - ./data:/app/data
      - ./logs:/app/logs
      - ./screenshots:/app/screenshots
    depends_on:
      redis:
        condition: service_healthy
    networks:
      - xianyu-network

  # 可选：Watchtower自动更新
  # watchtower:
  #   image: containrrr/watchtower
  #   container_name: xianyu-watchtower
  #   restart: unless-stopped
  #   environment:
  #     - WATCHTOWER_SCHEDULE=0 0 4 * * *
  #     - WATCHTOWER_CLEANUP=true
  #   volumes:
  #     - /var/run/docker.sock:/var/run/docker.sock

volumes:
  redis-data:
    driver: local

networks:
  xianyu-network:
    driver: bridge
```

---

## .dockerignore

```
# 依赖
node_modules
npm-debug.log

# 开发文件
.git
.gitignore
*.md
test.js

# IDE
.vscode
.idea

# 环境文件
.env
.env.local
.env.*.local

# 临时文件
*.log
*.tmp
.DS_Store
```

---

## 使用说明

### 1. 准备环境变量文件

创建 `.env` 文件：

```bash
# 必需
ALIBABA_CLOUD_API_KEY=your-api-key-here

# 可选配置
LOG_LEVEL=info
CRAWLER_HEADLESS=true
```

### 2. 启动服务

```bash
# 首次构建并启动
docker-compose up -d

# 查看日志
docker-compose logs -f app

# 停止服务
docker-compose down

# 重建并启动（代码变更后）
docker-compose up -d --build
```

### 3. 验证运行

```bash
# 检查容器状态
docker-compose ps

# 检查健康状态
curl http://localhost:3000/api/health

# 查看日志
docker-compose logs --tail=50 app
```

---

## 目录权限

首次运行后，Docker会自动创建以下目录：

- `cookies/` - 浏览器Cookie存储
- `data/` - 搜索结果数据
- `logs/` - 日志文件
- `screenshots/` - 调试截图

确保这些目录在宿主机上有正确的权限：

```bash
mkdir -p cookies data logs screenshots
chmod -R 777 cookies data logs screenshots
```

---

## 扩展：添加Nginx反向代理

如需HTTPS和域名支持，可添加nginx配置。

详见 `nginx/reverse.conf`