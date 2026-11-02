/* V4.0 MI⑤ 验证：runQA 五类诊断——干净件零 ERROR / 注入缺陷件被捕获 / 总览面板渲染 */
import puppeteer from 'puppeteer-core';
import { existsSync } from 'node:fs';
const c = ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'];
const browser = await puppeteer.launch({ executablePath: c.find(existsSync), headless: 'new', args: ['--enable-unsafe-swiftshader','--no-sandbox'] });
const page = await browser.newPage();
page.setDefaultTimeout(30000);
const errors = [];
page.on('pageerror', e => errors.push(e.message.slice(0, 100)));
const booted = () => page.waitForFunction(() => { const e = window.__ENGINE; const s = e && e.getState(); return s && s.booted && s.parts && s.parts.length; }, { timeout: 30000, polling: 300 });

/* 1. 锻造 V8（干净件）：0 ERROR */
await page.goto('http://127.0.0.1:8137/#/forge?gen=v8&seed=qa-test&auto=1', { waitUntil: 'domcontentloaded', timeout: 30000 });
await booted();
await new Promise(r => setTimeout(r, 1200));
const qa1 = await page.evaluate(() => { const r = window.__ENGINE.runQA(); return { counts: r.counts, faces: r.faces, cats: [...new Set(r.findings.map(f => f.cat))] }; });
console.log('clean QA:', JSON.stringify(qa1));

/* 2. 注入缺陷：demo 引用失效 + 部件 ID 冲突模拟（直接改 state 数据后重跑 runQA） */
const qa2 = await page.evaluate(() => {
  const s = window.__ENGINE.getState();
  s.device.demos = [{ partId: 'ghost-part', label: 'x' }];
  const r1 = window.__ENGINE.runQA();
  s.device.demos = [];
  return { ghostCaught: r1.findings.some(f => f.level === 'ERROR' && f.text.includes('ghost-part')) };
});
console.log('injected ghost demo ref:', JSON.stringify(qa2));

/* 3. 总览面板渲染（有发现则列出；干净则显示通过文案） */
await page.evaluate(() => document.querySelector('[aria-label="设备总览"]').click());
await new Promise(r => setTimeout(r, 600));
const ui = await page.evaluate(() => {
  const box = document.querySelector('.qa-box');
  return box ? { counts: box.querySelector('.qa-counts').textContent.replace(/\s+/g, ' ').trim(), items: box.querySelectorAll('.qa-item').length } : null;
});
console.log('qa panel:', JSON.stringify(ui));

/* 4. 真实设备 v8-engine（有杂点历史？看实际分级） */
await page.goto('http://127.0.0.1:8137/#/device/v8-engine', { waitUntil: 'domcontentloaded', timeout: 30000 });
await page.waitForFunction((w) => { const e = window.__ENGINE; const s = e && e.getState(); return s && s.booted && s.device && s.device.id === w && s.parts.length; }, { timeout: 60000, polling: 300 }, 'v8-engine');
await new Promise(r => setTimeout(r, 2200));
const qa4 = await page.evaluate(() => { const r = window.__ENGINE.runQA(); return { counts: r.counts, top: r.findings.slice(0, 3).map(f => f.level + ':' + f.cat) }; });
console.log('v8-engine QA:', JSON.stringify(qa4));

console.log('errors(', errors.length, '):', errors.slice(0, 4));
await browser.close().catch(() => {});
process.exit(errors.length || !qa2.ghostCaught ? 1 : 0);
