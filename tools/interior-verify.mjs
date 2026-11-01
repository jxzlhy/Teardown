/* 内部视角验证：Digit9 → X-Ray 联动 + gizmo 读数 */
import puppeteer from 'puppeteer-core';
import { existsSync } from 'node:fs';
const OUT = new URL('../docs/design/screenshots/', import.meta.url).pathname;
const c = ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'];
const browser = await puppeteer.launch({ executablePath: c.find(existsSync), headless: 'new', args: ['--enable-unsafe-swiftshader','--no-sandbox'] });
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900 });
await page.goto('http://127.0.0.1:8137/#/device/radial-engine', { waitUntil: 'networkidle2', timeout: 90000 });
await page.waitForFunction(() => { const e = window.__ENGINE; const s = e && e.getState(); return s && s.booted; }, { timeout: 80000, polling: 300 });
await new Promise(r => setTimeout(r, 1200));
await page.keyboard.press('Digit9');
await new Promise(r => setTimeout(r, 1500));
const state = await page.evaluate(() => {
  const s = window.__ENGINE.getState();
  return { viewMode: s.viewMode, selected: s.selected, preset: 'interior' };
});
console.log('interior state:', JSON.stringify(state));
await page.screenshot({ path: `${OUT}v2-interior-preset.png` });
await browser.close();
