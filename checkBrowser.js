import { createBrowser } from './src/utils/browser.js'

const { browser, page } = await createBrowser('dadishangdeyipianyezi');
await page.goto('https://www.goofish.com/');
