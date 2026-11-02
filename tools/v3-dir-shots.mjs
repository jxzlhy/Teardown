/* V3 三方向取证：A/B 日厅（大厅 top+grid、工作空间）、C 夜厅（同点位）→ docs/ui-ux/v3/references/directions/ */
import puppeteer from 'puppeteer-core';
import { existsSync, mkdirSync } from 'node:fs';
const OUT = new URL('../docs/ui-ux/v3/references/directions/', import.meta.url).pathname;
mkdirSync(OUT, { recursive: true });
const c = ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'];
const browser = await puppeteer.launch({ executablePath: c.find(existsSync), headless: 'new', args: ['--enable-unsafe-swiftshader','--no-sandbox'] });
const page = await browser.newPage();
page.on('pageerror', e => console.log('PAGEERROR:', e.message.slice(0,120)));
const booted = () => page.waitForFunction(() => { const e = window.__ENGINE; const s = e && e.getState(); return s && s.booted; }, { timeout: 80000, polling: 300 });
const setHallWorkspace = async (want) => { await page.evaluate((w) => { const b = [...document.querySelectorAll('#dock .hud-icon')].find(x => x.getAttribute('aria-label') === '白天/黑夜双厅'); const cur = window.__ENGINE.getState().hallMode; if (cur !== w && b) b.click(); }, want); await new Promise(r => setTimeout(r, 2000)); };
const hallIs = () => page.evaluate(() => document.documentElement.dataset.hall || 'night');

async function lobbyShots(dir) {
  await page.goto('http://127.0.0.1:8137/#/', { waitUntil: 'networkidle2', timeout: 60000 });
  await new Promise(r => setTimeout(r, 2200));
  if (await hallIs() !== 'day') { await page.evaluate(() => { document.querySelector('.hall-link')?.click(); }); await new Promise(r => setTimeout(r, 1200)); }
  await page.evaluate((d) => window.__setDir(d), dir);
  await new Promise(r => setTimeout(r, 500));
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({ path: `${OUT}${dir}-lobby-top.png` });
  await page.evaluate(() => { document.querySelector('.hub-grid, #grid')?.scrollIntoView(); window.scrollBy(0, -80); });
  await new Promise(r => setTimeout(r, 500));
  await page.screenshot({ path: `${OUT}${dir}-lobby-grid.png` });
}

async function workspaceShot(dir) {
  await page.goto('http://127.0.0.1:8137/#/device/action4', { waitUntil: 'networkidle2', timeout: 90000 });
  await booted();
  await new Promise(r => setTimeout(r, 1500));
  await page.evaluate((d) => window.__setDir(d), dir);
  if (dir === 'c') await setHallWorkspace('night'); else await setHallWorkspace('day');
  await page.screenshot({ path: `${OUT}${dir}-workspace.png` });
}

for (const d of ['a', 'b']) { await lobbyShots(d); await workspaceShot(d); }
await lobbyShots('c'); /* c 大厅仅在夜厅有意义：强制切回夜厅 */
await page.goto('http://127.0.0.1:8137/#/', { waitUntil: 'networkidle2', timeout: 60000 });
await new Promise(r => setTimeout(r, 2000));
if (await hallIs() === 'day') { await page.evaluate(() => { document.querySelector('.hall-link')?.click(); }); await new Promise(r => setTimeout(r, 1200)); }
await page.evaluate(() => window.__setDir('c'));
await page.evaluate(() => window.scrollTo(0, 0));
await page.screenshot({ path: `${OUT}c-lobby-top.png` });
await page.evaluate(() => { delete document.documentElement.dataset.dir; });
await workspaceShot('c');

await browser.close();
console.log('done →', OUT);
