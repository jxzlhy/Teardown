/* P1-S4 视觉迭代快拍（对 8137 暖 dev server，只出图少断言）：夜厅爆炸全景 + 台面特写视角 */
import { createRequire } from 'node:module';
const require = createRequire('/Users/admin/Desktop/jxz/DJI/package.json');
const puppeteer = require('puppeteer-core');
const devId = process.argv[2] || 'mini4pro';
const tag = process.argv[3] || 'w1';
const OUT = `/Users/admin/Desktop/jxz/DJI/docs/design/screenshots/2026-11-06-v51-stage/shot-${tag}-${devId}.png`;
const browser = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--enable-unsafe-swiftshader', '--no-sandbox'] });
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900 });
await page.goto(`http://127.0.0.1:8137/#/device/${devId}`, { waitUntil: 'domcontentloaded', timeout: 60000 });
await page.waitForFunction(() => { const e = window.__ENGINE; const s = e && e.getState(); return s && /OFFICIAL|COMMUNITY|PROCEDURAL|FALLBACK/.test(s.modelStatus || ''); }, { timeout: 280000, polling: 1000 });
await new Promise(r => setTimeout(r, 2000));
await page.evaluate(() => { window.__ENGINE.setExplode(1); window.__ENGINE.resetView(); });
await new Promise(r => setTimeout(r, 3500));
await page.screenshot({ path: OUT });
console.log('shot saved:', OUT);
await browser.close();
