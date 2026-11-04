/* MECHANICAL FORGE 验证：/forge 生成 → 设备页装配/联动演示/爆炸复位/双厅 → docs/design/screenshots/forge-*.png */
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
const booted = () => page.waitForFunction(() => { const e = window.__ENGINE; const s = e && e.getState(); return s && s.booted && s.parts && s.parts.length; }, { timeout: 60000, polling: 300 });

/* 1. /forge 页 */
await page.goto('http://127.0.0.1:8137/#/forge', { waitUntil: 'networkidle2', timeout: 60000 });
await new Promise(r => setTimeout(r, 1200));
const genCount = await page.evaluate(() => document.querySelectorAll('.forge-gen').length);
const paramCount = await page.evaluate(() => document.querySelectorAll('.forge-param').length);
console.log('forge page: gens=', genCount, 'params=', paramCount);
await page.screenshot({ path: `${OUT}forge-page.png` });

/* 2. 设种子并生成 */
await page.evaluate(() => { const i = document.querySelector('.fp-seed input'); const s = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set; s.call(i, 'gewu-v8-demo'); i.dispatchEvent(new Event('input', { bubbles: true })); });
await page.click('.forge-go');
await new Promise(r => setTimeout(r, 2600));
await booted();
const st1 = await page.evaluate(() => {
  const s = window.__ENGINE.getState();
  return { id: s.device.id, parts: s.parts.length, status: s.modelStatus, hall: s.hallMode };
});
console.log('generated:', JSON.stringify(st1));
await new Promise(r => setTimeout(r, 1800));   /* 开场演出落定 */
await page.screenshot({ path: `${OUT}forge-v8-night.png` });

/* 3. 选中曲轴 → 联动演示（曲轴自转 + 活塞往复） */
await page.evaluate(() => { window.__ENGINE.selectPart('crank'); });
await new Promise(r => setTimeout(r, 1600));
const demo1 = await page.evaluate(() => {
  const s = window.__ENGINE.getState();
  const piston = s.partsById['pistons'];
  const m = piston && piston.group.children[0];
  return { demoActive: s.demoActive, pistonMeshY: m ? +m.position.y.toFixed(3) : null };
});
await new Promise(r => setTimeout(r, 900));
const demo2 = await page.evaluate(() => {
  const s = window.__ENGINE.getState();
  const piston = s.partsById['pistons'];
  const m = piston && piston.group.children[0];
  const crank = s.partsById['crank'];
  return { pistonMeshY2: m ? +m.position.y.toFixed(3) : null, crankRotZ: +crank.group.rotation.z.toFixed(3), demoActive: s.demoActive };
});
console.log('motion:', JSON.stringify(demo1), JSON.stringify(demo2),
  '=> pistonMoving:', Math.abs(demo2.pistonMeshY2 - demo1.pistonMeshY) > 0.01,
  'crankSpinning:', Math.abs(demo2.crankRotZ) > 0.05);
await page.screenshot({ path: `${OUT}forge-v8-demo.png` });

/* 4. 爆炸 → 复位（无累计误差） */
await page.evaluate(() => { window.__ENGINE.deselect(); window.__ENGINE.setExplode(1); });
await new Promise(r => setTimeout(r, 2200));
await page.screenshot({ path: `${OUT}forge-v8-explode.png` });
const exPos = await page.evaluate(() => { const s = window.__ENGINE.getState(); return s.parts.map(p => p.group.position.toArray().map(v => +v.toFixed(2))).join('|'); });
await page.evaluate(() => { window.__ENGINE.setExplode(0); });
await new Promise(r => setTimeout(r, 2200));
const baseOk = await page.evaluate(() => {
  const s = window.__ENGINE.getState();
  return s.parts.every(p => p.group.position.distanceTo(p.base) < 0.02);
});
console.log('explode→reset:', baseOk ? 'OK 复位精确' : 'FAIL 复位有残差');

/* 5. 日厅切换（状态不丢失） */
await page.evaluate(() => { const b = [...document.querySelectorAll('#dock .hud-icon')].find(x => x.getAttribute('aria-label') === '白天/黑夜双厅'); b && b.click(); });
await new Promise(r => setTimeout(r, 1800));
const st2 = await page.evaluate(() => ({ hall: window.__ENGINE.getState().hallMode, parts: window.__ENGINE.getState().parts.length }));
console.log('day hall:', JSON.stringify(st2));
await page.screenshot({ path: `${OUT}forge-v8-day.png` });

/* 6. 确定性复现：同 seed 再生成 → 结构一致 */
const same = await page.evaluate(async () => {
  const { createForgeDevice } = await import('/src/forge/registry.js');
  const a = window.__ENGINE.getState().device;
  const b = await createForgeDevice('v8', a.forge.params, a.forge.seed);
  return { idSame: a.id === b.id, posSame: JSON.stringify(a.assembledPos) === JSON.stringify(b.assembledPos), partsSame: a.parts.length === b.parts.length };
});
console.log('determinism:', JSON.stringify(same));

/* 7. 刷新后按持久化记录重建（localStorage 链路） */
await page.goto('http://127.0.0.1:8137/#/device/' + st1.id, { waitUntil: 'networkidle2', timeout: 60000 });
await booted();
const rebuilt = await page.evaluate(() => { const s = window.__ENGINE.getState(); return { id: s.device.id, parts: s.parts.length }; });
console.log('rebuild after reload:', JSON.stringify(rebuilt), 'OK:', rebuilt.id === st1.id && rebuilt.parts === st1.parts);

console.log('\nerrors(', errors.length, '):');
errors.slice(0, 8).forEach(e => console.log(' ', e));
await browser.close();
