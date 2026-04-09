//! 第三课：借用和生命周期

pub fn borrowing_demo() {
    println!("┌─────────────────────────────────────────────────────┐");
    println!("│  🦀 第三课：借用和生命周期 - 引用安全             │");
    println!("└─────────────────────────────────────────────────────┘");
    println!();
    
    println!("📝 1. 不可变引用:");
    let s1 = String::from("hello");
    let len = s1.len();
    println!("   s1 = \"{}\", 长度 = {}", s1, len);
    
    println!();
    println!("📝 2. 可变引用:");
    let mut s2 = String::from("hello");
    s2.push_str(", world");
    println!("   s2 = \"{}\"", s2);
    
    println!();
    println!("💡 Rust 知识点:");
    println!("   • &T 是不可变引用");
    println!("   • &mut T 是可变引用");
    println!("   • 借用检查器在编译时防止数据竞争");
    
    println!();
    println!("✅ 第三课完成！");
}