/* 第三章 3.4 映射准确性抽查：每个配置部件 ≥1 个实体网格、且无「幽灵部件」 */
import puppeteer from 'puppeteer-core';
import { existsSync } from 'node:fs';
const c = ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'];
const browser = await puppeteer.launch({ executablePath: c.find(existsSync), headless: 'new', args: ['--enable-unsafe-swiftshader','--no-sandbox'] });
const page = await browser.newPage();
await page.setViewport({ width: 1280, height: 800 });
let bad = 0;
for(const id of ['action4','iphone-12-teardown','v8-engine','radial-engine','digital-watch','nikon-z6']){
  await page.goto(`http://127.0.0.1:8137/#/device/${id}`, { waitUntil: 'networkidle2', timeout: 90000 });
  try{
    await page.waitForFunction(() => { const e = window.__ENGINE; const s = e && e.getState(); return s && s.booted && s.partsCount > 0; }, { timeout: 70000, polling: 300 });
    await new Promise(r => setTimeout(r, 500));
    const r = await page.evaluate(() => {
      const s = window.__ENGINE.getState();
      const scene = window.__ENGINE.getScene();
      const meshByPart = {};
      scene.traverse(o => {
        if(!o.isMesh || !o.userData || !o.userData.partId) return;
        meshByPart[o.userData.partId] = (meshByPart[o.userData.partId] || 0) + 1;
      });
      const declared = s.parts.map(p => p.data ? p.data.id : p.id);
      const ghostMeshes = Object.keys(meshByPart).filter(k => !declared.includes(k));
      const emptyParts = declared.filter(pid => !meshByPart[pid]);
      return { declared: declared.length, withMesh: declared.length - emptyParts.length, ghostMeshes, emptyParts };
    });
    const ok = !r.ghostMeshes.length && !r.emptyParts.length;
    if(!ok) bad++;
    console.log(`${id}: ${ok ? '✓' : '✗'} 部件 ${r.declared} / 带网格 ${r.withMesh}${r.ghostMeshes.length ? ' · 幽灵网格:' + r.ghostMeshes : ''}${r.emptyParts.length ? ' · 空部件:' + r.emptyParts : ''}`);
  }catch(e){ console.log(`${id}: ERR ${e.message.slice(0,50)}`); bad++; }
}
await browser.close();
console.log(bad ? `✗ ${bad} 台映射异常` : '✓ 映射抽查全部通过');
