/* AURORA PHASE 4 装载分环节基线实测：冷/热缓存 × 3 台代表设备。
   读 getState().loadTiming（fetch/parse/scene/finalize/done/firstRender/bvh）。
   无头已知环境类（NEXT_SESSION 定性）：标签冻结于动态 import pending →
   每台每模式独立 attempt（最多 3 次换新页面），与 hud-verify 护栏同口径。 */
import fs from 'node:fs';
import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer-core';

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PORT = Number(process.env.LOAD_PORT || 8291);
const BASE = `http://127.0.0.1:${PORT}`;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const DEVICES = [['iphone-13', '小'], ['action4', '中'], ['v8-engine', '大']];

const server = spawn(process.execPath, [ROOT + '/node_modules/vite/bin/vite.js', '--host', '127.0.0.1', '--port', String(PORT), '--strictPort'], { cwd: ROOT, stdio: 'ignore' });
await sleep(7000);

const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new', args: ['--no-sandbox', '--enable-unsafe-swiftshader', '--disable-gpu-sandbox', '--window-size=1440,900'] });
const rows = [];
const grab = async (id, mode) => {
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  try {
    if (mode === 'cold') {
      await page.goto(`${BASE}/#/`, { waitUntil: 'domcontentloaded', timeout: 45000 });
      await page.evaluate(async () => { if (window.caches) { const ns = await caches.keys(); for (const n of ns) if (/glb/i.test(n)) await caches.delete(n); } });
    }
    await page.goto(`${BASE}/#/device/${id}`, { waitUntil: 'domcontentloaded', timeout: 45000 });
    await page.waitForFunction(() => {
      const e = window.__ENGINE; const s = e && e.getState();
      return !!(s && s.booted && s.loadTiming && s.loadTiming.doneMs > 0 && s.loadTiming.firstRenderMs > 0);
    }, { timeout: 300000, polling: 500 });
    await sleep(3500);
    return await page.evaluate(() => JSON.parse(JSON.stringify(window.__ENGINE.getState().loadTiming)));
  } finally { await page.close().catch(() => {}); }
};
try {
  for (const [id, tag] of DEVICES) {
    for (const mode of ['cold', 'hot']) {
      let lt = null;
      for (let a = 0; a < 3 && !lt; a++) {
        try { lt = await grab(id, mode); }
        catch (e) { console.log(`· ${id}/${mode} 第 ${a + 1} 次环境性中断（${String(e).split('\n')[0].slice(0, 60)}），换新页面重试`); await sleep(4000); }
      }
      if (!lt) { console.log(`✗ ${id}/${mode}：三轮环境性冻结，跳过（如实挂账）`); rows.push({ id, mode, frozen: true }); continue; }
      rows.push({ id, mode, ...lt });
      console.log(`${id}(${tag}) · ${mode}: fetch=${lt.fetchMs}ms(${lt.cached ? '缓存' : '网络'} ${(lt.bytes / 1048576).toFixed(1)}MB) parse=${lt.parseMs} scene=${lt.sceneMs} finalize=${lt.finalizeMs} done=${lt.doneMs} firstRender=${lt.firstRenderMs} bvh=${lt.bvhMs}`);
      await sleep(1000);
    }
  }
  fs.writeFileSync('docs/audit/load-timing-baseline.json', JSON.stringify(rows, null, 1));
  console.log('\n已写 /tmp/aurora-load-baseline.json');
} catch (e) {
  console.log('EXCEPTION: ' + String(e).slice(0, 160));
} finally {
  await browser.close().catch(() => {});
  server.kill();
}
process.exit(0);
