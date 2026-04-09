//! 第八课：智能指针
//! 
//! Box, Rc, RefCell - 堆分配和引用计数

use std::rc::Rc;
use std::cell::RefCell;

/// 运行智能指针演示
pub fn smart_pointer_demo() {
    println!("┌─────────────────────────────────────────────────────┐");
    println!("│  🦀 第八课：智能指针 - RAII 和 Drop                │");
    println!("└─────────────────────────────────────────────────────┘");
    println!();
    
    println!("📝 1. Box<T> - 堆分配:");
    let boxed = Box::new(42);
    println!("   Box<i32> = {}", boxed);
    println!("   解引用: {}", *boxed);
    // 离开作用域自动释放
    
    println!();
    println!("📝 2. Rc<T> - 引用计数:");
    let data = Rc::new(String::from("shared data"));
    println!("   初始 Rc 计数: {}", Rc::strong_count(&data));
    
    let clone1 = Rc::clone(&data);
    println!("   克隆后计数: {}", Rc::strong_count(&data));
    
    let clone2 = Rc::clone(&data);
    println!("   再次克隆: {}", Rc::strong_count(&data));
    
    println!("   值: {}", data);
    println!("   所有者和: {}", clone1);
    
    println!();
    println!("📝 3. RefCell<T> - 运行时借用:");
    let value = RefCell::new(5);
    println!("   原始值: {}", value.borrow());
    
    *value.borrow_mut() += 10;
    println!("   修改后: {}", value.borrow());
    
    println!();
    println!("📝 4. 自定义智能指针 - 演示 Drop:");
    let _custom = CustomPointer::new("资源");
    println!("   创建了自定义指针");
    println!("   作用域结束时自动调用 drop");
    
    println!();
    println!("💡 Rust 知识点:");
    println!("   • Box<T>: 堆分配，零成本抽象");
    println!("   • Rc<T>: 引用计数，多重所有权");
    println!("   • RefCell<T>: 运行时借用检查");
    println!("   • Drop trait: 自定义析构逻辑");
    println!("   • RAII: 资源获取即初始化");
    
    println!();
    println!("✅ 第八课完成！");
}

/// 自定义智能指针 - 演示 Drop
struct CustomPointer {
    data: String,
}

impl CustomPointer {
    fn new(data: &str) -> Self {
        println!("   [Drop] 分配: {}", data);
        Self { data: data.to_string() }
    }
}

impl Drop for CustomPointer {
    fn drop(&mut self) {
        println!("   [Drop] 释放: {}", self.data);
    }
}