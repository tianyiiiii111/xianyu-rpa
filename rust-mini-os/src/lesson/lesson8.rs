//! 第八课：智能指针

pub fn smart_pointer_demo() {
    println!("┌─────────────────────────────────────────────────────┐");
    println!("│  🦀 第八课：智能指针 - RAII 和 Drop             │");
    println!("└─────────────────────────────────────────────────────┘");
    println!();
    
    println!("📝 1. Box<T>:");
    println!("   let boxed = Box::new(42);");
    
    println!();
    println!("📝 2. Rc<T>:");
    println!("   let shared = Rc::new(data);");
    
    println!();
    println!("💡 Rust 知识点:");
    println!("   • 堆分配：Box<T>");
    println!("   • 引用计数：Rc<T>");
    println!("   • Drop trait：自定义析构");
    
    println!();
    println!("✅ 第八课完成！");
}