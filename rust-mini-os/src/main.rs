//! Rust Mini OS - 新手教学系统
//! 
//! 展示 Rust 核心概念

mod lesson;
mod kernel;

use std::io;

fn main() {
    println!("╔═══════════════════════════════════════════════════╗");
    println!("║         🦀 Rust Mini OS - 新手教学系统 🦀         ║");
    println!("╚═══════════════════════════════════════════════════╝");
    println!();
    
    show_menu();
}

fn show_menu() {
    loop {
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
        println!("  [0] 退出");
        println!("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        
        print!("\n🎯 选择课程: ");
        
        let mut choice = String::new();
        io::stdin().read_line(&mut choice).unwrap();
        let choice = choice.trim();
        
        println!();
        
        match choice {
            "1" => lesson::lesson1::hello_world_demo(),
            "2" => lesson::lesson2::ownership_demo(),
            "3" => lesson::lesson3::borrowing_demo(),
            "4" => lesson::lesson4::pattern_matching_demo(),
            "5" => lesson::lesson5::trait_demo(),
            "6" => lesson::lesson6::concurrency_demo(),
            "7" => lesson::lesson7::error_handling_demo(),
            "8" => lesson::lesson8::smart_pointer_demo(),
            "0" => {
                println!("👋 谢谢学习 Rust！");
                break;
            },
            _ => println!("❌ 无效选择"),
        }
        
        println!();
        println!("──────────────────────────────────────────────────");
        println!();
    }
}