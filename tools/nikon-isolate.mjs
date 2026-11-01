import puppeteer from 'puppeteer-core';
import { existsSync } from 'node:fs';
const OUT = new URL('../docs/design/screenshots/audit-native/', import.meta.url).pathname;
const c = ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'];
const browser = await puppeteer.launch({ executablePath: c.find(existsSync), headless: 'new', args: ['--enable-unsafe-swiftshader','--no-sandbox'] });
const page = await browser.newPage();
await page.setViewport({ width: 900, height: 700 });
await page.goto('http://127.0.0.1:8137/#/device/nikon-z6', { waitUntil: 'networkidle2', timeout: 90000 });
await page.waitForFunction(() => { const e = window.__ENGINE; const s = e && e.getState(); return s && s.booted && s.partsCount > 0; }, { timeout: 80000, polling: 300 });
await new Promise(r => setTimeout(r, 800));
for(const i of [3,4,5,6,7,8]){
  await page.evaluate((idx) => {
    const scene = window.__ENGINE.getScene();
    const meshes = [];
    scene.traverse(o => { if(o.isMesh && o.userData && o.userData.partId && /^Object_/.test(o.name)) meshes.push(o); });
    meshes.forEach((m, j) => { m.visible = j === idx - 2; });   // Object_3 起始
  }, i);
  await new Promise(r => setTimeout(r, 350));
  await page.screenshot({ path: `${OUT}nikon-obj${i}.png` });
}
await page.evaluate(() => { window.__ENGINE.getScene().traverse(o => { if(o.isMesh) o.visible = true; }); });
console.log('6 solo shots done');
await browser.close();
