#!/usr/bin/env node
/* 文字程序化建模（V5.0.4）Node 级单元验证：
   解析/生成是纯几何逻辑（无 WebGL/DOM 依赖），可在无浏览器环境确定性验证。
   覆盖：示例结构的部件数与稳定 ID、确定性复现、未识别子句如实列出、
   无结构拒析、材质关键词映射、部件命名唯一性。
   用法：node tools/textgen-unit.mjs（浏览器集成断言见 tools/studio-verify.mjs 4f 节） */

import assert from 'node:assert';
import { generateFromText, parseSpec } from '../src/studio/textgen.js';

const EX = '中央圆柱形能量核心，外围三个环形结构，上下两层机械支撑，四组对称连接装置，钛合金与深色金属材质，核心发光';

let pass = 0, fail = 0;
const check = (name, ok, detail) => {
  console.log(`${ok ? '✓' : '✗'} ${name}${detail ? ' · ' + detail : ''}`);
  ok ? pass++ : fail++;
};

/* 1. 示例结构：核心1 + 外围3 + 上下板2 + 支撑4 = 10，稳定 ID */
const a = generateFromText(EX);
check('示例解析成功', a.ok === true);
check('部件总数 10（核心1+外围3+上下板2+支撑4）', a.parts.length === 10, a.summary);
const ids = a.parts ? undefined : null;
const b = generateFromText(EX);
check('确定性复现（同描述同 summary）', a.ok && b.ok && a.summary === b.summary);

/* 2. 稳定 ID 与唯一性（直查 buildFromSpec 产物） */
const built = generateFromText('中央圆柱核心，外围四个环，两组支撑');
const wantIds = ['core', 'satellite_1', 'satellite_2', 'satellite_3', 'satellite_4', 'strut_1', 'strut_2'];
check('稳定 ID 序列', built.ok && built.summary === wantIds.join(', '), built.summary);
check('部件 ID 无重复', built.ok && new Set(built.summary.split(', ')).size === built.parts.length);

/* 3. 未识别子句如实列出 */
const junk = generateFromText('中央圆柱核心，今天是星期天');
check('未识别子句进入 unknown', junk.ok && junk.spec.unknown.some((u) => /星期天/.test(u)), JSON.stringify(junk.spec.unknown));

/* 4. 无结构描述拒析（原因+支持词提示） */
const bad = generateFromText('今天天气不错');
check('无结构拒析', bad.ok === false && !!bad.reason && /支持/.test(bad.hint));

/* 5. 形状词表：球/立方/圆锥/环 各识别 */
for (const [w, shape] of [['球体核心', 'sphere'], ['中心立方', 'box'], ['中央圆锥', 'cone'], ['中央环形结构', 'torus']]) {
  const p = parseSpec(w);
  check(`形状词「${w}」→ ${shape}`, p.ok && p.spec.central && p.spec.central.shape === shape,
    p.spec.central && p.spec.central.shape);
}

/* 6. 数量词：阿拉伯数字 + 中文数字 */
check('阿拉伯数量「外围5个环」', parseSpec('外围5个环形结构').spec.ring.count === 5);
check('中文数量「外围七个球」', parseSpec('外围七个球形结构').spec.ring.count === 7);

/* 7. 材质映射：塑料低金属度 / 发光标记 / 深色 */
const plastic = parseSpec('中央圆柱，塑料材质');
check('塑料 → metalness≈0.05', plastic.ok && plastic.spec.mat.metalness <= 0.06, plastic.spec.mat.metalness);
const glow = parseSpec('中央圆柱，发光');
check('发光 → emissive 标记', glow.ok && glow.spec.mat.emissive === true);
const dark = parseSpec('中央圆柱，深色金属');
check('深色+金属 → 双标记', dark.ok && dark.spec.mat.dark && dark.spec.mat.metalness > 0.8);

console.log(`\n${fail ? `FAIL(${fail})` : 'ALL PASS'} · ${pass} 过 / ${fail} 败`);
process.exit(fail ? 1 : 0);
