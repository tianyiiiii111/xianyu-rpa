# Xianyu RPA

闲鱼 RPA 自动化工具，用于批量采集、编辑和发布商品。

## 功能特性

- **批量采集**：自动搜索并采集商品信息
- **商品编辑**：批量编辑采集的商品信息
- **批量发布**：自动发布商品到闲鱼平台
- **智能分类**：自动选择合适的商品分类
- **图片处理**：支持网络图片和本地图片上传
- **数据存储**：本地存储搜索结果和商品信息

## 技术栈

- **Node.js**：运行环境
- **Playwright**：浏览器自动化
- **Express**：API 服务器
- **JavaScript**：主要开发语言

## 安装步骤

1. **克隆仓库**：
   ```bash
   git clone https://github.com/tianyiiiii111/xianyu-rpa.git
   cd xianyu-rpa
   ```

2. **安装依赖**：
   ```bash
   npm install
   ```

3. **启动服务**：
   ```bash
   # 启动后端 API 服务
   npm run server
   
   # 启动前端（如果有）
   npm run client
   ```

## 使用方法

### 1. 搜索商品

```bash
# 使用 API 搜索商品
curl -X POST http://localhost:3001/search \
  -H "Content-Type: application/json" \
  -d '{"keyword": "AI", "accountId": "account1"}'
```

### 2. 编辑商品

```bash
# 编辑商品信息
curl -X PUT http://localhost:3001/search/:searchId/product/:productId \
  -H "Content-Type: application/json" \
  -d '{"price": 99.99, "description": "全新商品"}'
```

### 3. 批量发布

```bash
# 批量发布商品
curl -X POST http://localhost:3001/publish/batch \
  -H "Content-Type: application/json" \
  -d '{"resultsId": "search_123456_AI", "accountId": "account1"}'
```

## 项目结构
