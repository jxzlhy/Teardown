#!/usr/bin/env node
/* =============================================================
   设备配置静态校验（重点：映射引用的 partId 拼错会静默归入 shell）
   - mapping / materialMapping / mappingPrefix 的值必须存在于 parts[].id
   - realPartIds 必须存在于 parts[].id
   - parts id 不重复；real:true 部件应有对应模型来源
   - device.glb 文件必须存在于 public/assets/
   用法：npm run lint:devices（有错误退出码 1）
============================================================= */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { installDomShim } from './lib-node-shim.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
installDomShim();

const { devices } = await import(pathToFileURL(path.join(ROOT, 'src/devices/registry.js')).href);

let badCount = 0, warnCount = 0;
const fail = (msg) => { console.log('  ✗ ' + msg); badCount++; };
const warn = (msg) => { console.log('  ⚠ ' + msg); warnCount++; };

for(const d of devices){
  console.log(`${d.id} · ${d.name}`);
  const ids = new Set(d.parts.map(p => p.id));
  const dup = d.parts.map(p => p.id).filter((x, i, a) => a.indexOf(x) !== i);
  if(dup.length) fail('parts id 重复: ' + [...new Set(dup)].join(', '));

  const checkMap = (label, obj) => {
    for(const [k, v] of Object.entries(obj || {})){
      if(!ids.has(v)) fail(`${label}["${k}"] → 未知部件 "${v}"（会静默归入 shell）`);
    }
  };
  checkMap('mapping', d.mapping);
  checkMap('materialMapping', d.materialMapping);
  checkMap('mappingPrefix', d.mappingPrefix);
  for(const v of (d.realPartIds || [])){
    if(!ids.has(v)) fail(`realPartIds → 未知部件 "${v}"`);
  }
  for(const v of (d.xrayShellIds || [])){
    if(!ids.has(v)) fail(`xrayShellIds → 未知部件 "${v}"`);
  }
  for(const v of (d.tour || [])){
    if(!ids.has(v)) warn(`tour → 未知部件 "${v}"（导览会静默跳过）`);
  }
  if(d.unmappedTo && !ids.has(d.unmappedTo)){
    fail(`unmappedTo → 未知部件 "${d.unmappedTo}"（未映射网格会落到不存在的部件）`);
  }
  for(const key of ['labelOffsets']){
    for(const k of Object.keys(d[key] || {})){
      if(!ids.has(k)) warn(`${key}["${k}"] → 未在 parts 中声明（锚点不生效）`);
    }
  }

  /* real 部件必须有模型来源（GLB 映射或显式声明） */
  for(const p of d.parts){
    if(p.real && !d.glb) warn(`部件 "${p.id}" 标记 real:true 但设备无 GLB`);
  }

  if(d.glb){
    const abs = path.join(ROOT, 'public', d.glb.replace(/^\/+/, ''));
    if(!fs.existsSync(abs)) fail(`GLB 缺失: ${d.glb}`);
    else{
      const idFromFile = path.basename(d.glb, '.glb');
      if(idFromFile !== d.id) warn(`GLB 文件名 "${idFromFile}.glb" 与设备 id "${d.id}" 不一致（需在注册处注明例外）`);
    }
  }

  /* 社区模型署名必须落实到作者与许可证；Sketchfab 来源必须给出模型主页链接 */
  const credit = d.modelCredit || '';
  const isCommunity = /社区|Sketchfab|Poly Haven/i.test(credit) || /社区/i.test(d.source || '');
  if(isCommunity){
    if(!credit) fail('社区模型缺少 modelCredit');
    else if(/by community/i.test(credit)) fail('modelCredit 仍是泛化署名 "by community"（必须写明作者与许可证）');
    if(/Sketchfab/i.test(credit) && !/^https:\/\/(sketchfab\.com|www\.sketchfab\.com)\//.test(d.modelSource || ''))
      fail('Sketchfab 模型缺少 modelSource（sketchfab.com 模型主页链接）');
    if(/NASA/i.test(credit) && !/^https:\/\/(science\.nasa\.gov|www\.nasa\.gov)\//.test(d.modelSource || ''))
      fail('NASA 模型缺少 modelSource（science.nasa.gov 资源页链接）');
    if(d.modelSource && !/^https:\/\//.test(d.modelSource)) fail('modelSource 必须是 https:// 链接');
  }

  if(!badCount && !warnCount) console.log('  ✓ 通过');
}

console.log('');
if(badCount || warnCount){
  console.log(`结果：${badCount} 个错误，${warnCount} 个警告（共 ${devices.length} 台）`);
  process.exit(badCount ? 1 : 0);
}
console.log(`✓ 全部 ${devices.length} 台设备校验通过`);
