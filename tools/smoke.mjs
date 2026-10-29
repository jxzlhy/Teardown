#!/usr/bin/env node
/* 端到端冒烟：自起 Vite → 无头 Chrome 跑大厅 / 设备页 / X-Ray / 移动端 sheet
   用法：npm run smoke（需本机 Chrome/Chromium/Edge；可用 SMOKE_PORT 改端口） */
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(path.join(ROOT, 'package.json'));
const puppeteer = require('puppeteer-core');
const PORT = Number(process.env.SMOKE_PORT || 8211);
const BASE = `http://127.0.0.1:${PORT}`;

const CHROME = [
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Chromium.app/Contents/MacOS/Chromium',
  '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
].find(p => fs.existsSync(p));
if(!CHROME){
  console.log('SKIP: 未找到 Chrome/Chromium/Edge，跳过浏览器冒烟');
  process.exit(0);
}

const sleep = ms => new Promise(r => setTimeout(r, ms));
const failures = [];
function check(name, ok, detail){
  console.log(`${ok ? '✓' : '✗'} ${name}${detail ? ' · ' + detail : ''}`);
  if(!ok) failures.push(name);
}

async function waitServer(){
  for(let i = 0; i < 120; i++){
    try{
      const res = await fetch(BASE + '/');
      if(res.ok) return;
    }catch{}
    await sleep(500);
  }
  throw new Error('Vite 未在 60s 内启动');
}

const server = spawn(process.execPath, [
  path.join(ROOT, 'node_modules/vite/bin/vite.js'),
  '--host', '127.0.0.1', '--port', String(PORT), '--strictPort',
], { cwd: ROOT, stdio: 'ignore' });

let browser = null;
try{
  await waitServer();
  browser = await puppeteer.launch({
    executablePath: CHROME, headless: true,
    args: ['--no-sandbox', '--disable-dev-shm-usage', '--enable-unsafe-swiftshader',
           '--use-angle=swiftshader', '--hide-scrollbars', '--force-color-profile=srgb'],
  });
  const page = await browser.newPage();
  const errors = [];
  const configReqs = [];
  const allReqs = [];
  page.on('pageerror', e => errors.push(String(e).slice(0, 300)));
  page.on('console', m => { if(m.type() === 'error') errors.push(m.text().slice(0, 300)); });
  page.on('request', r => {
    const u = r.url();
    allReqs.push(u);
    if(u.includes('/src/devices/') && !u.includes('/_kit/') && !u.includes('registry')) configReqs.push(u);
  });

  /* 大厅 */
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
  await page.goto(BASE + '/#/', { waitUntil: 'networkidle2', timeout: 60000 });
  await page.waitForSelector('.card', { timeout: 20000 });
  const hub = await page.evaluate(() => {
    const r = el => el ? el.getBoundingClientRect() : null;
    const tag = r(document.querySelector('.hub-stage-tag'));
    const sub = r(document.querySelector('.hub-sub'));
    return {
      cards: document.querySelectorAll('.card').length,
      stats: document.querySelectorAll('.hub-stats .stat').length,
      stageOverlap: !!(tag && sub && tag.left < sub.right && tag.right > sub.left && tag.top < sub.bottom && tag.bottom > sub.top),
    };
  });
  check('大厅卡片渲染', hub.cards > 0, `${hub.cards} 张`);
  check('大厅统计为 6 项', hub.stats === 6, `${hub.stats} 项`);
  check('焦点标签不压副标题', !hub.stageOverlap);
  const hubThree = allReqs.filter(u => /three/i.test(u));
  check('大厅不加载 three.js', hubThree.length === 0, hubThree.slice(0, 2).join(', ') || '0');

  /* 设备页：只加载当前配置 */
  configReqs.length = 0;
  await page.goto(BASE + '/#/device/action4', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForFunction(() => {
    const e = window.__ENGINE;
    return e && e.getState().booted && /OFFICIAL|PROCEDURAL|FALLBACK/.test(e.getState().modelStatus || '');
  }, { timeout: 90000, polling: 200 });
  await sleep(800);
  const dev = await page.evaluate(() => {
    const s = window.__ENGINE.getState();
    return { status: s.modelStatus, parts: s.parts.length, loadErr: window.__LOAD_ERR || null, animErr: window.__animErr || null };
  });
  const cfgReqs = [...new Set(configReqs)];
  check('action4 装载成功', /OFFICIAL|PROCEDURAL/.test(dev.status) && dev.parts > 0, `${dev.status} · ${dev.parts} 部件`);
  check('仅加载当前设备配置', cfgReqs.length === 1 && cfgReqs[0].includes('action4'), cfgReqs.join(', '));
  check('无引擎/主循环异常', !dev.loadErr && !dev.animErr);

  /* X-Ray */
  await page.keyboard.press('Space');
  await sleep(1400);
  await page.keyboard.press('Digit2');
  await sleep(600);
  const xray = await page.evaluate(() => window.__ENGINE.getState().viewMode);
  check('X-Ray 模式可进入', xray === 'xray', xray || 'null');

  /* Tour 兜底：无策展顺序的设备按爆炸偏移从外到内 */
  await page.goto(BASE + '/#/device/marshall-jcm800', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForFunction(() => {
    const e = window.__ENGINE;
    const s = e && e.getState();
    return s && s.booted && s.device && s.device.id === 'marshall-jcm800'
      && /OFFICIAL|PROCEDURAL|FALLBACK/.test(s.modelStatus || '');
  }, { timeout: 90000, polling: 200 });
  await sleep(600);
  await page.keyboard.press('KeyT');
  await sleep(800);
  const tourFallback = await page.evaluate(() => {
    const s = window.__ENGINE.getState();
    const sorted = [...s.parts].sort((a, b) =>
      (b.worldOffset ? b.worldOffset.length() : 0) - (a.worldOffset ? a.worldOffset.length() : 0));
    return {
      total: s.tour ? s.tour.ids.length : 0,
      parts: s.parts.length,
      ordered: !!s.tour && s.tour.ids.every((id, i) => sorted[i] && id === sorted[i].data.id),
    };
  });
  check('无策展设备 Tour 按外→内兜底',
    tourFallback.ordered && tourFallback.total === tourFallback.parts,
    `${tourFallback.total}/${tourFallback.parts} 步`);

  /* 移动端：详情 sheet 与剖切条不重叠 */
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 1 });
  await page.goto(BASE + '/#/device/action4', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForFunction(() => {
    const e = window.__ENGINE;
    const s = e && e.getState();
    return s && s.booted && s.device && s.device.id === 'action4';
  }, { timeout: 90000, polling: 200 });
  await sleep(1200);
  await page.evaluate(() => document.querySelector('#mpChips button')?.click());
  await sleep(700);
  await page.keyboard.press('Digit4');
  await sleep(700);
  const mobile = await page.evaluate(() => {
    const r = el => el ? el.getBoundingClientRect() : null;
    const sheet = r(document.querySelector('#ctxCard'));
    const clip = r(document.querySelector('#clipStrip'));
    return { sheet: !!sheet, clip: !!clip, gap: sheet && clip ? +(sheet.top - clip.bottom).toFixed(1) : null };
  });
  check('移动端 sheet 打开', mobile.sheet && mobile.clip);
  check('剖切条不被 sheet 遮挡', mobile.gap != null && mobile.gap >= 0, `间距 ${mobile.gap}px`);

  await browser.close();
  browser = null;
  check('无控制台错误', errors.length === 0, errors.slice(0, 3).join(' | '));
}catch(err){
  console.error('✗ 冒烟执行失败：', err && err.message || err);
  failures.push('执行异常');
}finally{
  if(browser) await browser.close().catch(() => {});
  server.kill('SIGTERM');
  if(server.exitCode == null) await Promise.race([new Promise(r => server.once('exit', r)), sleep(3000)]);
}

if(failures.length){
  console.log(`\n结果：${failures.length} 项失败 — ${failures.join('、')}`);
  process.exit(1);
}
console.log('\n✓ 冒烟通过');
