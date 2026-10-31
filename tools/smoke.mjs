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
  page.on('console', m => {
    if(m.type() !== 'error') return;
    const loc = m.location && m.location();
    errors.push(m.text().slice(0, 300) + ' @' + (loc ? (loc.url || '').split('/').pop() + ':' + (loc.lineNumber + 1) : '?'));
  });
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
    return e && e.getState().booted && /OFFICIAL|COMMUNITY|PROCEDURAL|FALLBACK/.test(e.getState().modelStatus || '');
  }, { timeout: 90000, polling: 200 });
  await sleep(800);
  const dev = await page.evaluate(() => {
    const s = window.__ENGINE.getState();
    return { status: s.modelStatus, parts: s.partsCount, loadErr: window.__LOAD_ERR || null, animErr: window.__animErr || null };
  });
  const cfgReqs = [...new Set(configReqs)];
  check('action4 装载成功', /OFFICIAL|COMMUNITY|PROCEDURAL/.test(dev.status) && dev.parts > 0, `${dev.status} · ${dev.parts} 部件`);
  check('仅加载当前设备配置', cfgReqs.length === 1 && cfgReqs[0].includes('action4'), cfgReqs.join(', '));
  check('无引擎/主循环异常', !dev.loadErr && !dev.animErr);

  /* X-Ray */
  await page.keyboard.press('Space');
  await sleep(1400);
  await page.keyboard.press('Digit2');
  await sleep(600);
  const xray = await page.evaluate(() => window.__ENGINE.getState().viewMode);
  check('X-Ray 模式可进入', xray === 'xray', xray || 'null');

  /* 剖切 stencil 封盖（LAB · Phase 2）：composer RT 带 stencilBuffer，
     掩码约束的剖面玻璃 capKind=stencil；无 stencil 环境回退 indicator */
  const cap = await page.evaluate(() => {
    window.__ENGINE.setMode('clip');
    const s = window.__ENGINE.getState();
    return { viewMode: s.viewMode, clipCap: s.clipCap };
  });
  check('剖切 stencil 封盖生效', cap.viewMode === 'clip' && cap.clipCap === 'stencil', cap.clipCap || 'null');
  await page.evaluate(() => window.__ENGINE.setMode(null));
  await sleep(200);

  /* 逐步装配（LAB · Phase 2）：assembleStep 组序步进 + Esc 补齐装配退出 */
  const st0 = await page.evaluate(() => {
    window.__ENGINE.stepAssembly(true);
    const s = window.__ENGINE.getState();
    return { i: s.step && s.step.i, n: s.step && s.step.n };
  });
  check('逐步装配进入（爆炸态从第 0 组开始）', st0.i === 0 && st0.n === 7, JSON.stringify(st0));
  await page.evaluate(() => { window.__ENGINE.stepNext(); window.__ENGINE.stepNext(); });
  await sleep(1600);
  const sd = await page.evaluate(() => ({
    step: window.__ENGINE.getState().step,
    shell: window.__ENGINE.getPartOffset('shell'),
    mainboard: window.__ENGINE.getPartOffset('mainboard'),
  }));
  check('逐步装配前两组就位（shell≈0，mainboard 仍拆出）',
    sd.step && sd.step.i === 2 && sd.shell < 0.02 && sd.mainboard > 0.3,
    `shell=${sd.shell} mainboard=${sd.mainboard}`);
  await page.keyboard.press('Escape');
  await sleep(4200);
  const st1 = await page.evaluate(() => {
    const s = window.__ENGINE.getState();
    return { step: s.step, ex: s.explodeCurrent };
  });
  check('Esc 退出逐步装配并复位整机', st1.step === null && st1.ex < 0.01, JSON.stringify(st1));
  await sleep(200);

  /* 知识库「原理」区（Phase 3）：选中 sensor → cmos-sensor 词条 + 来源链接；
     占位词条显示待编写 */
  await page.evaluate(() => window.__ENGINE.selectPart('sensor'));
  await sleep(500);
  const tech = await page.evaluate(() => {
    const el = document.querySelector('#ctxCard .ctx-tech');
    if(!el) return { found: false };
    return {
      found: true,
      title: (el.querySelector('.hud-eyebrow') || {}).textContent || '',
      body: (el.querySelector('.tech-body > p') || {}).textContent || '',
      links: el.querySelectorAll('.tech-src a').length,
    };
  });
  check('详情卡「原理」词条（CMOS 传感器 + 来源）',
    tech.found && tech.title.includes('CMOS') && tech.body.length > 40 && tech.links >= 1,
    tech.found ? `${tech.title.trim()} · ${tech.links} 来源` : '未渲染');
  await page.evaluate(() => window.__ENGINE.selectPart(null));

  /* 数字档案 era（Phase 3）：信息浮层「发布」行 + 大厅卡年代徽章 */
  await page.click('#topbar .hud-icon:nth-of-type(1)').catch(()=>{});
  const eraInfo = await page.evaluate(() => {
    const rows = [...document.querySelectorAll('#infoPop .spec .k')]
      .find(k => k.textContent === '发布');
    return { shown: !!rows, v: rows ? rows.nextElementSibling.textContent : '' };
  });
  check('信息浮层「发布」年代行', eraInfo.shown && /^\d{4}|^\d{4}s/.test(eraInfo.v), JSON.stringify(eraInfo));

  /* 代际对比（Phase 4）：Action 两代并排 + 同名键聚类 */
  await page.goto(BASE + '/#/compare/action', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForFunction(() => document.querySelectorAll('.cmp-dev').length >= 2, { timeout: 60000, polling: 200 });
  const cmp = await page.evaluate(() => ({
    cols: document.querySelectorAll('.cmp-dev').length,
    rows: document.querySelectorAll('.cmp-table tbody tr').length,
  }));
  check('代际对比页（Action 两代并排 + 规格聚类）', cmp.cols === 2 && cmp.rows >= 3, JSON.stringify(cmp));

  /* 视觉原理演示（Phase 5）：jet-engine 风扇段选中即绕轴线旋转（toast 标注示意动画） */
  await page.goto(BASE + '/#/device/jet-engine', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForFunction(() => { const e = window.__ENGINE; const s = e && e.getState(); return s && s.booted && /COMMUNITY|OFFICIAL/.test(s.modelStatus || ''); }, { timeout: 90000, polling: 200 });
  await sleep(400);
  await page.evaluate(() => window.__ENGINE.selectPart('fan-section'));
  await page.waitForFunction(() => window.__ENGINE.getState().demoActive, { timeout: 8000, polling: 100 });
  const d1 = await page.evaluate(() => window.__ENGINE.getPartRotation('fan-section').x);
  await sleep(900);
  const d2 = await page.evaluate(() => window.__ENGINE.getPartRotation('fan-section').x);
  check('运行演示：风扇段选中旋转', d2 > d1 + 0.2, `Δx=${(d2 - d1).toFixed(2)}`);
  await page.evaluate(() => window.__ENGINE.selectPart(null));

  /* 探索系统（Phase 7）：收藏持久化（localStorage）+ 足迹 */
  await page.goto(BASE + '/#/', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.evaluate(() => localStorage.removeItem('dtm.favorites'));
  await page.waitForSelector('.card', { timeout: 60000 });
  await page.evaluate(() => document.querySelector('.card .fav-star').click());
  await sleep(400);
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForSelector('.card', { timeout: 60000 });
  await sleep(400);
  const starOn = await page.evaluate(() => document.querySelectorAll('.fav-star.on').length);
  check('探索系统：收藏刷新后持久', starOn === 1, String(starOn));

  /* 导览升级（Phase 6）：对象条目讲解词 + 讲解卡 */
  await page.goto(BASE + '/#/device/pocket3', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForFunction(() => { const e = window.__ENGINE; const s = e && e.getState(); return s && s.booted && s.partsCount > 0; }, { timeout: 90000, polling: 200 });
  await page.evaluate(() => window.__ENGINE.startTour('auto'));
  await page.waitForFunction(() => !!document.querySelector('#tourNote .tour-note-text'), { timeout: 8000, polling: 200 });
  const noteText = await page.evaluate(() => document.querySelector('#tourNote .tour-note-text').textContent);
  check('导览讲解卡（策展讲解词渲染）', /旋转屏/.test(noteText), noteText.slice(0, 20));
  await page.evaluate(() => window.__ENGINE.stopTour());

  /* 技术编年（/timeline）：四段时代分带 + 事件数（懒加载 chunk 竞态下重试一次） */
  let tl = null;
  for(let attempt = 0; attempt < 2 && !tl; attempt++){
    await page.goto(BASE + '/#/timeline', { waitUntil: 'domcontentloaded', timeout: 60000 });
    try{
      await page.waitForFunction(() => document.querySelectorAll('.tl-band').length >= 4, { timeout: 20000, polling: 200 });
      tl = await page.evaluate(() => ({ bands: document.querySelectorAll('.tl-band').length, items: document.querySelectorAll('.tl-item').length }));
    }catch{ /* 重试 */ }
  }
  check('技术编年页（四段分带 + 84 事件）', tl && tl.bands === 4 && tl.items >= 80, JSON.stringify(tl));

  /* 测量工具（LAB · Phase 2）：BVH 两点表面取点 + 连线 + mm 标定读数（pocket3 带 realSizeMM） */
  await page.goto(BASE + '/#/device/pocket3', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForFunction(() => {
    const e = window.__ENGINE;
    const s = e && e.getState();
    return s && s.booted && s.device && s.device.id === 'pocket3';
  }, { timeout: 90000, polling: 200 });
  await sleep(800);
  const mpts = await page.evaluate(() => {
    const cam = window.__ENGINE.getCamera();
    const t = new window.__THREE.Vector3(0, 0.7, 0).project(cam);
    const b = new window.__THREE.Vector3(0, -0.7, 0).project(cam);
    return {
      a: { x: Math.round((t.x * .5 + .5) * innerWidth), y: Math.round((-t.y * .5 + .5) * innerHeight) },
      b: { x: Math.round((b.x * .5 + .5) * innerWidth), y: Math.round((-b.y * .5 + .5) * innerHeight) },
    };
  });
  await page.keyboard.press('KeyM');
  await sleep(300);
  for(const pt of [mpts.a, mpts.b]){
    await page.mouse.move(pt.x, pt.y);
    await page.mouse.down(); await page.mouse.up();
    await sleep(250);
  }
  const measure = await page.evaluate(() => {
    const s = window.__ENGINE.getState();
    const el = document.querySelector('.measure-tip');
    return {
      tool: s.tool, a: !!(s.measure && s.measure.a), b: !!(s.measure && s.measure.b),
      tipText: el ? el.textContent : '', shown: el ? el.style.display === 'block' : false,
    };
  });
  check('测量工具两点取点 + 读数显示',
    measure.tool === 'measure' && measure.a && measure.b && measure.shown, measure.tipText);
  check('测量读数为 mm 标定格式', /^\d+(\.\d+)? mm$/.test(measure.tipText), measure.tipText);
  await page.keyboard.press('Escape');
  await sleep(200);

  /* Tour 兜底：无策展顺序的设备按爆炸偏移从外到内 */
  await page.goto(BASE + '/#/device/marshall-jcm800', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForFunction(() => {
    const e = window.__ENGINE;
    const s = e && e.getState();
    return s && s.booted && s.device && s.device.id === 'marshall-jcm800'
      && /OFFICIAL|COMMUNITY|PROCEDURAL|FALLBACK/.test(s.modelStatus || '');
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

  /* 移动端详情 sheet：46vh 封顶 / 特写横幅限高 / 内容可滚动（防特写图撑爆回归） */
  const mobileDetail = await page.evaluate(() => {
    const sheet = document.querySelector('#ctxCard');
    if (!sheet) return { sheet: false };
    const r = sheet.getBoundingClientRect();
    const thumb = document.querySelector('#ctxCard .ctx-thumb');
    const thumbH = thumb ? Math.round(thumb.getBoundingClientRect().height) : null;
    const overflows = sheet.scrollHeight > sheet.clientHeight + 2;
    return {
      sheet: true,
      height: Math.round(r.height),
      maxOk: r.height <= window.innerHeight * 0.47 + 2,
      thumbH,
      thumbCapOk: thumbH == null || thumbH <= 170,
      scrollOk: overflows ? getComputedStyle(sheet).overflowY === 'auto' : true,
    };
  });
  check('移动端 sheet 高度封顶 46vh', mobileDetail.sheet && mobileDetail.maxOk, `高度 ${mobileDetail.height}px`);
  check('移动端特写限高横幅', mobileDetail.thumbCapOk, `特写 ${mobileDetail.thumbH}px`);
  check('移动端 sheet 内容可滚动', mobileDetail.scrollOk);

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
