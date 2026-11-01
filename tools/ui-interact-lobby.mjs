/* 交互体验取证：hover 卡片 / 展开筛选 / 开抽屉 / 点进设备 */
import puppeteer from 'puppeteer-core';
import { existsSync } from 'node:fs';
const OUT = new URL('../docs/design/screenshots/', import.meta.url).pathname;
function findChrome(){
  const c = ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'];
  for(const p of c) if(existsSync(p)) return p;
  throw new Error('no chrome');
}
const browser = await puppeteer.launch({ executablePath: findChrome(), headless: 'new',
  args: ['--enable-unsafe-swiftshader', '--no-sandbox'] });
const page = await browser.newPage();
const errors = [];
page.on('pageerror', e => errors.push(e.message));
await page.setViewport({ width: 1440, height: 900 });
await page.goto('http://127.0.0.1:8137/#/', { waitUntil: 'networkidle2', timeout: 45000 });
await new Promise(r => setTimeout(r, 2600));

/* 1. hover 第一张卡片 */
const card = await page.$('.card');
await card.hover();
await new Promise(r => setTimeout(r, 600));
await page.screenshot({ path: `${OUT}r2-lobby-card-hover.png` });
console.log('1 card hover ok');

/* 2. 展开品牌（更多品牌按钮） */
await page.evaluate(() => document.querySelector('.hub .filter-main')?.scrollIntoView());
await new Promise(r => setTimeout(r, 500));
const moreBtn = await page.evaluate(() => {
  const chips = [...document.querySelectorAll('.filter-groups .chip')];
  const b = chips.find(c => /展开其余/.test(c.textContent));
  if(b){ b.click(); return b.textContent.trim(); }
  return null;
});
await new Promise(r => setTimeout(r, 500));
console.log('2 brand expand:', moreBtn);

/* 3. 打开我的探索抽屉 + Esc 关闭 */
await page.evaluate(() => document.querySelector('.explore-link')?.click());
await new Promise(r => setTimeout(r, 600));
await page.screenshot({ path: `${OUT}r2-lobby-drawer.png` });
await page.keyboard.press('Escape');
await new Promise(r => setTimeout(r, 400));
const drawerClosed = await page.evaluate(() => !document.querySelector('#exploreDrawer'));
console.log('3 drawer esc close:', drawerClosed);

/* 4. 搜索交互：输入 drone */
await page.click('.filter-search input');
await page.type('.filter-search input', 'drone', { delay: 40 });
await new Promise(r => setTimeout(r, 900));
const searchInfo = await page.evaluate(() => ({
  cards: document.querySelectorAll('.card').length,
  clear: !!document.querySelector('.search-clear'),
}));
await page.screenshot({ path: `${OUT}r2-lobby-search.png` });
console.log('4 search:', JSON.stringify(searchInfo));
await page.evaluate(() => document.querySelector('.search-clear')?.click());

/* 5. 点进焦点展台 → 设备页 → 返回 */
await page.evaluate(() => window.scrollTo(0, 0));
await page.evaluate(() => document.querySelector('.hub')?.scrollTo(0, 0));
await new Promise(r => setTimeout(r, 400));
await page.click('.hub-stage');
await page.waitForFunction(() => location.hash.includes('/device/'), { timeout: 8000 });
await new Promise(r => setTimeout(r, 700));
console.log('5 stage click →', await page.evaluate(() => location.hash));
await page.goBack();
await new Promise(r => setTimeout(r, 900));
console.log('back →', await page.evaluate(() => location.hash), 'cards:', await page.evaluate(() => document.querySelectorAll('.card').length));

await browser.close();
console.log(errors.length ? 'PAGE ERRORS:\n' + errors.join('\n') : '(no page errors)');
