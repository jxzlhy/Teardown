/* 读 radial-engine 的 __RAW.rel 实测：设计 mapByPosition 聚类 */
import puppeteer from 'puppeteer-core';
import { existsSync } from 'node:fs';
const c = ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'];
const browser = await puppeteer.launch({ executablePath: c.find(existsSync), headless: 'new', args: ['--enable-unsafe-swiftshader','--no-sandbox'] });
const page = await browser.newPage();
await page.setViewport({ width: 1280, height: 800 });
await page.goto('http://127.0.0.1:8137/#/device/radial-engine', { waitUntil: 'networkidle2', timeout: 90000 });
await page.waitForFunction(() => {
  const e = window.__ENGINE; const s = e && e.getState();
  return s && s.booted && /OFFICIAL|COMMUNITY|PROCEDURAL|FALLBACK/.test(s.modelStatus || '');
}, { timeout: 80000, polling: 300 });
await new Promise(r => setTimeout(r, 800));
const rel = await page.evaluate(() => window.__RAW && window.__RAW.rel);
console.log(JSON.stringify(rel, null, 0).slice(0, 3000));
await browser.close();
