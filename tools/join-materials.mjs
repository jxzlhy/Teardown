#!/usr/bin/env node
/* =============================================================
   GLB 网格合并基建：按世界坐标剥副本 + 按材质 join 降 draw call
   用法：
     node tools/join-materials.mjs <in.glb> <out.glb> \
       [--strip-min-x N | --strip-max-x N] [--join-mat 名称]...
   - --strip-min-x N：剔除世界包围盒中心 x > N 的节点（副本剥离，反向用 max-x）
   - --join-mat 名称：把使用该材质的全部 primitive 合并成一个 mesh（网孔/格栅类
     海量小网格的 draw call 治理；合并件命名 JOINED_<材质名>）
   依赖：GLTFT_NM 环境变量指向含 @gltf-transform 的 node_modules（同 strip-nodes）
============================================================= */
import fs from 'node:fs';
import { pathToFileURL } from 'node:url';

const nm = process.env.GLTFT_NM;
const imp = (pkg) => import(nm ? pathToFileURL(`${nm}/${pkg}/dist/index.cjs`).href : pkg);
const { NodeIO } = await imp('@gltf-transform/core');
const { joinPrimitives, prune } = await imp('@gltf-transform/functions');

const [, , input, output, ...rest] = process.argv;
if (!input || !output) {
  console.error('用法: node tools/join-materials.mjs <in.glb> <out.glb> [--strip-min-x N|--strip-max-x N] [--join-mat 名称]...');
  process.exit(1);
}
const args = rest.slice();
const opt = { stripMinX: null, stripMaxX: null, joinMats: [] };
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--strip-min-x') opt.stripMinX = Number(args[++i]);
  else if (args[i] === '--strip-max-x') opt.stripMaxX = Number(args[++i]);
  else if (args[i] === '--join-mat') opt.joinMats.push(args[++i]);
}

const io = new NodeIO();
const doc = await io.read(input);
const root = doc.getRoot();
const all = root.listNodes();

/* —— 世界包围盒中心：自建父链世界矩阵（CJS 互操作下 getParent 可能缺失） —— */
const parentOf = new Map();
for (const p of all) for (const c of (p.listChildren ? p.listChildren() : [])) parentOf.set(c, p);
const _m = doc.getGraph() ? null : null; // noop 防御
function worldCenter(node) {
  let m = null;
  let cur = node;
  while (cur) {
    const lm = cur.getMatrix ? cur.getMatrix() : null;
    if (lm) m = m ? mul(m, lm) : lm.slice();
    cur = parentOf.get(cur);
  }
  const mesh = node.getMesh();
  if (!mesh) return null;
  let cx = 0, cy = 0, cz = 0, n = 0;
  for (const prim of mesh.listPrimitives()) {
    const pos = prim.getAttribute('POSITION');
    if (!pos) continue;
    /* CJS 互操作下 Accessor.getMin/Max 内部缓存失效：手动从数组求 min/max */
    const arr = pos.getArray();
    const es = pos.getElementSize() || 3;
    const count = arr.length / es;
    if (!count) continue;
    let mx = Infinity, my = Infinity, mz = Infinity, Mx = -Infinity, My = -Infinity, Mz = -Infinity;
    for (let i = 0; i < count; i++) {
      const x = arr[i * es], y = arr[i * es + 1], z = arr[i * es + 2];
      if (x < mx) mx = x; if (y < my) my = y; if (z < mz) mz = z;
      if (x > Mx) Mx = x; if (y > My) My = y; if (z > Mz) Mz = z;
    }
    cx += (mx + Mx) / 2; cy += (my + My) / 2; cz += (mz + Mz) / 2; n++;
  }
  if (!n) return null;
  const p = applyM(m, [cx / n, cy / n, cz / n]);
  return p;
}
function mul(a, b) { // 列主序 4x4：a*b
  const o = new Array(16).fill(0);
  for (let c = 0; c < 4; c++) for (let r = 0; r < 4; r++)
    o[c * 4 + r] = a[r] * b[c * 4] + a[4 + r] * b[c * 4 + 1] + a[8 + r] * b[c * 4 + 2] + a[12 + r] * b[c * 4 + 3];
  return o;
}
function applyM(m, v) {
  const x = v[0], y = v[1], z = v[2];
  return [m[0] * x + m[4] * y + m[8] * z + m[12], m[1] * x + m[5] * y + m[9] * z + m[13], m[2] * x + m[6] * y + m[10] * z + m[14]];
}

/* —— 副本剥离 —— */
if (opt.stripMinX !== null || opt.stripMaxX !== null) {
  let removed = 0, meshN = 0, centerN = 0;
  const scenes = root.listScenes();
  for (const node of all) {
    const mesh = node.getMesh();
    if (!mesh) continue;
    meshN++;
    const c = worldCenter(node);
    if (!c) continue;
    centerN++;
    const hit = (opt.stripMinX !== null && c[0] > opt.stripMinX) || (opt.stripMaxX !== null && c[0] < opt.stripMaxX);
    if (!hit) continue;
    const parent = parentOf.get(node) || scenes.find((s) => (s.listChildren ? s.listChildren() : []).includes(node));
    if (parent && parent.removeChild) parent.removeChild(node);
    node.dispose();
    removed++;
  }
  console.log(`strip: meshN=${meshN} centerN=${centerN} 剔除 ${removed} 个节点`);
}

/* —— 按材质 join —— */
if (opt.joinMats.length) {
  const matName = (mat) => (mat && mat.getName) ? mat.getName() : '';
  for (const target of opt.joinMats) {
    const prims = [];
    let nodeCount = 0;
    for (const node of root.listNodes()) {
      const mesh = node.getMesh();
      if (!mesh) continue;
      const match = mesh.listPrimitives().some((p) => matName(p.getMaterial()) === target);
      if (!match) continue;
      nodeCount++;
      for (const p of mesh.listPrimitives()) if (matName(p.getMaterial()) === target) prims.push(p);
    }
    if (!prims.length) { console.log(`join '${target}': 无匹配 primitive，跳过`); continue; }
    const joined = joinPrimitives(prims);
    const mesh = doc.createMesh(`JOINED_${target}`);
    mesh.addPrimitive(joined);
    const node = doc.createNode(`JOINED_${target}`);
    node.setMesh(mesh);
    root.listScenes()[0].addChild(node);
    /* 释放旧载体：先摘 Mesh 再 dispose 节点 */
    for (const node2 of [...root.listNodes()]) {
      const m2 = node2.getMesh();
      if (!m2 || !m2.listPrimitives().some((p) => prims.includes(p))) continue;
      const parent = parentOf.get(node2) || root.listScenes().find((s) => (s.listChildren ? s.listChildren() : []).includes(node2));
      if (parent && parent.removeChild) parent.removeChild(node2);
      node2.dispose();
    }
    console.log(`join '${target}': ${nodeCount} 节点 ${prims.length} primitive → 1 mesh`);
  }
}

await doc.transform(prune());
fs.writeFileSync(output, await io.writeBinary(doc));
console.log(`✓ ${input} → ${output}`);
