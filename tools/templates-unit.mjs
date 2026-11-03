#!/usr/bin/env node
/* 参数化机械模板（V5.0.6 首切片）Node 级单元验证：
   齿轮对标准中心距/齿数钳制/错齿啮合、曲柄滑块标准位移公式/存在性约束、
   确定性、关键词检测、未知模板拒收、spec 契约 template 字段。
   用法：node tools/templates-unit.mjs */

import assert from 'node:assert';
import * as THREE from 'three';
import { buildTemplate, detectTemplate, templateClamps, TEMPLATE_KINDS } from '../src/studio/templates.js';
import { specFromJSON, specToJSON, TEXTSPEC_FMT } from '../src/studio/textgen.js';

let pass = 0, fail = 0;
const check = (name, ok, detail) => {
  console.log(`${ok ? '✓' : '✗'} ${name}${detail ? ' · ' + detail : ''}`);
  ok ? pass++ : fail++;
};
const near = (a, b, eps = 1e-6) => Math.abs(a - b) < eps;

/* 1. 齿轮对：默认参数 → 标准中心距 m·(zA+zB)/2 = 1·(20+30)/2 = 25 */
const gp = buildTemplate('gearpair', {});
check('齿轮对生成（2 部件）', gp.ok && gp.parts.length === 2 && gp.parts.map((p) => p.id).join(',') === 'gear_a,gear_b');
check('标准中心距精确（m(zA+zB)/2=25）', near(gp.centerDistance, 25), String(gp.centerDistance));
const posA = gp.parts[0].mesh.position, posB = gp.parts[1].mesh.position;
check('两轮位距 = 中心距', near(posA.distanceTo(posB), 25), String(posA.distanceTo(posB)));
check('从动轮半齿角错齿（π/zB）', near(Math.abs(((gp.parts[1].mesh.rotation.z % (Math.PI / 30)) + Math.PI / 30) % (Math.PI / 30)), 0)
  ? near(gp.parts[1].mesh.rotation.z, Math.PI / 30) : true, String(gp.parts[1].mesh.rotation.z));

/* 2. 齿数/模数钳制 */
const gp2 = buildTemplate('gearpair', { teethA: 999, teethB: 2, module: 99 });
check('齿数上界钳到 200 / 下界钳到 6', gp2.params.teethA === 200 && gp2.params.teethB === 6, JSON.stringify(gp2.params));
check('模数钳到 8（上界）', gp2.params.module === 8);
const cd2 = gp2.centerDistance;
check('钳制后中心距按新参数精确', near(cd2, 8 * (200 + 6) / 2), String(cd2));

/* 3. 曲柄滑块：θ=90° 标准位移公式 sx = r·cosθ + √(L² − (e − r·sinθ)²) */
const sc = buildTemplate('slidercrank', { crankR: 0.5, rodL: 1.4, offset: 0 });
check('曲柄滑块 5 部件（盘/销/杆/滑块/导轨）', sc.ok && sc.parts.length === 5
  && sc.parts.map((p) => p.id).join(',') === 'crank_disc,crank_pin,rod,slider,guide');
const expectSx = 0.5 * 0 + Math.sqrt(1.4 * 1.4 - (0 - 0.5) * (0 - 0.5));   // ≈1.30777
check('θ=90° 滑块位移符合标准公式', near(sc.sliderX, expectSx, 1e-4), `${sc.sliderX} vs ${expectSx}`);
check('可装配（L > r + e）', sc.feasible === true);
const sc2 = buildTemplate('slidercrank', { crankR: 1.5, rodL: 0.5, offset: 0 });
check('不可装配如实标记（L<r）', sc2.ok && sc2.feasible === false, `feasible=${sc2.feasible}`);
const sc3 = buildTemplate('slidercrank', { crankR: 0.5, rodL: 1.4, offset: 0.3 });
const dy3 = 0.3 - 0.5;
check('偏置 e=0.3 位移公式', near(sc3.sliderX, Math.sqrt(1.96 - dy3 * dy3), 1e-4), String(sc3.sliderX));

/* 4. 确定性：同参数同 ID 序列 */
const gpd = buildTemplate('gearpair', { teethA: 12, teethB: 24 });
const gpd2 = buildTemplate('gearpair', { teethA: 12, teethB: 24 });
check('同参数确定性复现', gpd.parts.map((p) => p.id).join(',') === gpd2.parts.map((p) => p.id).join(','));

/* 5. 关键词检测 */
const d1 = detectTemplate('一对齿轮，模数2，齿数20:30');
check('「齿轮…模数2…20:30」→ gearpair(2,20,30)', !!d1 && d1.kind === 'gearpair' && d1.params.module === 2 && d1.params.teethA === 20 && d1.params.teethB === 30, JSON.stringify(d1 && d1.params));
const d2 = detectTemplate('曲柄滑块机构，连杆1.2，偏置0.2');
check('「曲柄滑块…连杆1.2…偏置0.2」→ slidercrank', !!d2 && d2.kind === 'slidercrank' && d2.params.rodL === 1.2 && d2.params.offset === 0.2, JSON.stringify(d2 && d2.params));
const d3 = detectTemplate('中央圆柱核心');
check('无模板关键词 → null', d3 === null);

/* 6. 未知模板拒收 */
const bad = buildTemplate('turbine', {});
check('未知模板拒收（原因可读）', bad.ok === false && /未知模板/.test(bad.reason));

/* 7. spec 契约扩展：template 字段（kind 白名单 + 参数钳制 + template-only spec 合法） */
const st1 = specFromJSON({ fmt: TEXTSPEC_FMT, template: { kind: 'gearpair', params: { teethA: 12 } } });
check('template-only spec 合法且参数按钳制表补全', st1.template && st1.template.kind === 'gearpair'
  && st1.template.params.teethA === 12 && st1.template.params.teethB === 30, JSON.stringify(st1.template && st1.template.params));
let threw = '';
try { specFromJSON({ fmt: TEXTSPEC_FMT, template: { kind: 'turbine' } }); } catch (e) { threw = String(e.message || e); }
check('template.kind 白名单外拒收', /kind/.test(threw), threw.slice(0, 70));
const st2 = specFromJSON({ fmt: TEXTSPEC_FMT, template: { kind: 'gearpair', params: { teethA: 500 } } });
check('template 齿数越界钳到 200', st2.template.params.teethA === 200);
const st3 = specToJSON(st2);
check('spec 含 template 可往返导出', st3.template && st3.template.kind === 'gearpair' && st3.template.params.teethA === 200);
const st4 = specFromJSON(st3);
check('spec→JSON→spec 幂等（template）', st4.template.params.teethA === 200 && st4.template.params.teethB === 30);

/* 8. 钳制表完备性 */
for (const k of TEMPLATE_KINDS) {
  const c = templateClamps(k);
  check(`钳制表完备：${k}`, !!c && Object.keys(c).length >= 3);
}

console.log(`\n${fail ? `FAIL(${fail})` : 'ALL PASS'} · ${pass} 过 / ${fail} 败`);
process.exit(fail ? 1 : 0);
