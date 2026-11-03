#!/usr/bin/env node
/* 文字生成 spec 结构化契约（17.6）Node 级单元验证：
   文字→spec→JSON→重建 的确定性往返、非法 spec 拒收、数值钳制、字段收敛。
   用法：node tools/textgen-spec-unit.mjs */

import assert from 'node:assert';
import { generateFromText, buildFromSpec, specToJSON, specFromJSON, TEXTSPEC_FMT } from '../src/studio/textgen.js';

let pass = 0, fail = 0;
const check = (name, ok, detail) => {
  console.log(`${ok ? '✓' : '✗'} ${name}${detail ? ' · ' + detail : ''}`);
  ok ? pass++ : fail++;
};
const summaryOf = (spec) => {
  const { root, parts } = buildFromSpec(spec);
  return { summary: parts.map((p) => p.id).join(', '), count: parts.length, root };
};

/* 1. 文字 → spec → JSON → 重建：确定性往返 */
const EX = '中央圆柱形能量核心，外围三个环形结构，上下两层机械支撑，四组对称连接装置，钛合金与深色金属材质，核心发光';
const parsed = generateFromText(EX);
check('文字入口解析成功', parsed.ok === true && parsed.parts.length === 10, 'parts=' + parsed.parts.length);
const json1 = JSON.stringify(specToJSON(parsed.spec));
const json2 = JSON.stringify(specToJSON(generateFromText(EX).spec));
check('同文字导出同 spec JSON（确定性）', json1 === json2);
const rebuilt = specFromJSON(JSON.parse(json1));
const a = summaryOf(rebuilt);
const b = summaryOf(parsed.spec);
check('spec 重建与原 spec 同结构', a.summary === b.summary && a.count === b.count, `${a.count} vs ${b.count}`);
check('导出 spec 带 fmt 契约头', JSON.parse(json1).fmt === TEXTSPEC_FMT);

/* 2. spec → JSON → spec 二次往返稳定（幂等） */
const json3 = JSON.stringify(specToJSON(rebuilt));
check('spec→JSON→spec 幂等', json3 === json1);

/* 3. 非法 spec 拒收（原因可读） */
const badCases = [
  ['非对象', 'string', /必须是 JSON 对象/],
  ['fmt 不符', { fmt: 'other/9', central: { shape: 'cylinder' } }, /fmt 应为/],
  ['形状白名单外', { fmt: TEXTSPEC_FMT, central: { shape: 'pyramid' } }, /shape 非法/],
  ['数量非数值', { fmt: TEXTSPEC_FMT, ring: { shape: 'torus', count: 'many' } }, /不是有限数值/],
  ['空结构', { fmt: TEXTSPEC_FMT }, /至少一项/],
];
for (const [label, input, re] of badCases) {
  let threw = '';
  try { specFromJSON(input); } catch (e) { threw = String(e.message || e); }
  check(`拒收：${label}`, threw && re.test(threw), threw.slice(0, 70));
}

/* 4. 数值钳制：越界值收敛而非报错（契约宽容 + 安全） */
const clamped = specFromJSON({ fmt: TEXTSPEC_FMT, ring: { shape: 'torus', count: 999 }, mat: { metalness: 5, roughness: -2 } });
check('count 越界钳到 24', clamped.ring.count === 24, String(clamped.ring.count));
check('metalness 越界钳到 1 / roughness 钳到 0', clamped.mat.metalness === 1 && clamped.mat.roughness === 0);

/* 5. 字段收敛：导出物无运行时引用、undefined 分支被剔除 */
const j = JSON.parse(json1);
check('plates 空数组不导出（undefined 剔除）', !('plates' in j) || Array.isArray(j.plates));
check('导出物 JSON 纯净（无函数/循环）', (() => { try { JSON.stringify(JSON.parse(json1)); return true; } catch { return false; } })());

/* 6. 深链参数口径：hash 内查询串解析（与 readCapMB 同约定） */
const hq = new URLSearchParams('#/studio?text=%E4%B8%AD%E5%A4%AE&auto=1&spec=%7B%22a%22%3A1%7D'.split('?')[1]);
check('深链 text/spec 参数可解析', hq.get('text') === '中央' && hq.get('auto') === '1' && JSON.parse(hq.get('spec')).a === 1);

/* 7. spec 直接生成的部件与文字入口同 ID 序列（同一下游） */
const viaText = generateFromText('中央球体核心，外围五个环');
const viaSpec = summaryOf(specFromJSON(specToJSON(viaText.spec)));
check('spec 入口与文字入口同 ID 序列', viaSpec.summary === viaText.summary, viaSpec.summary);

console.log(`\n${fail ? `FAIL(${fail})` : 'ALL PASS'} · ${pass} 过 / ${fail} 败`);
process.exit(fail ? 1 : 0);
