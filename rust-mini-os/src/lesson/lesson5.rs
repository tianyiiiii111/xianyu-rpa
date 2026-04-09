//! 第五课：Trait 和泛型
//! 
//! Rust 的多态 - 编译时分发

use std::fmt;

/// 运行 Trait 和泛型演示
pub fn trait_demo() {
    println!("┌─────────────────────────────────────────────────────┐");
    println!("│  🦀 第五课：Trait 和泛型 - 多态                     │");
    println!("└─────────────────────────────────────────────────────┘");
    println!();
    
    println!("📝 1. 定义 Trait:");
    println!("   trait Summary {{ fn summarize(&self) -> String; }}");
    
    println!();
    println!("📝 2. 实现 Trait:");
    let article = NewsArticle {
        headline: String::from("Rust 2024 发布"),
        location: String::from("全球"),
        author: String::from("Rust 团队"),
    };
    println!("   {}", article.summarize());
    
    println!();
    println!("📝 3. 泛型函数:");
    let numbers = vec![1, 2, 3, 4, 5];
    let strings = vec!["a", "b", "c"];
    println!("   最大数: {:?}", largest(&numbers));
    println!("   最大字符串: {:?}", largest(&strings));
    
    println!();
    println!("💡 Rust 知识点:");
    println!("   • Trait 定义行为接口");
    println!("   • 泛型避免重复代码");
    println!("   • Trait bound 约束泛型类型");
    println!("   • 静态分发，无运行时开销");
    
    println!();
    println!("✅ 第五课完成！");
}

// ============================================================================
// 示例代码
// ============================================================================

/// 新闻文章
struct NewsArticle {
    headline: String,
    location: String,
    author: String,
}

/// Summary trait
trait Summary {
    fn summarize(&self) -> String;
}

impl Summary for NewsArticle {
    fn summarize(&self) -> String {
        format!("{}, by {} ({})", self.headline, self.author, self.location)
    }
}

/// 找到最大值
fn largest<T: PartialOrd>(list: &[T]) -> Option<&T> {
    if list.is_empty() {
        return None;
    }
    let mut largest = &list[0];
    for item in list {
        if item > largest {
            largest = item;
        }
    }
    Some(largest)
}