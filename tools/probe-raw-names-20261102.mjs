#!/usr/bin/env node
/* 一次性探针：dump 指定设备的 __RAW.names / per-part 归属，供映射校准
   用法：node tools/probe-raw-names-20261102.mjs <port> <id> ... */
import puppeteer from 'puppeteer-core';
import { existsSync } from 'node:fs';

const [, , port = '8200', ...ids] = process.argv;
if (!ids.length) { console.error('用法: node tools/probe-raw-names-20261102.mjs <port> <id>...'); process.exit(1); }
const c = ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'];
const browser = await puppeteer.launch({ executablePath: c.find(existsSync), headless: 'new', args: ['--enable-unsafe-swiftshader', '--no-sandbox'] });
const page = await browser.newPage();
await page.setViewport({ width: 1280, height: 800 });

for (const id of ids) {
  await page.goto(`http://127.0.0.1:${port}/#/device/${id}`, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForFunction(
    () => { const e = window.__ENGINE; const s = e && e.getState(); return s && s.booted && s.partsCount > 0; },
    { timeout: 70000, polling: 300 },
  );
  await new Promise((r) => setTimeout(r, 600));
  const raw = await page.evaluate(() => {
    const R = window.__RAW;
    return { names: (R.names||[]).slice(0,60), mappts: (window.__MAPPTS||[]).slice(0,60) };
  });
  console.log('  __RAW:', JSON.stringify(raw).slice(0, 500));
  const r = await page.evaluate(() => {
    const scene = window.__ENGINE.getScene();
    const rows = [];
    scene.traverse((o) => {
      if (!o.isMesh) return;
      const pid = o.userData && o.userData.partId;
      rows.push(`${o.name || '(empty)'} -> ${pid || '(none)'} | parent=${o.parent && o.parent.name || '?'} mat=${o.material && o.material.name || (o.material && o.material.type) || '?'} verts=${o.geometry && o.geometry.attributes && o.geometry.attributes.position ? o.geometry.attributes.position.count : '?'} vis=${o.visible}`);
    });
    return rows;
  });
  console.log(`═══ ${id} (${r.length} meshes)`);
  for (const line of r) console.log('  ' + line);
}
await browser.close();
