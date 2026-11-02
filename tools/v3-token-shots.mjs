/* V3 语义 token 定稿验证截图 → docs/ui-ux/v3/references/v3-tokens/ */
import puppeteer from 'puppeteer-core';
import { existsSync, mkdirSync } from 'node:fs';
const OUT = new URL('../docs/ui-ux/v3/references/v3-tokens/', import.meta.url).pathname;
mkdirSync(OUT, { recursive: true });
const c = ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'];
const browser = await puppeteer.launch({ executablePath: c.find(existsSync), headless: 'new', args: ['--enable-unsafe-swiftshader','--no-sandbox'] });
const page = await browser.newPage();
page.on('pageerror', e => console.log('PAGEERROR:', e.message.slice(0,120)));
await page.setViewport({ width: 1440, height: 900 });
const booted = () => page.waitForFunction(() => { const e = window.__ENGINE; const s = e && e.getState(); return s && s.booted; }, { timeout: 80000, polling: 300 });

/* 日厅大厅 */
await page.goto('http://127.0.0.1:8137/#/', { waitUntil: 'networkidle2', timeout: 60000 });
await new Promise(r => setTimeout(r, 2200));
if (await page.evaluate(() => document.documentElement.dataset.hall || 'night') !== 'day') {
  await page.evaluate(() => document.querySelector('.hall-link')?.click());
  await new Promise(r => setTimeout(r, 1200));
}
await page.evaluate(() => window.scrollTo(0, 0));
await new Promise(r => setTimeout(r, 400));
await page.screenshot({ path: `${OUT}lobby-day-top.png` });
await page.evaluate(() => { document.querySelector('.hub-grid, #grid')?.scrollIntoView(); window.scrollBy(0, -80); });
await new Promise(r => setTimeout(r, 500));
await page.screenshot({ path: `${OUT}lobby-day-grid.png` });

/* 日厅工作空间 */
await page.goto('http://127.0.0.1:8137/#/device/action4', { waitUntil: 'networkidle2', timeout: 90000 });
await booted();
await new Promise(r => setTimeout(r, 1500));
const wtoggle = async (want) => { await page.evaluate((w) => { const b = [...document.querySelectorAll('#dock .hud-icon')].find(x => x.getAttribute('aria-label') === '白天/黑夜双厅'); if (window.__ENGINE.getState().hallMode !== w && b) b.click(); }, want); await new Promise(r => setTimeout(r, 2000)); };
await wtoggle('day');
await page.screenshot({ path: `${OUT}workspace-day.png` });

/* 夜厅大厅（C 精修验证） */
await page.goto('http://127.0.0.1:8137/#/', { waitUntil: 'networkidle2', timeout: 60000 });
await new Promise(r => setTimeout(r, 2200));
if (await page.evaluate(() => document.documentElement.dataset.hall || 'night') === 'day') {
  await page.evaluate(() => document.querySelector('.hall-link')?.click());
  await new Promise(r => setTimeout(r, 1200));
}
await page.evaluate(() => window.scrollTo(0, 0));
await new Promise(r => setTimeout(r, 400));
await page.screenshot({ path: `${OUT}lobby-night-top.png` });
/* 夜厅工作空间 */
await page.goto('http://127.0.0.1:8137/#/device/action4', { waitUntil: 'networkidle2', timeout: 90000 });
await booted();
await new Promise(r => setTimeout(r, 1200));
await wtoggle('night');
await page.screenshot({ path: `${OUT}workspace-night.png` });

await browser.close();
console.log('done →', OUT);
