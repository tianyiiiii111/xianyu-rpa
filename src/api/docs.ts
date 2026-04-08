/**
 * api/docs.ts - Swagger API文档
 */

import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: '闲鱼RPA API',
      version: '1.0.0',
      description: '闲鱼自动化工具 REST API',
      contact: {
        name: 'API Support'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: '本地开发服务器'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    },
    security: [{
      bearerAuth: []
    }]
  },
  apis: ['./src/api/*.ts', './src/api/*.js']
};

const specs = swaggerJsdoc(swaggerOptions);

/**
 * 设置Swagger文档
 */
export function setupSwagger(app: Express): void {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: '闲鱼RPA API文档'
  }));
  
  // JSON格式的API文档
  app.get('/api-docs.json', (_req, res) => {
    res.json(specs);
  });
  
  console.log('📚 Swagger文档已启用: http://localhost:3000/api-docs');
}

export default { setupSwagger };