#!/usr/bin/env node
/* =============================================================
   自动生成 MODEL_INVENTORY.md（registry.js 是唯一事实来源）
   - 按 brand 分组输出设备表：id / 机型 / 分类 / 部件数 / GLB / 大小
   - 比对 public/assets 实际文件：孤儿 GLB（未注册）与缺失 GLB（已引用无文件）
   用法：npm run gen:inventory
============================================================= */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { installDomShim } from './lib-node-shim.mjs';
import { isCommunityModel } from '../src/lib/model-class.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
installDomShim();

const { devices } = await import(pathToFileURL(path.join(ROOT, 'src/devices/registry.js')).href);

/* ---- 扫描 public/assets 实际文件 ---- */
const glbDir = path.join(ROOT, 'public/assets');
const glbFiles = fs.existsSync(glbDir)
  ? fs.readdirSync(glbDir).filter(f => f.endsWith('.glb'))
  : [];
const fileSize = f => { try{ return fs.statSync(f).size; }catch{ return 0; } };
const fmtSize = n => n >= 1048576 ? (n/1048576).toFixed(1) + ' MB' : Math.max(1, Math.round(n/1024)) + ' KB';

/* ---- 比对 ---- */
const referenced = new Set();
const rows = [];   // { brand, rows: [{id,name,category,parts,glb,size}] }
for(const d of devices){
  const rel = d.glb ? d.glb.replace(/^\/+/, '') : null;      // assets/xxx.glb
  const abs = rel ? path.join(ROOT, 'public', rel) : null;
  const exists = abs && fs.existsSync(abs);
  if(rel) referenced.add(path.basename(rel));
  let brand = rows.find(r => r.brand === (d.brand || 'OTHER'));
  if(!brand){ brand = { brand: d.brand || 'OTHER', items: [] }; rows.push(brand); }
  brand.items.push({
    id: d.id, name: d.name, category: d.category,
    parts: d.parts.length,
    glb: d.glb ? path.basename(d.glb) : '—',
    size: exists ? fileSize(abs) : 0,
    missing: d.glb && !exists,
    credit: !!d.modelCredit,
    source: d.glb ? (isCommunityModel(d) ? '社区' : '官方') : '程序化',
  });
}
const orphans = glbFiles.filter(f => !referenced.has(f));

/* ---- 生成 Markdown ---- */
const now = new Date();
const ts = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
const totalParts = devices.reduce((s, d) => s + d.parts.length, 0);
const officialCount = devices.filter(d => d.glb).length;

let md = `# 已有模型清单（防重复登记表 · 自动生成）

> 生成时间：${ts} · 由 \`tools/gen-inventory.mjs\` 扫描 \`src/devices/registry.js\` + \`public/assets/\` 生成
> **本文件不要手改** —— 改动请跑 \`npm run gen:inventory\` 重新生成。
> 当前：**${devices.length} 台设备** · ${totalParts} 个部件 · ${officialCount} 套 GLB · ${rows.length} 个品牌

## 查重三步（新增前必做）

1. 查本表各品牌板块的机型名；
2. 快速命令确认：
   \`\`\`bash
   ls /Users/admin/Desktop/jxz/DJI/public/assets/ | grep <关键词>
   grep -ri "<关键词>" /Users/admin/Desktop/jxz/DJI/src/devices/registry.js
   \`\`\`
3. 都没有才走新增流程（\`npm run add -- --id <id> --zh <名称> --en <EN> --brand <品牌> --category <分类>\` 生成脚手架 → USDZ/GLB 转换后放 \`public/assets/\` → 补配置 → \`registry.js\` 注册）。

## 命名约定

- GLB 文件名 = 设备 id（kebab-case），如 \`mac-studio.glb\` ↔ \`id: 'mac-studio'\`；
- 已知例外：\`switch2.js\` 里 \`id: 'switch-2'\`、\`glb: '/assets/switch-2.glb'\`（文件名带连字符、模块名不带）；
- 源模型统一转好后放 \`public/assets/\`，\`dist/assets/\` 只是构建产物、**不要当参考**；
- 设备配置（\`src/devices/<id>.js\`）新增后跑 \`npm run lint:devices\` 校验映射引用。

`;

for(const g of rows){
  md += `### ${g.brand}（${g.items.length} 台）\n\n`;
  md += `| id | 机型 | 分类 | 部件 | 模型 | GLB | 大小 |\n|---|---|---|---|---|---|---|\n`;
  for(const it of g.items){
    md += `| ${it.id} | ${it.name} | ${it.category} | ${it.parts} | ${it.source} | ${it.glb} | ${it.glb === '—' ? '—' : (it.missing ? '⚠️ 缺失' : fmtSize(it.size))} |\n`;
  }
  md += '\n';
}

if(orphans.length){
  md += `## ⚠️ 孤儿 GLB（public/assets 有文件但 registry 未注册，共 ${orphans.length} 个）\n\n`;
  for(const f of orphans) md += `- ${f}（${fmtSize(fileSize(path.join(glbDir, f)))}）\n`;
  md += '\n';
}
const missing = [];
for(const g of rows) for(const it of g.items) if(it.missing) missing.push(it);
if(missing.length){
  md += `## ⚠️ 缺失 GLB（已注册但文件不存在，共 ${missing.length} 个）\n\n`;
  for(const it of missing) md += `- ${it.id} → /assets/${it.glb}\n`;
  md += '\n';
}

fs.writeFileSync(path.join(ROOT, 'MODEL_INVENTORY.md'), md);
console.log(`✓ MODEL_INVENTORY.md 已生成：${devices.length} 台 · ${totalParts} 部件 · ${officialCount} GLB · ${rows.length} 品牌`);
if(orphans.length) console.log(`⚠ 孤儿 GLB ${orphans.length} 个：` + orphans.join(', '));
if(missing.length) console.log(`⚠ 缺失 GLB ${missing.length} 个：` + missing.map(m => m.id).join(', '));
