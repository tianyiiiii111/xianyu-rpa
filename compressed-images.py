import os
from PIL import Image

def compress_in_place(directory, quality=70):
    """
    遍历目录，压缩图片并直接覆盖原文件
    :param directory: 目标文件夹路径
    :param quality: 压缩质量 (1-95)
    """
    supported_formats = ('.jpg', '.jpeg', '.png', '.webp')
    count = 0

    for root, _, files in os.walk(directory):
        for file in files:
            if file.lower().endswith(supported_formats):
                file_path = os.path.join(root, file)
                try:
                    # 获取原始大小用于对比
                    orig_size = os.path.getsize(file_path)
                    
                    with Image.open(file_path) as img:
                        # 转换模式以确保兼容性（处理透明度）
                        if img.mode in ("RGBA", "P"):
                            img = img.convert("RGB")
                        
                        # 直接保存回原路径，实现覆盖
                        img.save(file_path, "JPEG", optimize=True, quality=quality)
                    
                    new_size = os.path.getsize(file_path)
                    print(f"已覆盖: {file} | 压缩率: {((orig_size - new_size) / orig_size * 100):.1f}%")
                    count += 1
                except Exception as e:
                    print(f"处理失败 {file}: {e}")

    print(f"\n✨ 处理完成！共覆盖了 {count} 张图片。")

# --- 执行设置 ---
# 注意：这会永久修改文件，建议先在测试文件夹运行
target_dir = "/Users/tianyi/Code/xianyu-rpa/data/images/NanoBnana/contrast" 
compress_in_place(target_dir, quality=70)