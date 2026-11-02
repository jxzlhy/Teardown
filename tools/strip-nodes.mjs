#!/usr/bin/env node
/* =============================================================
   从 GLB 中剔除指定名称的节点（变体/多余套件清理）
   用法：node tools/strip-nodes.mjs <in.glb> <out.glb> <regex...>
   示例：node tools/strip-nodes.mjs a.glb b.glb '_aged$'
   节点名同时匹配原始名与下划线清洗名；剔除后 prune 孤儿资源。
============================================================= */
import fs from 'node:fs';
import { pathToFileURL } from 'node:url';

/* @gltf-transform 不在项目依赖里（optimize 走 npx 按需缓存）——
   优先从 GLTFT_NM 指向的 node_modules 以 file URL 导入，否则按常规解析 */
const nm = process.env.GLTFT_NM;
const imp = (pkg) => import(nm ? pathToFileURL(`${nm}/${pkg}/dist/index.cjs`).href : pkg);
const { NodeIO } = await imp('@gltf-transform/core');
const { prune } = await imp('@gltf-transform/functions');

const [,, input, output, ...patterns] = process.argv;
if (!input || !output || !patterns.length) {
  console.error('用法: node tools/strip-nodes.mjs <in.glb> <out.glb> <regex...>');
  process.exit(1);
}
const regexes = patterns.map((p) => new RegExp(p));

const io = new NodeIO();
const doc = await io.read(input);
const root = doc.getRoot();

const sanitize = (s) => String(s).replace(/\s+/g, '_').replace(/[^\w-]/g, '');
const all = root.listNodes();
let removed = 0;
for (const node of all) {
  const raw = node.getName() || '';
  if (!regexes.some((re) => re.test(raw) || re.test(sanitize(raw)))) continue;
  /* CJS 互操作下 getParent 可能缺失：扫描全节点 children 反查父节点 */
  const parent = all.find((p) => typeof p.listChildren === 'function' && p.listChildren().includes(node))
    || root.listScenes().find((s) => s.listChildren().includes(node));
  if (parent && typeof parent.removeChild === 'function') parent.removeChild(node);
  node.dispose();
  removed++;
}
await doc.transform(prune());
fs.writeFileSync(output, await io.writeBinary(doc));
console.log(`✓ ${input} → ${output}（剔除 ${removed} 个节点）`);
