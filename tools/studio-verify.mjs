#!/usr/bin/env node
/* 创作工作室（V5.0.0/V5.0.1）端到端验证：
   自起 Vite（独立端口，避开并行会话的 8211/8137）→ 无头 Chrome 覆盖
   壳渲染 / 馆内示例导入 / 层级联动 / 损坏文件 / 不支持格式 / 空场景 /
   体积上限 / 错误后恢复 / 自动旋转 / 大厅不预载 studio chunk。
   用法：node tools/studio-verify.mjs [--keep]（--keep 保留服务器便于截图） */
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(path.join(ROOT, 'package.json'));
const puppeteer = require('puppeteer-core');
const PORT = Number(process.env.STUDIO_PORT || 8251);
const BASE = `http://127.0.0.1:${PORT}`;

const CHROME = [
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Chromium.app/Contents/MacOS/Chromium',
  '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
].find((p) => fs.existsSync(p));
if (!CHROME) { console.log('SKIP: 未找到 Chrome/Chromium/Edge'); process.exit(0); }

const failures = [];
const check = (name, ok, detail) => {
  console.log(`${ok ? '✓' : '✗'} ${name}${detail ? ' · ' + detail : ''}`);
  if (!ok) failures.push(name);
};
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/* 负载守护（记忆库规程：load>9 时无头计时断言不可信） */
const load = (require('node:os')).loadavg()[0];

const server = spawn(process.execPath, [
  path.join(ROOT, 'node_modules/vite/bin/vite.js'),
  '--host', '127.0.0.1', '--port', String(PORT), '--strictPort',
], { cwd: ROOT, stdio: 'ignore' });
for (let i = 0; i < 120; i++) { try { if ((await fetch(BASE + '/')).ok) break; } catch {} await sleep(500); }

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: 'new',
  args: ['--no-sandbox', '--enable-unsafe-swiftshader', '--disable-gpu-sandbox', '--window-size=1440,900'],
});
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900 });
const consoleErrors = [];
page.on('console', (m) => { if (m.type() === 'error') consoleErrors.push(m.text().slice(0, 160)); });
page.on('pageerror', (e) => consoleErrors.push('pageerror: ' + String(e).slice(0, 160)));

/* 页内造文件 → DataTransfer → file input（覆盖真实 UI 通道），各用例内联构造 */

try {
  /* 1. 壳渲染 + 空态 */
  await page.goto(`${BASE}/#/studio`, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForSelector('.studio-cv', { timeout: 20000 });
  check('壳渲染：视口 canvas + 空态文案', !!(await page.$('.studio-cv')) && !!(await page.$('.st-empty')));

  /* 2. 馆内示例导入（真实 fetch → 同一 importFrom 管线） */
  await page.evaluate(() => [...document.querySelectorAll('.st-empty-actions button, .st-actions button')]
    .find((b) => /馆内示例 A/.test(b.textContent)).click());
  await page.waitForFunction(() => document.querySelector('.st-stats'), { timeout: 90000 });
  const stat = await page.evaluate(() => ({
    meshes: +document.querySelector('.st-stats div b').textContent,
    rows: document.querySelectorAll('.st-node').length,
    chips: document.querySelectorAll('.st-chip').length,
  }));
  check('示例导入：概览/层级/诊断三面板就位', stat.meshes > 0 && stat.rows > 0 && stat.chips === 3, JSON.stringify(stat));

  /* 3. 层级树 ↔ 视口联动 */
  await page.click('.st-node.mesh');
  const linked = await page.evaluate(() => !!document.querySelector('.st-node.on'));
  check('层级点选 → 选中态回写', linked);

  /* 4. 自动旋转 */
  await page.evaluate(() => [...document.querySelectorAll('.st-tools button')].find((b) => /自动旋转/.test(b.textContent)).click());
  check('自动旋转开关', !!(await page.$('.st-tools button.on')));

  /* 5. 损坏 GLB → ERR_PARSE（手写 GLB 头：合法 magic+version，总长越界 → 解析器报错） */
  await page.evaluate(() => {
    const head = new Uint8Array(1024);
    const dv = new DataView(head.buffer);
    dv.setUint32(0, 0x46546c67, true);   // 'glTF'
    dv.setUint32(4, 2, true);            // version
    dv.setUint32(8, 0x7fffffff, true);   // 总长度越界 → 头部校验失败
    const dt = new DataTransfer();
    dt.items.add(new File([head], 'broken.glb'));
    const input = document.querySelector('input[type=file]');
    input.files = dt.files;
    input.dispatchEvent(new Event('change', { bubbles: true }));
  });
  await page.waitForFunction(() => /ERR_/.test(document.querySelector('.st-eyebrow')?.textContent || ''), { timeout: 45000 });
  const errCode = await page.evaluate(() => document.querySelector('.st-eyebrow').textContent.trim());
  check('损坏 GLB → 分类错误面板', /ERR_PARSE/.test(errCode), errCode);

  /* 6. 错误后恢复：重新导入示例 */
  await page.evaluate(() => [...document.querySelectorAll('button')].find((b) => /重新导入/.test(b.textContent)).click());
  await page.waitForSelector('.st-empty', { timeout: 5000 });
  await page.evaluate(() => [...document.querySelectorAll('.st-empty-actions button, .st-actions button')]
    .find((b) => /馆内示例 A/.test(b.textContent)).click());
  await page.waitForFunction(() => !!document.querySelector('.st-stats'), { timeout: 90000 });
  check('错误态复位后再导入成功', true);

  /* 7. 不支持格式 → ERR_FORMAT */
  await page.evaluate(() => {
    const dt = new DataTransfer();
    dt.items.add(new File([new Uint8Array([1, 2, 3])], 'notes.txt', { type: 'text/plain' }));
    const input = document.querySelector('input[type=file]');
    input.files = dt.files;
    input.dispatchEvent(new Event('change', { bubbles: true }));
  });
  await page.waitForFunction(() => /ERR_FORMAT/.test(document.body.textContent), { timeout: 30000 });
  check('.txt → ERR_FORMAT', true);

  /* 8. 空场景 gltf → ERR_EMPTY */
  await page.evaluate(() => {
    const json = JSON.stringify({ asset: { version: '2.0' }, scene: 0, scenes: [{ nodes: [0] }], nodes: [{ name: 'EmptyRoot' }] });
    const dt = new DataTransfer();
    dt.items.add(new File([json], 'empty.gltf', { type: 'model/gltf+json' }));
    const input = document.querySelector('input[type=file]');
    input.files = dt.files;
    input.dispatchEvent(new Event('change', { bubbles: true }));
  });
  await page.waitForFunction(() => /ERR_EMPTY/.test(document.body.textContent), { timeout: 30000 });
  check('空场景 → ERR_EMPTY（可解析但无网格）', true);

  /* 9. 体积上限（?cap=1 + 2MB 假 GLB → ERR_SIZE，读取前拒收）
     hash-only goto 是同文档导航不会重挂载 → 显式 reload 让 readCapMB 重新取参 */
  await page.goto(`${BASE}/#/studio?cap=1`, { waitUntil: 'domcontentloaded' });
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForSelector('.studio-cv', { timeout: 20000 });
  await page.evaluate(() => {
    const dt = new DataTransfer();
    dt.items.add(new File([new Uint8Array(2 * 1024 * 1024)], 'big.glb'));
    const input = document.querySelector('input[type=file]');
    input.files = dt.files;
    input.dispatchEvent(new Event('change', { bubbles: true }));
  });
  await page.waitForFunction(() => /ERR_SIZE/.test(document.body.textContent), { timeout: 30000 });
  check('?cap=1 体积守卫生效', true);

  /* 10. 大厅不预载 studio chunk（hash-only goto 是同文档导航，先 reload 清空资源计时） */
  await page.goto(`${BASE}/#/`, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForSelector('.hub-nav', { timeout: 20000 });
  await sleep(2000);
  const leaked = await page.evaluate(() => performance.getEntriesByType('resource')
    .map((r) => r.name).filter((n) => /StudioView|studio\/(importer|viewer|index)/.test(n)));
  check('大厅未预载 studio 模块（懒加载边界）', leaked.length === 0, leaked.join(','));

  /* 控制台错误门（排除资源 404 类噪音：本页无外部引用，任何 error 都算数） */
  check('全程无 console error / pageerror', consoleErrors.length === 0, consoleErrors.slice(0, 3).join(' | '));
} catch (e) {
  failures.push('EXCEPTION: ' + String(e).slice(0, 200));
  console.log('✗ 异常中断：' + String(e).slice(0, 300));
}

console.log(`\n${failures.length ? 'FAIL(' + failures.length + '): ' + failures.join(' / ') : 'ALL PASS'} · 负载 ${load.toFixed(1)}`);
server.kill();
process.exit(failures.length ? 1 : 0);
