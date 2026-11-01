import puppeteer from 'puppeteer-core';
import { existsSync } from 'node:fs';
const c = ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'];
const browser = await puppeteer.launch({ executablePath: c.find(existsSync), headless: 'new', args: ['--enable-unsafe-swiftshader','--no-sandbox'] });
const page = await browser.newPage();
await page.setViewport({ width: 1280, height: 800 });
const devices = ['action4','mavic3pro','pocket3','vision-pro'];
const hookPart = { action4: ['front-screen','rear-screen'], mavic3pro: [], pocket3: ['screen'], 'vision-pro': ['display'] };
for(const id of devices){
  await page.goto(`http://127.0.0.1:8137/#/device/${id}`, { waitUntil: 'networkidle2', timeout: 60000 });
  try{
    await page.waitForFunction(() => {
      const e = window.__ENGINE; const s = e && e.getState();
      return s && s.booted && /OFFICIAL|COMMUNITY|PROCEDURAL|FALLBACK/.test(s.modelStatus || '');
    }, { timeout: 40000, polling: 300 });
    await new Promise(r => setTimeout(r, 600));
    const report = await page.evaluate(() => {
      const scene = window.__ENGINE.getScene();
      const hit = {}; const seen = new Set();
      scene.traverse(o => {
        if(!o.isMesh || !o.userData || !o.userData.partId) return;
        const pid = o.userData.partId;
        if(!/screen|display|panel/i.test(pid)) return;
        const mats = Array.isArray(o.material) ? o.material : [o.material];
        for(const mat of mats){
          if(!mat) continue;
          const hasMap = !!mat.map, hasEm = !!mat.emissiveMap;
          const key = pid + '|' + mat.uuid;
          if(seen.has(key)) continue; seen.add(key);
          hit[pid] = hit[pid] || [];
          const img = mat.map && mat.map.image ? `${mat.map.image.width}x${mat.map.image.height}` : '';
          hit[pid].push((mat.name || 'mat') + (hasMap ? ` map(${img})` : '') + (hasEm ? ' em' : ''));
        }
      });
      return hit;
    });
    console.log(`${id}:`, JSON.stringify(report));
  }catch(e){ console.log(`${id}: ERR ${e.message.slice(0,60)}`); }
}
await browser.close();
