/* 机械锻造所 · 瓦特离心调速器生成器（Watt Centrifugal Governor）
   布局：经典飞球调速器——底座/立轴/一对飞球臂/套筒+联动杆/节流蝶阀。
   真实性口径（V3.0 任务书 §2.3/§3.2A）：结构关系可视化模型——
   立轴-飞球臂-套筒同轴旋转为真实关系；飞球静止张角为「工作点示意」
   （真实调速器张角随转速连续变化：ω↑ → 离心力↑ → 臂张开 → 套筒上滑 → 阀门关小），
   静止张角由参数给定并在描述中注明口径；不虚构性能参数。
   复用既有引擎能力：spin 演示（立轴组 + 套筒随动）——无新增引擎扩展。 */

import * as THREE from 'three';
import { makeRng, seedFromString } from './rand.js';
import { FORGE_MATS } from './materials.js';

export const GENERATOR_ID = 'governor';
export const GENERATOR_VERSION = 1;

/* 参数 Schema（§4.1） */
export const SCHEMA = {
  armLength: { type: 'range', min: 70, max: 110, step: 1, default: 90, label: '飞球臂长', unit: 'mm', note: '臂枢轴到球心的距离' },
  armAngle: { type: 'range', min: 15, max: 45, step: 1, default: 30, label: '工作张角', unit: '°', note: '臂与立轴的夹角（工作点示意——真实张角随转速连续变化）' },
  ballR: { type: 'range', min: 40, max: 70, step: 1, default: 55, label: '飞球半径', unit: 'mm', note: '球越重，同样转速下张角越小' },
  finish: { type: 'enum', options: ['brass', 'steel'], default: 'brass', label: '表面处理', note: 'brass=黄铜抛光（维多利亚风格）；steel=钢制' },
  detail: { type: 'range', min: 0, max: 2, step: 1, default: 1, label: '细节密度', unit: '级', note: '螺栓/铰接耳片随级数增加' },
};

export function defaultParams() {
  const out = {};
  for (const k of Object.keys(SCHEMA)) out[k] = SCHEMA[k].default;
  return out;
}

/* 预设方案 */
export const PRESETS = [
  { id: 'watt-classic', label: '瓦特经典黄铜', params: { armLength: 90, armAngle: 30, ballR: 55, finish: 'brass', detail: 1 } },
  { id: 'compact', label: '小型机用（短臂）', params: { armLength: 72, armAngle: 24, ballR: 46, finish: 'steel', detail: 1 } },
  { id: 'wide', label: '大张角敏感型', params: { armLength: 108, armAngle: 42, ballR: 62, finish: 'brass', detail: 2 } },
  { id: 'steel', label: '工业钢制', params: { armLength: 95, armAngle: 30, ballR: 68, finish: 'steel', detail: 2 } },
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
  /* 几何守卫：对置双球在张角 θ 下不互撞 → ballR ≤ 0.85·arm·sinθ（超出钳制并注明） */
  if (out.ballR > 0.85 * out.armLength * Math.sin(out.armAngle * Math.PI / 180)) {
    out.ballR = Math.max(18, Math.round(0.85 * out.armLength * Math.sin(out.armAngle * Math.PI / 180)));
    errs.push('飞球半径超出几何边界（对置双球相撞），已钳制');
  }
  return { params: out, errors: errs };
}

export function describeParams(p) {
  /* 工作转速示意：经典近似 tanθ = ω²r/g（r=球到轴水平距，按真实米制换算） */
  const u = (mm) => mm / 100;
  const arm = u(p.armLength), th = p.armAngle * Math.PI / 180;
  const r = arm * Math.sin(th);
  const g = 9.81, rm = r * 0.1;          // 1 模型单位 = 100mm → 真实米制半径
  const omega = Math.sqrt(Math.tan(th) * g / rm);
  return { radius: +r.toFixed(3), rpm: Math.round(omega * 60 / (2 * Math.PI)), sleeveLift: +(arm * (1 - Math.cos(th))).toFixed(3) };
}

/* ---------- 布局推导（1 模型单位 = 100mm） ---------- */
function deriveLayout(P) {
  const u = (mm) => mm / 100;
  const arm = u(P.armLength), ballR = u(P.ballR), th = P.armAngle * Math.PI / 180;
  const spindleH = arm * Math.cos(th) + 0.55;       // 立轴顶略高于臂枢点
  const pivotY = spindleH - 0.25;                   // 臂枢轴高度
  const ballY = pivotY - arm * Math.cos(th);
  const ballX = arm * Math.sin(th);
  const sleeveY = pivotY - arm * (1 - Math.cos(th)) * 0.9;   // 套筒工作高（示意联动位）
  return { arm, ballR, th, spindleH, pivotY, ballY, ballX, sleeveY, baseR: 0.55, baseH: 0.22, spindleR: 0.055, armR: 0.028 };
}

/* ---------- 小构件工具 ---------- */
function mesh(g, geo, mat, pos = [0, 0, 0], rot = null) {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(...pos);
  if (rot) m.rotation.set(...rot);
  m.name = 'F_G_' + g.name + '_' + (g.children.length + 1);
  g.add(m);
  return m;
}
const cyl = (rt, rb, h, seg = 24) => new THREE.CylinderGeometry(rt, rb, h, seg);

export function buildGovernor(rawParams, seedInput, forcedId) {
  const { params: P } = validateParams(rawParams);
  const seed = (typeof seedInput === 'number') ? (seedInput >>> 0) : seedFromString(seedInput);
  const rng = makeRng(seed);
  const L = deriveLayout(P);
  const disp = describeParams(P);
  const id = forcedId || `forge-governor-${seed.toString(36)}`;

  const boltN = rng.pick([3, 4, 6]);
  const brass = () => FORGE_MATS[P.finish === 'brass' ? 'brass' : 'machinedSteel']();
  const tint = () => rng.gauss(0, 0.03);

  const builders = {}, assembledPos = {};
  const parts = [];
  const part = (o) => { parts.push(o); return o; };
  const off = (x, y, z) => [x, y, z];

  /* ===== 底座（配重盘 + 主轴承座） ===== */
  part({
    id: 'base', zh: '底座与主轴承', en: 'BASE & MAIN BEARING', real: false,
    desc: '底座：铸铁配重圆盘 + 中央立轴承座——调速器全部竖立载荷压在这盘上。配重保证高速旋转下的整机稳定；轴承座内衬铜套（种子决定底座螺栓数）。蒸汽机时代的调速器常与节流阀做成一体式黄铜件，既是仪器也是摆设。',
    offset: off(0, 0, 0),
  });
  assembledPos.base = [0, 0, 0];
  builders.base = (g) => {
    g.name = 'base';
    const cast = FORGE_MATS.castIron(tint());
    mesh(g, cyl(L.baseR, L.baseR * 1.12, L.baseH, 36), cast, [0, L.baseH / 2, 0]).name = 'F_G_base_disc';
    mesh(g, cyl(0.14, 0.16, 0.3, 20), brass(), [0, L.baseH + 0.15, 0]).name = 'F_G_base_bearing';
    if (P.detail >= 1) {
      for (let i = 0; i < boltN; i++) {
        const a = i / boltN * Math.PI * 2;
        mesh(g, cyl(0.035, 0.035, 0.09, 8), FORGE_MATS.forgedSteel(),
          [Math.cos(a) * (L.baseR * 0.86), L.baseH + 0.04, Math.sin(a) * (L.baseR * 0.86)]).name = 'F_G_base_bolt_' + (i + 1);
      }
    }
  };

  /* ===== 立轴 + 飞球臂 + 飞球（旋转主体） ===== */
  part({
    id: 'head', zh: '立轴与飞球臂', en: 'SPINDLE & FLYBALL ARMS', real: false,
    desc: '立轴与飞球臂：立轴由蒸汽机经皮带/齿轮驱动旋转；一对飞球臂铰接在轴顶枢轴上，臂端各挂一只飞球。轴一转，球绕轴公转产生离心力——转速越高，臂张得越开。这是「用转速自身测量转速」的反馈原件：张角即转速表读数。模型为工作张角示意（参数给定，真实张角随转速连续变化）。',
    offset: off(0, 0.9, 0),
  });
  assembledPos.head = [0, 0, 0];
  builders.head = (g) => {
    g.name = 'head';
    const b = brass();
    /* 立轴（贯通至底座轴承） */
    mesh(g, cyl(L.spindleR, L.spindleR, L.spindleH, 16), b, [0, L.spindleH / 2, 0]).name = 'F_G_spindle';
    /* 轴顶枢轴帽 */
    mesh(g, cyl(0.07, 0.05, 0.09, 12), b, [0, L.spindleH + 0.02, 0]).name = 'F_G_pivot_cap';
    /* 一对飞球臂（自枢轴下垂张开）+ 飞球 */
    for (const s of [1, -1]) {
      const dir = s > 0 ? 0 : Math.PI;
      const armGrp = new THREE.Group();
      armGrp.rotation.y = dir;
      armGrp.name = 'F_G_arm_' + (s > 0 ? 'A' : 'B');
      const armLen = Math.hypot(L.ballX, L.pivotY - L.ballY);
      const arm = new THREE.Mesh(cyl(L.armR, L.armR, armLen, 10), b);
      /* 臂几何：细棒从枢轴(0,0)指向球位(x=ballX, y=ballY-pivotY)——圆柱沿 y 轴，
         转角 θ 使轴指向 ±(sinθ, -cosθ)，与径向-竖直方向一致 */
      arm.rotation.z = L.th;
      arm.position.set(L.ballX / 2, -(L.pivotY - L.ballY) / 2, 0);
      arm.name = 'F_G_arm_rod';
      armGrp.add(arm);
      /* 铰接耳片 */
      const lug = new THREE.Mesh(cyl(0.045, 0.045, 0.03, 10), FORGE_MATS.forgedSteel());
      lug.rotation.z = Math.PI / 2;
      lug.position.set(0.02, 0, 0);
      lug.name = 'F_G_arm_lug';
      armGrp.add(lug);
      /* 飞球 */
      const ball = new THREE.Mesh(new THREE.SphereGeometry(L.ballR, 24, 18), brass());
      ball.position.set(L.ballX, L.ballY - L.pivotY, 0);
      ball.name = 'F_G_flyball';
      armGrp.add(ball);
      /* 球销 */
      const pin = new THREE.Mesh(cyl(0.02, 0.02, L.ballR * 1.3, 8), FORGE_MATS.forgedSteel());
      pin.position.set(L.ballX, L.ballY - L.pivotY, 0);
      pin.name = 'F_G_ball_pin';
      armGrp.add(pin);
      g.add(armGrp);
    }
  };

  /* ===== 套筒 + 联动杆（随轴旋转、沿轴滑动） ===== */
  part({
    id: 'sleeve', zh: '套筒与联动杆', en: 'SLEEVE & LINKAGE', real: false,
    desc: '套筒：滑套在立轴上的滑动环——两根联动杆把它与两臂中段铰接。臂张开时套筒被拉上滑，臂收拢时下滑：把「张角」翻译成「直线位移」的变换器。套筒随轴旋转（由立轴键槽带动），位移经杠杆传给节流阀。模型中套筒与臂的铰接为工作点示意（真实套筒位置随转速连续滑动）。',
    offset: off(0, 0.4, 1.1),
  });
  assembledPos.sleeve = [0, 0, 0];
  builders.sleeve = (g) => {
    g.name = 'sleeve';
    const b = brass();
    const ring = new THREE.Mesh(cyl(0.12, 0.12, 0.22, 20), b);
    ring.name = 'F_G_sleeve_ring';
    ring.position.set(0, L.sleeveY, 0);
    g.add(ring);
    const collar = new THREE.Mesh(cyl(0.16, 0.16, 0.05, 20), b);
    collar.position.set(0, L.sleeveY + 0.12, 0);
    collar.name = 'F_G_sleeve_collar';
    g.add(collar);
    /* 两根联动杆：套筒耳 → 飞球臂中段（工作点几何） */
    const midX = L.ballX * 0.55, midY = (L.pivotY + L.ballY) / 2 - L.pivotY;
    for (const s of [1, -1]) {
      const rodGrp = new THREE.Group();
      rodGrp.rotation.y = s > 0 ? 0 : Math.PI;
      rodGrp.name = 'F_G_link_' + (s > 0 ? 'A' : 'B');
      const from = [0.12, L.sleeveY];
      const to = [midX, midY];
      const len = Math.hypot(to[0] - from[0], to[1] - from[1]);
      const rod = new THREE.Mesh(cyl(0.022, 0.022, len, 8), FORGE_MATS.forgedSteel());
      /* 圆柱 y 轴转向 (dx,dy) 方向：rotation.z = atan2(dy,dx) - π/2 */
      rod.rotation.z = Math.atan2(to[1] - from[1], to[0] - from[0]) - Math.PI / 2;
      rod.position.set((from[0] + to[0]) / 2, (from[1] + to[1]) / 2, 0);
      rod.name = 'F_G_link_rod';
      rodGrp.add(rod);
      g.add(rodGrp);
    }
  };

  /* ===== 节流蝶阀 ===== */
  part({
    id: 'throttle', zh: '节流蝶阀', en: 'THROTTLE BUTTERFLY VALVE', real: false,
    desc: '节流蝶阀：蒸汽进气管里的圆蝶盘，由套筒位移经杠杆驱动——转速升高 → 飞球张开 → 套筒上滑 → 阀盘关小 → 进汽减少 → 转速回落。这条「测转速 → 调阀门」的闭环就是瓦特 1788 年的发明：第一台广泛应用于工程的自动反馈控制器，现代控制理论的祖师爷。',
    offset: off(1.6, 0.3, 0),
  });
  assembledPos.throttle = [0, 0, 0];
  builders.throttle = (g) => {
    g.name = 'throttle';
    const b = brass();
    const pipe = new THREE.Mesh(cyl(0.24, 0.24, 0.5, 24), FORGE_MATS.castIron(tint()));
    pipe.rotation.z = Math.PI / 2;
    pipe.position.set(1.35, 0.75, 0);
    pipe.name = 'F_G_valve_pipe';
    g.add(pipe);
    const flangeA = new THREE.Mesh(cyl(0.3, 0.3, 0.05, 24), FORGE_MATS.castIron(tint()));
    flangeA.rotation.z = Math.PI / 2;
    flangeA.position.set(1.1, 0.75, 0);
    flangeA.name = 'F_G_valve_flange_a';
    g.add(flangeA);
    const flangeB = flangeA.clone();
    flangeB.position.set(1.6, 0.75, 0);
    flangeB.name = 'F_G_valve_flange_b';
    g.add(flangeB);
    /* 蝶盘（半开位置示意） */
    const disc = new THREE.Mesh(cyl(0.21, 0.21, 0.03, 28), b);
    disc.rotation.z = Math.PI / 2;
    disc.rotation.x = 0.9;
    disc.position.set(1.35, 0.75, 0);
    disc.name = 'F_G_valve_disc';
    g.add(disc);
    /* 阀轴 + 杠杆耳 */
    const shaft = new THREE.Mesh(cyl(0.03, 0.03, 0.6, 10), b);
    shaft.rotation.x = Math.PI / 2;
    shaft.rotation.z = 0.9;
    shaft.position.set(1.35, 0.75, 0);
    shaft.name = 'F_G_valve_shaft';
    g.add(shaft);
    const armL = new THREE.Mesh(box3(0.16, 0.035, 0.035), b);
    armL.position.set(1.18, 1.0, 0.12);
    armL.rotation.y = -0.7;
    armL.name = 'F_G_valve_lever';
    g.add(armL);
  };
  function box3(x, y, z) { return new THREE.BoxGeometry(x, y, z); }

  /* 运动演示：立轴组自转 + 套筒随动同速（真实关系：套筒由立轴键槽带动旋转） */
  const f = 0.5;
  const demos = [{
    partId: 'head',
    label: '调速器旋转演示（工作张角示意 · 真实张角随转速变化）',
    spin: [0, f * Math.PI * 2, 0],
    also: [
      { partId: 'sleeve', spin: [0, f * Math.PI * 2, 0] },
    ],
  }];

  /* ===== Mechanism Graph ===== */
  const mechEdges = [
    { id: 'sup-base', type: 'bearing_support', from: 'base', to: 'head', kinematic: 'exact', note: '底座主轴承支承立轴（铜套）' },
    { id: 'rev-spindle', type: 'revolute', from: 'base', to: 'head', kinematic: 'exact', note: '立轴绕主轴旋转——蒸汽机经皮带/齿轮驱动' },
    { id: 'fx-arms', type: 'fixed', from: 'head', to: 'head', note: '飞球臂铰接于轴顶枢轴（同部件内示意为固定姿态；真实为转动副且张角随转速变化）' },
    { id: 'pri-sleeve', type: 'prismatic', from: 'head', to: 'sleeve', kinematic: 'exact', note: '套筒沿立轴滑动 + 随轴旋转（键槽传动）——真实套筒位置随张角连续变化，模型为工作点静止示意' },
    { id: 'lnk-throttle', type: 'linkage', from: 'sleeve', to: 'throttle', kinematic: 'approx', note: '套筒位移经杠杆传至节流蝶阀开度（近似口径：模型不含联动过程动画）' },
  ];

  const dev = {
    id,
    name: `锻造调速器 · 飞球离心式（${P.finish === 'brass' ? '黄铜' : '钢制'}）`,
    en: 'FORGED CENTRIFUGAL GOVERNOR',
    category: '机械',
    accent: '#c9a15a',
    description: `MECHANICAL FORGE 程序化生成（生成器 v${GENERATOR_VERSION} · 种子 ${seed}）：瓦特离心调速器概念机，飞球臂长 ${P.armLength}mm、工作张角 ${P.armAngle}°（示意工作点——真实张角随转速连续变化，经典近似 tanθ=ω²r/g）、飞球半径 ${P.ballR}mm。立轴-飞球-套筒-节流阀的反馈链为真实机构关系；张角与套筒位置为静止工作点示意。可拆解、可旋转演示、参数与种子可复现；非真实可制造工程模型。`,
    specs: [
      ['机构', '瓦特离心调速器（1788）'],
      ['臂长 × 张角', `${P.armLength}mm × ${P.armAngle}°（示意工作点）`],
      ['飞球', `×2 · r=${P.ballR}mm`],
      ['反馈链', '转速→张角→套筒→蝶阀'],
      ['原理', 'tanθ = ω²r/g（经典近似）'],
      ['来源', '本机程序化生成（MECHANICAL FORGE）'],
    ],
    parts,
    builders,
    assembledPos,
    demos,
    mech: { driver: 'head', edges: mechEdges },
    tour: [
      { id: 'base', note: '底座与主轴承：铸铁配重盘压住全机，铜套轴承支承立轴——高速旋转的稳定根基。' },
      { id: 'head', note: '立轴与飞球臂：轴转则球绕轴公转，离心力把臂甩开——张角就是转速表的指针（模型为工作张角静止示意，选中后看旋转演示）。' },
      { id: 'sleeve', note: '套筒与联动杆：把「张角」翻译成「直线位移」——臂张则套筒上滑，臂收则下滑，随轴同步旋转。' },
      { id: 'throttle', note: '节流蝶阀：套筒位移经杠杆推阀盘——转速高则关小进汽。这条闭环是第一台广泛应用的自动反馈控制器（1788），现代控制理论的起点。' },
    ],
    modelSource: '/forge',
    modelCredit: 'MECHANICAL FORGE · 参数化生成（本机）',
    forge: { generator: GENERATOR_ID, version: GENERATOR_VERSION, params: P, seed },
  };
  return dev;
}
