/* V8 演示验证：选 crank（旋转）与 pistons（往复），采样位移/旋转，并截图 */
import puppeteer from 'puppeteer-core';
import { existsSync } from 'node:fs';
const OUT = new URL('../docs/design/screenshots/', import.meta.url).pathname;
const c = ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'];
const browser = await puppeteer.launch({ executablePath: c.find(existsSync), headless: 'new', args: ['--enable-unsafe-swiftshader','--no-sandbox'] });
const page = await browser.newPage();
page.on('pageerror', e => console.log('PAGEERROR:', e.message.slice(0,120)));
await page.setViewport({ width: 1440, height: 900 });
await page.goto('http://127.0.0.1:8137/#/device/v8-engine', { waitUntil: 'networkidle2', timeout: 90000 });
await page.waitForFunction(() => {
  const e = window.__ENGINE; const s = e && e.getState();
  return s && s.booted && /OFFICIAL|COMMUNITY|PROCEDURAL|FALLBACK/.test(s.modelStatus || '');
}, { timeout: 90000, polling: 300 });
await new Promise(r => setTimeout(r, 1200));

/* crank：选中后应绕 Z 旋转。仪表化说明：该设备 spinPivot:'center'（旋转在 pivot 子对象），
   getPartRotation 读 group 恒 0 —— 故用曲轴 mesh 世界位移判定实际运动（对 pivot/直旋均成立） */
await page.evaluate(() => window.__ENGINE.selectPart('crank'));
await page.waitForFunction(() => window.__ENGINE.getState().demoActive, { timeout: 6000, polling: 100 });
const c1 = await page.evaluate(() => {
  const T = window.__THREE, v = new T.Vector3();
  let m = null; window.__ENGINE.getScene().traverse(o => { if (!m && o.isMesh && o.userData && o.userData.partId === 'crank') m = o; });
  return m.getWorldPosition(v).toArray().map(x => +x.toFixed(3)).join(',');
});
await new Promise(r => setTimeout(r, 900));
const c2 = await page.evaluate(() => {
  const T = window.__THREE, v = new T.Vector3();
  let m = null; window.__ENGINE.getScene().traverse(o => { if (!m && o.isMesh && o.userData && o.userData.partId === 'crank') m = o; });
  return m.getWorldPosition(v).toArray().map(x => +x.toFixed(3)).join(',');
});
const d1 = c1.split(','), d2 = c2.split(',');
const dist = Math.hypot(d2[0] - d1[0], d2[1] - d1[1], d2[2] - d1[2]);
console.log('crank mesh 世界位移 =', dist.toFixed(3), '(应 > 0.1，pivot 旋转可视位移)');
await new Promise(r => setTimeout(r, 400));
await page.screenshot({ path: `${OUT}v8-crank-demo.png` });

/* pistons：mesh 位移采样（经引擎 API 无 per-mesh 句柄 → 用场景遍历找 pistons 组内 mesh 的 y 变化） */
await page.evaluate(() => window.__ENGINE.selectPart('pistons'));
await page.waitForFunction(() => { const s = window.__ENGINE.getState(); return s.demoActive && /活塞/.test(s.demoActive); }, { timeout: 6000, polling: 100 });
const sample = await page.evaluate(async () => {
  const scene = window.__ENGINE.getScene(), THREE = window.__THREE;
  let group = null;
  scene.traverse(o => { if(!group && o.isMesh && o.userData && o.userData.partId === 'pistons') group = o.parent; });
  if(!group) return null;
  const probe = [];
  group.traverse(o => { if(o.isMesh) probe.push({ o, y0: o.position.y }); });
  await new Promise(r => setTimeout(r, 600));
  return probe.map(p => +(p.o.position.y - p.y0).toFixed(3));
});
console.log('piston mesh Δy 采样:', JSON.stringify(sample), '(应有正有负=相位差)');
await page.screenshot({ path: `${OUT}v8-pistons-demo.png` });
/* 退出复位验证 */
await page.evaluate(() => window.__ENGINE.selectPart(null));
await new Promise(r => setTimeout(r, 1400));
const restored = await page.evaluate(() => {
  const scene = window.__ENGINE.getScene();
  let group = null;
  scene.traverse(o => { if(!group && o.isMesh && o.userData && o.userData.partId === 'pistons') group = o.parent; });
  let maxOff = 0;
  group.traverse(o => { if(o.isMesh) maxOff = Math.max(maxOff, Math.abs(o.position.y - o.userData.__baseY ?? 0)); });
  return window.__ENGINE.getState().demoActive;
});
console.log('demoActive after exit:', restored, '(应为 null)');
await browser.close();
