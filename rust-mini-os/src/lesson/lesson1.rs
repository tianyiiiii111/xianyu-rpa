//! 第一课：Hello World
//! 
//! 学习 Rust 的基本输出和格式化

/// 运行 Hello World 演示
pub fn hello_world() {
    println!("┌─────────────────────────────────────────────────────┐");
    println!("│  🦀 第一课：Hello World - 基础输出                 │");
    println!("└─────────────────────────────────────────────────────┘");
    println!();
    
    // 基础输出
    println!("📝 1. 基础 println! 宏:");
    println!("   Hello, world!");
    
    println!();
    println!("📝 2. 带格式化的输出:");
    let name = "Rust 新手";
    let version = 2024;
    println!("   欢迎来到 {}, 版本 {}!", name, version);
    
    println!();
    println!("📝 3. 调试格式化 ");
    let numbers = vec![1, 2, 3, 4, 5];
    println!("   数组: {:?}", numbers);
    
    println!();
    println!("📝 4. 字符串格式化:");
    let s = format!("计算结果: {} + {} = {}", 10, 20, 10 + 20);
    println!("   {}", s);
    
    println!();
    
    // 展示 Rust 特点
    println!("💡 Rust 知识点:");
    println!("   • println! 是宏，不是函数 - 编译时展开");
    println!("   • 用于调试格式化，显示数据的内部表示");
    println!("   • format! 类似 printf 但返回 String");
    println!("   • Rust 是静态类型语言，但有类型推导");
    
    println!();
    println!("✅ 第一课完成！");
}