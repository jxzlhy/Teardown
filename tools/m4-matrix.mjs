import puppeteer from 'puppeteer-core';
import { existsSync } from 'node:fs';
const c = ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'];
const browser = await puppeteer.launch({ executablePath: c.find(existsSync), headless: 'new', args: ['--enable-unsafe-swiftshader','--no-sandbox'] });
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900 });
await page.goto('http://127.0.0.1:8137/#/device/m4-carbine', { waitUntil: 'networkidle2', timeout: 90000 });
await page.waitForFunction(() => { const e = window.__ENGINE; const s = e && e.getState(); return s && s.booted; }, { timeout: 80000, polling: 300 });
await new Promise(r => setTimeout(r, 4000));   // 等 boot 演出完全结束
const m = await page.evaluate(() => {
  const THREE = window.__THREE, scene = window.__ENGINE.getScene();
  let mesh = null;
  scene.traverse(o => { if(!mesh && o.isMesh && o.userData && o.userData.partId === 'grip') mesh = o; });
  if(!mesh) return { err: 'grip mesh not found' };
  mesh.geometry.computeBoundingBox();
  const raw = mesh.geometry.boundingBox.getSize(new THREE.Vector3()).toArray().map(v => +v.toFixed(3));
  const world = new THREE.Box3().setFromObject(mesh).getSize(new THREE.Vector3()).toArray().map(v => +v.toFixed(3));
  const chain = [];
  let p = mesh;
  while(p && p.type !== 'Scene'){ chain.push(`${p.type}:${(p.name || '?')} s=${p.scale.x.toPrecision(3)}`); p = p.parent; }
  // 强制全链矩阵更新后再测
  mesh.updateWorldMatrix(true, true);
  const forced = new THREE.Box3().setFromObject(mesh).getSize(new THREE.Vector3()).toArray().map(v=>+v.toFixed(3));
  mesh.geometry.computeBoundingBox();
  const gRaw = mesh.geometry.boundingBox.getSize(new THREE.Vector3()).toArray().map(v=>+v.toFixed(3));
  const cam = window.__ENGINE.getCamera();
  return { raw: gRaw, world, forced, chain: chain.reverse(), camPos: cam.position.toArray().map(v=>+v.toFixed(1)), rawBboxFromSetFromObject_withPreciseTrue: (() => { const b = new THREE.Box3().setFromObject(mesh, true); return b.getSize(new THREE.Vector3()).toArray().map(v=>+v.toFixed(3)); })() };
});
console.log(JSON.stringify(m, null, 1));
await page.screenshot({ path: new URL('../docs/design/screenshots/m4-after-boot.png', import.meta.url).pathname });
await browser.close();
