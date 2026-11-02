/* V4.0 Slice 1 验证：日厅卡片加载 -day 变体 + 夜厅回标准图 + 缺失回退 */
import puppeteer from 'puppeteer-core';
import { existsSync } from 'node:fs';
const OUT = new URL('../docs/ui-ux/v3/references/v3-tokens/', import.meta.url).pathname;
const c = ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'];
const browser = await puppeteer.launch({ executablePath: c.find(existsSync), headless: 'new', args: ['--enable-unsafe-swiftshader','--no-sandbox'] });
const page = await browser.newPage();
page.setDefaultTimeout(25000);
page.on('pageerror', e => console.log('PAGEERROR:', e.message.slice(0, 120)));
await page.setViewport({ width: 1440, height: 900 });

await page.goto('http://127.0.0.1:8137/#/', { waitUntil: 'domcontentloaded', timeout: 25000 });
await new Promise(r => setTimeout(r, 2600));
/* 确保日厅 */
if (await page.evaluate(() => document.documentElement.dataset.hall) !== 'day') {
  await page.evaluate(() => document.querySelector('.hall-link')?.click());
  await new Promise(r => setTimeout(r, 1200));
}
/* 抽查 6 张卡片 img 的实际 src 与加载状态 */
const day = await page.evaluate(() => {
  const imgs = [...document.querySelectorAll('img.card-thumb')].slice(0, 6);
  return imgs.map(i => ({ src: i.currentSrc.split('/').pop(), ok: i.complete && i.naturalWidth > 0 }));
});
console.log('day thumbs:', JSON.stringify(day));
/* 切夜厅：src 应切回标准图 */
await page.evaluate(() => document.querySelector('.hall-link')?.click());
await new Promise(r => setTimeout(r, 1400));
const night = await page.evaluate(() => {
  const imgs = [...document.querySelectorAll('img.card-thumb')].slice(0, 4);
  return imgs.map(i => ({ src: i.currentSrc.split('/').pop(), ok: i.complete && i.naturalWidth > 0 }));
});
console.log('night thumbs:', JSON.stringify(night));
await page.evaluate(() => window.scrollTo(0, 500));
await new Promise(r => setTimeout(r, 600));
await page.screenshot({ path: `${OUT}v4-lobby-day-thumbs.png` });
await browser.close().catch(() => {});
console.log('done');
