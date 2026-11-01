/* 日厅对比度验证：总览弹层 + 详情卡 + 帮助卡在日厅下的截图 */
import puppeteer from 'puppeteer-core';
import { existsSync } from 'node:fs';
const OUT = new URL('../docs/design/screenshots/', import.meta.url).pathname;
const c = ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'];
const browser = await puppeteer.launch({ executablePath: c.find(existsSync), headless: 'new', args: ['--enable-unsafe-swiftshader','--no-sandbox'] });
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900 });
await page.goto('http://127.0.0.1:8137/#/device/action4', { waitUntil: 'networkidle2', timeout: 90000 });
await page.waitForFunction(() => { const e = window.__ENGINE; const s = e && e.getState(); return s && s.booted; }, { timeout: 80000, polling: 300 });
await page.evaluate(() => { document.documentElement.dataset.hall = 'day'; });
await new Promise(r => setTimeout(r, 800));
/* 总览弹层 */
await page.evaluate(() => { const b = [...document.querySelectorAll('#topbar .hud-icon')].find(x => x.getAttribute('aria-label') === '设备总览'); b && b.click(); });
await new Promise(r => setTimeout(r, 700));
await page.screenshot({ path: `${OUT}v2-day-infopop.png` });
console.log('infopop shot');
/* 详情卡 */
await page.evaluate(() => { const b = [...document.querySelectorAll('#topbar .hud-icon')].find(x => x.getAttribute('aria-label') === '设备总览'); b && b.click(); });
await page.evaluate(() => window.__ENGINE.selectPart('battery'));
await new Promise(r => setTimeout(r, 1200));
await page.screenshot({ path: `${OUT}v2-day-ctxcard.png` });
console.log('ctxcard shot');
/* 帮助卡 */
await page.keyboard.press('Escape');
await page.keyboard.press('Escape');
await new Promise(r => setTimeout(r, 400));
await page.keyboard.press('?', );
await new Promise(r => setTimeout(r, 700));
await page.screenshot({ path: `${OUT}v2-day-guide.png` });
console.log('guide shot');
await browser.close();
