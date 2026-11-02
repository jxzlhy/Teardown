#!/usr/bin/env node
/* 开场 settle 后拍组装态 + 拆解态（explode=1）截图
   用法：node tools/shots-newdev-20261102.mjs <port> <id> ... */
import puppeteer from 'puppeteer-core';
import { existsSync } from 'node:fs';

const [, , port = '8200', ...ids] = process.argv;
if (!ids.length) { console.error('用法: node tools/shots-newdev-20261102.mjs <port> <id>...'); process.exit(1); }
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
  await new Promise((r) => setTimeout(r, 2600)); /* 开场演出 settle（55% 爆炸入场需复位） */
  await page.screenshot({ path: `/tmp/newdev2-${id}-assembled.png` });
  await page.evaluate(() => window.__ENGINE.setExplode(1));
  await new Promise((r) => setTimeout(r, 1600));
  await page.screenshot({ path: `/tmp/newdev2-${id}-explode.png` });
  await page.evaluate(() => window.__ENGINE.setExplode(0));
  console.log(`${id}: ✓ assembled + explode`);
}
await browser.close();
