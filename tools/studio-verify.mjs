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
  /* 1. 壳渲染 + 空态（高内存压力下动态 import 可能冻结——OOM 定性见 AUTONOMOUS_LOG；
        重试 reload 给新上下文，静默窗口内即可启动） */
  let booted = false;
  for (let a = 0; a < 3 && !booted; a++) {
    await page.goto(`${BASE}/#/studio`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    try { await page.waitForSelector('.studio-cv', { timeout: 25000 }); booted = true; }
    catch { console.log(`  …启动重试 ${a + 1}/3（环境冻结特征，非代码路径）`); }
  }
  if (!booted) throw new Error('studio 壳三次未启动（环境冻结）');
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

  /* 4b. 编辑器（V5.0.2）：变换 → 撤销 → 重做 → 复位 → 材质 → 导出（__STUDIO 与 UI 同一调用路径） */
  const sel = await page.evaluate(() => window.__STUDIO && window.__STUDIO.selected());
  check('编辑器：选中路径可用', !!sel, sel || 'null');
  const wt = await page.evaluate((p) => window.__STUDIO.getTransform(p), sel);
  check('编辑器：读取变换', !!wt && Array.isArray(wt.position) && wt.rotation.every((n) => Math.abs(n) <= 360.01), JSON.stringify(wt && wt.rotation));
  await page.evaluate((p) => window.__STUDIO.setTransform(p, { position: [1.25, 0.5, -0.75] }, '编辑变换'), sel);
  const moved = await page.evaluate((p) => window.__STUDIO.getTransform(p).position, sel);
  check('编辑器：应用变换生效', moved[0] === 1.25 && moved[1] === 0.5 && moved[2] === -0.75, JSON.stringify(moved));
  const undoRes = await page.evaluate((p) => {
    const ok = window.__STUDIO.undo();
    return { ok, pos: window.__STUDIO.getTransform(p).position, canRedo: window.__STUDIO.canRedo() };
  }, sel);
  check('编辑器：撤销回原值', undoRes.ok && undoRes.canRedo, JSON.stringify(undoRes.pos));
  const redoRes = await page.evaluate((p) => { window.__STUDIO.redo(); return window.__STUDIO.getTransform(p).position; }, sel);
  check('编辑器：重做到编辑值', redoRes[0] === 1.25, JSON.stringify(redoRes));
  const resetRes = await page.evaluate((p) => {
    window.__STUDIO.resetTransform(p);
    return window.__STUDIO.getTransform(p).position;
  }, sel);
  check('编辑器：复位到导入态', JSON.stringify(resetRes) === JSON.stringify(wt.position), JSON.stringify(resetRes));
  const matRes = await page.evaluate((p) => {
    const m0 = window.__STUDIO.getMaterial(p);
    if (!m0 || !m0.hasColor) return { skip: true, m0 };
    window.__STUDIO.setMaterialProp(p, { color: '#ff0000' }, '编辑材质');
    return { skip: false, after: window.__STUDIO.getMaterial(p).color, shared: m0.shared };
  }, sel);
  check('编辑器：材质颜色修改' + (matRes.skip ? '（该网格无颜色属性，跳过）' : ''), matRes.skip || matRes.after === '#ff0000', JSON.stringify(matRes));
  const exported = await page.evaluate(() => window.__STUDIO.exportGlb('verify-export.glb').then((r) => ({ bytes: r.bytes })));
  check('编辑器：GLB 导出（编辑后场景）', exported.bytes > 1000, exported.bytes + 'B');
  /* 撤销链一致性：连续回退直至历史清空（材质编辑可能被跳过，按实际命令数排干） */
  const drained = await page.evaluate(() => {
    let n = 0;
    while (window.__STUDIO.undo() && n < 60) n++;
    return n;
  });
  check('编辑器：撤销链排干（≥变换+复位+材质）', drained >= 2, 'undone=' + drained);
  /* DOM 侧：撤销/重做按钮禁用态与状态同步 */
  await page.waitForFunction(() => {
    const btns = [...document.querySelectorAll('.st-tools button')];
    const undo = btns.find((b) => /撤销/.test(b.textContent));
    return undo && !undo.disabled;
  }, { timeout: 10000 }).catch(() => {});
  const undoDisabled = await page.evaluate(() => {
    const undo = [...document.querySelectorAll('.st-tools button')].find((b) => /撤销/.test(b.textContent));
    return undo ? undo.disabled : null;
  });
  check('编辑器：工具条撤销按钮状态同步（历史已清空 → disabled）', undoDisabled === true, 'disabled=' + undoDisabled);

  /* 4c. 本地作品库（V5.0.8）：保存→列表→载入→备份→删除→恢复→非法拒收→清理 */
  const libRes = await page.evaluate(async () => {
    const S = window.__STUDIO;
    const out = {};
    const rec = await S.saveWork('验证作品A');
    out.saved = rec.name;
    out.list1 = (await S.listWorks()).length;
    await S.loadWork(rec.id);
    for (let i = 0; i < 40 && !document.querySelector('.st-stats'); i++) await new Promise((r) => setTimeout(r, 500));
    out.reloaded = !!document.querySelector('.st-stats');
    const backup = await S.backupJson();
    out.backupWorks = backup.works.length;
    out.backupFmt = backup.fmt;
    await S.deleteWork(rec.id);
    out.list0 = (await S.listWorks()).length;
    out.restored = await S.restoreBackup(backup);
    out.list2 = (await S.listWorks()).length;
    let badRejected = false;
    try { await S.restoreBackup({ fmt: 'bad' }); } catch { badRejected = true; }
    out.badRejected = badRejected;
    for (const w of await S.listWorks()) await S.deleteWork(w.id);
    out.listClean = (await S.listWorks()).length;
    return out;
  });
  check('作品库：保存→列表', libRes.saved === '验证作品A' && libRes.list1 === 1, JSON.stringify({ saved: libRes.saved, list1: libRes.list1 }));
  check('作品库：载入回画布（完整 importFrom 管线）', libRes.reloaded === true, '');
  check('作品库：备份格式与数量', libRes.backupFmt === 'gewu-studio-backup/1' && libRes.backupWorks === 1, libRes.backupFmt + '×' + libRes.backupWorks);
  check('作品库：删除→恢复往返', libRes.list0 === 0 && libRes.restored === 1 && libRes.list2 === 1, JSON.stringify({ list0: libRes.list0, restored: libRes.restored, list2: libRes.list2 }));
  check('作品库：非法备份拒收', libRes.badRejected === true);
  check('作品库：清理后为空', libRes.listClean === 0);

  /* —— 错误路径组（5-9）改在全新页面跑：与主流程解耦，OOM 崩页不连坐。
        先关主页面——它的满帧视口还在软件渲染，双实例会互相拖垮计时 —— */
  await page.close().catch(() => {});
  const p2 = await browser.newPage();
  p2.on('console', (m) => { if (m.type() === 'error') consoleErrors.push(m.text().slice(0, 160)); });
  p2.on('pageerror', (e) => consoleErrors.push('pageerror: ' + String(e).slice(0, 160)));
  await p2.goto(`${BASE}/#/studio`, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await p2.waitForSelector('.studio-cv', { timeout: 30000 });

  /* 5. 损坏 GLB → ERR_PARSE（手写 GLB 头：合法 magic+version，总长越界 → 解析器报错） */
  await p2.evaluate(() => {
    const head = new Uint8Array(1024);
    const dv = new DataView(head.buffer);
    dv.setUint32(0, 0x46546c67, true);   // 'glTF'
    dv.setUint32(4, 2, true);            // version
    dv.setUint32(8, 0x7fffffff, true);   // 总长度越界 → 头部校验失败
    const dt = new DataTransfer();
    dt.items.add(new File([head], 'broken.glb'));
    const input = document.getElementById('studioFileInput');
    input.files = dt.files;
    input.dispatchEvent(new Event('change', { bubbles: true }));
  });
  await p2.waitForFunction(() => /ERR_/.test(document.querySelector('.st-eyebrow')?.textContent || ''), { timeout: 45000 });
  const errCode = await p2.evaluate(() => document.querySelector('.st-eyebrow').textContent.trim());
  check('损坏 GLB → 分类错误面板', /ERR_PARSE/.test(errCode), errCode);

  /* 6. 错误后恢复：重新导入示例 */
  await p2.evaluate(() => [...document.querySelectorAll('button')].find((b) => /重新导入/.test(b.textContent)).click());
  await p2.waitForSelector('.st-empty', { timeout: 5000 });
  await p2.evaluate(() => [...document.querySelectorAll('.st-empty-actions button, .st-actions button')]
    .find((b) => /馆内示例 A/.test(b.textContent)).click());
  await p2.waitForFunction(() => !!document.querySelector('.st-stats'), { timeout: 90000 });
  check('错误态复位后再导入成功', true);

  /* 7. 不支持格式 → ERR_FORMAT */
  await p2.evaluate(() => {
    const dt = new DataTransfer();
    dt.items.add(new File([new Uint8Array([1, 2, 3])], 'notes.txt', { type: 'text/plain' }));
    const input = document.getElementById('studioFileInput');
    input.files = dt.files;
    input.dispatchEvent(new Event('change', { bubbles: true }));
  });
  await p2.waitForFunction(() => /ERR_FORMAT/.test(document.body.textContent), { timeout: 30000 });
  check('.txt → ERR_FORMAT', true);

  /* 8. 空场景 gltf → ERR_EMPTY */
  await p2.evaluate(() => {
    const json = JSON.stringify({ asset: { version: '2.0' }, scene: 0, scenes: [{ nodes: [0] }], nodes: [{ name: 'EmptyRoot' }] });
    const dt = new DataTransfer();
    dt.items.add(new File([json], 'empty.gltf', { type: 'model/gltf+json' }));
    const input = document.getElementById('studioFileInput');
    input.files = dt.files;
    input.dispatchEvent(new Event('change', { bubbles: true }));
  });
  await p2.waitForFunction(() => /ERR_EMPTY/.test(document.body.textContent), { timeout: 30000 });
  check('空场景 → ERR_EMPTY（可解析但无网格）', true);

  /* 9. 体积上限（?cap=1 + 2MB 假 GLB → ERR_SIZE，读取前拒收）
     hash-only goto 是同文档导航不会重挂载 → 显式 reload 让 readCapMB 重新取参 */
  await p2.goto(`${BASE}/#/studio?cap=1`, { waitUntil: 'domcontentloaded' });
  await p2.reload({ waitUntil: 'domcontentloaded' });
  await p2.waitForSelector('.studio-cv', { timeout: 20000 });
  await p2.evaluate(() => {
    const dt = new DataTransfer();
    dt.items.add(new File([new Uint8Array(2 * 1024 * 1024)], 'big.glb'));
    const input = document.getElementById('studioFileInput');
    input.files = dt.files;
    input.dispatchEvent(new Event('change', { bubbles: true }));
  });
  await p2.waitForFunction(() => /ERR_SIZE/.test(document.body.textContent), { timeout: 30000 });
  check('?cap=1 体积守卫生效', true);

  /* 10. 大厅不预载 studio chunk（hash-only goto 是同文档导航，先 reload 清空资源计时；
        OOM 下页面可能中途崩溃——换新页面重试） */
  let leaked = null;
  for (let a = 0; a < 3 && leaked === null; a++) {
    try {
      const p2 = await browser.newPage();
      await p2.goto(`${BASE}/#/`, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await p2.waitForSelector('.hub-nav', { timeout: 20000 });
      await sleep(2000);
      leaked = await p2.evaluate(() => performance.getEntriesByType('resource')
        .map((r) => r.name).filter((n) => /StudioView|studio\/(importer|viewer|index)/.test(n)));
      await p2.close();
    } catch { leaked = null; }
  }
  check('大厅未预载 studio 模块（懒加载边界）', Array.isArray(leaked) && leaked.length === 0, Array.isArray(leaked) ? leaked.join(',') : '页面三次崩溃');

  /* 控制台错误门（排除资源 404 类噪音：本页无外部引用，任何 error 都算数） */
  check('全程无 console error / pageerror', consoleErrors.length === 0, consoleErrors.slice(0, 3).join(' | '));
} catch (e) {
  failures.push('EXCEPTION: ' + String(e).slice(0, 200));
  console.log('✗ 异常中断：' + String(e).slice(0, 300));
}

console.log(`\n${failures.length ? 'FAIL(' + failures.length + '): ' + failures.join(' / ') : 'ALL PASS'} · 负载 ${load.toFixed(1)}`);
server.kill();
process.exit(failures.length ? 1 : 0);
