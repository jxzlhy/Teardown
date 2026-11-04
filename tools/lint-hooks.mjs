#!/usr/bin/env node
/* =============================================================
   调试钩子生命周期校验（复审 RS-01 的防复发闸门）

   两类检查，口径不同：
   A) 对象图钩子（持有 three 场景/引擎实例，如 __ENGINE/__STUDIO/__GRAPH）
      ⇒ **必须**有配对 `delete`，否则 error。
      理由：常驻 window 会强引用整棵已 dispose 的场景（几何/材质/贴图 +
      命令栈闭包 + 已毁 renderer）。__ENGINE 与 __STUDIO 两次都是这个成因。
      新增"看起来是实例"的钩子（右值是标识符/构造调用）若未登记进
      GRAPH_HOOKS，同样报错——逼迫写代码的人显式判断它属于哪一类。
   B) 数据钩子（数值/字符串快照、只增数组）⇒ 只告警：
      形如 `window.__X = (window.__X || []).concat(...)` 的只增列表提示清理。

   用法：node tools/lint-hooks.mjs   （挂在 npm run lint:devices 链尾）
   ============================================================= */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC = path.join(ROOT, 'src');

/* 持有 live 对象图的钩子（新增时必须登记并保证配对 delete） */
const GRAPH_HOOKS = ['__ENGINE', '__STUDIO', '__GRAPH'];

const files = [];
(function walk(dir) {
  for (const f of fs.readdirSync(dir)) {
    const p = path.join(dir, f);
    if (fs.statSync(p).isDirectory()) walk(p);
    else if (/\.(js|vue|mjs)$/.test(f)) files.push(p);
  }
})(SRC);

const writes = new Map();   // name → [{ at, value, looksLikeInstance }]
const deletes = new Map();  // name → [at]
const appendOnly = [];

for (const f of files) {
  const rel = path.relative(ROOT, f);
  const lines = fs.readFileSync(f, 'utf8').split('\n');
  lines.forEach((line, i) => {
    const w = line.match(/window\.(__[A-Z0-9_]+)\s*=\s*([^=;]{1,80})/);
    if (w) {
      const [, name, rawVal] = w;
      const value = rawVal.trim();
      /* 右值是裸标识符 / new 调用 / create*(...) / api/scene/engine 等 → 视为持有实例 */
      const looksLikeInstance =
        /^(new\s|.*create[A-Z]\w*\(|(api|engine|scene|studio|viewer|renderer|group|root)$)/.test(value) ||
        /\b(api|engine|scene|renderer|viewer|root|group)\b/.test(value);
      if (!writes.has(name)) writes.set(name, []);
      writes.get(name).push({ at: `${rel}:${i + 1}`, value, looksLikeInstance });
    }
    const d = line.match(/delete\s+window\.(__[A-Z0-9_]+)/);
    if (d) {
      if (!deletes.has(d[1])) deletes.set(d[1], []);
      deletes.get(d[1]).push(`${rel}:${i + 1}`);
    }
    if (/window\.(__[A-Z0-9_]+)\s*=\s*\(?\s*window\.\1\s*\|\|\s*\[\]\s*\)?\s*\.concat/.test(line)) {
      appendOnly.push(`${rel}:${i + 1}`);
    }
  });
}

let bad = 0, warn = 0;
console.log(`扫描 ${files.length} 个源文件，发现 window 调试钩子写入点 ${writes.size} 个`);

for (const [name, sites] of writes) {
  const isGraph = GRAPH_HOOKS.includes(name);
  const del = deletes.get(name);
  if (isGraph) {
    if (del) console.log(`✓ ${name}（对象图钩子）：${sites.map(s => s.at).join(', ')} → 配对 delete ${del.join(', ')}`);
    else { console.log(`✗ ${name}（对象图钩子）：${sites.map(s => s.at).join(', ')} 无配对 delete → 卸载后整棵场景被 window 强引用`); bad++; }
  } else if (sites.some(s => s.looksLikeInstance)) {
    console.log(`✗ ${name}：${sites.map(s => s.at + ' =' + s.value).join(', ')} 右值疑似持有实例，但未登记进 tools/lint-hooks.mjs 的 GRAPH_HOOKS`);
    console.log(`   → 若确实持有场景：加入 GRAPH_HOOKS 并在卸载路径 delete；若只是数据快照：改成不含 scene/renderer/engine 等标识符的写法`);
    bad++;
  } else {
    console.log(`· ${name}：数据快照钩子（${sites.map(s => s.at).join(', ')}），不要求配对 delete`);
  }
}

if (appendOnly.length) {
  console.log(`⚠ 只增列表钩子（跨切台累积，建议设上限或装载时清空）：${appendOnly.join(', ')}`);
  warn++;
}

if (bad) { console.log(`\n结果：${bad} 个错误${warn ? `、${warn} 个警告` : ''}`); process.exit(1); }
console.log(`\n✓ 对象图钩子全部有配对 delete${warn ? `（${warn} 条告警待观察）` : ''}`);
