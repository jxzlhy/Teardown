/* 拆分悬浮验证：选中电池 → 电池位移 > 0（悬浮弹出），其他零件位置不变 */
import puppeteer from 'puppeteer-core';
import { existsSync } from 'node:fs';
const OUT = new URL('../docs/design/screenshots/', import.meta.url).pathname;
const c = ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'];
const browser = await puppeteer.launch({ executablePath: c.find(existsSync), headless: 'new', args: ['--enable-unsafe-swiftshader','--no-sandbox'] });
const page = await browser.newPage();
page.on('pageerror', e => console.log('PAGEERROR:', String(e && e.message || e).slice(0,140)));
await page.setViewport({ width: 1440, height: 900 });
await page.goto('http://127.0.0.1:8137/#/device/action4', { waitUntil: 'networkidle2', timeout: 90000 });
await page.waitForFunction(() => { const e = window.__ENGINE; const s = e && e.getState(); return s && s.booted; }, { timeout: 80000, polling: 300 });
await new Promise(r => setTimeout(r, 1500));
const before = await page.evaluate(() => {
  const e = window.__ENGINE, THREE = window.__THREE, s = e.getState();
  const out = {};
  for(const pid of ['battery','mainboard','shell']){
    const p = s.partsById[pid];
    if(p) out[pid] = p.group.position.toArray().map(v => +v.toFixed(3));
  }
  return out;
});
console.log('before:', JSON.stringify(before));
await page.evaluate(() => window.__ENGINE.selectPart('battery'));
await new Promise(r => setTimeout(r, 1200));
const after = await page.evaluate(() => {
  const e = window.__ENGINE, THREE = window.__THREE, s = e.getState();
  const out = {};
  for(const pid of ['battery','mainboard','shell']){
    const p = s.partsById[pid];
    if(p) out[pid] = p.group.position.toArray().map(v => +v.toFixed(3));
  }
  return out;
});
console.log('after select battery:', JSON.stringify(after));
const batteryMoved = Math.hypot(
  after.battery[0] - before.battery[0],
  after.battery[1] - before.battery[1],
  after.battery[2] - before.battery[2]
) > 0.1;
const mainboardStill = Math.hypot(
  after.mainboard[0] - before.mainboard[0],
  after.mainboard[1] - before.mainboard[1],
  after.mainboard[2] - before.mainboard[2]
) < 0.01;
console.log(`battery moved: ${batteryMoved} · mainboard still: ${mainboardStill}`);
/* 取消选中 → 收回 */
await page.evaluate(() => window.__ENGINE.deselect());
await new Promise(r => setTimeout(r, 1200));
const restored = await page.evaluate(() => {
  const p = window.__ENGINE.getState().partsById['battery'];
  return p.group.position.toArray().map(v => +v.toFixed(3));
});
console.log('after deselect:', JSON.stringify(restored));
await page.screenshot({ path: `${OUT}v2-focus-float.png` });
await browser.close();
