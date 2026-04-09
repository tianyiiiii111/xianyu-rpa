//! 🦀 Rust Mini OS - 新手教学操作系统
//! 
//! 这是一个用于教学的极简操作系统演示项目
//! 展示 Rust 的独特特性如何应用于系统编程

mod kernel;
mod lesson;

use std::process;

/// 主程序入口
fn main() {
    println!("");
    println!("╔═══════════════════════════════════════════════════╗");
    println!("║         🦀 Rust Mini OS - 新手教学系统 🦀         ║");
    println!("╚═══════════════════════════════════════════════════╝");
    println!();
    
    // 显示学习菜单
    show_menu();
    
    // 运行演示
    run_demo();
}

/// 显示学习菜单
fn show_menu() {
    println!("📚 课程目录:");
    println!("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    println!("  [1] 第一课：Hello World - 基础输出");
    println!("  [2] 第二课：所有权系统 - 内存安全");
    println!("  [3] 第三课：借用和生命周期 - 引用安全");
    println!("  [4] 第四课：模式匹配 - 控制流");
    println!("  [5] 第五课：Trait 和泛型 - 多态");
    println!("  [6] 第六课：并发安全 - 无数据竞争");
    println!("  [7] 第七课：错误处理 - Result 和 Option");
    println!("  [8] 第八课：智能指针 - RAII 和 Drop");
    println!("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    println!();
}

/// 运行演示
fn run_demo() {
    // 运行第一课：Hello World
    println!("🎯 运行第一课：Hello World");
    println!("{}", "─".repeat(50));
    lesson::lesson1::hello_world();
    
    println!();
    
    // 运行第二课：所有权
    println!("🎯 运行第二课：所有权系统");
    println!("{}", "─".repeat(50));
    lesson::lesson2::ownership_demo();
    
    println!();
    
    // 运行第三课：借用
    println!("🎯 运行第三课：借用和生命周期");
    println!("{}", "─".repeat(50));
    lesson::lesson3::borrowing_demo();
    
    println!();
    
    // 运行第四课：模式匹配
    println!("🎯 运行第四课：模式匹配");
    println!("{}", "─".repeat(50));
    lesson::lesson4::pattern_matching_demo();
    
    println!();
    
    // 运行第五课：Trait
    println!("🎯 运行第五课：Trait 和泛型");
    println!("{}", "─".repeat(50));
    lesson::lesson5::trait_demo();
    
    println!();
    
    // 运行第六课：并发
    println!("🎯 运行第六课：并发安全");
    println!("{}", "─".repeat(50));
    lesson::lesson6::concurrency_demo();
    
    println!();
    
    // 运行第七课：错误处理
    println!("🎯 运行第七课：错误处理");
    println!("{}", "─".repeat(50));
    lesson::lesson7::error_handling_demo();
    
    println!();
    
    // 运行第八课：智能指针
    println!("🎯 运行第八课：智能指针");
    println!("{}", "─".repeat(50));
    lesson::lesson8::smart_pointer_demo();
    
    println!();
    println!("╔═══════════════════════════════════════════════════╗");
    println!("║           ✅ 演示完成！继续学习吧！ 🦀            ║");
    println!("╚═══════════════════════════════════════════════════╝");
}
