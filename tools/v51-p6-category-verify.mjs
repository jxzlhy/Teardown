#!/usr/bin/env node
/* V5.1 P6 · 多类别设备新底座观感抽查（任务书 §14.5 设备覆盖 + §17 门禁 #22）：
   industrial（hypoid-gear / planetary-gearbox）× large（porsche-911-carrera-4s / countach-lpi800-4），
   每台断言展台三型选型 + 薄盘构成 + 夜厅装配/爆炸截图；porsche 加日厅与顶视角。
   软渲染环境：装载判定 modelStatus 进 OFFICIAL 系（300s 规程）。 */
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(path.join(ROOT, 'package.json'));
const puppeteer = require('puppeteer-core');
const argPort = Number(process.argv.find(a => a.startsWith('--port'))?.split('=')[1] || 8265);
const PORT = Number(process.env.HUD_PORT || argPort);
const BASE = `http://127.0.0.1:${PORT}`;
const OUT_DIR = path.join(ROOT, 'docs/design/screenshots/2026-11-06-v51-p6-category');

const CHROME = ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'].find(p => fs.existsSync(p));
if(!CHROME){ console.log('SKIP: 未找到 Chrome'); process.exit(0); }

const sleep = ms => new Promise(r => setTimeout(r, ms));
const failures = [];
function check(name, ok, detail){
  console.log(`${ok ? '✓' : '✗'} ${name}${detail !== undefined ? ' · ' + JSON.stringify(detail) : ''}`);
  if(!ok) failures.push(name);
}
const shrink = s => String(s ?? '').replace(/\s+/g, ' ').slice(0, 140);

const server = spawn(process.execPath, [
  path.join(ROOT, 'node_modules/vite/bin/vite.js'),
  '--host', '127.0.0.1', '--port', String(PORT), '--strictPort',
], { stdio: 'ignore', detached: false });
const waitServer = async () => {
  for(let i = 0; i < 120; i++){ try{ const r = await fetch(BASE + '/'); if(r.ok) return; }catch{} await sleep(500); }
  throw new Error('Vite 未启动');
};
/* 导航免疫装载等待：Vue router hash 重写会终止 puppeteer waitForFunction（"Waiting failed"
   无超时即此——同文档导航触发 WaitTask 终止），改轮询 evaluate——每次调用重取当前上下文，
   full-reload / 同文档导航 / 慢装载（300s 规程）均不误杀。返回布尔。 */
const waitLoaded = async (page, id) => {
  for(let i = 0; i < 160; i++){
    try{
      const ok = await page.evaluate((did) => {
        const e = window.__ENGINE; const s = e && e.getState();
        return !!(s && (!did || (s.device && s.device.id === did)) && /OFFICIAL|COMMUNITY|PROCEDURAL|FALLBACK/.test(s.modelStatus || ''));
      }, id || null);
      if(ok) return true;
    }catch{}   // 上下文重建期（full-reload）：下一轮重试
    await sleep(2000);
  }
  return false;
};


const CASES = [
  { id: 'hypoid-gear', expect: 'industrial' },
  { id: 'planetary-gearbox', expect: 'industrial' },
  { id: 'porsche-911-carrera-4s', expect: 'large', day: true },
  { id: 'countach-lpi800-4', expect: 'large' },
];

try{
  await waitServer();
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new',
    args: ['--enable-unsafe-swiftshader', '--no-sandbox'] });
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(shrink(e && e.message || e)));
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });

  for(const c of CASES){
    const t0 = Date.now();
    await page.goto(`${BASE}/#/device/${c.id}`, { waitUntil: 'domcontentloaded', timeout: 60000 });
    if(!await waitLoaded(page, c.id)) throw new Error("装载等待超时（320s）: " + c.id);
    await sleep(2200);
    const st = await page.evaluate(() => {
      const s = window.__ENGINE.getState();
      let thin = false, dial = false;
      window.__ENGINE.getScene().traverse(o => {
        if(o.isMesh && o.geometry?.type === 'CylinderGeometry' && Math.abs((o.geometry.parameters?.height ?? 9) - 0.16) < 0.001) thin = true;
        if(o.name === 'stageDial') dial = o.visible;
      });
      return { plinthType: s.plinthType, parts: s.partsCount, thin, dial, warm: null };
    });
    check(`${c.id} 三型选型=${c.expect}`, st.plinthType === c.expect, { got: st.plinthType, parts: st.parts });
    check(`${c.id} 薄盘构成+刻度盘在场`, st.thin && st.dial, { thin: st.thin, dial: st.dial });
    await page.screenshot({ path: path.join(OUT_DIR, `${c.id}-night.png`) });
    await page.evaluate(() => { window.__ENGINE.setExplode(1); window.__ENGINE.resetView(); });
    await sleep(3500);
    await page.screenshot({ path: path.join(OUT_DIR, `${c.id}-exploded.png`) });
    if(c.day){
      await page.evaluate(() => { window.__ENGINE.setHallMode('day'); window.__ENGINE.setExplode(0); window.__ENGINE.resetView(); });
      await sleep(2600);
      await page.screenshot({ path: path.join(OUT_DIR, `${c.id}-day.png`) });
      await page.evaluate(() => window.__ENGINE.flyToView('top'));
      await sleep(1500);
      await page.screenshot({ path: path.join(OUT_DIR, `${c.id}-day-top.png`) });
      await page.evaluate(() => window.__ENGINE.setHallMode('night'));
    }
    console.log(`  [${c.id}] ${Math.round((Date.now() - t0) / 1000)}s`);
  }
  const realErrors = errors.filter(t => !/SwiftShader|swiftshader|GPU stall|fallback to software/i.test(t));
  check('全程无阻断性页面错误', realErrors.length === 0, realErrors.slice(0, 3));
  await browser.close();
}catch(err){
  console.error('PROBE ERROR:', (err && err.stack || String(err)));
  failures.push('probe-crash');
}finally{
  try{ server.kill(); }catch{}
}
console.log(failures.length ? `\nFAIL ${failures.length} 项` : '\nALL GREEN');
process.exit(failures.length ? 1 : 0);
