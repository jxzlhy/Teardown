import puppeteer from 'puppeteer-core';
import { existsSync } from 'node:fs';
const OUT = new URL('../docs/design/screenshots/audit-native/', import.meta.url).pathname;
const c = ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'];
const browser = await puppeteer.launch({ executablePath: c.find(existsSync), headless: 'new', args: ['--enable-unsafe-swiftshader','--no-sandbox'] });
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900 });
await page.goto('http://127.0.0.1:8137/#/device/iphone-13?e=1', { waitUntil: 'networkidle2', timeout: 60000 });
await page.waitForFunction(() => {
  const e = window.__ENGINE; const s = e && e.getState();
  return s && s.booted && /OFFICIAL|COMMUNITY|PROCEDURAL|FALLBACK/.test(s.modelStatus || '');
}, { timeout: 45000, polling: 300 });
await new Promise(r => setTimeout(r, 3000));
/* 标签全开方便读位置 */
await page.evaluate(() => window.__ENGINE.setLabels('all'));
await new Promise(r => setTimeout(r, 800));
await page.screenshot({ path: `${OUT}part-iphone13-exploded.png` });
console.log('shot');
/* 数据核实：speaker 与 flash 的装配位（base）与爆炸偏移 */
const info = await page.evaluate(() => {
  const e = window.__ENGINE, THREE = window.__THREE, s = e.getState();
  const out = {};
  for(const pid of ['speaker','flash','port','display']){
    const p = s.partsById[pid]; if(!p) continue;
    const b = new THREE.Box3().setFromObject(p.group);
    const c = b.getCenter(new THREE.Vector3());
    out[pid] = { base: p.base.toArray().map(v=>+v.toFixed(1)), nowCenter: c.toArray().map(v=>+v.toFixed(1)), ex: p.offset.toArray().map(v=>+v.toFixed(1)) };
  }
  return out;
});
console.log(JSON.stringify(info, null, 1));
await browser.close();
