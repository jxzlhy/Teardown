#!/usr/bin/env node
/* KHR_materials_pbrSpecularGlossiness → pbrMetallicRoughness（one-off）
   规则：
   - 有 diffuse 贴图 → baseColor 贴图沿用，factor 用 diffuseFactor
   - 无贴图且 diffuse 暗、specular 亮（金属）→ baseColor=specular, metallic=1
   - 其余（电介质）→ baseColor=diffuse, metallic=0
   - roughness = 1 - glossinessFactor
   只改 JSON chunk，二进制 chunk 原样保留。
   用法: node fix-specgloss.mjs in.glb out.glb */
import fs from 'node:fs';

const [, , src, dst] = process.argv;
const buf = fs.readFileSync(src);
const dv = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
if (dv.getUint32(0, true) !== 0x46546C67) throw new Error('not GLB');
let off = 12, json = null, binStart = -1, binLen = 0, bin = null;
const chunks = [];
while (off < buf.byteLength) {
  const len = dv.getUint32(off, true), type = dv.getUint32(off + 4, true);
  const data = buf.slice(off + 8, off + 8 + len);
  if (type === 0x4E4F534A) json = JSON.parse(Buffer.from(data).toString('utf8'));
  else { bin = data; binStart = off; binLen = len; }
  off += 8 + len;
}
if (!json) throw new Error('no JSON chunk');

let conv = 0;
for (const m of json.materials || []) {
  const sg = m.extensions?.KHR_materials_pbrSpecularGlossiness;
  if (!sg) continue;
  const diff = sg.diffuseFactor ?? [1, 1, 1, 1];
  const spec = sg.specularFactor ?? [0.5, 0.5, 0.5];
  const gloss = sg.glossinessFactor ?? 1;
  const lum = 0.2126 * diff[0] + 0.7152 * diff[1] + 0.0722 * diff[2];
  const specLum = 0.2126 * spec[0] + 0.7152 * spec[1] + 0.0722 * spec[2];
  const isMetal = !sg.diffuseTexture && lum < 0.25 && specLum > 0.15;
  const pbr = {};
  if (sg.diffuseTexture) pbr.baseColorTexture = sg.diffuseTexture;
  pbr.baseColorFactor = isMetal ? [...spec, diff[3]] : [...diff];
  pbr.metallicFactor = isMetal ? 1 : 0;
  pbr.roughnessFactor = Math.min(Math.max(1 - gloss, 0.04), 1);
  delete m.extensions.KHR_materials_pbrSpecularGlossiness;
  if (m.extensions && Object.keys(m.extensions).length === 0) delete m.extensions;
  m.pbrMetallicRoughness = pbr;
  conv++;
  console.log(`${m.name}: ${isMetal ? 'METAL' : 'dielectric'} base=[${pbr.baseColorFactor.map(v=>+v.toFixed(2))}] rough=${pbr.roughnessFactor.toFixed(2)}`);
}
if (json.extensionsUsed) {
  json.extensionsUsed = json.extensionsUsed.filter(e => e !== 'KHR_materials_pbrSpecularGlossiness');
  if (!json.extensionsUsed.length) delete json.extensionsUsed;
}
if (json.extensionsRequired) {
  json.extensionsRequired = json.extensionsRequired.filter(e => e !== 'KHR_materials_pbrSpecularGlossiness');
  if (!json.extensionsRequired.length) delete json.extensionsRequired;
}

const jsonBuf = Buffer.from(JSON.stringify(json), 'utf8');
const pad = (n) => (n + 3) & ~3;
const jsonPad = Buffer.alloc(pad(jsonBuf.length) - jsonBuf.length, 0x20);
const jsonChunk = Buffer.concat([jsonBuf, jsonPad]);
const total = 12 + 8 + jsonChunk.length + 8 + bin.length;
const header = Buffer.alloc(12);
header.write('glTF', 0, 'ascii');
header.writeUInt32LE(2, 4);
header.writeUInt32LE(total, 8);
const mkChunk = (type, data) => {
  const b = Buffer.alloc(8);
  b.writeUInt32LE(data.length, 0);
  b.writeUInt32LE(type, 4);
  return Buffer.concat([b, data]);
};
const out = Buffer.concat([
  header,
  mkChunk(0x4E4F534A, jsonChunk),
  mkChunk(0x004E4942, bin),
]);
fs.writeFileSync(dst, out);
console.log(`converted ${conv} materials, wrote ${dst} (${(out.length / 1e6).toFixed(1)}MB)`);
