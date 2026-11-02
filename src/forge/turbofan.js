/* 机械锻造所 · 大涵道比涡扇发动机生成器（V3.0 任务书 PHASE 5 第二标杆）
   布局：双转子（N1 = 风扇+低压压气机+低压涡轮；N2 = 高压压气机+高压涡轮），
   轴向沿 Z（前端 +Z），核心级次沿轴排布；拆解按"核心机上抬分层 + 风扇前抽 + 外涵下脱"分层。
   真实性口径：结构级次/转子差速概念可信的示意模型；不做气动性能声明；
   叶片为参数化扭转收缩平板叶（体现环形分布与扭转趋势，§3.2B）。
   运动演示：选中风扇 → N1 转子（风扇/LPC/LPT）+ N2 转子（HPC/HPT）差速旋转（also 伴随）。 */

import * as THREE from 'three';
import { makeRng, seedFromString } from './rand.js';
import { FORGE_MATS } from './materials.js';

export const GENERATOR_ID = 'turbofan';
export const GENERATOR_VERSION = 1;

export const SCHEMA = {
  fanDiameter: { type: 'range', min: 1500, max: 2400, step: 50, default: 2000, label: '风扇直径', unit: 'mm' },
  bpr: { type: 'range', min: 4, max: 12, step: 0.5, default: 9, label: '涵道比', unit: ':1', note: '外涵/内涵质量流量概念比——影响外涵道筒宽' },
  hpcStages: { type: 'range', min: 5, max: 8, step: 1, default: 6, label: '高压压气机级数', unit: '级' },
  lptStages: { type: 'range', min: 2, max: 4, step: 1, default: 3, label: '低压涡轮级数', unit: '级' },
  finish: { type: 'enum', options: ['bare', 'painted'], default: 'bare', label: '短舱表面', note: 'bare=金属裸色；painted=涂装短舱' },
  detail: { type: 'range', min: 0, max: 2, step: 1, default: 1, label: '细节密度', unit: '级' },
};

export const PRESETS = [
  { id: 'widebody', label: '宽体大涵道', params: { fanDiameter: 2400, bpr: 11, hpcStages: 7, lptStages: 4, finish: 'painted', detail: 2 } },
  { id: 'narrowbody', label: '窄体均衡', params: { fanDiameter: 2000, bpr: 9, hpcStages: 6, lptStages: 3, finish: 'bare', detail: 1 } },
  { id: 'business', label: '公务机小涵道', params: { fanDiameter: 1500, bpr: 5, hpcStages: 5, lptStages: 2, finish: 'bare', detail: 0 } },
];

export function defaultParams() {
  const out = {};
  for (const k of Object.keys(SCHEMA)) out[k] = SCHEMA[k].default;
  return out;
}

export function validateParams(p) {
  const out = {}, errs = [];
  for (const k of Object.keys(SCHEMA)) {
    const s = SCHEMA[k], v = p && p[k];
    if (s.type === 'enum') out[k] = s.options.includes(v) ? v : s.default;
    else if (s.type === 'range') {
      const n = Number(v);
      if (!Number.isFinite(n)) { out[k] = s.default; continue; }
      out[k] = s.step >= 1 ? Math.min(s.max, Math.max(s.min, Math.round(n / s.step) * s.step))
                           : Math.min(s.max, Math.max(s.min, Math.round(n / s.step) * s.step));
    } else out[k] = s.default;
  }
  return { params: out, errors: errs };
}

/* ---------- 布局推导（直接以模型单位设计，1u ≈ 视觉一致尺度；风扇半径 fanR） ---------- */
function deriveLayout(P) {
  const fanR = P.fanDiameter / 1000 * 1.12;         // 2m → 2.24u
  const hubR = fanR * 0.34;
  const coreR = hubR * 0.62;                         // 核心机最大轮毂半径
  const bprW = (P.bpr / 9) * 0.52;                   // 外涵道环厚（概念映射）
  const nacelleR = fanR + 0.34 + bprW * 0.35;
  const zFan = 2.9;
  const zLpc = [1.55, 1.05, 0.55].slice(0, 3);       // 3 级 LPC（固定）
  const zHpc = Array.from({ length: P.hpcStages }, (_, i) => 0.1 - i * 0.42);
  const zComb = zHpc[P.hpcStages - 1] - 0.62;
  const zHpt = zComb - 0.55;
  const zLpt = Array.from({ length: P.lptStages }, (_, i) => zHpt - 0.55 - i * 0.5);
  const zNoz = zLpt[P.lptStages - 1] - 0.75;
  return { fanR, hubR, coreR, bprW, nacelleR, zFan, zLpc, zHpc, zComb, zHpt, zLpt, zNoz };
}

/* ---------- 扭转收缩叶片：Box 顶点级锥度+扭转（径向沿局部 +Y） ---------- */
function bladeGeo(chord, span, thick, taper, twist) {
  const g = new THREE.BoxGeometry(chord, span, thick, 1, 1, 1);
  g.translate(0, span / 2, 0);
  const pos = g.attributes.position;
  const c = Math.cos(twist), s = Math.sin(twist);
  for (let i = 0; i < pos.count; i++) {
    if (pos.getY(i) > span / 2 - 1e-6) {
      const x = pos.getX(i), z = pos.getZ(i);
      pos.setX(i, x * taper * c - z * s);
      pos.setZ(i, x * taper * s + z * c);
    }
  }
  g.computeVertexNormals();
  return g;
}

/* ---------- 转子级：轮毂盘 + 环形叶片阵列（叶片局部 +Y 转向径向） ---------- */
function stage({ rHub, rTip, n, chord, twist, thick, hubW, discMat, bladeMat, name }) {
  const g = new THREE.Group();
  const disc = new THREE.Mesh(new THREE.CylinderGeometry(rHub, rHub, hubW, 28), discMat);
  disc.rotation.x = Math.PI / 2;
  disc.name = name + '_disc';
  g.add(disc);
  for (let i = 0; i < n; i++) {
    const a = i / n * Math.PI * 2;
    const b = new THREE.Mesh(bladeGeo(chord, rTip - rHub, thick, 0.55, twist), bladeMat);
    b.position.set(Math.cos(a) * rHub, Math.sin(a) * rHub, 0);
    b.rotation.z = a - Math.PI / 2;
    b.name = name + '_blade' + i;
    g.add(b);
  }
  return g;
}

function mesh(g, geo, mat, pos = [0, 0, 0], rot = null, name = '') {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(...pos);
  if (rot) m.rotation.set(...rot);
  if (name) m.name = name;
  g.add(m);
  return m;
}
const cyl = (r1, r2, h, seg = 24) => new THREE.CylinderGeometry(r1, r2, h, seg);

/* ---------- 主生成入口 ---------- */
export function buildTurbofan(rawParams, seedInput, forcedId) {
  const { params: P } = validateParams(rawParams);
  const seed = (typeof seedInput === 'number') ? (seedInput >>> 0) : seedFromString(seedInput);
  const rng = makeRng(seed);
  const L = deriveLayout(P);

  const fanBlades = rng.int(18, 24);
  const spinnerSpiral = rng.chance(0.7);           // 风扇整流锥螺旋标线（多数机型有）
  const injectorN = rng.int(16, 22);
  const tint = () => rng.gauss(0, 0.035);
  const paintBase = rng.pick([0xdfe3e6, 0xcfd6da, 0x39435e]);

  const builders = {}, assembledPos = {};
  const parts = [];
  const part = (o) => { parts.push(o); return o; };

  /* ===== 短舱（进气唇口 + 外壳 + 反推缝示意） ===== */
  part({
    id: 'nacelle', zh: '短舱与进气唇口', en: 'NACELLE & INLET LIP', real: false,
    desc: '风扇外的短舱壳体：前缘为进气唇口（环形），外侧反推缝为示意结构。拆解时上抬前移让出风扇通道。',
    offset: [0, 1.6, 1.4],
  });
  assembledPos.nacelle = [0, 0, 0];
  builders.nacelle = (g) => {
    const shellMat = P.finish === 'painted' ? FORGE_MATS.paint(paintBase) : FORGE_MATS.castAlu(tint());
    const shell = new THREE.Mesh(new THREE.CylinderGeometry(L.nacelleR, L.nacelleR * 1.02, 3.4, 40, 1, true), shellMat);
    shell.material.side = THREE.DoubleSide;
    shell.rotation.x = Math.PI / 2;
    shell.position.set(0, 0, L.zFan - 0.7);
    shell.name = 'nac_shell';
    g.add(shell);
    const lip = new THREE.Mesh(new THREE.TorusGeometry(L.nacelleR, 0.09, 12, 44), FORGE_MATS.machinedSteel());
    lip.position.set(0, 0, L.zFan + 1.02);
    g.add(lip);
    if (P.detail >= 1) {   // 反推缝（两条环带）
      for (const dz of [-0.5, -0.9]) {
        const seam = new THREE.Mesh(new THREE.TorusGeometry(L.nacelleR * 1.012, 0.022, 8, 44), FORGE_MATS.forgedSteel());
        seam.position.set(0, 0, L.zFan - 0.7 + dz);
        g.add(seam);
      }
    }
  };

  /* ===== 风扇转子（整流锥 + 风扇叶片 + N1 轴） ===== */
  part({
    id: 'fan', zh: '风扇转子（N1 前端）', en: 'FAN ROTOR (N1)', real: false,
    desc: `大涵道比涡扇的第一级：${fanBlades} 片宽弦扭转风扇叶片环列于轮毂，整流锥${spinnerSpiral ? '带螺旋标线（地面运转标识）' : '为光锥'}；N1 轴向后贯穿连接低压压气机与低压涡轮。旋转演示为 N1/N2 双转子差速示意。`,
    offset: [0, 0, 2.8],
  });
  assembledPos.fan = [0, 0, 0];
  builders.fan = (g) => {
    const steel = FORGE_MATS.forgedSteel();
    const spinner = new THREE.Mesh(cyl(0.06, L.hubR * 0.92, 0.55, 26), FORGE_MATS.machinedSteel());
    spinner.rotation.x = -Math.PI / 2;
    spinner.position.set(0, 0, L.zFan + 0.75);
    spinner.name = 'fan_spinner';
    g.add(spinner);
    if (spinnerSpiral) {
      const mark = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.4, 0.02), FORGE_MATS.paint(0x22262a));
      mark.position.set(L.hubR * 0.4, 0, L.zFan + 1.0);
      mark.rotation.z = 0.5;
      g.add(mark);
    }
    const fanStage = stage({
      rHub: L.hubR, rTip: L.fanR, n: fanBlades, chord: 0.42, twist: 0.62, thick: 0.05,
      hubW: 0.5, discMat: steel, bladeMat: FORGE_MATS.machinedSteel(), name: 'fan_stage',
    });
    fanStage.position.set(0, 0, L.zFan);
    g.add(fanStage);
    /* N1 空心轴（向后贯穿至 LPT） */
    const shaft = new THREE.Mesh(cyl(0.17, 0.17, L.zFan - L.zLpt[L.zLpt.length - 1] + 0.6, 20), steel);
    shaft.rotation.x = Math.PI / 2;
    shaft.position.set(0, 0, (L.zFan + L.zLpt[L.zLpt.length - 1]) / 2);
    shaft.name = 'fan_shaftN1';
    g.add(shaft);
  };

  /* ===== 低压压气机（N1，3 级） ===== */
  part({
    id: 'lpc', zh: '低压压气机 ×3 级', en: 'LOW-PRESSURE COMPRESSOR', real: false,
    desc: 'N1 转子增压级：三级由宽渐窄的转子盘+叶片组成，概念上继续压缩进入核心机的气流。',
    offset: [0, 1.7, 0.4],
  });
  assembledPos.lpc = [0, 0, 0];
  builders.lpc = (g) => {
    L.zLpc.forEach((z, i) => {
      const rTip = L.coreR * (1.5 - i * 0.12);
      const st = stage({
        rHub: L.coreR * 0.52, rTip, n: 22, chord: 0.16, twist: 0.55, thick: 0.03,
        hubW: 0.16, discMat: FORGE_MATS.forgedSteel(), bladeMat: FORGE_MATS.machinedSteel(), name: 'lpc' + i,
      });
      st.position.set(0, 0, z);
      g.add(st);
    });
  };

  /* ===== 高压压气机（N2，参数级数） ===== */
  part({
    id: 'hpc', zh: `高压压气机 ×${P.hpcStages} 级（N2）`, en: 'HIGH-PRESSURE COMPRESSOR', real: false,
    desc: `N2 转子核心增压级：${P.hpcStages} 级叶片盘直径逐级收敛（压力升高、体积减小——概念几何趋势）；中心为 N2 空心轴，前端与风扇 N1 轴嵌套同轴。`,
    offset: [0, 2.3, -0.2],
  });
  assembledPos.hpc = [0, 0, 0];
  builders.hpc = (g) => {
    L.zHpc.forEach((z, i) => {
      const rTip = L.coreR * (1.35 - i / P.hpcStages * 0.42);
      const st = stage({
        rHub: L.coreR * 0.42, rTip, n: 24, chord: 0.13, twist: 0.5, thick: 0.026,
        hubW: 0.14, discMat: FORGE_MATS.forgedSteel(), bladeMat: FORGE_MATS.machinedSteel(), name: 'hpc' + i,
      });
      st.position.set(0, 0, z);
      g.add(st);
    });
    const shaft = new THREE.Mesh(cyl(0.09, 0.09, L.zHpc[0] - L.zHpt + 0.7, 18), FORGE_MATS.machinedSteel());
    shaft.rotation.x = Math.PI / 2;
    shaft.position.set(0, 0, (L.zHpc[0] + L.zHpt) / 2);
    shaft.name = 'hpc_shaftN2';
    g.add(shaft);
  };

  /* ===== 燃烧室（环形示意） ===== */
  part({
    id: 'combustor', zh: '燃烧室（环形示意）', en: 'COMBUSTOR (ANNULAR)', real: false,
    desc: '环形燃烧室概念结构：外机匣 + 环形火焰筒 + 一圈燃油喷嘴（数量随种子）。仅示意腔体几何，不涉及燃烧过程。',
    offset: [0, 2.9, -0.6],
  });
  assembledPos.combustor = [0, 0, 0];
  builders.combustor = (g) => {
    const caseR = L.coreR * 1.18;
    const casing = new THREE.Mesh(new THREE.CylinderGeometry(caseR, caseR * 0.92, 0.7, 30, 1, true), FORGE_MATS.castIron(tint()));
    casing.material.side = THREE.DoubleSide;
    casing.rotation.x = Math.PI / 2;
    casing.position.set(0, 0, L.zComb);
    g.add(casing);
    const liner = new THREE.Mesh(new THREE.CylinderGeometry(L.coreR * 0.78, L.coreR * 0.78, 0.44, 24, 1, true), FORGE_MATS.castIron(tint() + 0.05));
    liner.material.side = THREE.DoubleSide;
    liner.rotation.x = Math.PI / 2;
    liner.position.set(0, 0, L.zComb);
    g.add(liner);
    for (let i = 0; i < injectorN; i++) {
      const a = i / injectorN * Math.PI * 2;
      const inj = new THREE.Mesh(cyl(0.045, 0.045, 0.12, 8), FORGE_MATS.brass());
      inj.rotation.x = Math.PI / 2;
      inj.position.set(Math.cos(a) * caseR, Math.sin(a) * caseR, L.zComb + 0.3);
      g.add(inj);
    }
  };

  /* ===== 高压涡轮（N2，1 级） ===== */
  part({
    id: 'hpt', zh: '高压涡轮 ×1 级（N2）', en: 'HIGH-PRESSURE TURBINE', real: false,
    desc: '紧邻燃烧室的单级高压涡轮：燃气膨胀做功驱动 N2 转子，反向带动高压压气机（差速演示中的高速转子）。',
    offset: [0, 2.3, -1.0],
  });
  assembledPos.hpt = [0, 0, 0];
  builders.hpt = (g) => {
    const st = stage({
      rHub: L.coreR * 0.5, rTip: L.coreR * 1.12, n: 18, chord: 0.2, twist: -0.55, thick: 0.04,
      hubW: 0.2, discMat: FORGE_MATS.forgedSteel(), bladeMat: FORGE_MATS.brass(), name: 'hpt0',
    });
    st.position.set(0, 0, L.zHpt);
    g.add(st);
  };

  /* ===== 低压涡轮（N1，参数级数） ===== */
  part({
    id: 'lpt', zh: `低压涡轮 ×${P.lptStages} 级（N1）`, en: 'LOW-PRESSURE TURBINE', real: false,
    desc: 'N1 转子的动力端：多级涡轮逐级放大直径，经 N1 轴反驱风扇与低压压气机。',
    offset: [0, 1.7, -1.5],
  });
  assembledPos.lpt = [0, 0, 0];
  builders.lpt = (g) => {
    L.zLpt.forEach((z, i) => {
      const st = stage({
        rHub: L.coreR * 0.5, rTip: L.coreR * (1.05 + i * 0.14), n: 16, chord: 0.18, twist: -0.5, thick: 0.04,
        hubW: 0.18, discMat: FORGE_MATS.forgedSteel(), bladeMat: FORGE_MATS.brass(), name: 'lpt' + i,
      });
      st.position.set(0, 0, z);
      g.add(st);
    });
  };

  /* ===== 外涵道筒 ===== */
  part({
    id: 'bypass', zh: '外涵道筒', en: 'BYPASS DUCT', real: false,
    desc: `风扇后外涵气流通道的筒壁（涵道比 ${P.bpr}:1 的概念映射——环厚随涵道比变化）；下脱拆解露出核心机。`,
    offset: [0, -1.7, 0],
  });
  assembledPos.bypass = [0, 0, 0];
  builders.bypass = (g) => {
    const rIn = L.fanR * 0.78, rOut = rIn + L.bprW;
    const duct = new THREE.Mesh(new THREE.CylinderGeometry(rOut, rIn * 0.96, 2.6, 36, 1, true), FORGE_MATS.castAlu(tint()));
    duct.material.side = THREE.DoubleSide;
    duct.rotation.x = Math.PI / 2;
    duct.position.set(0, 0, L.zFan - 1.2);
    g.add(duct);
  };

  /* ===== 尾喷口 ===== */
  part({
    id: 'exhaust', zh: '尾喷口与尾锥', en: 'EXHAUST NOZZLE & CONE', real: false,
    desc: '核心喷口收敛段 + 尾锥（整流燃气排出方向的概念示意）。',
    offset: [0, 0, -2.2],
  });
  assembledPos.exhaust = [0, 0, 0];
  builders.exhaust = (g) => {
    const noz = new THREE.Mesh(cyl(L.coreR * 0.72, L.coreR * 0.55, 0.6, 28, 1, true), FORGE_MATS.castIron(tint() + 0.04));
    noz.material.side = THREE.DoubleSide;
    noz.rotation.x = Math.PI / 2;
    noz.position.set(0, 0, L.zNoz + 0.1);
    g.add(noz);
    const cone = new THREE.Mesh(cyl(0.03, L.coreR * 0.5, 0.9, 24), FORGE_MATS.forgedSteel());
    cone.rotation.x = -Math.PI / 2;
    cone.position.set(0, 0, L.zNoz - 0.5);
    g.add(cone);
  };

  /* 双转子差速演示：N1（风扇/LPC/LPT）与 N2（HPC/HPT）同向不同速（N2 更快，概念口径） */
  const demos = [{
    partId: 'fan',
    label: '双转子差速旋转演示（N1/N2 概念）',
    spin: [0, 0, -3.6],
    also: [
      { partId: 'lpc', spin: [0, 0, -3.6] },
      { partId: 'lpt', spin: [0, 0, -3.6] },
      { partId: 'hpc', spin: [0, 0, 6.2] },
      { partId: 'hpt', spin: [0, 0, 6.2] },
    ],
  }];

  const dev = {
    id: forcedId || `forge-turbofan-${seed.toString(36)}`,
    name: `锻造涡扇 · ${P.fanDiameter}mm 风扇概念机`,
    en: 'FORGED TURBOFAN — PROCEDURAL CONCEPT',
    category: '机械',
    accent: '#6fb7d9',
    description: `MECHANICAL FORGE 程序化生成（生成器 v${GENERATOR_VERSION} · 种子 ${seed}）：大涵道比双转子涡扇概念示意——风扇直径 ${P.fanDiameter}mm、涵道比 ${P.bpr}:1（概念映射）、HPC ${P.hpcStages} 级 / LPT ${P.lptStages} 级。叶片为参数化扭转收缩平板叶，体现环形分布与扭转趋势；N1/N2 差速旋转为概念演示。非真实工程模型，不标注推力/油耗等性能参数。`,
    specs: [
      ['布局', '大涵道比 · 双转子（N1/N2）'],
      ['风扇直径', `${P.fanDiameter} mm`],
      ['涵道比', `${P.bpr} : 1（概念映射）`],
      ['级次', `LPC 3 + HPC ${P.hpcStages} + HPT 1 + LPT ${P.lptStages}`],
      ['构件', '9 部件组 · 全参数化网格'],
      ['运动', '双转子差速旋转（概念演示）'],
      ['来源', '本机程序化生成（MECHANICAL FORGE）'],
    ],
    parts,
    builders,
    assembledPos,
    demos,
    /* V4.0 MI① 推广：双转子涡扇 mech（N1/N2 轴系；外壳静止不参与旋转链） */
    mech: { driver: 'fan', edges: [
      { id: 'sc-n1-fan-lpc', type: 'shaft_coupling', from: 'fan', to: 'lpc', kinematic: 'exact', note: 'N1 轴：风扇与低压压气机同轴同速', ratio: 1 },
      { id: 'sc-n1-lpc-lpt', type: 'shaft_coupling', from: 'lpc', to: 'lpt', kinematic: 'exact', note: 'N1 轴贯通：低压涡轮反驱低压压气机与风扇', ratio: 1 },
      { id: 'sc-n2-hpc-hpt', type: 'shaft_coupling', from: 'hpt', to: 'hpc', kinematic: 'exact', note: 'N2 轴：高压涡轮驱动高压压气机（转速高于 N1，差速见演示）', ratio: 1 },
      { id: 'bs-nac-fan', type: 'bearing_support', from: 'nacelle', to: 'fan', kinematic: 'exact', note: '风扇转子前轴承支承于短舱前机匣' },
      { id: 'fx-bypass', type: 'fixed', from: 'nacelle', to: 'bypass', note: '外涵道筒与短舱后段连接' },
      { id: 'fx-comb-hpc', type: 'fixed', from: 'hpc', to: 'combustor', note: '燃烧室机匣与高压压气机后端连接' },
      { id: 'fx-comb-hpt', type: 'fixed', from: 'combustor', to: 'hpt', note: '高压涡轮进口与燃烧室出口连接' },
      { id: 'fx-noz', type: 'fixed', from: 'lpt', to: 'exhaust', note: '尾喷口与低压涡轮后机匣连接' },
    ] },
    modelSource: '/forge',
    modelCredit: 'MECHANICAL FORGE · 参数化生成（本机）',
    forge: { generator: GENERATOR_ID, version: GENERATOR_VERSION, params: P, seed },
  };
  return dev;
}
