#!/usr/bin/env node
/* =============================================================
   GLB 压缩（拆解馆资产铁律：先 resize → webp → draco，顺序不可反！
   gltf-transform 任何后处理命令都会把已有 Draco 解码重写，
   反序会导致几何压缩丢失、体积反弹——switch-2 实测 1MB→14.8MB）。
   usage:
     node tools/optimize-glb.mjs <in.glb> <out.glb>   # 或省略 out = 原地压缩
     --max-texture <px>   纹理最大边上限（默认 2048，审计 P0-1；传 0 关闭）
============================================================= */
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const raw = process.argv.slice(2);
const opt = name => { const i = raw.indexOf(name); return i >= 0 ? raw[i + 1] : undefined; };
const argv = raw.filter(a => a && !a.startsWith('-') && a !== opt('--max-texture'));
if(argv.length < 1){
  console.error('usage: node tools/optimize-glb.mjs <in.glb> [out.glb] [--max-texture 2048]');
  process.exit(1);
}
const src = path.resolve(argv[0]);
const dst = path.resolve(argv[1] || argv[0]);
if(!fs.existsSync(src)){ console.error('✗ 找不到 ' + src); process.exit(1); }
/* 纹理上限：解压后显存由纹理尺寸决定，与传输体积无关（v6-engine 38×4096² ≈ 3.26GB） */
const maxTex = Number(opt('--max-texture') ?? 2048);

const tmp = dst + '.webp-stage.glb';
const tmpResize = dst + '.resize-stage.glb';
const run = (args) => {
  const r = spawnSync('npx', ['@gltf-transform/cli', ...args], { stdio: 'inherit' });
  if(r.status !== 0){
    try{ fs.rmSync(tmp, { force: true }); fs.rmSync(tmpResize, { force: true }); }catch{}
    process.exit(r.status || 1);
  }
};

const si = fs.statSync(src).size;
/* Draco 输入禁止 resize（会解码重写几何，触发上面的体积反弹铁律） */
if(maxTex > 0){
  const buf = fs.readFileSync(src);
  const jsonLen = buf.readUInt32LE(12);
  const json = JSON.parse(buf.toString('utf8', 20, 20 + jsonLen));
  const used = json.extensionsUsed || [];
  if(used.includes('KHR_draco_mesh_compression')){
    console.error('✗ 输入已 Draco 压缩，resize 会重写几何并反弹体积——请从 vendor/assets/originals/ 的原件重跑');
    process.exit(2);
  }
}
let geoSrc = src;
if(maxTex > 0){
  run(['resize', src, tmpResize, '--width', String(maxTex), '--height', String(maxTex)]);
  geoSrc = tmpResize;
}

run(['webp', geoSrc, tmp, '--quality', '85']);
run(['draco', tmp, dst]);
fs.rmSync(tmp, { force: true });
if(geoSrc !== src) fs.rmSync(geoSrc, { force: true });

const so = fs.statSync(dst).size;
const fmt = n => n >= 1048576 ? (n/1048576).toFixed(2) + ' MB' : Math.round(n/1024) + ' KB';
console.log(`✓ ${path.basename(dst)}: ${fmt(si)} → ${fmt(so)}（${Math.round(so/si*100)}%）${maxTex ? ' · 纹理 ≤' + maxTex : ''}`);
