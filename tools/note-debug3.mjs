import puppeteer from 'puppeteer-core';
import { existsSync } from 'node:fs';
const c = ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'];
const browser = await puppeteer.launch({ executablePath: c.find(existsSync), headless: 'new', args: ['--enable-unsafe-swiftshader','--no-sandbox'] });
const page = await browser.newPage();
page.on('console', m => { if(m.type() === 'error' || m.type() === 'warn') console.log('CON:', m.text().slice(0,600)); });
await page.setViewport({ width: 1440, height: 900 });
await page.goto('http://127.0.0.1:8137/#/device/action4', { waitUntil: 'networkidle2', timeout: 90000 });
await page.waitForFunction(() => { const e = window.__ENGINE; const s = e && e.getState(); return s && s.booted; }, { timeout: 80000, polling: 300 });
await page.evaluate(() => { const b = [...document.querySelectorAll('#topbar .hud-icon')].find(x => x.getAttribute('aria-label') === '设备总览'); b && b.click(); });
await new Promise(r => setTimeout(r, 700));
await page.evaluate(() => { const b = document.querySelector('.rate-expand'); b && b.click(); });
await new Promise(r => setTimeout(r, 400));
/* 检查 textarea 的 Vue 绑定是否真的存在（v-model 事件监听器） */
const probe = await page.evaluate(() => {
  const t = document.querySelector('.rate-note');
  if(!t) return { found: false };
  t.value = '探测备注 q1';
  t.dispatchEvent(new Event('input', { bubbles: true }));   // 带冒泡！
  t.dispatchEvent(new Event('change', { bubbles: true }));
  return { found: true, val: t.value };
});
console.log('probe:', JSON.stringify(probe));
await new Promise(r => setTimeout(r, 500));
console.log('saved:', await page.evaluate(() => localStorage.getItem('dtm.ratings')));
await browser.close();
