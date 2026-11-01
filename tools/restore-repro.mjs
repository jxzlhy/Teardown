/* 复现「点零件后无法还原」：各还原路径逐一测试 */
import puppeteer from 'puppeteer-core';
import { existsSync } from 'node:fs';
const c = ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'];
const browser = await puppeteer.launch({ executablePath: c.find(existsSync), headless: 'new', args: ['--enable-unsafe-swiftshader','--no-sandbox'] });
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900 });
const camOf = () => page.evaluate(() => { const p = window.__ENGINE.getCamera().position; const s = window.__ENGINE.getState(); return { pos: [+p.x.toFixed(1), +p.y.toFixed(1), +p.z.toFixed(1)], sel: s.selected, flewTo: s.flewTo }; });
await page.goto('http://127.0.0.1:8137/#/device/action4?p=front-screen', { waitUntil: 'networkidle2', timeout: 90000 });
await page.waitForFunction(() => { const e = window.__ENGINE; const s = e && e.getState(); return s && s.booted && s.selected; }, { timeout: 90000, polling: 300 });
await new Promise(r => setTimeout(r, 2500));   // 等 flyTo 补间结束
console.log('0 深链选中后:', JSON.stringify(await camOf()));

/* 1 点空白（画布右上角，远离模型） */
await page.mouse.click(1350, 150);
await new Promise(r => setTimeout(r, 1500));
console.log('1 空白点击后:', JSON.stringify(await camOf()));

/* 2 重新点零件（从清单），再 Esc */
await page.evaluate(() => window.__ENGINE.selectPart('battery'));
await page.evaluate(() => window.__ENGINE.flyToPart('battery'));
await new Promise(r => setTimeout(r, 1500));
console.log('2 选中电池后:', JSON.stringify(await camOf()));
await page.keyboard.press('Escape');
await new Promise(r => setTimeout(r, 800));
console.log('3 Esc 后:', JSON.stringify(await camOf()));

/* 4 R 复位 */
await page.keyboard.press('KeyR');
await new Promise(r => setTimeout(r, 1500));
console.log('4 R 后:', JSON.stringify(await camOf()));
await browser.close();
