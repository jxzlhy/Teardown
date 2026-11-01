/* 捕获 Vue errorHandler 的真实错误（通过 window 注入） */
import puppeteer from 'puppeteer-core';
import { existsSync } from 'node:fs';
const c = ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'];
const browser = await puppeteer.launch({ executablePath: c.find(existsSync), headless: 'new', args: ['--enable-unsafe-swiftshader','--no-sandbox'] });
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900 });
/* 在应用挂载前注入 errorHandler 捕获 */
await page.evaluateOnNewDocument(() => {
  window.__VUE_ERRS = [];
  const orig = console.error;
  console.error = (...args) => {
    const t = args.map(a => {
      try{ return typeof a === 'string' ? a : (a && a.message) || JSON.stringify(a).slice(0, 300); }catch{ return String(a); }
    }).join(' | ');
    window.__VUE_ERRS.push(t.slice(0, 500));
    orig(...args);
  };
});
await page.goto('http://127.0.0.1:8137/#/device/action4', { waitUntil: 'networkidle2', timeout: 90000 });
await page.waitForFunction(() => { const e = window.__ENGINE; const s = e && e.getState(); return s && s.booted; }, { timeout: 80000, polling: 300 });
await page.evaluate(() => { const b = [...document.querySelectorAll('#topbar .hud-icon')].find(x => x.getAttribute('aria-label') === '设备总览'); b && b.click(); });
await new Promise(r => setTimeout(r, 700));
await page.evaluate(() => { const b = document.querySelector('.rate-expand'); b && b.click(); });
await new Promise(r => setTimeout(r, 400));
await page.evaluate(() => { const t = document.querySelector('.rate-note'); t.value = 'err 探测'; t.dispatchEvent(new Event('input', { bubbles: true })); });
await new Promise(r => setTimeout(r, 600));
const errs = await page.evaluate(() => window.__VUE_ERRS.filter(t => /error|Error|警告|Unhandled/.test(t)).slice(0, 4));
console.log(JSON.stringify(errs, null, 1).slice(0, 1600));
await browser.close();
