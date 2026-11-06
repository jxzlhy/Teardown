import { createRequire } from 'node:module';
const require = createRequire('/Users/admin/Desktop/jxz/DJI/package.json');
const puppeteer = require('puppeteer-core');
const port = process.argv[2] || '8137';
const devId = process.argv[3] || 'iphone-13';
const browser = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--enable-unsafe-swiftshader', '--no-sandbox'] });
const page = await browser.newPage();
page.on('pageerror', e => console.log('[pageerror]', String(e && e.stack || e).replace(/\s+/g, ' ').slice(0, 260)));
page.on('error', e => console.log('[PAGE CRASH]', String(e).slice(0, 160)));
page.on('framenavigated', f => { if(f === page.mainFrame()) console.log('[NAVIGATED]', f.url().slice(-60), '@', Math.round((Date.now() - T0) / 1000) + 's'); });
page.on('console', m => { if(m.type() === 'error') console.log('[c.error]', m.text().replace(/\s+/g, ' ').slice(0, 240)); });
const T0 = Date.now();
await page.setViewport({ width: 1440, height: 900 });
await page.goto(`http://127.0.0.1:${port}/#/device/${devId}`, { waitUntil: 'domcontentloaded', timeout: 60000 });
/* 带重试的等待：full-reload 会销毁执行上下文（Waiting failed），新上下文里重挂等待即可 */
let settled = false;
for(let i = 0; i < 3 && !settled; i++){
  try{
    await page.waitForFunction(() => { const e = window.__ENGINE; const s = e && e.getState(); return s && /OFFICIAL|COMMUNITY|PROCEDURAL|FALLBACK/.test(s.modelStatus || ''); }, { timeout: 120000, polling: 1000 });
    settled = true;
  }catch(e){
    console.log(`[wait try ${i + 1} failed]`, String(e.message).slice(0, 60), '· url:', page.url().slice(-40));
    await new Promise(r => setTimeout(r, 2000));
  }
}
if(settled){
  const st = await page.evaluate(() => { const s = window.__ENGINE.getState(); return { ms: s.modelStatus, parts: s.partsCount, plinthType: s.plinthType }; });
  console.log('SETTLED', Math.round((Date.now() - T0) / 1000) + 's:', JSON.stringify(st));
}else{
  console.log('3 次等待全部失败');
}
await browser.close();
