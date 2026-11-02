/* 移动端性能观察（headless swiftshader 软件渲染参考值；验证自适应降档动作） */
import puppeteer from 'puppeteer-core';
import { existsSync } from 'node:fs';
const c = ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'];
const browser = await puppeteer.launch({ executablePath: c.find(existsSync), headless: 'new', args: ['--enable-unsafe-swiftshader','--no-sandbox'] });
const page = await browser.newPage();
await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
for(const id of ['action4','v8-engine','grand-piano']){
  await page.goto(`http://127.0.0.1:8137/#/device/${id}`, { waitUntil: 'networkidle2', timeout: 90000 });
  try{
    await page.waitForFunction(() => {
      const e = window.__ENGINE; const s = e && e.getState();
      return s && s.booted && /OFFICIAL|COMMUNITY|PROCEDURAL|FALLBACK/.test(s.modelStatus || '');
    }, { timeout: 80000, polling: 300 });
    await new Promise(r => setTimeout(r, 3500));   // 给自适应降档留窗口
    const m = await page.evaluate(async () => {
      let frames = 0; const t0 = performance.now();
      await new Promise(res => { const loop = () => { frames++; if(performance.now() - t0 < 3000) requestAnimationFrame(loop); else res(); }; requestAnimationFrame(loop); });
      const s = window.__ENGINE.getState();
      return { fps: +(frames / 3).toFixed(1), quality: s.quality, parts: (s.parts && s.parts.length) || s.partsCount || 0 };
    });
    console.log(`${id}: ${m.fps} fps · 画质档 L${m.quality} · ${m.parts} 部件（软件渲染参考值）`);
  }catch(e){ console.log(`${id}: ERR ${e.message.slice(0,50)}`); }
}
await browser.close();
