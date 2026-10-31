#!/usr/bin/env node
/* =============================================================
   知识星图构建期生成（Phase 4）
   registry + 设备配置 + 技术知识库 → public/knowledge-graph.json
   节点：brand / device / part（部件类）/ technology
   连边：produces（品牌→设备）、has-part（设备→部件类）、
        uses（设备→技术，经 techForPart 推导）、applies-to（技术→部件类）
   勿手写产物；设备/知识库变更后运行 npm run gen:graph 重新生成。
============================================================= */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { installDomShim } from './lib-node-shim.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
installDomShim();

const { devices } = await import(pathToFileURL(path.join(ROOT, 'src/devices/registry.js')).href);
const { technologies, techForPart } = await import(pathToFileURL(path.join(ROOT, 'src/knowledge/index.js')).href);
const { isCommunityModel } = await import(pathToFileURL(path.join(ROOT, 'src/lib/model-class.js')).href);

const nodes = [];
const links = [];
const seenNode = new Set();
const seenLink = new Set();
const addNode = (id, type, label, extra = {}) => {
  if(seenNode.has(id)) return;
  seenNode.add(id);
  nodes.push({ id, type, label, ...extra });
};
const addLink = (source, target, type) => {
  const key = `${source}|${target}|${type}`;
  if(seenLink.has(key)) return;
  seenLink.add(key);
  links.push({ source, target, type });
};

for(const d of devices){
  const brandId = 'brand:' + (d.brand || 'OTHER');
  const deviceId = 'device:' + d.id;
  addNode(brandId, 'brand', d.brand || 'OTHER', { count: 0 });
  addNode(deviceId, 'device', d.name, { device: d.id, category: d.category, era: d.era ?? null, community: isCommunityModel(d) });
  addLink(brandId, deviceId, 'produces');

  const techsHit = new Set();
  for(const p of d.parts){
    const partId = 'part:' + p.id;
    addNode(partId, 'part', p.zh || p.id, { part: p.id });
    addLink(deviceId, partId, 'has-part');
    const t = techForPart(p.id);
    if(t && t.principle){ techsHit.add(t.id); addNode('tech:' + t.id, 'tech', t.zh, { tech: t.id }); }
  }
  for(const tid of techsHit) addLink(deviceId, 'tech:' + tid, 'uses');
}

/* 技术 → 部件类（applies-to）：关联该技术登记的全部部件类节点 */
for(const t of technologies){
  for(const pid of t.relatedParts){
    const key = 'part:' + pid;
    if(seenNode.has(key)) addLink('tech:' + t.id, key, 'applies-to');
  }
}

/* 品牌节点计数（连出的设备数） */
for(const n of nodes){
  if(n.type === 'brand') n.count = links.filter(l => l.type === 'produces' && l.source === n.id).length;
}

const out = {
  generated: new Date().toISOString().slice(0, 10),
  stats: {
    devices: nodes.filter(n => n.type === 'device').length,
    brands: nodes.filter(n => n.type === 'brand').length,
    parts: nodes.filter(n => n.type === 'part').length,
    techs: nodes.filter(n => n.type === 'tech').length,
    links: links.length,
  },
  nodes, links,
};
const dest = path.join(ROOT, 'public', 'knowledge-graph.json');
fs.writeFileSync(dest, JSON.stringify(out));
console.log(`✓ knowledge-graph.json · 设备 ${out.stats.devices} · 品牌 ${out.stats.brands} · 部件类 ${out.stats.parts} · 技术 ${out.stats.techs} · 连边 ${out.stats.links} · ${(fs.statSync(dest).size/1024).toFixed(0)}KB`);
