/* 阶段E 验证：竖屏取景（整机/爆炸/选中）、桌面 dock、帮助卡移动端 */
import puppeteer from 'puppeteer-core';
import { existsSync } from 'node:fs';
const OUT = new URL('../docs/design/screenshots/', import.meta.url).pathname;
function findChrome(){
  const c = ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', '/Applications/Chromium.app/Contents/MacOS/Chromium'];
  for(const p of c) if(existsSync(p)) return p;
  throw new Error('no chrome');
}
const browser = await puppeteer.launch({ executablePath: findChrome(), headless: 'new',
  args: ['--enable-unsafe-swiftshader', '--no-sandbox'] });
const errors = [];
async function shot(name, url, { vw, vh, mobile = false, wait = 9000 }){
  const page = await browser.newPage();
  page.on('pageerror', e => errors.push(`[${name}] ${e.message}`));
  await page.setViewport({ width: vw, height: vh, isMobile: mobile, hasTouch: mobile, deviceScaleFactor: mobile ? 2 : 1 });
  await page.goto(url, { waitUntil: 'networkidle2', timeout: 45000 });
  await new Promise(r => setTimeout(r, wait));
  await page.screenshot({ path: `${OUT}${name}.png` });
  console.log('shot:', name);
  await page.close();
}
const B = 'http://127.0.0.1:8137';
await shot('e2-workspace-mobile', `${B}/#/device/action4`, { vw: 390, vh: 844, mobile: true });
await shot('e2-workspace-mobile-exploded', `${B}/#/device/action4?e=1`, { vw: 390, vh: 844, mobile: true });
await shot('e2-ctxcard-mobile', `${B}/#/device/action4?p=battery`, { vw: 390, vh: 844, mobile: true, wait: 11000 });
await shot('e2-workspace-desktop', `${B}/#/device/action4`, { vw: 1440, vh: 900 });
await shot('e2-guide-mobile', `${B}/#/device/action4`, { vw: 390, vh: 844, mobile: true, wait: 6000 });
await browser.close();
console.log(errors.length ? errors.join('\n') : '(no page errors)');
