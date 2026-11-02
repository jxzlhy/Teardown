/* V4.1 兼容性回归：新增 MI 面板四视口扫查——横向溢出 / 面板可达 / dock 遮挡 / 控制台错误 */
import puppeteer from 'puppeteer-core';
import { existsSync } from 'node:fs';
const c = ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'];
const browser = await puppeteer.launch({ executablePath: c.find(existsSync), headless: 'new', args: ['--enable-unsafe-swiftshader','--no-sandbox'] });
const page = await browser.newPage();
page.setDefaultTimeout(30000);
const errors = [];
page.on('pageerror', e => errors.push(e.message.slice(0, 100)));
page.on('console', m => { if (m.type() === 'error') errors.push('CONSOLE: ' + m.text().slice(0, 100)); });
const booted = () => page.waitForFunction(() => { const e = window.__ENGINE; const s = e && e.getState(); return s && s.booted && s.parts && s.parts.length; }, { timeout: 30000, polling: 300 });

const VIEWPORTS = [[1440, 900], [1280, 800], [768, 1024], [390, 844]];
let fail = 0;
for (const [w, h] of VIEWPORTS) {
  await page.setViewport({ width: w, height: h });
  await page.goto('http://127.0.0.1:8137/#/forge?gen=v8&seed=sweep-test&auto=1', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await booted();
  await new Promise(r => setTimeout(r, 1500));
  await page.evaluate(() => { window.__ENGINE.selectPart('crank'); });
  await new Promise(r => setTimeout(r, 500));
  await page.evaluate(() => document.querySelector('[aria-label="设备总览"]')?.click());
  await new Promise(r => setTimeout(r, 700));
  const checks = await page.evaluate(() => {
    const noHScroll = document.documentElement.scrollWidth <= innerWidth + 1;
    const dockVisible = (() => { const d = document.querySelector('#dock'); if (!d) return 'none'; const r = d.getBoundingClientRect(); return r.top < innerHeight && r.bottom > 0 && r.height > 20; })();
    const mech = document.querySelector('.mech-box');
    const mechOk = !mech || (mech.getBoundingClientRect().width <= innerWidth && mech.scrollHeight >= mech.clientHeight - 2);
    const qa = document.querySelector('.qa-box');
    const qaOk = !qa || qa.getBoundingClientRect().width <= innerWidth;
    const motion = document.querySelector('.motion-box');
    const motionOk = !motion || motion.getBoundingClientRect().width <= innerWidth;
    const links = document.querySelector('.part-mech');
    const linksOk = !links || links.getBoundingClientRect().width <= innerWidth;
    /* 总览弹层自身不超视口 */
    const pop = document.querySelector('#infoPop');
    const popOk = !pop || (pop.getBoundingClientRect().width <= innerWidth + 1);
    return { noHScroll, dockVisible, mechOk, qaOk, motionOk, linksOk, popOk };
  });
  const ok = checks.noHScroll && checks.dockVisible !== false && checks.mechOk && checks.qaOk && checks.motionOk && checks.linksOk && checks.popOk;
  if (!ok) fail++;
  console.log(`${w}×${h}:`, JSON.stringify(checks), ok ? 'OK' : 'FAIL');
}
console.log('errors(', errors.length, '):', errors.slice(0, 4));
await browser.close().catch(() => {});
process.exit(fail || errors.length ? 1 : 0);
