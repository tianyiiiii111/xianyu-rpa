// 1. 修改导入的函数，匹配新的 resource.js 接口
import { getRandomProduct } from './src/utils/resource.js';
import { humanDelay } from './src/utils/browser.js';
import { publishProduct } from './src/services/PublishService.js';

// const price = parseFloat((Math.random() * 0.5 + 0.5).toFixed(1)); // 价格随机在0.5到1.0之间，保留一位小数
const price = 1;

// 发布次数
const pushCount = 1;

const accountIds = [
    'huazhongkandianyingdehaitunsha',
    // 'dadishangdeyipianyezi',
];

for (const accountId of accountIds) {
    console.log(`🚀 开始为账号 [${accountId}] 发布商品...`);

    // 循环发布
    for (let i = 0; i < pushCount; i++) {
        // --- 核心修改：直接获取匹配好的随机产品包 ---
        const { category, images, description } = getRandomProduct();

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
            console.log(`✅ [${category}] 已成功发布第 ${i + 1} 个商品`);
        } catch (error) {
            console.error(`❌ 第 ${i + 1} 个商品发布失败:`, error.message);
        }

        // 添加随机延迟，避免请求过快
        // 建议发布后的延迟稍微长一点，模拟真人操作
        await humanDelay(3000, 5000);
    }
}