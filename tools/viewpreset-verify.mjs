/* 视角预设验证：radial-engine 正面/背面机位截图 + 相机数值 */
import puppeteer from 'puppeteer-core';
import { existsSync } from 'node:fs';
const OUT = new URL('../docs/design/screenshots/', import.meta.url).pathname;
const c = ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'];
const browser = await puppeteer.launch({ executablePath: c.find(existsSync), headless: 'new', args: ['--enable-unsafe-swiftshader','--no-sandbox'] });
const page = await browser.newPage();
page.on('pageerror', e => console.log('PAGEERROR:', e.message.slice(0,120)));
await page.setViewport({ width: 1440, height: 900 });
await page.goto('http://127.0.0.1:8137/#/device/radial-engine', { waitUntil: 'networkidle2', timeout: 90000 });
await page.waitForFunction(() => { const e = window.__ENGINE; const s = e && e.getState(); return s && s.booted; }, { timeout: 80000, polling: 300 });
await new Promise(r => setTimeout(r, 1200));
/* 正面 */
await page.keyboard.press('Digit5');
await new Promise(r => setTimeout(r, 1500));
await page.screenshot({ path: `${OUT}vp-radial-front.png` });
const cam1 = await page.evaluate(() => { const p = window.__ENGINE.getCamera().position; return [+p.x.toFixed(1), +p.y.toFixed(1), +p.z.toFixed(1)]; });
console.log('front cam:', JSON.stringify(cam1));
/* 背面 */
await page.keyboard.press('Digit6');
await new Promise(r => setTimeout(r, 1500));
await page.screenshot({ path: `${OUT}vp-radial-back.png` });
const cam2 = await page.evaluate(() => { const p = window.__ENGINE.getCamera().position; return [+p.x.toFixed(1), +p.y.toFixed(1), +p.z.toFixed(1)]; });
console.log('back cam:', JSON.stringify(cam2));
await browser.close();
