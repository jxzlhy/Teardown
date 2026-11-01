import puppeteer from 'puppeteer-core';
import { existsSync } from 'node:fs';
const OUT = new URL('../docs/design/screenshots/', import.meta.url).pathname;
const c = ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'];
const browser = await puppeteer.launch({ executablePath: c.find(existsSync), headless: 'new', args: ['--enable-unsafe-swiftshader','--no-sandbox'] });
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900 });
await page.goto('http://127.0.0.1:8137/#/', { waitUntil: 'networkidle2', timeout: 60000 });
await new Promise(r => setTimeout(r, 2400));
await page.click('.hall-link');   // 切到日厅
await new Promise(r => setTimeout(r, 900));
const s1 = await page.evaluate(() => document.documentElement.dataset.hall);
await page.click('.hall-link');   // 切回夜厅
await new Promise(r => setTimeout(r, 900));
const s2 = await page.evaluate(() => document.documentElement.dataset.hall);
const saved = await page.evaluate(() => localStorage.getItem('dtm.hall'));
console.log('lobby toggle: day→', s1, '→ night→', s2, '· saved:', saved);
await page.screenshot({ path: `${OUT}v2-lobby-toggle.png` });
await browser.close();
