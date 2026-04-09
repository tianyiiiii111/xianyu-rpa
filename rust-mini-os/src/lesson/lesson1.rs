//! 第一课：Hello World

pub fn hello_world_demo() {
    println!("┌─────────────────────────────────────────────────────┐");
    println!("│  🦀 第一课：Hello World - 基础输出               │");
    println!("└─────────────────────────────────────────────────────┘");
    println!();
    
    println!("📝 1. 基础 println! 宏:");
    println!("   Hello, world!");
    
    println!();
    println!("📝 2. 带格式化的输出:");
    let name = "Rust 新手";
    let version = "2024";
    println!("   欢迎来到 {}, 版本 {}!", name, version);
    
    println!();
    println!("💡 Rust 知识点:");
    println!("   • println! 是宏，不是函数 - 编译时展开");
    println!("   • Rust 是静态类型语言，但有类型推导");
    
    println!();
    println!("✅ 第一课完成！");
}