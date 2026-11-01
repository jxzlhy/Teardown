/* V2 第九章全站审计截图：8 页面 × 2 主题 × 移动端抽查 */
import puppeteer from 'puppeteer-core';
import { existsSync } from 'node:fs';
const OUT = new URL('../docs/design/screenshots/', import.meta.url).pathname;
const c = ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'];
const browser = await puppeteer.launch({ executablePath: c.find(existsSync), headless: 'new', args: ['--enable-unsafe-swiftshader','--no-sandbox'] });
const errors = [];
const pages = [
  ['/', 'lobby'],
  ['/collection', 'collection'],
  ['/device/action4', 'ws-action4'],
  ['/device/radial-engine', 'ws-radial'],
  ['/graph', 'graph'],
  ['/timeline', 'timeline'],
  ['/compare/action', 'compare'],
];
for(const [path, name] of pages){
  for(const hall of ['night', 'day']){
    const page = await browser.newPage();
    page.on('pageerror', e => errors.push(`[${name}-${hall}] ${String(e && e.message || e).slice(0,100)}`));
    await page.setViewport({ width: 1440, height: 900 });
    await page.goto(`http://127.0.0.1:8137/#${path}`, { waitUntil: 'networkidle2', timeout: 60000 });
    await page.evaluate((h) => { document.documentElement.dataset.hall = h; try{ localStorage.setItem('dtm.hall', h); }catch{} }, hall);
    await new Promise(r => setTimeout(r, name.startsWith('ws') ? 3500 : 2200));
    await page.screenshot({ path: `${OUT}v2-audit-${name}-${hall}.png` });
    await page.close();
  }
}
/* 移动端抽查：日厅工作空间 + 夜厅大厅 */
for(const [path, name, hall] of [['/device/action4', 'm-ws', 'day'], ['/', 'm-lobby', 'night']]){
  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
  await page.goto(`http://127.0.0.1:8137/#${path}`, { waitUntil: 'networkidle2', timeout: 90000 });
  await page.evaluate((h) => { document.documentElement.dataset.hall = h; try{ localStorage.setItem('dtm.hall', h); }catch{} }, hall);
  await new Promise(r => setTimeout(r, name === 'm-ws' ? 4500 : 2400));
  await page.screenshot({ path: `${OUT}v2-audit-${name}-${hall}.png` });
  await page.close();
}
await browser.close();
console.log(`audit shots: ${pages.length * 2 + 2} 张 · errors: ${errors.length}`);
errors.slice(0, 4).forEach(e => console.log(e));
