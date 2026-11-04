/* V4.1 mech 滚动验证：orrery + hubble-telescope 机构面板（独立端口 8312） */
import { createServer } from 'vite';
import puppeteer from 'puppeteer-core';
import { existsSync } from 'node:fs';
const server = await createServer({ logLevel: 'error', server: { port: 8312, host: '127.0.0.1', strictPort: true } });
await server.listen();
const c = ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'];
const browser = await puppeteer.launch({ executablePath: c.find(existsSync), headless: 'new', args: ['--enable-unsafe-swiftshader','--no-sandbox'] });
const page = await browser.newPage();
page.setDefaultTimeout(60000);
const errors = [];
page.on('pageerror', e => { errors.push(e.message.slice(0, 100)); console.log('PAGEERROR:', e.message.slice(0, 160)); });
page.on('console', m => { if (m.type() === 'error') console.log('CONSOLE-ERR:', m.text().slice(0, 160)); });
await page.setViewport({ width: 1440, height: 900 });
for (const id of ['orrery', 'hubble-telescope']) {
  await page.goto('http://127.0.0.1:8312/#/device/' + id, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForFunction((w) => { const e = window.__ENGINE; const s = e && e.getState(); return s && s.booted && s.device && s.device.id === w && s.parts.length; }, { timeout: 60000, polling: 300 }, id);
  await new Promise(r => setTimeout(r, 1500));
  await page.evaluate(() => { document.querySelector('[aria-label="设备总览"]').click(); });
  await new Promise(r => setTimeout(r, 600));
  const p = await page.evaluate(() => {
    const b = document.querySelector('.mech-box');
    return b ? b.querySelectorAll('.mech-edge').length + ' 边 / ' + b.querySelectorAll('.mech-glabel').length + ' 组' : 'HIDDEN';
  });
  console.log(id + ':', p);
}
console.log('errors(', errors.length, ')');
await browser.close().catch(() => {});
await server.close();
process.exit(errors.length ? 1 : 0);
