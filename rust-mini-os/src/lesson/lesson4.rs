//! 第四课：模式匹配
//! 
//! Rust 强大的控制流 - 穷尽性检查

/// 运行模式匹配演示
pub fn pattern_matching_demo() {
    println!("┌─────────────────────────────────────────────────────┐");
    println!("│  🦀 第四课：模式匹配 - 控制流                       │");
    println!("└─────────────────────────────────────────────────────┘");
    println!();
    
    println!("📝 1. match 表达式 - 穷尽匹配:");
    let number = 13;
    println!("   number = {}", number);
    match number {
        1 => println!("   → 1"),
        2 | 3 | 5 | 7 | 11 => println!("   → 质数"),
        13..=19 => println!("   → 十几岁"),
        _ => println!("   → 其他"),
    }
    
    println!();
    println!("📝 2. Option 处理 - 安全处理空值:");
    let name = find_name(1);
    match name {
        Some(n) => println!("   找到: {}", n),
        None => println!("   未找到"),
    }
    
    println!();
    println!("📝 3. 结构模式匹配:");
    let point = Point { x: 10, y: 20 };
    match point {
        Point { x: 0, y: 0 } => println!("   原点"),
        Point { x, y: 0 } => println!("   x轴: ({}, 0)", x),
        Point { x: 0, y } => println!("   y轴: (0, {})", y),
        Point { x, y } if x == y => println!("   对角线: ({}, {})", x, y),
        Point { x, y } => println!("   其他: ({}, {})", x, y),
    }
    
    println!();
    println!("📝 4. if let - 简化匹配:");
    let optional = Some(5);
    if let Some(value) = optional {
        println!("   有值: {}", value);
    }
    
    println!();
    println!("💡 Rust 知识点:");
    println!("   • match 必须穷尽所有情况");
    println!("   • _ 是通配符，匹配剩余情况");
    println!("   • 模式可以是字面量、范围、枚举、结构");
    println!("   • if let 简化单分支匹配");
    println!("   • 编译器会警告未穷尽的匹配");
    
    println!();
    println!("✅ 第四课完成！");
}

/// 查找名字
fn find_name(id: u32) -> Option<&'static str> {
    match id {
        1 => Some("Alice"),
        2 => Some("Bob"),
        _ => None,
    }
}

/// 点结构
struct Point {
    x: i32,
    y: i32,
}