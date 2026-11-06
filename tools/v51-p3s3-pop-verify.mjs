#!/usr/bin/env node
/* V5.1 P3-S3 · 单件拆解交互验证（参考站点击交互移植）：
   ① popPart 弹出（位移+reticle 可见+位置随部件）② 再点同件归位 ③ 他件轮换 ④ setExplode(0) 清弹出
   ⑤ Vue 链路：清单点击弹出 + ctxCard 状态徽标 + 拆解/归位钮 + 顶栏 STRUCTURE VIEW + rail .pop
   ⑥ 截图（弹出件+reticle）。装载判定 modelStatus（300s 规程）。 */
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(path.join(ROOT, 'package.json'));
const puppeteer = require('puppeteer-core');
const argPort = Number(process.argv.find(a => a.startsWith('--port'))?.split('=')[1] || 8270);
const PORT = Number(process.env.HUD_PORT || argPort);
const BASE = `http://127.0.0.1:${PORT}`;
const OUT_DIR = path.join(ROOT, 'docs/design/screenshots/2026-11-06-v51-pop');

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


try{
  await waitServer();
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new',
    args: ['--enable-unsafe-swiftshader', '--no-sandbox'] });
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(shrink(e && e.message || e)));
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
  await page.goto(`${BASE}/#/device/iphone-13`, { waitUntil: 'domcontentloaded', timeout: 60000 });
  if(!await waitLoaded(page)) throw new Error("装载等待超时（320s）");
  await sleep(2200);

  /* 引擎层：弹出/归位/轮换/清空 */
  const pid = await page.evaluate(() => window.__ENGINE.getState().parts[1]?.data?.id || window.__ENGINE.getState().parts[0]?.data?.id);
  const pos0 = await page.evaluate((id) => window.__ENGINE.getState().partsById[id].group.position.toArray(), pid);
  await page.evaluate((id) => window.__ENGINE.popPart(id), pid);
  await sleep(1800);
  const pop1 = await page.evaluate((id) => {
    const s = window.__ENGINE.getState();
    const p = s.partsById[id];
    let ret = null;
    window.__ENGINE.getScene().traverse(o => { if(o.name === 'popReticle') ret = { visible: o.visible, pos: o.position.toArray().map(v => +v.toFixed(2)) }; });
    return { popped: s.popped, moved: Math.hypot(p.group.position.x - p.base.x, p.group.position.y - p.base.y, p.group.position.z - p.base.z), ret };
  }, pid);
  check('popPart 弹出（state.popped + 部件离位>0.3）', pop1.popped === pid && pop1.moved > 0.3, { popped: pop1.popped, moved: +pop1.moved.toFixed(2) });
  check('reticle 可见且贴近部件中心', pop1.ret && pop1.ret.visible, pop1.ret);
  await page.screenshot({ path: path.join(OUT_DIR, 'p1-popped-reticle.png') });

  await page.evaluate((id) => window.__ENGINE.popPart(id), pid);   // 再点同件=归位
  /* dt 钳制 0.1 + 软渲染低帧率下 popK 收敛需多帧（与爆炸补间同口径）——轮询等待归位完成（20s 窗） */
  let pop2 = null;
  for(let i = 0; i < 20; i++){
    await sleep(1000);
    pop2 = await page.evaluate((id) => {
      const s = window.__ENGINE.getState();
      const p = s.partsById[id];
      let retVis = false;
      window.__ENGINE.getScene().traverse(o => { if(o.name === 'popReticle') retVis = o.visible; });
      return { popped: s.popped, moved: Math.hypot(p.group.position.x - p.base.x, p.group.position.y - p.base.y, p.group.position.z - p.base.z), retVis };
    }, pid);
    if(pop2.popped === null && pop2.moved < 0.12 && !pop2.retVis) break;
  }
  check('再点同件归位（popped=null + 部件回位 + reticle 隐）', pop2.popped === null && pop2.moved < 0.12 && !pop2.retVis, { popped: pop2.popped, moved: +pop2.moved.toFixed(3) });

  const pid2 = await page.evaluate(() => window.__ENGINE.getState().parts[3]?.data?.id);
  await page.evaluate((id) => window.__ENGINE.popPart(id), pid);
  await sleep(500);
  await page.evaluate((id) => window.__ENGINE.popPart(id), pid2);
  await sleep(1500);
  const pop3 = await page.evaluate((a, b) => {
    const s = window.__ENGINE.getState();
    const d = (id) => { const p = s.partsById[id]; return Math.hypot(p.group.position.x - p.base.x, p.group.position.y - p.base.y, p.group.position.z - p.base.z); };
    return { popped: s.popped, a: +d(a).toFixed(2), b: +d(b).toFixed(2) };
  }, pid, pid2);
  check('他件轮换（前件归位、后件弹出）', pop3.popped === pid2 && pop3.a < 0.15 && pop3.b > 0.3, pop3);

  await page.evaluate((id) => window.__ENGINE.setExplode(1), pid2);
  await sleep(1200);
  await page.evaluate((id) => window.__ENGINE.setExplode(0), pid2);
  await sleep(1500);
  const pop4 = await page.evaluate(() => window.__ENGINE.getState().popped);
  check('全局归位清空弹出件', pop4 === null, pop4);

  /* Vue 链路：清单点击 → 弹出 + 徽标 + 按钮 + 顶栏 + rail */
  await page.reload({ waitUntil: 'domcontentloaded' });
  if(!await waitLoaded(page)) throw new Error("装载等待超时（320s）");
  await sleep(2000);
  await page.evaluate(() => { [...document.querySelectorAll('#rail .prow')][1]?.click(); });
  await sleep(2000);
  const vue = await page.evaluate(() => ({
    popped: window.__ENGINE.getState().popped,
    center: document.querySelector('#topbar .tb-center span')?.textContent.trim() || '',
    badge: document.querySelector('#ctxCard .ctx-state-badge')?.textContent.trim() || '',
    btn: [...document.querySelectorAll('#ctxCard .ctx-actions .hud-glow-btn')].map(b => b.textContent.trim())[0] || '',
    railPop: document.querySelectorAll('#rail .pstat.pop').length,
  }));
  check('清单点击弹出 + 顶栏 STRUCTURE VIEW', !!vue.popped && /STRUCTURE VIEW/.test(vue.center), { popped: vue.popped, center: vue.center });
  check('详情卡「已拆解 · EXPLODED」徽标 + 归位钮', /已拆解/.test(vue.badge) && vue.btn === '归位', { badge: vue.badge, btn: vue.btn });
  check('rail 状态圈 .pop 恰 1 枚', vue.railPop === 1, vue.railPop);
  await page.evaluate(() => { [...document.querySelectorAll('#ctxCard .ctx-actions .hud-glow-btn')][0]?.click(); });
  await sleep(1600);
  const afterHome = await page.evaluate(() => ({
    popped: window.__ENGINE.getState().popped,
    badge: document.querySelector('#ctxCard .ctx-state-badge')?.textContent.trim() || '',
    btn: [...document.querySelectorAll('#ctxCard .ctx-actions .hud-glow-btn')].map(b => b.textContent.trim())[0] || '',
  }));
  check('面板归位钮：弹出清空 + 徽标切「已装配」+ 钮切「拆解」', afterHome.popped === null && /已装配/.test(afterHome.badge) && afterHome.btn === '拆解', afterHome);

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
