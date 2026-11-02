/* V4.0 MI⑤ 模型质量诊断（任务书 §8）：五类检查（结构/坐标/几何/运动/展示）×
   四级分级（ERROR/WARNING/INFO/UNVERIFIED）。纯函数：输入由引擎包装器供给，
   输出 findings[{level,cat,obj,text}]。低评分不等于授权自动修改（§8.3）——
   本模块只诊断不修复；修复必须走备份+副本+回滚流程。 */

import * as THREE from 'three';
import { validateMech } from './mech.js';

export function analyseModel({ device, parts, partsById, hullCenter, hullRadius, faces, robustBottom, rawBottom }) {
  const F = [];
  const add = (level, cat, obj, text) => F.push({ level, cat, obj, text });
  const partIdOf = (p) => p.data.id;

  /* —— 结构：ID 重复 / 关系引用失效 —— */
  const seen = new Set(); let dup = 0;
  for (const p of parts) { if (seen.has(partIdOf(p))) dup++; seen.add(partIdOf(p)); }
  if (dup) add('ERROR', '结构', 'parts', `${dup} 个零件 ID 重复（选择/拆解映射会错乱）`);
  if (device.mech) {
    const v = validateMech(device);
    if (!v.ok) add('ERROR', '结构', 'mech', `关系校验失败：${v.errors[0]}`);
  }

  /* —— 坐标：NaN/Infinity（变换有效性）—— */
  let nan = 0, empty = [];
  for (const p of parts) {
    const g = p.group || p.mesh;
    if (!g) { empty.push(partIdOf(p)); continue; }
    const b = new THREE.Box3().setFromObject(g);
    if (!isFinite(b.min.x) || !isFinite(b.max.y) || b.isEmpty()) { nan++; empty.push(partIdOf(p)); }
  }
  if (nan) add('ERROR', '坐标', 'parts', `${nan} 个部件世界变换含 NaN/Infinity`);
  if (empty.length) add('WARNING', '几何', 'parts', `${empty.length} 个部件无有效几何：${empty.slice(0, 3).join('、')}${empty.length > 3 ? ' 等' : ''}`);

  /* —— 几何：杂点网格（raw 底与稳健底分歧过大 = bbox 被少数离群网格污染）—— */
  if (Number.isFinite(rawBottom) && Number.isFinite(robustBottom) && rawBottom < robustBottom - 1.5) {
    add('WARNING', '几何', 'mesh', `包围盒底（${rawBottom.toFixed(1)}）远低于稳健下沿（${robustBottom.toFixed(1)}）——存在远处杂点网格，已由接地钳制兜底`);
  }
  if (Number.isFinite(hullRadius) && hullRadius > 16) {
    add('WARNING', '几何', 'mesh', `hull 半径 ${hullRadius.toFixed(1)} 异常偏大（取景/展台缩放被撑大）`);
  }
  if (faces > 2000000) add('INFO', '几何', 'mesh', `三角面约 ${(faces / 1e6).toFixed(1)}M 偏高（低端设备帧率风险）`);

  /* —— 运动：演示引用失效 / 无拆解位移 —— */
  for (const d of device.demos || []) {
    if (!partsById[d.partId]) add('ERROR', '运动', 'demos', `演示引用失效：${d.partId}`);
    for (const c of d.also || []) if (!partsById[c.partId]) add('ERROR', '运动', 'demos', `伴随演示引用失效：${c.partId}`);
  }
  const moving = (device.parts || []).filter(p => p.offset && p.offset.some(v => Math.abs(v) > 0.01)).length;
  if (parts.length >= 4 && moving === 0) add('WARNING', '运动', 'explode', '全部零件拆解偏移为零（爆炸拆解将无位移）');

  /* —— 展示：接地合理性（展台过高=极小模型或杂点；落地式=隐没属预期）—— */
  if (Number.isFinite(robustBottom)) {
    const gap = robustBottom - (-3.9);
    if (gap > 4.5) add('WARNING', '展示', 'plinth', `展台高 ${gap.toFixed(1)}u——模型底面远高于地面（极小模型或归一化问题）`);
  }
  if (hullCenter && Number.isFinite(hullCenter.y) && Math.abs(hullCenter.y) > 6) {
    add('INFO', '展示', 'center', `模型中心 y=${hullCenter.y.toFixed(1)} 偏离取景目标（相机目标固定 0.4）`);
  }

  const counts = { ERROR: 0, WARNING: 0, INFO: 0 };
  for (const f of F) counts[f.level]++;
  return { findings: F, counts };
}
