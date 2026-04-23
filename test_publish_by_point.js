// 1. 修改导入的函数，匹配新的 resource.js 接口
import { getRandomProduct } from './src/utils/resource.js';
import { humanDelay } from './src/utils/browser.js';
import { publishProduct } from './src/services/PublishService.js';

// 固定价格
const MIN_PRICE = 2.0;  
const MAX_PRICE = 2.0;

// 计算随机价格逻辑
// (Math.random() * (max - min) + min) 是生成特定区间随机数的标准公式
// const price = parseFloat((Math.random() * (MAX_PRICE - MIN_PRICE) + MIN_PRICE).toFixed(1));
const price = 0.01;

const accountIds = ['beizhoujuzhongdezhima'];

const title = "Image 2 G皮提、香蕉Pro、NanoBanan 2、即梦、无限画布AI生成试用每月限购一单";
const points = [
    '无限使用',
    '不限次数',
    '年度会员',
    '国内直连/无需魔法',
    '自动秒发',
    '一年畅用',
    '积分会员'      
];


for (const accountId of accountIds) {
    console.log(`🚀 开始为账号 [${accountId}] 发布商品...`);

    // 遍历points数组，每个point发布一次
    for (let i = 0; i < points.length; i++) {
        const point = points[i];
        
        // --- 核心修改：直接获取匹配好的随机产品包 ---
        let { category, images, description } = getRandomProduct();

        description = `${title} ${point}\n` + description;

        // 健壮性检查：如果没有图片，跳过本次循环
        if (images.length === 0) {
            console.log(`⚠️ 分类 [${category}] 下未找到图片，跳过本次发布`);
            continue;
        }

        // 构建商品对象
        // 注意：publishProduct 现在接收的是打乱后且匹配好的 category 对应的素材
        const productInfo = {
            price: price,
            description: description,
            images: images, // 这里已经是包含 1 张图的数组了
            category: category // 如果发布服务需要类目信息可以带上
        };

        try {
            // 执行发布
            await publishProduct(productInfo, accountId);
            console.log(`✅ [${category}] 已成功发布包含关键词 "${point}" 的商品`);
        } catch (error) {
            console.error(`❌ 发布包含关键词 "${point}" 的商品失败:`, error.message);
        }

        // 添加随机延迟，避免请求过快
        // 建议发布后的延迟稍微长一点，模拟真人操作
        await humanDelay(3000, 5000);
    }
}      
