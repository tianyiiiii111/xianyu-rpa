//! 第七课：错误处理
//! 
//! Result 和 Option - 显式错误处理

/// 运行错误处理演示
pub fn error_handling_demo() {
    println!("┌─────────────────────────────────────────────────────┐");
    println!("│  🦀 第七课：错误处理 - Result 和 Option            │");
    println!("└─────────────────────────────────────────────────────┘");
    println!();
    
    println!("📝 1. Result<T, E> - 可恢复错误:");
    let result: Result<i32, &str> = Ok(42);
    match result {
        Ok(value) => println!("   成功: {}", value),
        Err(e) => println!("   错误: {}", e),
    }
    
    let fail: Result<i32, &str> = Err("Something went wrong");
    if fail.is_err() {
        println!("   处理失败情况");
    }
    
    println!();
    println!("📝 2. ? 操作符 - 传播错误:");
    let result = divide(10, 2);
    match result {
        Ok(v) => println!("   10 / 2 = {}", v),
        Err(e) => println!("   错误: {}", e),
    }
    
    let result2 = divide(10, 0);
    match result2 {
        Ok(v) => println!("   10 / 0 = {}", v),
        Err(e) => println!("   错误: {}", e),
    }
    
    println!();
    println!("📝 3. Option<T> - 可能为空的值:");
    let numbers = vec![1, 2, 3];
    let first = numbers.first();
    match first {
        Some(n) => println!("   第一个元素: {}", n),
        None => println!("   空数组"),
    }
    
    let empty: Vec<i32> = vec![];
    let first_empty = empty.first();
    println!("   空数组 first: {:?}", first_empty);
    
    println!();
    println!("📝 4. 组合器 - map 和 and_then:");
    let num = Some(5);
    let doubled = num.map(|x| x * 2);
    println!("   5 * 2 = {:?}", doubled);
    
    let num2: Option<i32> = None;
    let doubled2 = num2.map(|x| x * 2);
    println!("   None * 2 = {:?}", doubled2);
    
    println!();
    println!("💡 Rust 知识点:");
    println!("   • Result<T, E> 表示可能成功或失败");
    println!("   • Option<T> 表示可能存在或不存在的值");
    println!("   • ? 操作符简化错误传播");
    println!("   • 编译时强制处理所有错误情况");
    println!("   • 无异常机制，错误是值");
    
    println!();
    println!("✅ 第七课完成！");
}

/// 除法（返回 Result）
fn divide(a: i32, b: i32) -> Result<i32, &'static str> {
    if b == 0 {
        Err("Division by zero!")
    } else {
        Ok(a / b)
    }
}