//! Kernel module - 模拟操作系统内核
//! 
//! 展示如何在用户态模拟操作系统的核心概念

pub mod memory;
pub mod process;
pub mod filesystem;

/// 内核状态
pub struct Kernel {
    pub memory: memory::MemoryManager,
    pub process: process::ProcessManager,
    pub fs: filesystem::FileSystem,
}

impl Kernel {
    /// 创建新内核
    pub fn new() -> Self {
        Self {
            memory: memory::MemoryManager::new(),
            process: process::ProcessManager::new(),
            fs: filesystem::FileSystem::new(),
        }
    }
    
    /// 启动内核
    pub fn boot(&self) {
        println!("[Kernel] Booting OS...");
        println!("[Kernel] Memory initialized: {} bytes", self.memory.total());
        println!("[Kernel] Process manager ready");
        println!("[Kernel] File system mounted");
        println!("[Kernel] ✅ Kernel booted successfully!");
    }
}

impl Default for Kernel {
    fn default() -> Self {
        Self::new()
    }
}