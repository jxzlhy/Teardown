/* FORGE-99 环式磁耦合核心（PHASE 6 创造性标杆）验证：生成→轮系联动→爆炸→截图 */
import puppeteer from 'puppeteer-core';
import { existsSync } from 'node:fs';
const OUT = new URL('../docs/design/screenshots/', import.meta.url).pathname;
const c = ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'];
const browser = await puppeteer.launch({ executablePath: c.find(existsSync), headless: 'new', args: ['--enable-unsafe-swiftshader','--no-sandbox'] });
const page = await browser.newPage();
const errors = [];
page.on('pageerror', e => errors.push('PAGEERROR: ' + e.message.slice(0, 160)));
page.on('console', m => { if (m.type() === 'error') errors.push('CONSOLE: ' + m.text().slice(0, 160)); });
await page.setViewport({ width: 1440, height: 900 });
page.setDefaultTimeout(25000);
const booted = () => page.waitForFunction(() => { const e = window.__ENGINE; const s = e && e.getState(); return s && s.booted && s.parts && s.parts.length; }, { timeout: 25000, polling: 300 });

/* networkidle2 在 SPA 自动跳转（auto=1）下不可靠（dep 重载/HMR ws）——统一 domcontentloaded + 定置等待 */
await page.goto('http://127.0.0.1:8137/#/forge?gen=ringdrive&preset=heavy&seed=forge99&auto=1', { waitUntil: 'domcontentloaded', timeout: 25000 });
await new Promise(r => setTimeout(r, 3000));
await booted();
const st1 = await page.evaluate(() => {
  const s = window.__ENGINE.getState();
  return { id: s.device.id, parts: s.parts.map(p => p.data.id), teeth: (s.device.specs.find(x => x[0] === '轮系') || [])[1] };
});
console.log('rd generated:', JSON.stringify(st1));
await new Promise(r => setTimeout(r, 2000));
await page.screenshot({ path: `${OUT}forge-rd-night.png` });

/* 轮系联动：核心转子+太阳轮同速、支架慢速公转 */
await page.evaluate(() => window.__ENGINE.selectPart('coreRotor'));
await new Promise(r => setTimeout(r, 1000));
const r1 = await page.evaluate(() => {
  const s = window.__ENGINE.getState();
  const rot = id => s.partsById[id] ? s.partsById[id].group.rotation.z : null;
  return { demo: s.demoActive, core: rot('coreRotor'), sun: rot('sunGear'), carrier: rot('carrier') };
});
await new Promise(r => setTimeout(r, 1500));
const r2 = await page.evaluate(() => {
  const s = window.__ENGINE.getState();
  const rot = id => s.partsById[id] ? s.partsById[id].group.rotation.z : null;
  return { core: rot('coreRotor'), sun: rot('sunGear'), carrier: rot('carrier') };
});
const dCore = (r2.core - r1.core), dSun = (r2.sun - r1.sun), dCar = (r2.carrier - r1.carrier);
console.log('spin deltas: core', dCore.toFixed(2), 'sun', dSun.toFixed(2), 'carrier', dCar.toFixed(2),
  '=> 联动成立:', dCore > 2 && Math.abs(dSun - dCore) < 0.05 && dCar > 1 && dCar < dCore);
await page.screenshot({ path: `${OUT}forge-rd-demo.png` });

/* 爆炸 + 复位 */
await page.evaluate(() => { window.__ENGINE.deselect(); window.__ENGINE.setExplode(1); });
await new Promise(r => setTimeout(r, 2400));
await page.screenshot({ path: `${OUT}forge-rd-explode.png` });
await page.evaluate(() => window.__ENGINE.setExplode(0));
await new Promise(r => setTimeout(r, 2200));
const ok = await page.evaluate(() => { const s = window.__ENGINE.getState(); return s.parts.every(p => p.group.position.distanceTo(p.base) < 0.02); });
console.log('explode→reset:', ok ? 'OK' : 'FAIL');

/* 导出冒烟 */
const glb = await page.evaluate(async () => {
  const { exportForgeGLB } = await import('/src/forge/export.js');
  try { const r = await exportForgeGLB(window.__ENGINE.getState().device.id); return { bytes: r.bytes, parts: r.parts }; }
  catch (e) { return { err: String(e.message).slice(0, 60) }; }
});
console.log('glb:', JSON.stringify(glb));

console.log('errors(', errors.length, '):', errors.slice(0, 6));
await browser.close();
