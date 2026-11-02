/* FORGE-99 验证 v2：probe2 骨架（已证可靠）+ 全步落盘日志 */
import puppeteer from 'puppeteer-core';
import { existsSync, writeFileSync } from 'node:fs';
const L = [];
const log = (s) => { L.push(s); console.log(s); };
const OUT = new URL('../docs/design/screenshots/', import.meta.url).pathname;
const c = ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'];
const browser = await puppeteer.launch({ executablePath: c.find(existsSync), headless: 'new', args: ['--enable-unsafe-swiftshader','--no-sandbox'] });
const page = await browser.newPage();
page.setDefaultTimeout(20000);
page.on('pageerror', e => log('PAGEERROR: ' + e.message.slice(0, 160)));
const booted = () => page.waitForFunction(() => { const e = window.__ENGINE; const s = e && e.getState(); return s && s.booted && s.parts && s.parts.length; }, { timeout: 20000, polling: 300 });

await page.setViewport({ width: 1440, height: 900 });
await page.goto('http://127.0.0.1:8137/#/forge?gen=ringdrive&preset=heavy&seed=forge99&auto=1', { waitUntil: 'domcontentloaded', timeout: 20000 });
await new Promise(r => setTimeout(r, 3000));
await booted();
log('booted: ' + JSON.stringify(await page.evaluate(() => { const s = window.__ENGINE.getState(); return { id: s.device.id, n: s.parts.length }; })));
await page.screenshot({ path: `${OUT}forge-rd-night.png` });

await page.evaluate(() => window.__ENGINE.selectPart('coreRotor'));
await new Promise(r => setTimeout(r, 1000));
const r1 = await page.evaluate(() => { const s = window.__ENGINE.getState(); const rot = id => s.partsById[id].group.rotation.z; return { core: rot('coreRotor'), sun: rot('sunGear'), carrier: rot('carrier'), demo: s.demoActive }; });
await new Promise(r => setTimeout(r, 1500));
const r2 = await page.evaluate(() => { const s = window.__ENGINE.getState(); const rot = id => s.partsById[id].group.rotation.z; return { core: rot('coreRotor'), sun: rot('sunGear'), carrier: rot('carrier') }; });
const dC = r2.core - r1.core, dS = r2.sun - r1.sun, dK = r2.carrier - r1.carrier;
log(`spin: core ${dC.toFixed(2)} sun ${dS.toFixed(2)} carrier ${dK.toFixed(2)} => 联动: ${dC > 2 && Math.abs(dS - dC) < 0.05 && dK > 0.5 && dK < dC}`);
/* 解析速比断言：ω_c/ω_s = Z_s/(Z_s+Z_r)（固定齿圈）——heavy 预设 Zs=18, Zr=49 ⇒ 0.269 */
const ratio = dK / dC;
log(`解析速比 ω_c/ω_s = ${ratio.toFixed(3)}（预期 18/(18+49)=${(18 / 67).toFixed(3)} ±0.02）=> ${Math.abs(ratio - 18 / 67) < 0.02}`);
/* 行星轮自转（meshSpin）：任一行星齿轮 mesh 的自转角应随时间变化 */
const pl = await page.evaluate(() => {
  const g = window.__ENGINE.getState().partsById['carrier'].group;
  const m = [...g.children].find(o => o.name === 'planet_gear0');
  return m ? +m.rotation.z.toFixed(3) : null;
});
await new Promise(r => setTimeout(r, 1200));
const pl2 = await page.evaluate(() => {
  const g = window.__ENGINE.getState().partsById['carrier'].group;
  const m = [...g.children].find(o => o.name === 'planet_gear0');
  return m ? +m.rotation.z.toFixed(3) : null;
});
log(`planet self-spin: ${pl} → ${pl2} => ${pl !== null && Math.abs(pl2 - pl) > 0.5}`);
await page.screenshot({ path: `${OUT}forge-rd-demo.png` });

await page.evaluate(() => { window.__ENGINE.deselect(); window.__ENGINE.setExplode(1); });
await new Promise(r => setTimeout(r, 2400));
await page.screenshot({ path: `${OUT}forge-rd-explode.png` });
await page.evaluate(() => window.__ENGINE.setExplode(0));
await new Promise(r => setTimeout(r, 2200));
log('explode→reset: ' + (await page.evaluate(() => { const s = window.__ENGINE.getState(); return s.parts.every(p => p.group.position.distanceTo(p.base) < 0.02); })));

const glb = await Promise.race([
  page.evaluate(async () => { const { exportForgeGLB } = await import('/src/forge/export.js'); const r = await exportForgeGLB(window.__ENGINE.getState().device.id); return { bytes: r.bytes, parts: r.parts }; }),
  new Promise(res => setTimeout(() => res({ err: 'export evaluate 30s 超时' }), 30000)),
]);
log('glb: ' + JSON.stringify(glb));
writeFileSync('/tmp/rd-verify.log', L.join('\n'));
await browser.close();
log('done');
