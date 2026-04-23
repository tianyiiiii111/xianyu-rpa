import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config';

// 1. 路径初始化
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// 确保相对于当前文件的路径正确指向 data/images
const IMAGES_DIR = path.resolve(__dirname, '../../data/images');

const DESCRIPTIONS = {
    //     'Claude': [
    // ],
    //     'Gemini': [
    // ],
    //     'Midjourney': [
    // ],
    // 'NanoBnana': [],
    'gpt-image2':[
        `用完想继续创作，可再拍加量包，买得越多越划算
电商主图、小红书配图、品牌设计、高清放大都能做
新用户体验价：9.9元 / 200积分，先试再决定，门槛更低
标准包：49元 / 1000积分
高级包：99元 / 2200积分

主力模型：G皮提Image2、香蕉Pro满血、香蕉2满血，支持4K
支持即梦5 Lite、Flux2-Pro 及更多模型
主流模型保持更新

支持文生图、图生图、多图融合（8-14张图融合）
抠图、图片高清放大、提示词反推
创作智能体，基于 Gemini 的 AI 设计 Agent 助手

200积分大概能生成多少张图？
按当前常用模型举例：
G皮提Image2 默认分辨率 约40张（5积分/张）
香蕉2 1K分辨率约40张（5积分/张）
香蕉Pro 2K分辨率约25张（8积分/张）
GPT4o-image按 4张/5积分算，约可生成160张
如果使用4K或更高质量模式，单张消耗会更高，实际张数会更少
不同模型积分消耗略有差异，以软件内实际显示为准

视频生成也支持：Veo3.1、可灵2.6、Runway
即将上线Seedance 2.0
同时支持图库、AI生图项目管理

这是 PC 原生桌面版，不是普通网页工具
带无限画布，生图保存在本地，保障作品隐私
简单易上手，AI图片创作、设计、素材生成，小白也能轻松上手

虚拟商品，拍下自动发货
不想用了、不满意，随时可以退
未使用任何积分，全额秒退
已使用积分，按剩余积分折合金额退款

稳定更新，诚信服务每一位用户`,
    ]
};

/**
 * 健壮的洗牌算法 (Fisher-Yates)
 */
function shuffleArray(array) {
    if (!array || array.length === 0) return [];
    const newArr = [...array];
    for (let i = newArr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
    }
    return newArr;
}

/**
 * 获取所有分类名称
 */
export function getCategories() {
    return Object.keys(DESCRIPTIONS);
}

/**
 * 根据分类目录结构，从每个子目录（含根目录）中各随机抽取一张图
 */
export function getImagesByCategory(category) {
    const categoryDir = path.join(IMAGES_DIR, category);
    if (!fs.existsSync(categoryDir)) return [];

    const imageExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.bmp'];
    let finalSelection = [];

    // 辅助函数：判断是否是图片文件
    const isImage = (file) => imageExtensions.includes(path.extname(file).toLowerCase());

    try {
        const items = fs.readdirSync(categoryDir);

        // 1. 处理当前分类根目录下的图片
        const rootImages = items
            .filter(item => {
                const fullPath = path.join(categoryDir, item);
                return fs.statSync(fullPath).isFile() && isImage(item);
            })
            .map(item => path.join(categoryDir, item));

        if (rootImages.length > 0) {
            // 从根目录随机取1张
            finalSelection.push(shuffleArray(rootImages)[0]);
        }

        // 2. 遍历并处理所有子目录 (例如 contrast)
        const subDirs = items.filter(item => {
            const fullPath = path.join(categoryDir, item);
            return fs.statSync(fullPath).isDirectory();
        });

        for (const subDir of subDirs) {
            const subDirPath = path.join(categoryDir, subDir);
            const subDirFiles = fs.readdirSync(subDirPath)
                .filter(file => isImage(file))
                .map(file => path.join(subDirPath, file));

            if (subDirFiles.length > 0) {
                // 从每个子目录随机取一张
                const randomImage = shuffleArray(subDirFiles);
                finalSelection.push(randomImage[0]);    
                finalSelection.push(randomImage[1]);
            }
        }

        return finalSelection; // 返回的是一个包含各处随机抽取的图片路径数组
    } catch (err) {
        console.error(`❌ 获取分类图片失败 [${category}]:`, err.message);
        return [];
    }
}

/**
 * 核心方法：获取一个产品随机组合包
 */
export function getRandomProduct() {
    const categories = shuffleArray(getCategories());
    const randomCategory = categories[0];

    // 此时 getImagesByCategory 返回的是：[根目录随机一张, 子目录A随机一张, 子目录B随机一张...]
    const allCollectedImages = getImagesByCategory(randomCategory);

    // 如果你依然只想在最终发布时只取一张（全局唯一一张）
    // 那么这里再洗牌取第一个。
    // 如果想发多张（一张主图+一张对比图），直接用 allCollectedImages。
    // const singleImage = shuffleArray(allCollectedImages).slice(0, 1);

    return {
        category: randomCategory,
        images: allCollectedImages,
        description: getRandomDescription(randomCategory)
    };
}

/**
 * 根据分类获取随机文案
 */
export function getRandomDescription(category) {
    const texts = DESCRIPTIONS[category] || [];
    if (texts.length === 0) return "";
    return texts[Math.floor(Math.random() * texts.length)];
}