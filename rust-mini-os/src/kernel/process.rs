//! 进程管理模块
//! 
//! 展示 Rust 的并发安全特性

/// 进程信息
pub struct Process {
    pub id: u32,
    pub name: String,
    pub status: ProcessStatus,
}

#[derive(Debug, Clone, PartialEq)]
pub enum ProcessStatus {
    Running,
    Sleeping,
    Stopped,
    Zombie,
}

/// 进程管理器
pub struct ProcessManager {
    next_id: u32,
    processes: Vec<Process>,
}

impl ProcessManager {
    /// 创建新的进程管理器
    pub fn new() -> Self {
        Self {
            next_id: 1,
            processes: Vec::new(),
        }
    }
    
    /// 创建新进程
    pub fn spawn(&mut self, name: &str) -> u32 {
        let id = self.next_id;
        self.next_id += 1;
        
        let process = Process {
            id,
            name: name.to_string(),
            status: ProcessStatus::Running,
        };
        
        println!("[Process] Spawned process '{}' (PID: {})", name, id);
        self.processes.push(process);
        id
    }
    
    /// 终止进程
    pub fn kill(&mut self, pid: u32) -> Result<(), &'static str> {
        if let Some(pos) = self.processes.iter().position(|p| p.id == pid) {
            self.processes[pos].status = ProcessStatus::Zombie;
            println!("[Process] Killed process PID: {}", pid);
            Ok(())
        } else {
            Err("Process not found")
        }
    }
    
    /// 列出所有进程
    pub fn list(&self) {
        println!("[Process] Active processes:");
        for p in &self.processes {
            println!("  PID: {} | {} | {:?}", p.id, p.name, p.status);
        }
    }
}

impl Default for ProcessManager {
    fn default() -> Self {
        Self::new()
    }
}