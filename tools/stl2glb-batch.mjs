#!/usr/bin/env node
/* =============================================================
   多分件（二进制/ASCII STL、3MF）→ 单 GLB（每件一个命名 node）
   用途：开源 3D 打印机构类资产（如 Laimer 陀飞轮怀表 54 分件）
   ——分件保留装配位姿，合并后按文件名/对象名命名节点，供 mappingPrefix 归组
   支持格式：二进制 STL、ASCII STL、3MF（ZIP 内 3D/3dmodel.model，
   解析 object/mesh 顶点三角与 build.item 变换；仅覆盖几何子集）
   usage: node tools/stl2glb-batch.mjs <out.glb> [--up] <part1.stl|part.3mf> [...]
   （节点名取文件名去尾号；3MF 取 object name 或文件名-序号）
============================================================= */
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

const [, , outArg, ...rest] = process.argv;
const upY = rest.includes('--up');            // 输入为 Z-up（打印姿态）时换到 three.js 的 Y-up
const inputs = rest.filter((a) => a !== '--up');
if (!outArg || inputs.length === 0) {
  console.error('usage: stl2glb-batch.mjs <out.glb> [--up] <part1.stl|part.3mf> [...]');
  process.exit(1);
}

const nodeNameOf = (file) => {
  const base = path.basename(file).replace(/\.(stl|3mf)$/i, '');
  return base.replace(/_1_1$/i, '') || base;
};

/* ---------- ZIP 最小读取器（3MF 容器） ---------- */
function zipEntries(buf) {
  // 从尾部扫 EOCD
  let eocd = -1;
  for (let i = buf.length - 22; i >= Math.max(0, buf.length - 66000); i--) {
    if (buf.readUInt32LE(i) === 0x06054b50) { eocd = i; break; }
  }
  if (eocd < 0) throw new Error('ZIP: EOCD 未找到');
  const count = buf.readUInt16LE(eocd + 10);
  let off = buf.readUInt32LE(eocd + 16);
  const entries = new Map();
  for (let i = 0; i < count; i++) {
    if (buf.readUInt32LE(off) !== 0x02014b50) throw new Error('ZIP: 中央目录损坏');
    const method = buf.readUInt16LE(off + 10);
    const csize = buf.readUInt32LE(off + 20);
    const nameLen = buf.readUInt16LE(off + 28);
    const extraLen = buf.readUInt16LE(off + 30);
    const cmtLen = buf.readUInt16LE(off + 32);
    const lho = buf.readUInt32LE(off + 42);
    const name = buf.slice(off + 46, off + 46 + nameLen).toString('utf8');
    entries.set(name, { method, csize, lho });
    off += 46 + nameLen + extraLen + cmtLen;
  }
  for (const [name, e] of entries) {
    const lnLen = buf.readUInt16LE(e.lho + 26);
    const leLen = buf.readUInt16LE(e.lho + 28);
    const dataStart = e.lho + 30 + lnLen + leLen;
    const raw = buf.slice(dataStart, dataStart + e.csize);
    e.data = e.method === 0 ? raw : zlib.inflateRawSync(raw);
  }
  return entries;
}

/* ---------- 3MF（几何子集）：object/mesh + build.item 变换 ---------- */
function read3mf(file) {
  const buf = fs.readFileSync(file);
  const entries = zipEntries(buf);
  const modelKey = [...entries.keys()].find(k => /^3d\/3dmodel\.model$/i.test(k))
    || [...entries.keys()].find(k => /\.model$/i.test(k));
  if (!modelKey) throw new Error(`${file}: 3MF 中无 3dmodel.model`);
  const xml = entries.get(modelKey).data.toString('utf8');

  const objects = new Map();
  for (const m of xml.matchAll(/<object\b([^>]*)>([\s\S]*?)<\/object>/g)) {
    const attrs = m[1];
    const id = (attrs.match(/\bid="([^"]+)"/) || [])[1];
    const objName = (attrs.match(/\bname="([^"]*)"/) || [])[1];
    if (!id) continue;
    const body = m[2];
    if (!/<mesh>/i.test(body)) continue;
    const verts = [];
    const vBlock = body.match(/<vertices>([\s\S]*?)<\/vertices>/i);
    if (vBlock) {
      for (const v of vBlock[1].matchAll(/<vertex\b[^>]*?x="([-\d.eE+]+)"[^>]*?y="([-\d.eE+]+)"[^>]*?z="([-\d.eE+]+)"/g)) {
        verts.push([+v[1], +v[2], +v[3]]);
      }
    }
    const tris = [];
    const tBlock = body.match(/<triangles>([\s\S]*?)<\/triangles>/i);
    if (tBlock) {
      for (const t of tBlock[1].matchAll(/<triangle\b[^>]*?v1="(\d+)"[^>]*?v2="(\d+)"[^>]*?v3="(\d+)"/g)) {
        tris.push([+t[1], +t[2], +t[3]]);
      }
    }
    if (verts.length && tris.length) objects.set(id, { name: objName || ('object_' + id), verts, tris });
  }
  if (!objects.size) throw new Error(`${file}: 3MF 无可用网格`);

  /* build.item 变换（3MF 行主序 4x3：[x y z 1]·M）；无 build 则按 id 顺序全部输出 */
  const items = [...xml.matchAll(/<item\b([^>]*)\/?>/g)]
    .map(it => {
      const attrs = it[1];
      const oid = (attrs.match(/\bobjectid="([^"]+)"/) || [])[1];
      const tfAttr = (attrs.match(/\btransform="([^"]*)"/) || [])[1];
      return { oid, tf: tfAttr ? tfAttr.trim().split(/\s+/).map(Number) : null };
    })
    .filter(it => it.oid);
  const seq = items.length ? items : [...objects.keys()].map(oid => ({ oid, tf: null }));

  const out = [];
  let idx = 0;
  for (const { oid, tf } of seq) {
    const o = objects.get(oid);
    if (!o) continue;
    idx++;
    const positions = [];
    const indices = [];
    const vmap = new Map();
    let skipped = 0;
    const mat = tf && tf.length >= 12 ? tf : null;
    const apply = (p) => {
      let [x, y, z] = p;
      if (mat) {
        const nx = mat[0] * x + mat[1] * y + mat[2] * z + mat[9];
        const ny = mat[3] * x + mat[4] * y + mat[5] * z + mat[10];
        const nz = mat[6] * x + mat[7] * y + mat[8] * z + mat[11];
        x = nx; y = ny; z = nz;
      }
      if (upY) { const ny = z, nz = -y; y = ny; z = nz; }
      return [x, y, z];
    };
    for (const t of o.tris) {
      const tri = [];
      for (const vi of t) {
        const p = o.verts[vi];
        if (!p) { tri.length = 0; break; }
        const [x, y, z] = apply(p);
        const key = `${x.toFixed(5)},${y.toFixed(5)},${z.toFixed(5)}`;
        let k = vmap.get(key);
        if (k === undefined) { k = positions.length / 3; vmap.set(key, k); positions.push(x, y, z); }
        tri.push(k);
      }
      if (tri.length !== 3 || tri[0] === tri[1] || tri[1] === tri[2] || tri[0] === tri[2]) { skipped++; continue; }
      indices.push(...tri);
    }
    if (!indices.length) continue;
    out.push({ name: `${nodeNameOf(file)}_${idx}_${o.name}`.slice(0, 48), positions, indices, skipped });
  }
  if (!out.length) throw new Error(`${file}: 3MF build 后无有效几何`);
  return out;
}

function readAsciiStl(file) {
  const text = fs.readFileSync(file, 'utf8');
  const verts = [];
  for (const m of text.matchAll(/vertex\s+([-\d.eE+]+)\s+([-\d.eE+]+)\s+([-\d.eE+]+)/g)) {
    verts.push([+m[1], +m[2], +m[3]]);
  }
  if (verts.length < 3 || verts.length % 3 !== 0) throw new Error(`${file}: ASCII STL 顶点异常`);
  const positions = [];
  const indices = [];
  const vmap = new Map();
  let skipped = 0;
  for (let t = 0; t < verts.length; t += 3) {
    const idx = [];
    for (const [x0, y0, z0] of verts.slice(t, t + 3)) {
      let x = x0, y = y0, z = z0;
      if (upY) { const ny = z, nz = -y; y = ny; z = nz; }
      const key = `${x.toFixed(5)},${y.toFixed(5)},${z.toFixed(5)}`;
      let vi = vmap.get(key);
      if (vi === undefined) { vi = positions.length / 3; vmap.set(key, vi); positions.push(x, y, z); }
      idx.push(vi);
    }
    if (idx[0] === idx[1] || idx[1] === idx[2] || idx[0] === idx[2]) { skipped++; continue; }
    indices.push(...idx);
  }
  return { name: nodeNameOf(file), positions, indices, skipped };
}

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

function readAny(file) {
  if (/\.3mf$/i.test(file)) return read3mf(file);
  try {
    return [readBinaryStl(file)];
  } catch (e) {
    if (/ASCII/.test(e.message)) return [readAsciiStl(file)];
    throw e;
  }
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
function addPart({ name, positions, indices, skipped }) {
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
for (const file of inputs) {
  for (const part of readAny(file)) addPart(part);
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
console.log('MERGED %d parts -> %s tris=%d skipped=%d size=%sMB', nodes.length, outArg, totalTris, totalSkipped, (out.length / 1e6).toFixed(1));
