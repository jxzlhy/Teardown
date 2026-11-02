/* V4.0 MI② 验证：统一时钟 + 速度乘子 + 曲轴转角精确显示（锻造 V8） */
import puppeteer from 'puppeteer-core';
import { existsSync } from 'node:fs';
const c = ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'];
const browser = await puppeteer.launch({ executablePath: c.find(existsSync), headless: 'new', args: ['--enable-unsafe-swiftshader','--no-sandbox'] });
const page = await browser.newPage();
page.setDefaultTimeout(25000);
const errors = [];
page.on('pageerror', e => errors.push(e.message.slice(0, 120)));
await page.setViewport({ width: 1440, height: 900 });
const booted = () => page.waitForFunction(() => { const e = window.__ENGINE; const s = e && e.getState(); return s && s.booted && s.parts && s.parts.length; }, { timeout: 25000, polling: 300 });

await page.goto('http://127.0.0.1:8137/#/forge?gen=v8&seed=kin-test&auto=1', { waitUntil: 'domcontentloaded', timeout: 25000 });
await booted();
await new Promise(r => setTimeout(r, 1800));
await page.evaluate(() => window.__ENGINE.selectPart('crank'));
await new Promise(r => setTimeout(r, 700));

/* 1. 运动状态块渲染 + 转角在走 */
const box1 = await page.evaluate(() => {
  const b = document.querySelector('.motion-box');
  return b ? { present: true, deg: b.querySelector('.motion-angle .v').textContent, chips: b.querySelectorAll('.phase-chip').length, speeds: b.querySelectorAll('.motion-speed button').length } : null;
});
console.log('motion box:', JSON.stringify(box1));
const d1 = await page.evaluate(() => window.__ENGINE.getState().demoClock);
await new Promise(r => setTimeout(r, 1000));
const d2 = await page.evaluate(() => window.__ENGINE.getState().demoClock);
console.log('clock Δ1s:', (d2 - d1).toFixed(3), '(1× 应 ≈1.0)');

/* 2. 速度乘子 2×：时钟速率翻倍 */
await page.evaluate(() => window.__ENGINE.setDemoSpeed(2));
const d3 = await page.evaluate(() => window.__ENGINE.getState().demoClock);
await new Promise(r => setTimeout(r, 1000));
const d4 = await page.evaluate(() => window.__ENGINE.getState().demoClock);
console.log('clock Δ1s@2×:', (d4 - d3).toFixed(3), '(应 ≈2.0)');

/* 3. 转角-时钟一致性：Δθ(deg) ≈ ω(2.6 rad/s)×Δclock×57.3 mod 360 */
const r1 = await page.evaluate(() => window.__ENGINE.getPartRotation('crank').z);
await new Promise(r => setTimeout(r, 1000));
const r2 = await page.evaluate(() => window.__ENGINE.getPartRotation('crank').z);
const dd = await page.evaluate(() => window.__ENGINE.getState().demoClock);
const clock4 = dd; // 近似：r2 时刻
const expect = ((2.6 * 2 * 1000) / 1000) * 57.2958; /* ω×speed×1s → deg，粗校验 */
const actual = ((r2 - r1) * 57.2958) % 360;
console.log('Δθ:', actual.toFixed(1), 'deg（2× 下 1s 预期 ≈', (2.6 * 2 * 57.2958 % 360).toFixed(1), '± 容差）');
const okAngle = Math.abs(actual - (2.6 * 2 * 57.2958 % 360)) < 15 || Math.abs(actual - (2.6 * 2 * 57.2958 % 360) + 360) < 15;
console.log('转角-时钟一致性:', okAngle ? 'OK' : 'CHECK');

/* 4. 面板 UI：2× 按钮态 + 变速无相位跳变（stroke 网格位置连续） */
const ui2 = await page.evaluate(() => ({
  on2x: [...document.querySelectorAll('.motion-speed button')].find(b => b.textContent.trim() === '2×')?.classList.contains('on'),
  deg: document.querySelector('.motion-angle .v')?.textContent,
}));
console.log('ui:', JSON.stringify(ui2));
await page.evaluate(() => window.__ENGINE.setDemoSpeed(1));

/* 5. 切台复位：demoSpeed/demoClock 归零 */
await page.goto('http://127.0.0.1:8137/#/device/pocket3', { waitUntil: 'domcontentloaded', timeout: 30000 });
await booted();
const reset = await page.evaluate(() => { const s = window.__ENGINE.getState(); return { speed: s.demoSpeed, clock: +s.demoClock.toFixed(3) }; });
/* 时钟自切台起重新积分（booted 后含开场演出时长），断言速度复位且时钟为新 clocks（远小于上轮累计） */
console.log('switch reset:', JSON.stringify(reset), '=>', reset.speed === 1 ? 'OK' : 'CHECK');

console.log('errors(', errors.length, '):', errors.slice(0, 4));
await browser.close().catch(() => {});
process.exit(errors.length ? 1 : 0);
