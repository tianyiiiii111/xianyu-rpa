//! 文件系统模块
//! 
//! 展示 Rust 的模式匹配和错误处理

/// 文件类型
#[derive(Debug)]
pub enum FileType {
    Regular,
    Directory,
    Symlink,
}

/// 文件元数据
pub struct Metadata {
    pub name: String,
    pub file_type: FileType,
    pub size: u64,
}

/// 文件系统
pub struct FileSystem {
    files: Vec<Metadata>,
}

impl FileSystem {
    /// 创建新的文件系统
    pub fn new() -> Self {
        Self { files: Vec::new() }
    }
    
    /// 创建文件
    pub fn create(&mut self, name: &str, file_type: FileType) -> Result<(), &'static str> {
        // 检查文件是否已存在 - 展示模式匹配
        if self.files.iter().any(|f| f.name == name) {
            return Err("File already exists");
        }
        
        let metadata = Metadata {
            name: name.to_string(),
            file_type,
            size: 0,
        };
        
        self.files.push(metadata);
        println!("[FS] Created: {}", name);
        Ok(())
    }
    
    /// 读取文件
    pub fn read(&self, name: &str) -> Result<&Metadata, &'static str> {
        // 模式匹配 - 查找文件
        self.files
            .iter()
            .find(|f| f.name == name)
            .ok_or("File not found")
    }
    
    /// 删除文件
    pub fn remove(&mut self, name: &str) -> Result<(), &'static str> {
        // 使用 position 和模式匹配
        if let Some(pos) = self.files.iter().position(|f| f.name == name) {
            self.files.remove(pos);
            println!("[FS] Removed: {}", name);
            Ok(())
        } else {
            Err("File not found")
        }
    }
    
    /// 列出文件
    pub fn list(&self) {
        println!("[FS] Files:");
        for f in &self.files {
            println!("  {} ({} bytes)", f.name, f.size);
        }
    }
}

impl Default for FileSystem {
    fn default() -> Self {
        Self::new()
    }
}