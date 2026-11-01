/* 验证 8200 实例恢复：pocket3 正常装载无 LOAD ERROR */
import puppeteer from 'puppeteer-core';
import { existsSync } from 'node:fs';
const c = ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'];
const browser = await puppeteer.launch({ executablePath: c.find(existsSync), headless: 'new', args: ['--enable-unsafe-swiftshader','--no-sandbox'] });
const page = await browser.newPage();
page.on('pageerror', e => console.log('PAGEERROR:', String(e && e.message || e).slice(0,140)));
await page.setViewport({ width: 1440, height: 900 });
await page.goto('http://127.0.0.1:8200/#/device/pocket3', { waitUntil: 'networkidle2', timeout: 90000 });
await page.waitForFunction(() => { const e = window.__ENGINE; const s = e && e.getState(); return s && s.booted; }, { timeout: 80000, polling: 300 });
await new Promise(r => setTimeout(r, 1000));
const ok = await page.evaluate(() => ({
  booted: window.__ENGINE.getState().booted,
  loadErr: !!document.querySelector('#loadErr'),
  status: window.__ENGINE.getState().modelStatus,
}));
console.log('8200 pocket3:', JSON.stringify(ok));
await browser.close();
