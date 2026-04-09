//! 文件系统模块

pub struct FileSystem {
    pub root: String,
}

impl FileSystem {
    pub fn new() -> Self {
        Self { root: "/".to_string() }
    }
}