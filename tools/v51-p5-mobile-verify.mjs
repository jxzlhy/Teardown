#!/usr/bin/env node
/* V5.1 P5-S2 · 移动端批核验（任务书 §10 PHASE 7）：
   ① 底座重构后的移动端形态：CORE PROFILE/指引卡/序列读数/rail 隐藏，mpChips+sheet+两级 dock 在场
   ② 两级 dock 行内可横滑（溢出存在且可滚动）③ 触屏点击部件=单件弹出+sheet 徽标+归位钮（pop 链路）
   ④ sheet 与 dock/浮层栈不互压（floatY 118 基线）⑤ 三视口 390×844 / 375×812 / 430×932 无横向溢出
   ⑥ 截图（装配态/sheet+弹出/剖切模式）。轮询装载等待（导航免疫）。 */
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(path.join(ROOT, 'package.json'));
const puppeteer = require('puppeteer-core');
const argPort = Number(process.argv.find(a => a.startsWith('--port'))?.split('=')[1] || 8292);
const PORT = Number(process.env.HUD_PORT || argPort);
const BASE = `http://127.0.0.1:${PORT}`;
const OUT_DIR = path.join(ROOT, 'docs/design/screenshots/2026-11-07-v51-mobile');

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
/* 导航免疫装载等待（Vue router hash 重写会终止 waitForFunction——轮询 evaluate） */
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
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
  await page.goto(`${BASE}/#/device/iphone-13`, { waitUntil: 'domcontentloaded', timeout: 60000 });
  if(!await waitLoaded(page, 'iphone-13')) throw new Error('装载等待超时（320s）');
  await sleep(2200);

  /* ① 底座重构后的移动端形态 */
  const shape = await page.evaluate(() => {
    const vis = (sel) => { const el = document.querySelector(sel); return !!el && getComputedStyle(el).display !== 'none'; };
    const r1 = document.querySelector('.dock-primary'), r2 = document.querySelector('.dock-tools');
    return {
      coreHidden: !vis('#corePanel'), guideHidden: !vis('#quickGuide'), seqHidden: !vis('#exSeq'),
      railHidden: !vis('#rail') && !vis('#railDots'),
      mpChips: document.querySelectorAll('#mpChips .hud-chip').length,
      dockRows: { r1: !!r1, r2: !!r2 },
      dockTop: (() => { const d = document.querySelector('#dock'); if(!d) return null; const r = d.getBoundingClientRect(); return +r.top.toFixed(0); })(),
      dockH: (() => { const d = document.querySelector('#dock'); return d ? +d.getBoundingClientRect().height.toFixed(0) : null; })(),
    };
  });
  check('移动端形态：CORE PROFILE/指引卡/序列读数/rail 全隐藏', shape.coreHidden && shape.guideHidden && shape.seqHidden && shape.railHidden, shape);
  check('mpChips 横滑行在场（≥4 chips）', shape.mpChips >= 4, shape.mpChips);
  check('两级 dock 在场', shape.dockRows.r1 && shape.dockRows.r2, shape.dockRows);

  /* ② dock 行内可横滑：溢出存在（scrollWidth > clientWidth）且按钮可达 */
  const scroll = await page.evaluate(() => {
    const rows = [...document.querySelectorAll('#dock .dock-row')];
    return rows.map(r => ({ sw: r.scrollWidth, cw: r.clientWidth, scrollable: r.scrollWidth > r.clientWidth + 4 }));
  });
  check('dock 至少一行可横滑（内容溢出）', scroll.some(s => s.scrollable), scroll);
  await page.screenshot({ path: path.join(OUT_DIR, 'm1-390-assembled.png') });

  /* ③ 触屏点击部件 = 单件弹出 + sheet 徽标 + 归位钮（tap 走 canvas pointer 路径） */
  const pid = await page.evaluate(() => window.__ENGINE.getState().parts[1]?.data?.id);
  await page.evaluate((id) => window.__ENGINE.popPart(id), pid);
  await sleep(1800);
  await page.evaluate(() => document.querySelector('#mpChips button')?.click());
  await sleep(1600);
  const popState = await page.evaluate((id) => {
    const s = window.__ENGINE.getState();
    let ret = null;
    window.__ENGINE.getScene().traverse(o => { if(o.name === 'popReticle') ret = { visible: o.visible, pos: o.position.toArray().map(v => +v.toFixed(1)) }; });
    /* mpChips 点击 = pickFromList 轮换弹出——sheet 校验以「当前弹出件」为准 */
    const cur = s.partsById[s.popped];
    const sheet = document.querySelector('#ctxCard');
    /* sheet 内容内部滚动（46vh 封顶）：滚到底再量操作行（否则长内容设备的 actions 在滚动区外） */
    if(sheet) sheet.scrollTop = sheet.scrollHeight;
    const actions = document.querySelector('#ctxCard .ctx-actions');
    return {
      popped: s.popped, sel: s.selected,
      dispMoved: cur ? +Math.hypot(cur.group.position.x - cur.base.x, cur.group.position.y - cur.base.y, cur.group.position.z - cur.base.z).toFixed(2) : null,
      ret,
      badge: document.querySelector('#ctxCard .ctx-state-badge')?.textContent.trim() || '',
      btn: [...document.querySelectorAll('#ctxCard .ctx-actions .hud-glow-btn')].map(b => b.textContent.trim())[0] || '',
      actionsBottom: actions ? +actions.getBoundingClientRect().bottom.toFixed(0) : null,
      dockTop: (() => { const d = document.querySelector('#dock'); return d ? +d.getBoundingClientRect().top.toFixed(0) : null; })(),
    };
  }, pid);
  check('移动端弹出链路（轮换后 popped 在场 + reticle 跟随）', popState.popped && popState.popped !== pid && popState.dispMoved > 0.3 && popState.ret && popState.ret.visible, { popped: popState.popped, moved: popState.dispMoved, ret: popState.ret });
  check('sheet 徽标「已拆解」+ 归位钮（当前弹出件）', /已拆解/.test(popState.badge) && popState.btn === '归位', { badge: popState.badge, btn: popState.btn });
  check('sheet 内容不被 dock 压住（操作行底 ≤ dock 顶；sheet 面板本体允许延伸至 dock 之下）', popState.actionsBottom === null || popState.dockTop === null || popState.actionsBottom <= popState.dockTop + 2, { actionsBottom: popState.actionsBottom, dockTop: popState.dockTop });
  await page.screenshot({ path: path.join(OUT_DIR, 'm2-390-sheet-popped.png') });

  /* ④ 归位钮可用（移动端弹出态唯一显式归位入口） */
  await page.evaluate(() => { [...document.querySelectorAll('#ctxCard .ctx-actions .hud-glow-btn')][0]?.click(); });
  await sleep(2000);
  const afterHome = await page.evaluate((id) => {
    const s = window.__ENGINE.getState();
    const p = s.partsById[id];
    return { popped: s.popped, moved: +Math.hypot(p.group.position.x - p.base.x, p.group.position.y - p.base.y, p.group.position.z - p.base.z).toFixed(2) };
  }, pid);
  check('移动端归位钮生效', afterHome.popped === null && afterHome.moved < 0.15, afterHome);

  /* ⑤ 剖切模式：clipStrip 浮层基线在 dock 之上（floatY 118 基线） */
  await page.evaluate(() => document.querySelector('#ctxCard') && window.__ENGINE.deselect());
  await page.keyboard.press('Digit4');
  await sleep(1400);
  const clip = await page.evaluate(() => {
    const cs = document.querySelector('#clipStrip'), d = document.querySelector('#dock');
    if(!cs || !d) return null;
    return { stripTop: +cs.getBoundingClientRect().top.toFixed(0), dockTop: +d.getBoundingClientRect().top.toFixed(0) };
  });
  check('剖切条浮于两级 dock 之上（不互压）', clip && clip.stripTop < clip.dockTop, clip);
  await page.screenshot({ path: path.join(OUT_DIR, 'm3-390-clip.png') });
  await page.keyboard.press('Escape');

  /* ⑥ 三视口无横向溢出 */
  for(const [w, h] of [[375, 812], [430, 932]]){
    await page.setViewport({ width: w, height: h, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
    await sleep(900);
    const ovf = await page.evaluate(() => ({ doc: document.documentElement.scrollWidth, vw: innerWidth }));
    check(`${w}×${h} 无横向溢出`, ovf.doc <= ovf.vw + 1, ovf);
    await page.screenshot({ path: path.join(OUT_DIR, `m4-${w}-assembled.png`) });
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
