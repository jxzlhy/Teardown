/* V2 阶段A验证：① rail 双模式切换与记忆 ② 浮层栈同位冲突消除（clip+tour+viewStrip 同时开） */
import puppeteer from 'puppeteer-core';
import { existsSync } from 'node:fs';
const OUT = new URL('../docs/design/screenshots/', import.meta.url).pathname;
const c = ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'];
const browser = await puppeteer.launch({ executablePath: c.find(existsSync), headless: 'new', args: ['--enable-unsafe-swiftshader','--no-sandbox'] });
const page = await browser.newPage();
page.on('pageerror', e => console.log('PAGEERROR:', e.message.slice(0,120)));
await page.setViewport({ width: 1440, height: 900 });
await page.goto('http://127.0.0.1:8137/#/device/iphone-12-teardown', { waitUntil: 'networkidle2', timeout: 90000 });
await page.waitForFunction(() => { const e = window.__ENGINE; const s = e && e.getState(); return s && s.booted; }, { timeout: 80000, polling: 300 });
await new Promise(r => setTimeout(r, 3000));

/* rail 双模式 */
await page.click('.rail-mode');
await new Promise(r => setTimeout(r, 500));
const grid = await page.evaluate(() => ({
  gridCells: document.querySelectorAll('.gcell').length,
  listRows: document.querySelectorAll('.prow').length,
  mode: localStorage.getItem('teardown-rail-mode'),
}));
console.log('grid mode:', JSON.stringify(grid));
await page.screenshot({ path: `${OUT}v2-rail-grid.png` });
await page.click('.rail-mode');
await new Promise(r => setTimeout(r, 400));
console.log('back to list:', await page.evaluate(() => document.querySelectorAll('.prow').length));

/* 浮层栈：剖切 + 导览 + 视角条同时开 → 三层应错位无重叠 */
await page.evaluate(() => { window.__ENGINE.setMode('clip'); });
await new Promise(r => setTimeout(r, 600));
await page.evaluate(() => window.__ENGINE.startTour('auto'));
await new Promise(r => setTimeout(r, 900));
await page.evaluate(() => { const b = [...document.querySelectorAll('#dock .hud-icon')].find(x => x.getAttribute('aria-label') === '视角预设'); b && b.click(); });
await new Promise(r => setTimeout(r, 700));
const stack = await page.evaluate(() => {
  const bottoms = {};
  for(const [k, sel] of Object.entries({ clip: '#clipStrip', tour: '#tourBar', views: '#viewStrip', note: '#tourNote' })){
    const el = document.querySelector(sel);
    bottoms[k] = el ? +getComputedStyle(el).bottom.replace('px','') : null;
  }
  return bottoms;
});
console.log('stack bottoms:', JSON.stringify(stack));
const ys = Object.values(stack).filter(v => v !== null);
const noOverlap = new Set(ys).size === ys.length;
console.log('no overlap:', noOverlap);
await page.screenshot({ path: `${OUT}v2-float-stack.png` });
await page.evaluate(() => window.__ENGINE.stopTour());
await browser.close();
