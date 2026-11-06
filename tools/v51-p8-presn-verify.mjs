#!/usr/bin/env node
/* V5.1 P8-S1 · Viewer Presentation Config + 能力检测验证（任务书 §11.1/§11.3）：
   ① presn.plinth 逐台覆盖生效（jet-engine 机械→large）② category 映射不受 presn 缺省影响
   ③ capabilities 按真实数据声明（sizeAssist↔realSizeMM、mech、tour）④ 截图（jet-engine 大地台）。 */
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(path.join(ROOT, 'package.json'));
const puppeteer = require('puppeteer-core');
const argPort = Number(process.argv.find(a => a.startsWith('--port'))?.split('=')[1] || 8295);
const PORT = Number(process.env.HUD_PORT || argPort);
const BASE = `http://127.0.0.1:${PORT}`;
const OUT_DIR = path.join(ROOT, 'docs/design/screenshots/2026-11-07-v51-p8');

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
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new',
    args: ['--enable-unsafe-swiftshader', '--no-sandbox'] });
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(shrink(e && e.message || e)));
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });

  /* ① presn 覆盖：jet-engine（category 机械→默认 industrial，presn.plinth=large 覆盖） */
  await page.goto(`${BASE}/#/device/jet-engine`, { waitUntil: 'domcontentloaded', timeout: 60000 });
  if(!await waitLoaded(page, 'jet-engine')) throw new Error('jet-engine 装载超时');
  await sleep(2000);
  const jet = await page.evaluate(() => {
    const s = window.__ENGINE.getState();
    return { plinthType: s.plinthType, cap: s.capabilities };
  });
  check('presn.plinth 覆盖生效（jet-engine → large）', jet.plinthType === 'large', jet.plinthType);
  check('capabilities 形状（explode/sizeAssist/mech/tour/labels 全键）',
    jet.cap && ['explode', 'sizeAssist', 'mech', 'tour', 'labels'].every(k => typeof jet.cap[k] === 'boolean'), jet.cap);
  check('jet-engine 能力值真实（explode ✓ sizeAssist ✗——无 realSizeMM）',
    jet.cap.explode === true && jet.cap.sizeAssist === false && jet.cap.labels === true, jet.cap);
  await page.screenshot({ path: path.join(OUT_DIR, 'p8-jet-large.png') });

  /* ② 缺省映射不受影响：iphone-13 → precision + sizeAssist ✓（有 realSizeMM） */
  await page.goto(`${BASE}/#/device/iphone-13`, { waitUntil: 'domcontentloaded', timeout: 60000 });
  if(!await waitLoaded(page, 'iphone-13')) throw new Error('iphone-13 装载超时');
  await sleep(1500);
  const ip = await page.evaluate(() => {
    const s = window.__ENGINE.getState();
    return { plinthType: s.plinthType, cap: s.capabilities };
  });
  check('缺省映射不变（iphone-13 → precision）', ip.plinthType === 'precision', ip.plinthType);
  check('iphone-13 能力值（sizeAssist ✓ tour ✓ mech ✗）',
    ip.cap.sizeAssist === true && ip.cap.tour === true && ip.cap.mech === false, ip.cap);

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
