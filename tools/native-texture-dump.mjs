/* 导出 display 部件的原生屏幕贴图内容（画到小图导出 PNG），判定是否真实屏幕画面 */
import puppeteer from 'puppeteer-core';
import { existsSync } from 'node:fs';
import { writeFileSync } from 'node:fs';
const OUT = new URL('../docs/design/screenshots/audit-native/', import.meta.url).pathname;
import { mkdirSync } from 'node:fs';
mkdirSync(OUT, { recursive: true });
const c = ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'];
const browser = await puppeteer.launch({ executablePath: c.find(existsSync), headless: 'new', args: ['--enable-unsafe-swiftshader','--no-sandbox'] });
const page = await browser.newPage();
await page.setViewport({ width: 1280, height: 800 });
const devices = ['iphone-12-teardown','iphone-13','iphone-16','iphone-17','iphone-18-pro-max','iphone-duo-fold','galaxy-s22-ultra','modular-smartphone'];
for(const id of devices){
  await page.goto(`http://127.0.0.1:8137/#/device/${id}`, { waitUntil: 'networkidle2', timeout: 60000 });
  try{
    await page.waitForFunction(() => {
      const e = window.__ENGINE; const s = e && e.getState();
      return s && s.booted && /OFFICIAL|COMMUNITY|PROCEDURAL|FALLBACK/.test(s.modelStatus || '');
    }, { timeout: 40000, polling: 300 });
    await new Promise(r => setTimeout(r, 500));
    const shots = await page.evaluate(() => {
      const scene = window.__ENGINE.getScene();
      const found = [];
      scene.traverse(o => {
        if(!o.isMesh || !o.userData || o.userData.partId !== 'display') return;
        const mats = Array.isArray(o.material) ? o.material : [o.material];
        for(const mat of mats){
          if(!mat) continue;
          const tex = (mat.map && mat.map.image && mat.map.image.width >= 512 ? mat.map : null)
            || (mat.emissiveMap && mat.emissiveMap.image && mat.emissiveMap.image.width >= 512 ? mat.emissiveMap : null);
          if(!tex || !tex.image || tex.image.width < 512) continue;
          try{
            const cv = document.createElement('canvas');
            const s = 200 / Math.max(tex.image.width, tex.image.height);
            cv.width = Math.max(1, Math.round(tex.image.width * s));
            cv.height = Math.max(1, Math.round(tex.image.height * s));
            cv.getContext('2d').drawImage(tex.image, 0, 0, cv.width, cv.height);
            found.push({ name: mat.name || 'mat', kind: mat.map === tex ? 'map' : 'emissive', url: cv.toDataURL('image/png') });
          }catch(e){ /* 跨域贴图跳过 */ }
        }
      });
      return found;
    });
    let i = 0;
    for(const t of shots){
      writeFileSync(`${OUT}${id}--${t.name}--${t.kind}.png`, Buffer.from(t.url.split(',')[1], 'base64'));
      console.log(`${id}: ${t.name} (${t.kind}) 已导出`);
      i++;
    }
    if(!i) console.log(`${id}: display 无 >=512 原生贴图`);
  }catch(e){ console.log(`${id}: ERR ${e.message.slice(0,60)}`); }
}
await browser.close();
