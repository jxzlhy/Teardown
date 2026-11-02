/* V4.0 MI④ 验证：forge V8 工作循环 Tour——7 步策展 + 讲解词 + 手动步进 + 曲轴步联动演示 */
import puppeteer from 'puppeteer-core';
import { existsSync } from 'node:fs';
const c = ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'];
const browser = await puppeteer.launch({ executablePath: c.find(existsSync), headless: 'new', args: ['--enable-unsafe-swiftshader','--no-sandbox'] });
const page = await browser.newPage();
page.setDefaultTimeout(25000);
const errors = [];
page.on('pageerror', e => errors.push(e.message.slice(0, 120)));
const booted = () => page.waitForFunction(() => { const e = window.__ENGINE; const s = e && e.getState(); return s && s.booted && s.parts && s.parts.length; }, { timeout: 25000, polling: 300 });

await page.goto('http://127.0.0.1:8137/#/forge?gen=v8&seed=tour-test&auto=1', { waitUntil: 'domcontentloaded', timeout: 25000 });
await booted();
await new Promise(r => setTimeout(r, 1800));

/* 1. 启动导览（手动模式便于断言） */
await page.evaluate(() => window.__ENGINE.startTour('manual'));
await new Promise(r => setTimeout(r, 900));
const s1 = await page.evaluate(() => { const s = window.__ENGINE.getState(); return { tour: !!s.tour, step: s.tour && s.tour.i, id: s.selected, noteLen: (s.tourNote || '').length }; });
console.log('tour start:', JSON.stringify(s1));

/* 2. 步进到曲轴步 → 演示应自动激活（crank 选中 = demo master） */
await page.evaluate(() => window.__ENGINE.tourNext());
await new Promise(r => setTimeout(r, 800));
const s2 = await page.evaluate(() => { const s = window.__ENGINE.getState(); return { id: s.selected, demoActive: s.demoActive }; });
console.log('step2 (crank):', JSON.stringify(s2), '=> demo 联动:', s2.demoActive ? 'OK' : 'FAIL');

/* 3. 全程步进 7 步到末尾 */
let last = null;
for (let i = 0; i < 8; i++) {
  last = await page.evaluate(() => { window.__ENGINE.tourNext(); const s = window.__ENGINE.getState(); return { i: s.tour ? s.tour.i : 'end', id: s.selected }; });
}
console.log('after full step:', JSON.stringify(last));

/* 4. 讲解卡 UI 渲染（tour-note-text 存在且非空） */
const noteUi = await page.evaluate(() => {
  const el = document.querySelector('.tour-note-text');
  return el ? el.textContent.slice(0, 24) : null;
});
console.log('note ui:', JSON.stringify(noteUi));

/* 5. 停止导览复位 */
await page.evaluate(() => window.__ENGINE.stopTour());
await new Promise(r => setTimeout(r, 600));
const s5 = await page.evaluate(() => ({ tour: !!window.__ENGINE.getState().tour }));
console.log('stop:', JSON.stringify(s5));

console.log('errors(', errors.length, '):', errors.slice(0, 4));
await browser.close().catch(() => {});
process.exit(errors.length ? 1 : 0);
