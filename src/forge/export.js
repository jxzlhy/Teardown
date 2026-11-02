/* 机械锻造所 · GLB 导出适配（V3.0 任务书 §9）
   离屏重建装配组（builders 只依赖 THREE，无需引擎/视图），GLTFExporter 二进制导出。
   限制（如实记录于任务书口径）：引擎 demos 为运行时运动学，不随 GLB 导出动画；
   导出内容 = 层级 + 命名 + 材质 + 装配位姿。文件名含 名称/生成器版本/种子（§9 可复现要求）。 */

import * as THREE from 'three';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';
import { getForgeDevice } from './registry.js';

function validateForExport(dev) {
  const errs = [];
  const ids = new Set();
  for (const pd of dev.parts) {
    if (ids.has(pd.id)) errs.push(`零件 ID 重复：${pd.id}`);
    ids.add(pd.id);
  }
  const pos = Object.values(dev.assembledPos || {});
  for (const p of pos) if (p.some(v => !Number.isFinite(v))) errs.push('装配坐标含非有限值');
  if (!dev.parts.length) errs.push('无零件');
  return errs;
}

export async function exportForgeGLB(id) {
  const dev = getForgeDevice(id);
  if (!dev) throw new Error(`未找到生成物：${id}`);
  const errs = validateForExport(dev);
  if (errs.length) throw new Error('结构检查未通过：' + errs[0]);

  const scene = new THREE.Scene();
  const root = new THREE.Group();
  root.name = dev.id;
  for (const pd of dev.parts) {
    const g = new THREE.Group();
    g.name = pd.id;
    try { (dev.builders[pd.id] || (() => {}))(g); } catch (e) {
      throw new Error(`零件 ${pd.id} 构建失败：${String(e.message || e).slice(0, 60)}`);
    }
    g.position.fromArray(dev.assembledPos[pd.id] || [0, 0, 0]);
    root.add(g);
  }
  scene.add(root);

  const exporter = new GLTFExporter();
  const glb = await exporter.parseAsync(root, { binary: true });
  const blob = new Blob([glb], { type: 'model/gltf-binary' });
  const fname = `${dev.name.replace(/[\\/:*?"<>|\s]+/g, '-')}_${dev.forge.generator}-v${dev.forge.version}_seed-${dev.forge.seed.toString(36)}.glb`;
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fname;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
  return { file: fname, parts: dev.parts.length, bytes: blob.size };
}
