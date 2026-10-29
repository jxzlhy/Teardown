#!/usr/bin/env node
/* =============================================================
   新增设备脚手架：生成配置模板 + 自动注册 registry.js
   用法：
     npm run add -- --id mac-studio-2 --zh "Mac Studio 2" --en "MAC STUDIO 2" \
                    --brand APPLE --category 电脑
   行为：
   1. 查重（registry 注册情况 + public/assets 同名文件）
   2. 生成 src/devices/<id>.js（程序化占位模板，GLB 就绪后再补映射）
   3. 在 registry.js 的对应品牌分组插入 import + 注册项
   4. 提示后续步骤
============================================================= */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { installDomShim } from './lib-node-shim.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

/* ---------- 参数 ---------- */
const args = {};
for(let i = 2; i < process.argv.length; i++){
  const m = process.argv[i].match(/^--(\w+)(?:=(.*))?$/);
  if(m) args[m[1]] = m[2] !== undefined ? m[2] : process.argv[++i];
}
const { id, zh, en, brand, category } = args;
if(!id || !zh || !en || !brand || !category){
  console.error('用法：npm run add -- --id <kebab-id> --zh <中文名> --en <英文名> --brand <品牌> --category <分类>');
  process.exit(1);
}
if(!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(id)){
  console.error(`✗ id 必须是 kebab-case（小写字母/数字/连字符），收到："${id}"`);
  process.exit(1);
}

/* ---------- 查重 ---------- */
installDomShim();
const { devices } = await import(pathToFileURL(path.join(ROOT, 'src/devices/registry.js')).href);
const dupId = devices.find(d => d.id === id);
if(dupId){ console.error(`✗ 设备 id "${id}" 已注册（${dupId.name}），见 MODEL_INVENTORY.md`); process.exit(1); }
const devFile = path.join(ROOT, 'src/devices', `${id}.js`);
const glbFile = path.join(ROOT, 'public/assets', `${id}.glb`);
if(fs.existsSync(devFile)){ console.error(`✗ 配置文件已存在：src/devices/${id}.js`); process.exit(1); }
if(fs.existsSync(glbFile)) console.log(`⚠ public/assets/${id}.glb 已存在（将继续使用它）`);

/* ---------- 生成配置模板 ---------- */
const template = `/* =============================================================
   设备配置：${zh}（脚手架生成 · 待补全）
   上线步骤：GLB → public/assets/${id}.glb → 本文件补 glb/mapping/realPartIds
============================================================= */
import { makeDevice } from './_kit/factory.js';
import { box, addMesh, matShell, matDark } from '../engine/materials.js';

const builders = {
  body: (g)=>{
    /* TODO：程序化占位外观，按真机改 */
    addMesh(g, box(6, 3, 1), matShell(), 0, 0, 0);
  },
};

export default makeDevice({
  id: '${id}',
  name: '${zh}',
  en: '${en}',
  category: '${category}',
  brand: '${brand}',
  tagline: 'TODO · 一句话卖点',
  description: '${zh}：TODO · 设备介绍。',
  specs: [
    ['状态', '配置待补充'],
  ],
  accent: '#45e0ff',
  targetWidth: 6.5,
  /* glb: '/assets/${id}.glb',      // GLB 就绪后取消注释并配置映射 */
  parts: [
    { id:'body', zh:'机身', en:'BODY', real:false,
      ex:[0,.6,0], lo:[0,1.5,0], tag:'程序化占位',
      desc:'TODO · 部件介绍。',
      specs:[['状态','待补充']] },
  ],
  builders,
  tick: null,
});
`;
fs.writeFileSync(devFile, template);
console.log(`✓ 已生成 src/devices/${id}.js`);

/* ---------- 注册 registry.js ---------- */
const regPath = path.join(ROOT, 'src/devices/registry.js');
let reg = fs.readFileSync(regPath, 'utf8');
const importName = id.replace(/-([a-z0-9])/g, (_, c) => c.toUpperCase());
if(new RegExp(`\\b${importName}\\b`).test(reg.replace(/import[^;]+;/g, ''))){
  console.error(`✗ registry.js 中已存在同名符号 ${importName}，请手工处理命名冲突`);
  process.exit(1);
}

const lastImportEnd = reg.lastIndexOf(/^import .*$/m);
const importStmt = `import ${importName} from './${id}.js';\n`;
const importAnchor = reg.match(/^import .*?;$/gm);
const lastImport = importAnchor[importAnchor.length - 1];
reg = reg.replace(lastImport + '\n', lastImport + '\n' + importStmt);

const groupRe = new RegExp(`(  /\\* ${brand} \\*\\/\\n)([^\\n]*)`, 'i');
const gm = reg.match(groupRe);
if(gm){
  reg = reg.replace(groupRe, (all, head, line) =>
    head + (line.trim() ? line + ` ${importName},` : `  ${importName},`));
}else{
  reg = reg.replace(/\n\];/, `\n  /* ${brand} */\n  ${importName},\n];`);
}
fs.writeFileSync(regPath, reg);
console.log(`✓ registry.js 已注册（品牌分组：${brand}${gm ? '' : ' · 新建分组'}）`);

/* ---------- 后续提示 ---------- */
console.log(`
后续步骤：
  1. npm run dev 打开 /#/device/${id} 确认程序化占位可看；
  2. 源模型转换后放 public/assets/${id}.glb，配置文件补 glb / mapping / realPartIds / frontAxis；
  3. npm run lint:devices 校验映射引用；
  4. npm run gen:inventory 更新清单；
  5. npm run thumbs 生成大厅缩略图。`);
