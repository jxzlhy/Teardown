/* V2 阶段C收官验证：分类/备注/收藏时间/排序 + 评分六维展开 + infoPop 收藏管理 */
import puppeteer from 'puppeteer-core';
import { existsSync } from 'node:fs';
const OUT = new URL('../docs/design/screenshots/', import.meta.url).pathname;
const c = ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'];
const browser = await puppeteer.launch({ executablePath: c.find(existsSync), headless: 'new', args: ['--enable-unsafe-swiftshader','--no-sandbox'] });
const page = await browser.newPage();
page.on('pageerror', e => console.log('PAGEERROR:', String(e && e.message || e).slice(0,140)));
await page.setViewport({ width: 1440, height: 900 });
/* 1. infoPop：收藏 → 分类 chips + 新建分类 + 备注 */
await page.goto('http://127.0.0.1:8137/#/device/action4', { waitUntil: 'networkidle2', timeout: 90000 });
await page.waitForFunction(() => { const e = window.__ENGINE; const s = e && e.getState(); return s && s.booted; }, { timeout: 80000, polling: 300 });
await page.evaluate(() => { const b = [...document.querySelectorAll('#topbar .hud-icon')].find(x => x.getAttribute('aria-label') === '设备总览'); b && b.click(); });
await new Promise(r => setTimeout(r, 700));
/* 点收藏 */
await page.evaluate(() => { const b = [...document.querySelectorAll('.info-actions-row .hud-glow-btn')].find(x => /收藏/.test(x.textContent)); b && b.click(); });
await new Promise(r => setTimeout(r, 500));
/* 新建分类「值得研究」（若默认已有则跳过新建，直接加入） */
const cats = await page.evaluate(() => {
  const btns = [...document.querySelectorAll('.fav-cat')].map(b => b.textContent.trim());
  return btns;
});
console.log('fav cats:', JSON.stringify(cats));
await page.click('.fav-cat.on') .catch(() => {});   // 若已 on 先取消
await page.evaluate(() => { const b = [...document.querySelectorAll('.fav-cat')].find(x => x.textContent.trim() === '值得研究'); b && b.click(); });
await new Promise(r => setTimeout(r, 400));
await page.evaluate(() => { const t = document.querySelector('.fav-note'); t.value = '星环结构教学价值高'; t.dispatchEvent(new Event('input')); t.dispatchEvent(new Event('change')); });
await new Promise(r => setTimeout(r, 400));
const meta = await page.evaluate(() => JSON.parse(localStorage.getItem('dtm.favmeta') || '{}')['action4']);
console.log('favmeta:', JSON.stringify(meta));
/* 2. 评分六维展开 + 备注 */
await page.evaluate(() => { const b = [...document.querySelectorAll('.rate-expand')][0]; b && b.click(); });
await new Promise(r => setTimeout(r, 400));
const dims = await page.evaluate(() => [...document.querySelectorAll('.rate-detail .rate-k')].map(x => x.textContent));
console.log('six dims:', JSON.stringify(dims));
await page.evaluate(() => { const rows = [...document.querySelectorAll('.rate-detail .rate-row')]; rows[1].querySelector('.star:nth-child(4)').click(); });
await new Promise(r => setTimeout(r, 400));
await page.evaluate(() => { const t = document.querySelector('.rate-note'); t.value = '外观还原度高，电池位置可能不准确'; t.dispatchEvent(new Event('input')); t.dispatchEvent(new Event('change')); });
await new Promise(r => setTimeout(r, 400));
const rating = await page.evaluate(() => JSON.parse(localStorage.getItem('dtm.ratings') || '{}')['action4']);
console.log('rating:', JSON.stringify(rating));
await page.screenshot({ path: `${OUT}v2-infopop-manage.png` });
/* 3. 收藏馆页：分类导航 + 排序 + 卡片备注/时间 */
await page.goto('http://127.0.0.1:8137/#/collection', { waitUntil: 'networkidle2', timeout: 60000 });
await new Promise(r => setTimeout(r, 2600));
const coll = await page.evaluate(() => ({
  navChips: [...document.querySelectorAll('.coll-nav .chip')].map(x => x.textContent.trim()).slice(0, 6),
  cards: document.querySelectorAll('.card').length,
  note: document.querySelector('.card-note')?.textContent?.trim() || null,
  favat: document.querySelector('.card-favat')?.textContent?.trim() || null,
}));
console.log('collection:', JSON.stringify(coll));
await page.screenshot({ path: `${OUT}v2-collection-full.png` });
/* 4. 排序切换 */
await page.select('.coll-sort select', 'rating');
await new Promise(r => setTimeout(r, 600));
console.log('sort ok, first card:', await page.evaluate(() => document.querySelector('.card-name')?.textContent));
await browser.close();
