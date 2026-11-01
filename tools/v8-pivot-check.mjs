import puppeteer from 'puppeteer-core';
import { existsSync } from 'node:fs';
const c = ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'];
const browser = await puppeteer.launch({ executablePath: c.find(existsSync), headless: 'new', args: ['--enable-unsafe-swiftshader','--no-sandbox'] });
const page = await browser.newPage();
await page.setViewport({ width: 1280, height: 800 });
await page.goto('http://127.0.0.1:8137/#/device/v8-engine', { waitUntil: 'networkidle2', timeout: 90000 });
await page.waitForFunction(() => { const e = window.__ENGINE; const s = e && e.getState(); return s && s.booted; }, { timeout: 90000, polling: 300 });
await new Promise(r => setTimeout(r, 800));
const check = await page.evaluate(async () => {
  const e = window.__ENGINE, THREE = window.__THREE;
  e.selectPart('crank');
  await new Promise(r => setTimeout(r, 400));
  const centerOf = () => {
    const scene = e.getScene();
    let g = null;
    scene.traverse(o => { if(!g && o.isMesh && o.userData && o.userData.partId === 'crank') g = o.parent; });
    const bb = new THREE.Box3().setFromObject(g);
    return bb.getCenter(new THREE.Vector3()).toArray().map(v => +v.toFixed(2));
  };
  const c1 = centerOf();
  await new Promise(r => setTimeout(r, 900));
  const c2 = centerOf();
  return { c1, c2, drift: +Math.hypot(c2[0]-c1[0], c2[1]-c1[1], c2[2]-c1[2]).toFixed(3) };
});
console.log('crank bbox center before/after:', JSON.stringify(check), '(drift≈0 = 绕自身轴)');
await browser.close();
