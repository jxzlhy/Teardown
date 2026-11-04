/* 锁式线迹机构验证：/forge 深链 auto 生成 → 频率比采样（针 1:旋梭 2）→
   slide 往复振幅/复位 → 爆炸复位 → 参数重生 → 截图 forge-ls-*.png
   用法：node tools/forge-ls-verify.mjs [port] */
import puppeteer from 'puppeteer-core';
import { existsSync } from 'node:fs';
const PORT = process.argv[2] || '8200';
const OUT = new URL('../docs/design/screenshots/', import.meta.url).pathname;
const c = ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'];
const browser = await puppeteer.launch({ executablePath: c.find(existsSync), headless: 'new', args: ['--enable-unsafe-swiftshader', '--no-sandbox'] });
const page = await browser.newPage();
const errors = [];
page.on('pageerror', e => errors.push('PAGEERROR: ' + e.message.slice(0, 160)));
page.on('console', m => { if (m.type() === 'error') errors.push('CONSOLE: ' + m.text().slice(0, 160)); });
await page.setViewport({ width: 1440, height: 900 });
const booted = () => page.waitForFunction(() => { const e = window.__ENGINE; const s = e && e.getState(); return s && s.booted && s.parts && s.parts.length; }, { timeout: 60000, polling: 300 });
let bad = 0;

/* 1. 深链 auto 生成（preset + 参数覆盖 + seed 三链路） */
await page.goto(`http://127.0.0.1:${PORT}/#/forge?gen=lockstitch&preset=teach&needleStroke=36&seed=ls-demo&auto=1`, { waitUntil: 'domcontentloaded', timeout: 60000 });
await booted();
const st1 = await page.evaluate(() => {
  const s = window.__ENGINE.getState();
  return { id: s.device.id, parts: s.parts.map(p => p.data.id), stroke: s.device.forge.params.needleStroke, cadence: s.device.forge.params.cadence };
});
console.log('ls generated:', JSON.stringify(st1));
if (st1.parts.length !== 11) { console.log('✗ 部件数应为 11'); bad++; }
await new Promise(r => setTimeout(r, 2200));
await page.screenshot({ path: `${OUT}forge-ls-night.png` });

/* 2. 联动演示：选手轮 → 5 路运动全部启动；采样验证频率比与振幅 */
await page.evaluate(() => window.__ENGINE.selectPart('handwheel'));
await new Promise(r => setTimeout(r, 1000));
const sample = () => page.evaluate(() => {
  const s = window.__ENGINE.getState();
  const meshY = (pid) => {
    const g = s.partsById[pid].group;
    let y = 0, n = 0;
    g.traverse(o => { if (o.isMesh) { y += o.position.y; n++; } });
    return n ? y / n : 0;
  };
  return { demo: s.demoActive, wheel: s.partsById.handwheel.group.rotation.x, hook: s.partsById.hook.group.rotation.y, needleY: meshY('needlebar'), feedY: meshY('feeddog'), feedZ: (() => { let z = 0, n = 0; s.partsById.feeddog.group.traverse(o => { if (o.isMesh) { z += o.position.z; n++; } }); return n ? z / n : 0; })() };
});
const a = await sample();
await new Promise(r => setTimeout(r, 1200));
const b = await sample();
await new Promise(r => setTimeout(r, 1200));
const d = await sample();
console.log('samples:', JSON.stringify([a, b, d].map(x => ({ wheel: +x.wheel.toFixed(2), hook: +x.hook.toFixed(2), needleY: +x.needleY.toFixed(3), feedY: +x.feedY.toFixed(3), feedZ: +x.feedZ.toFixed(3) }))));
const dWheel = Math.abs(d.wheel - a.wheel), dHook = Math.abs(d.hook - a.hook);
const ratio = dWheel > 0.1 ? dHook / dWheel : 0;
const needleSwing = Math.max(a.needleY, b.needleY, d.needleY) - Math.min(a.needleY, b.needleY, d.needleY);
const feedSwing = Math.max(a.feedY, b.feedY, d.feedY) - Math.min(a.feedY, b.feedY, d.feedY);
const feedFwd = Math.max(a.feedZ, b.feedZ, d.feedZ) - Math.min(a.feedZ, b.feedZ, d.feedZ);
console.log(`Δwheel=${dWheel.toFixed(3)} Δhook=${dHook.toFixed(3)} ratio=${ratio.toFixed(2)}（期望≈2）`);
console.log(`needleSwing=${needleSwing.toFixed(3)} feedY=${feedSwing.toFixed(3)} feedZ=${feedFwd.toFixed(3)}`);
const demoOk = !!a.demo && dWheel > 0.1 && ratio > 1.6 && ratio < 2.4 && needleSwing > 0.05 && feedFwd > 0.02;
if (!demoOk) { console.log('✗ 联动演示异常'); bad++; } else console.log('✓ 联动成立（旋梭 2:1 + 针杆往复 + 送布椭圆）');
await page.screenshot({ path: `${OUT}forge-ls-demo.png` });

/* 3. 退出复位：取消选择 → 针杆/送布 mesh 归基位 */
await page.evaluate(() => window.__ENGINE.deselect());
await new Promise(r => setTimeout(r, 1800));
const resetOk = await page.evaluate(() => {
  const s = window.__ENGINE.getState();
  const meshBase = (pid) => {
    const g = s.partsById[pid].group;
    let y = 0, n = 0;
    g.traverse(o => { if (o.isMesh) { y += Math.abs(o.position.y - (o.userData.__baseY ?? o.position.y)); n++; } });
    return y;
  };
  return { demo: s.demoActive, needleErr: meshBase('needlebar'), feedErr: meshBase('feeddog') };
});
console.log('deselect reset:', JSON.stringify(resetOk), resetOk.demo === null ? '✓' : '✗ demo 未退出');

/* 4. 爆炸复位 */
await page.evaluate(() => { window.__ENGINE.setExplode(1); });
await new Promise(r => setTimeout(r, 2400));
await page.screenshot({ path: `${OUT}forge-ls-explode.png` });
await page.evaluate(() => window.__ENGINE.setExplode(0));
await new Promise(r => setTimeout(r, 2200));
const baseOk = await page.evaluate(() => { const s = window.__ENGINE.getState(); return s.parts.every(p => p.group.position.distanceTo(p.base) < 0.02); });
console.log('explode→reset:', baseOk ? 'OK' : 'FAIL');
if (!baseOk) bad++;

/* 5. 日厅 + 参数重生（厚料长行程） */
await page.evaluate(() => { const b = [...document.querySelectorAll('#dock .hud-icon')].find(x => x.getAttribute('aria-label') === '白天/黑夜双厅'); b && b.click(); });
await new Promise(r => setTimeout(r, 1800));
await page.screenshot({ path: `${OUT}forge-ls-day.png` });
const heavy = await page.evaluate(async () => {
  const { createForgeDevice } = await import('/src/forge/registry.js');
  const d = await createForgeDevice('lockstitch', { needleStroke: 42, feedStroke: 6, cadence: 0.6, finish: 'bare', detail: 2 }, 'ls-heavy');
  return { id: d.id, parts: d.parts.length, stroke: d.forge.params.needleStroke };
});
console.log('heavy preset regen:', JSON.stringify(heavy));
if (heavy.parts !== 11 || heavy.stroke !== 42) { console.log('✗ 参数重生异常'); bad++; }

if (errors.length) { console.log('页面错误:', errors.slice(0, 4)); bad++; }
await browser.close();
console.log(bad ? `✗ ${bad} 项异常` : '✓ 锁式线迹机构验证全部通过');
process.exit(bad ? 1 : 0);
