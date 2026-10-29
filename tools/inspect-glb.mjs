#!/usr/bin/env node
/* GLB 结构检查：列出节点/网格名、层级、世界坐标包围盒，辅助生成 mapping。
   用法: node tools/inspect-glb.mjs <file.glb> [--json] */
import fs from 'node:fs';

const file = process.argv[2];
const asJson = process.argv.includes('--json');
if(!file){ console.error('usage: node inspect-glb.mjs <file.glb> [--json]'); process.exit(1); }

const buf = fs.readFileSync(file);
const dv = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
if(dv.getUint32(0, true) !== 0x46546C67) { console.error('not GLB'); process.exit(1); }
let off = 12, jsonLen = 0, jsonChunk = null, binChunk = null;
while(off < buf.byteLength){
  const len = dv.getUint32(off, true), type = dv.getUint32(off+4, true);
  if(type === 0x4E4F534A) jsonChunk = buf.slice(off+8, off+8+len);
  if(type === 0x004E4942) binChunk = buf.slice(off+8, off+8+len);
  off += 8 + len;
}
const g = JSON.parse(Buffer.from(jsonChunk).toString('utf8'));

/* 简易 accessor 读取（POSITION 用） */
function readAccessor(idx){
  const a = g.accessors[idx]; const bv = g.bufferViews[a.bufferView];
  const start = (bv.byteOffset||0) + (a.byteOffset||0);
  const comp = {5126:4,5123:2,5125:4,5121:1,5122:2}[a.componentType];
  const n = {SCALAR:1,VEC2:2,VEC3:3,VEC4:4}[a.type];
  const arr = new Float32Array(a.count*n);
  for(let i=0;i<a.count*n;i++) arr[i] = binChunk ? new DataView(binChunk.buffer, binChunk.byteOffset+start+i*comp).getFloat32(0,true) : 0;
  return arr;
}

/* 遍历场景，算每个 mesh 节点的世界变换 */
function mat(){ return [1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1]; }
function mul(a,b){ const o = new Array(16); for(let c=0;c<4;c++) for(let r=0;r<4;r++){ let s=0; for(let k=0;k<4;k++) s += a[k*4+r]*b[c*4+k]; o[c*4+r]=s; } return o; }
function fromTRS(n){
  const m = mat();
  if(n.matrix) return n.matrix.slice();
  const t = n.translation||[0,0,0], q = n.rotation||[0,0,0,1], s = n.scale||[1,1,1];
  const [x,y,z,w] = q;
  const m3 = [
    1-2*(y*y+z*z), 2*(x*y+z*w), 2*(x*z-y*w),
    2*(x*y-z*w), 1-2*(x*x+z*z), 2*(y*z+x*w),
    2*(x*z+y*w), 2*(y*z-x*w), 1-2*(x*x+y*y)
  ];
  for(let c=0;c<3;c++) for(let r=0;r<3;r++) m[c*4+r] = m3[c*3+r]*s[c];
  m[12]=t[0]; m[13]=t[1]; m[14]=t[2];
  return m;
}
function xform(m, v){
  return [
    m[0]*v[0]+m[4]*v[1]+m[8]*v[2]+m[12],
    m[1]*v[0]+m[5]*v[1]+m[9]*v[2]+m[13],
    m[2]*v[0]+m[6]*v[1]+m[10]*v[2]+m[14]
  ];
}

const rows = [];
const totalBox = { min:[1e9,1e9,1e9], max:[-1e9,-1e9,-1e9] };
function walk(idx, parentM, depth, parentPath){
  const n = g.nodes[idx];
  const m = mul(parentM, fromTRS(n));
  if(n.mesh !== undefined && g.meshes[n.mesh]){
    for(const prim of g.meshes[n.mesh].primitives){
      let bb = null;
      if(prim.attributes && prim.attributes.POSITION !== undefined){
        const acc = g.accessors[prim.attributes.POSITION];
        if(acc.min && acc.max){
          const mn = xform(m, acc.min), mx = xform(m, acc.max);
          bb = { min:[Math.min(mn[0],mx[0]),Math.min(mn[1],mx[1]),Math.min(mn[2],mx[2])],
                 max:[Math.max(mn[0],mx[0]),Math.max(mn[1],mx[1]),Math.max(mn[2],mx[2])] };
          for(let i=0;i<3;i++){ totalBox.min[i]=Math.min(totalBox.min[i],bb.min[i]); totalBox.max[i]=Math.max(totalBox.max[i],bb.max[i]); }
        }
      }
      rows.push({ name:n.name||('(mesh '+n.mesh+')'), node:idx, mesh:n.mesh, depth, parent:parentPath,
        tris: prim.indices!==undefined ? g.accessors[prim.indices].count/3 : null,
        min: bb?bb.min.map(v=>+v.toFixed(2)):null, max: bb?bb.max.map(v=>+v.toFixed(2)):null });
    }
  }
  for(const c of (n.children||[])) walk(c, m, depth+1, (parentPath? parentPath+'/' : '')+(n.name||idx));
}
const scene = g.scenes && g.scenes[g.scene||0];
for(const s of (scene?scene.nodes:Object.keys(g.nodes))) walk(s, mat(), 0, '');

/* 材质名索引 */
const matNames = (g.materials||[]).map(m=>m.name);

if(asJson){
  console.log(JSON.stringify({ totalBox, materials: matNames, meshes: rows }, null, 1));
} else {
  console.log(`== ${file} ==`);
  console.log(`nodes:${g.nodes.length} meshes:${(g.meshes||[]).length} materials:${matNames.length} textures:${(g.textures||[]).length} images:${(g.images||[]).length}`);
  console.log(`total bbox min=[${totalBox.min.map(v=>v.toFixed(2))}] max=[${totalBox.max.map(v=>v.toFixed(2))}] size=[${totalBox.max.map((v,i)=>(v-totalBox.min[i]).toFixed(2))}]`);
  console.log(`materials: ${matNames.slice(0,40).join(' | ')}`);
  console.log('--- meshes (name, tris, center) ---');
  const seen = {};
  for(const r of rows){
    const c = r.min ? r.min.map((v,i)=>((v+r.max[i])/2).toFixed(1)).join(',') : '?';
    const key = r.name+'@'+c;
    seen[key] = (seen[key]||0)+1;
    if(seen[key]===1) console.log(`${'  '.repeat(Math.min(r.depth,4))}${r.name}  tris=${r.tris??'?'}  c=[${c}]`);
  }
  console.log(`total primitives: ${rows.length}`);
}
