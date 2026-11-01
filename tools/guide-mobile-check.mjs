import puppeteer from 'puppeteer-core';
import { existsSync } from 'node:fs';
const c = ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'];
const browser = await puppeteer.launch({ executablePath: c.find(existsSync), headless: 'new', args: ['--enable-unsafe-swiftshader','--no-sandbox'] });
const page = await browser.newPage();
await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
await page.goto('http://127.0.0.1:8137/#/device/action4', { waitUntil: 'networkidle2' });
await new Promise(r => setTimeout(r, 8000));
/* 滚动 dock 溢出区找到帮助按钮（移动端 dock 可横滑） */
const clicked = await page.evaluate(() => {
  const btns = [...document.querySelectorAll('#dock .hud-icon')];
  const help = btns[btns.length - 2]; // 倒数第二枚为帮助（最后一组：帮助后无 nav? 有 nav 两枚）
  return btns.length;
});
console.log('dock icons:', clicked);
await page.evaluate(() => {
  const btns = [...document.querySelectorAll('#dock .hud-icon')];
  const help = btns.find(b => b.querySelector('svg path[d^="M9.6 9.2"]'));
  if(help) help.click();
});
await new Promise(r => setTimeout(r, 800));
await page.screenshot({ path: new URL('../docs/design/screenshots/e2-guide-mobile.png', import.meta.url).pathname });
console.log('guide mobile shot updated');
await browser.close();
