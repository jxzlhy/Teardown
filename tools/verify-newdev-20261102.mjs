#!/usr/bin/env node
/* =============================================================
   2026-11-02 新批次验证：fresnel-lens / refractor-telescope /
   fire-hydrant / seadogs-compass / vintage-stapler
   - 每台 booted + 部件网格数 + 幽灵/空部件检查
   - __RAW.names 按部件分组抽样（映射人工复核）
   - 夜厅截图落盘 /tmp/newdev-<id>.png
   用法：node tools/verify-newdev-20261102.mjs [devPort]
============================================================= */
import puppeteer from 'puppeteer-core';
import { existsSync } from 'node:fs';

const PORT = process.argv[2] || '8200';
const IDS = ['fresnel-lens', 'refractor-telescope', 'fire-hydrant', 'seadogs-compass', 'vintage-stapler'];
const c = ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'];
const browser = await puppeteer.launch({
  executablePath: c.find(existsSync),
  headless: 'new',
  args: ['--enable-unsafe-swiftshader', '--no-sandbox'],
});
const page = await browser.newPage();
await page.setViewport({ width: 1280, height: 800 });
const pageErrors = [];
page.on('pageerror', (e) => pageErrors.push(String(e).slice(0, 160)));
page.on('console', (m) => { if (m.type() === 'error') pageErrors.push(m.text().slice(0, 160)); });

let bad = 0;
for (const id of IDS) {
  pageErrors.length = 0;
  try {
    await page.goto(`http://127.0.0.1:${PORT}/#/device/${id}`, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForFunction(
      () => { const e = window.__ENGINE; const s = e && e.getState(); return s && s.booted && s.partsCount > 0; },
      { timeout: 70000, polling: 300 },
    );
    await new Promise((r) => setTimeout(r, 1200));
    const r = await page.evaluate(() => {
      const s = window.__ENGINE.getState();
      const scene = window.__ENGINE.getScene();
      const meshByPart = {};
      const namesByPart = {};
      scene.traverse((o) => {
        if (!o.isMesh || !o.userData || !o.userData.partId) return;
        const pid = o.userData.partId;
        meshByPart[pid] = (meshByPart[pid] || 0) + 1;
        if (!namesByPart[pid]) namesByPart[pid] = [];
        if (namesByPart[pid].length < 3) namesByPart[pid].push(o.name);
      });
      const declared = s.parts.map((p) => p.data ? p.data.id : p.id);
      const ghost = Object.keys(meshByPart).filter((k) => !declared.includes(k));
      const empty = declared.filter((pid) => !meshByPart[pid]);
      return { declared, meshByPart, namesByPart, ghost, empty, hull: s.hullRadius };
    });
    const ok = !r.ghost.length && !r.empty.length;
    if (!ok) bad++;
    console.log(`${id}: ${ok ? '✓' : '✗'} 部件 ${r.declared.length} · hull ${r.hull}`);
    for (const pid of r.declared) {
      console.log(`   ${pid.padEnd(11)} meshes=${String(meshCount(r.meshByPart, pid)).padStart(3)}  eg: ${(r.namesByPart[pid] || []).join(', ')}`);
    }
    if (r.ghost.length) console.log(`   幽灵: ${r.ghost}`);
    if (r.empty.length) console.log(`   空部件: ${r.empty}`);
    if (pageErrors.length) { console.log(`   页面错误: ${pageErrors.slice(0, 3).join(' | ')}`); bad++; }
    await page.screenshot({ path: `/tmp/newdev-${id}.png` });
  } catch (e) {
    console.log(`${id}: ERR ${e.message.slice(0, 80)}`);
    bad++;
  }
}
function meshCount(map, pid) { return map[pid] || 0; }
await browser.close();
console.log(bad ? `✗ ${bad} 台异常` : '✓ 新批次 5 台验证通过');
process.exit(bad ? 1 : 0);
