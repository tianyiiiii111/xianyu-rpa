//! 第三课：借用和生命周期
//! 
//! 引用安全的核心 - 借用检查器

/// 运行借用和生命周期演示
pub fn borrowing_demo() {
    println!("┌─────────────────────────────────────────────────────┐");
    println!("│  🦀 第三课：借用和生命周期 - 引用安全               │");
    println!("└─────────────────────────────────────────────────────┘");
    println!();
    
    println!("📝 1. 不可变引用（借用）:");
    let s1 = String::from("hello");
    let len = calculate_length_ref(&s1);  // 借用 s1
    println!("   s1 = \"{}\", 长度 = {}", s1, len);  // s1 仍然有效
    
    println!();
    println!("📝 2. 可变引用:");
    let mut s2 = String::from("hello");
    modify_string(&mut s2);
    println!("   修改后: s2 = \"{}\"", s2);
    
    println!();
    println!("📝 3. 借用规则（数据竞争预防）:");
    println!("   • 只能有一个可变引用 OR 多个不可变引用");
    println!("   • 引用必须始终有效");
    
    println!();
    println!("📝 4. 生命周期演示（悬垂引用预防）:");
    let string1 = String::from("long string");
    let result = longest(&string1, "short");
    println!("   最长的: \"{}\"", result);
    
    println!();
    println!("💡 Rust 知识点:");
    println!("   • &T 是不可变引用，&mut T 是可变引用");
    println!("   • 借用检查器在编译时防止数据竞争");
    println!("   • 生命周期标记 'a 帮助编译器理解引用有效期");
    println!("   • 大多数情况生命周期可省略（生命周期推导）");
    
    println!();
    println!("✅ 第三课完成！");
}

/// 计算长度（不可变借用）
fn calculate_length_ref(s: &String) -> usize {
    s.len()
}

/// 修改字符串（可变借用）
fn modify_string(s: &mut String) {
    s.push_str(", world");
}

/// 返回最长字符串（需要生命周期标注）
fn longest<'a>(x: &'a str, y: &'a str) -> &'a str {
    if x.len() > y.len() {
        x
    } else {
        y
    }
}