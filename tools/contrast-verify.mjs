#!/usr/bin/env node
/* =============================================================
   对比度回归校验（审计 P1-3 整改 + ROADMAP 2-B）
   运行时扫描真实页面文本，按 WCAG 2.1 相对亮度判定 AA：
     正文 <18.66px 或 <24px 非加粗 ⇒ 需 ≥4.5:1；大字/粗体 ⇒ 需 ≥3:1
   口径：跳过不可见元素（display/visibility/opacity 含祖先链、零尺寸、
   纯图标），背景取最近不透明祖先（贴图/画布上的文字不计，偏乐观已在报告说明）。
   颜色解析走 canvas fillStyle（支持 rgb()/rgba()/color(srgb)/oklch 等 CSS Color 4）。
   用法：node tools/contrast-verify.mjs [--base http://127.0.0.1:5199] [--max 0] [--verbose]
   退出码：不达标节点数 > --max（默认 0）时 1
============================================================= */
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(path.join(ROOT, 'package.json'));
const puppeteer = require('puppeteer-core');

const arg = (name, dft) => { const i = process.argv.indexOf(name); return i >= 0 ? process.argv[i + 1] : dft; };
const BASE = arg('--base', 'http://127.0.0.1:5173');
const MAX = Number(arg('--max', '0'));
const verbose = process.argv.includes('--verbose');

const CHROME = ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Chromium.app/Contents/MacOS/Chromium',
  '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
  '/usr/bin/google-chrome', '/usr/bin/chromium'].find(p => { try { return require('node:fs').existsSync(p); } catch { return false; } });
if (!CHROME) { console.log('SKIP: 未找到 Chrome/Chromium/Edge'); process.exit(0); }

const sleep = ms => new Promise(r => setTimeout(r, ms));

function SCAN(hall) {
  const norm = (css) => {                       /* 任意 CSS 颜色 → [r,g,b,a] 0-255/0-1 */
    const c = document.createElement('canvas'); c.width = c.height = 1;
    const x = c.getContext('2d');
    x.clearRect(0, 0, 1, 1); x.fillStyle = '#000'; x.fillStyle = css;
    x.fillRect(0, 0, 1, 1);
    const d = x.getImageData(0, 0, 1, 1).data;
    return [d[0], d[1], d[2], d[3] / 255];
  };
  const lin = v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
  const lum = c => 0.2126 * lin(c[0]) + 0.7152 * lin(c[1]) + 0.0722 * lin(c[2]);
  const visible = el => {
    let n = el;
    while (n && n !== document.body) {
      const cs = getComputedStyle(n);
      if (cs.display === 'none' || cs.visibility === 'hidden' || Number(cs.opacity) < 0.5) return false;
      n = n.parentElement;
    }
    const r = el.getBoundingClientRect();
    return r.width >= 3 && r.height >= 3;
  };
  const comp = (fg, bg) => { const a = fg[3]; return [fg[0] * a + bg[0] * (1 - a), fg[1] * a + bg[1] * (1 - a), fg[2] * a + bg[2] * (1 - a), 1]; };
  const bgOf = el => {                       /* 沿祖先链做 source-over 合成，半透明底不再当实色用 */
    const chain = [];
    let n = el;
    while (n) { const c = norm(getComputedStyle(n).backgroundColor); if (c[3] > 0) chain.push(c); if (c[3] >= 0.999) break; n = n.parentElement; }
    let acc = [8, 12, 20, 1];                /* 兜底：夜厅底色 */
    for (let i = chain.length - 1; i >= 0; i--) acc = comp(chain[i], acc);
    return acc;
  };
  const out = [];
  document.querySelectorAll('body *').forEach(e => {
    if (!visible(e)) return;
    if (![...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim())) return;
    const cs = getComputedStyle(e);
    const fg = norm(cs.color); if (fg[3] < 0.06) return;
    const bg = bgOf(e);
    const f = fg.slice(0, 3).map((v, i) => v * fg[3] + bg[i] * (1 - fg[3]));
    const l1 = lum(f), l2 = lum(bg);
    const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
    const px = parseFloat(cs.fontSize);
    const bold = Number(cs.fontWeight) >= 700;
    const need = (px >= 24 || (px >= 18.66 && bold)) ? 3 : 4.5;
    if (ratio < need) out.push({
      txt: e.textContent.trim().replace(/\s+/g, ' ').slice(0, 18),
      cls: (e.className || '').toString().split(' ')[0],
      px, w: cs.fontWeight, ratio: +ratio.toFixed(2), need,
    });
  });
  out.sort((a, b) => a.ratio - b.ratio);
  const seen = new Set();
  const uniq = out.filter(o => { const k = o.cls + '|' + o.need; if (seen.has(k)) return false; seen.add(k); return true; });
  return { hall: document.documentElement.dataset.hall, want: hall, failing: out.length, failingUnique: uniq.length, worst: uniq.slice(0, 12) };
}

const CASES = [
  ['大厅', '/#/', 'night'],
  ['大厅', '/#/', 'day'],
  ['大厅网格', '/#/', 'night', 1500],
  ['大厅网格', '/#/', 'day', 1500],
  ['设备页', '/#/device/pocket3', 'night'],
  ['设备页', '/#/device/pocket3', 'day'],
  ['星图', '/#/graph', 'night'],
  ['编年', '/#/timeline', 'night'],
  ['对比', '/#/compare/iphone', 'night'],
  ['锻造所', '/#/forge', 'night'],
];

const browser = await puppeteer.launch({
  executablePath: CHROME, headless: true,
  args: ['--no-sandbox', '--disable-dev-shm-usage', '--use-angle=metal', '--hide-scrollbars'],
  defaultViewport: { width: 1440, height: 900, deviceScaleFactor: 1 },
});
const page = await browser.newPage();
let total = 0, bad = 0;
for (const [label, hash, hall, scroll] of CASES) {
  await page.goto(BASE + '/#/', { waitUntil: 'domcontentloaded' }).catch(() => {});
  await page.evaluate(h => localStorage.setItem('dtm.hall', h), hall);
  await page.goto(BASE + hash, { waitUntil: 'networkidle2', timeout: 60000 }).catch(() => {});
  /* hash 路由不重载：显式 reload 让厅别 token 真正生效，否则测到的是上一例的厅 */
  await page.reload({ waitUntil: 'networkidle2' });
  await sleep(2600);
  if (hash.startsWith('/#/device/')) {
    for (let i = 0; i < 160; i++) { if (await page.evaluate(() => !!(window.__ENGINE && window.__ENGINE.getState && window.__ENGINE.getState().booted))) break; await sleep(250); }
    await sleep(2500);
  }
  if (scroll) await page.evaluate(y => { const h = document.querySelector('.hub'); if (h) h.scrollTop = y; }, scroll);
  await sleep(900);
  const r = await page.evaluate(SCAN, hall);
  total += r.failing;
  if (r.failing > MAX) bad++;
  console.log(`${r.failing <= MAX ? '✓' : '✗'} ${label} · ${r.hall}：不达标 ${r.failing} 节点 / ${r.failingUnique} 类`);
  if (verbose || r.failing > MAX) for (const w of r.worst) console.log(`    ${String(w.ratio).padStart(5)}:1  ${w.px}px w${w.w}  .${w.cls}  「${w.txt}」`);
}
await browser.close();
console.log(`\n合计不达标节点：${total}`);
process.exit(bad ? 1 : 0);
