//! 第五课：Trait 和泛型

pub fn trait_demo() {
    println!("┌─────────────────────────────────────────────────────┐");
    println!("│  🦀 第五课：Trait 和泛型 - 多态                 │");
    println!("└─────────────────────────────────────────────────────┘");
    println!();
    
    println!("📝 1. Trait 定义行为:");
    println!("   trait Summary {{ fn summarize(&self) -> String; }}");
    
    println!();
    println!("📝 2. 泛型函数:");
    println!("   fn largest<T: PartialOrd>(list: &[T]) -> Option<&T>");
    
    println!();
    println!("💡 Rust 知识点:");
    println!("   • Trait 定义行为接口");
    println!("   • 泛型避免重复代码");
    println!("   • 静态分发，无运行时开销");
    
    println!();
    println!("✅ 第五课完成！");
}