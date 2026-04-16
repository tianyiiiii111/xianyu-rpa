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
    'NanoBnana': [
        `大香蕉 Nanobanana Pro 4K 自媒体 设计 广告

现货秒发，开箱即用。按次扣费，拒绝月租。支持 API 接入，1分钟快速配置。

4K满血，原生超清，摄影写实。
永久有效，全能兼容，极速出图。
1元1积分，试吃满意再带走。

价格：Nanobanana 2 每次 0.12积分；Pro 每次 0.21积分。

服务：秒发货，带教程，稳售后。
说明：白菜价发货不退，务必先看教程。`,
    ],
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