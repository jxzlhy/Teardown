#!/usr/bin/env node
/* =============================================================
   离线渲染大厅缩略图：public/thumbs/<id>.webp
   原理：Vite dev server + 无头 Chrome（SwiftShader 软渲染 WebGL），
   逐台打开 /#/device/<id>?thumb=1，等官方 GLB 合入后调 engine.thumbView()
   取景，再 engine.snapshot() 导出 WebP（引擎内同步帧，无黑屏问题）。
   用法：
     npm run thumbs              # 全部缺图的设备
     npm run thumbs -- --all     # 强制重渲全部
     npm run thumbs -- --only action4,s25
============================================================= */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createServer } from 'vite';
import { installDomShim } from './lib-node-shim.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const THUMB_DIR = path.join(ROOT, 'public/thumbs');
const PORT = 8301;
const W = 760, H = 560;

const argAll = process.argv.includes('--all');
const onlyIdx = process.argv.indexOf('--only');
const only = onlyIdx >= 0 ? process.argv[onlyIdx + 1].split(',').map(s => s.trim()) : null;

/* 枚举设备 id（Node 端 import registry，DOM shim 仅供求值） */
installDomShim();
const { devices } = await import(pathToFileURL(path.join(ROOT, 'src/devices/registry.js')).href);
let ids = devices.map(d => d.id);
if(only) ids = ids.filter(i => only.includes(i));
fs.mkdirSync(THUMB_DIR, { recursive: true });
if(!argAll && !only) ids = ids.filter(i => !fs.existsSync(path.join(THUMB_DIR, i + '.webp')) || !fs.existsSync(path.join(THUMB_DIR, i + '-day.webp')));
if(!ids.length){ console.log('没有需要渲染的缩略图（全部已存在，--all 强制重渲）'); process.exit(0); }
console.log(`待渲染 ${ids.length} 台：` + ids.join(', '));

/* ---- 找本机 Chrome ---- */
const CHROME_CANDIDATES = [
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Chromium.app/Contents/MacOS/Chromium',
  '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
  '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser',
];
const executablePath = process.env.CHROME_PATH || CHROME_CANDIDATES.find(p => fs.existsSync(p));
if(!executablePath){
  console.error('✗ 未找到 Chrome/Chromium（可用 CHROME_PATH=... 指定）');
  process.exit(1);
}

/* ---- 起 dev server + 无头浏览器 ---- */
const server = await createServer({
  root: ROOT, logLevel: 'error',
  server: { port: PORT, host: '127.0.0.1', strictPort: true },
});
await server.listen();
console.log(`✓ dev server @ http://127.0.0.1:${PORT}`);

const { default: puppeteer } = await import('puppeteer-core');

/* 每台设备可用独立 browser 实例：高负载（并行会话）下渲染进程可能被系统回收
   （frame detached → page 报废），换新实例重试即可恢复（2026-11-03 hud-verify 同款护栏）。 */
const launchPage = async () => {
  const b = await puppeteer.launch({
    executablePath, headless: true,
    protocolTimeout: 600000,   // 页面 JS 冻结时默认 180s CDP 协议超时会误杀
    args: ['--no-sandbox', '--disable-dev-shm-usage', '--enable-unsafe-swiftshader',
           '--use-angle=swiftshader', '--hide-scrollbars', '--force-color-profile=srgb'],
  });
  const p = await b.newPage();
  await p.setViewport({ width: W, height: H, deviceScaleFactor: 1 });
  p.on('pageerror', e => console.log('  [pageerror]', String(e).slice(0, 200)));
  return { browser: b, page: p };
};
let { browser, page } = await launchPage();

/* 单台渲染：boot 校验（防截到上一台）→ 日厅变体 → 夜厅标准图 */
async function renderOne(page, id){
  await page.goto(`http://127.0.0.1:${PORT}/#/device/${id}?thumb=1`, { waitUntil: 'domcontentloaded', timeout: 30000 });
  /* hash 切换是页内导航：booted 不会复位，必须确认状态已切到目标设备，
     否则批量渲染可能截到上一台的画面 */
  await page.waitForFunction((want) => {
    const e = window.__ENGINE;
    if(!e) return false;
    const s = e.getState();
    return !!s.booted && s.device && s.device.id === want
      && /OFFICIAL|COMMUNITY|PROCEDURAL|FALLBACK/.test(s.modelStatus || '');
  }, { timeout: 180000, polling: 200 }, id);
  const status = await page.evaluate(() => window.__ENGINE.getState().modelStatus);
  /* V4.0 Slice 1：双厅缩略图——同页先出日厅变体（setHallMode 渐变后取景），再回夜厅出标准图。
     日变体缺失时大厅自动回退夜图（GalleryHub thumbSrc）。 */
  let dayKB = null;
  const needDay = argAll || !fs.existsSync(path.join(THUMB_DIR, id + '-day.webp'));
  if(needDay){
    await page.evaluate(() => window.__ENGINE.setHallMode('day'));
    await new Promise(r => setTimeout(r, 1500));   // 双厅渐变（0.6s）+ 阴影稳定
    await page.evaluate(() => window.__ENGINE.thumbView());
    await new Promise(r => setTimeout(r, 400));
    const dayUrl = await page.evaluate(() => window.__ENGINE.snapshot('image/webp', 0.87));
    const dayBuf = Buffer.from(dayUrl.split(',')[1], 'base64');
    fs.writeFileSync(path.join(THUMB_DIR, id + '-day.webp'), dayBuf);
    dayKB = (dayBuf.length / 1024).toFixed(0);
  }
  await page.evaluate(() => window.__ENGINE.setHallMode('night'));
  await new Promise(r => setTimeout(r, 900));
  await page.evaluate(() => window.__ENGINE.thumbView());
  await new Promise(r => setTimeout(r, 400));   // 等 controls.update / 缓动收敛
  const dataUrl = await page.evaluate(() => window.__ENGINE.snapshot('image/webp', 0.87));
  const buf = Buffer.from(dataUrl.split(',')[1], 'base64');
  fs.writeFileSync(path.join(THUMB_DIR, id + '.webp'), buf);
  return { status, dayKB, kb: (buf.length / 1024).toFixed(0) };
}

let ok = 0, fail = 0;
for(const id of ids){
  const t0 = Date.now();
  try{
    const { status, dayKB, kb } = await renderOne(page, id);
    ok++;
    console.log(`✓ ${id} · ${kb}KB${dayKB ? ' · day ' + dayKB + 'KB' : ''} · ${status} · ${((Date.now()-t0)/1000).toFixed(1)}s`);
  }catch(err){
    const msg = String(err && err.message || err).slice(0, 120);
    console.log(`  ↻ ${id} 失败（${msg}），换新浏览器实例重试…`);
    try{ await browser.close(); }catch{}   // close 挂起为已知环境坑，不阻塞重试
    try{
      ({ browser, page } = await launchPage());
      const { status, dayKB, kb } = await renderOne(page, id);
      ok++;
      console.log(`✓ ${id}（重试成功）· ${kb}KB${dayKB ? ' · day ' + dayKB + 'KB' : ''} · ${status} · ${((Date.now()-t0)/1000).toFixed(1)}s`);
    }catch(err2){
      fail++;
      console.log(`✗ ${id} · ${String(err2 && err2.message || err2).slice(0, 160)}`);
    }
  }
}

try{ await browser.close(); }catch{}
await server.close();
console.log(`\n完成：${ok} 成功 / ${fail} 失败 → public/thumbs/`);
process.exit(fail ? 1 : 0);
