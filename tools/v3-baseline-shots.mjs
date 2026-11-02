/* V3 基线取证：双厅大厅/工作空间 + 移动端 → docs/ui-ux/v3/references/baseline/（只读页面，不写源码） */
import puppeteer from 'puppeteer-core';
import { existsSync, mkdirSync } from 'node:fs';
const OUT = new URL('../docs/ui-ux/v3/references/baseline/', import.meta.url).pathname;
mkdirSync(OUT, { recursive: true });
const c = ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'];
const browser = await puppeteer.launch({ executablePath: c.find(existsSync), headless: 'new', args: ['--enable-unsafe-swiftshader','--no-sandbox'] });
const page = await browser.newPage();
page.on('pageerror', e => console.log('PAGEERROR:', e.message.slice(0,120)));
const shot = (n) => page.screenshot({ path: `${OUT}${n}.png` });
const toggleHall = () => page.evaluate(() => { const b = [...document.querySelectorAll('#dock .hud-icon')].find(x => x.getAttribute('aria-label') === '白天/黑夜双厅'); b && b.click(); });
const booted = () => page.waitForFunction(() => { const e = window.__ENGINE; const s = e && e.getState(); return s && s.booted; }, { timeout: 80000, polling: 300 });

/* --- 桌面 1440×900 --- */
await page.setViewport({ width: 1440, height: 900 });
// 大厅·日厅（记忆态可能为日，先强制读态）
await page.goto('http://127.0.0.1:8137/#/', { waitUntil: 'networkidle2', timeout: 60000 });
await new Promise(r => setTimeout(r, 2600));
console.log('lobby hall:', await page.evaluate(() => document.documentElement.dataset.hall));
await shot('lobby-day-top');
await page.evaluate(() => { document.querySelector('.hub-grid, #grid')?.scrollIntoView(); window.scrollBy(0, -80); });
await new Promise(r => setTimeout(r, 600));
await shot('lobby-day-grid');
// 夜厅
await page.evaluate(() => { for (const b of document.querySelectorAll('.hall-link, [aria-label*="双厅"]')) { b.click(); break; } });
await new Promise(r => setTimeout(r, 1200));
await page.evaluate(() => window.scrollTo(0, 0));
await new Promise(r => setTimeout(r, 400));
console.log('lobby hall after toggle:', await page.evaluate(() => document.documentElement.dataset.hall));
await shot('lobby-night-top');

/* --- 工作空间 action4 --- */
await page.goto('http://127.0.0.1:8137/#/device/action4', { waitUntil: 'networkidle2', timeout: 90000 });
await booted();
await new Promise(r => setTimeout(r, 1200));
console.log('workspace hall:', await page.evaluate(() => window.__ENGINE.getState().hallMode));
await shot('workspace-night');
await toggleHall();
await new Promise(r => setTimeout(r, 1800));
await shot('workspace-day');
// 展台特写（放大底座区域取证）
await toggleHall();

/* --- 移动端 390×844 --- */
await page.setViewport({ width: 390, height: 844 });
await page.goto('http://127.0.0.1:8137/#/', { waitUntil: 'networkidle2', timeout: 60000 });
await new Promise(r => setTimeout(r, 2600));
await shot('lobby-day-mobile');
await page.goto('http://127.0.0.1:8137/#/device/action4', { waitUntil: 'networkidle2', timeout: 90000 });
await booted();
await new Promise(r => setTimeout(r, 1200));
await shot('workspace-night-mobile');

await browser.close();
console.log('done →', OUT);
