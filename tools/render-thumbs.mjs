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
if(!argAll && !only) ids = ids.filter(i => !fs.existsSync(path.join(THUMB_DIR, i + '.webp')));
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
const browser = await puppeteer.launch({
  executablePath, headless: true,
  args: ['--no-sandbox', '--disable-dev-shm-usage', '--enable-unsafe-swiftshader',
         '--use-angle=swiftshader', '--hide-scrollbars', '--force-color-profile=srgb'],
});
const page = await browser.newPage();
await page.setViewport({ width: W, height: H, deviceScaleFactor: 1 });
page.on('pageerror', e => console.log('  [pageerror]', String(e).slice(0, 200)));

let ok = 0, fail = 0;
for(const id of ids){
  const t0 = Date.now();
  try{
    await page.goto(`http://127.0.0.1:${PORT}/#/device/${id}?thumb=1`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    /* hash 切换是页内导航：booted 不会复位，必须确认状态已切到目标设备，
       否则批量渲染可能截到上一台的画面 */
    await page.waitForFunction((want) => {
      const e = window.__ENGINE;
      if(!e) return false;
      const s = e.getState();
      return !!s.booted && s.device && s.device.id === want
        && /OFFICIAL|PROCEDURAL|FALLBACK/.test(s.modelStatus || '');
    }, { timeout: 90000, polling: 200 }, id);
    const status = await page.evaluate(() => window.__ENGINE.getState().modelStatus);
    await page.evaluate(() => window.__ENGINE.thumbView());
    await new Promise(r => setTimeout(r, 400));   // 等 controls.update / 缓动收敛
    const dataUrl = await page.evaluate(() => window.__ENGINE.snapshot('image/webp', 0.87));
    const buf = Buffer.from(dataUrl.split(',')[1], 'base64');
    fs.writeFileSync(path.join(THUMB_DIR, id + '.webp'), buf);
    ok++;
    console.log(`✓ ${id} · ${(buf.length/1024).toFixed(0)}KB · ${status} · ${((Date.now()-t0)/1000).toFixed(1)}s`);
  }catch(err){
    fail++;
    console.log(`✗ ${id} · ${String(err && err.message || err).slice(0, 160)}`);
  }
}

await browser.close();
await server.close();
console.log(`\n完成：${ok} 成功 / ${fail} 失败 → public/thumbs/`);
process.exit(fail ? 1 : 0);
