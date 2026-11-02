#!/usr/bin/env node
/* =============================================================
   馆内数字一致性校验（2026-11-02 审计 P1-2 整改）
   断言以下五处台数口径完全一致，防止生成物与 registry 漂移：
     1) src/devices/registry.js（剔除 unlisted 筹备中设备）
     2) MODEL_INVENTORY.md 的「N 台设备」
     3) public/knowledge-graph.json 的 stats.devices
     4) public/timeline.json 的 coverage.total
     5) index.html 的 description / og:description 里的「N 台设备」
   用法：npm run lint:devices（有错误退出码 1）
   修复：npm run gen:inventory && npm run gen:graph && npm run gen:timeline
   ============================================================= */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { installDomShim } from './lib-node-shim.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
installDomShim();

const { devices } = await import(pathToFileURL(path.join(ROOT, 'src/devices/registry.js')).href);
const listed = devices.filter(d => !d.unlisted);
const expect = listed.length;
const parts = listed.reduce((s, d) => s + d.parts.length, 0);
const brands = new Set(listed.map(d => d.brand || 'OTHER')).size;

let bad = 0;
const check = (label, got, extra) => {
  const ok = got === expect;
  console.log(`${ok ? '✓' : '✗'} ${label}: ${got === null ? '未找到' : got}${ok ? '' : `（应为 ${expect}）`}${extra && !ok ? ' · ' + extra : ''}`);
  if (!ok) bad++;
};
const read = p => fs.readFileSync(path.join(ROOT, p), 'utf8');

console.log(`registry 在馆口径：${expect} 台 · ${parts} 部件 · ${brands} 品牌` +
  (devices.length - listed.length ? `（另有 ${devices.length - listed.length} 台筹备中未入馆）` : ''));

const inv = read('MODEL_INVENTORY.md').match(/\*\*(\d+) 台设备\*\*/);
check('MODEL_INVENTORY.md', inv ? Number(inv[1]) : null, '跑 npm run gen:inventory');

const gPath = path.join(ROOT, 'public/knowledge-graph.json');
if (fs.existsSync(gPath)) {
  const g = JSON.parse(read('public/knowledge-graph.json'));
  check('knowledge-graph.json stats.devices', g?.stats?.devices ?? null, '跑 npm run gen:graph');
} else check('knowledge-graph.json', null, '文件缺失，跑 npm run gen:graph');

const tPath = path.join(ROOT, 'public/timeline.json');
if (fs.existsSync(tPath)) {
  const t = JSON.parse(read('public/timeline.json'));
  check('timeline.json coverage.total', t?.coverage?.total ?? null, '跑 npm run gen:timeline');
} else check('timeline.json', null, '文件缺失，跑 npm run gen:timeline');

const html = read('index.html');
const desc = html.match(/name="description"[^>]*?(\d+)\s*台设备/);
check('index.html description', desc ? Number(desc[1]) : null, '构建期会注入，源文件也需同步');

if (bad) {
  console.log(`\n结果：${bad} 处数字不一致（在馆口径 ${expect} 台为准）`);
  console.log('修复：npm run gen:inventory && npm run gen:graph && npm run gen:timeline');
  process.exit(1);
}
console.log('\n✓ 五处数字一致');
