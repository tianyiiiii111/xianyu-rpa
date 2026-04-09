//! 进程管理模块

pub struct Process {
    pub id: u32,
    pub name: String,
}

impl Process {
    pub fn new(id: u32, name: &str) -> Self {
        Self { id, name: name.to_string() }
    }
}