#!/usr/bin/env node
/* V5.1 P10 · 视觉设计验收截图扫（任务书 §13）：六尺寸设备 × 夜/日厅 × 装配/爆炸。
   设备谱系：pocket-watch（微型）/ digital-watch（小）/ iphone-13（中）/ mini4pro（无人机浮动）/
   combustion-engine（industrial 大件）/ porsche-911-carrera-4s（large 车辆）。
   输出至 docs/design/screenshots/2026-11-07-v51-p10/，供 §13 十三问逐检判读。 */
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(path.join(ROOT, 'package.json'));
const puppeteer = require('puppeteer-core');
const argPort = Number(process.argv.find(a => a.startsWith('--port'))?.split('=')[1] || 8298);
const PORT = Number(process.env.HUD_PORT || argPort);
const BASE = `http://127.0.0.1:${PORT}`;
const OUT_DIR = path.join(ROOT, 'docs/design/screenshots/2026-11-07-v51-p10');

const CHROME = ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'].find(p => fs.existsSync(p));
if(!CHROME){ console.log('SKIP: 未找到 Chrome'); process.exit(0); }
const sleep = ms => new Promise(r => setTimeout(r, ms));
const shrink = s => String(s ?? '').replace(/\s+/g, ' ').slice(0, 140);

const server = spawn(process.execPath, [
  path.join(ROOT, 'node_modules/vite/bin/vite.js'),
  '--host', '127.0.0.1', '--port', String(PORT), '--strictPort',
], { stdio: 'ignore', detached: false });
const waitServer = async () => {
  for(let i = 0; i < 120; i++){ try{ const r = await fetch(BASE + '/'); if(r.ok) return; }catch{} await sleep(500); }
  throw new Error('Vite 未启动');
};
const waitLoaded = async (page, id) => {
  for(let i = 0; i < 160; i++){
    try{
      const ok = await page.evaluate((did) => {
        const e = window.__ENGINE; const s = e && e.getState();
        return !!(s && (!did || (s.device && s.device.id === did)) && /OFFICIAL|COMMUNITY|PROCEDURAL|FALLBACK/.test(s.modelStatus || ''));
      }, id || null);
      if(ok) return true;
    }catch{}
    await sleep(2000);
  }
  return false;
};

const DEVICES = ['pocket-watch', 'digital-watch', 'iphone-13', 'mini4pro', 'combustion-engine', 'porsche-911-carrera-4s'];

try{
  await waitServer();
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new',
    args: ['--enable-unsafe-swiftshader', '--no-sandbox'] });
  const page = await browser.newPage();
  page.on('pageerror', e => console.log('[pageerror]', shrink(e && e.message || e)));
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });

  for(const id of DEVICES){
    const t0 = Date.now();
    await page.goto(`${BASE}/#/device/${id}`, { waitUntil: 'domcontentloaded', timeout: 60000 });
    if(!await waitLoaded(page, id)){ console.log(`[${id}] 装载超时，跳过`); continue; }
    await sleep(2400);
    /* 夜厅装配 */
    await page.evaluate(() => window.__ENGINE.setHallMode('night'));
    await page.evaluate(() => { window.__ENGINE.setExplode(0); window.__ENGINE.resetView(); });
    await sleep(1800);
    await page.screenshot({ path: path.join(OUT_DIR, `${id}-night.png`) });
    /* 夜厅爆炸 */
    await page.evaluate(() => window.__ENGINE.setExplode(1));
    await sleep(2600);
    await page.screenshot({ path: path.join(OUT_DIR, `${id}-night-exploded.png`) });
    /* 日厅装配 */
    await page.evaluate(() => { window.__ENGINE.setHallMode('day'); window.__ENGINE.setExplode(0); window.__ENGINE.resetView(); });
    await sleep(2000);
    await page.screenshot({ path: path.join(OUT_DIR, `${id}-day.png`) });
    console.log(`[${id}] done ${Math.round((Date.now() - t0) / 1000)}s`);
  }
  await browser.close();
  console.log('SWEEP DONE');
}catch(err){
  console.error('SWEEP ERROR:', (err && err.stack || String(err)));
}finally{
  try{ server.kill(); }catch{}
}
