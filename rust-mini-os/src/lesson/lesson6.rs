//! 第六课：并发安全
//! 
//! Rust 的并发哲学 - 无数据竞争

use std::sync::{Arc, Mutex};
use std::thread;
use std::time::Duration;

/// 运行并发安全演示
pub fn concurrency_demo() {
    println!("┌─────────────────────────────────────────────────────┐");
    println!("│  🦀 第六课：并发安全 - 无数据竞争                   │");
    println!("└─────────────────────────────────────────────────────┘");
    println!();
    
    println!("📝 1. 线程创建:");
    let handle = thread::spawn(|| {
        println!("   子线程: 你好 from Rust!");
    });
    handle.join().unwrap();
    println!("   主线程: 子线程已完成");
    
    println!();
    println!("📝 2. 共享状态 - Arc<Mutex<T>>:");
    let counter = Arc::new(Mutex::new(0));
    let mut handles = vec![];
    
    for _ in 0..5 {
        let counter = Arc::clone(&counter);
        let handle = thread::spawn(move || {
            let mut num = counter.lock().unwrap();
            *num += 1;
        });
        handles.push(handle);
    }
    
    for handle in handles {
        handle.join().unwrap();
    }
    
    println!("   最终计数: {}", *counter.lock().unwrap());
    
    println!();
    println!("📝 3. 消息传递 - Channel:");
    use std::sync::mpsc;
    let (tx, rx) = mpsc::channel();
    
    thread::spawn(move || {
        tx.send("Hello from thread!").unwrap();
    });
    
    let received = rx.recv().unwrap();
    println!("   收到: {}", received);
    
    println!();
    println!("💡 Rust 知识点:");
    println!("   • Arc: 原子引用计数，多线程共享");
    println!("   • Mutex: 互斥锁，保护共享数据");
    println!("   • Channel: 消息传递，无共享");
    println!("   • 编译时防止数据竞争！");
    println!("   • Send + Sync trait 标记线程安全类型");
    
    println!();
    println!("✅ 第六课完成！");
}