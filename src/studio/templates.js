/* 创作工作室 · 参数化机械模板（V5.0.6 MECHANICAL CREATOR 首切片，总任务书 8.7）
   齿轮对 / 曲柄滑块：参数校验钳制 → 确定性几何 → 稳定 ID → 同一装配下游。
   齿形为简化梯形轮廓（演示口径，如实标注；不宣称可制造工程模型）。
   纯几何逻辑，tools/templates-unit.mjs 可 Node 级验证。 */

import * as THREE from 'three';

export const TEMPLATE_KINDS = ['gearpair', 'slidercrank'];

/* —— 参数钳制表（min/max/默认）—— */
const CLAMPS = {
  gearpair: {
    module: { min: 0.5, max: 8, def: 1 },
    teethA: { min: 6, max: 200, def: 20 },
    teethB: { min: 6, max: 200, def: 30 },
    thickness: { min: 0.1, max: 3, def: 0.35 },
  },
  slidercrank: {
    crankR: { min: 0.1, max: 2, def: 0.5 },
    rodL: { min: 0.3, max: 4, def: 1.4 },
    offset: { min: 0, max: 1, def: 0 },
  },
};

function clampParam(kind, key, v) {
  const c = CLAMPS[kind] && CLAMPS[kind][key];
  if (!c) return undefined;
  const n = Number(v);
  if (!Number.isFinite(n)) return c.def;
  return Math.min(c.max, Math.max(c.min, n));
}

export function templateClamps(kind) { return CLAMPS[kind] || null; }

/* —— 齿形：极坐标采样梯形齿（每齿 4 点：根-顶-顶-根）+ 轴孔 —— */
function gearShape(teeth, m) {
  const rPitch = m * teeth / 2;
  const rAdd = rPitch + m;
  const rDed = Math.max(0.05, rPitch - 1.25 * m);
  const shape = new THREE.Shape();
  const N = teeth * 4;
  for (let i = 0; i < N; i++) {
    const a = (i / N) * Math.PI * 2;
    const phase = i % 4;                       // 根/顶/顶/根
    const r = (phase === 1 || phase === 2) ? rAdd : rDed;
    const x = Math.cos(a) * r, y = Math.sin(a) * r;
    if (i === 0) shape.moveTo(x, y); else shape.lineTo(x, y);
  }
  shape.closePath();
  const hole = new THREE.Path();
  hole.absarc(0, 0, Math.max(0.06, m * 0.8), 0, Math.PI * 2, true);
  shape.holes.push(hole);
  return shape;
}

function buildGearPair(p) {
  const root = new THREE.Group();
  const mat = new THREE.MeshStandardMaterial({ color: 0xb8bdc4, metalness: 0.9, roughness: 0.3 });
  const parts = [];
  const add = (mesh, id, zh) => {
    mesh.name = id;
    mesh.userData.partId = id;
    mesh.userData.partZh = zh;
    root.add(mesh);
    parts.push({ id, zh, mesh });
  };
  const mk = (teeth, angle) => {
    const rPitch = p.module * teeth / 2;
    const geo = new THREE.ExtrudeGeometry(gearShape(teeth, p.module),
      { depth: p.thickness, bevelEnabled: false, curveSegments: 4 });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.rotation.x = -Math.PI / 2;              // 平放（齿面朝上）
    mesh.rotation.z = angle;
    return { mesh, rPitch };
  };
  const a = mk(p.teethA, 0);
  const cd = p.module * (p.teethA + p.teethB) / 2;   // 标准中心距（精确啮合口径）
  a.mesh.position.set(0, 0, 0);
  add(a.mesh, 'gear_a', `主动轮 ${p.teethA} 齿`);
  const b = mk(p.teethB, Math.PI / p.teethB);        // 半齿角错齿啮合
  b.mesh.position.set(cd, 0, 0);
  add(b.mesh, 'gear_b', `从动轮 ${p.teethB} 齿`);
  return { root, parts, centerDistance: cd };
}

/* —— 曲柄滑块：静态装配快照（θ=90°；运动学演示留待 kinematics 集成） —— */
function buildSliderCrank(p) {
  const root = new THREE.Group();
  const parts = [];
  const mat = new THREE.MeshStandardMaterial({ color: 0xb8bdc4, metalness: 0.85, roughness: 0.35 });
  const add = (mesh, id, zh) => {
    mesh.name = id;
    mesh.userData.partId = id;
    mesh.userData.partZh = zh;
    root.add(mesh);
    parts.push({ id, zh, mesh });
  };
  const { crankR, rodL, offset } = p;
  /* 存在性约束（标准滑块机构口径）：L > r + offset，否则滑块无法到达全部相位 */
  const feasible = rodL > crankR + offset;
  const theta = Math.PI / 2;
  const px = Math.cos(theta) * crankR;
  const py = Math.sin(theta) * crankR;          // 曲柄销在曲柄圆上，与 offset 无关
  /* 滑块位移（标准公式）：sx = r·cosθ + √(L² − (offset − r·sinθ)²) */
  const dy = offset - Math.sin(theta) * crankR;
  const sx = crankR * Math.cos(theta) + Math.sqrt(Math.max(0, rodL * rodL - dy * dy));

  const disc = new THREE.Mesh(new THREE.CylinderGeometry(crankR, crankR, 0.12, 36), mat);
  disc.rotation.x = Math.PI / 2;
  disc.position.set(0, 0, 0);
  add(disc, 'crank_disc', '曲柄盘');

  const pin = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.3, 16), mat);
  pin.rotation.x = Math.PI / 2;
  pin.position.set(px, py, 0);
  add(pin, 'crank_pin', '曲柄销');

  const rod = new THREE.Mesh(new THREE.BoxGeometry(rodL, 0.07, 0.07), mat);
  const rodAngle = Math.atan2(offset - py, sx - px);
  rod.position.set((px + sx) / 2, (py + offset) / 2, 0);
  rod.rotation.z = rodAngle;
  add(rod, 'rod', '连杆');

  const slider = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.14, 0.18), mat);
  slider.position.set(sx, offset, 0);
  add(slider, 'slider', '滑块');

  const guide = new THREE.Mesh(new THREE.BoxGeometry(rodL + crankR * 2 + 0.5, 0.03, 0.12), mat);
  guide.position.set(sx / 2, offset - 0.085, 0);
  add(guide, 'guide', '导轨');
  return { root, parts, feasible, sliderX: sx };
}

export function buildTemplate(kind, rawParams) {
  if (!TEMPLATE_KINDS.includes(kind)) {
    return { ok: false, reason: `未知模板：${JSON.stringify(kind)}（支持 ${TEMPLATE_KINDS.join('/')}）` };
  }
  const clamps = CLAMPS[kind];
  const params = {};
  for (const [k, c] of Object.entries(clamps)) params[k] = clampParam(kind, k, (rawParams || {})[k]);
  const out = kind === 'gearpair' ? buildGearPair(params) : buildSliderCrank(params);
  return { ok: true, kind, params, root: out.root, parts: out.parts, ...out };
}

/* —— 文字入口检测：模板关键词 → {kind, params} —— */
export function detectTemplate(text) {
  const t = String(text);
  const num = (re) => { const m = t.match(re); return m ? +m[1] : null; };
  if (/齿轮|啮合/.test(t)) {
    const pair = t.match(/(\d+)\s*[:比到]\s*(\d+)/);       // 20:30 / 20比30
    return {
      kind: 'gearpair',
      params: {
        module: num(/模数\s*([\d.]+)/) ?? undefined,
        teethA: pair ? +pair[1] : num(/(?:主动[轮从]?|大[轮从]?)\s*(\d+)/) ?? undefined,
        teethB: pair ? +pair[2] : num(/(?:从动[轮从]|小[轮从])\s*(\d+)/) ?? undefined,
      },
    };
  }
  if (/曲柄|滑块|活塞/.test(t)) {
    return {
      kind: 'slidercrank',
      params: {
        crankR: num(/曲柄\s*([\d.]+)/) ?? undefined,
        rodL: num(/连杆\s*([\d.]+)/) ?? undefined,
        offset: num(/偏置\s*([\d.]+)/) ?? undefined,
      },
    };
  }
  return null;
}
