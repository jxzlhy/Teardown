#!/usr/bin/env node
/* =============================================================
   多 STL 分件 → 单 GLB（每件一个命名 node）
   用途：开源 3D 打印机构类资产（如 Laimer 陀飞轮怀表 54 分件）
   ——分件 STL 保留装配位姿，合并后按文件名命名节点，供 mappingPrefix 归组
   输入须为二进制 STL（ASCII STL 直接报错退出）
   usage: node tools/stl2glb-batch.mjs <out.glb> <name1.stl> [name2.stl ...]
   （节点名取文件名去掉 .stl 与 _1_1 式尾号）
============================================================= */
import fs from 'node:fs';
import path from 'node:path';

const [, , outArg, ...rest] = process.argv;
const upY = rest.includes('--up');            // STL 为 Z-up（打印姿态）时换到 three.js 的 Y-up
const inputs = rest.filter((a) => a !== '--up');
if (!outArg || inputs.length === 0) {
  console.error('usage: stl2glb-batch.mjs <out.glb> [--up] <part1.stl> [part2.stl ...]');
  process.exit(1);
}

const nodeNameOf = (file) => {
  const base = path.basename(file).replace(/\.stl$/i, '');
  return base.replace(/_1_1$/i, '') || base;
};

function readBinaryStl(file) {
  const buf = fs.readFileSync(file);
  if (buf.length < 84) throw new Error(`${file}: 文件过短`);
  if (buf.slice(0, 5).toString('ascii').toLowerCase() === 'solid') {
    // 二进制 STL 也常以 "solid" 开头，须用三角数校验
    const tri = buf.readUInt32LE(80);
    if (84 + tri * 50 !== buf.length) throw new Error(`${file}: ASCII STL 不支持（请先转二进制）`);
  }
  const tri = buf.readUInt32LE(80);
  if (84 + tri * 50 !== buf.length) throw new Error(`${file}: 长度与三角数不符（tri=${tri}）`);
  const positions = [];
  const indices = [];
  const vmap = new Map();
  let skipped = 0;
  for (let t = 0; t < tri; t++) {
    const off = 84 + t * 50 + 12; // 跳过法线
    const idx = [];
    for (let v = 0; v < 3; v++) {
      let x = buf.readFloatLE(off + v * 12);
      let y = buf.readFloatLE(off + v * 12 + 4);
      let z = buf.readFloatLE(off + v * 12 + 8);
      if (upY) { const ny = z, nz = -y; y = ny; z = nz; }  // Z-up → Y-up（绕 X 轴 +90°）
      const key = `${x.toFixed(5)},${y.toFixed(5)},${z.toFixed(5)}`;
      let vi = vmap.get(key);
      if (vi === undefined) {
        vi = positions.length / 3;
        vmap.set(key, vi);
        positions.push(x, y, z);
      }
      idx.push(vi);
    }
    if (idx[0] === idx[1] || idx[1] === idx[2] || idx[0] === idx[2]) { skipped++; continue; }
    indices.push(...idx);
  }
  return { name: nodeNameOf(file), positions, indices, skipped };
}

/* 法线：面积加权累计（与 cad2glb 同法） */
function computeNormals(positions, indices) {
  const norms = new Float32Array(positions.length);
  for (let i = 0; i < indices.length; i += 3) {
    const a = indices[i] * 3, b = indices[i + 1] * 3, c = indices[i + 2] * 3;
    const ux = positions[b] - positions[a], uy = positions[b + 1] - positions[a + 1], uz = positions[b + 2] - positions[a + 2];
    const vx = positions[c] - positions[a], vy = positions[c + 1] - positions[a + 1], vz = positions[c + 2] - positions[a + 2];
    const nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
    for (const vi of [a, b, c]) { norms[vi] += nx; norms[vi + 1] += ny; norms[vi + 2] += nz; }
  }
  for (let i = 0; i < norms.length; i += 3) {
    const l = Math.hypot(norms[i], norms[i + 1], norms[i + 2]);
    if (l < 1e-9) { norms[i] = 0; norms[i + 1] = 0; norms[i + 2] = 1; }
    else { norms[i] /= l; norms[i + 1] /= l; norms[i + 2] /= l; }
  }
  return norms;
}

const chunks = [];            // 合并的二进制段
const bufferViews = [], accessors = [], meshes = [], nodes = [];
let byteLen = 0;
function pushData(data, target) {
  const pad = (4 - (byteLen % 4)) % 4;
  if (pad) { chunks.push(Buffer.alloc(pad)); byteLen += pad; }
  bufferViews.push({ buffer: 0, byteOffset: byteLen, byteLength: data.length, target });
  chunks.push(data);
  byteLen += data.length;
  return bufferViews.length - 1;
}
function accessorOf(bv, componentType, count, type, minMax) {
  const acc = { bufferView: bv, componentType, count, type };
  if (minMax) { acc.min = minMax.min; acc.max = minMax.max; }
  accessors.push(acc);
  return accessors.length - 1;
}

let totalTris = 0, totalSkipped = 0;
for (const file of inputs) {
  const { name, positions, indices, skipped } = readBinaryStl(file);
  const norm = computeNormals(positions, indices);
  const posBuf = Buffer.from(Float32Array.from(positions).buffer);
  const nrmBuf = Buffer.from(norm.buffer);
  const idxArr = positions.length / 3 > 65535 ? Uint32Array.from(indices) : Uint16Array.from(indices);
  const idxBuf = Buffer.from(idxArr.buffer);

  const min = [Infinity, Infinity, Infinity], max = [-Infinity, -Infinity, -Infinity];
  for (let i = 0; i < positions.length; i += 3) {
    for (let k = 0; k < 3; k++) { min[k] = Math.min(min[k], positions[i + k]); max[k] = Math.max(max[k], positions[i + k]); }
  }
  const posBv = pushData(posBuf, 34962);
  const posAcc = accessorOf(posBv, 5126, positions.length / 3, 'VEC3', { min, max });
  const nrmBv = pushData(nrmBuf, 34962);
  const nrmAcc = accessorOf(nrmBv, 5126, positions.length / 3, 'VEC3');
  const idxBv = pushData(idxBuf, 34963);
  const idxAcc = accessorOf(idxBv, positions.length / 3 > 65535 ? 5125 : 5123, indices.length, 'SCALAR');

  meshes.push({ name: name.slice(0, 48), primitives: [{ attributes: { POSITION: posAcc, NORMAL: nrmAcc }, indices: idxAcc, material: 0 }] });
  nodes.push({ mesh: meshes.length - 1, name: name.slice(0, 48) });
  totalTris += indices.length / 3;
  totalSkipped += skipped;
}

const material = {
  name: 'print_resin',
  pbrMetallicRoughness: { baseColorFactor: [0.62, 0.65, 0.68, 1.0], metallicFactor: 0.15, roughnessFactor: 0.55 },
  doubleSided: true,
};
const glb = {
  asset: { version: '2.0', generator: 'stl2glb-batch.mjs' },
  scene: 0,
  scenes: [{ nodes: nodes.map((_, i) => i) }],
  nodes, meshes,
  materials: [material],
  accessors, bufferViews,
  buffers: [{ byteLength: byteLen }],
};
const jsonBuf = Buffer.from(JSON.stringify(glb), 'utf8');
const jsonPad = (4 - (jsonBuf.length % 4)) % 4;
const binBuf = Buffer.concat(chunks);
const binPad = (4 - (binBuf.length % 4)) % 4;
const total = 12 + 8 + jsonBuf.length + jsonPad + 8 + binBuf.length + binPad;
const out = Buffer.alloc(total);
out.writeUInt32LE(0x46546C67, 0); out.writeUInt32LE(2, 4); out.writeUInt32LE(total, 8);
out.writeUInt32LE(jsonBuf.length + jsonPad, 12); out.writeUInt32LE(0x4E4F534A, 16);
jsonBuf.copy(out, 20); if (jsonPad) out.fill(0x20, 20 + jsonBuf.length, 20 + jsonBuf.length + jsonPad);
const binOff = 20 + jsonBuf.length + jsonPad;
out.writeUInt32LE(binBuf.length + binPad, binOff); out.writeUInt32LE(0x004E4942, binOff + 4);
binBuf.copy(out, binOff + 8); if (binPad) out.fill(0, binOff + 8 + binBuf.length, binOff + 8 + binBuf.length + binPad);
fs.writeFileSync(outArg, out);
console.log('MERGED %d parts -> %s tris=%d skipped=%d size=%.1fMB', nodes.length, outArg, totalTris, totalSkipped, out.length / 1e6);
