import puppeteer from 'puppeteer-core';
import { existsSync } from 'node:fs';
const OUT = new URL('../docs/design/screenshots/', import.meta.url).pathname;
const c = ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'];
const browser = await puppeteer.launch({ executablePath: c.find(existsSync), headless: 'new', args: ['--enable-unsafe-swiftshader','--no-sandbox'] });
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900 });
await page.goto('http://127.0.0.1:8137/#/device/m4-carbine', { waitUntil: 'networkidle2', timeout: 90000 });
await page.waitForFunction(() => { const e = window.__ENGINE; const s = e && e.getState(); return s && s.booted; }, { timeout: 80000, polling: 300 });
await new Promise(r => setTimeout(r, 1500));
const info = await page.evaluate(() => {
  const s = window.__ENGINE.getState();
  const THREE = window.__THREE;
  const sizes = {};
  const scene = window.__ENGINE.getScene();
  scene.traverse(o => {
    if(!o.isMesh || !o.userData || !o.userData.partId) return;
    const b = new THREE.Box3().setFromObject(o);
    sizes[o.userData.partId] = b.getSize(new THREE.Vector3()).toArray().map(v => +v.toFixed(2));
  });
  return { parts: s.partsCount, status: s.modelStatus, meshSizes: sizes, hullRadius: s.hullRadius };
});
console.log(JSON.stringify(info, null, 1));
await page.screenshot({ path: `${OUT}m4-check.png` });
await browser.close();
