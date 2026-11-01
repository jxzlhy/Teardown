/* 复现：点击零件后其他部件的可见度（是否被隐藏/遮挡） */
import puppeteer from 'puppeteer-core';
import { existsSync } from 'node:fs';
const c = ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'];
const browser = await puppeteer.launch({ executablePath: c.find(existsSync), headless: 'new', args: ['--enable-unsafe-swiftshader','--no-sandbox'] });
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900 });
await page.goto('http://127.0.0.1:8137/#/device/action4?p=battery', { waitUntil: 'networkidle2', timeout: 90000 });
await page.waitForFunction(() => { const e = window.__ENGINE; const s = e && e.getState(); return s && s.booted && s.selected; }, { timeout: 80000, polling: 300 });
await new Promise(r => setTimeout(r, 3000));
const vis = await page.evaluate(() => {
  const THREE = window.__THREE, scene = window.__ENGINE.getScene();
  const parts = {};
  scene.traverse(o => {
    if(!o.isMesh || !o.userData || !o.userData.partId) return;
    const pid = o.userData.partId;
    if(!parts[pid]) parts[pid] = { visible: 0, total: 0, opacity: [] };
    parts[pid].total++;
    if(o.visible) parts[pid].visible++;
    const mats = Array.isArray(o.material) ? o.material : [o.material];
    for(const m of mats){
      if(m && m.transparent && m.opacity < 1) parts[pid].opacity.push(+m.opacity.toFixed(2));
    }
  });
  return parts;
});
console.log('part visibility:', JSON.stringify(vis, null, 1).slice(0, 800));
await page.screenshot({ path: new URL('../docs/design/screenshots/focus-battery-before.png', import.meta.url).pathname });
await browser.close();
