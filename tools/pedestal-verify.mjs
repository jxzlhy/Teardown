/* 展台验证：可见性、随设备缩放、日厅材质、双模式截图 */
import puppeteer from 'puppeteer-core';
import { existsSync } from 'node:fs';
const OUT = new URL('../docs/design/screenshots/', import.meta.url).pathname;
const c = ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'];
const browser = await puppeteer.launch({ executablePath: c.find(existsSync), headless: 'new', args: ['--enable-unsafe-swiftshader','--no-sandbox'] });
const page = await browser.newPage();
page.on('pageerror', e => console.log('PAGEERROR:', String(e && e.message || e).slice(0,140)));
await page.setViewport({ width: 1440, height: 900 });
/* 夜厅 action4 */
await page.goto('http://127.0.0.1:8137/#/device/action4', { waitUntil: 'networkidle2', timeout: 90000 });
await page.waitForFunction(() => { const e = window.__ENGINE; const s = e && e.getState(); return s && s.booted; }, { timeout: 80000, polling: 300 });
await new Promise(r => setTimeout(r, 1200));
const night = await page.evaluate(() => {
  let ped = null, ring = null, cap = null;
  window.__ENGINE.getScene().traverse(o => {
    if(o.type === 'Mesh' && o.material?.color){
      if(!ped && o.geometry?.type === 'CylinderGeometry' && o.position.y < -4) ped = o;
    }
  });
  return { deviceRadius: window.__ENGINE.getState().deviceRadius, pedFound: !!ped };
});
console.log('night:', JSON.stringify(night));
await page.screenshot({ path: `${OUT}v2-pedestal-night.png` });
/* 切日厅 */
await page.evaluate(() => window.__ENGINE.setHallMode('day'));
await new Promise(r => setTimeout(r, 1000));
await page.screenshot({ path: `${OUT}v2-pedestal-day.png` });
/* 大设备 radial 缩放差异 */
await page.goto('http://127.0.0.1:8137/#/device/radial-engine', { waitUntil: 'networkidle2', timeout: 90000 });
await page.waitForFunction(() => { const e = window.__ENGINE; const s = e && e.getState(); return s && s.booted; }, { timeout: 80000, polling: 300 });
await new Promise(r => setTimeout(r, 1200));
console.log('radial:', await page.evaluate(() => window.__ENGINE.getState().deviceRadius.toFixed(1)));
await page.screenshot({ path: `${OUT}v2-pedestal-radial.png` });
await browser.close();
