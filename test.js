import 'dotenv/config';
import { searchProducts } from './src/services/SearchService.js';
import { batchPublish,publishProduct } from './src/services/PublishService.js';
import { checkForbiddenWords } from './src/services/AiServes.js';
import { StorageService } from './src/utils/storage.js';
import { loginAndSaveCookie } from './src/services/LoginServies.js';  

// const cookieName = await loginAndSaveCookie();
// console.log(cookieName);

// 测试搜索商品
// searchProducts('Ai接口','huazhongkandianyingdehaitunsha').then(results => {
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
//   console.log(result);
// });
