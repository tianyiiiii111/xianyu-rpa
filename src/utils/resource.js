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
//         `Sonnet 4.6 每次只要 0.049元
// 还在给官方送那每月20美的订阅费？
// 如果你平时用量不稳定，订阅费纯属浪费。
// 现在克劳德的使用成本直接打下来了，帮你省下这笔冤枉钱。

// 为什么选这个：

// 拒绝订阅： 没必要为了偶尔写代码开会员，这儿按次扣费，用多少花多少。

// 开发神助攻： Sonnet 4.6 的写代码水平懂的都懂，现在几分钱就能跑一次。

// 余额不过期： 账户里存点额度，想什么时候用就什么时候用。

// 稳定 API： 不用像网页版那样老是转圈圈，API 响应快得飞起。

// 购前唠叨：

// 自动发货： 拍下就给1元试用和保姆教程。

// 不退不换： 虚拟东西，发货了就没法退了。

// 新手注意： 教程写得特别细，求求你先看一眼教程，看不懂教程的真的别买，省得大家麻烦。

// 超低价格，最低标准。
// 把钱花在重点上，好用才是硬道理。`,

// `小克 4.6 Sonnet / 4.6 Opus 计次版

// 现货直供 · 开箱即用
// 拒绝额度计费的文字游戏！别家扣 5 额度，我们只扣 1 次。实打实计次，让每一分钱都花在刀刃上。

// 核心优势

// 不限时长：无过期焦虑，余额永久有效。

// 满血性能：95% 不截断，支持超长上下文，拒绝空回复。

// 场景全覆盖：适配 SillyTavern、酒馆、VScode、Cursor、CherryStudio 等。

// 价格清单（支持免费试吃）：

// Claude 4.6 Sonnet

// 逻辑/代码主力，智商巅峰

// 5 元 = 100 次（实打实对话次数）

// Claude 4.6 Opus

// 旗舰性能，更具人性化思维

// 8 元 = 100 次（实打实对话次数）

// 囤货福利：买越多单价越低，具体优惠私聊。

// 服务保障

// 非白嫖渠道：稳定率 95%+，拒绝频繁报错。

// 零基础教学：自带保姆级教程，店主在线火速指导。

// 售后无忧：非人为问题积极处理，体验“农场主”般服务。

// 下单说明

// 标价即实价，直接拍下自动发货。

// 建议先试吃，好用再带走。`,
// ],
//     'Gemini': [
//         `**Gemi 3.1 Pro 每次0.019元**

// 还在抱怨官方那个死贵的订阅费？
// 如果不是天天重度使用，每个月花那笔钱真的很亏。
// 现在把 Gemi Pro 的门槛直接打到地板上了，几分钱就能跑一次。

// **核心亮点：**
// - **告别订阅制：** 不用每个月被扣费，这儿按次算钱，不用不扣钱。
// - **性价比天花板：** 0.019元一次，这价格还要啥自行车？随便调。
// - **余额永不过期：** 账户里的钱没有有效期，哪怕放一年想用也能用。
// - **API 专属通道：** 响应速度比网页版快得多，干活不掉链子。

// **购前须知：**
// - **自动发货：** 拍下就给1元试用额度和保姆教程。
// - **不退不换：** 虚拟商品，发货了不支持退款。
// - **求求看教程：** 教程写得比说明书都细，**一定要先看教程再提问**。不爱看教程的朋友请绕道，别给彼此添麻烦。

// **超低价格，最低标准。**
// **把钱省下来吃顿好的，剩下的交给 Gemi 就行。**`,

// `Gemi 3.1 / 3.0 Pro 计次版

// 现货直供 · 开箱即用
// 拒绝额度计费的文字游戏。别家扣 5 额度，我们只扣 1 次。实打实计次，把 Gemini 的使用成本直接打到地板上。

// 核心优势

// 不限时长：无过期焦虑，余额永久有效，想用就用。

// 满血性能：原生 API 接口，支持超长上下文，响应速度极快。

// 场景全覆盖：适配 SillyTavern、酒馆、VScode、CherryStudio、NextChat 等。

// 价格清单（支持免费试吃）：

// Gemi 3.1 Pro

// 性价比之王，日常任务与逻辑处理主力

// 2 元 = 100 次（实打实对话次数）

// Gemi 3.0 Pro

// 经典版本，性能稳定，多模态能力强

// 3 元 = 100 次（实打实对话次数）

// 囤货福利：买越多单价越低，大容量用户联系私聊。

// 服务保障

// 非白嫖渠道：稳定率 95% 以上，拒绝频繁截断或空回复。

// 零基础教学：自带配置教程，新手也能 1 分钟快速上手。

// 售后无忧：非人为问题积极处理，确保算力供应稳定。

// 下单说明

// 标价即实价，直接拍下系统自动发货。

// 建议先联系店主试吃，满意后再带走。`,
// ],
//     'Midjourney': [
//         `**Midjourney 每次只要 0.13元**

// 别再到处求人拼车，或者心疼那几百块的官方订阅了。
// 如果你不是职业画师，天天蹲在里面出图，买包月会员纯属给资本家送钱。
// 这里按次计费，把 MJ 的使用门槛直接拆了，几毛钱就能出一张神级大图。

// **核心亮点：**
// - **拒绝订阅焦虑：** 没有订阅，用一张扣一张，余额永久有效，放半年再用也没问题。
// - **满血出图：** 2K高清画质，MJ 该有的审美和细节一点不打折。
// - **不用翻墙折腾：** 只要软件支持 API 接入，直接开画，告别繁琐的魔法和复杂操作。
// - **高频响应：** API 通道比你在 Discord 里排队稳得多，响应极速。

// **购前须知：**
// - **自动发货：** 拍下就给1元试用额度和保姆级配置教程。
// - **不退不换：** 虚拟商品，发货了就没法退了，规则就是这么简单。
// - **求求看教程：** 教程写得特别细，**务必先看教程再提问**。不爱看教程、想当伸手党的朋友请绕道，别给彼此添麻烦。

// **超低价格，最低标准。**
// **把钱省下来喝奶茶，剩下的交给 MJ 就行。**`,

// `Midjourney 计次版

// 现货直供 · 顶级艺术创作
// 拒绝昂贵的官方订阅和复杂的拼车。按次计费，出一张图扣一次，不再为闲置的月费买单，让每一分钱都变成神级大作。

// 核心优势

// 不限时长：告别订阅焦虑，余额永久有效，想画就画。

// 满血性能：原生 2K 高清出图，保留 MJ 标志性的艺术感与细节，拒绝低质缩水。

// 场景全覆盖：适配支持 API 接入的各种生图插件、Discord 镜像工具及自动化流程。

// 价格清单（支持免费试吃）：

// Midjourney 2K 计次版

// 全球公认最强 AI 绘画模型，光影与构图专家

// 13 元 = 100 次（实打实生图次数）

// 囤货福利：买越多单价越低，职业画师或工作室需求请私聊。

// 服务保障

// 极速响应：API 专属通道，告别 Discord 漫长的排队等待。

// 零基础教学：自带保姆级接入教程，无需复杂魔法，直接上手。

// 售后无忧：非人为问题积极处理，稳定出图不掉链子。

// 下单说明

// 标价即实价，直接拍下系统自动发货。

// 欢迎联系店主试吃，体验过顶级画质后再带走。`,
// ],
    'NanoBnana': [
        
    `Nano Banana Pro 4K AI绘图 满血不降智
无需魔法 国内直登
非共享，是用自己的号

本人每天在用 保证稳定可靠
满血不降智，操作简单

1元1积分 39.9元可生333张banana 2

【价格表】
Nano banana fast -- 0.05积分/次

Nano banana 2（4k）-- 0.12积分/次

Nano banana Pro（4k）-- 0.21积分/次


拍下系统自动发货，发送使用指南和1积分体验名额
虚拟产品，发货后不接受任何理由退换`,

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
            // 从根目录随机取二张
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