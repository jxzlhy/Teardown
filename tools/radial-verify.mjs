/* radial-engine 验证：三部件网格分配 + 截图 */
import puppeteer from 'puppeteer-core';
import { existsSync } from 'node:fs';
const OUT = new URL('../docs/design/screenshots/', import.meta.url).pathname;
const c = ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'];
const browser = await puppeteer.launch({ executablePath: c.find(existsSync), headless: 'new', args: ['--enable-unsafe-swiftshader','--no-sandbox'] });
const page = await browser.newPage();
page.on('pageerror', e => console.log('PAGEERROR:', e.message.slice(0,120)));
await page.setViewport({ width: 1440, height: 900 });
await page.goto('http://127.0.0.1:8137/#/device/radial-engine?e=1', { waitUntil: 'networkidle2', timeout: 90000 });
await page.waitForFunction(() => {
  const e = window.__ENGINE; const s = e && e.getState();
  return s && s.booted && /OFFICIAL|COMMUNITY|PROCEDURAL|FALLBACK/.test(s.modelStatus || '');
}, { timeout: 80000, polling: 300 });
await new Promise(r => setTimeout(r, 3000));
const stats = await page.evaluate(() => {
  const s = window.__ENGINE.getState();
  return { parts: s.partsCount, status: s.modelStatus };
});
console.log('parts:', JSON.stringify(stats));
await page.screenshot({ path: `${OUT}radial-exploded.png` });
console.log('shot exploded');
await page.evaluate(() => window.__ENGINE.selectPart('hub'));
await new Promise(r => setTimeout(r, 1200));
await page.screenshot({ path: `${OUT}radial-hub-demo.png` });
console.log('shot hub');
await browser.close();
