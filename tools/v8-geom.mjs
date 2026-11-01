import puppeteer from 'puppeteer-core';
import { existsSync } from 'node:fs';
const c = ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'];
const browser = await puppeteer.launch({ executablePath: c.find(existsSync), headless: 'new', args: ['--enable-unsafe-swiftshader','--no-sandbox'] });
const page = await browser.newPage();
await page.setViewport({ width: 1280, height: 800 });
await page.goto('http://127.0.0.1:8137/#/device/v8-engine', { waitUntil: 'networkidle2', timeout: 60000 });
await page.waitForFunction(() => {
  const e = window.__ENGINE; const s = e && e.getState();
  return s && s.booted && /OFFICIAL|COMMUNITY|PROCEDURAL|FALLBACK/.test(s.modelStatus || '');
}, { timeout: 60000, polling: 300 });
await new Promise(r => setTimeout(r, 800));
const geom = await page.evaluate(() => {
  const e = window.__ENGINE, THREE = window.__THREE;
  const out = {};
  for(const pid of ['crank','pistons','head-l','head-r']){
    const p = e.getState().partsById ? e.getState().partsById[pid] : null;
    if(!p) { out[pid] = 'MISSING'; continue; }
    const bb = new THREE.Box3().setFromObject(p.group);
    const size = bb.getSize(new THREE.Vector3());
    const c0 = bb.getCenter(new THREE.Vector3());
    const meshes = [];
    p.group.traverse(o => { if(o.isMesh) meshes.push(o); });
    const mm = meshes.slice(0, 12).map(m => {
      const b = new THREE.Box3().setFromObject(m);
      const cc = b.getCenter(new THREE.Vector3());
      return [+cc.x.toFixed(1), +cc.y.toFixed(1), +cc.z.toFixed(1)];
    });
    out[pid] = { center: [+c0.x.toFixed(1),+c0.y.toFixed(1),+c0.z.toFixed(1)], size: [+size.x.toFixed(1),+size.y.toFixed(1),+size.z.toFixed(1)], meshCount: meshes.length, meshCenters: mm };
  }
  return out;
});
console.log(JSON.stringify(geom, null, 1));
await browser.close();
