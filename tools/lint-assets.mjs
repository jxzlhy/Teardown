#!/usr/bin/env node
/* =============================================================
   在馆 GLB 资产压缩铁律校验（复审 RS-08 的防复发闸门）

   项目自有铁律（写在 tools/optimize-glb.mjs 头部注释）：
     运行时 GLB 必须 **先 webp 后 draco**，顺序不可反。
   但这条规则此前只存在于注释里，没有闸门——2026-11-03 新入馆的
   Apollo 三件因此带着 JPEG 贴图、其中 apollo-hatch 完全没走 DRACO。

   断言（对 public/assets/*.glb）：
     1) 有纹理的文件：所有 image 必须是 image/webp（且声明 EXT_texture_webp）
     2) 所有文件：必须声明 KHR_draco_mesh_compression
     3) 纹理最大边 ≤ 2048（审计 P0-1 的显存上限口径）
   豁免：文件头注释写明 `asset-exempt: <理由>` 的设备配置可跳过（必须写理由）。

   用法：node tools/lint-assets.mjs [--max-texture 2048]
   ============================================================= */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIR = path.join(ROOT, 'public/assets');
const MAX_TEX = Number(process.argv.includes('--max-texture')
  ? process.argv[process.argv.indexOf('--max-texture') + 1] : 2048);

function jpegDims(buf, off, limit) {
  let p = off + 2;
  while (p < limit - 8) {
    if (buf[p] !== 0xff) { p++; continue; }
    let m = buf[p + 1];
    while (m === 0xff && p < limit) { p++; m = buf[p + 1]; }
    if (m === 0xda || m === 0xd9) return [0, 0];          // 熵编码数据开始，停止
    if (m >= 0xc0 && m <= 0xcf && m !== 0xc4 && m !== 0xc8 && m !== 0xcc)
      return [buf.readUInt16BE(p + 7), buf.readUInt16BE(p + 5)];
    if (m === 0x01 || (m >= 0xd0 && m <= 0xd7)) { p += 2; continue; }
    p += 2 + buf.readUInt16BE(p + 2);
  }
  return [0, 0];
}
function pngDims(buf, off) { return [buf.readUInt32BE(off + 16), buf.readUInt32BE(off + 20)]; }
function webpDims(buf, off) {
  if (buf.toString('ascii', off, off + 4) !== 'RIFF' || buf.toString('ascii', off + 8, off + 12) !== 'WEBP') return [0, 0];
  const four = buf.toString('ascii', off + 12, off + 16);
  if (four === 'VP8X') return [1 + (buf[off + 24] | (buf[off + 25] << 8) | (buf[off + 26] << 16)), 1 + (buf[off + 27] | (buf[off + 28] << 8) | (buf[off + 29] << 16))];
  if (four === 'VP8 ') { for (let p = off + 20; p < off + 80; p++) if (buf[p] === 0x9d && buf[p + 1] === 0x01 && buf[p + 2] === 0x2a) return [(buf[p + 3] | (buf[p + 4] << 8)) & 0x3fff, (buf[p + 5] | (buf[p + 6] << 8)) & 0x3fff]; }
  if (four === 'VP8L') { const b = buf.readUInt32LE(off + 21); return [1 + (b & 0x3fff), 1 + ((b >> 14) & 0x3fff)]; }
  return [0, 0];
}

/* 豁免登记：设备配置里写 `asset-exempt: webp` 之类的说明 */
function exemptions() {
  const map = new Map();
  const dir = path.join(ROOT, 'src/devices');
  for (const f of fs.readdirSync(dir)) {
    if (!f.endsWith('.js') || f === 'registry.js') continue;
    const s = fs.readFileSync(path.join(dir, f), 'utf8');
    const m = s.match(/asset-exempt:\s*(\w[\w-]*)\s*(?:——|—|-)?\s*(.+)/);
    if (m) map.set(f.replace(/\.js$/, ''), { kind: m[1], why: m[2].trim().slice(0, 80) });
  }
  return map;
}

const exempt = exemptions();
let bad = 0, checked = 0;
const rows = [];

for (const f of fs.readdirSync(DIR).filter(x => x.endsWith('.glb'))) {
  checked++;
  const buf = fs.readFileSync(path.join(DIR, f));
  if (buf.toString('ascii', 0, 4) !== 'glTF') { console.log(`✗ ${f}: 不是合法 GLB（魔数不符）`); bad++; continue; }
  const jsonLen = buf.readUInt32LE(12);
  const json = JSON.parse(buf.toString('utf8', 20, 20 + jsonLen));
  const binStart = 20 + jsonLen + 8;
  const binEnd = binStart + buf.readUInt32LE(20 + jsonLen);
  const used = json.extensionsUsed || [];
  const id = path.basename(f, '.glb');

  const issues = [];
  if (!used.includes('KHR_draco_mesh_compression')) issues.push('未走 DRACO（几何未压缩）');

  const images = json.images || [];
  let maxTex = 0, nonWebp = [];
  images.forEach(im => {
    const bv = (json.bufferViews || [])[im.bufferView];
    if (!bv) return;
    const off = binStart + (bv.byteOffset || 0);
    let w = im.width || 0, mime = im.mimeType || '';
    if (!w) {
      if (buf[off] === 0x89 && buf.toString('ascii', off + 1, off + 4) === 'PNG') { [w] = pngDims(buf, off); mime = 'image/png'; }
      else if (buf[off] === 0xff && buf[off + 1] === 0xd8) { [w] = jpegDims(buf, off, Math.min(off + (bv.byteLength || 1e6), binEnd)); mime = 'image/jpeg'; }
      else { [w] = webpDims(buf, off); mime = 'image/webp'; }
    }
    if (mime !== 'image/webp') nonWebp.push(mime);
    if (w > maxTex) maxTex = w;
  });
  if (images.length && nonWebp.length) {
    issues.push(`贴图非 webp（${[...new Set(nonWebp)].join('/')} ×${nonWebp.length} 张）`);
    if (!used.includes('EXT_texture_webp')) issues.push('缺少 EXT_texture_webp 扩展声明');
  }
  if (maxTex > MAX_TEX) issues.push(`纹理最大边 ${maxTex} > ${MAX_TEX}（显存风险，审计 P0-1）`);

  const ex = exempt.get(id);
  if (issues.length && ex) { console.log(`· ${id}: ${issues.join('；')} —— 已登记豁免（${ex.kind}：${ex.why}）`); continue; }
  if (issues.length) { console.log(`✗ ${id}: ${issues.join('；')} —— 修法：node tools/optimize-glb.mjs <原件> public/assets/${id}.glb（默认 --max-texture 2048）`); bad++; continue; }
  rows.push(id);
}

console.log(`\n在馆 GLB ${checked} 个：合规 ${rows.length}，违规 ${bad}` +
  (exempt.size ? `，登记豁免 ${exempt.size} 台` : '') +
  `（纹理上限口径 ${MAX_TEX}px）`);
if (bad) process.exit(1);
