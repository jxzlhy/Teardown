/* A/B：隐藏 painted overlay 平面，看原生表面是否本来就有画面 */
import puppeteer from 'puppeteer-core';
import { existsSync } from 'node:fs';
const OUT = new URL('../docs/design/screenshots/audit-native/', import.meta.url).pathname;
const c = ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'];
const browser = await puppeteer.launch({ executablePath: c.find(existsSync), headless: 'new', args: ['--enable-unsafe-swiftshader','--no-sandbox'] });
const page = await browser.newPage();
await page.setViewport({ width: 1280, height: 800 });
for(const id of ['action4','pocket3','vision-pro','iphone-13']){
  await page.goto(`http://127.0.0.1:8137/#/device/${id}`, { waitUntil: 'networkidle2', timeout: 60000 });
  try{
    await page.waitForFunction(() => {
      const e = window.__ENGINE; const s = e && e.getState();
      return s && s.booted && /OFFICIAL|COMMUNITY|PROCEDURAL|FALLBACK/.test(s.modelStatus || '');
    }, { timeout: 40000, polling: 300 });
    await new Promise(r => setTimeout(r, 800));
    /* 找到 overlay 平面：material.map 是 canvas（尺寸 = 配置的画布） */
    const info = await page.evaluate(() => {
      const scene = window.__ENGINE.getScene();
      let overlay = null;
      scene.traverse(o => {
        if(overlay || !o.isMesh) return;
        const mats = Array.isArray(o.material) ? o.material : [o.material];
        for(const m of mats){
          if(m && m.map && m.map.image && m.map.image.tagName === 'CANVAS'){ overlay = o; break; }
        }
      });
      if(!overlay) return { overlay: false };
      overlay.visible = false;
      return { overlay: true, name: overlay.name, parent: overlay.userData && overlay.userData.partId };
    });
    console.log(`${id}: overlay=${JSON.stringify(info)}`);
    await page.evaluate(() => { const e = window.__ENGINE; const cam = e.getCamera(); });
    await new Promise(r => setTimeout(r, 400));
    await page.screenshot({ path: `${OUT}ab-${id}--native.png` });
  }catch(e){ console.log(`${id}: ERR ${e.message.slice(0,60)}`); }
}
await browser.close();
