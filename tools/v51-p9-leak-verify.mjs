#!/usr/bin/env node
/* V5.1 P9 · 资源泄漏抽查（任务书 §12）：三台顺序装载后场景 mesh/geometry 计数应回到同台基线——
   新增陈列对象（stageDial/plumbLine/reticle）为常驻单例，不随切台累积；设备几何随 dispose 释放。 */
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(path.join(ROOT, 'package.json'));
const puppeteer = require('puppeteer-core');
const argPort = Number(process.argv.find(a => a.startsWith('--port'))?.split('=')[1] || 8297);
const PORT = Number(process.env.HUD_PORT || argPort);
const BASE = `http://127.0.0.1:${PORT}`;

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

try{
  await waitServer();
  const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new',
    args: ['--enable-unsafe-swiftshader', '--no-sandbox'] });
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(shrink(e && e.message || e)));
  await page.setViewport({ width: 1280, height: 800, deviceScaleFactor: 1 });

  const SEQ = ['iphone-13', 'mini4pro', 'iphone-13'];   // A→B→A：末次计数应≈首次（±3，轴点/标签缓存可有微小波动）
  const counts = [];
  for(const id of SEQ){
    await page.goto(`${BASE}/#/device/${id}`, { waitUntil: 'domcontentloaded', timeout: 60000 });
    if(!await waitLoaded(page, id)) throw new Error('装载超时: ' + id);
    await sleep(2500);
    const c = await page.evaluate(() => {
      let meshes = 0, geos = 0;
      const seen = new Set();
      window.__ENGINE.getScene().traverse(o => {
        if(o.isMesh || o.isLine || o.isPoints){ meshes++; if(o.geometry && !seen.has(o.geometry)){ seen.add(o.geometry); geos++; } }
      });
      return { id: window.__ENGINE.getState().device.id, meshes, geos };
    });
    counts.push(c);
    console.log(`[${id}] meshes=${c.meshes} uniqueGeometries=${c.geos}`);
  }
  const drift = Math.abs(counts[2].meshes - counts[0].meshes);
  check('A→B→A 场景 mesh 计数回基线（漂移≤3）', drift <= 3, { first: counts[0].meshes, last: counts[2].meshes, drift });
  const gdrift = Math.abs(counts[2].geos - counts[0].geos);
  check('A→B→A 唯一几何计数回基线（漂移≤3）', gdrift <= 3, { first: counts[0].geos, last: counts[2].geos, drift });
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
