/**
 * docs.js - API文档 (Swagger/OpenAPI)
 * 
 * 功能：
 * 1. 自动生成OpenAPI 3.0规范
 * 2. 提供Swagger UI访问
 * 3. API端点文档
 */

import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: '闲鱼RPA API',
      version: '1.0.0',
      description: `
闲鱼自动化工具后端API，提供商品搜索、批量发布等功能。

## 认证
当前版本无需认证，后续版本可能需要API Key。

## 错误处理
所有错误响应格式如下：
\`\`\`json
{
  "success": false,
  "error": {
    "name": "ErrorName",
    "code": "ERROR_CODE",
    "message": "错误描述",
    "timestamp": "2024-01-01T00:00:00.000Z"
  }
}
\`\`\`
      `,
      contact: {
        name: 'API Support',
        url: 'https://github.com/tianyiiiii111/xianyu-rpa'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: '本地开发服务器'
      },
      {
        url: 'https://your-domain.com',
        description: '生产服务器'
      }
    ],
    tags: [
      { name: '基础', description: '基础API' },
      { name: '搜索', description: '商品搜索相关' },
      { name: '发布', description: '商品发布相关' },
      { name: '系统', description: '系统健康检查' }
    ],
    paths: {
      '/': {
        get: {
          tags: ['基础'],
          summary: 'API信息',
          description: '返回API基本信息和支持的端点',
          responses: {
            '200': {
              description: '成功',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      name: { type: 'string' },
                      version: { type: 'string' },
                      status: { type: 'string' },
                      endpoints: { type: 'object' }
                    }
                  }
                }
              }
            }
          }
        }
      },
      '/api/health': {
        get: {
          tags: ['系统'],
          summary: '健康检查',
          description: '检查系统环境、依赖服务状态',
          responses: {
            '200': {
              description: '成功',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      ok: { type: 'boolean' },
                      issues: { type: 'array' }
                    }
                  }
                }
              }
            }
          }
        }
      },
      '/api/search': {
        post: {
          tags: ['搜索'],
          summary: '搜索商品',
          description: '根据关键词搜索闲鱼商品',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['keyword'],
                  properties: {
                    keyword: {
                      type: 'string',
                      description: '搜索关键词',
                      example: 'iPhone 14'
                    },
                    accountId: {
                      type: 'string',
                      description: '账号ID（可选）',
                      example: 'huazhongkandianyingdehaitunsha'
                    }
                  }
                }
              }
            }
          },
          responses: {
            '200': {
              description: '成功',
              content: {
                'application/json': {
                  example: {
                    success: true,
                    data: {
                      products: [],
                      searchId: 'search_1234567890_keyword'
                    }
                  }
                }
              }
            },
            '400': {
              description: '参数错误'
            }
          }
        }
      },
      '/api/history': {
        get: {
          tags: ['搜索'],
          summary: '搜索历史',
          description: '获取所有搜索历史记录',
          responses: {
            '200': {
              description: '成功',
              content: {
                'application/json': {
                  schema: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        id: { type: 'string' },
                        keyword: { type: 'string' },
                        accountId: { type: 'string' },
                        productCount: { type: 'number' },
                        timestamp: { type: 'string' }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      '/api/publish': {
        post: {
          tags: ['发布'],
          summary: '批量发布',
          description: '批量发布搜索结果中的商品',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['searchId'],
                  properties: {
                    searchId: {
                      type: 'string',
                      description: '搜索结果ID',
                      example: 'search_1234567890_keyword'
                    },
                    accountId: {
                      type: 'string',
                      description: '账号ID（可选）'
                    }
                  }
                }
              }
            }
          },
          responses: {
            '200': {
              description: '成功',
              content: {
                'application/json': {
                  example: {
                    success: true,
                    data: [],
                    summary: {
                      total: 10,
                      success: 8,
                      failed: 2
                    }
                  }
                }
              }
            }
          }
        }
      },
      '/api/publish/single': {
        post: {
          tags: ['发布'],
          summary: '发布单个商品',
          description: '发布单个商品到闲鱼',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['product'],
                  properties: {
                    product: {
                      type: 'object',
                      description: '商品数据',
                      properties: {
                        price: { type: 'number', description: '售价' },
                        originalPrice: { type: 'number', description: '原价' },
                        description: { type: 'string', description: '商品描述' },
                        images: {
                          type: 'array',
                          items: { type: 'string' },
                          description: '图片URL数组'
                        }
                      }
                    },
                    accountId: { type: 'string', description: '账号ID' }
                  }
                }
              }
            }
          },
          responses: {
            '200': {
              description: '成功'
            }
          }
        }
      },
      '/api/results/{searchId}': {
        get: {
          tags: ['搜索'],
          summary: '获取搜索结果',
          description: '获取指定搜索的结果详情',
          parameters: [
            {
              name: 'searchId',
              in: 'path',
              required: true,
              schema: { type: 'string' },
              description: '搜索结果ID'
            }
          ],
          responses: {
            '200': {
              description: '成功'
            },
            '404': {
              description: '搜索结果不存在'
            }
          }
        },
        delete: {
          tags: ['搜索'],
          summary: '删除搜索结果',
          description: '删除指定的搜索结果',
          parameters: [
            {
              name: 'searchId',
              in: 'path',
              required: true,
              schema: { type: 'string' }
            }
          ],
          responses: {
            '200': {
              description: '成功'
            }
          }
        }
      }
    },
    components: {
      schemas: {
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            error: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                code: { type: 'string' },
                message: { type: 'string' },
                timestamp: { type: 'string' }
              }
            }
          }
        }
      }
    }
  },
  apis: ['./src/api/*.js']
};

// 生成OpenAPI规范
export const specs = swaggerJsdoc(options);

export default specs;