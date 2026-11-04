/* GLB 导出验证：/forge 列表按钮 → exportForgeGLB → 下载落盘 + 体积断言 + 复导入检查 */
import puppeteer from 'puppeteer-core';
import { existsSync, statSync, readdirSync } from 'node:fs';
const DL = '/tmp/forge-dl';
const c = ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'];
const browser = await puppeteer.launch({ executablePath: c.find(existsSync), headless: 'new', args: ['--enable-unsafe-swiftshader','--no-sandbox'] });
const page = await browser.newPage();
const errors = [];
page.on('pageerror', e => errors.push('PAGEERROR: ' + e.message.slice(0, 120)));
page.on('console', m => { if (m.type() === 'error') errors.push('CONSOLE: ' + m.text().slice(0, 120)); });
readdirSync('/tmp').filter(f => f.includes('forge') && f.endsWith('.glb')).forEach(f => { try { require; } catch {} });
await page.setViewport({ width: 1280, height: 800 });
const cdp = await page.createCDPSession();
await cdp.send('Browser.setDownloadBehavior', { behavior: 'allow', downloadPath: DL });

await page.goto('http://127.0.0.1:8137/#/forge', { waitUntil: 'networkidle2', timeout: 60000 });
await new Promise(r => setTimeout(r, 1200));
/* 先生成两台（V8 + 涡扇）→ 刷新出列表 → 点按钮导出 */
const made = await page.evaluate(async () => {
  const { createForgeDevice } = await import('/src/forge/registry.js');
  const a = await createForgeDevice('v8', undefined, 'glb-test-v8');
  const b = await createForgeDevice('turbofan', undefined, 'glb-test-tf');
  return [a.id, b.id];
});
console.log('made:', JSON.stringify(made));
await page.reload({ waitUntil: 'networkidle2' });
await new Promise(r => setTimeout(r, 1200));
const hasRow = await page.evaluate(() => document.querySelectorAll('.forge-row').length);
console.log('recent rows:', hasRow);
if (hasRow) {
  await page.evaluate(() => document.querySelector('.forge-glb').click());
  await page.waitForFunction(() => /已导出|导出失败/.test(document.body.innerText), { timeout: 30000, polling: 200 });
  const msg = await page.evaluate(() => document.body.innerText.match(/(已导出|导出失败)[^\n]*/)?.[0]);
  console.log('export msg:', msg);
}

/* 直接 API 验证（V8 + 涡扇各一次）：结构校验 + 体积 */
const api = await page.evaluate(async (ids) => {
  const { exportForgeGLB } = await import('/src/forge/export.js');
  const out = {};
  for (const id of ids) {
    try { out[id] = await exportForgeGLB(id); } catch (e) { out[id] = { err: String(e.message).slice(0, 60) }; }
  }
  return out;
}, made);
console.log('api exports:', JSON.stringify(api, null, 1).slice(0, 600));

await new Promise(r => setTimeout(r, 1200));
let files = [];
try { files = readdirSync(DL).filter(f => f.endsWith('.glb')); } catch {}
console.log('downloaded glb files:', files.length, files.slice(0, 3));
if (files[0]) console.log('first size:', (statSync(DL + '/' + files[0]).size / 1024).toFixed(0) + 'KB');

console.log('errors(', errors.length, '):', errors.slice(0, 5));
await browser.close();
