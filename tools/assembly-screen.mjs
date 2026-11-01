/* PART-01 装配异常筛查：装配态下部件 bbox 中心距整机 hull 中心的异常检测 */
import puppeteer from 'puppeteer-core';
import { existsSync } from 'node:fs';
const c = ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'];
const browser = await puppeteer.launch({ executablePath: c.find(existsSync), headless: 'new', args: ['--enable-unsafe-swiftshader','--no-sandbox'] });
const page = await browser.newPage();
await page.setViewport({ width: 1280, height: 800 });
const devices = (process.env.SCREEN_BATCH || 'mini4pro,avata2,inside-drone,jet-engine,v6-engine,combustion-engine,triple-engine,macbook-air,framework-laptop13,imac,studio-display,airpods-pro,airpods-5,s25-ultra,zflip7,gameboy,switch-oled,nikon-d6,hubble-telescope,grand-piano').split(',');
for(const id of devices){
  await page.goto(`http://127.0.0.1:8137/#/device/${id}`, { waitUntil: 'networkidle2', timeout: 60000 });
  try{
    await page.waitForFunction(() => {
      const e = window.__ENGINE; const s = e && e.getState();
      return s && s.booted && /OFFICIAL|COMMUNITY|PROCEDURAL|FALLBACK/.test(s.modelStatus || '');
    }, { timeout: 40000, polling: 300 });
    await new Promise(r => setTimeout(r, 500));
    const report = await page.evaluate(() => {
      const THREE = window.__THREE, e = window.__ENGINE, s = e.getState();
      const boxes = {};
      const groupOf = {};
      const scene = e.getScene();
      scene.traverse(o => {
        if(!o.isMesh || !o.userData || !o.userData.partId) return;
        const pid = o.userData.partId;
        const b = new THREE.Box3().setFromObject(o);
        if(b.isEmpty()) return;
        (boxes[pid] = boxes[pid] || new THREE.Box3()).union(b);
        groupOf[pid] = o.parent;
      });
      const pids = Object.keys(boxes);
      if(!pids.length) return { err: 'no mapped meshes' };
      const hull = new THREE.Box3();
      for(const pid of pids) hull.union(boxes[pid]);
      const hc = hull.getCenter(new THREE.Vector3());
      const hs = hull.getSize(new THREE.Vector3());
      const radius = hs.length() / 2;
      const flags = [];
      for(const pid of pids){
        const c0 = boxes[pid].getCenter(new THREE.Vector3());
        const d = c0.distanceTo(hc);
        const rel = d / Math.max(radius, 1e-4);
        if(rel > 0.72) flags.push({ pid, rel: +rel.toFixed(2), center: [+c0.x.toFixed(1),+c0.y.toFixed(1),+c0.z.toFixed(1)] });
      }
      flags.sort((a,b) => b.rel - a.rel);
      return { parts: pids.length, radius: +radius.toFixed(1), flags: flags.slice(0, 6) };
    });
    console.log(`${id}: parts=${report.parts} radius=${report.radius}${report.flags.length ? ' ⚠ ' + JSON.stringify(report.flags) : ' ✓'}`);
  }catch(err){ console.log(`${id}: ERR ${err.message.slice(0,50)}`); }
}
await browser.close();
