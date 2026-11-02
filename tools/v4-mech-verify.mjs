/* V4.0 MI Slice 验证：机构关系面板（forge V8 真实数据）——渲染/分组/点击选中/校验拒绝 */
import puppeteer from 'puppeteer-core';
import { existsSync } from 'node:fs';
const c = ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'];
const browser = await puppeteer.launch({ executablePath: c.find(existsSync), headless: 'new', args: ['--enable-unsafe-swiftshader','--no-sandbox'] });
const page = await browser.newPage();
page.setDefaultTimeout(25000);
const errors = [];
page.on('pageerror', e => errors.push(e.message.slice(0, 120)));
await page.setViewport({ width: 1440, height: 900 });

/* 1. forge V8：生成 → 打开总览 → mech 面板渲染 */
await page.goto('http://127.0.0.1:8137/#/forge?gen=v8&seed=mech-test&auto=1', { waitUntil: 'domcontentloaded', timeout: 25000 });
await page.waitForFunction(() => { const e = window.__ENGINE; const s = e && e.getState(); return s && s.booted && s.parts && s.parts.length; }, { timeout: 25000, polling: 300 });
await new Promise(r => setTimeout(r, 1500));
await page.evaluate(() => document.querySelector('[aria-label="设备总览"]').click());
await new Promise(r => setTimeout(r, 600));
const panel = await page.evaluate(() => {
  const box = document.querySelector('.mech-box');
  if (!box) return null;
  const groups = [...box.querySelectorAll('.mech-glabel')].map(g => g.textContent.trim().replace(/\s+/g, ' '));
  const edges = box.querySelectorAll('.mech-edge').length;
  const exact = box.querySelectorAll('.mech-arrow[data-k="exact"]').length;
  const approx = box.querySelectorAll('.mech-arrow[data-k="approx"]').length;
  return { groups, edges, exact, approx };
});
console.log('mech panel:', JSON.stringify(panel));

/* 2. 点击 slider_crank 关系 → 选中曲轴 + 相机聚焦 */
await page.evaluate(() => { [...document.querySelectorAll('.mech-edge')].find(b => b.textContent.includes('──▸')).click(); });
await new Promise(r => setTimeout(r, 900));
const sel = await page.evaluate(() => ({ selected: window.__ENGINE.getState().selected, part: document.querySelector('.ctx-name, .ctx-title')?.textContent?.slice(0, 14) }));
console.log('edge click →', JSON.stringify(sel));

/* 3. 真实设备（v8-engine 无 mech 数据）→ 面板隐藏（不虚构） */
await page.goto('http://127.0.0.1:8137/#/device/v8-engine', { waitUntil: 'domcontentloaded', timeout: 30000 });
await page.waitForFunction((w) => { const e = window.__ENGINE; const s = e && e.getState(); return s && s.booted && s.device && s.device.id === w && s.parts.length; }, { timeout: 60000, polling: 300 }, 'v8-engine');
await page.evaluate(() => document.querySelector('[aria-label="设备总览"]').click());
await new Promise(r => setTimeout(r, 500));
const hidden = await page.evaluate(() => !document.querySelector('.mech-box'));
console.log('real device (no mech data) panel hidden:', hidden);

console.log('errors(', errors.length, '):', errors.slice(0, 4));
await browser.close().catch(() => {});
process.exit(errors.length || !panel || !sel.selected ? 1 : 0);
