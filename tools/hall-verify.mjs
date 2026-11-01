/* 双厅验证：工作空间日/夜 + 大厅日厅 截图 + 引擎状态 */
import puppeteer from 'puppeteer-core';
import { existsSync } from 'node:fs';
const OUT = new URL('../docs/design/screenshots/', import.meta.url).pathname;
const c = ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'];
const browser = await puppeteer.launch({ executablePath: c.find(existsSync), headless: 'new', args: ['--enable-unsafe-swiftshader','--no-sandbox'] });
const page = await browser.newPage();
page.on('pageerror', e => console.log('PAGEERROR:', e.message.slice(0,120)));
await page.setViewport({ width: 1440, height: 900 });
/* 日厅工作空间 */
await page.goto('http://127.0.0.1:8137/#/device/action4', { waitUntil: 'networkidle2', timeout: 90000 });
await page.waitForFunction(() => { const e = window.__ENGINE; const s = e && e.getState(); return s && s.booted; }, { timeout: 80000, polling: 300 });
await page.evaluate(() => { const b = [...document.querySelectorAll('#dock .hud-icon')].find(x => x.getAttribute('aria-label') === '白天/黑夜双厅'); b && b.click(); });
await new Promise(r => setTimeout(r, 1500));
const st = await page.evaluate(() => ({ hall: window.__ENGINE.getState().hallMode, dataset: document.documentElement.dataset.hall }));
console.log('workspace day:', JSON.stringify(st));
await page.screenshot({ path: `${OUT}v2-day-workspace.png` });
/* 日厅大厅 */
await page.goto('http://127.0.0.1:8137/#/', { waitUntil: 'networkidle2', timeout: 60000 });
await new Promise(r => setTimeout(r, 2600));
await page.screenshot({ path: `${OUT}v2-day-lobby.png` });
const lobbyDay = await page.evaluate(() => document.documentElement.dataset.hall);
console.log('lobby hall:', lobbyDay);
/* 切回夜厅（记忆验证） */
await page.goto('http://127.0.0.1:8137/#/device/action4', { waitUntil: 'networkidle2', timeout: 90000 });
await page.waitForFunction(() => { const e = window.__ENGINE; const s = e && e.getState(); return s && s.booted; }, { timeout: 80000, polling: 300 });
const persisted = await page.evaluate(() => window.__ENGINE.getState().hallMode);
console.log('persisted on reload:', persisted);
await page.evaluate(() => { const b = [...document.querySelectorAll('#dock .hud-icon')].find(x => x.getAttribute('aria-label') === '白天/黑夜双厅'); b && b.click(); });
await new Promise(r => setTimeout(r, 1200));
console.log('back to night:', await page.evaluate(() => window.__ENGINE.getState().hallMode));
await browser.close();
