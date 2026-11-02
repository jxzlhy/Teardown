#!/usr/bin/env node
/* =============================================================
   时间轴构建期生成（ROADMAP §5.3）：device.era + technology.invented
   → public/timeline.json。勿手写产物；设备/知识库变更后重新生成。
   事件两类：
   - device：era 有值的设备（发布/问世）
   - tech：知识库词条 invented 年（实用化起点）
   年代串 era（如 '1950s'）取代表年并在 band 标注"年代"。
============================================================= */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { installDomShim } from './lib-node-shim.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
installDomShim();

const { devices: allDevices } = await import(pathToFileURL(path.join(ROOT, 'src/devices/registry.js')).href);
const devices = allDevices.filter(d => !d.unlisted);   /* 脚手架半成品不进编年 */
const { technologies } = await import(pathToFileURL(path.join(ROOT, 'src/knowledge/index.js')).href);

const events = [];
for(const d of devices){
  if(d.era == null) continue;
  const decade = typeof d.era === 'string';
  const year = decade ? parseInt(d.era, 10) + 5 : d.era;
  events.push({ year, kind: 'device', id: d.id, label: d.name, sub: d.brand || null, approx: decade, display: decade ? d.era : String(d.era) });
}
for(const t of technologies){
  if(t.invented == null) continue;
  /* invented 容忍 '约 1300' / '约公元前 150' 等写法：提取数字，公元前记负数排序；
     display 保留原始写法供视图展示 */
  const m = String(t.invented).match(/(\d{3,4})/);
  if(!m) continue;
  const bc = /公元前/.test(t.invented);
  const year = bc ? -parseInt(m[1], 10) : parseInt(m[1], 10);
  events.push({ year, kind: 'tech', id: t.id, label: t.zh, sub: '技术 · 实用化', display: t.invented });
}
events.sort((a, b) => a.year - b.year);

/* 分带：给视图提供天然分段（纯机械 → 机电 → 电子 → 数字） */
function bandOf(year){
  if(year < 1900) return '古典机械';
  if(year < 1960) return '机电时代';
  if(year < 1990) return '电子时代';
  return '数字时代';
}
const bands = {};
for(const e of events){
  const b = bandOf(e.year);
  (bands[b] = bands[b] || []).push(e);
}

const out = {
  generated: new Date().toISOString().slice(0, 10),
  coverage: { devices: devices.filter(d => d.era != null).length, total: devices.length, techs: technologies.length },
  bands: Object.entries(bands).map(([name, items]) => ({ name, from: items[0].year, to: items[items.length - 1].year, events: items })),
};
const dest = path.join(ROOT, 'public', 'timeline.json');
fs.writeFileSync(dest, JSON.stringify(out));
console.log(`✓ timeline.json · 事件 ${events.length}（设备 ${out.coverage.devices}/${out.coverage.total} · 技术 ${technologies.length}）· 分带 ${Object.keys(bands).join('/')} · ${(fs.statSync(dest).size/1024).toFixed(0)}KB`);
