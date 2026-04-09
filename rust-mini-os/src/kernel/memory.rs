//! 内存管理模块

pub struct MemoryManager {
    total: usize,
    used: usize,
}

impl MemoryManager {
    pub fn new() -> Self {
        Self { total: 0, used: 0 }
    }
    
    pub fn alloc(&mut self, size: usize) -> Result<(), &'static str> {
        self.used += size;
        Ok(())
    }
}