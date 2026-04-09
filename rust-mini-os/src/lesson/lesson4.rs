//! 第四课：模式匹配

pub fn pattern_matching_demo() {
    println!("┌─────────────────────────────────────────────────────┐");
    println!("│  🦀 第四课：模式匹配 - 控制流                 │");
    println!("└─────────────────────────────────────────────────────┘");
    println!();
    
    println!("📝 1. match 表达式:");
    let number = 13;
    match number {
        1 => println!("   1"),
        2 | 3 | 5 | 7 | 11 => println!("   质数"),
        13..=19 => println!("   十几岁"),
        _ => println!("   其他"),
    }
    
    println!();
    println!("💡 Rust 知识点:");
    println!("   • match 必须穷尽所有情况");
    println!("   • _ 是通配符");
    
    println!();
    println!("✅ 第四课完成！");
}