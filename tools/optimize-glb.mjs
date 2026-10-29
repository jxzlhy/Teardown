#!/usr/bin/env node
/* =============================================================
   GLB 压缩（拆解馆资产铁律：先 webp 后 draco，顺序不可反！
   gltf-transform 任何后处理命令都会把已有 Draco 解码重写，
   反序会导致几何压缩丢失、体积反弹——switch-2 实测 1MB→14.8MB）。
   usage:
     node tools/optimize-glb.mjs <in.glb> <out.glb>   # 或省略 out = 原地压缩
============================================================= */
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const argv = process.argv.slice(2).filter(a => a && !a.startsWith('-'));
if(argv.length < 1){
  console.error('usage: node tools/optimize-glb.mjs <in.glb> [out.glb]');
  process.exit(1);
}
const src = path.resolve(argv[0]);
const dst = path.resolve(argv[1] || argv[0]);
if(!fs.existsSync(src)){ console.error('✗ 找不到 ' + src); process.exit(1); }

const tmp = dst + '.webp-stage.glb';
const run = (args) => {
  const r = spawnSync('npx', ['@gltf-transform/cli', ...args], { stdio: 'inherit' });
  if(r.status !== 0){ try{ fs.rmSync(tmp, { force: true }); }catch{} process.exit(r.status || 1); }
};

const si = fs.statSync(src).size;

run(['webp', src, tmp, '--quality', '85']);
run(['draco', tmp, dst]);
fs.rmSync(tmp, { force: true });

const so = fs.statSync(dst).size;
const fmt = n => n >= 1048576 ? (n/1048576).toFixed(2) + ' MB' : Math.round(n/1024) + ' KB';
console.log(`✓ ${path.basename(dst)}: ${fmt(si)} → ${fmt(so)}（${Math.round(so/si*100)}%）`);
