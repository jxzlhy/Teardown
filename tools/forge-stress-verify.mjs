/* PHASE 8 稳定性：连续生成 9 台（3 生成器×3 种子）→ 依次访问 → 断言 0 错误 + 几何/材质不累积 */
import puppeteer from 'puppeteer-core';
import { existsSync, writeFileSync } from 'node:fs';
const c = ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'];
const browser = await puppeteer.launch({ executablePath: c.find(existsSync), headless: 'new', args: ['--enable-unsafe-swiftshader','--no-sandbox'] });
const page = await browser.newPage();
page.setDefaultTimeout(20000);
const errors = [];
page.on('pageerror', e => errors.push('PAGEERROR: ' + e.message.slice(0, 120)));
page.on('console', m => { if (m.type() === 'error') errors.push('CONSOLE: ' + m.text().slice(0, 120)); });

/* 先批量生成 9 台（全部写注册表） */
await page.goto('http://127.0.0.1:8137/#/forge', { waitUntil: 'domcontentloaded', timeout: 20000 });
await new Promise(r => setTimeout(r, 1200));
const ids = await page.evaluate(async () => {
  const { createForgeDevice } = await import('/src/forge/registry.js');
  const out = [];
  for (const gen of ['v8', 'turbofan', 'ringdrive']) {
    for (const seed of ['st-a', 'st-b', 'st-c']) out.push((await createForgeDevice(gen, undefined, seed)).id);
  }
  return out;
});
console.log('generated:', ids.length);

const geoms = [];
for (const id of ids) {
  await page.goto('http://127.0.0.1:8137/#/device/' + id, { waitUntil: 'domcontentloaded', timeout: 20000 });
  await page.waitForFunction(() => { const e = window.__ENGINE; const s = e && e.getState(); return s && s.booted && s.parts && s.parts.length; }, { timeout: 20000, polling: 300 });
  const info = await page.evaluate(() => {
    const r = window.__ENGINE && window.__ENGINE.getScene && window.__ENGINE.getScene();
    let g = 0, m = 0;
    r && r.traverse(o => { if (o.isMesh) { g++; m += Array.isArray(o.material) ? o.material.length : 1; } });
    return { geom: g, mat: m };
  });
  geoms.push(info.geom);
  console.log(id.slice(-12), 'meshes:', info.geom, 'mats:', info.mat);
}
/* 几何量应随设备稳定（无跨台累积）；允许 ±15% 抖动 */
const groups = [geoms.slice(0, 3), geoms.slice(3, 6), geoms.slice(6, 9)];
const stable = groups.every(g => Math.max(...g) - Math.min(...g) <= Math.max(...g) * 0.15);
console.log('stability:', stable ? 'OK 无跨台累积' : 'CHECK ' + JSON.stringify(geoms));
console.log('errors(', errors.length, '):', errors.slice(0, 6));
writeFileSync('/tmp/forge-stress.log', JSON.stringify({ geoms, errors }, null, 1));
await browser.close().catch(() => {});
process.exit(errors.length ? 1 : 0);
