#!/usr/bin/env node
/* V5.1 P1-S3 · 底座/坐标空间样式移植验证：
   ① 细方格 GridHelper（PolarGrid 已换）② stageDial 几何刻度盘（细环/72 刻度/断弧）存在且慢旋
   ③ 铅垂点线随空间辅助档位显隐 ④ 双厅 dial 材质口径 ⑤ 截图（夜/日/爆炸）。
   软渲染环境装载极慢（记忆库「无头冻结」条目：84.6s 实测）：等待一律按 300s 规程 + 时序采样。
   用法：node tools/v51-p1s3-stage-verify.mjs [--port 8251] [--device iphone-13] */
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(path.join(ROOT, 'package.json'));
const puppeteer = require('puppeteer-core');
const argPort = Number(process.argv.find(a => a.startsWith('--port'))?.split('=')[1] || 8251);
const PORT = Number(process.env.HUD_PORT || argPort);
/* --device 支持 =连接与空格两种形式（空格形式曾被 split('=') 吞掉，静默回落默认设备） */
const devArg = process.argv.find(a => a.startsWith('--device'));
const DEV_ID = devArg ? ((devArg.includes('=') ? devArg.split('=')[1] : process.argv[process.argv.indexOf(devArg) + 1]) || 'iphone-13') : 'iphone-13';
const BASE = `http://127.0.0.1:${PORT}`;
const OUT_DIR = path.join(ROOT, 'docs/design/screenshots/2026-11-06-v51-stage');

const CHROME = [
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Chromium.app/Contents/MacOS/Chromium',
].find(p => fs.existsSync(p));
if(!CHROME){ console.log('SKIP: 未找到 Chrome'); process.exit(0); }

const sleep = ms => new Promise(r => setTimeout(r, ms));
const failures = [];
function check(name, ok, detail){
  console.log(`${ok ? '✓' : '✗'} ${name}${detail !== undefined ? ' · ' + JSON.stringify(detail) : ''}`);
  if(!ok) failures.push(name);
}
const shrink = s => String(s ?? '').replace(/\s+/g, ' ').slice(0, 160);

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
  const t0 = Date.now();
  await page.goto(`${BASE}/#/device/${DEV_ID}`, { waitUntil: 'domcontentloaded', timeout: 60000 });
  if(!await waitLoaded(page)) throw new Error("装载等待超时（320s）");
  console.log(`loaded-in ${Math.round((Date.now() - t0) / 1000)}s（软渲染环境正常量级）`);
  await sleep(2500);

  /* ① 网格与刻度盘构造存在性 */
  const stage = await page.evaluate(() => {
    let grid = null, dial = null, ticks = 0, arc = null, plumb = null;
    window.__ENGINE.getScene().traverse(o => {
      if(o.type === 'GridHelper') grid = { visible: o.visible, opacity: +(o.material?.opacity ?? -1).toFixed(2), transparent: !!o.material?.transparent };
      if(o.name === 'stageDial'){
        dial = { visible: o.visible, children: o.children.length, rotY: +o.rotation.y.toFixed(4) };
        o.traverse(c => {
          if(c.type === 'LineSegments') ticks++;
          if(c.geometry && c.geometry.type === 'TorusGeometry') arc = { arc: +(c.geometry.parameters?.arc ?? -1).toFixed(3), op: +(c.material?.opacity ?? -1).toFixed(2) };
        });
      }
      if(o.name === 'plumbLine' && o.isLine){
        const y = o.geometry?.attributes?.position?.array?.[4];   // [x0,y0,z0,x1,y1,z1] → y1=线长
        plumb = { visible: o.visible, len: y === undefined ? -1 : +y.toFixed(2) };
      }
    });
    return { grid, dial, ticks, arc, plumb, plinthType: window.__ENGINE.getState().plinthType };
  });
  check('细方格 GridHelper（透明 0.7 铺底）', stage.grid && stage.grid.transparent && Math.abs(stage.grid.opacity - 0.7) < 0.02, stage.grid);
  check('stageDial 刻度盘存在（4 子件：环×2+刻度+断弧）', stage.dial && stage.dial.children === 4 && stage.ticks === 1, stage.dial);
  check('断弧 Torus（≈1.12π 弧段）', stage.arc && Math.abs(stage.arc.arc - Math.PI * 1.12) < 0.01, stage.arc);
  check('展台三型选型', ['precision', 'industrial', 'large'].includes(stage.plinthType), stage.plinthType);
  const thinWarm = await page.evaluate(() => {
    let thin = false, warm = null;
    window.__ENGINE.getScene().traverse(o => {
      if(o.isMesh && o.geometry?.type === 'CylinderGeometry' && Math.abs((o.geometry.parameters?.height ?? 9) - 0.16) < 0.001) thin = true;
      if(o.isPointLight && o.color.getHexString() === 'ff9a45') warm = o.intensity;
    });
    return { thin, warm };
  });
  check('薄盘展台（body 高 0.16）+ 暖色底光（夜厅 70）', thinWarm.thin && thinWarm.warm === 70, thinWarm);

  /* ② 铅垂点线：standard 显示 / off 收起 */
  check('铅垂点线 standard 档显示（长度>0）', stage.plumb && stage.plumb.visible && stage.plumb.len > 0.1, stage.plumb);
  await page.evaluate(() => window.__ENGINE.setSpaceAid('off'));
  await sleep(400);
  const plumbOff = await page.evaluate(() => {
    let v = null; window.__ENGINE.getScene().traverse(o => {
      if(o.name === 'plumbLine') v = o.visible;
    }); return v;
  });
  check('铅垂点线 off 档收起', plumbOff === false, plumbOff);
  await page.evaluate(() => window.__ENGINE.setSpaceAid('standard'));
  await sleep(400);

  /* ③ 慢旋：微小 explode 抖动强制渲染帧，rotation.y 前进（R1 半率下随渲染帧推进） */
  const rot0 = await page.evaluate(() => {
    let r = 0; window.__ENGINE.getScene().traverse(o => { if(o.name === 'stageDial') r = o.rotation.y; }); return r;
  });
  for(let i = 0; i < 10; i++){
    await page.evaluate((k) => window.__ENGINE.setExplode(k), 0.02 * (i % 2));
    await sleep(260);
  }
  const rot1 = await page.evaluate(() => {
    let r = 0; window.__ENGINE.getScene().traverse(o => { if(o.name === 'stageDial') r = o.rotation.y; }); return r;
  });
  check('刻度盘慢旋推进（0.035rad/s × 采样窗）', rot1 > rot0, { rot0: +rot0.toFixed(4), rot1: +rot1.toFixed(4) });

  /* ④ 双厅口径（切厅渐变 0.6s 走主循环——软渲染下需抖动强制帧驱动 tween） */
  await page.screenshot({ path: path.join(OUT_DIR, 's1-night-dial.png') });
  await page.evaluate(() => window.__ENGINE.setHallMode('day'));
  for(let i = 0; i < 8; i++){ await page.evaluate((k) => window.__ENGINE.setExplode(k), 0.02 * (i % 2)); await sleep(200); }
  const dayDial = await page.evaluate(() => {
    const mats = [];
    window.__ENGINE.getScene().traverse(o => { if(o.name === 'stageDial') o.traverse(c => { if(c.material) mats.push({ blend: c.material.blending, color: '#' + c.material.color.getHexString(), op: +c.material.opacity.toFixed(2) }); }); });
    let gridOp = null; window.__ENGINE.getScene().traverse(o => { if(o.type === 'GridHelper') gridOp = +o.material.opacity.toFixed(2); });
    return { mats, gridOp };
  });
  const normalBlend = dayDial.mats.length && dayDial.mats.every(m => m.blend === 1);   // THREE.NormalBlending = 1
  check('日厅刻度盘换 Normal 混合暖石墨', normalBlend, dayDial.mats[0] || null);
  check('日厅网格透明度收敛 0.35', Math.abs(dayDial.gridOp - 0.35) < 0.02, dayDial.gridOp);
  await page.evaluate(() => window.__ENGINE.setExplode(0));
  await page.screenshot({ path: path.join(OUT_DIR, 's2-day-dial.png') });
  /* 顶视角：俯视刻度盘全貌（环/刻度/断弧 + 方格网格） */
  await page.evaluate(() => { window.__ENGINE.setHallMode('night'); window.__ENGINE.flyToView('top'); });
  for(let i = 0; i < 6; i++){ await page.evaluate((k) => window.__ENGINE.setExplode(k), 0.02 * (i % 2)); await sleep(200); }
  await page.screenshot({ path: path.join(OUT_DIR, 's4-top-dial.png') });
  await page.evaluate(() => { window.__ENGINE.resetView(); window.__ENGINE.setExplode(1); });
  await sleep(2600);
  await page.screenshot({ path: path.join(OUT_DIR, 's3-night-exploded.png') });

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
