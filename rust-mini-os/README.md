# 🦀 Rust Mini OS - 新手教学操作系统

一个用 Rust 编写的极简操作系统，用于教学目的。展示 Rust 的独特特性如何应用于操作系统开发。

## 🌟 核心特性

本项目展示 Rust 在操作系统开发中的独特优势：

### 1. 内存安全 (Memory Safety)
- **无 GC**: Rust 的所有权系统自动管理内存
- **无空指针**: Option 类型替代 null
- **无悬垂引用**: 借用检查器保证引用有效性

### 2. 零成本抽象 (Zero-Cost Abstractions)
- 高层 API 编译为高效机器码
- 内联优化，无额外开销
- 模式匹配编译为跳转表

### 3. 并发安全 (Concurrency Safety)
- 数据竞争在编译时防止
- Arc/RwLock 安全的共享状态
- 无锁数据结构

### 4. 错误处理 (Error Handling)
- Result 类型显式错误传播
- `?` 操作符简化错误处理
- 编译时检查所有错误路径

## 📚 学习路线

```
src/
├── main.rs          # 主程序入口
├── kernel/
│   ├── mod.rs       # 内核模块
│   ├── memory.rs    # 内存管理
│   ├── process.rs   # 进程管理
│   └── filesystem.rs # 文件系统
└── lesson/
    ├── lesson1.rs   # 第一课：你好世界
    ├── lesson2.rs   # 第二课：内存管理
    └── lesson3.rs   # 第三课：进程
```

## 🚀 快速开始

```bash
# 克隆项目
cd rust-mini-os

# 运行演示
cargo run --release

# 运行特定课程
cargo run --example lesson1
```

## 📖 课程内容

### 第一课：你好世界
学习 Rust 基本语法和输出。

### 第二课：内存管理
理解所有权、借用和生命周期。

### 第三课：进程管理
学习并发和线程。

### 第四课：文件系统
实现简单文件操作。

## 🔧 技术栈

- **语言**: Rust 2024
- **特性**: no_std, alloc, async
- **目标**: 教育演示

## 📝 练习

每课结束后尝试：
1. 修改代码实现新功能
2. 添加测试验证行为
3. 重构代码应用最佳实践