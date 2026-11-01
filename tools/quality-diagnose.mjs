#!/usr/bin/env node
/* =============================================================
   模型质量诊断（V2 第八章）：全量设备体检 → docs/QUALITY_DIAGNOSIS.md
   检查维度：GLB 存在/draco/体积、署名与来源、era、tour、xrayShellIds、
   demos、屏幕策略注释、quality 分级、部件数与映射风险（零网格部件需运行时查）
   追溯约定（8.4）：原始模型在 vendor/assets/originals/，修改记录在
   AUTONOMOUS_LOG.md + git log，回滚 = git checkout <commit> -- <file>。
============================================================= */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { installDomShim } from './lib-node-shim.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
installDomShim();   // 设备配置链路会触达 document（materials.js 等），Node 侧需垫片

const ASSETS = path.join(ROOT, 'public/assets');
const OUT_MD = path.join(ROOT, 'docs/QUALITY_DIAGNOSIS.md');

const { devices } = await import(pathToFileURL(path.join(ROOT, 'src/devices/registry.js')).href);

function hasDraco(p){
  /* extensionsUsed 在 GLB 的 JSON chunk（chunk 0，位于 bin 之前），首 256KB 必含 */
  const fd = fs.openSync(p, 'r');
  const buf = Buffer.alloc(1048576);
  const n = fs.readSync(fd, buf, 0, 1048576, 0);
  fs.closeSync(fd);
  return buf.subarray(0, n).includes('KHR_draco_mesh_compression');
}
function kb(p){ return Math.round(fs.statSync(p).size / 102.4) / 10; }

const rows = [];
const issues = [];
for(const d of devices){
  const id = d.id;
  const glbPath = d.glb ? path.join(ROOT, 'public', d.glb.replace(/^\//, '')) : null;
  const glbOk = glbPath && fs.existsSync(glbPath);
  const draco = glbOk && hasDraco(glbPath);
  const size = glbOk ? kb(glbPath) : 0;
  const credit = d.modelCredit || '';
  /* 官方模型（无 modelCredit）与社区模型（credit 必填）分级检查，口径同 lint-mapping */
  const isCommunity = !!credit;
  const creditOk = isCommunity ? (!!credit && !/by community/i.test(credit)) : true;
  const sourceOk = isCommunity ? (!/Sketchfab/i.test(credit) || !!d.modelSource) : true;
  const nc = /CC-BY-NC/.test(credit);
  const quality = d.quality || null;
  const tourOk = Array.isArray(d.tour) && d.tour.length > 0;
  const xrayOk = Array.isArray(d.xrayShellIds) && d.xrayShellIds.length > 0;
  const partsN = (d.parts || []).length;
  const partsNoDesc = (d.parts || []).filter(p => !p.desc || p.desc.length < 10).map(p => p.id);
  /* switch-2 已知例外：模块文件 switch2.js ↔ id 'switch-2'（add-device SOP 注明） */
    const srcCandidates = [path.join(ROOT, 'src/devices', id + '.js'), path.join(ROOT, 'src/devices', id.replace(/-/g, '') + '.js')];
    const srcPath = srcCandidates.find(c => fs.existsSync(c));
    const srcCode = srcPath ? fs.readFileSync(srcPath, 'utf8') : '';
    const hasScreen = /makePhoneScreen\(|addLiveScreen\(/.test(srcCode);   // 仅实际调用算挂屏（空解构不算）
    const screenPolicy = hasScreen ? (/screen:\s*(native|painted)/.test(srcCode) ? '✓' : '✗ 未标注') : '—';

  const row = {
    id, quality: quality || '待核', glb: glbOk ? `${size} KB` : '缺失',
    draco: draco ? '✓' : (glbOk ? '✗' : '—'),
    credit: creditOk ? '✓' : '✗', source: sourceOk ? '✓' : '✗',
    nc: nc ? 'NC' : '', tour: tourOk ? (d.tour.length) : '✗',
    xray: xrayOk ? '✓' : '—', parts: partsN, screen: screenPolicy ? '✓' : '未标注',
  };
  rows.push(row);

  const dev = [];
  if(!glbOk) dev.push(`GLB 缺失（${d.glb}）`);
  else if(!draco) dev.push('GLB 未走 draco 压缩');
  if(!creditOk) dev.push('署名缺失或仍是 "by community"');
  if(!sourceOk) dev.push('Sketchfab 模型缺 modelSource');
  if(!tourOk) dev.push('无策展 tour（回退兜底可用，建议补）');
  if(!xrayOk) dev.push('无 xrayShellIds（X-Ray 走 realPartIds 兜底）');
  if(partsNoDesc.length) dev.push(`部件缺 desc: ${partsNoDesc.join(', ')}`);
  if(screenPolicy === '✗ 未标注') dev.push('挂屏设备缺 screen: native|painted 策略注释（V2 约定）');
  if(quality === 'D') dev.push('quality=D：处于隐藏/修复态');
  if(dev.length) issues.push({ id, items: dev });
}

/* 报告生成 */
const now = new Date().toLocaleString();
const grade = q => ({ A: '🟢', B: '🟡', C: '🟠', D: '🔴' }[q] || '⚪');
let md = `# QUALITY DIAGNOSIS · 模型质量诊断报告

> 生成：${now} · 工具：\`tools/quality-diagnose.mjs\`（运行 \`node tools/quality-diagnose.mjs\` 重新生成，勿手改本报告数据表）。
> 依据：V2 权威任务书第八章。诊断只报告事实，不自动修改模型（8.1：用户低分 ≠ 直接改模型）。
> 追溯（8.4）：原始模型 \`vendor/assets/originals/\` · 修改记录 \`AUTONOMOUS_LOG.md\` + git log · 回滚 \`git checkout <commit> -- <file>\`。

## 总览

- 设备总数：**${devices.length}**
- quality 已定级：**${rows.filter(r => r.quality !== '待核').length}** 台（A/B/C/D 口径见 DESIGN_SYSTEM）· 其余待核
- GLB 就绪/压缩：**${rows.filter(r => !r.glb.includes('缺失')).length}/${rows.filter(r => r.draco === '✓').length}**
- 署名合规：**${rows.filter(r => r.credit === '✓').length}** 台 · 来源链接：**${rows.filter(r => r.source === '✓').length}** 台
- NC（非商业）资产：${rows.filter(r => r.nc).length} 台
- 挂屏设备策略注释：${rows.filter(r => r.screen === '✓').length}/${rows.filter(r => r.screen !== '—').length} 台

## 设备明细

| id | 分级 | GLB | draco | 署名 | 来源 | NC | tour | xray | 部件 | 屏幕注 |
|---|---|---|---|---|---|---|---|---|---|---|
${rows.map(r => `| ${r.id} | ${grade(r.quality)} ${r.quality} | ${r.glb} | ${r.draco} | ${r.credit} | ${r.source} | ${r.nc} | ${r.tour} | ${r.xray} | ${r.parts} | ${r.screen} |`).join('\n')}

## 待办问题（${issues.length} 台）

${issues.length ? issues.map(i => `- **${i.id}**：\n${i.items.map(x => `  - ${x}`).join('\n')}`).join('\n') : '（无——全部通过静态诊断）'}

## 运行时专项（需浏览器，见 tools/）

- 装配映射准确性（3.4 零网格/幽灵部件）：\`node tools/mapping-verify.mjs\`
- 屏幕方案取证：\`node tools/screen-audit.mjs\` + \`tools/overlay-ab.mjs\`
- 取景尺度护栏：smoke「m4 取景尺度护栏」断言（hullRadius ∈ [2,30]）
- 帧率观察：\`node tools/fps-probe.mjs\`（软件渲染参考值）

## 用户评分参考（8.1 理念）

用户评分存于本机 localStorage \`dtm.ratings\`，不上传。质量改进参考流程：
1. 收到低分维度（如「内部结构还原度」2 星）→
2. 对照本报告该设备的映射/屏幕/署名事实 →
3. 人工核实参考资料后走 convert-asset SOP 修复 →
4. 记录追溯（原始版本/时间/原因/回滚）于 AUTONOMOUS_LOG。
`;

fs.writeFileSync(OUT_MD, md);
console.log(`✓ QUALITY_DIAGNOSIS.md 已生成：${devices.length} 台 · 问题 ${issues.length} 台`);
for(const i of issues) console.log(`  · ${i.id}: ${i.items[0]}${i.items.length > 1 ? ` (+${i.items.length - 1})` : ''}`);
