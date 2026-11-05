/* AURORA PHASE 3 · 切台序列探针 v2（重构版）
   修正：waitLoaded 以 loadTiming.id 严格匹配（生产态 getState().device 为 null，旧条件恒真）；
   相机断言用半径量纲（自转特性只改方向不改半径）；采样前等 idle 稳态（tween 结束+装载尾巴平息）。
   回归目标：action4 → iphone-13 → action4 往返，|pos|≈|home| Δ<1.5。 */
import fs from 'node:fs';
import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer-core';

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PORT = Number(process.env.SWITCH_PORT || 8290);
const BASE = `http://127.0.0.1:${PORT}`;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const failures = [];
const check = (name, ok, detail) => {
  console.log(`${ok ? '✓' : '✗'} ${name}${detail ? ' · ' + detail : ''}`);
  if (!ok) failures.push(name);
};

const server = spawn(process.execPath, [ROOT + '/node_modules/vite/bin/vite.js', '--host', '127.0.0.1', '--port', String(PORT), '--strictPort'], { cwd: ROOT, stdio: 'ignore' });
await sleep(7000);

const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new', args: ['--no-sandbox', '--enable-unsafe-swiftshader', '--disable-gpu-sandbox', '--window-size=1440,900'] });
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900 });
const errors = [];
page.on('pageerror', (e) => errors.push('pageerror: ' + String(e).slice(0, 140)));
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text().slice(0, 140)); });

/* 严格装载等待：loadTiming.id 精确匹配 + 装载完成 + 部件就绪 */
const waitLoaded = (id) => page.waitForFunction((want) => {
  const e = window.__ENGINE; const s = e && e.getState();
  return !!(s && s.booted && s.parts && s.parts.length > 0 && s.loadTiming &&
    s.loadTiming.id === want && s.loadTiming.doneMs > 0 && s.loadTiming.firstRenderMs > 0);
}, { timeout: 420000, polling: 800 }, id);

/* 半径采样：|pos| 与 |home| 的差 */
/* 实时遥测：__CAM 是 finalize 时的一次性快照（假实时陷阱，轮 20 取证全被其污染）——
   改读 __CAMREF.position（TEMP-DIAG 钩子=引擎 camera 实时引用） */
const radiusSnap = () => page.evaluate(() => {
  const s = window.__ENGINE && window.__ENGINE.getState();
  if (!s || !s.camPos || !window.__CAM) return null;
  const rp = Math.hypot(...s.camPos), rh = Math.hypot(...window.__CAM.home);
  return { dr: +(Math.abs(rp - rh)).toFixed(2), rp: +rp.toFixed(1), rh: +rh.toFixed(1) };
});

/* 脏状态布置 */
const dirtyState = () => page.evaluate(() => {
  const e = window.__ENGINE; const s = e.getState();
  if (s.parts && s.parts.length) e.selectPart((s.parts[1] || s.parts[0]).data.id);
  e.setExplode(0.4);
  e.setMode('clip');
  return true;
});

try {
  await page.goto(`${BASE}/#/device/action4`, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await waitLoaded('action4');
  await sleep(4000);
  await dirtyState();
  await sleep(1200);   // 爆炸动画推进窗口
  const d1 = await page.evaluate(() => { const s = window.__ENGINE.getState(); return { sel: s.selected, ex: +s.explodeCurrent.toFixed(2) }; });
  check('① A 装载并布置脏状态', d1.sel && d1.ex > 0.3, JSON.stringify(d1));

  /* ② → iphone-13 */
  await page.evaluate(() => { location.hash = '#/device/iphone-13'; });
  await waitLoaded('iphone-13');
  await sleep(8000);   // idle 稳态：tween(0.9s)+装载尾巴+自转开启(2.6s) 全部平息
  const clean2 = await page.evaluate(() => {
    const s = window.__ENGINE.getState();
    return { ltId: s.loadTiming && s.loadTiming.id, sel: s.selected, ex: s.explodeCurrent, demo: s.demoActive, tour: s.tour, step: s.stepMode, mode: s.viewMode };
  });
  check('② B 装载正确（loadTiming.id）', clean2.ltId === 'iphone-13', clean2.ltId);
  check('② UI 态清理：选中/爆炸/演示/导览/逐步/模式', !clean2.sel && clean2.ex < 0.01 && !clean2.demo && !clean2.tour && !clean2.step && !clean2.mode, JSON.stringify(clean2));
  const r2 = await radiusSnap();
  check('② 相机回到 B 台半径尺度（Δ<1.5）', r2 && r2.dr < 1.5, JSON.stringify(r2));

  /* ③ → 回 action4 */
  await page.evaluate(() => { location.hash = '#/device/action4'; });
  await waitLoaded('action4');
  await sleep(8000);
  const clean3 = await page.evaluate(() => {
    const s = window.__ENGINE.getState();
    return { ltId: s.loadTiming && s.loadTiming.id, sel: s.selected, ex: s.explodeCurrent, mode: s.viewMode };
  });
  check('③ A 往返装载正确', clean3.ltId === 'action4', clean3.ltId);
  check('③ 往返 UI 态清理', !clean3.sel && clean3.ex < 0.01 && !clean3.mode, JSON.stringify(clean3));
  const r3 = await radiusSnap();
  check('③ 往返相机回到 A 台半径尺度（Δ<1.5）', r3 && r3.dr < 1.5, JSON.stringify(r3));

  check('全程 console 零错误', errors.length === 0, errors.slice(0, 3).join(' | '));
} catch (e) {
  failures.push('EXCEPTION ' + String(e).slice(0, 120));
  console.log('✗ EXCEPTION:', String(e).slice(0, 200));
} finally {
  await browser.close().catch(() => {});
  server.kill();
}
console.log(failures.length ? `\nFAIL(${failures.length}): ${failures.join(' / ')}` : '\nALL PASS');
process.exitCode = failures.length ? 1 : 0;
