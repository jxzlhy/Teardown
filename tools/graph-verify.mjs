/* GraphView 验证：搜索定位（镜头滑动+脉冲）+ 标签去碰撞截图 */
import puppeteer from 'puppeteer-core';
import { existsSync } from 'node:fs';
const OUT = new URL('../docs/design/screenshots/', import.meta.url).pathname;
const c = ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'];
const browser = await puppeteer.launch({ executablePath: c.find(existsSync), headless: 'new', args: ['--enable-unsafe-swiftshader','--no-sandbox'] });
const page = await browser.newPage();
page.on('pageerror', e => console.log('PAGEERROR:', e.message.slice(0,120)));
await page.setViewport({ width: 1440, height: 900 });
await page.goto('http://127.0.0.1:8137/#/graph', { waitUntil: 'networkidle2', timeout: 60000 });
await page.waitForFunction(() => document.querySelectorAll('.gb-chip').length >= 4, { timeout: 30000, polling: 200 });
await new Promise(r => setTimeout(r, 6000));   // 等力导向收敛
/* 搜索定位：Osmo Action */
await page.click('.gb-search input');
await page.type('.gb-search input', 'Osmo Action', { delay: 30 });
await page.keyboard.press('Enter');
await new Promise(r => setTimeout(r, 1200));
await page.screenshot({ path: `${OUT}graph-search-locate.png` });
console.log('shot locate');
/* 搜索未命中 */
await page.click('.gb-search input', { clickCount: 3 });
await page.type('.gb-search input', '不存在的设备xyz', { delay: 20 });
await page.keyboard.press('Enter');
await new Promise(r => setTimeout(r, 400));
const miss = await page.evaluate(() => !!document.querySelector('#graphMiss'));
console.log('miss badge:', miss);
await page.evaluate(() => { const i = document.querySelector('.gb-search input'); i.value = ''; i.dispatchEvent(new Event('input')); });
await browser.close();
