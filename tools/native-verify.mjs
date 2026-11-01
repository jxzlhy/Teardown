import puppeteer from 'puppeteer-core';
import { existsSync } from 'node:fs';
const OUT = new URL('../docs/design/screenshots/audit-native/', import.meta.url).pathname;
const c = ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'];
const browser = await puppeteer.launch({ executablePath: c.find(existsSync), headless: 'new', args: ['--enable-unsafe-swiftshader','--no-sandbox'] });
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900 });
for(const [id, exp] of [['iphone-12-teardown','?e=1'],['galaxy-s22-ultra','?e=1'],['iphone-13','?e=1']]){
  await page.goto(`http://127.0.0.1:8137/#/device/${id}${exp}`, { waitUntil: 'networkidle2', timeout: 60000 });
  await page.waitForFunction(() => {
    const e = window.__ENGINE; const s = e && e.getState();
    return s && s.booted && /OFFICIAL|COMMUNITY|PROCEDURAL|FALLBACK/.test(s.modelStatus || '');
  }, { timeout: 45000, polling: 300 });
  await new Promise(r => setTimeout(r, 2600));
  await page.screenshot({ path: `${OUT}fixed-${id}.png` });
  console.log('shot', id);
}
await browser.close();
