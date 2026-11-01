/* V2 阶段C验证：收藏馆模式 + 评分体系（localStorage 持久化 + 卡片角标 + infoPop 评分块） */
import puppeteer from 'puppeteer-core';
import { existsSync } from 'node:fs';
const OUT = new URL('../docs/design/screenshots/', import.meta.url).pathname;
const c = ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'];
const browser = await puppeteer.launch({ executablePath: c.find(existsSync), headless: 'new', args: ['--enable-unsafe-swiftshader','--no-sandbox'] });
const page = await browser.newPage();
page.on('pageerror', e => console.log('PAGEERROR:', e.message.slice(0,120)));
await page.setViewport({ width: 1440, height: 900 });
/* 1. 评分：infoPop 打星 → localStorage */
await page.goto('http://127.0.0.1:8137/#/device/action4', { waitUntil: 'networkidle2', timeout: 90000 });
await page.waitForFunction(() => { const e = window.__ENGINE; const s = e && e.getState(); return s && s.booted; }, { timeout: 80000, polling: 300 });
await page.evaluate(() => { const b = [...document.querySelectorAll('#topbar .hud-icon')].find(x => x.getAttribute('aria-label') === '设备总览'); b && b.click(); });
await new Promise(r => setTimeout(r, 700));
const stars = await page.$$('.rate-box .star');
console.log('rate stars rendered:', stars.length, '(应 20 = 4 维 × 5)');
await stars[4].click();   // 总体第 5 星
await new Promise(r => setTimeout(r, 400));
const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('dtm.ratings') || '{}')['action4']);
console.log('saved rating:', JSON.stringify(saved));
await page.screenshot({ path: `${OUT}v2-rate-infopop.png` });
/* 2. 收藏 + 收藏馆 */
await page.evaluate(() => {
  const k = 'dtm.favorites';
  const favs = JSON.parse(localStorage.getItem(k) || '[]');
  if(!favs.includes('action4')) favs.push('action4');
  localStorage.setItem(k, JSON.stringify(favs));
});
await page.goto('http://127.0.0.1:8137/#/collection', { waitUntil: 'networkidle2', timeout: 60000 });
await new Promise(r => setTimeout(r, 2600));
const coll = await page.evaluate(() => ({
  title: document.querySelector('.hub-title')?.textContent,
  cards: document.querySelectorAll('.card').length,
  badge: document.querySelector('.rate-badge')?.textContent?.trim() || null,
  empty: !!document.querySelector('.hub-empty'),
}));
console.log('collection:', JSON.stringify(coll));
await page.screenshot({ path: `${OUT}v2-collection.png` });
/* 3. 空态 */
await page.evaluate(() => localStorage.setItem('dtm.favorites', '[]'));
await page.reload({ waitUntil: 'networkidle2' });
await new Promise(r => setTimeout(r, 2400));
const empty = await page.evaluate(() => document.querySelector('.hub-empty')?.textContent?.trim().slice(0, 24) || null);
console.log('empty state:', empty);
await page.screenshot({ path: `${OUT}v2-collection-empty.png` });
await page.evaluate(() => localStorage.removeItem('dtm.ratings'));
await browser.close();
