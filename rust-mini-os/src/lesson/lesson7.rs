//! 第七课：错误处理

pub fn error_handling_demo() {
    println!("┌─────────────────────────────────────────────────────┐");
    println!("│  🦀 第七课：错误处理 - Result 和 Option         │");
    println!("└─────────────────────────────────────────────────────┘");
    println!();
    
    println!("📝 1. Result<T, E>:");
    println!("   Ok(42) 或 Err(\"error message\")");
    
    println!();
    println!("📝 2. ? 操作符:");
    println!("   let value = maybe_error?;");
    
    println!();
    println!("💡 Rust 知识点:");
    println!("   • 错误是值，不是异常");
    println!("   • 编译时强制处理错误");
    
    println!();
    println!("✅ 第七课完成！");
}