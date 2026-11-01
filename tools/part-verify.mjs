import puppeteer from 'puppeteer-core';
import { existsSync } from 'node:fs';
const OUT = new URL('../docs/design/screenshots/audit-native/', import.meta.url).pathname;
const c = ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'];
const browser = await puppeteer.launch({ executablePath: c.find(existsSync), headless: 'new', args: ['--enable-unsafe-swiftshader','--no-sandbox'] });
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900 });
/* iPhone 13：爆炸态 + 选中 speaker，看它从哪里拆出来 */
await page.goto('http://127.0.0.1:8137/#/device/iphone-13?e=1&p=speaker', { waitUntil: 'networkidle2', timeout: 60000 });
await page.waitForFunction(() => {
  const e = window.__ENGINE; const s = e && e.getState();
  return s && s.booted && /OFFICIAL|COMMUNITY|PROCEDURAL|FALLBACK/.test(s.modelStatus || '');
}, { timeout: 45000, polling: 300 });
await new Promise(r => setTimeout(r, 3000));
await page.screenshot({ path: `${OUT}part-iphone13-speaker.png` });
console.log('shot iphone13 speaker');
/* iPhone 16 usb-pcb 同查 */
await page.goto('http://127.0.0.1:8137/#/device/iphone-16?e=1&p=usb-pcb', { waitUntil: 'networkidle2', timeout: 60000 });
await page.waitForFunction(() => {
  const e = window.__ENGINE; const s = e && e.getState();
  return s && s.booted && /OFFICIAL|COMMUNITY|PROCEDURAL|FALLBACK/.test(s.modelStatus || '');
}, { timeout: 45000, polling: 300 });
await new Promise(r => setTimeout(r, 3000));
await page.screenshot({ path: `${OUT}part-iphone16-usbpcb.png` });
console.log('shot iphone16 usb-pcb');
await browser.close();
