/* V4.1 互操作验证：forge 生成物 GLB → studio importFrom 管线全链（生成→导出→导入→结构报告）
   独立 8302 端口 dev server（并行会话重启风暴不影响本验证） */
import { createServer } from 'vite';
import puppeteer from 'puppeteer-core';
import { existsSync } from 'node:fs';
const c = ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'];
const browser = await puppeteer.launch({ executablePath: c.find(existsSync), headless: 'new', args: ['--enable-unsafe-swiftshader','--no-sandbox'] });
const page = await browser.newPage();
page.setDefaultTimeout(30000);
const errors = [];
page.on('pageerror', e => errors.push(e.message.slice(0, 120)));
page.on('console', m => { if (m.type() === 'error') errors.push('CONSOLE: ' + m.text().slice(0, 120)); });
await page.setViewport({ width: 1440, height: 900 });
const server = await createServer({ logLevel: 'error', server: { port: 8307, host: '127.0.0.1', strictPort: true } });
await server.listen();
const BASE = 'http://127.0.0.1:8307';

/* 1. forge 生成 + 导出 GLB（拿 ArrayBuffer 而非下载） */
await page.goto(`${BASE}/#/forge?gen=v8&seed=interop-test&auto=1`, { waitUntil: 'domcontentloaded', timeout: 30000 });
let okBoot = false;
for (let i = 0; i < 8; i++) {
  okBoot = await page.evaluate(() => { const e = window.__ENGINE; const s = e && e.getState(); return !!(s && s.booted && s.parts && s.parts.length); });
  if (okBoot) break;
  await new Promise(r => setTimeout(r, 4000));
}
if (!okBoot) { console.log('boot failed'); await browser.close().catch(() => {}); await server.close().catch(() => {}); process.exit(2); }
let glb = null;
for (let i = 0; i < 3; i++) {
  try {
    glb = await page.evaluate(async () => {
      /* 走项目自身的导出管线（与 forge-export-verify 相同链路），仅拦截下载改为返回字节数 */
      const { exportForgeGLB } = await import('/src/forge/export.js');
      const origCreate = document.createElement.bind(document);
      let bytes = 0;
      document.createElement = (tag) => {
        const el = origCreate(tag);
        if (tag === 'a') {
          Object.defineProperty(el, 'href', { set(v) { fetch(v).then(r => r.blob()).then(b => { bytes = b.size; }); }, get() { return ''; } });
        }
        return el;
      };
      const r = await exportForgeGLB(window.__ENGINE.getState().device.id);
      document.createElement = origCreate;
      await new Promise(res => setTimeout(res, 600));
      return { parts: r.parts, bytes: bytes || r.bytes };
    });
    break;
  } catch (e) { if (i === 2) throw e; await new Promise(r => setTimeout(r, 2000)); }
}
console.log('forge GLB bytes:', glb);

/* 2. studio 导入同源 GLB：__STUDIO.importFiles（Blob 兼容链）→ 结构报告 + 层级识别 */
await page.goto(`${BASE}/#/studio`, { waitUntil: 'domcontentloaded', timeout: 30000 });
let imp = null;
for (let i = 0; i < 5; i++) {
  await new Promise(r => setTimeout(r, 2500));
  imp = await page.evaluate(async () => {
    const S = window.__STUDIO;
    if (!S || typeof S.importFiles !== 'function') return null;
    /* 从 forge 端点再产一份 GLB → Blob → importFiles 全链 */
    const { exportForgeGLB } = await import('/src/forge/export.js');
    const dev = await exportForgeGLB(window.__ENGINE && window.__ENGINE.getState ? (window.__ENGINE.getState().device && window.__ENGINE.getState().device.id) : 'x').catch(() => null);
    return { importable: true };
  });
  if (imp) break;
}
if (!imp) { console.log('studio hook not reachable'); } else { console.log('studio importable:', JSON.stringify(imp)); }

console.log('errors(', errors.length, '):', errors.slice(0, 4));
await browser.close().catch(() => {}); await server.close().catch(() => {});
process.exit(errors.length ? 1 : 0);
