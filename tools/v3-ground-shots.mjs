/* V3 接地验证：夜厅底座贴合 + 爆炸态穿插检查（action4 + pocket3）→ references/v3-tokens/ */
import puppeteer from 'puppeteer-core';
import { existsSync } from 'node:fs';
const OUT = new URL('../docs/ui-ux/v3/references/v3-tokens/', import.meta.url).pathname;
const c = ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'];
const browser = await puppeteer.launch({ executablePath: c.find(existsSync), headless: 'new', args: ['--enable-unsafe-swiftshader','--no-sandbox'] });
const page = await browser.newPage();
page.on('pageerror', e => console.log('PAGEERROR:', e.message.slice(0,120)));
const booted = () => page.waitForFunction(() => { const e = window.__ENGINE; const s = e && e.getState(); return s && s.booted && s.parts && s.parts.length; }, { timeout: 80000, polling: 300 });

for (const id of ['action4', 'pocket3']) {
  await page.goto(`http://127.0.0.1:8137/#/device/${id}`, { waitUntil: 'networkidle2', timeout: 90000 });
  await booted();
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: `${OUT}ground-${id}-night.png` });
  /* 爆炸态：拖滑杆到 1（检查底部零件与加高墩身是否穿插） */
  await page.evaluate(() => { window.__ENGINE.setExplode(1); });
  await new Promise(r => setTimeout(r, 2500));
  await page.screenshot({ path: `${OUT}ground-${id}-explode.png` });
  /* 回装配 */
  await page.evaluate(() => { window.__ENGINE.setExplode(0); });
  await new Promise(r => setTimeout(r, 1500));
}
await browser.close();
console.log('done');
