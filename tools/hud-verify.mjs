#!/usr/bin/env node
/* 设备页 HUD 验证：2026-11-03 三区升级（顶栏规格 chip / rail 两行 / 档案瓦片 / 进度读数 / 底座刻度盘）
   自起 Vite → 无头 Chrome：DOM 断言 + 日夜双厅 × 桌面/移动 截图目检 + 控制台错误检查。
   高负载环境（并行会话共用整机）下渲染进程可能被杀（frame got detached）：
   每段流程以独立 browser 实例运行，失败自动换新实例重试一次（已知环境坑，见记忆库）。
   用法：node tools/hud-verify.mjs [--port 8233] [--no-shots] */
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(path.join(ROOT, 'package.json'));
const puppeteer = require('puppeteer-core');
const argPort = Number(process.argv.find(a => a.startsWith('--port'))?.split('=')[1] || 8233);
const PORT = Number(process.env.HUD_PORT || argPort);
const SHOTS = !process.argv.includes('--no-shots');
const OUT_DIR = path.join(ROOT, 'docs/design/screenshots/2026-11-03-hud-rev');
/* 验证目标设备：默认 iphone-13（178KB、正常尺度——高负载环境内存压力小，且 flyToPart 取景正常；
   m4-carbine 为 188× 缩放补偿的特殊设备，怼近取景不适合视觉验收；整机空闲可用 --device action4）。 */
const DEV_ID = (process.argv.find(a => a.startsWith('--device'))?.split('=')[1]) || 'iphone-13';
const DEVICES = {
  'action4':    { model: 'AC203',      minTiles: 10, era: true,  minParts: 10 },
  'iphone-13':  { model: 'IPHONE 13',  minTiles: 8,  era: true,  minParts: 4  },
  'm4-carbine': { model: 'M4 CARBINE', minTiles: 8,  era: false, minParts: 5  },
};
const DEV = DEVICES[DEV_ID];
if(!DEV){ console.error(`未知验证设备：${DEV_ID}（可选：${Object.keys(DEVICES).join(', ')}）`); process.exit(2); }
const BASE = `http://127.0.0.1:${PORT}`;

const CHROME = [
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Chromium.app/Contents/MacOS/Chromium',
  '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
  '/usr/bin/google-chrome', '/usr/bin/chromium',
].find(p => fs.existsSync(p));
if(!CHROME){
  console.log('SKIP: 未找到 Chrome/Chromium/Edge');
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
    try{ const res = await fetch(BASE + '/'); if(res.ok) return; }catch{}
    await sleep(500);
  }
  throw new Error('Vite 未在 60s 内启动');
}

const server = spawn(process.execPath, [
  path.join(ROOT, 'node_modules/vite/bin/vite.js'),
  '--host', '127.0.0.1', '--port', String(PORT), '--strictPort',
], { cwd: ROOT, stdio: 'ignore' });

/* 每段流程独立 browser：崩溃/帧分离后换新实例重试一次 */
let browser = null;
async function withPage(flow, tries = 2){
  for(let i = 1; i <= tries; i++){
    try{
      browser = await puppeteer.launch({
        executablePath: CHROME, headless: true,
        protocolTimeout: 600000,   // 高负载下页面 JS 冻结会打穿默认 180s CDP 协议超时
        args: ['--no-sandbox', '--disable-dev-shm-usage', '--enable-unsafe-swiftshader',
               '--use-angle=swiftshader', '--hide-scrollbars', '--force-color-profile=srgb',
               '--js-flags=--max-old-space-size=3072'],
      });
      const page = await browser.newPage();
      const errors = [];
      page.on('pageerror', e => errors.push('pageerror: ' + (e?.message || e)));
      page.on('console', m => { if(m.type() === 'error') errors.push(m.text()); });
      const shot = async (name) => {
        if(!SHOTS) return;
        await page.screenshot({ path: path.join(OUT_DIR, name + '.png') });
        console.log(`  📷 ${name}.png`);
      };
      await flow(page, errors, shot);
      return;
    }catch(err){
      const msg = (err?.message || String(err)).split('\n')[0];
      if(i < tries) console.log(`  ⚠ 流程失败（高负载环境），换新浏览器实例重试：${msg}`);
      else throw err;
    }finally{
      try{ if(browser){ await Promise.race([browser.close(), sleep(8000)]); } }catch{}
      browser = null;
    }
  }
}

async function waitBooted(page){
  await page.goto(BASE + `/#/device/${DEV_ID}`, { waitUntil: 'domcontentloaded', timeout: 60000 });
  /* 与 smoke 同口径：booted + 配置就绪 + 模型状态离开 LOADING（否则截图是空盘）。
     高负载（并行会话）下 swiftshader 启动实测可达 90s+，放宽到 300s。 */
  await page.waitForFunction((id) => {
    const e = window.__ENGINE; const s = e && e.getState();
    return s && s.booted && s.device && s.device.id === id
      && /COMMUNITY|OFFICIAL|PROCEDURAL|FALLBACK/.test(s.modelStatus || '');
  }, { timeout: 300000, polling: 200 }, DEV_ID);
}

try{
  await waitServer();
  if(SHOTS) fs.mkdirSync(OUT_DIR, { recursive: true });

  /* ---------- 桌面 1440×900 · 夜厅：三区升级断言 + 三张截图 ---------- */
  await withPage(async (page, errors, shot) => {
    await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
    await waitBooted(page);
    await sleep(3600);   // 开场演出收尾 + UI 入场完成
    await shot('d1-night-overview');

    /* V5.1 P5 · 顶栏底座重构：品牌块 + 中央舞台状态 + FPS 读数 */
    const shell = await page.evaluate(() => ({
      eyebrow: document.querySelector('#topbar .tb-eyebrow')?.textContent.trim() || '',
      title: document.querySelector('#topbar .tb-title b')?.textContent.trim() || '',
      center: document.querySelector('#topbar .tb-center span')?.textContent.trim() || '',
      fps: document.querySelector('#topbar .tb-fps b')?.textContent.trim() || '',
    }));
    check('顶栏底座：品牌 eyebrow/型号大字/中央舞台状态/FPS 读数齐全',
      /^STRUCTURE DECONSTRUCTION \/ ?\d{2}$/.test(shell.eyebrow.replace(/\s+/g, ' ')) && !!shell.title &&
      /VIEW · REAL-TIME 3D/.test(shell.center) && /^\d+$/.test(shell.fps), JSON.stringify(shell));

    /* CORE PROFILE 面板（规格瓦片自顶栏 chips 迁入，V5.1 P5） */
    const chips = await page.evaluate(() => [...document.querySelectorAll('#corePanel .cp-cell')].map(s => ({
      k: s.querySelector('i')?.textContent.trim(), v: s.querySelector('b')?.textContent.trim(),
    })));
    check('CORE PROFILE 规格瓦片（来自设备档案，≥3）',
      chips.length >= 3 && chips.every(c => c.k && c.v), JSON.stringify(chips));

    /* 底座三新件：四角括框 / 左下指引卡 / 右下拆解序列刻度 */
    const chrome = await page.evaluate(() => ({
      frame: document.querySelectorAll('.stage-frame i').length,
      guide: !!document.querySelector('#quickGuide'),
      seqTicks: document.querySelectorAll('#exSeq .exs-ticks i').length,
    }));
    check('取景框四角 + 指引卡 + 拆解序列刻度（=部件数）',
      chrome.frame === 4 && chrome.guide && chrome.seqTicks >= DEV.minParts, JSON.stringify(chrome));

    /* rail 两行行结构（R3） */
    const rail = await page.evaluate(() => {
      const rows = [...document.querySelectorAll('#rail .prow')];
      return {
        n: rows.length,
        twoLine: rows.filter(r => r.querySelector('.pname') && r.querySelector('.pen')).length,
        count: document.querySelector('#rail .rail-count')?.textContent.trim(),
      };
    });
    check('rail 两行行结构（CN+EN 副行）齐全',
      rail.n >= DEV.minParts && rail.twoLine === rail.n && rail.count === String(rail.n), JSON.stringify(rail));

    /* 拆解进度读数（R5）：格式为 0–100% 且接近满拆（ui.explode 本身是 0–100 百分比）。
       软渲染饱和下补间推进慢（rAF 2-4/s）——固定 1.8s 会读到中途值（68% 假阴性）：
       轮询等待读数 ≥90（30s 上限），数值在变=补间在推进（时序判定口径） */
    await page.evaluate(() => window.__ENGINE.setExplode(1));
    let readout = '';
    for(let i = 0; i < 30; i++){
      await sleep(1000);
      readout = await page.evaluate(() => document.querySelector('#exReadout')?.textContent.trim() || '');
      if(/^\d{1,3}%$/.test(readout) && parseInt(readout) >= 90) break;
    }
    check('拆解进度读数随 explode 更新（≤3 位百分比，≥90%）',
      /^\d{1,3}%$/.test(readout || '') && parseInt(readout) >= 90, readout);
    await page.evaluate(() => window.__ENGINE.setExplode(0));
    await sleep(900);

    /* 档案面板（R4）：型号大字 + 规格瓦片（DOM .spec>.k+.v 保留，供 smoke） */
    await page.click('#topbar .hud-icon:nth-of-type(1)');
    await sleep(1200);
    const dossier = await page.evaluate((dev) => ({
      model: document.querySelector('#infoPop .dp-model')?.textContent.trim(),
      tiles: document.querySelectorAll('#infoPop .spec').length,
      era: [...document.querySelectorAll('#infoPop .spec .k')].some(k => k.textContent === '发布'),
      credit: !!document.querySelector('#infoPop .d-tip'),
    }), DEV_ID);
    const dossierOk = dossier.model === DEV.model && dossier.tiles >= DEV.minTiles
      && (!DEV.era || dossier.era);
    check(`档案面板：型号大字 ${DEV.model} + 规格瓦片 ≥${DEV.minTiles}` + (DEV.era ? ' + era 行' : ''),
      dossierOk, JSON.stringify(dossier));
    await shot('d2-night-dossier');
    await page.keyboard.press('Escape');
    await sleep(500);

    /* 部件详情卡 + coordAid 淡出（选首部件，随设备参数化） */
    const firstPart = await page.evaluate(() => window.__ENGINE.getState().parts[0]?.data?.id);
    await page.evaluate((id) => window.__ENGINE.selectPart(id), firstPart);
    await page.evaluate((id) => window.__ENGINE.flyToPart(id), firstPart);
    await sleep(1600);
    const part = await page.evaluate(() => ({
      ctx: !!document.querySelector('#ctxCard'),
      coordHidden: getComputedStyle(document.querySelector('#coordAid')).opacity === '0',
    }));
    check('部件详情卡打开 + 坐标辅助淡出（不再压卡）', part.ctx && part.coordHidden, JSON.stringify(part));
    await shot('d3-night-part');
    const deskErrors = errors.filter(t =>
      !/favicon/.test(t) && !/SwiftShader|swiftshader/i.test(t) && !/GPU stall/i.test(t) &&
      !/Automatic fallback to software WebGL/.test(t));
    check('桌面段控制台无真实错误', deskErrors.length === 0, deskErrors.slice(0, 3).join(' | ') || 'clean');
  });

  /* ---------- 日厅 + 移动端 390×844：主题切换 / chips / sheet 截图 ---------- */
  await withPage(async (page, errors, shot) => {
    await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 1 });
    await waitBooted(page);
    /* 日厅：点击 dock 双厅按钮（与 Vue applyHall 同路径，CSS 主题同步） */
    await page.click('#dock .hud-icon[aria-label="白天/黑夜双厅"]');
    await sleep(1600);   // 0.6s 光照渐变 + CSS 过渡
    check('日厅 CSS 主题生效', await page.evaluate(() => document.documentElement.dataset.hall === 'day'));
    const mp = await page.evaluate(() => ({
      chips: document.querySelectorAll('#mpChips .hud-chip').length,
      coreHidden: !document.querySelector('#corePanel')
        || getComputedStyle(document.querySelector('#corePanel')).display === 'none',
    }));
    check('移动端：chips 横滑行 + CORE PROFILE 常驻面板隐藏', mp.chips >= DEV.minParts && mp.coreHidden, JSON.stringify(mp));
    await shot('m1-day-mobile');
    await page.evaluate(() => document.querySelector('#mpChips button')?.click());
    await sleep(900);
    await shot('m2-day-mobile-sheet');
    /* 移动端详情卡与坐标辅助互斥（sheet 打开时 coordAid 不应可见） */
    const coordHidden = await page.evaluate(() =>
      getComputedStyle(document.querySelector('#coordAid')).opacity === '0');
    check('移动端 sheet 打开时坐标辅助不压卡', coordHidden);
    const mobErrors = errors.filter(t =>
      !/favicon/.test(t) && !/SwiftShader|swiftshader/i.test(t) && !/GPU stall/i.test(t) &&
      !/Automatic fallback to software WebGL/.test(t));
    check('移动段控制台无真实错误', mobErrors.length === 0, mobErrors.slice(0, 3).join(' | ') || 'clean');
  });
}catch(err){
  failures.push('脚本异常: ' + (err?.message || err));
  console.error(err);
}finally{
  try{ if(browser){ await Promise.race([browser.close(), sleep(8000)]); } }catch{}
  server.kill();
}
console.log(failures.length ? `\nFAIL ${failures.length} 项` : '\nALL PASS');
process.exit(failures.length ? 1 : 0);
