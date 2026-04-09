//! 内存管理模块
//! 
//! 展示 Rust 所有权系统如何实现安全的内存管理

/// 内存管理器
pub struct MemoryManager {
    total: usize,
    used: usize,
}

impl MemoryManager {
    /// 创建新的内存管理器
    pub fn new() -> Self {
        Self {
            total: 8_000_000, // 8MB
            used: 0,
        }
    }
    
    /// 分配内存
    pub fn allocate(&mut self, size: usize) -> Result<&'static mut [u8], &'static str> {
        if self.used + size > self.total {
            return Err("Out of memory!");
        }
        
        // 在真实 OS 中，这里会调用系统分配
        // 这里只是模拟
        self.used += size;
        println!("[Memory] Allocated {} bytes", size);
        Ok(&mut [])
    }
    
    /// 释放内存
    pub fn deallocate(&mut self, size: usize) {
        self.used = self.used.saturating_sub(size);
        println!("[Memory] Freed {} bytes", size);
    }
    
    /// 获取总内存
    pub fn total(&self) -> usize {
        self.total
    }
    
    /// 获取已用内存
    pub fn used(&self) -> usize {
        self.used
    }
}

impl Default for MemoryManager {
    fn default() -> Self {
        Self::new()
    }
}