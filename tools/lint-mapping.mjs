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
  console.log(`${d.id} · ${d.name}${d.unlisted ? '（筹备中 · 未入馆）' : ''}`);
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

  /* 馆内展品不得带脚手架占位文案（unlisted 的筹备中设备例外）——AGENTS §1 真实性约束 */
  if(!d.unlisted){
    const todoFields = [];
    if(/TODO/.test(d.tagline || '')) todoFields.push('tagline');
    if(/TODO/.test(d.description || '')) todoFields.push('description');
    for(const p of d.parts) if(/TODO/.test(p.desc || '')) todoFields.push(`parts[${p.id}].desc`);
    if(todoFields.length) fail(`已入馆展品仍含 TODO 占位文案：${[...new Set(todoFields)].slice(0, 5).join(', ')}`);
  }
  for(const v of (d.xrayShellIds || [])){
    if(!ids.has(v)) fail(`xrayShellIds → 未知部件 "${v}"`);
  }
  for(const v of (d.tour || [])){
    /* tour 兼容两种形态：字符串 id / 对象 { id, note }（引擎 Phase 6 起） */
    const tid = (typeof v === 'object' && v !== null) ? v.id : v;
    if(!ids.has(tid)) warn(`tour → 未知部件 "${tid}"（导览会静默跳过）`);
  }
  if(d.assembleStep !== undefined){
    if(!Array.isArray(d.assembleStep) || !d.assembleStep.length){
      fail('assembleStep → 必须是非空数组（每项为一组部件 id 数组）');
    }else{
      const seen = new Set();
      d.assembleStep.forEach((g, gi) => {
        if(!Array.isArray(g) || !g.length){ fail(`assembleStep[${gi}] → 必须是非空部件 id 数组`); return; }
        for(const v of g){
          if(!ids.has(v)) fail(`assembleStep[${gi}] → 未知部件 "${v}"`);
          if(seen.has(v)) fail(`assembleStep[${gi}] → 部件 "${v}" 重复出现在多组（引擎按首次出现装配）`);
          seen.add(v);
        }
      });
    }
  }
  if(d.unmappedTo && !ids.has(d.unmappedTo)){
    fail(`unmappedTo → 未知部件 "${d.unmappedTo}"（未映射网格会落到不存在的部件）`);
  }
  if(d.era !== undefined && d.era !== null){
    const ok = (typeof d.era === 'number' && d.era >= 1400 && d.era <= 2030)
      || (typeof d.era === 'string' && /^\d{3}0s$/.test(d.era));
    if(!ok) fail(`era → 必须是 1400–2030 的年份数字或形如 "1950s" 的年代串，当前：${JSON.stringify(d.era)}`);
  }
  /* 展品质量分级（通宵迭代 Phase 2，口径见 docs/AUDIT-3D-AUTHENTICITY.md）：
     A=结构/比例/材质/屏幕均核过可作标准展品；B=外观可信部分待核；C=仅概念展示（不得配拆解讲解）；D=隐藏修复中。
     仅允许写入实际核验过的等级——宁缺勿滥，未分级即"待核"。 */
  if(d.quality !== undefined){
    if(!['A','B','C','D'].includes(d.quality)){
      fail(`quality → 只允许 A/B/C/D，当前：${JSON.stringify(d.quality)}`);
    }
    if(d.quality === 'D'){
      warn(`quality=D → ${d.id} 处于隐藏/修复态，应从 tour/默认展示中摘除问题部件`);
    }
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

  /* 来源判定必须独立于自述文本（审计 P1-8）：
     旧逻辑用 modelCredit 里是否出现 "Sketchfab/社区" 来决定要不要署名 —— 自证循环，
     完全不写 credit 的第三方模型可以静默通过。现以 modelSource 域名 + 显式 distribution 标记判定。 */
  const credit = d.modelCredit || '';
  const srcHost = (() => { try { return new URL(d.modelSource).host.replace(/^www\./, ''); } catch { return null; } })();
  const DIST = ['local-demo-only'];                       // 官方 AR 等"仅本机演示、不再分发"标记
  if(/by community/i.test(credit)) fail('modelCredit 是泛化署名 "by community"（必须写明作者与许可证）');
  if(d.modelSource && !/^https:\/\//.test(d.modelSource)) fail('modelSource 必须是 https:// 链接');
  if(d.distribution && !DIST.includes(d.distribution))
    fail(`distribution "${d.distribution}" 非法（可用值：${DIST.join(' | ')}）`);
  if(d.glb){
    if(srcHost && ['sketchfab.com', 'polyhaven.com', 'thangs.com', 'cults3d.com'].includes(srcHost)){
      if(!credit) fail(`${srcHost} 来源模型缺少 modelCredit（作者 + 许可证）`);
      if(!/CC-BY|CC0|Public Domain|公有领域|Free Standard|GPL|许可证|license/i.test(credit) && !/NASA/i.test(credit))
        fail(`${srcHost} 来源 modelCredit 未写明许可证（例：CC-BY 4.0 / CC0 / NASA 公有领域）`);
    } else if(/NASA/i.test(credit) && srcHost !== 'science.nasa.gov' && srcHost !== 'nasa.gov'){
      fail('NASA 模型缺少 science.nasa.gov / nasa.gov 的 modelSource 直链');
    } else if(!credit && !d.distribution){
      fail('有 GLB 资产但既无 modelCredit，也未标 distribution: "local-demo-only"（官方 AR 转制等不再分发资产必须显式标记）');
    }
  }

  if(!badCount && !warnCount) console.log('  ✓ 通过');
}

console.log('');
if(badCount || warnCount){
  console.log(`结果：${badCount} 个错误，${warnCount} 个警告（共 ${devices.length} 台）`);
  const withEra = devices.filter(d => d.era != null).length;
  const listed = devices.filter(d => !d.unlisted);
  console.log(`  · era 覆盖 ${withEra}/${devices.length} 台（数字档案字段，逐台查证后补齐）`);
  if(listed.length !== devices.length)
    console.log(`  · 在馆 ${listed.length} 台 · 筹备中未入馆 ${devices.length - listed.length} 台（${devices.filter(d => d.unlisted).map(d => d.id).join(', ')}）`);
  process.exit(badCount ? 1 : 0);
}
{
  const withEra = devices.filter(d => d.era != null).length;
  console.log(`  · era 覆盖 ${withEra}/${devices.length} 台`);
}
console.log(`✓ 全部 ${devices.length} 台设备校验通过`);
