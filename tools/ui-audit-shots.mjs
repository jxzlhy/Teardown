/* UI 审计取证脚本（只读截图，不改源码）：按视口/路由批量截图 + 收集 console 错误 */
import puppeteer from 'puppeteer-core';
import { existsSync } from 'node:fs';
import { mkdirSync } from 'node:fs';

const OUT = new URL('../docs/design/screenshots/', import.meta.url).pathname;
mkdirSync(OUT, { recursive: true });

function findChrome(){
  const candidates = [
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Chromium.app/Contents/MacOS/Chromium',
    '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
  ];
  for(const c of candidates) if(existsSync(c)) return c;
  throw new Error('no chrome found');
}

const BASE = 'http://127.0.0.1:8137';
const shots = [
  { name: 'lobby-desktop-top',    url: `${BASE}/#/`,                 vw: 1440, vh: 900, wait: 2500 },
  { name: 'lobby-desktop-grid',   url: `${BASE}/#/`,                 vw: 1440, vh: 900, wait: 2500, scroll: 1400 },
  { name: 'lobby-laptop',         url: `${BASE}/#/`,                 vw: 1280, vh: 720, wait: 2500 },
  { name: 'lobby-mobile',         url: `${BASE}/#/`,                 vw: 390,  vh: 844, wait: 2500, mobile: true },
  { name: 'lobby-mobile-grid',    url: `${BASE}/#/`,                 vw: 390,  vh: 844, wait: 2500, mobile: true, scroll: 900 },
  { name: 'workspace-desktop',    url: `${BASE}/#/device/action4`,   vw: 1440, vh: 900, wait: 9000 },
  { name: 'workspace-exploded',   url: `${BASE}/#/device/action4?e=1`, vw: 1440, vh: 900, wait: 9000 },
  { name: 'workspace-mobile',     url: `${BASE}/#/device/action4`,   vw: 390,  vh: 844, wait: 9000, mobile: true },
  { name: 'workspace-mobile-exploded', url: `${BASE}/#/device/action4?e=1`, vw: 390, vh: 844, wait: 9000, mobile: true },
  { name: 'graph-desktop',        url: `${BASE}/#/graph`,            vw: 1440, vh: 900, wait: 5000 },
  { name: 'timeline-desktop',     url: `${BASE}/#/timeline`,         vw: 1440, vh: 900, wait: 2500 },
  { name: 'compare-desktop',      url: `${BASE}/#/compare/s25`,      vw: 1440, vh: 900, wait: 3500 },
  { name: 'compare-mobile',       url: `${BASE}/#/compare/s25`,      vw: 390,  vh: 844, wait: 3500, mobile: true },
];

const browser = await puppeteer.launch({
  executablePath: findChrome(),
  headless: 'new',
  args: ['--enable-unsafe-swiftshader', '--no-sandbox', '--disable-gpu-sandbox'],
});
const errors = [];
for(const s of shots){
  const page = await browser.newPage();
  page.on('console', m => { if(m.type() === 'error') errors.push(`[${s.name}] ${m.text()}`); });
  page.on('pageerror', e => errors.push(`[${s.name}] PAGEERROR ${e.message}`));
  await page.setViewport({ width: s.vw, height: s.vh, isMobile: !!s.mobile, hasTouch: !!s.mobile,
    deviceScaleFactor: s.mobile ? 2 : 1 });
  await page.goto(s.url, { waitUntil: 'networkidle2', timeout: 45000 });
  await new Promise(r => setTimeout(r, s.wait));
  if(s.scroll){ await page.evaluate(y => { document.querySelector('.hub')?.scrollTo(0, y); window.scrollTo(0, y); }, s.scroll);
    await new Promise(r => setTimeout(r, 800)); }
  await page.screenshot({ path: `${OUT}${s.name}.png` });
  console.log('shot:', s.name);
  await page.close();
}
await browser.close();
console.log('\n=== CONSOLE ERRORS ===');
console.log(errors.length ? errors.join('\n') : '(none)');
