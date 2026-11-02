/* probe2：1440×900 + 深链 auto=1 完整复刻验证前置 */
import puppeteer from 'puppeteer-core';
import { existsSync } from 'node:fs';
const c = ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'];
const browser = await puppeteer.launch({ executablePath: c.find(existsSync), headless: 'new', args: ['--enable-unsafe-swiftshader','--no-sandbox'] });
const page = await browser.newPage();
page.setDefaultTimeout(20000);
page.on('pageerror', e => console.log('PAGEERROR:', e.message.slice(0, 200)));
console.log('P0 setViewport');
await page.setViewport({ width: 1440, height: 900 });
console.log('P1 goto deep-link');
await page.goto('http://127.0.0.1:8137/#/forge?gen=ringdrive&preset=heavy&seed=forge99&auto=1', { waitUntil: 'domcontentloaded', timeout: 20000 });
console.log('P2 settled');
await new Promise(r => setTimeout(r, 3000));
console.log('P3 url:', page.url());
console.log('P4 booted wait');
try {
  await page.waitForFunction(() => { const e = window.__ENGINE; const s = e && e.getState(); return s && s.booted && s.parts && s.parts.length; }, { timeout: 20000, polling: 300 });
  console.log('P5 booted OK');
  await page.screenshot({ path: '/tmp/probe2.png' });
  console.log('P6 screenshot OK');
} catch (e) { console.log('P5 TIMEOUT:', String(e.message).slice(0, 80)); }
await browser.close();
console.log('done');
