/* 机械锻造所 · 转子发动机生成器（Wankel / 偏心轴系标杆）
   布局：单转子概念机——epitrochoid 缸壁 + 三尖端转子 + 偏心轴（内齿 3:1 约束）。
   真实性口径（V3.0 任务书 §2.3/§3.2A）：几何由真实转子机运动学生成——
   缸体型线 x(φ)=e·cosφ+R·cos(φ/3)（解析），转子尖端恒在缸壁上（构造保证），
   转子侧翼为圆弧近似（数值求切：圆心距 m 由全相位扫描不穿透边界定），
   排量按 V=3·√3·e·R·W（每转子三工作腔）推导；不虚构性能参数。
   运动演示：偏心轴自转 + 转子「公转 e + 自转 1/3」复合（引擎 eccOrbit 类型）。 */

import * as THREE from 'three';
import { makeRng, seedFromString } from './rand.js';
import { FORGE_MATS } from './materials.js';

export const GENERATOR_ID = 'wankel';
export const GENERATOR_VERSION = 1;

/* 参数 Schema（§4.1） */
export const SCHEMA = {
  rotorR: { type: 'range', min: 90, max: 120, step: 1, default: 105, label: '转子半径 R', unit: 'mm', note: '转子中心到尖端距离——缸体型线的生成半径' },
  ecc: { type: 'range', min: 12, max: 20, step: 1, default: 15, label: '偏心距 e', unit: 'mm', note: '转子中心绕主轴的公转半径，决定排量与泵气损失' },
  width: { type: 'range', min: 70, max: 100, step: 1, default: 80, label: '缸体宽度 W', unit: 'mm', note: '转子轴向厚度（单腔容积的第三维）' },
  finish: { type: 'enum', options: ['bare', 'painted'], default: 'painted', label: '表面处理', note: 'bare=铸造裸金属；painted=涂装侧壳' },
  detail: { type: 'range', min: 0, max: 2, step: 1, default: 1, label: '细节密度', unit: '级', note: '螺栓/齿圈视觉/密封片细节随级数增加' },
};

export function defaultParams() {
  const out = {};
  for (const k of Object.keys(SCHEMA)) out[k] = SCHEMA[k].default;
  return out;
}

/* 预设方案：一键填充参数面板 */
export const PRESETS = [
  { id: 'classic13', label: '经典 1.3L 量级（双转子单腔）', params: { rotorR: 105, ecc: 15, width: 80, finish: 'painted', detail: 1 } },
  { id: 'compact', label: '紧凑小排量', params: { rotorR: 95, ecc: 13, width: 70, finish: 'bare', detail: 1 } },
  { id: 'race', label: '高转速大缸宽', params: { rotorR: 118, ecc: 17, width: 95, finish: 'bare', detail: 2 } },
  { id: 'longE', label: '大偏心扭矩型', params: { rotorR: 100, ecc: 20, width: 85, finish: 'painted', detail: 2 } },
];

export function validateParams(p) {
  const out = {}, errs = [];
  for (const k of Object.keys(SCHEMA)) {
    const s = SCHEMA[k], v = p && p[k];
    if (s.type === 'enum') out[k] = s.options.includes(v) ? v : s.default;
    else if (s.type === 'range') {
      const n = Number(v);
      if (!Number.isFinite(n)) { out[k] = s.default; continue; }
      out[k] = Math.min(s.max, Math.max(s.min, Math.round(n / s.step) * s.step));
    } else out[k] = s.default;
  }
  /* 偏心距上限守卫：e/R 过大使侧翼圆弧无切解（经验边界 e/R ≤ 0.20） */
  if (out.ecc / out.rotorR > 0.2) { out.ecc = Math.round(out.rotorR * 0.2); errs.push('偏心距超出 e/R≤0.20，已钳制'); }
  return { params: out, errors: errs };
}

export function describeParams(p) {
  const u = (mm) => mm / 100;
  const dispL = 3 * Math.sqrt(3) * u(p.ecc) * u(p.rotorR) * u(p.width) * 1e6 / 1e6;
  return { displacementL: +dispL.toFixed(3), compressionNote: '单转子三工作腔' };
}

/* ---------- 布局与几何推导（1 模型单位 = 100mm） ---------- */
function deriveLayout(P) {
  const u = (mm) => mm / 100;
  const R = u(P.rotorR), e = u(P.ecc), W = u(P.width);
  /* 缸体型线（轴角 φ：0..6π） */
  const profile = (phi) => [e * Math.cos(phi) + R * Math.cos(phi / 3), e * Math.sin(phi) + R * Math.sin(phi / 3)];
  /* 转子侧翼圆弧：圆心距 m 二分搜索不穿透边界（负根 = 圆心在转子中心对侧）。
     全相位扫描（粗采样）+ 有符号径向间隙；搜索目标：尽量平坦（|m| 小）且 minGap ≥ 0。
     结果随 e/R 变化，构建期一次求出（<50ms）。 */
  const NW = 1080;
  const wall = [];
  for (let i = 0; i < NW; i++) wall.push(profile((i / NW) * Math.PI * 6));
  const wallR = (ang) => {
    let a = ang % (Math.PI * 2); if (a < 0) a += Math.PI * 2;
    const t = a / (Math.PI * 2) * NW;
    const i0 = Math.floor(t) % NW, i1 = (i0 + 1) % NW, k = t - Math.floor(t);
    return Math.hypot(...wall[i0]) * (1 - k) + Math.hypot(...wall[i1]) * k;
  };
  function sweepMinGap(m) {
    const bis = Math.PI / 3;
    const C = [m * Math.cos(bis), m * Math.sin(bis)];
    const tip0 = [R, 0], tip1 = [R * Math.cos(2 * Math.PI / 3), R * Math.sin(2 * Math.PI / 3)];
    const rho = Math.hypot(tip0[0] - C[0], tip0[1] - C[1]);
    const a0 = Math.atan2(tip0[1] - C[1], tip0[0] - C[0]);
    const a1 = Math.atan2(tip1[1] - C[1], tip1[0] - C[0]);
    let da = a1 - a0; while (da > Math.PI) da -= 2 * Math.PI; while (da < -Math.PI) da += 2 * Math.PI;
    let minGap = Infinity;
    const NPHI = 120, NARC = 30;
    for (let k = 0; k < NPHI; k++) {
      const phi = (k / NPHI) * Math.PI * 6;
      const E = [e * Math.cos(phi), e * Math.sin(phi)];
      const al = phi / 3, ca = Math.cos(al), sa = Math.sin(al);
      for (let j = 0; j <= NARC; j++) {
        const a = a0 + da * (j / NARC);
        const px = C[0] + rho * Math.cos(a), py = C[1] + rho * Math.sin(a);
        const wx = E[0] + px * ca - py * sa, wy = E[1] + px * sa + py * ca;
        const gap = wallR(Math.atan2(wy, wx)) - Math.hypot(wx, wy);
        if (gap < minGap) minGap = gap;
      }
    }
    return minGap;
  }
  let lo = -260 / 100 * R, hi = -40 / 100 * R;      // m ∈ [-2.6R, -0.4R]（mm→单位）
  for (let it = 0; it < 22; it++) {
    const mid = (lo + hi) / 2;
    if (sweepMinGap(mid) >= -0.004) lo = mid; else hi = mid;
  }
  const m = lo;                                      // 相切边界（不穿透的最平坦圆弧）
  const C0 = [m * Math.cos(Math.PI / 3), m * Math.sin(Math.PI / 3)];
  const tip0 = [R, 0];
  const rho = Math.hypot(tip0[0] - C0[0], tip0[1] - C0[1]);
  return { R, e, W, profile, m, rho, wallT: 0.36, shaftR: 0.2, lobeR: 0.28, boreR: 0.33 };
}

/* ---------- 小构件工具 ---------- */
function mesh(g, geo, mat, pos = [0, 0, 0], rot = null) {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(...pos);
  if (rot) m.rotation.set(...rot);
  m.name = 'F_W_' + g.name + '_' + (g.children.length + 1);
  g.add(m);
  return m;
}
const box = (x, y, z) => new THREE.BoxGeometry(x, y, z);
const cyl = (rt, rb, h, seg = 24) => new THREE.CylinderGeometry(rt, rb, h, seg);

/* 缸体型线 Shape（hole 用）与外圈 Shape（体用） */
function housingShapes(L) {
  const N = 360;
  const inner = [];
  for (let i = 0; i < N; i++) inner.push(L.profile((i / N) * Math.PI * 6));
  const outer = inner.map(([x, y]) => {
    const r = Math.hypot(x, y), a = Math.atan2(y, x);
    return [Math.cos(a) * (r + L.wallT), Math.sin(a) * (r + L.wallT)];
  });
  const shape = new THREE.Shape();
  shape.moveTo(outer[0][0], outer[0][1]);
  for (let i = 1; i < N; i++) shape.lineTo(outer[i][0], outer[i][1]);
  shape.closePath();
  const hole = new THREE.Path();
  hole.moveTo(inner[0][0], inner[0][1]);
  for (let i = N - 1; i >= 1; i--) hole.lineTo(inner[i][0], inner[i][1]);   // 反绕
  hole.closePath();
  shape.holes.push(hole);
  return { shape };
}

/* 转子 Shape：三段侧翼圆弧（尖端 0°/120°/240°，圆心沿平分线距 m，半径 rho） */
function rotorShape(L) {
  const shape = new THREE.Shape();
  const tips = [0, 1, 2].map(i => [L.R * Math.cos(i * 2 * Math.PI / 3), L.R * Math.sin(i * 2 * Math.PI / 3)]);
  const bis = [0, 1, 2].map(i => (i * 2 + 1) * Math.PI / 3);              // 60°/180°/300°
  const Cs = bis.map(b => [L.m * Math.cos(b), L.m * Math.sin(b)]);
  shape.moveTo(tips[0][0], tips[0][1]);
  for (let i = 0; i < 3; i++) {
    const C = Cs[i], tA = tips[i], tB = tips[(i + 1) % 3];
    const a0 = Math.atan2(tA[1] - C[1], tA[0] - C[0]);
    const a1 = Math.atan2(tB[1] - C[1], tB[0] - C[0]);
    let da = a1 - a0; while (da > Math.PI) da -= 2 * Math.PI; while (da < -Math.PI) da += 2 * Math.PI;
    shape.absarc(C[0], C[1], L.rho, a0, a0 + da, false);
  }
  /* 中央轴承孔（偏心轴颈摆动空间） */
  const bore = new THREE.Path();
  bore.absarc(0, 0, L.boreR, 0, Math.PI * 2, true);
  shape.holes.push(bore);
  return shape;
}

export function buildWankel(rawParams, seedInput, forcedId) {
  const { params: P } = validateParams(rawParams);
  const seed = (typeof seedInput === 'number') ? (seedInput >>> 0) : seedFromString(seedInput);
  const rng = makeRng(seed);
  const L = deriveLayout(P);
  const disp = describeParams(P);
  const id = forcedId || `forge-wankel-${seed.toString(36)}`;

  const boltN = [8, 10, 12][rng.int(0, 2)];       // 侧壳连接螺栓
  const tint = () => rng.gauss(0, 0.035);
  const paintBase = rng.pick([0x8c4a3c, 0x2f4a52, 0x3c5a3f, 0x4a4258]);
  const flyTeeth = rng.int(24, 32);

  const builders = {}, assembledPos = {};
  const parts = [];
  const part = (o) => { parts.push(o); return o; };
  const off = (x, y, z) => [x, y, z];

  /* ===== 缸体（epitrochoid 缸壁 + 进排气道） ===== */
  part({
    id: 'housing', zh: '缸体（epitrochoid）', en: 'ROTOR HOUSING', real: false,
    desc: `缸体：内壁型线为 epitrochoid 曲线 x(φ)=e·cosφ+R·cos(φ/3)——转子三尖端沿它滑动的轨迹即这条「8 字压扁」曲线；型线在腰部（短轴）半径 R−e、瓣顶（长轴）R+e。进排气道布置在腰部两侧：排气侧经受最高温，实机在此区段做喷镀处理。概念结构——比例取自参数（R=${P.rotorR}mm / e=${P.ecc}mm / W=${P.width}mm），不代表具体量产机型。`,
    offset: off(0, 0, 0),
  });
  assembledPos.housing = [0, 0, 0];
  builders.housing = (g) => {
    const alu = FORGE_MATS[P.finish === 'painted' ? 'paint' : 'castAlu'](P.finish === 'painted' ? paintBase : tint());
    const hs = housingShapes(L);
    const geo = new THREE.ExtrudeGeometry(hs.shape, { depth: L.W, bevelEnabled: false, curveSegments: 6 });
    geo.translate(0, 0, -L.W / 2);
    const body = new THREE.Mesh(geo, alu);
    body.name = 'F_W_housing_body';
    g.add(body);
    /* 进气道（腰部一侧的铸造气道口） */
    const inA = -Math.PI / 2 + 0.55;
    const inD = mesh(g, box(0.26, 0.34, 0.3), FORGE_MATS.castAlu(tint()),
      [Math.cos(inA) * (L.R + L.wallT + 0.1), Math.sin(inA) * (L.R + L.wallT + 0.1), 0], [0, 0, inA]);
    inD.name = 'F_W_intake_duct';
    /* 排气道（另一侧，实机此处最高温） */
    const exA = -Math.PI / 2 - 0.55;
    mesh(g, box(0.26, 0.3, 0.3), FORGE_MATS.castIron(tint()),
      [Math.cos(exA) * (L.R + L.wallT + 0.1), Math.sin(exA) * (L.R + L.wallT + 0.1), 0], [0, 0, exA]);
  };

  /* ===== 三角转子（径向密封片 + 内齿圈视觉） ===== */
  part({
    id: 'rotor', zh: '三角转子', en: 'ROTOR', real: false,
    desc: '三角转子：三尖端嵌径向密封片（apex seal），三侧翼微微外凸——侧翼圆弧由缸体型线的包络近似求得（圆心距与半径随 e/R 数值求切），保证全相位与缸壁保持间隙。中央内齿圈（概念齿数 3:1）与偏心轴颈配合：轴转一圈，转子同向自转 1/3 圈，同时中心绕主轴公转半径 e。三片侧翼与缸壁围出的三个腔体，随转子转动周期性地经历 进气→压缩→做功→排气。',
    offset: off(0, 0, -1.25),
  });
  assembledPos.rotor = [L.e, 0, 0];                 // 装配位 = E(0)（轴角 0 的偏心位）
  builders.rotor = (g) => {
    const core = new THREE.Group();
    core.name = 'F_W_rotor_core';                   // eccOrbit pick 目标（公转+1/3 自转）
    const alu = FORGE_MATS.castAlu(tint());
    const geo = new THREE.ExtrudeGeometry(rotorShape(L), { depth: L.W * 0.94, bevelEnabled: false, curveSegments: 5 });
    geo.translate(0, 0, -L.W * 0.47);
    const body = new THREE.Mesh(geo, alu);
    body.name = 'F_W_rotor_body';
    core.add(body);
    /* 径向密封片（三尖端，视觉件） */
    const sealMat = FORGE_MATS.forgedSteel();
    for (let i = 0; i < 3; i++) {
      const a = i * 2 * Math.PI / 3;
      const s = new THREE.Mesh(box(0.055, 0.15, L.W * 0.9), sealMat);
      s.position.set(Math.cos(a) * (L.R - 0.045), Math.sin(a) * (L.R - 0.045), 0);
      s.rotation.z = a;
      s.name = 'F_W_apex_seal_' + (i + 1);
      core.add(s);
    }
    /* 内齿圈视觉（detail ≥1：齿块环） */
    if (P.detail >= 1) {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(L.boreR + 0.05, 0.028, 10, 40), FORGE_MATS.machinedSteel());
      ring.name = 'F_W_ring_gear';
      core.add(ring);
      const toothN = 18;
      for (let i = 0; i < toothN; i++) {
        const a = i / toothN * Math.PI * 2;
        const t = new THREE.Mesh(box(0.035, 0.035, 0.07), FORGE_MATS.machinedSteel());
        t.position.set(Math.cos(a) * (L.boreR + 0.05), Math.sin(a) * (L.boreR + 0.05), 0);
        t.rotation.z = a;
        t.name = 'F_W_ring_tooth_' + (i + 1);
        core.add(t);
      }
    }
    g.add(core);
  };

  /* ===== 偏心轴（主轴颈 + 偏心轴颈） ===== */
  part({
    id: 'shaft', zh: '偏心轴', en: 'ECCENTRIC SHAFT', real: false,
    desc: '偏心轴：转子机的「曲轴」。主轴颈与缸体前后主轴承同轴旋转；中段的偏心轴颈偏离主轴心线距离 e，插在转子中央轴承孔内——轴每转一圈，偏心轴颈带着转子中心绕主轴公转半径 e。输出端在飞轮侧。与往复活塞机不同：没有往复质量，转速上限极高（量产机红线 9000rpm 级）。',
    offset: off(0, 0, 1.35),
  });
  assembledPos.shaft = [0, 0, 0];
  builders.shaft = (g) => {
    const steel = FORGE_MATS.machinedSteel();
    const half = L.W / 2 + 0.34;
    mesh(g, cyl(L.shaftR, L.shaftR, half * 2, 24), steel, [0, 0, 0], [Math.PI / 2, 0, 0]).name = 'F_W_main_journal';
    /* 偏心轴颈（child 于 x=e：随轴组自转时自动公转——与 eccOrbit 公式一致） */
    const lobe = mesh(g, cyl(L.lobeR, L.lobeR, L.W * 0.96, 24), steel, [L.e, 0, 0], [Math.PI / 2, 0, 0]);
    lobe.name = 'F_W_ecc_lobe';
    /* 前端法兰与轴头 */
    mesh(g, cyl(0.3, 0.3, 0.08, 24), steel, [0, 0, -half - 0.04], [Math.PI / 2, 0, 0]).name = 'F_W_front_flange';
    mesh(g, cyl(0.12, 0.12, 0.3, 16), steel, [0, 0, -half - 0.2], [Math.PI / 2, 0, 0]).name = 'F_W_front_stub';
  };

  /* ===== 前端盖（主轴承座 + 油封） ===== */
  part({
    id: 'front-cover', zh: '前端盖', en: 'FRONT COVER', real: false,
    desc: '前端盖：封闭缸体前腔，中央主轴承座支承偏心轴主轴颈，外缘油封颈防止机油外泄。实机侧壳还承担进气道的部分铸造成本。连接螺栓由生成种子决定数量。',
    offset: off(0, 0, -2.35),
  });
  assembledPos['front-cover'] = [0, 0, 0];
  builders['front-cover'] = (g) => {
    const alu = FORGE_MATS[P.finish === 'painted' ? 'paint' : 'castAlu'](P.finish === 'painted' ? paintBase : tint());
    const z0 = -L.W / 2 - 0.07;
    const disc = mesh(g, cyl(L.R + L.wallT + 0.12, L.R + L.wallT + 0.12, 0.14, 48), alu, [0, 0, z0], [Math.PI / 2, 0, 0]);
    disc.name = 'F_W_front_disc';
    mesh(g, cyl(0.32, 0.32, 0.22, 24), FORGE_MATS.castAlu(tint()), [0, 0, z0 - 0.16], [Math.PI / 2, 0, 0]).name = 'F_W_front_boss';
    const ring = mesh(g, new THREE.TorusGeometry(L.shaftR + 0.05, 0.03, 8, 32), FORGE_MATS.rubber(), [0, 0, z0 - 0.26], [0, 0, 0]);
    ring.name = 'F_W_front_seal';
    if (P.detail >= 1) {
      for (let i = 0; i < boltN; i++) {
        const a = i / boltN * Math.PI * 2, rr = L.R * 0.82;
        mesh(g, cyl(0.035, 0.035, 0.1, 8), FORGE_MATS.forgedSteel(),
          [Math.cos(a) * rr, Math.sin(a) * rr, z0 - 0.08], [Math.PI / 2, 0, 0]).name = 'F_W_front_bolt_' + (i + 1);
      }
    }
  };

  /* ===== 后端板与飞轮 ===== */
  part({
    id: 'rear-plate', zh: '后端板与飞轮', en: 'REAR PLATE & FLYWHEEL', real: false,
    desc: '后端板：封闭缸体后腔并支承主轴后轴承；外侧飞轮以转动惯量平滑三腔交替做功的扭矩脉动——单转子机每转只有一次做功行程，飞轮比同缸数往复机的更「厚」。齿圈视觉件供起动机啮合。',
    offset: off(0, 0, 2.5),
  });
  assembledPos['rear-plate'] = [0, 0, 0];
  builders['rear-plate'] = (g) => {
    const alu = FORGE_MATS[P.finish === 'painted' ? 'paint' : 'castAlu'](P.finish === 'painted' ? paintBase : tint());
    const z0 = L.W / 2 + 0.07;
    mesh(g, cyl(L.R + L.wallT + 0.12, L.R + L.wallT + 0.12, 0.14, 48), alu, [0, 0, z0], [Math.PI / 2, 0, 0]).name = 'F_W_rear_disc';
    const fly = mesh(g, cyl(0.85, 0.85, 0.16, 40), FORGE_MATS.castIron(tint()), [0, 0, z0 + 0.15], [Math.PI / 2, 0, 0]);
    fly.name = 'F_W_flywheel';
    if (P.detail >= 1) {
      for (let i = 0; i < flyTeeth; i++) {
        const a = i / flyTeeth * Math.PI * 2;
        mesh(g, box(0.045, 0.05, 0.1), FORGE_MATS.machinedSteel(),
          [Math.cos(a) * 0.88, Math.sin(a) * 0.88, z0 + 0.15], [0, 0, a]).name = 'F_W_fly_tooth_' + (i + 1);
      }
    }
  };

  /* ===== 附件皮带轮 ===== */
  part({
    id: 'pulley', zh: '前端皮带轮', en: 'ACCESSORY PULLEY', real: false,
    desc: '附件皮带轮：压装在偏心轴前端，经皮带驱动水泵/发电机等附件（概念示意，不含附件本体）。V 型槽视觉对应多楔带。',
    offset: off(0, 0, -3.1),
  });
  assembledPos.pulley = [0, 0, 0];
  builders.pulley = (g) => {
    const z0 = -L.W / 2 - 0.62;
    mesh(g, cyl(0.42, 0.42, 0.12, 32), FORGE_MATS.castIron(tint()), [0, 0, z0], [Math.PI / 2, 0, 0]).name = 'F_W_pulley_disc';
    mesh(g, new THREE.TorusGeometry(0.34, 0.03, 8, 36), FORGE_MATS.rubber(), [0, 0, z0 - 0.05], [0, 0, 0]).name = 'F_W_pulley_groove';
  };

  /* ===== 双火花塞 ===== */
  part({
    id: 'plugs', zh: '双火花塞', en: 'TWIN SPARK PLUGS', real: false,
    desc: '火花塞 ×2：转子机燃烧室是长条月牙形，火焰传播距离长——量产转子机普遍双塞点火（前后错位）缩短燃烧持续期。布置在缸体腰部附近（做功上止点区段），从缸体侧面径向装入。',
    offset: off(0, 1.5, 0),
  });
  assembledPos.plugs = [0, 0, 0];
  builders.plugs = (g) => {
    const plug = (a) => {
      const rr = L.R + L.wallT;
      const grp = new THREE.Group();
      const body = new THREE.Mesh(cyl(0.045, 0.045, 0.3, 12), FORGE_MATS.machinedSteel());
      const tip = new THREE.Mesh(cyl(0.028, 0.028, 0.1, 10), FORGE_MATS.brass());
      body.position.y = 0.15; tip.position.y = -0.03;
      grp.add(body); grp.add(tip);
      grp.position.set(Math.cos(a) * (rr + 0.08), Math.sin(a) * (rr + 0.08), 0.12);
      grp.rotation.z = a - Math.PI / 2;
      grp.name = 'F_W_plug_' + (a > 0 ? 'L' : 'R');
      g.add(grp);
    };
    plug(Math.PI / 2 - 0.28);
    plug(Math.PI / 2 + 0.28);
  };

  /* 运动演示：选中偏心轴 → 轴自转 + 转子公转 e/自转 1/3 复合 + 皮带轮随动 */
  const f = 0.42;
  const demos = [{
    partId: 'shaft',
    label: '偏心轴 + 转子复合运动演示（3:1 内齿约束示意）',
    spin: [0, 0, f * Math.PI * 2],
    also: [
      { partId: 'rotor', eccOrbit: { pick: (o) => o.name === 'F_W_rotor_core', f, radius: L.e } },
      { partId: 'pulley', spin: [0, 0, f * Math.PI * 2] },
    ],
  }];

  /* ===== V4.0 Mechanism Graph：偏心轴系 + 内齿 3:1 约束 ===== */
  const mechEdges = [
    { id: 'sup-main-f', type: 'bearing_support', from: 'front-cover', to: 'shaft', kinematic: 'exact', note: '前端盖主轴承支承偏心轴主轴颈' },
    { id: 'sup-main-r', type: 'bearing_support', from: 'rear-plate', to: 'shaft', kinematic: 'exact', note: '后端板主轴承支承主轴颈（飞轮端）' },
    { id: 'ecc-pair', type: 'revolute', from: 'shaft', to: 'rotor', kinematic: 'exact', ratio: '3:1（转子=轴速 1/3，同向）', note: '偏心轴颈插入转子中央轴承孔：轴转动时转子中心被带动公转半径 e，转子经内齿约束同向降速自转 1/3' },
    { id: 'gear-internal', type: 'gear_mesh', from: 'housing', to: 'rotor', kinematic: 'exact', ratio: '3:1（内啮合，概念齿 27:9）', note: '缸体（侧壳）内齿圈 × 转子内齿圈——约束公转与自转的 3:1 相位关系（视觉为齿环示意）' },
    { id: 'fx-fc-housing', type: 'fixed', from: 'housing', to: 'front-cover', note: '侧壳螺栓将前端盖固定于缸体端面' },
    { id: 'fx-rp-housing', type: 'fixed', from: 'housing', to: 'rear-plate', note: '侧壳螺栓将后端板固定于缸体端面' },
    { id: 'fx-plugs', type: 'fixed', from: 'housing', to: 'plugs', note: '火花塞径向螺纹旋入缸体（双塞错位布置）' },
    { id: 'fx-pulley', type: 'fixed', from: 'shaft', to: 'pulley', note: '皮带轮键连接于偏心轴前端' },
  ];

  const dev = {
    id,
    name: `锻造转子机 · ${(disp.displacementL * 1000).toFixed(0)}cc 概念机`,
    en: 'FORGED WANKEL — PROCEDURAL CONCEPT',
    category: '机械',
    accent: '#d98e4a',
    description: `MECHANICAL FORGE 程序化生成（生成器 v${GENERATOR_VERSION} · 种子 ${seed}）：单转子 Wankel 概念机，单腔排量 ${disp.displacementL}L（由 R=${P.rotorR}mm × e=${P.ecc}mm × W=${P.width}mm 按 V=3·√3·e·R·W 推导）。缸体型线/转子包络/偏心运动学为真实几何关系；侧翼圆弧为包络的圆弧近似（构建期数值求切）。可拆解、可联动演示（偏心轴自转 + 转子公转自转复合）、参数与种子可复现；非真实可制造工程模型，不标注任何性能参数。`,
    specs: [
      ['布局', '单转子 · 概念示意'],
      ['几何', `R=${P.rotorR} · e=${P.ecc} · W=${P.width} mm`],
      ['排量', `${disp.displacementL}L（3×√3·e·R·W 推导）`],
      ['型线', 'epitrochoid（解析）+ 圆弧包络近似'],
      ['运动', '轴自转 + 转子公转 e / 自转 1/3'],
      ['来源', '本机程序化生成（MECHANICAL FORGE）'],
    ],
    parts,
    builders,
    assembledPos,
    demos,
    mech: { driver: 'shaft', edges: mechEdges },
    tour: [
      { id: 'housing', note: '缸体：epitrochoid 型线的「8 字压扁」内壁——转子三尖端永远贴着它滑动。腰部两侧为进排气道（概念布置）。' },
      { id: 'rotor', note: '三角转子：选中偏心轴观看复合运动——转子中心绕主轴公转半径 e，同时同向自转 1/3 圈；三腔轮流完成进气→压缩→做功→排气（示意口径）。' },
      { id: 'shaft', note: '偏心轴：转子机的曲轴。主轴颈同轴旋转，偏心轴颈偏置 e——没有往复质量，转速上限天然高于往复机。' },
      { id: 'front-cover', note: '前端盖：主轴承座 + 油封；实机侧壳还铸造部分气道。' },
      { id: 'rear-plate', note: '后端板与飞轮：单转子每转一次做功，飞轮平滑扭矩脉动。' },
      { id: 'pulley', note: '附件皮带轮：压装轴端驱动水泵/发电机（示意）。' },
      { id: 'plugs', note: '双火花塞：月牙形燃烧室火焰行程长，双塞错位点火缩短燃烧持续期。' },
    ],
    modelSource: '/forge',
    modelCredit: 'MECHANICAL FORGE · 参数化生成（本机）',
    forge: { generator: GENERATOR_ID, version: GENERATOR_VERSION, params: P, seed },
  };
  return dev;
}
