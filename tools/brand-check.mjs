import puppeteer from 'puppeteer-core';
import { existsSync } from 'node:fs';
const OUT = new URL('../docs/design/screenshots/', import.meta.url).pathname;
function findChrome(){
  const c = ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'];
  for(const p of c) if(existsSync(p)) return p; throw new Error('no chrome');
}
const browser = await puppeteer.launch({ executablePath: findChrome(), headless: 'new', args: ['--enable-unsafe-swiftshader','--no-sandbox'] });
const page = await browser.newPage();
const errors = [];
page.on('pageerror', e => errors.push(e.message));
await page.setViewport({ width: 1440, height: 900 });
await page.goto('http://127.0.0.1:8137/#/', { waitUntil: 'networkidle2', timeout: 45000 });
await new Promise(r => setTimeout(r, 2600));
console.log('title:', await page.title());
console.log('mark:', await page.evaluate(() => document.querySelector('.hub-mark')?.textContent.trim().replace(/\s+/g,' ')));
console.log('foot:', await page.evaluate(() => [...document.querySelectorAll('.hub-foot span')].map(s=>s.textContent.trim()).pop()));
await page.screenshot({ path: `${OUT}r6-lobby-brand.png` });
/* 设备屏幕通知卡：iphone-16（screen.js home 通知卡） */
await page.goto('http://127.0.0.1:8137/#/device/iphone-16', { waitUntil: 'domcontentloaded', timeout: 60000 });
await page.waitForFunction(() => { const e = window.__ENGINE; const s = e && e.getState(); return s && s.booted && s.partsCount > 0; }, { timeout: 90000, polling: 200 });
await new Promise(r => setTimeout(r, 1500));
/* 聚焦屏幕部件确认画布文字（直接截整机画面） */
await page.screenshot({ path: `${OUT}r6-device-screen.png` });
console.log('screen shot ok');
await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
await page.goto('http://127.0.0.1:8137/#/', { waitUntil: 'networkidle2', timeout: 45000 });
await new Promise(r => setTimeout(r, 2400));
await page.screenshot({ path: `${OUT}r6-lobby-brand-mobile.png` });
console.log('mobile ok');
await browser.close();
console.log(errors.length ? 'PAGE ERRORS:\n' + errors.join('\n') : '(no page errors)');
