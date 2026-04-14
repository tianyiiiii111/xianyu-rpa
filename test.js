import 'dotenv/config';
import { createBrowser,humanDelay } from './src/utils/browser.js';
import { searchProducts, extractProductDetails } from './src/services/SearchService.js';
import { batchPublish, publishProduct } from './src/services/PublishService.js';
import { checkForbiddenWords } from './src/services/AiServes.js';
import { StorageService } from './src/utils/storage.js';
import { loginAndSaveCookie } from './src/services/LoginServies.js';

const cookieName = await loginAndSaveCookie();
console.log(cookieName);

// 测试搜索商品
// searchProducts('nanobanana','huazhongkandianyingdehaitunsha').then(results => {
//   console.log(JSON.stringify(results, null, 2));
// });

// 测试批量发布商品
// batchPublish('search_1775453373756_Ai接口', 'dadishangdeyipianyezi').then(results => {
//   console.log(results);
// });

// AI 审核商品描述
// const searchResults = StorageService.getSearchResults('search_1775453373756_Ai接口');
// const product = searchResults['products'][6];
// checkForbiddenWords(product.description || '').then(results => {
//   console.log(JSON.stringify(results, null, 2));
// });

// 测试发布单个商品
// const searchResults = StorageService.getSearchResults('search_1775453373756_Ai接口');
// const product = searchResults['products'][6];
// publishProduct(product, 'dadishangdeyipianyezi').then(result => {
//   // console.log(result);
// });

// 测试采集并发布指定商品
// const productLinks = [
//   'https://www.goofish.com/item?spm=a21ybx.search.searchFeedList.9.41d7148bXJ7eIC&id=1025473481045&categoryId=202145854',
//   'https://www.goofish.com/item?spm=a21ybx.search.searchFeedList.21.41d7148bXJ7eIC&id=1024565238987&categoryId=202145854',
//   'https://www.goofish.com/item?spm=a21ybx.search.searchFeedList.22.41d7148bXJ7eIC&id=1027784813840&categoryId=201459411',
//   'https://www.goofish.com/item?spm=a21107h.42831410.0.0.10c66a73OSIBUL&id=1038387639693&categoryId=0',
//   'https://www.goofish.com/item?spm=a21107h.42831410.0.0.10c66a73OSIBUL&id=1040556506600&categoryId=0',
//   'https://www.goofish.com/item?spm=a21107h.42831410.0.0.10c66a73OSIBUL&id=1041507057109&categoryId=0',
//   'https://www.goofish.com/item?spm=a21ybx.search.searchFeedList.1.bd627a41X8nmkb&id=1032530366845&categoryId=202156031',
//   'https://www.goofish.com/item?spm=a21ybx.search.searchFeedList.5.bd627a41X8nmkb&id=1004757942309&categoryId=202038701',
//   'https://www.goofish.com/item?spm=a21ybx.search.searchFeedList.8.bd627a41X8nmkb&id=1038186455036&categoryId=202156031',
//   'https://www.goofish.com/item?spm=a21ybx.search.searchFeedList.7.bd627a41X8nmkb&id=1037681026327&categoryId=202154631',
//   'https://www.goofish.com/item?spm=a21ybx.search.searchFeedList.15.bd627a41X8nmkb&id=1040043877131&categoryId=202145854',
//   'https://www.goofish.com/item?spm=a21ybx.search.searchFeedList.22.bd627a41X8nmkb&id=1039356074801&categoryId=201449620',
//   'https://www.goofish.com/item?spm=a21ybx.search.searchFeedList.1.5c9933d74dXHpF&id=1015005434002&categoryId=202154631',
//   'https://www.goofish.com/item?spm=a21ybx.search.searchFeedList.17.5c9933d74dXHpF&id=1040044325737&categoryId=202145854',
//   'https://www.goofish.com/item?spm=a21ybx.search.searchFeedList.7.5c9933d74dXHpF&id=1032475709443&categoryId=202154631',
//   'https://www.goofish.com/item?spm=a21ybx.search.searchFeedList.8.5c9933d74dXHpF&id=1039238761384&categoryId=201449620',
//   'https://www.goofish.com/item?spm=a21ybx.search.searchFeedList.9.5c9933d74dXHpF&id=1033537826938&categoryId=202154631',
//   'https://www.goofish.com/item?spm=a21ybx.search.searchFeedList.16.5c9933d74dXHpF&id=1032472292951&categoryId=202158122',
//   'https://www.goofish.com/item?spm=a21ybx.search.searchFeedList.30.5c9933d74dXHpF&id=1038690859226&categoryId=202154631',
//   'https://www.goofish.com/item?spm=a21ybx.search.searchFeedList.17.5c9933d74dXHpF&id=1022107207465&categoryId=201459411',
//   'https://www.goofish.com/item?spm=a21ybx.search.searchFeedList.28.5c9933d74dXHpF&id=1038844078044&categoryId=201449620',
//   'https://www.goofish.com/item?spm=a21ybx.search.searchFeedList.23.5c9933d74dXHpF&id=1021770047711&categoryId=201459411',
//   'https://www.goofish.com/item?spm=a21ybx.search.searchFeedList.5.32cd553fpR0YHi&id=1029928510524&categoryId=201453616',
//   'https://www.goofish.com/item?spm=a21ybx.search.searchFeedList.12.32cd553fpR0YHi&id=969379717677&categoryId=201453616',
//   'https://www.goofish.com/item?spm=a21ybx.search.searchFeedList.9.32cd553fpR0YHi&id=1038190693021&categoryId=201453616',
//   'https://www.goofish.com/item?spm=a21ybx.search.searchFeedList.20.32cd553fpR0YHi&id=1038713340029&categoryId=201453616',
//   'https://www.goofish.com/item?spm=a21ybx.search.searchFeedList.1.32cd553fpR0YHi&id=1034496862166&categoryId=201453616',
//   'https://www.goofish.com/item?spm=a21ybx.search.searchFeedList.2.32cd553fpR0YHi&id=1040029345781&categoryId=201453616',
//   'https://www.goofish.com/item?spm=a21ybx.search.searchFeedList.8.32cd553fpR0YHi&id=990785799389&categoryId=201453616',
//   'https://www.goofish.com/item?spm=a21ybx.search.searchFeedList.22.32cd553fpR0YHi&id=1034562114869&categoryId=201453616',
//   'https://www.goofish.com/item?spm=a21ybx.search.searchFeedList.5.32cd553fpR0YHi&id=1024101495038&categoryId=201453616',
//   'https://www.goofish.com/item?spm=a21ybx.search.searchFeedList.8.32cd553fpR0YHi&id=982211789293&categoryId=201453616',
//   // 'https://www.goofish.com/item?spm=a21ybx.search.searchFeedList.3.6ff5553fq0mQTJ&id=1040029345781&categoryId=201453616',
//   // 'https://www.goofish.com/item?spm=a21ybx.search.searchFeedList.10.6ff5553fq0mQTJ&id=1034496862166&categoryId=201453616',
//   // 'https://www.goofish.com/item?spm=a21ybx.search.searchFeedList.16.6ff5553fq0mQTJ&id=999761976370&categoryId=201453616',
//   // 'https://www.goofish.com/item?spm=a21ybx.search.searchFeedList.22.6ff5553fq0mQTJ&id=1038870834535&categoryId=201453616',
//   // 'https://www.goofish.com/item?spm=a21ybx.search.searchFeedList.26.6ff5553fq0mQTJ&id=1032829430268&categoryId=201453616',
//   // 'https://www.goofish.com/item?spm=a21ybx.search.searchFeedList.25.6ff5553fq0mQTJ&id=1039373748909&categoryId=201453616',
//   // 'https://www.goofish.com/item?spm=a21ybx.search.searchFeedList.25.6ff5553fq0mQTJ&id=1034562114869&categoryId=201453616',
//   // 'https://www.goofish.com/item?spm=a21ybx.search.searchFeedList.26.6ff5553fq0mQTJ&id=1040703369383&categoryId=201453616',
// ];

// const accountId = 'huazhongkandianyingdehaitunsha';
// // 1. 启动浏览器
// const { browser, page } = await createBrowser(accountId);
// // 2.抓取商品详情页
// for (const link of productLinks) {
//   await page.goto(link, {
//     waitUntil: 'domcontentloaded',
//     timeout: 30000,
//   });
//   // 3. 等待页面加载完成
//   await humanDelay(3000, 4000);
//   const productInfo = await extractProductDetails(page, link);
//   // 生成商品IDs
//   const productId = `product_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

//   // 构建商品对象
//   const product = {
//     id: productId,
//     url: link,
//     ...productInfo,
//     crawledAt: new Date().toISOString()
//   };

//   await publishProduct(product, accountId).then(result => {
//     console.log(result);
//   });

//   // 添加随机延迟，避免请求过快
//   await humanDelay(1000, 2000);
// }
// browser.close();