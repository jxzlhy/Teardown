/* 审计补充取证：部件详情卡（桌面/移动 sheet）、设备总览弹层、帮助卡 */
import puppeteer from 'puppeteer-core';
import { existsSync } from 'node:fs';
import { mkdirSync } from 'node:fs';

const OUT = new URL('../docs/design/screenshots/', import.meta.url).pathname;
mkdirSync(OUT, { recursive: true });
function findChrome(){
  const candidates = [
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Chromium.app/Contents/MacOS/Chromium',
  ];
  for(const c of candidates) if(existsSync(c)) return c;
  throw new Error('no chrome found');
}
const BASE = 'http://127.0.0.1:8137';
const shots = [
  { name: 'ctxcard-desktop',  url: `${BASE}/#/device/action4?p=battery`,      vw: 1440, vh: 900, wait: 11000 },
  { name: 'ctxcard-mobile',   url: `${BASE}/#/device/action4?p=battery`,      vw: 390,  vh: 844, wait: 11000, mobile: true },
  { name: 'infopop-desktop',  url: `${BASE}/#/device/action4`,                vw: 1440, vh: 900, wait: 9000, click: '#topbar .hud-icon' },
  { name: 'guide-desktop',    url: `${BASE}/#/device/action4`,                vw: 1440, vh: 900, wait: 6000, key: '?' },
];
const browser = await puppeteer.launch({ executablePath: findChrome(), headless: 'new',
  args: ['--enable-unsafe-swiftshader', '--no-sandbox'] });
const errors = [];
for(const s of shots){
  const page = await browser.newPage();
  page.on('pageerror', e => errors.push(`[${s.name}] ${e.message}`));
  await page.setViewport({ width: s.vw, height: s.vh, isMobile: !!s.mobile, hasTouch: !!s.mobile, deviceScaleFactor: s.mobile ? 2 : 1 });
  await page.goto(s.url, { waitUntil: 'networkidle2', timeout: 45000 });
  await new Promise(r => setTimeout(r, s.wait));
  if(s.click){ await page.click(s.click).catch(e => errors.push(`[${s.name}] click fail ${e.message}`)); await new Promise(r => setTimeout(r, 900)); }
  if(s.key){ await page.keyboard.press(s.key).catch(()=>{}); await new Promise(r => setTimeout(r, 900)); }
  await page.screenshot({ path: `${OUT}${s.name}.png` });
  console.log('shot:', s.name);
  await page.close();
}
await browser.close();
console.log(errors.length ? errors.join('\n') : '(no page errors)');
