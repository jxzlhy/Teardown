/* 涡扇生成器验证：/forge 深链 auto 生成 → 设备页装配/差速演示/爆炸/日厅 → forge-tf-*.png */
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

/* 1. 深链 auto 生成（覆盖 preset/参数覆盖/seed 三条链路） */
await page.goto('http://127.0.0.1:8137/#/forge?gen=turbofan&preset=narrowbody&fanDiameter=2100&seed=tf-demo&auto=1', { waitUntil: 'networkidle2', timeout: 60000 });
await booted();
const st1 = await page.evaluate(() => {
  const s = window.__ENGINE.getState();
  return { id: s.device.id, parts: s.parts.map(p => p.data.id), fanMM: s.device.forge.params.fanDiameter, bpr: s.device.forge.params.bpr };
});
console.log('tf generated:', JSON.stringify(st1));
await new Promise(r => setTimeout(r, 2000));
await page.screenshot({ path: `${OUT}forge-tf-night.png` });

/* 2. 双转子差速：选中风扇 → 5 转子部件全部进入演示，N1 与 N2 角速度不同 */
await page.evaluate(() => window.__ENGINE.selectPart('fan'));
await new Promise(r => setTimeout(r, 1200));
const r1 = await page.evaluate(() => {
  const s = window.__ENGINE.getState();
  const rot = id => s.partsById[id].group.rotation.z;
  return { demo: s.demoActive, n1_fan: rot('fan'), n2_hpc: rot('hpc') };
});
await new Promise(r => setTimeout(r, 1500));
const r2 = await page.evaluate(() => {
  const s = window.__ENGINE.getState();
  const rot = id => s.partsById[id].group.rotation.z;
  return { n1_fan: rot('fan'), n2_hpc: rot('hpc'), lpt: rot('lpt'), hpt: rot('hpt') };
});
const dN1 = Math.abs(r2.n1_fan - r1.n1_fan), dN2 = Math.abs(r2.n2_hpc - r1.n2_hpc);
console.log('spin:', JSON.stringify(r1), JSON.stringify(r2), '=> N1 Δ:', dN1.toFixed(3), 'N2 Δ:', dN2.toFixed(3), '差速成立:', dN1 > 0.5 && dN2 > 0.5 && Math.abs(dN2 - dN1) > 0.8);
await page.screenshot({ path: `${OUT}forge-tf-demo.png` });

/* 3. 爆炸复位 */
await page.evaluate(() => { window.__ENGINE.deselect(); window.__ENGINE.setExplode(1); });
await new Promise(r => setTimeout(r, 2400));
await page.screenshot({ path: `${OUT}forge-tf-explode.png` });
await page.evaluate(() => window.__ENGINE.setExplode(0));
await new Promise(r => setTimeout(r, 2200));
const baseOk = await page.evaluate(() => { const s = window.__ENGINE.getState(); return s.parts.every(p => p.group.position.distanceTo(p.base) < 0.02); });
console.log('explode→reset:', baseOk ? 'OK' : 'FAIL');

/* 4. 日厅 + 换参数重生（宽体预设） */
await page.evaluate(() => { const b = [...document.querySelectorAll('#dock .hud-icon')].find(x => x.getAttribute('aria-label') === '白天/黑夜双厅'); b && b.click(); });
await new Promise(r => setTimeout(r, 1800));
await page.screenshot({ path: `${OUT}forge-tf-day.png` });
const wide = await page.evaluate(async () => {
  const { createForgeDevice } = await import('/src/forge/registry.js');
  const d = createForgeDevice('turbofan', { fanDiameter: 2400, bpr: 11, hpcStages: 7, lptStages: 4, finish: 'painted', detail: 2 }, 'tf-wide');
  return { id: d.id, parts: d.parts.length, disp: d.specs[1][1] };
});
console.log('widebody preset:', JSON.stringify(wide));

/* 5. /forge 页预设按钮 */
await page.goto('http://127.0.0.1:8137/#/forge', { waitUntil: 'networkidle2', timeout: 60000 });
await new Promise(r => setTimeout(r, 1000));
const ui = await page.evaluate(() => ({ gens: document.querySelectorAll('.forge-gen').length, presets: document.querySelectorAll('.fp-seg button').length }));
console.log('forge ui:', JSON.stringify(ui));

console.log('\nerrors(', errors.length, '):');
errors.slice(0, 8).forEach(e => console.log(' ', e));
await browser.close();
