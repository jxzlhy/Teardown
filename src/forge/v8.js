/* 机械锻造所 · V8 内燃机生成器（V3.0 任务书 PHASE 3 标杆）
   布局：90°/60° 交叉曲柄 pushrod V8 概念示意（四销曲轴，相位 [0,90,270,180]）。
   真实性口径（任务书 §2.3/§3.2A）：结构关系可信的可视化模型——
   曲柄销相位、活塞/连杆沿各自缸轴的往复联动、缸列夹角一致；不虚构性能参数、
   不宣称可制造；零件为参数化网格，命名与层级服务于拆解教学。
   复用引擎既有能力：装配/拾取/爆炸/标签/X-Ray/双厅/stroke 演示（含 also 伴随联动）。 */

import * as THREE from 'three';
import { makeRng, seedFromString } from './rand.js';
import { FORGE_MATS } from './materials.js';

export const GENERATOR_ID = 'v8';
export const GENERATOR_VERSION = 1;

/* 参数 Schema（§4.1）：UI 与校验共用；改动参数只影响相关结构 */
export const SCHEMA = {
  bankAngle: { type: 'enum', options: [60, 90], default: 90, label: '气缸列夹角', unit: '°', note: '交叉曲柄 V8 常见 90°；60° 为紧凑布局' },
  bore: { type: 'range', min: 82, max: 110, step: 1, default: 96, label: '缸径', unit: 'mm' },
  stroke: { type: 'range', min: 70, max: 110, step: 1, default: 90, label: '行程', unit: 'mm', note: '行程 / 缸径比决定曲柄回转半径与连杆长度' },
  finish: { type: 'enum', options: ['bare', 'painted'], default: 'painted', label: '表面处理', note: 'bare=铸造裸金属；painted=涂装缸体' },
  detail: { type: 'range', min: 0, max: 2, step: 1, default: 1, label: '细节密度', unit: '级', note: '螺栓/加强肋数量随级数增加' },
};

export function defaultParams() {
  const out = {};
  for (const k of Object.keys(SCHEMA)) out[k] = SCHEMA[k].default;
  return out;
}

/* 预设方案（PHASE 4）：一键填充参数面板，仍可手调 */
export const PRESETS = [
  { id: 'balanced', label: '均衡概念机', params: { bankAngle: 90, bore: 96, stroke: 90, finish: 'painted', detail: 1 } },
  { id: 'revver', label: '小缸径高转速', params: { bankAngle: 90, bore: 84, stroke: 72, finish: 'bare', detail: 2 } },
  { id: 'torque', label: '大缸径扭矩型', params: { bankAngle: 90, bore: 108, stroke: 108, finish: 'bare', detail: 2 } },
  { id: 'compact60', label: '紧凑 60° 布局', params: { bankAngle: 60, bore: 92, stroke: 86, finish: 'painted', detail: 1 } },
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

export function describeParams(p) {
  const disp = (Math.PI / 4) * p.bore * p.bore * p.stroke * 8 / 1e6;   // 升
  return { displacementL: +disp.toFixed(2) };
}

/* ---------- 单位与布局推导（1 模型单位 ≈ 100mm） ---------- */
function deriveLayout(P) {
  const u = (mm) => mm / 100;
  const bore = u(P.bore), stroke = u(P.stroke);
  const r = stroke / 2;                       // 曲柄回转半径
  const rod = 1.68 * stroke / 1;              // 连杆长 1.68×行程（概念比）
  const deck = r + rod + u(32);               // 缸体顶面（沿缸轴，自曲轴中心）
  const half = (P.bankAngle / 2) * Math.PI / 180;
  const axisL = [-Math.sin(half), Math.cos(half), 0];
  const axisR = [Math.sin(half), Math.cos(half), 0];
  const spacing = bore + u(27);               // 缸距（缸套壁+水套）
  const zs = [-1.5, -0.5, 0.5, 1.5].map(k => k * spacing);  // 四个曲柄销站位
  return { bore, stroke, r, rod, deck, half, axisL, axisR, spacing, zs, length: zs[3] + spacing * 0.9 };
}

/* ---------- 小构件工具（全部写入指定 Group，局部原点=设备系） ---------- */
function mesh(g, geo, mat, pos = [0, 0, 0], rot = null) {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(...pos);
  if (rot) m.rotation.set(...rot);
  m.name = 'F8_' + g.name + '_' + (g.children.length + 1);
  g.add(m);
  return m;
}
const box = (w, h, d) => new THREE.BoxGeometry(w, h, d);
const cyl = (r1, r2, h, seg = 20) => new THREE.CylinderGeometry(r1, r2, h, seg);

/* ---------- 主生成入口：params+seed → 设备配置（引擎 buildProceduralParts 直接消费） ---------- */
export function buildV8(rawParams, seedInput, forcedId) {
  const { params: P } = validateParams(rawParams);
  const seed = (typeof seedInput === 'number') ? (seedInput >>> 0) : seedFromString(seedInput);
  const rng = makeRng(seed);
  const L = deriveLayout(P);
  const disp = describeParams(P);
  const id = forcedId || `forge-v8-${seed.toString(36)}`;

  /* 种子驱动的工艺细节（§4.1：随机只落在装饰密度/色泽，不动主结构关系） */
  const ribN = rng.int(4, 7);                    // 侧面加强肋
  const boltRows = rng.int(3, 4);                // 缸盖螺栓排数
  const spokes = rng.int(4, 6);                  // 皮带轮辐条
  const tint = () => rng.gauss(0, 0.035);        // 铸造色泽批次差
  const paintBase = rng.pick([0x3f4a52, 0x274a44, 0x54383a, 0x39435e]);
  const exStyle = rng.pick(['stacked', 'cluster']);

  const builders = {}, assembledPos = {};
  const parts = [];
  const part = (o) => { parts.push(o); return o; };
  const off = (x, y, z) => [x, y, z];

  /* ===== 缸体（含曲轴箱 / 缸套 / 加强肋 / 前后端面） ===== */
  part({
    id: 'block', zh: '缸体（V 型两列）', en: 'CYLINDER BLOCK', real: false,
    desc: `V${P.bankAngle} 布局缸体：左右两列各四缸，缸套压装在缸体水套孔中；曲轴箱部分承载曲轴主轴承座。概念示意结构——比例取自参数（缸径 ${P.bore}mm / 行程 ${P.stroke}mm），不代表具体量产机型。`,
    offset: off(0, 0.6, 0),
  });
  assembledPos.block = [0, 0, 0];
  builders.block = (g) => {
    const cast = FORGE_MATS[P.finish === 'painted' ? 'paint' : 'castIron'](P.finish === 'painted' ? paintBase : tint());
    const alu = FORGE_MATS.castAlu(tint());
    for (const s of [-1, 1]) {
      const bank = new THREE.Group();
      bank.rotation.z = -s * L.half;
      /* 缸体沿缸轴的板状主体 */
      const slab = new THREE.Mesh(box(1.5, L.deck - 0.5, L.length + 0.5), cast);
      slab.position.set(s * 0.35, 0, 0);
      bank.add(slab);
      /* 缸套（开口圆筒，X-Ray 可见） */
      for (const z of L.zs) {
        const liner = new THREE.Mesh(new THREE.CylinderGeometry(L.bore / 2 + 0.055, L.bore / 2 + 0.055, L.deck - 0.72, 22, 1, true),
          FORGE_MATS.forgedSteel());
        liner.material.side = THREE.DoubleSide;
        liner.position.set(0, L.deck / 2 + 0.05, z);
        bank.add(liner);
      }
      /* 侧面加强肋（种子密度） */
      for (let i = 0; i < ribN; i++) {
        const rib = new THREE.Mesh(box(0.06, L.deck * 0.55, 0.09), cast);
        rib.position.set(s * 1.13, -0.1, -L.length / 2 + (i + 0.5) * (L.length / ribN));
        bank.add(rib);
      }
      /* 缸盖结合面螺栓（detail 级别控制排数） */
      if (P.detail >= 1) {
        for (let row = 0; row < boltRows; row++) {
          for (const z of L.zs) {
            const b = new THREE.Mesh(cyl(0.045, 0.045, 0.1, 8), FORGE_MATS.forgedSteel());
            b.position.set(s * (1.18), L.deck - 0.35 - row * 0.42, z + 0.12);
            bank.add(b);
          }
        }
      }
      bank.position.set(s * Math.sin(L.half) * (L.deck / 2 + 0.18), Math.cos(L.half) * (L.deck / 2) - 0.25, 0);
      g.add(bank);
    }
    /* 曲轴箱（下曲轴箱） */
    const cc = new THREE.Mesh(box(2.1, 1.3, L.length + 0.6), cast);
    cc.position.set(0, -0.55, 0);
    g.add(cc);
    /* 前后端面 */
    for (const s of [1, -1]) {
      const plate = new THREE.Mesh(box(1.9, 2.4, 0.1), alu);
      plate.position.set(0, 0.35, s * (L.length / 2 + 0.22));
      g.add(plate);
    }
  };

  /* ===== 曲轴总成（含前端皮带轮与后端飞轮，随演示整体绕曲轴轴旋转） ===== */
  part({
    id: 'crank', zh: '曲轴总成', en: 'CRANKSHAFT ASSEMBLY', real: false,
    desc: `四销交叉平面曲轴：曲柄销相位 [0°,90°,270°,180°]，主轴颈 5 道；前端皮带轮与后端飞轮随曲轴同转。旋转演示展示曲柄连杆的联动关系（运动学示意）。`,
    offset: off(0, 0, 3.0),
  });
  assembledPos.crank = [0, 0, 0];
  builders.crank = (g) => {
    const steel = FORGE_MATS.forgedSteel();
    const mach = FORGE_MATS.machinedSteel();
    /* 主轴颈 5 道 */
    const mains = [L.zs[0] - L.spacing / 2, L.zs[1], 0, L.zs[2], L.zs[3] + L.spacing / 2];
    for (const z of mains) mesh(g, cyl(0.27, 0.27, 0.34, 18), mach, [0, 0, z], [Math.PI / 2, 0, 0]);
    /* 四个曲柄销（相位 [0,90,270,180]）+ 连接重臂 */
    const PH = [0, Math.PI / 2, Math.PI * 1.5, Math.PI];
    L.zs.forEach((z, i) => {
      const a = PH[i];
      const px = Math.cos(a) * L.r, py = Math.sin(a) * L.r;
      mesh(g, cyl(0.21, 0.21, 0.52, 16), mach, [px, py, z], [Math.PI / 2, 0, 0]);
      for (const dz of [-0.36, 0.36]) {   // 连接重臂（配重）
        const web = new THREE.Mesh(box(0.16, L.r + 0.5, 0.24), steel);
        web.position.set(px * 0.45, py * 0.45 - (L.r * 0.25), z + dz);
        web.rotation.z = a;
        g.add(web);
        const cw = new THREE.Mesh(cyl(0.52, 0.52, 0.2, 20), steel);   // 扇形配重（简化整盘）
        cw.position.set(-Math.cos(a) * 0.18, -Math.sin(a) * 0.18 - 0.1, z + dz);
        cw.rotation.x = Math.PI / 2;
        g.add(cw);
      }
    });
    /* 前端皮带轮（辐条随种子） */
    const pulley = new THREE.Group();
    const disc = new THREE.Mesh(cyl(0.62, 0.62, 0.14, 26), FORGE_MATS.castIron(tint()));
    disc.rotation.x = Math.PI / 2;
    pulley.add(disc);
    for (let i = 0; i < spokes; i++) {
      const sp = new THREE.Mesh(box(0.1, 0.5, 0.06), FORGE_MATS.forgedSteel());
      sp.position.set(Math.cos(i / spokes * Math.PI * 2) * 0.3, Math.sin(i / spokes * Math.PI * 2) * 0.3, 0.1);
      sp.rotation.z = i / spokes * Math.PI * 2;
      pulley.add(sp);
    }
    pulley.position.set(0, 0, L.zs[3] + L.spacing / 2 + 0.42);
    g.add(pulley);
    /* 后端飞轮 */
    const fly = new THREE.Mesh(cyl(0.95, 0.95, 0.16, 30), FORGE_MATS.machinedSteel());
    fly.rotation.x = Math.PI / 2;
    fly.position.set(0, 0, -L.zs[0] - L.spacing / 2 - 0.35);
    g.add(fly);
  };

  /* ===== 活塞连杆组（8 活塞 + 8 连杆；stroke 演示沿各自缸轴往复） ===== */
  part({
    id: 'pistons', zh: '活塞连杆组 ×8', en: 'PISTON & ROD SET', real: false,
    desc: '每缸一组活塞+连杆：活塞顶承受燃烧压力，经活塞销传至连杆，连杆大端套在曲柄销上。往复演示沿各缸轴运动，相位遵循交叉曲柄（同销对缸共享相位）——连杆摆动以平动近似（示意口径）。',
    offset: off(0, 1.15, 2.0),
  });
  assembledPos.pistons = [0, 0, 0];
  builders.pistons = (g) => {
    const PH = [0, Math.PI / 2, Math.PI * 1.5, Math.PI];
    L.zs.forEach((z, i) => {
      for (const s of [-1, 1]) {
        const ax = new THREE.Vector3(s * Math.sin(L.half), Math.cos(L.half), 0);
        /* 曲柄销位置（装配相位）与活塞销位置（行程中段） */
        const a = PH[i];
        const pin = new THREE.Vector3(Math.cos(a) * L.r, Math.sin(a) * L.r, z);
        const pinH = L.deck - 0.34;                     // 活塞销高（沿缸轴）
        const pistonPin = ax.clone().multiplyScalar(pinH);
        pistonPin.z = z;
        const aluP = FORGE_MATS.castAlu(tint() + 0.06);
        /* 活塞：冠 + 裙 */
        const crown = new THREE.Mesh(cyl(L.bore / 2 - 0.075, L.bore / 2 - 0.075, 0.3, 20), aluP);
        crown.position.copy(pistonPin).addScaledVector(ax, 0.3);
        g.add(crown);
        const skirt = new THREE.Mesh(cyl(L.bore / 2 - 0.1, L.bore / 2 - 0.1, 0.26, 20), aluP);
        skirt.position.copy(pistonPin).addScaledVector(ax, -0.02);
        g.add(skirt);
        /* 连杆：大端 + 杆身 + 小端（沿销→销方向） */
        const rodDir = pistonPin.clone().sub(pin);
        const rodLen = rodDir.length();
        const rodG = new THREE.Group();
        const bigEnd = new THREE.Mesh(new THREE.TorusGeometry(0.17, 0.07, 10, 18), FORGE_MATS.forgedSteel());
        rodG.add(bigEnd);
        const beam = new THREE.Mesh(box(0.12, rodLen - 0.34, 0.09), FORGE_MATS.forgedSteel());
        beam.position.set(0, rodLen / 2, 0);
        rodG.add(beam);
        const smallEnd = new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.05, 8, 14), FORGE_MATS.forgedSteel());
        smallEnd.position.set(0, rodLen, 0);
        rodG.add(smallEnd);
        rodG.position.copy(pin);
        rodG.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), rodDir.normalize());
        g.add(rodG);
      }
    });
  };

  /* ===== 左右缸盖 ===== */
  part({
    id: 'heads', zh: '缸盖 ×2', en: 'CYLINDER HEADS', real: false,
    desc: '密封两列气缸顶端并容纳燃烧室与气门传动（本示意不做气门细部）；外侧面为火花塞位。拆解时沿竖直方向升起。',
    offset: off(0, 2.5, 0),
  });
  assembledPos.heads = [0, 0, 0];
  builders.heads = (g) => {
    for (const s of [-1, 1]) {
      const head = new THREE.Group();
      head.rotation.z = -s * L.half;
      const slab = new THREE.Mesh(box(1.45, 0.5, L.length + 0.4), FORGE_MATS.castAlu(tint()));
      head.add(slab);
      for (const z of L.zs) {   // 火花塞（陶瓷）
        const plug = new THREE.Mesh(cyl(0.07, 0.05, 0.2, 10), FORGE_MATS.ceramic());
        plug.position.set(s * 0.78, 0.05, z);
        plug.rotation.z = s * Math.PI / 2;
        head.add(plug);
      }
      head.position.set(s * Math.sin(L.half) * (L.deck + 0.42), Math.cos(L.half) * (L.deck + 0.42) - 0.25, 0);
      g.add(head);
    }
  };

  /* ===== 气门室盖罩 ===== */
  part({
    id: 'covers', zh: '气门室盖罩 ×2', en: 'VALVE COVERS', real: false,
    desc: '缸盖顶部的密封罩盖，涂装随生成种子变化（本馆 forged 涂装体系）；加油口盖位于外侧。',
    offset: off(0, 3.35, 0),
  });
  assembledPos.covers = [0, 0, 0];
  builders.covers = (g) => {
    for (const s of [-1, 1]) {
      const cov = new THREE.Group();
      cov.rotation.z = -s * L.half;
      const shell = new THREE.Mesh(box(1.3, 0.3, L.length + 0.2), FORGE_MATS.paint(new THREE.Color(paintBase).offsetHSL(0, 0, 0.06).getHex()));
      cov.add(shell);
      const cap = new THREE.Mesh(cyl(0.14, 0.14, 0.1, 14), FORGE_MATS.machinedSteel());
      cap.position.set(s * 0.45, 0.18, L.zs[3] - 0.2);
      cov.add(cap);
      cov.position.set(s * Math.sin(L.half) * (L.deck + 0.88), Math.cos(L.half) * (L.deck + 0.88) - 0.25, 0);
      g.add(cov);
    }
  };

  /* ===== 进气歧管（V 谷中央） ===== */
  part({
    id: 'intake', zh: '进气歧管', en: 'INTAKE MANIFOLD', real: false,
    desc: '中央稳压腔向两列各四缸分配进气的歧管示意；八根进气道短管分别探向缸盖内侧。概念布局，不对应具体机型进气谐振设计。',
    offset: off(0, 1.7, 0),
  });
  assembledPos.intake = [0, 0, 0];
  builders.intake = (g) => {
    const alu = FORGE_MATS.castAlu(tint());
    const valleyY = Math.cos(L.half) * (L.deck + 0.2) - 0.1;
    const plenum = new THREE.Mesh(box(1.0, 0.5, L.length * 0.8), alu);
    plenum.position.set(0, valleyY + 0.5, 0);
    g.add(plenum);
    for (const s of [-1, 1]) {
      for (const z of L.zs) {
        const runner = new THREE.Mesh(cyl(0.14, 0.14, 0.6, 12), alu);
        runner.position.set(s * 0.62, valleyY + 0.28, z);
        runner.rotation.z = s * (Math.PI / 2 - 0.35);
        g.add(runner);
      }
    }
  };

  /* ===== 排气歧管（两侧） ===== */
  part({
    id: 'exhaust', zh: '排气歧管 ×2', en: 'EXHAUST MANIFOLDS', real: false,
    desc: '两列缸盖外侧的排气歧管：四根汇集管汇入集气总管。排布样式（堆叠/簇状）由生成种子决定。',
    offset: off(0, 0.75, 0),
  });
  assembledPos.exhaust = [0, 0, 0];
  builders.exhaust = (g) => {
    const iron = FORGE_MATS.castIron(tint() + 0.02);
    for (const s of [-1, 1]) {
      const outer = new THREE.Vector3(s * Math.sin(L.half), Math.cos(L.half) * 0.35, 0).normalize();
      const baseY = Math.cos(L.half) * L.deck * 0.62;
      const zc = exStyle === 'stacked' ? L.zs[1] : 0;
      for (const z of L.zs) {
        const run = new THREE.Mesh(cyl(0.11, 0.11, 0.85, 12), iron);
        run.position.set(s * 1.35, baseY + 0.35, z);
        run.rotation.z = s * (Math.PI / 2 - 0.2);
        g.add(run);
      }
      const collect = new THREE.Mesh(cyl(0.17, 0.17, L.length * 0.62, 14), iron);
      collect.rotation.x = Math.PI / 2;
      collect.position.set(s * 1.42, baseY + 0.1, zc);
      g.add(collect);
    }
  };

  /* ===== 油底壳 ===== */
  part({
    id: 'pan', zh: '油底壳', en: 'OIL PAN', real: false,
    desc: '曲轴箱下方的机油储存壳体，带前部集油槽（浅泪滴状示意）；密封面与曲轴箱下缘接合。',
    offset: off(0, -1.5, 0),
  });
  assembledPos.pan = [0, 0, 0];
  builders.pan = (g) => {
    const alu = FORGE_MATS.castAlu(tint());
    const body = new THREE.Mesh(box(2.05, 0.55, L.length + 0.4), alu);
    body.position.set(0, -1.32, 0);
    g.add(body);
    const sump = new THREE.Mesh(box(1.8, 0.5, L.length * 0.42), alu);
    sump.position.set(0, -1.78, -L.length * 0.2);
    g.add(sump);
  };

  /* ===== 前端盖（正时端） ===== */
  part({
    id: 'front', zh: '前端盖与正时端', en: 'FRONT COVER & TIMING END', real: false,
    desc: '曲轴前端盖板与正时机构外罩（本示意不做正时链细部）；中央开孔让曲轴皮带轮外露。',
    offset: off(0, 0, 1.8),
  });
  assembledPos.front = [0, 0, 0];
  builders.front = (g) => {
    const alu = FORGE_MATS.castAlu(tint());
    const plate = new THREE.Mesh(box(1.7, 2.2, 0.12), alu);
    plate.position.set(0, 0.3, L.zs[3] + L.spacing / 2 + 0.12);
    g.add(plate);
    const hub = new THREE.Mesh(new THREE.TorusGeometry(0.34, 0.05, 10, 20), FORGE_MATS.machinedSteel());
    hub.position.set(0, 0, L.zs[3] + L.spacing / 2 + 0.2);
    g.add(hub);
  };

  /* ===== 后端板（飞轮端） ===== */
  part({
    id: 'rear', zh: '后端板与飞轮壳端', en: 'REAR PLATE & BELL END', real: false,
    desc: '飞轮端盖板；与变速箱结合端的概念示意结构。',
    offset: off(0, 0, -1.8),
  });
  assembledPos.rear = [0, 0, 0];
  builders.rear = (g) => {
    const alu = FORGE_MATS.castAlu(tint());
    const plate = new THREE.Mesh(box(1.9, 2.6, 0.12), alu);
    plate.position.set(0, 0.3, -L.zs[0] - L.spacing / 2 - 0.55);
    g.add(plate);
  };

  /* 运动演示：选中「曲轴总成」→ 曲轴旋转 + 活塞连杆组沿缸轴往复（交叉曲柄相位） */
  const strokeAmp = L.stroke * 0.42;
  const demos = [{
    partId: 'crank',
    label: '曲柄连杆运动演示（运动学示意）',
    spin: [0, 0, 2.6],
    also: [{
      partId: 'pistons',
      stroke: { axisL: L.axisL, axisR: L.axisR, splitX: 0, amp: strokeAmp, f: 2.6 / (2 * Math.PI) },
    }],
  }];

  /* ===== V4.0 Mechanism Graph（任务书 §4）：稳定 ID + 类型化关系 + 可信度标注 =====
     kinematic 口径：曲轴转动 exact（几何即真实）；曲柄滑块 approx（活塞沿缸轴往复为解析精确，
     连杆摆动以平动近似）；固定/支撑类为装配约束（static）。 */
  const PH = [0, Math.PI / 2, Math.PI * 1.5, Math.PI];
  const mechEdges = [
    ...L.zs.map((z, i) => ({
      id: `sc-cyl${i + 1}`, type: 'slider_crank', from: 'crank', to: 'pistons',
      kinematic: 'approx',
      axis: i % 2 === 0 ? L.axisL.map(v => +v.toFixed(3)) : L.axisR.map(v => +v.toFixed(3)),
      anchor: [0, 0, +z.toFixed(3)],
      phase: Math.round(PH[i] * 180 / Math.PI),
      note: `第 ${i + 1} 缸曲柄滑块（曲柄销相位 ${Math.round(PH[i] * 180 / Math.PI)}°，同销对缸共享相位）；活塞沿缸轴往复解析精确，连杆摆动平动近似`,
    })),
    { id: 'sup-mains', type: 'bearing_support', from: 'block', to: 'crank', kinematic: 'exact', note: '曲轴主轴颈 5 道支承于曲轴箱轴承座' },
    { id: 'sup-front', type: 'bearing_support', from: 'front', to: 'crank', kinematic: 'exact', note: '前端盖曲轴前轴承' },
    { id: 'sup-rear', type: 'bearing_support', from: 'rear', to: 'crank', kinematic: 'exact', note: '后端板曲轴后轴承（飞轮端）' },
    { id: 'fx-block-heads', type: 'fixed', from: 'block', to: 'heads', note: '缸盖螺栓（种子排数）将缸盖固定于缸体顶面' },
    { id: 'fx-heads-covers', type: 'fixed', from: 'heads', to: 'covers', note: '气门室盖罩密封固定' },
    { id: 'fx-block-pan', type: 'fixed', from: 'block', to: 'pan', note: '油底壳与曲轴箱下缘密封固定' },
    { id: 'fx-heads-intake', type: 'fixed', from: 'heads', to: 'intake', note: '进气歧管法兰固定于缸盖内侧' },
    { id: 'fx-heads-exhaust', type: 'fixed', from: 'heads', to: 'exhaust', note: '排气歧管固定于缸盖外侧' },
    { id: 'fx-block-front', type: 'fixed', from: 'block', to: 'front', note: '前端盖与缸体端面固定' },
    { id: 'fx-block-rear', type: 'fixed', from: 'block', to: 'rear', note: '后端板与缸体端面固定' },
  ];

  const dev = {
    id,
    name: `锻造 V8 · ${disp.displacementL}L 概念机`,
    en: 'FORGED V8 — PROCEDURAL CONCEPT',
    category: '机械',
    accent: '#e0a458',
    description: `MECHANICAL FORGE 程序化生成（生成器 v${GENERATOR_VERSION} · 种子 ${seed}）：${P.bankAngle}° 交叉曲柄 pushrod V8 概念示意，排量 ${disp.displacementL}L（由缸径 ${P.bore}mm × 行程 ${P.stroke}mm 推导）。结构关系可视化模型——可拆解、可联动演示、参数与种子可复现；非真实可制造工程模型，不标注任何性能参数。`,
    specs: [
      ['布局', `V${P.bankAngle} · 交叉曲柄（概念）`],
      ['排量', `${disp.displacementL}L（参数推导）`],
      ['缸径 × 行程', `${P.bore} × ${P.stroke} mm`],
      ['构件', '10 部件组 · 全参数化网格'],
      ['运动', '曲轴旋转 + 活塞连杆往复联动'],
      ['来源', '本机程序化生成（MECHANICAL FORGE）'],
    ],
    parts,
    builders,
    assembledPos,
    demos,
    mech: { driver: 'crank', edges: mechEdges },
    /* V4.0 MI④ 工作原理分步演示（任务书 §7）：复用 Tour 格式的策展讲解——概念工作循环示意口径 */
    tour: [
      { id: 'block', note: '整机布局：90° 夹角两列各四缸，曲轴纵贯曲轴箱——先看整体再进内部（概念工作循环示意，非真实热力过程）。' },
      { id: 'crank', note: '曲轴：四销交叉平面，曲柄销相位 0°/90°/270°/180°，五道主轴颈。选中状态下旋转演示自动运行——观察曲柄销的相位差。' },
      { id: 'pistons', note: '活塞连杆组：八组活塞沿各自缸轴往复，同销对缸共享相位；往复为解析精确，连杆摆动以平动近似。' },
      { id: 'heads', note: '缸盖：密封气缸顶端形成燃烧室，外侧为火花塞位——本示意不含气门传动细部。' },
      { id: 'covers', note: '气门室盖罩：涂装色与加强肋数量由生成种子决定——参数与种子决定外观细节。' },
      { id: 'intake', note: '进气歧管：中央稳压腔经八根气道向两列分配进气（概念布局，不做谐振设计声明）。' },
      { id: 'pan', note: '油底壳：曲轴箱下部机油储存与集油槽——润滑系统的基础构件。' },
    ],
    modelSource: '/forge',
    modelCredit: 'MECHANICAL FORGE · 参数化生成（本机）',
    forge: { generator: GENERATOR_ID, version: GENERATOR_VERSION, params: P, seed },
  };
  return dev;
}
