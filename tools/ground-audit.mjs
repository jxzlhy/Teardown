/* V3 接地审计（P1）：无头扫描设备模型 hull 底面与展台台面（y=-3.9）的悬空间距。
   只读页面状态（__ENGINE.getState().parts），不写源码。输出分级表 → stdout。
   用法: node tools/ground-audit.mjs [sampleN]  （默认抽样 16 台，跨类型取代表） */
import puppeteer from 'puppeteer-core';
import { existsSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { installDomShim } from './lib-node-shim.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SAMPLE = [
  'action4','pocket3','iphone-12','ipad-pro','imac','framework-laptop13','gameboy','switch2',
  'v8-engine','jet-engine','ak-47','orrery','grand-piano','tourbillon-movement','marshall-jcm800','avata2',
];
const argAll = process.argv.includes('--all');
let ids = SAMPLE;
if (argAll) {
  /* 全量模式：Node 端枚举 manifest 全部设备 id（DOM shim 仅供 registry 求值） */
  installDomShim();
  const { devices } = await import(pathToFileURL(path.join(ROOT, 'src/devices/registry.js')).href);
  ids = devices.map(d => d.id);
} else {
  const n = Number(process.argv[2] || 0);
  ids = n ? SAMPLE.slice(0, n) : SAMPLE;
}

const c = ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'];
const browser = await puppeteer.launch({ executablePath: c.find(existsSync), headless: 'new', args: ['--enable-unsafe-swiftshader','--no-sandbox'] });
const page = await browser.newPage();
page.on('pageerror', () => {});
await page.setViewport({ width: 960, height: 640 });

const rows = [];
for (const id of ids) {
  try {
    await page.goto(`http://127.0.0.1:8137/#/device/${id}`, { waitUntil: 'networkidle2', timeout: 60000 });
    await page.waitForFunction((want) => {
      const e = window.__ENGINE; const s = e && e.getState();
      /* SPA 切台竞态守卫：必须确认状态已切到目标设备（同 render-thumbs 约定） */
      return s && s.booted && s.device && s.device.id === want && s.parts && s.parts.length;
    }, { timeout: 60000, polling: 400 }, id);
    /* 开场演出（55% 爆炸态入场）未落定时 bbox 会失真——等 2.2s 再测 */
    await new Promise(r => setTimeout(r, 2200));
    const r = await page.evaluate(() => {
      const T = window.__THREE;
      const s = window.__ENGINE.getState();
      const bb = new T.Box3();
      for (const p of s.parts){ const g = p.group || p.mesh; if (g) bb.expandByObject(g); }
      if (bb.isEmpty()) return null;
      /* 稳健下沿（与引擎 setPlinthTop 同口径）：最低四分位 mesh-min 中位数，滤远处杂点网格 */
      const mins = [];
      window.__ENGINE.getScene().traverse(o => { if (o.isMesh && o.userData && o.userData.partId) { const b = new T.Box3().setFromObject(o); if (!b.isEmpty()) mins.push(b.min.y); } });
      mins.sort((a,b) => a-b);
      const q = Math.max(1, Math.ceil(mins.length * 0.25));
      const mid = q >> 1;
      const robust = mins.length ? (q % 2 ? mins[mid] : (mins[mid-1] + mins[mid]) / 2) : bb.min.y;
      const min = bb.min.y, size = bb.max.y - bb.min.y;
      return { min: +min.toFixed(3), gap: +(min - (-3.9)).toFixed(3), h: +size.toFixed(2),
               robust: +robust.toFixed(3), rgap: +(robust - (-3.9)).toFixed(3) };
    });
    rows.push({ id, ...(r || {}) });
    console.log(r ? `${id.padEnd(22)} rawGap=${r.gap}  robustGap=${r.rgap}  h=${r.h}` : `${id.padEnd(22)} NO-BBOX`);
  } catch (e) {
    rows.push({ id, err: String(e.message).slice(0, 60) });
    console.log(`${id.padEnd(22)} ERR ${String(e.message).slice(0, 60)}`);
  }
}
await browser.close();
const ok = rows.filter(r => r.rgap !== undefined);
const floats = ok.filter(r => r.rgap > 0.05);
const sunk = ok.filter(r => r.rgap < -0.05);
console.log(`\n== 汇总（稳健口径）：${rows.length} 台 · 悬浮展台接底 ${floats.length} · 落地式展台隐没 ${sunk.length} · 无读数 ${rows.length - ok.length}`);
console.log('落地式(引擎已钳制,展台隐没=预期):', sunk.map(r => `${r.id}:${r.rgap}`).join('  ') || '无');
const outliers = ok.filter(r => Math.abs(r.rgap - r.gap) > 1.5);
console.log('bbox 杂点离群（rawGap 与 robustGap 差 >1.5）:', outliers.map(r => `${r.id}(raw ${r.gap}/robust ${r.rgap})`).join('  ') || '无');
console.log('无读数:', rows.filter(r => r.gap === undefined).map(r => r.id).join(' ') || '无');
/* JSON 工件供治理决策 */
const { writeFileSync } = await import('node:fs');
writeFileSync(new URL('../docs/ui-ux/v4-ground-audit.json', import.meta.url), JSON.stringify({ ts: new Date().toISOString(), rows }, null, 1));
console.log('JSON → docs/ui-ux/v4-ground-audit.json');
