/* 日厅全量对比度验证：大厅+设备页多区域截图 */
import puppeteer from 'puppeteer-core';
import { existsSync } from 'node:fs';
const OUT = new URL('../docs/design/screenshots/', import.meta.url).pathname;
const c = ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'];
const browser = await puppeteer.launch({ executablePath: c.find(existsSync), headless: 'new', args: ['--enable-unsafe-swiftshader','--no-sandbox'] });
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900 });
/* 大厅日厅（含 recent/筛选/卡片/foot） */
await page.goto('http://127.0.0.1:8137/#/', { waitUntil: 'networkidle2', timeout: 60000 });
await page.evaluate(() => { document.documentElement.dataset.hall = 'day'; });
await new Promise(r => setTimeout(r, 2600));
await page.screenshot({ path: `${OUT}day-full-lobby.png` });
await page.evaluate(() => document.querySelector('.hub')?.scrollTo(0, 1200));
await new Promise(r => setTimeout(r, 800));
await page.screenshot({ path: `${OUT}day-full-lobby-scrolled.png` });
/* 设备页日厅（infoPop + rail + dock） */
await page.goto('http://127.0.0.1:8137/#/device/action5pro', { waitUntil: 'networkidle2', timeout: 90000 });
await page.waitForFunction(() => { const e = window.__ENGINE; const s = e && e.getState(); return s && s.booted; }, { timeout: 80000, polling: 300 });
await page.evaluate(() => { document.documentElement.dataset.hall = 'day'; });
await new Promise(r => setTimeout(r, 1000));
await page.evaluate(() => { const b = [...document.querySelectorAll('#topbar .hud-icon')].find(x => x.getAttribute('aria-label') === '设备总览'); b && b.click(); });
await new Promise(r => setTimeout(r, 700));
await page.screenshot({ path: `${OUT}day-full-infopop.png` });
await browser.close();
console.log('3 shots done');
