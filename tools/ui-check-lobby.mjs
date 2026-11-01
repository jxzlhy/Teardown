/* 阶段D 验证截图：大厅桌面（首屏+滚动）与移动（首屏+筛选展开/收合） */
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

async function shot(name, { vw, vh, mobile = false, scrollTo, tapFilter = false }){
  const page = await browser.newPage();
  await page.setViewport({ width: vw, height: vh, isMobile: mobile, hasTouch: mobile, deviceScaleFactor: mobile ? 2 : 1 });
  await page.goto('http://127.0.0.1:8137/#/', { waitUntil: 'networkidle2', timeout: 45000 });
  await new Promise(r => setTimeout(r, 2600));
  if(tapFilter){
    await page.click('.filter-toggle');
    await new Promise(r => setTimeout(r, 500));
  }
  if(scrollTo != null){
    await page.evaluate(y => document.querySelector('.hub')?.scrollTo(0, y), scrollTo);
    await new Promise(r => setTimeout(r, 700));
  }
  await page.screenshot({ path: `${OUT}${name}.png` });
  console.log('shot:', name);
  await page.close();
}
await shot('d2-lobby-desktop-top', { vw: 1440, vh: 900 });
await shot('d2-lobby-desktop-scrolled', { vw: 1440, vh: 900, scrollTo: 1500 });
await shot('d2-lobby-mobile-top', { vw: 390, vh: 844, mobile: true });
await shot('d2-lobby-mobile-collapsed-scroll', { vw: 390, vh: 844, mobile: true, scrollTo: 1200 });
await shot('d2-lobby-mobile-filter-open', { vw: 390, vh: 844, mobile: true, tapFilter: true });
await browser.close();
