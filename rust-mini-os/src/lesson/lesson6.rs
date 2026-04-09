//! 第六课：并发安全

pub fn concurrency_demo() {
    println!("┌─────────────────────────────────────────────────────┐");
    println!("│  🦀 第六课：并发安全 - 无数据竞争               │");
    println!("└─────────────────────────────────────────────────────┘");
    println!();
    
    println!("📝 1. 线程创建:");
    println!("   thread::spawn(|| {{ println!(\"Hello from thread!\"); }})");
    
    println!();
    println!("📝 2. Arc 和 Mutex:");
    println!("   Arc<Mutex<T>>: 线程安全共享状态");
    
    println!();
    println!("💡 Rust 知识点:");
    println!("   • Send + Sync 标记线程安全类型");
    println!("   • 编译时防止数据竞争");
    
    println!();
    println!("✅ 第六课完成！");
}