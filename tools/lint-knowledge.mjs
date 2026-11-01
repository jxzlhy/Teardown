#!/usr/bin/env node
/* =============================================================
   知识库校验（知识内容可信度门槛）
   - id 唯一、非空；zh 必填
   - relatedParts 至少 1 项，且全部存在于全馆部件 id 词表
   - relatedDevices（如有）必须存在于 registry
   - principle 非空 ⇒ sources ≥ 1（禁止无来源的原理正文）
   - sources[].url 必须 https
   - principle 为空 = 占位登记（UI 显示「原理编写中」），不要求 sources
   用法：npm run lint:knowledge（有错误退出码 1）
============================================================= */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { installDomShim } from './lib-node-shim.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
installDomShim();

const { devices } = await import(pathToFileURL(path.join(ROOT, 'src/devices/registry.js')).href);
const { technologies } = await import(pathToFileURL(path.join(ROOT, 'src/knowledge/index.js')).href);

const partIds = new Set();
for(const d of devices) for(const p of d.parts) partIds.add(p.id);
const deviceIds = new Set(devices.map(d => d.id));

let bad = 0;
const fail = (msg) => { console.log('  ✗ ' + msg); bad++; };

console.log(`知识库 · ${technologies.length} 条技术词条 / 全馆 ${partIds.size} 个部件 id`);
const seen = new Set();
for(const t of technologies){
  const at = (m) => `technologies[${t.id || '?'}] ${m}`;
  if(!t.id || typeof t.id !== 'string'){ fail(at('缺少 id')); continue; }
  if(seen.has(t.id)) fail(at('id 重复'));
  seen.add(t.id);
  if(!t.zh) fail(at('缺少中文名 zh'));
  if(!Array.isArray(t.relatedParts) || !t.relatedParts.length){
    fail(at('relatedParts 为空（至少登记 1 个部件 id）'));
  }else{
    for(const p of t.relatedParts){
      if(!partIds.has(p)) fail(at(`relatedParts → 全馆不存在部件 "${p}"`));
    }
  }
  if(t.relatedDevices){
    for(const d of t.relatedDevices){
      if(!deviceIds.has(d)) fail(at(`relatedDevices → registry 不存在设备 "${d}"`));
    }
  }
  const hasBody = typeof t.principle === 'string' && t.principle.trim().length > 0;
  if(hasBody){
    if(!Array.isArray(t.sources) || t.sources.length < 1){
      fail(at('principle 非空但无 sources（禁止无来源的原理正文）'));
    }
  }
  if(Array.isArray(t.sources)){
    for(const s of t.sources){
      if(!s.url || !/^https:\/\//.test(s.url)) fail(at(`sources url 必须 https："${s.url}"`));
      if(!s.label) fail(at('sources 缺少 label'));
    }
  }
}

const stubs = technologies.filter(t => !(typeof t.principle === 'string' && t.principle.trim()));
console.log(`  · 已编写 ${technologies.length - stubs.length} / ${technologies.length}（占位待编写 ${stubs.length}）`);

/* ---------- 品牌档案校验 ---------- */
const brands = (await import(pathToFileURL(path.join(ROOT, 'src/knowledge/brands.js')).href)).default;
const brandIds = new Set(brands.map(b => b.id));
const regBrands = [...new Set(devices.map(d => d.brand || 'OTHER'))];
const KINDS = ['company', 'agency', 'designer', 'author', 'generic'];
console.log(`品牌档案 · ${brands.length} 条 / registry ${regBrands.length} 个品牌`);
const seenBrand = new Set();
for(const b of brands){
  const at = (m) => `brands[${b.id || '?'}] ${m}`;
  if(!b.id || typeof b.id !== 'string'){ fail(at('缺少 id')); continue; }
  if(seenBrand.has(b.id)) fail(at('id 重复'));
  seenBrand.add(b.id);
  if(!KINDS.includes(b.kind)) fail(at(`kind 非法："${b.kind}"（允许 ${KINDS.join('/')}）`));
  /* 事实性字段必须有来源；未核证品牌只登记 kind（UI 显示「档案待考」） */
  const hasFact = b.founded != null || (b.note && b.note.trim());
  if(hasFact && (!Array.isArray(b.sources) || b.sources.length < 1)){
    fail(at('founded/note 非空但无 sources（禁止无来源的品牌史料）'));
  }
  if(Array.isArray(b.sources)){
    for(const s of b.sources){
      if(!s.url || !/^https:\/\//.test(s.url)) fail(at(`sources url 必须 https："${s.url}"`));
      if(!s.label) fail(at('sources 缺少 label'));
    }
  }
}
for(const id of regBrands){
  if(!brandIds.has(id)) fail(`registry 品牌 "${id}" 无品牌档案（brands.js 补登记，kind=author/generic 亦可）`);
}
console.log(`  · 已核证 ${brands.filter(b => b.confidence === 'verified-3rd').length} / ${brands.length}（待考/社区 ${brands.filter(b => b.confidence !== 'verified-3rd').length}）`);
if(bad){ console.log(`\n✗ 知识库校验失败 ${bad} 项`); process.exit(1); }
console.log('✓ 知识库校验通过');
