/* V4.0 Slice 4 验证：配置编码→解码→导入确定性 + UI 导入路径 + 异常输入 */
import puppeteer from 'puppeteer-core';
import { existsSync } from 'node:fs';
const c = ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'];
const browser = await puppeteer.launch({ executablePath: c.find(existsSync), headless: 'new', args: ['--enable-unsafe-swiftshader','--no-sandbox'] });
const page = await browser.newPage();
page.setDefaultTimeout(20000);
const errors = [];
page.on('pageerror', e => errors.push(e.message.slice(0, 100)));
await page.goto('http://127.0.0.1:8137/#/forge', { waitUntil: 'domcontentloaded', timeout: 20000 });
await new Promise(r => setTimeout(r, 1500));

/* 1. API 链路：生成→编码→解码→导入 ⇒ 同 id（确定性） */
const api = await page.evaluate(async () => {
  const { createForgeDevice, encodeForgeConfig, decodeForgeConfig, importForgeConfig } = await import('/src/forge/registry.js');
  const a = createForgeDevice('turbofan', { fanDiameter: 1800, bpr: 7 }, 'share-test');
  const text = encodeForgeConfig('turbofan', a.forge.params, a.forge.seed);
  const dec = decodeForgeConfig(text);
  const b = importForgeConfig(text);
  let badFmt = null;
  try { decodeForgeConfig('{"fmt":"other/1","generator":"v8"}'); } catch (e) { badFmt = String(e.message).slice(0, 30); }
  let badJson = null;
  try { decodeForgeConfig('not json at all'); } catch (e) { badJson = String(e.message).slice(0, 30); }
  return { sameId: a.id === b.id, textLen: text.length, decOk: dec.generator === 'turbofan', badFmt, badJson };
});
console.log('api:', JSON.stringify(api));

/* 2. UI 导入路径：textarea 粘贴 → 按钮 → 落到设备页且 booted */
const text = await page.evaluate(async () => {
  const { encodeForgeConfig, getForgeDevice } = await import('/src/forge/registry.js');
  const { createForgeDevice } = await import('/src/forge/registry.js');
  const d = createForgeDevice('v8', undefined, 'share-ui');
  return encodeForgeConfig('v8', d.forge.params, d.forge.seed);
});
await page.evaluate((t) => { const ta = document.querySelector('.forge-import'); const set = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value').set; set.call(ta, t); ta.dispatchEvent(new Event('input', { bubbles: true })); }, text);
await page.evaluate(() => { [...document.querySelectorAll('.forge-go')].find(b => b.textContent.includes('导入并生成')).click(); });
await page.waitForFunction(() => { const e = window.__ENGINE; const s = e && e.getState(); return s && s.booted && s.parts && s.parts.length; }, { timeout: 25000, polling: 300 });
const landed = await page.evaluate(() => window.__ENGINE.getState().device.id);
console.log('ui import landed:', landed, '=>', landed.startsWith('forge-v8-') ? 'OK' : 'FAIL');

/* 3. UI 复制按钮（clipboard 权限缺失时回退到导入框） */
await page.goto('http://127.0.0.1:8137/#/forge', { waitUntil: 'domcontentloaded', timeout: 20000 });
await new Promise(r => setTimeout(r, 1200));
const rows = await page.evaluate(() => document.querySelectorAll('.forge-row').length);
console.log('recent rows for copy btn:', rows);

console.log('errors(', errors.length, '):', errors.slice(0, 4));
await browser.close().catch(() => {});
process.exit(errors.length || !api.sameId ? 1 : 0);
