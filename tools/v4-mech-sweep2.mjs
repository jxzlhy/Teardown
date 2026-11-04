/* V4.1 mech 滚动验证 v2：orrery + hubble（8137 主 server + 重试护栏） */
import puppeteer from 'puppeteer-core';
import { existsSync } from 'node:fs';
const c = ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'];
const browser = await puppeteer.launch({ executablePath: c.find(existsSync), headless: 'new', args: ['--enable-unsafe-swiftshader','--no-sandbox'] });
const page = await browser.newPage();
page.setDefaultTimeout(60000);
const errors = [];
page.on('pageerror', e => { errors.push(e.message.slice(0, 100)); console.log('PAGEERROR:', e.message.slice(0, 160)); });
page.on('console', m => { if (m.type() === 'error') console.log('CONSOLE-ERR:', m.text().slice(0, 160)); });
await page.setViewport({ width: 1440, height: 900 });
for (const id of ['wall-clock', 'gramophone', 'angle-grinder']) {
  await page.goto('http://127.0.0.1:8137/#/device/' + id, { waitUntil: 'domcontentloaded', timeout: 60000 });
  let booted = false;
  for (let i = 0; i < 10; i++) {
    booted = await page.evaluate((w) => { const e = window.__ENGINE; const s = e && e.getState(); return !!(s && s.booted && s.device && s.device.id === w && s.parts.length); }, id);
    if (booted) break;
    await new Promise(r => setTimeout(r, 5000));
    await page.goto('http://127.0.0.1:8137/#/device/' + id, { waitUntil: 'domcontentloaded', timeout: 60000 });
  }
  if (!booted) { console.log(id + ': BOOT-FAIL（重试 10 次未成）'); continue; }
  await new Promise(r => setTimeout(r, 1500));
  await page.evaluate(() => { document.querySelector('[aria-label="设备总览"]').click(); });
  await new Promise(r => setTimeout(r, 700));
  const p = await page.evaluate(() => {
    const b = document.querySelector('.mech-box');
    return b ? b.querySelectorAll('.mech-edge').length + ' 边 / ' + b.querySelectorAll('.mech-glabel').length + ' 组' : 'HIDDEN';
  });
  console.log(id + ':', p);
}
console.log('errors(', errors.length, ')', errors.slice(0, 3));
await browser.close().catch(() => {});
process.exit(0);
