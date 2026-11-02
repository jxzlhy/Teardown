/* 目标收口验证：日厅（引擎+CSS 全开）+ 拆分悬浮同时生效的截图 */
import puppeteer from 'puppeteer-core';
import { existsSync } from 'node:fs';
const OUT = new URL('../docs/design/screenshots/', import.meta.url).pathname;
const c = ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'];
const browser = await puppeteer.launch({ executablePath: c.find(existsSync), headless: 'new', args: ['--enable-unsafe-swiftshader','--no-sandbox'] });
const page = await browser.newPage();
page.on('pageerror', e => console.log('PAGEERROR:', String(e && e.message || e).slice(0,140)));
await page.setViewport({ width: 1440, height: 900 });
/* 1. 日厅工作空间（引擎 setHallMode + CSS data-hall 双开）+ 拆分悬浮 */
await page.goto('http://127.0.0.1:8137/#/device/action4', { waitUntil: 'networkidle2', timeout: 90000 });
await page.waitForFunction(() => { const e = window.__ENGINE; const s = e && e.getState(); return s && s.booted; }, { timeout: 80000, polling: 300 });
await page.evaluate(() => { const b = [...document.querySelectorAll('#dock .hud-icon')].find(x => x.getAttribute('aria-label') === '白天/黑夜双厅'); b && b.click(); });
await new Promise(r => setTimeout(r, 1200));   // 等灯光渐变完成
await page.evaluate(() => window.__ENGINE.selectPart('battery'));
await new Promise(r => setTimeout(r, 1200));
await page.screenshot({ path: `${OUT}goal-day-float.png` });
/* 2. 夜厅拆解悬浮 */
await page.evaluate(() => { const b = [...document.querySelectorAll('#dock .hud-icon')].find(x => x.getAttribute('aria-label') === '白天/黑夜双厅'); b && b.click(); });
await page.evaluate(() => window.__ENGINE.selectPart('battery'));
await new Promise(r => setTimeout(r, 1200));
await page.screenshot({ path: `${OUT}goal-night-float.png` });
/* 3. 日厅大厅 */
await page.goto('http://127.0.0.1:8137/#/', { waitUntil: 'networkidle2', timeout: 60000 });
await page.evaluate(() => { document.documentElement.dataset.hall = 'day'; try{ localStorage.setItem('dtm.hall','day'); }catch{} });
await new Promise(r => setTimeout(r, 2400));
await page.evaluate(() => document.querySelector('.hub')?.scrollTo(0, 1400));
await new Promise(r => setTimeout(r, 800));
await page.screenshot({ path: `${OUT}goal-day-lobby-grid.png` });
await browser.close();
console.log('3 goal shots done');
