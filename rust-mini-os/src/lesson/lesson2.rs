//! 第二课：所有权系统

pub fn ownership_demo() {
    println!("┌─────────────────────────────────────────────────────┐");
    println!("│  🦀 第二课：所有权系统 - 内存安全                 │");
    println!("└─────────────────────────────────────────────────────┘");
    println!();
    
    println!("📝 1. 所有权规则:");
    println!("   • 每个值有且只有一个所有者");
    println!("   • 当所有者离开作用域，值被自动释放");
    
    println!();
    println!("📝 2. 移动语义:");
    let s1 = String::from("hello");
    let s2 = s1;
    println!("   s2 = {}", s2);
    
    println!();
    println!("📝 3. 复制类型:");
    let x = 5;
    let y = x;
    println!("   x = {}, y = {}", x, y);
    
    println!();
    println!("💡 Rust 知识点:");
    println!("   • 栈 vs 堆：复制类型在栈上");
    println!("   • Drop trait：自定义析构逻辑");
    println!("   • 内存安全：无空指针，无数据竞争");
    
    println!();
    println!("✅ 第二课完成！");
}