/* B-2 验证：gizmo 渲染 + 网格开关 + flyToView 联动机位名 */
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
await new Promise(r => setTimeout(r, 1500));
/* gizmo 存在且有内容 */
const g0 = await page.evaluate(() => {
  const cv = document.querySelector('#gizmo');
  return { exists: !!cv, painted: cv && cv.getContext('2d').getImageData(64, 20, 2, 2).data[3] > 0 };
});
console.log('gizmo:', JSON.stringify(g0));
/* 网格开关 */
await page.click('#gridToggle');
await new Promise(r => setTimeout(r, 300));
const gridOff = await page.evaluate(() => window.__ENGINE.getScene().traverse.length === undefined ? 'skip' : (() => { let v = null; window.__ENGINE.getScene().traverse(o => { if(o.type === 'PolarGridHelper') v = o.visible; }); return v; })());
console.log('grid after toggle:', gridOff);
await page.click('#gridToggle');
/* 正面机位后 gizmo 应高亮「前」 */
await page.keyboard.press('Digit5');
await new Promise(r => setTimeout(r, 1500));
await page.screenshot({ path: `${OUT}v2-coordaid.png` });
console.log('shot ok');
await browser.close();
