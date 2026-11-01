import puppeteer from 'puppeteer-core';
import { existsSync } from 'node:fs';
const c = ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'];
const browser = await puppeteer.launch({ executablePath: c.find(existsSync), headless: 'new', args: ['--enable-unsafe-swiftshader','--no-sandbox'] });
const page = await browser.newPage();
page.on('pageerror', e => console.log('PAGEERROR:', String(e && e.message || e).slice(0,200)));
await page.setViewport({ width: 1440, height: 900 });
await page.goto('http://127.0.0.1:8137/#/device/jet-engine', { waitUntil: 'networkidle2', timeout: 90000 });
await page.waitForFunction(() => { const e = window.__ENGINE; const s = e && e.getState(); return s && s.booted; }, { timeout: 80000, polling: 300 });
await new Promise(r => setTimeout(r, 1200));
const probe = await page.evaluate(() => {
  const s = window.__ENGINE.getState();
  return {
    demos: s.demos, demoActive: s.demoActive, selected: s.selected,
    hasFan: !!s.partsById['fan-section'], rm: matchMedia('(prefers-reduced-motion: reduce)').matches,
  };
});
console.log('before select:', JSON.stringify(probe).slice(0, 400));
await page.evaluate(() => window.__ENGINE.selectPart('fan-section'));
await new Promise(r => setTimeout(r, 1200));
const after = await page.evaluate(() => ({ demoActive: window.__ENGINE.getState().demoActive, selected: window.__ENGINE.getState().selected }));
console.log('after select:', JSON.stringify(after));
await browser.close();
