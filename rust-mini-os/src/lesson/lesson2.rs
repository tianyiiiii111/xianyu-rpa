//! 第二课：所有权系统
//! 
//! Rust 最独特的特性 - 内存安全的核心

/// 运行所有权演示
pub fn ownership_demo() {
    println!("┌─────────────────────────────────────────────────────┐");
    println!("│  🦀 第二课：所有权系统 - 内存安全                   │");
    println!("└─────────────────────────────────────────────────────┘");
    println!();
    
    println!("📝 1. 所有权规则:");
    println!("   • 每个值有且只有一个所有者");
    println!("   • 当所有者离开作用域，值被自动释放");
    println!("   • 同一时刻只能有一个可变引用");
    
    println!();
    println!("📝 2. 演示 - 移动语义:");
    let s1 = String::from("hello");  // s1 拥有这块内存
    let s2 = s1;                      // 所有权转移给 s2
    
    // println!("{}", s1); // ❌ 错误！s1 不再有效
    println!("   s2 = {}", s2);  // ✅ 正确
    
    println!();
    println!("📝 3. 演示 - 复制类型:");
    let x = 5;        // i32 是 Copy 类型
    let y = x;        // 复制而非移动
    println!("   x = {}, y = {}", x, y);  // 两个都有效
    
    println!();
    println!("📝 4. 演示 - 函数中的所有权:");
    let text = String::from("hello world");
    let len = calculate_length(text);  // text 移动到函数中
    println!("   字符串长度: {}", len);
    // println!("{}", text); // ❌ 错误！text 已移动
    
    println!();
    println!("💡 Rust 知识点:");
    println!("   • 移动语义防止双重释放");
    println!("   • Copy 类型用于简单值（栈上）");
    println!("   • Drop trait 用于自定义清理逻辑");
    println!("   • 无 GC！内存由编译器管理");
    
    println!();
    println!("✅ 第二课完成！");
}

/// 计算字符串长度（获取所有权）
fn calculate_length(s: String) -> usize {
    s.len()
}