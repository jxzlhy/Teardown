import puppeteer from 'puppeteer-core';
import { existsSync } from 'node:fs';
const c = ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'];
const browser = await puppeteer.launch({ executablePath: c.find(existsSync), headless: 'new', args: ['--enable-unsafe-swiftshader','--no-sandbox'] });
const page = await browser.newPage();
await page.setViewport({ width: 1280, height: 800 });
await page.goto('http://127.0.0.1:8137/#/device/nikon-z6', { waitUntil: 'networkidle2', timeout: 90000 });
await page.waitForFunction(() => { const e = window.__ENGINE; const s = e && e.getState(); return s && s.booted && s.partsCount > 0; }, { timeout: 80000, polling: 300 });
await new Promise(r => setTimeout(r, 600));
const data = await page.evaluate(() => {
  const THREE = window.__THREE, scene = window.__ENGINE.getScene();
  const out = [];
  scene.traverse(o => {
    if(!o.isMesh || !o.userData || !o.userData.partId) return;
    const b = new THREE.Box3().setFromObject(o);
    const cc = b.getCenter(new THREE.Vector3());
    out.push({ pid: o.userData.partId, name: (o.name || '?').slice(0, 14), c: [+cc.x.toFixed(2), +cc.y.toFixed(2), +cc.z.toFixed(2)], tris: o.geometry.index ? o.geometry.index.count / 3 : 0 });
  });
  const mp = window.__MAPPTS || []; const s = window.__ENGINE.getState();
  return { meshes: out, mappts: mp, targetWidth: s.device && s.device.targetWidth, hullR: s.hullRadius };
});
console.log(JSON.stringify(data, null, 1));
await browser.close();
