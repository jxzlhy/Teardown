/* V4.0 Slice 3：vite preview 产物级回归——静态资产 200 + 深链启动 + 控制台无错 */
import { preview } from 'vite';
import puppeteer from 'puppeteer-core';
import { existsSync, writeFileSync } from 'node:fs';

const server = await preview({ preview: { port: 8412, host: '127.0.0.1', strictPort: true } });
const base = 'http://127.0.0.1:8412';
const results = { assets: {}, deepLinks: {}, consoleErrors: [] };

/* 1. 关键静态资产 */
for (const p of ['/', '/index.html', '/thumbs/action4.webp', '/thumbs/action4-day.webp', '/favicon.svg', '/assets/draco/draco_decoder.wasm']) {
  try {
    const res = await fetch(base + p);
    results.assets[p] = res.status;
  } catch (e) { results.assets[p] = 'ERR ' + String(e.message).slice(0, 40); }
}

/* 2. 产物级深链启动（真实浏览器） */
const c = ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'];
const browser = await puppeteer.launch({ executablePath: c.find(existsSync), headless: 'new', args: ['--enable-unsafe-swiftshader','--no-sandbox'] });
const page = await browser.newPage();
page.setDefaultTimeout(25000);
page.on('pageerror', e => results.consoleErrors.push('PAGEERROR: ' + e.message.slice(0, 120)));
page.on('console', m => { if (m.type() === 'error') results.consoleErrors.push('CONSOLE: ' + m.text().slice(0, 120)); });
for (const route of ['/', '/device/action4', '/forge', '/graph', '/timeline']) {
  await page.goto(`${base}/#${route}`, { waitUntil: 'domcontentloaded', timeout: 25000 });
  await new Promise(r => setTimeout(r, route === '/device/action4' ? 4000 : 1800));
  results.deepLinks[route] = await page.evaluate(() => ({
    app: !!document.querySelector('#app *'),
    engine: !!(window.__ENGINE && window.__ENGINE.getState && window.__ENGINE.getState().booted),
  }));
}
await browser.close().catch(() => {});
await server.close();
writeFileSync('/tmp/preview-verify.json', JSON.stringify(results, null, 1));
console.log(JSON.stringify(results, null, 1));
const bad = Object.values(results.assets).some(s => s !== 200)
  || Object.values(results.deepLinks).some(d => !d.app)
  || results.consoleErrors.length;
process.exit(bad ? 1 : 0);
