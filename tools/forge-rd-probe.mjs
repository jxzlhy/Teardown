/* FORGE-99 卡点探针：分步标记 + 短超时定位 */
import puppeteer from 'puppeteer-core';
import { existsSync } from 'node:fs';
const c = ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'];
const browser = await puppeteer.launch({ executablePath: c.find(existsSync), headless: 'new', args: ['--enable-unsafe-swiftshader','--no-sandbox'] });
const page = await browser.newPage();
page.setDefaultTimeout(20000);
page.on('pageerror', e => console.log('PAGEERROR:', e.message.slice(0, 200)));
page.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') console.log('console.' + m.type() + ':', m.text().slice(0, 140)); });
console.log('T0 goto /forge');
await page.goto('http://127.0.0.1:8137/#/forge', { waitUntil: 'domcontentloaded', timeout: 20000 });
console.log('T1 forge loaded');
await new Promise(r => setTimeout(r, 1500));
console.log('T2 build ringdrive in page');
const built = await page.evaluate(async () => {
  try {
    const { createForgeDevice } = await import('/src/forge/registry.js');
    const d = createForgeDevice('ringdrive', undefined, 'probe99');
    return { id: d.id, parts: d.parts.length };
  } catch (e) { return { err: String(e && e.stack || e).slice(0, 300) }; }
});
console.log('T3 built:', JSON.stringify(built));
console.log('T4 navigate device');
await page.goto('http://127.0.0.1:8137/#/device/' + built.id, { waitUntil: 'domcontentloaded', timeout: 20000 });
console.log('T5 device page loaded, wait booted');
try {
  await page.waitForFunction(() => { const e = window.__ENGINE; const s = e && e.getState(); return s && s.booted && s.parts && s.parts.length; }, { timeout: 20000, polling: 300 });
  const st = await page.evaluate(() => window.__ENGINE.getState().parts.map(p => p.data.id).join(','));
  console.log('T6 booted parts:', st);
} catch (e) { console.log('T6 TIMEOUT booted:', String(e.message).slice(0, 80)); }
await browser.close();
console.log('done');
