/* 机械锻造所 · 锁式线迹机构生成器（V4.1）
   平缝机锁式线迹（Lockstitch 301）的运动学概念示意——缝纫机"为什么能缝"的经典答案：
   针杆把面线送过布面 → 旋梭（转速 2× 针杆）钩住针旁的线环绕过梭芯 → 底线与面线
   在布层中间绞合 → 送布牙沿椭圆轨迹把布推进一个针距。
   真实性口径（任务书 §2.3）：机构关系可视化模型——频率比（针 1 : 旋梭 2）与
   往复/摆动/环线关系为运动学示意；不虚构性能参数、不宣称可制造；
   面线走线为静态路径示意（线体 dynamics 不模拟），送布轨迹做了视觉放大。
   运动演示：slide（引擎 V4.1 新原语，刚性平移 + 李萨如闭环）+ spin + wobble，
   全部挂在手轮驱动链（d.also 跨部件联动）。 */

import * as THREE from 'three';
import { makeRng, seedFromString } from './rand.js';
import { FORGE_MATS } from './materials.js';

export const GENERATOR_ID = 'lockstitch';
export const GENERATOR_VERSION = 1;

/* 参数 Schema：改动只影响相关结构 */
export const SCHEMA = {
  needleStroke: { type: 'range', min: 26, max: 42, step: 1, default: 32, label: '针杆行程', unit: 'mm', note: '行程决定能缝的料厚上限' },
  feedStroke: { type: 'range', min: 2, max: 6, step: 1, default: 4, label: '针距（送布行程）', unit: 'mm', note: '送布牙每循环推进的距离' },
  cadence: { type: 'range', min: 0.5, max: 1.2, step: 0.1, default: 0.9, label: '演示节拍', unit: 'Hz', note: '联动演示频率（真机高速缝纫 50+ 针/秒，此处降速观察）' },
  finish: { type: 'enum', options: ['bare', 'painted'], default: 'painted', label: '表面处理' },
  detail: { type: 'range', min: 0, max: 2, step: 1, default: 1, label: '细节密度', unit: '级', note: '螺丝/铭牌/线轴等随级数增加' },
};

export function defaultParams() {
  const out = {};
  for (const k of Object.keys(SCHEMA)) out[k] = SCHEMA[k].default;
  return out;
}

export const PRESETS = [
  { id: 'standard', label: '平缝标准型', params: { needleStroke: 32, feedStroke: 4, cadence: 0.9, finish: 'painted', detail: 1 } },
  { id: 'heavy', label: '厚料长行程', params: { needleStroke: 42, feedStroke: 6, cadence: 0.6, finish: 'bare', detail: 2 } },
  { id: 'home', label: '紧凑家用型', params: { needleStroke: 28, feedStroke: 3, cadence: 1.0, finish: 'painted', detail: 0 } },
  { id: 'teach', label: '教学慢动作', params: { needleStroke: 36, feedStroke: 5, cadence: 0.5, finish: 'painted', detail: 2 } },
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
  return { params: out, errors: errs };
}

/* ---------- 布局推导（1 模型单位 ≈ 100mm） ---------- */
function deriveLayout(P) {
  const u = (mm) => mm / 100;
  const needleAmp = u(P.needleStroke) / 2;          // 针杆往复振幅
  /* 送布轨迹按真机行程做了 ~2.2× 视觉放大（2-6mm 直接渲染不可辨） */
  const feedFwd = u(P.feedStroke) * 2.2;            // 送布前后分量
  const feedUp = u(P.feedStroke) * 1.2;             // 送布抬起分量
  const handY = 2.2, headX = -1.55;                 // 手轮轴心高 / 针杆轴线
  return { needleAmp, feedFwd, feedUp, handY, headX };
}

function mesh(g, geo, mat, pos = [0, 0, 0], rot = null, name = null) {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(...pos);
  if (rot) m.rotation.set(...rot);
  m.name = name || ('FL_' + g.name + '_' + (g.children.length + 1));
  g.add(m);
  return m;
}
const box = (w, h, d) => new THREE.BoxGeometry(w, h, d);
const cyl = (r1, r2, h, seg = 20) => new THREE.CylinderGeometry(r1, r2, h, seg);

/* ---------- 主生成入口 ---------- */
export function buildLockstitch(rawParams, seedInput, forcedId) {
  const { params: P } = validateParams(rawParams);
  const seed = (typeof seedInput === 'number') ? (seedInput >>> 0) : seedFromString(seedInput);
  const rng = makeRng(seed);
  const L = deriveLayout(P);
  const id = forcedId || `forge-lockstitch-${seed.toString(36)}`;

  /* 种子驱动的工艺细节（只落装饰，不动机构关系） */
  const paintBase = rng.pick([0x274a44, 0x39435e, 0x54383a, 0x3f4a52]);
  const threadColor = rng.pick([0x8a3b2e, 0x2e4a7a, 0x3a5a34, 0x6a5a2e]);
  const fabricColor = rng.pick([0xcfc4a8, 0xb9c2cc, 0xc9b4b4]);
  const stitchRows = rng.int(3, 5);               // 布样上已缝的线迹行数
  const tint = () => rng.gauss(0, 0.03);
  const screwN = rng.int(3, 5);

  const builders = {}, assembledPos = {};
  const parts = [];
  const part = (o) => { parts.push(o); return o; };

  /* ===== 机身（臂 + 立柱 + 底座） ===== */
  part({
    id: 'frame', zh: '机身（臂·立柱·底座）', en: 'FRAME', real: false,
    desc: '铸铁平缝机机身：水平悬臂把上轴与针杆机构悬到操作面正上方，立柱内藏下轴与踏板传动，底座即工作台面。悬臂端的"头部"集中了针杆、挑线与压脚机构——离操作者眼睛最近，也离旋梭最远，两轴之间靠齿轮副跨过整个臂长。',
    offset: [0, 0, 0],
  });
  assembledPos.frame = [0, 0, 0];
  builders.frame = (g) => {
    const cast = FORGE_MATS[P.finish === 'painted' ? 'paint' : 'castIron'](P.finish === 'painted' ? paintBase : tint());
    const alu = FORGE_MATS.castAlu(tint());
    mesh(g, box(4.4, 0.5, 1.7), cast, [0, 0.25, 0], null, 'FL_bed');                    // 底座
    mesh(g, box(4.0, 0.06, 1.5), alu, [0, 0.53, 0], null, 'FL_bedtop');                 // 台面镶板
    mesh(g, box(0.7, 1.55, 1.4), cast, [1.5, 1.28, 0], null, 'FL_pillar');              // 立柱
    mesh(g, box(3.45, 0.62, 0.92), cast, [-0.15, 2.22, 0], null, 'FL_arm');             // 悬臂
    mesh(g, box(0.55, 1.05, 0.9), cast, [-1.85, 1.72, 0], null, 'FL_head');             // 头部（针杆箱）
    mesh(g, cyl(0.5, 0.5, 0.1, 24), FORGE_MATS.rubber(), [0, 0.04, 0], null, 'FL_pad'); // 减振脚垫
    for (let i = 0; i < screwN; i++) {                                                  // 面板螺丝
      mesh(g, cyl(0.028, 0.028, 0.03, 10), FORGE_MATS.machinedSteel(),
        [-1.85 + i * 0.16, 2.545, 0.2], null, 'FL_screw' + i);
    }
    if (P.detail >= 1) mesh(g, box(0.42, 0.2, 0.02), FORGE_MATS.brass(), [0.2, 2.22, 0.47], null, 'FL_plate'); // 铭牌
  };

  /* ===== 手轮（上轴驱动端） ===== */
  part({
    id: 'handwheel', zh: '手轮与上轴端', en: 'HANDWHEEL', real: false,
    desc: '手轮是整条传动链的起点：踏板经皮带带动上轴，上轴一端固定手轮（飞轮储能兼手动盘车），另一端的曲柄驱动针杆。锁式线迹的节奏以"手轮一圈 = 一针"为基准——旋梭轴经 1:2 齿轮副被它带着转两圈。',
    offset: [2.3, 0.7, 0],
  });
  assembledPos.handwheel = [2.08, L.handY, 0];
  builders.handwheel = (g) => {
    const steel = FORGE_MATS.forgedSteel();
    mesh(g, cyl(0.5, 0.5, 0.09, 28), FORGE_MATS.machinedSteel(), [0, 0, 0], [0, 0, Math.PI / 2], 'FL_rim');
    mesh(g, cyl(0.12, 0.12, 0.22, 16), steel, [0, 0, 0], [0, 0, Math.PI / 2], 'FL_hub');
    for (let i = 0; i < 5; i++) {
      const a = i * Math.PI * 2 / 5;
      mesh(g, box(0.06, 0.4, 0.05), steel,
        [Math.cos(a) * 0.24, Math.sin(a) * 0.24, 0], [0, 0, a], 'FL_spoke' + i);
    }
    mesh(g, cyl(0.05, 0.05, 0.5, 12), FORGE_MATS.chrome(), [-0.32, 0, 0], [0, 0, Math.PI / 2], 'FL_shaft'); // 上轴伸出段
  };

  /* ===== 针杆与机针（slide 刚性往复） ===== */
  part({
    id: 'needlebar', zh: '针杆与机针', en: 'NEEDLE BAR & NEEDLE', real: false,
    desc: `针杆由上轴端曲柄经连杆带着做纯正弦往复（行程 ${P.needleStroke}mm）：下行把面线穿过布层到最低点，上行时因线被压脚与布的摩擦滞留，针眼后方会"甩"出一个线环——这个环正是旋梭要钩的目标。演示为刚性平移示意（真机针杆在针杆套内导向）。`,
    offset: [0, 1.0, 0.9],
  });
  assembledPos.needlebar = [0, 0, 0];
  builders.needlebar = (g) => {
    const steel = FORGE_MATS.chrome();
    mesh(g, cyl(0.035, 0.035, 0.62, 12), steel, [L.headX, 1.42, 0], null, 'FL_bar');
    mesh(g, cyl(0.013, 0.004, 0.2, 8), FORGE_MATS.machinedSteel(), [L.headX, 1.02, 0], null, 'FL_needle');
    mesh(g, box(0.14, 0.1, 0.1), FORGE_MATS.castAlu(tint()), [L.headX, 1.76, 0], null, 'FL_clamp'); // 针夹
    if (P.detail >= 1) mesh(g, cyl(0.06, 0.06, 0.05, 12), FORGE_MATS.machinedSteel(), [L.headX, 1.86, 0], null, 'FL_nut');
  };

  /* ===== 挑线杆（wobble 绕枢轴摆动；组原点 = 枢轴） ===== */
  part({
    id: 'takeup', zh: '挑线杆', en: 'TAKE-UP LEVER', real: false,
    desc: '挑线杆是线环的"管理者"：针下行时它跟着放线，旋梭绞合后它猛地上提——把面线从梭床里拉紧收成一个位于布层中间的绞合点，同时从线轴再拉出下一段线。挑线时序与针杆相位差几度，差多了就跳线或断线（摆动为示意，未做时序微调）。',
    offset: [-1.0, 0.9, 1.2],
  });
  assembledPos.takeup = [-1.62, 2.1, 0.44];
  builders.takeup = (g) => {
    const steel = FORGE_MATS.forgedSteel();
    /* 组原点 = 摆动枢轴；children 相对枢轴布置 */
    mesh(g, cyl(0.03, 0.03, 0.12, 10), FORGE_MATS.machinedSteel(), [0, 0, 0.02], [Math.PI / 2, 0, 0], 'FL_pivot');
    mesh(g, box(0.05, 0.34, 0.045), steel, [0.02, 0.2, 0.06], [0, 0, -0.35], 'FL_arm');      // 摆臂（斜向上）
    mesh(g, cyl(0.022, 0.022, 0.06, 8), FORGE_MATS.chrome(), [0.11, 0.36, 0.06], null, 'FL_eye'); // 过线孔耳
  };

  /* ===== 面线走线路径（静态示意） ===== */
  part({
    id: 'threadpath', zh: '面线走线（静态示意）', en: 'THREAD PATH (STATIC)', real: false,
    desc: '面线从线轴插钉出发，依次穿过挑线杆过线孔、张力器两夹线盘之间、针杆过线孔，最后穿入针眼——每个环节的顺序与绕法都不能错，"穿面线"因此成为每个缝纫新手的仪式。线体为静态路径示意：张力、抖动与绞合动力学不模拟。',
    offset: [-0.3, 1.7, 0],
  });
  assembledPos.threadpath = [0, 0, 0];
  builders.threadpath = (g) => {
    const mat = FORGE_MATS.plastic(threadColor);
    const pts = [
      new THREE.Vector3(0.45, 2.62, 0),      // 线轴插钉（臂顶）
      new THREE.Vector3(0.2, 2.5, 0.36),
      new THREE.Vector3(1.18, 1.72, 0.66),   // 张力器
      new THREE.Vector3(0.3, 2.3, 0.5),
      new THREE.Vector3(-1.51, 2.46, 0.44),  // 挑线杆上死点附近
      new THREE.Vector3(-1.66, 2.1, 0.5),
      new THREE.Vector3(L.headX + 0.07, 1.5, 0.06),  // 针杆过线
      new THREE.Vector3(L.headX, 1.02, 0),   // 针眼
      new THREE.Vector3(L.headX + 0.02, 0.6, 0.05),
      new THREE.Vector3(L.headX, 0.3, 0),    // 旋梭
    ];
    const curve = new THREE.CatmullRomCurve3(pts);
    mesh(g, new THREE.TubeGeometry(curve, 48, 0.012, 6, false), mat, [0, 0, 0], null, 'FL_thread');
    mesh(g, cyl(0.03, 0.03, 0.3, 10), FORGE_MATS.machinedSteel(), [0.45, 2.55, 0], null, 'FL_spoolpin');
  };

  /* ===== 张力器 ===== */
  part({
    id: 'tension', zh: '张力器', en: 'TENSION ASSEMBLY', real: false,
    desc: '两片夹线盘把面线夹在中间，弹簧压力决定"拉线的阻力"——张力太大布面起皱，太小底线被拉到面上（缝合不上）。旋梭绞合后挑线杆的回抽力正是克服这个阻力来完成每一次"收紧"。',
    offset: [1.6, 0.4, 1.4],
  });
  assembledPos.tension = [1.18, 1.62, 0.6];
  builders.tension = (g) => {
    mesh(g, cyl(0.09, 0.09, 0.05, 16), FORGE_MATS.machinedSteel(), [0, 0, 0.02], [Math.PI / 2, 0, 0], 'FL_disc1');
    mesh(g, cyl(0.075, 0.075, 0.04, 16), FORGE_MATS.plastic(0x3a3f45), [0, 0, 0.06], [Math.PI / 2, 0, 0], 'FL_disc2');
    mesh(g, cyl(0.05, 0.05, 0.09, 12), FORGE_MATS.chrome(), [0, 0, 0.11], [Math.PI / 2, 0, 0], 'FL_nut');
    mesh(g, cyl(0.018, 0.018, 0.16, 8), FORGE_MATS.forgedSteel(), [0, 0, -0.02], [Math.PI / 2, 0, 0], 'FL_post');
  };

  /* ===== 压脚 ===== */
  part({
    id: 'presser', zh: '压脚', en: 'PRESSER FOOT', real: true,
    desc: '压脚以弹簧压力把布压在送布牙上：牙上升推布时，布必须被"按住"才不打滑；针穿布时它又是面线形成线环的背板。抬压脚扳手一放，压力释放——换布、转弯、翻边全靠这一下。',
    offset: [-0.2, 0.5, 1.6],
  });
  assembledPos.presser = [0, 0, 0];
  builders.presser = (g) => {
    const steel = FORGE_MATS.chrome();
    mesh(g, cyl(0.045, 0.045, 0.75, 12), steel, [L.headX + 0.16, 1.05, 0], null, 'FL_shank');  // 压脚杆
    mesh(g, box(0.1, 0.05, 0.3), steel, [L.headX + 0.16, 0.62, 0], null, 'FL_sole');           // 鞋底板
    mesh(g, cyl(0.03, 0.03, 0.1, 10), FORGE_MATS.machinedSteel(), [L.headX + 0.16, 1.46, 0], null, 'FL_springguide');
  };

  /* ===== 针板 ===== */
  part({
    id: 'throatplate', zh: '针板', en: 'THROAT PLATE', real: false,
    desc: '针板是布的"跑道面"：中间的容针槽让针下行穿过，两侧刻线是缝直线时的对齐基准；板下的开口正是送布牙升降出入的窗口。旋梭就藏在它的正下方。',
    offset: [0.1, -0.4, 1.8],
  });
  assembledPos.throatplate = [0, 0, 0];
  builders.throatplate = (g) => {
    mesh(g, box(0.95, 0.03, 0.7), FORGE_MATS.machinedSteel(), [L.headX + 0.05, 0.52, 0], null, 'FL_plate');
    mesh(g, box(0.05, 0.035, 0.4), FORGE_MATS.plastic(0x14161a), [L.headX, 0.52, 0], null, 'FL_slot');   // 容针槽
    for (let i = 0; i < 2; i++)
      mesh(g, box(0.02, 0.035, 0.16), FORGE_MATS.plastic(0x14161a), [L.headX + 0.12, 0.52, -0.12 + i * 0.24], null, 'FL_slotfeed' + i); // 送布槽
  };

  /* ===== 送布牙（slide 李萨如椭圆轨迹） ===== */
  part({
    id: 'feeddog', zh: '送布牙', en: 'FEED DOG', real: false,
    desc: `送布牙是"会咬布的齿条"：抬牙偏心与送布偏心合成一条椭圆轨迹——上升咬住布面，水平推进一个针距（${P.feedStroke}mm），下降脱开，再空程退回。四杆机构合成这条闭合曲线，轨迹形状决定"车缝直不直、布皱不皱"（演示轨迹按真机行程视觉放大 ~2.2×）。`,
    offset: [0.6, -0.8, 1.7],
  });
  assembledPos.feeddog = [0, 0, 0];
  builders.feeddog = (g) => {
    const steel = FORGE_MATS.machinedSteel();
    mesh(g, box(0.16, 0.05, 0.34), steel, [L.headX + 0.12, 0.46, 0], null, 'FL_body');
    for (let i = 0; i < 3; i++) {
      mesh(g, box(0.14, 0.015, 0.012), steel, [L.headX + 0.12, 0.492, -0.1 + i * 0.1], null, 'FL_tooth' + i);
    }
  };

  /* ===== 旋梭与梭芯（spin 2×） ===== */
  part({
    id: 'hook', zh: '旋梭与梭芯', en: 'ROTARY HOOK & BOBBIN', real: false,
    desc: '锁式线迹的心脏：针降到最低点再回升 2mm 左右，针眼旁胀出一个线环，旋梭的尖钩恰在此时穿过线环，带着面线整体绕梭芯转一圈——面线就此"抱住"底线，被挑线杆拉回布层中间绞合。旋梭转速是针杆的 2 倍（一圈缝一针，另一圈脱线复位）；它也是整台机器对精度、润滑与清洁最敏感的部件。',
    offset: [-0.4, -1.1, 1.0],
  });
  assembledPos.hook = [L.headX, 0.28, 0];
  builders.hook = (g) => {
    const steel = FORGE_MATS.machinedSteel();
    mesh(g, new THREE.TorusGeometry(0.3, 0.045, 12, 28), FORGE_MATS.forgedSteel(), [0, 0, 0], [Math.PI / 2, 0, 0], 'FL_race'); // 梭床环
    mesh(g, cyl(0.26, 0.26, 0.14, 24), steel, [0, 0, 0], null, 'FL_bobcase');           // 梭壳
    mesh(g, cyl(0.1, 0.1, 0.12, 16), FORGE_MATS.plastic(0x2a2e33), [0, 0, 0], null, 'FL_bobbin'); // 梭芯
    mesh(g, box(0.05, 0.1, 0.04), steel, [0.3, 0.02, 0], [0, 0, 0.4], 'FL_point');      // 尖钩
  };

  /* ===== 布样（场景道具，静态） ===== */
  part({
    id: 'fabric', zh: '布样与已缝线迹', en: 'FABRIC SWATCH', real: false,
    desc: `压脚下的布样：上面已缝的${stitchRows}行线迹，就是"两根线在布层中间绞合"的成品——正面是面线组成的虚线，翻到底面看是底线组成的虚线，两层布被同一批绞合点锁住。布样为静态道具：送布牙推布的过程以轨迹演示代替（布不随动）。`,
    offset: [-1.5, 0.2, 0.7],
  });
  assembledPos.fabric = [0, 0, 0];
  builders.fabric = (g) => {
    const cloth = FORGE_MATS.plastic(fabricColor);
    mesh(g, box(1.2, 0.045, 0.85), cloth, [L.headX + 0.05, 0.56, 0], null, 'FL_cloth');
    const tmat = FORGE_MATS.plastic(threadColor);
    for (let r = 0; r < stitchRows; r++) {
      for (let i = 0; i < 12; i++) {
        mesh(g, box(0.045, 0.006, 0.016), tmat,
          [L.headX - 0.42 + i * 0.062, 0.585, -0.28 + r * 0.11], null, 'FL_st' + r + '_' + i);
      }
    }
  };

  /* ===== 运动演示：手轮驱动链（1 针 = 手轮 1 圈 = 针杆 1 往复 = 旋梭 2 圈） ===== */
  const w = P.cadence * Math.PI * 2;                 // 上轴角速度 rad/s
  const demos = [{
    partId: 'handwheel',
    label: '锁式线迹联动演示（运动学示意 · 旋梭 2:1）',
    spin: [w, 0, 0],
    also: [
      { partId: 'needlebar', slide: { axis: [0, 1, 0], amp: L.needleAmp, f: P.cadence } },
      { partId: 'takeup', wobble: [0.42, 0, 0], wobbleF: w },
      { partId: 'hook', spin: [0, 2 * w, 0] },
      { partId: 'feeddog', slide: { axis: [0, 1, 0], amp: L.feedUp, f: P.cadence, axis2: [0, 0, 1], amp2: L.feedFwd, phase2: Math.PI / 2 } },
    ],
  }];

  /* ===== V4.0 Mechanism Graph：稳定 ID + 类型化关系 ===== */
  const mechEdges = [
    { id: 'rev-wheel-frame', type: 'revolute', from: 'frame', to: 'handwheel', kinematic: 'exact', axis: [1, 0, 0], anchor: [2.08, L.handY, 0], note: '手轮/上轴绕臂端轴线回转（踏板皮带驱动，概念）' },
    { id: 'sc-wheel-needle', type: 'slider_crank', from: 'handwheel', to: 'needlebar', kinematic: 'approx', axis: [0, 1, 0], anchor: [L.headX, 0, 0], note: '针杆曲柄滑块：上轴 1:1 带动针杆正弦往复；连杆摆动以平动近似' },
    { id: 'gm-wheel-hook', type: 'gear_mesh', from: 'handwheel', to: 'hook', kinematic: 'approx', ratio: 2, note: '上轴:旋梭轴 1:2 齿轮副 → 旋梭转速 2×（一圈钩线环、一圈复位）' },
    { id: 'lk-frame-takeup', type: 'linkage', from: 'frame', to: 'takeup', kinematic: 'approx', note: '挑线杆绕头部枢轴摆动（凸轮/连杆驱动概念，时序未做微调）' },
    { id: 'lk-frame-feed', type: 'linkage', from: 'frame', to: 'feeddog', kinematic: 'approx', note: '送布牙：抬牙 + 送布双偏心四杆合成椭圆轨迹（视觉放大 ~2.2×）' },
    { id: 'fx-frame-presser', type: 'fixed', from: 'frame', to: 'presser', note: '压脚杆经弹簧导套固定于头部' },
    { id: 'fx-frame-plate', type: 'fixed', from: 'frame', to: 'throatplate', note: '针板螺钉固定于底座台面' },
    { id: 'fx-frame-tension', type: 'fixed', from: 'frame', to: 'tension', note: '张力器固定于立柱前面板' },
    { id: 'vo-frame-thread', type: 'visual_only', from: 'frame', to: 'threadpath', note: '面线走线为静态路径示意（不参与运动学）' },
    { id: 'vo-frame-fabric', type: 'visual_only', from: 'frame', to: 'fabric', note: '布样为静态场景道具（送布以轨迹演示代替布随动）' },
    { id: 'sup-hook-frame', type: 'bearing_support', from: 'frame', to: 'hook', kinematic: 'exact', note: '旋梭轴经梭床座支承于底座下方' },
  ];

  const dev = {
    id,
    name: '锻造锁式线迹机构 · 概念机',
    en: 'FORGED LOCKSTITCH MECHANISM',
    category: '机械',
    accent: '#d98e6a',
    description: `MECHANICAL FORGE 程序化生成（生成器 v${GENERATOR_VERSION} · 种子 ${seed}）：平缝机锁式线迹（Lockstitch 301）运动学概念示意——针杆往复、旋梭 2:1 环线、送布牙椭圆轨迹、挑线杆收线，四条运动链由手轮（上轴）统一驱动。机构关系可视化模型：频率比与往复/摆动关系为运动学示意，面线走线为静态路径，送布轨迹视觉放大；非真实可制造工程模型。`,
    specs: [
      ['线迹', 'Lockstitch 301（概念）'],
      ['机构', '针杆 + 旋梭 2:1 + 送布四杆'],
      ['针杆行程', `${P.needleStroke} mm`],
      ['针距', `${P.feedStroke} mm（演示放大 ~2.2×）`],
      ['驱动', '手轮 1 圈 = 1 针（踏板概念）'],
      ['来源', '本机程序化生成（MECHANICAL FORGE）'],
    ],
    parts,
    builders,
    assembledPos,
    demos,
    mech: { driver: 'handwheel', edges: mechEdges },
    tour: [
      { id: 'frame', note: '整机布局：水平悬臂把针杆机构悬到操作面上方，立柱与底座藏下轴与旋梭——上下两条轴系靠齿轮副隔着臂长协作（概念工作循环示意，非真实缝纫过程）。' },
      { id: 'handwheel', note: '手轮（上轴端）：整条传动链的时基——一圈就是一针。选中它启动全机构联动演示：针杆、挑线杆、旋梭、送布牙同时按各自频率比运动。' },
      { id: 'needlebar', note: '针杆与机针：下行穿布，上行"甩"出线环——线环是锁式线迹的钥匙，旋梭等的就是它。' },
      { id: 'hook', note: '旋梭与梭芯：以 2 倍于针杆的转速用尖钩穿过线环，带着面线绕梭芯一整圈，让面线抱住底线——两根线从此在布层中间绞合。' },
      { id: 'takeup', note: '挑线杆：绞合完成后猛地收线，把绞合点锁进布层中间，同时从线轴拉出下一段线——它松紧的节奏决定针脚的美丑。' },
      { id: 'feeddog', note: '送布牙：上升咬布、推进一个针距、下降脱开、空程退回——一条椭圆闭合轨迹，由双偏心四杆机构合成（演示放大 ~2.2×）。' },
      { id: 'threadpath', note: '面线走线：线轴 → 挑线孔 → 张力器 → 针眼 → 旋梭——顺序错一步就缝不出锁式线迹，"穿面线"因此是一门手艺。' },
      { id: 'fabric', note: '布样上的线迹就是成果：正面面线、底面底线，两根线被同一批绞合点锁在布层中间——一百七十年前定型，至今没有对手。' },
    ],
    modelSource: '/forge',
    modelCredit: 'MECHANICAL FORGE · 参数化生成（本机）',
    forge: { generator: GENERATOR_ID, version: GENERATOR_VERSION, params: P, seed },
  };
  return dev;
}
