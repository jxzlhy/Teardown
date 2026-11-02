/* 机械锻造所 · 科幻复合动力核心（V3.0 任务书 PHASE 6 创造性标杆）
   概念：FORGE-99 环式磁耦合动力核心 —— 虚构机构：中央转子以磁悬浮方式（无接触轴）
   悬于三条励磁定子环内，转子经磁耦合驱动太阳轮-行星轮-齿圈复合轮系输出。
   真实性口径（任务书 §2.3/§3.2C）：轮系几何（模数/齿数/啮合半径）按真实机械关系构造；
   磁悬浮/能量导管为虚构概念层，页面与描述明示"虚构概念模型 / 非真实工程设备"。
   运动演示：核心转子自转 + 行星轮支架公转（行星轮自转未模拟——示意口径，描述注明）。 */

import * as THREE from 'three';
import { makeRng, seedFromString } from './rand.js';
import { FORGE_MATS } from './materials.js';

export const GENERATOR_ID = 'ringdrive';
export const GENERATOR_VERSION = 1;

export const SCHEMA = {
  planets: { type: 'enum', options: [3, 4], default: 3, label: '行星轮数', unit: '个', note: '均布于太阳轮外圈' },
  ringR: { type: 'range', min: 1.1, max: 1.6, step: 0.05, default: 1.35, label: '齿圈半径', unit: 'u', note: '决定行星轮啮合位与整机径向' },
  coils: { type: 'range', min: 8, max: 20, step: 1, default: 12, label: '每环励磁块数', unit: '块' },
  spokes: { type: 'range', min: 4, max: 8, step: 1, default: 6, label: '辐条臂数', unit: '根' },
  hue: { type: 'enum', options: ['teal', 'amber', 'violet'], default: 'teal', label: '能量色系', note: '磁轨/导管发光色调（虚构层）' },
  detail: { type: 'range', min: 0, max: 2, step: 1, default: 1, label: '细节密度', unit: '级' },
};

export const PRESETS = [
  { id: 'std', label: '标准构型', params: { planets: 3, ringR: 1.35, coils: 12, spokes: 6, hue: 'teal', detail: 1 } },
  { id: 'heavy', label: '重载四行星', params: { planets: 4, ringR: 1.55, coils: 18, spokes: 8, hue: 'amber', detail: 2 } },
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
      out[k] = Math.min(s.max, Math.max(s.min, Math.round(n / s.step) * s.step));
    } else out[k] = s.default;
  }
  return { params: out, errors: errs };
}

const HUE = { teal: { ring: 0x2fd8c8, duct: 0x45e0ff }, amber: { ring: 0xe0a458, duct: 0xf0b429 }, violet: { ring: 0x9a7ae0, duct: 0xc792ea } };

/* 齿轮：轮毂盘 + 圈布齿块（概念级轮系几何：齿数/半径按模数关系取值） */
function gear(r, teeth, w, mat, name) {
  const g = new THREE.Group();
  const disc = new THREE.Mesh(new THREE.CylinderGeometry(r, r, w, 30), mat);
  disc.rotation.x = Math.PI / 2;
  disc.name = name + '_disc';
  g.add(disc);
  const tooth = new THREE.Mesh;
  const tGeo = new THREE.BoxGeometry(r * 0.16, r * 0.13, w * 0.9);
  for (let i = 0; i < teeth; i++) {
    const a = i / teeth * Math.PI * 2;
    const t = new THREE.Mesh(tGeo, mat);
    t.position.set(Math.cos(a) * (r + r * 0.055), Math.sin(a) * (r + r * 0.055), 0);
    t.rotation.z = a;
    t.name = name + '_tooth' + i;
    g.add(t);
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

export function buildRingDrive(rawParams, seedInput, forcedId) {
  const { params: P } = validateParams(rawParams);
  const seed = (typeof seedInput === 'number') ? (seedInput >>> 0) : seedFromString(seedInput);
  const rng = makeRng(seed);
  const hue = HUE[P.hue];

  /* 轮系几何（模数概念一致）：太阳轮/行星轮/齿圈啮合半径相扣 */
  const sunR = 0.5, planetR = (P.ringR - sunR) / 2;
  const planetOrbit = sunR + planetR;
  const sunTeeth = 18, planetTeeth = Math.round(planetR / sunR * sunTeeth), ringTeeth = Math.round(P.ringR / sunR * sunTeeth);
  const coilN = P.coils;
  const spokeN = P.spokes;
  const frameN = 8;

  const builders = {}, assembledPos = {};
  const parts = [];
  const part = (o) => { parts.push(o); return o; };

  /* ===== 核心悬浮转子（虚构磁悬浮层 + 真实输出轴） ===== */
  part({
    id: 'coreRotor', zh: '核心悬浮转子', en: 'CORE MAGLEV ROTOR', real: false,
    desc: '虚构概念件：转子与定子环之间无机械接触（磁悬浮约束层），中央输出轴与太阳轮刚性连接。旋转演示即主输出（轴系旋转为真实机械行为，悬浮约束为虚构层）。',
    offset: [0, 0, 2.6],
  });
  assembledPos.coreRotor = [0, 0, 0];
  builders.coreRotor = (g) => {
    const steel = FORGE_MATS.forgedSteel();
    const shaft = mesh(g, new THREE.CylinderGeometry(0.14, 0.14, 3.6, 18), steel, [0, 0, 0], [Math.PI / 2, 0, 0], 'core_shaft');
    const rotor = mesh(g, new THREE.CylinderGeometry(0.72, 0.72, 0.9, 28), FORGE_MATS.machinedSteel(), [0, 0, 0], [Math.PI / 2, 0, 0], 'core_rotor');
    for (let i = 0; i < 8; i++) {   // 转子磁极块（虚构层）
      const a = i / 8 * Math.PI * 2;
      mesh(g, new THREE.BoxGeometry(0.2, 0.12, 0.7), FORGE_MATS.brass(),
        [Math.cos(a) * 0.74, Math.sin(a) * 0.74, 0], [0, 0, a], 'core_pole' + i);
    }
    const nose = mesh(g, new THREE.CylinderGeometry(0.03, 0.14, 0.5, 16), steel, [0, 0, 2.0], [Math.PI / 2, 0, 0], 'core_nose');
    return g;
  };

  /* ===== 定子磁轨 ×3（励磁块随参数/种子） ===== */
  part({
    id: 'statorRings', zh: '定子磁轨 ×3', en: 'STATOR MAG RINGS', real: false,
    desc: `三条环形励磁轨道（每环 ${coilN} 块励磁体）围合悬浮间隙——通电后在概念上形成径向/轴向约束磁场。励磁块数与色系随参数。`,
    offset: [0, 1.4, 0.8],
  });
  assembledPos.statorRings = [0, 0, 0];
  builders.statorRings = (g) => {
    const iron = FORGE_MATS.castIron();
    [-1.0, 0, 1.0].forEach((z, ri) => {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(1.02, 0.09, 12, 44), iron);
      ring.position.set(0, 0, z);
      ring.name = 'stator_ring' + ri;
      g.add(ring);
      for (let i = 0; i < coilN; i++) {
        const a = i / coilN * Math.PI * 2;
        const c = mesh(g, new THREE.BoxGeometry(0.16, 0.16, 0.14), FORGE_MATS.paint(hue.ring),
          [Math.cos(a) * 1.02, Math.sin(a) * 1.02, z], [0, 0, a], 'stator_coil' + ri + '_' + i);
      }
    });
  };

  /* ===== 太阳轮（输出端，真实轮系） ===== */
  part({
    id: 'sunGear', zh: '太阳轮', en: 'SUN GEAR', real: false,
    desc: `轮系输入级：${sunTeeth} 齿（概念模数一致），与核心转子输出轴连接，与 ${P.planets} 个行星轮外啮合。`,
    offset: [0, 0, 1.6],
  });
  assembledPos.sunGear = [0, 0, 0];
  builders.sunGear = (g) => {
    const gr = gear(sunR, sunTeeth, 0.3, FORGE_MATS.machinedSteel(), 'sun');
    g.add(gr);
  };

  /* ===== 行星轮支架（含行星轮；公转演示，自转未模拟——示意口径） ===== */
  part({
    id: 'carrier', zh: `行星轮支架（含 ×${P.planets}）`, en: 'PLANET CARRIER', real: false,
    desc: `支架带动 ${P.planets} 个行星轮沿齿圈公转（齿数 ${planetTeeth}，啮合半径 ${planetOrbit.toFixed(2)}）；行星轮自转由啮合方程解析推导 ω_p = ω_c·(1 − Z_r/Z_p)，公转+自转复合运动与轮系几何一致。`,
    offset: [0, 2.0, 0],
  });
  assembledPos.carrier = [0, 0, 0];
  builders.carrier = (g) => {
    const steel = FORGE_MATS.forgedSteel();
    const web = mesh(g, new THREE.CylinderGeometry(planetOrbit * 0.5, planetOrbit * 0.5, 0.12, 26), steel, [0, 0, 0.22], [Math.PI / 2, 0, 0], 'carrier_web');
    for (let i = 0; i < P.planets; i++) {
      const a = i / P.planets * Math.PI * 2;
      const px = Math.cos(a) * planetOrbit, py = Math.sin(a) * planetOrbit;
      const pin = mesh(g, new THREE.CylinderGeometry(0.07, 0.07, 0.5, 12), steel, [px, py, 0], [Math.PI / 2, 0, 0], 'carrier_pin' + i);
      const pl = gear(planetR, planetTeeth, 0.28, FORGE_MATS.machinedSteel(), 'planet' + i);
      pl.position.set(px, py, 0);
      pl.name = 'planet_gear' + i;
      g.add(pl);
    }
  };

  /* ===== 齿圈（内齿，输出/反作用构件） ===== */
  part({
    id: 'ringGear', zh: '齿圈（内齿）', en: 'RING GEAR', real: false,
    desc: `内齿圈：${ringTeeth} 齿，与行星轮内啮合；概念上可固定（机架）或反向输出——本构型取固定机架。`,
    offset: [0, -1.5, 0],
  });
  assembledPos.ringGear = [0, 0, 0];
  builders.ringGear = (g) => {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(P.ringR + 0.08, 0.11, 12, 48), FORGE_MATS.castIron());
    ring.name = 'ringgear_body';
    g.add(ring);
    for (let i = 0; i < ringTeeth; i++) {
      const a = i / ringTeeth * Math.PI * 2;
      const t = mesh(g, new THREE.BoxGeometry(0.07, 0.1, 0.26), FORGE_MATS.castIron(),
        [Math.cos(a) * (P.ringR - 0.03), Math.sin(a) * (P.ringR - 0.03), 0], [0, 0, a], 'ringgear_tooth' + i);
    }
    for (let i = 0; i < 4; i++) {   // 机架固定耳
      const a = i / 4 * Math.PI * 2 + Math.PI / 4;
      mesh(g, new THREE.BoxGeometry(0.3, 0.1, 0.4), FORGE_MATS.castIron(),
        [Math.cos(a) * (P.ringR + 0.24), Math.sin(a) * (P.ringR + 0.24), 0], [0, 0, a], 'ringgear_ear' + i);
    }
  };

  /* ===== 辐条臂 ×n（含减振球节概念件） ===== */
  part({
    id: 'spokes', zh: `辐条臂 ×${spokeN}`, en: 'RADIAL STRUTS', real: false,
    desc: '连接齿圈与外承力框架的传力臂，根部为球节减振概念件；传力路径示意。',
    offset: [0, 0.8, -1.6],
  });
  assembledPos.spokes = [0, 0, 0];
  builders.spokes = (g) => {
    for (let i = 0; i < spokeN; i++) {
      const a = i / spokeN * Math.PI * 2;
      const arm = mesh(g, new THREE.BoxGeometry(0.1, (2.6 - P.ringR) + 0.5, 0.14), FORGE_MATS.forgedSteel(),
        [Math.cos(a) * ((P.ringR + 2.4) / 2 + 0.1), Math.sin(a) * ((P.ringR + 2.4) / 2 + 0.1), 0], [0, 0, a], 'spoke' + i);
      const ball = mesh(g, new THREE.SphereGeometry(0.11, 14, 10), FORGE_MATS.rubber(),
        [Math.cos(a) * (P.ringR + 0.28), Math.sin(a) * (P.ringR + 0.28), 0], null, 'spoke_ball' + i);
    }
  };

  /* ===== 外承力框架（8 边桁架） ===== */
  part({
    id: 'frame', zh: '外承力框架', en: 'LOAD FRAME', real: false,
    desc: '8 边桁架式承力框架：安装节与辐条臂外端连接，承受反扭矩（概念载荷路径）。',
    offset: [0, 0, -2.6],
  });
  assembledPos.frame = [0, 0, 0];
  builders.frame = (g) => {
    const steel = FORGE_MATS.forgedSteel();
    const R = 2.55;
    for (let i = 0; i < frameN; i++) {
      const a = i / frameN * Math.PI * 2;
      const a2 = (i + 1) / frameN * Math.PI * 2;
      const x1 = Math.cos(a) * R, y1 = Math.sin(a) * R, x2 = Math.cos(a2) * R, y2 = Math.sin(a2) * R;
      const len = Math.hypot(x2 - x1, y2 - y1);
      const beam = mesh(g, new THREE.BoxGeometry(len, 0.09, 0.12), steel,
        [(x1 + x2) / 2, (y1 + y2) / 2, 0], [0, 0, Math.atan2(y2 - y1, x2 - x1)], 'frame_beam' + i);
      const node = mesh(g, new THREE.SphereGeometry(0.13, 12, 10), FORGE_MATS.castIron(), [x1, y1, 0], null, 'frame_node' + i);
    }
    if (P.detail >= 1) {   // 斜撑
      for (let i = 0; i < frameN; i++) {
        const a = i / frameN * Math.PI * 2;
        mesh(g, new THREE.BoxGeometry(0.06, 0.9, 0.06), steel,
          [Math.cos(a) * (R + 0.3), Math.sin(a) * (R + 0.3), -0.4], [0.5 * (i % 2 ? 1 : -1), 0, a], 'frame_brace' + i);
      }
    }
  };

  /* ===== 能量导管簇（虚构层） ===== */
  part({
    id: 'ducts', zh: '能量导管簇', en: 'ENERGY DUCTS', real: false,
    desc: `虚构概念件：环形阵列导管自定子环引出（色系 ${P.hue}），概念上传输励磁功率；管路走向仅为视觉秩序设计。`,
    offset: [0, 1.9, -0.8],
  });
  assembledPos.ducts = [0, 0, 0];
  builders.ducts = (g) => {
    const mat = FORGE_MATS.paint(hue.duct);
    for (let i = 0; i < spokeN; i++) {
      const a = i / spokeN * Math.PI * 2 + 0.26;
      const tube = new THREE.Mesh(new THREE.TorusGeometry(1.7, 0.035, 8, 40, Math.PI * 0.5), mat);
      tube.position.set(0, 0, -0.5);
      tube.rotation.z = a;
      tube.name = 'duct_arc' + i;
      g.add(tube);
    }
    const bus = new THREE.Mesh(new THREE.TorusGeometry(2.28, 0.05, 8, 48), mat);
    bus.name = 'duct_bus';
    g.add(bus);
  };

  /* ===== 支承桁架（底部） ===== */
  part({
    id: 'base', zh: '底部支承桁架', en: 'SUPPORT TRUSS', real: false,
    desc: '安装基面与支承桁架；地面接触层（展台接地由馆内引擎统一处理）。',
    offset: [0, -0.9, -1.6],
  });
  assembledPos.base = [0, 0, 0];
  builders.base = (g) => {
    const steel = FORGE_MATS.forgedSteel();
    mesh(g, new THREE.CylinderGeometry(1.0, 1.15, 0.18, 28), FORGE_MATS.castIron(), [0, 0, -1.6], [Math.PI / 2, 0, 0], 'base_pad');
    for (let i = 0; i < 3; i++) {
      const a = i / 3 * Math.PI * 2;
      mesh(g, new THREE.CylinderGeometry(0.06, 0.06, 1.5, 10), steel,
        [Math.cos(a) * 0.6, Math.sin(a) * 0.6, -0.85], [Math.cos(a) * 0.5, Math.sin(a) * 0.5, 0], 'base_leg' + i);
    }
  };

  /* 运动演示：核心转子自转（主输出）+ 太阳轮同速自转 + 行星支架公转，
     行星轮经 meshSpin 绕各自销轴自转（公转+自转复合——啮合速比示意，非严格运动学仿真） */
  /* V4.0 MI②：轮系运动学由齿数解析推导（固定齿圈行星轮系，输入=太阳轮随核心转子 3.0 rad/s）：
     ω_c = ω_s·Z_s/(Z_s + Z_r)（支架输出）
     (ω_p − ω_c)·Z_p = −ω_c·Z_r ⇒ ω_p = ω_c·(1 − Z_r/Z_p)（行星轮自转） */
  const SUN_W = 3.0;
  const CARRIER_W = SUN_W * sunTeeth / (sunTeeth + ringTeeth);
  const planetW = CARRIER_W * (1 - ringTeeth / planetTeeth);
  const demos = [{
    partId: 'coreRotor',
    label: '磁耦合轮系联动演示（虚构概念 · 运动学示意）',
    spin: [0, 0, SUN_W],
    also: [
      { partId: 'sunGear', spin: [0, 0, SUN_W] },
      { partId: 'carrier', spin: [0, 0, CARRIER_W], meshSpin: { speed: planetW, pick: o => { let p = o; while (p) { if (p.name && String(p.name).startsWith('planet_gear')) return true; p = p.parent; } return false; } } },
    ],
  }];

  return {
    id: forcedId || `forge-ringdrive-${seed.toString(36)}`,
    name: '锻造 FORGE-99 · 环式磁耦合动力核心',
    en: 'FORGE-99 RING DRIVE CORE — FICTIONAL CONCEPT',
    category: '机械',
    accent: `#${new THREE.Color(hue.ring).getHexString()}`,
    description: `MECHANICAL FORGE 程序化生成（生成器 v${GENERATOR_VERSION} · 种子 ${seed}）：虚构概念模型——环式磁耦合动力核心（无接触悬浮约束 + 太阳轮/行星轮/齿圈复合轮系，齿数 ${sunTeeth}/${planetTeeth}/${ringTeeth} 按概念模数推算）。轮系几何按真实机械关系构造；磁悬浮与能量导管为虚构层。明确标注：虚构概念模型 / 非真实工程设备，无任何性能参数。`,
    specs: [
      ['类型', '虚构概念 · 复合动力核心'],
      ['轮系', `太阳 ${sunTeeth} 齿 / 行星 ${planetTeeth} 齿 ×${P.planets} / 齿圈 ${ringTeeth} 齿（概念模数）`],
      ['悬浮', '磁悬浮约束（虚构层，无接触轴）'],
      ['框架', `${frameN} 边桁架 + ${spokeN} 辐条臂`],
      ['构件', '9 部件组 · 全参数化网格'],
      ['来源', '本机程序化生成（MECHANICAL FORGE）'],
    ],
    parts,
    builders,
    assembledPos,
    demos,
    /* V4.0 MI① 推广：轮系关系图（齿数/速比机器可读） */
    mech: { driver: 'coreRotor', edges: [
      { id: 'cp-rotor-sun', type: 'shaft_coupling', from: 'coreRotor', to: 'sunGear', kinematic: 'exact', note: `核心转子输出轴与太阳轮同轴刚性连接（同速 ${SUN_W} rad/s）` },
      { id: 'mesh-sun-planet', type: 'gear_mesh', from: 'sunGear', to: 'carrier', kinematic: 'exact', note: `太阳轮 ${sunTeeth} 齿与 ${P.planets} 个行星轮（${planetTeeth} 齿）外啮合`, ratio: +(planetTeeth / sunTeeth).toFixed(3) },
      { id: 'mesh-planet-ring', type: 'gear_mesh', from: 'carrier', to: 'ringGear', kinematic: 'exact', note: `行星轮与内齿圈（${ringTeeth} 齿）内啮合；齿圈固定为机架`, ratio: +(ringTeeth / planetTeeth).toFixed(3) },
      { id: 'fx-ring-spokes', type: 'fixed', from: 'ringGear', to: 'spokes', note: '齿圈固定耳经辐条臂向外框架传力（反扭矩路径）' },
      { id: 'fx-spokes-frame', type: 'fixed', from: 'spokes', to: 'frame', note: '辐条臂外端球节与框架节点连接' },
      { id: 'fx-frame-base', type: 'fixed', from: 'frame', to: 'base', note: '外承力框架支承于底部桁架' },
      { id: 'sup-core-stator', type: 'bearing_support', from: 'statorRings', to: 'coreRotor', kinematic: 'visual', note: '磁悬浮约束（虚构层）：无机械接触，转子由概念磁场支承' },
      { id: 'vo-ducts', type: 'visual_only', from: 'statorRings', to: 'ducts', kinematic: 'visual', note: '能量导管为虚构概念层——仅视觉组织，不代表真实管路连接' },
    ] },
    modelSource: '/forge',
    modelCredit: 'MECHANICAL FORGE · 参数化生成（本机，虚构概念）',
    forge: { generator: GENERATOR_ID, version: GENERATOR_VERSION, params: P, seed },
  };
}
