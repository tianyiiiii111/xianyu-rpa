import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // 测试环境
    environment: 'node',
    
    // 全局设置
    globals: true,
    
    // 包含的测试文件
    include: [
      'tests/**/*.test.js',
      'tests/**/*.spec.js',
      '**/*.test.js',
      '**/*.spec.js'
    ],
    
    // 排除的文件
    exclude: [
      'node_modules',
      'dist',
      'build',
      'coverage'
    ],
    
    // 覆盖率配置
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules',
        'tests',
        '**/*.config.js',
        '**/*.test.js'
      ]
    },
    
    // 超时时间
    testTimeout: 10000,
    hookTimeout: 10000,
    
    // 并发数
    pool: 'forks',
    poolOptions: {
      forks: {
        singleFork: true
      }
    }
  }
});