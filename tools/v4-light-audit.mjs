/* V4.1 照明审计：代表设备 × 双厅截图 → 亮度统计（均值/p99/过曝%/死黑%）→ 分级清单。
   像素分析用 Chrome 离屏 canvas（零依赖）。输出 docs/ui-ux/v4-light-audit.json。 */
import puppeteer from 'puppeteer-core';
import { existsSync, writeFileSync } from 'node:fs';
const c = ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'];
const SAMPLE = ['action4', 'galaxy-s22-ultra', 'iphone-12-teardown', 'v8-engine', 'jet-engine', 'grand-piano', 'airtag', 'orrery'];
const browser = await puppeteer.launch({ executablePath: c.find(existsSync), headless: 'new', args: ['--enable-unsafe-swiftshader','--no-sandbox'] });
const page = await browser.newPage();
page.setDefaultTimeout(30000);
const booted = () => page.waitForFunction(() => { const e = window.__ENGINE; const s = e && e.getState(); return s && s.booted && s.parts && s.parts.length; }, { timeout: 30000, polling: 300 });
/* 离屏分析页：img → canvas → 亮度统计（分析在独立 ana 页执行） */

const rows = [];
await page.setViewport({ width: 960, height: 640 });
/* 亮度统计在设备页自身执行：engine.snapshot(PNG dataURL) → img → canvas 320px → 像素统计 */
const shootStats = () => page.evaluate(async () => {
  const dataUrl = window.__ENGINE.snapshot('image/png', 0.9);
  const img = new Image();
  await new Promise((res, rej) => { img.onload = res; img.onerror = rej; img.src = dataUrl; });
  const W = 320, H = Math.max(1, Math.round(img.height / img.width * 320));
  const cv = document.createElement('canvas'); cv.width = W; cv.height = H;
  const g = cv.getContext('2d');
  g.drawImage(img, 0, 0, W, H);
  const full = g.getImageData(0, 0, W, H).data;
  /* 全幅 + 模型区（中心 40%×40%，模型所在处）双口径 */
  const crop = g.getImageData(W * 0.3, H * 0.3, W * 0.4, H * 0.4).data;
  const stat = (d) => {
    let sum = 0, clip = 0, crush = 0, n = d.length / 4;
    for (let i = 0; i < d.length; i += 4) {
      const l = 0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2];
      sum += l;
      if (l > 250) clip++; if (l < 8) crush++;
    }
    return { mean: +(sum / n).toFixed(1), clipPct: +(clip / n * 100).toFixed(2), crushPct: +(crush / n * 100).toFixed(2) };
  };
  return { full: stat(full), model: stat(crop) };
});

for (const id of SAMPLE) {
  await page.goto('http://127.0.0.1:8137/#/device/' + id, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await booted();
  await new Promise(r => setTimeout(r, 2200));
  for (const hall of ['night', 'day']) {
    await page.evaluate((h) => { const b = [...document.querySelectorAll('#dock .hud-icon')].find(x => x.getAttribute('aria-label') === '白天/黑夜双厅'); if (window.__ENGINE.getState().hallMode !== h && b) b.click(); }, hall);
    await new Promise(r => setTimeout(r, hall === 'day' ? 2000 : 1400));
    const st = await shootStats();
    rows.push({ id, hall, ...st });
    console.log(`${id.padEnd(22)} ${hall.padEnd(5)} 全幅mean=${st.full.mean} 模型区mean=${st.model.mean} 模型区clip=${st.model.clipPct}% crush=${st.model.crushPct}%`);
  }
}
writeFileSync(new URL('../docs/ui-ux/v4-light-audit.json', import.meta.url), JSON.stringify({ ts: new Date().toISOString(), rows }, null, 1));
await browser.close();
/* 分级：夜厅 clip>3% 过曝 / 夜厅 mean<18 过暗 / 日厅 mean>225 过曝 / 日厅 mean<120 过暗 */
const flags = rows.filter(r => (r.hall === 'night' && (r.clipPct > 3 || r.mean < 18)) || (r.hall === 'day' && (r.mean > 225 || r.mean < 120)));
console.log('\n== 分级（需照明治理）==');
flags.length ? flags.forEach(r => console.log(` ${r.id} ${r.hall}: mean=${r.mean} clip=${r.clipPct}%`)) : console.log(' 全部在阈值内');
console.log('JSON → docs/ui-ux/v4-light-audit.json');
process.exit(0);
