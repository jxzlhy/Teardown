/* 屏幕方案审计 v2：painted-screen 设备的 display 部件是否本就有原生贴图（map/emissiveMap） */
import puppeteer from 'puppeteer-core';
import { existsSync } from 'node:fs';
const c = ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'];
const browser = await puppeteer.launch({ executablePath: c.find(existsSync), headless: 'new', args: ['--enable-unsafe-swiftshader','--no-sandbox'] });
const page = await browser.newPage();
await page.setViewport({ width: 1280, height: 800 });
const devices = ['iphone-12-teardown','iphone-13','iphone-16','iphone-17','iphone-18-pro-max','iphone-18-pro-max-burgundy','iphone-duo-fold','galaxy-s22-ultra','modular-smartphone'];
for(const id of devices){
  await page.goto(`http://127.0.0.1:8137/#/device/${id}`, { waitUntil: 'networkidle2', timeout: 60000 });
  try{
    await page.waitForFunction(() => {
      const e = window.__ENGINE; const s = e && e.getState();
      return s && s.booted && /OFFICIAL|COMMUNITY|PROCEDURAL|FALLBACK/.test(s.modelStatus || '');
    }, { timeout: 40000, polling: 300 });
    await new Promise(r => setTimeout(r, 700));
    const report = await page.evaluate(() => {
      const scene = window.__ENGINE.getScene();
      const hit = {}; const seen = new Set();
      scene.traverse(o => {
        if(!o.isMesh || !o.userData || !o.userData.partId) return;
        const pid = o.userData.partId;
        const mats = Array.isArray(o.material) ? o.material : [o.material];
        for(const mat of mats){
          if(!mat) continue;
          const hasMap = !!mat.map, hasEm = !!mat.emissiveMap;
          const key = pid + '|' + mat.uuid + '|' + hasMap + hasEm;
          if(seen.has(key)) continue; seen.add(key);
          if(hasMap || hasEm){
            hit[pid] = hit[pid] || [];
            const img = mat.map && mat.map.image ? `${mat.map.image.width}x${mat.map.image.height}` : (mat.emissiveMap && mat.emissiveMap.image ? `${mat.emissiveMap.image.width}x${mat.emissiveMap.image.height}` : '');
            hit[pid].push((mat.name || 'mat') + (hasMap ? ` map(${img})` : '') + (hasEm ? ` em(${img})` : ''));
          }
        }
      });
      return hit;
    });
    const keys = Object.keys(report);
    console.log(`${id}:`);
    console.log(keys.length ? keys.map(k => `   ${k} → ${[...report[k]].join(' ; ')}`).join('\n') : '   (全部网格无原生贴图)');
  }catch(e){ console.log(`${id}: ERR ${e.message.slice(0,60)}`); }
}
await browser.close();
