/* 创作工作室 · 文字程序化建模（V5.0.4 TEXT TO 3D，总任务书 7.2/17.6 口径）
   确定性关键词模板解析：文字 → 结构化 spec → THREE 几何装配。
   —— 不是 AI 生成：无模型推断、无概率输出；同一描述恒产生同一结构（UI 如实标注）。
   —— 识别不了的字词如实列出（unknown），绝不把未识别包装成结构。
   产物走与导入完全相同的下游（诊断/编辑/作品库/导出）。 */

import * as THREE from 'three';

/* —— 词表 —— */
const SHAPES = {
  cylinder: { re: /圆柱|柱形|圆筒|cylinder/i, label: '圆柱' },
  torus:    { re: /环形|圆环|环状|torus|ring/i, label: '环' },
  sphere:   { re: /球形|球体|球状|sphere/i, label: '球' },
  box:      { re: /立方|盒形|箱形|方体|box/i, label: '立方' },
  cone:     { re: /圆锥|锥形|cone/i, label: '圆锥' },
};
const CN_NUM = { 一: 1, 两: 2, 二: 2, 三: 3, 四: 4, 五: 5, 六: 6, 七: 7, 八: 8, 九: 9, 十: 10 };

function parseNum(text) {
  const ar = text.match(/\d+/);
  if (ar) return Math.min(+ar[0], 24);
  for (const [cn, n] of Object.entries(CN_NUM)) if (text.includes(cn)) return n;
  return null;
}

/* —— 规格解析 —— */
export function parseSpec(text) {
  const clauses = String(text).split(/[，。；！？\n、]+/).map((s) => s.trim()).filter(Boolean);
  const spec = { central: null, ring: null, plates: [], struts: null, mat: { metalness: 0.85, roughness: 0.35, dark: false, emissive: false }, unknown: [] };
  const knownWords = new Set();

  const findShape = (c) => {
    for (const [k, s] of Object.entries(SHAPES)) {
      if (s.re.test(c)) { knownWords.add(k); return k; }
    }
    return null;
  };

  /* 全局材质词 */
  if (/钛|金属|metal|合金/i.test(text)) { spec.mat.metalness = 0.9; spec.mat.roughness = 0.3; knownWords.add('金属'); }
  if (/深色|暗色|黑色/i.test(text)) { spec.mat.dark = true; knownWords.add('深色'); }
  if (/发光|能量|荧光|glow/i.test(text)) { spec.mat.emissive = true; knownWords.add('发光'); }
  if (/塑料|树脂|plastic/i.test(text)) { spec.mat.metalness = 0.05; spec.mat.roughness = 0.75; knownWords.add('塑料'); }

  for (const c of clauses) {
    const shape = findShape(c);
    const n = parseNum(c);

    if (/中央|中心|核心|central/i.test(c)) {
      knownWords.add('中央');
      spec.central = { shape: shape || 'cylinder', big: /大/i.test(c) ? 1.4 : (/小/i.test(c) ? 0.7 : 1) };
    } else if (/外围|环绕|周围|围绕|orbit/i.test(c)) {
      knownWords.add('外围');
      spec.ring = { shape: shape || 'torus', count: n || 3, tilt: /对称|均匀/i.test(c) };
    } else if (/层板|顶板|底板|底座/.test(c) || /(上|下)(层|方|部)/.test(c) || /上下.*层/.test(c)) {
      /* 上下层判定必须在支撑/连接之前：「上下两层机械支撑」是层板不是立柱；
         自然语序「上下两层」无相邻上层/下层 → 两侧各一块 */
      knownWords.add('上下层');
      const wantTop = /上层|上方|上部|顶板/.test(c) || /上下.*层/.test(c);
      const wantBottom = /下层|下方|下部|底板|底座/.test(c) || /上下.*层/.test(c);
      if (wantTop) spec.plates.push({ shape: shape || 'box', top: true, count: 1 });
      if (wantBottom) spec.plates.push({ shape: shape || 'box', top: false, count: 1 });
    } else if (/支撑|支架|连接|立柱|strut/i.test(c)) {
      knownWords.add('支撑');
      /* 多个支撑子句累计（"支撑四根，另支撑两根" → 6），不互相覆盖 */
      spec.struts = { count: (spec.struts ? spec.struts.count : 0) + (n || 4) };
    } else if (shape && !spec.central) {
      /* 首个裸形状子句兜底为核心 */
      spec.central = { shape, big: 1 };
    } else if (shape) {
      spec.unknown.push(c);
    } else {
      spec.unknown.push(c);
    }
  }

  if (!spec.central && !spec.ring && !spec.plates.length && !spec.struts) {
    return { ok: false, reason: '未能从描述识别出任何结构', unknown: spec.unknown,
      hint: '支持：中央/核心 + 圆柱|球|立方|环|圆锥；外围 N 个…；上下两层…；N 组支撑/连接；金属/深色/发光/塑料' };
  }
  return { ok: true, spec };
}

/* —— 几何生成（绝对单位，稳定命名/稳定 ID） —— */
function mkMat(mat, emissiveBoost) {
  const m = new THREE.MeshStandardMaterial({
    color: mat.dark ? 0x2a2e33 : 0xb8bdc4,
    metalness: mat.metalness,
    roughness: mat.roughness,
  });
  if (mat.emissive && emissiveBoost) {
    m.emissive = new THREE.Color(0x45e0ff);
    m.emissiveIntensity = 0.55;
  }
  return m;
}

function shapeMesh(shape, mat) {
  let geo;
  switch (shape) {
    case 'sphere': geo = new THREE.SphereGeometry(0.5, 32, 20); break;
    case 'torus': geo = new THREE.TorusGeometry(0.45, 0.12, 18, 40); break;
    case 'box': geo = new THREE.BoxGeometry(0.9, 0.12, 0.9); break;
    case 'cone': geo = new THREE.ConeGeometry(0.45, 0.9, 28); break;
    default: geo = new THREE.CylinderGeometry(0.42, 0.42, 1.2, 32);
  }
  const mesh = new THREE.Mesh(geo, mat);
  mesh.castShadow = false;
  return mesh;
}

export function buildFromSpec(spec) {
  const root = new THREE.Group();
  root.name = 'TextGen';
  const mat = mkMat(spec.mat, false);
  const glowMat = mkMat(spec.mat, true);
  const parts = [];

  const addPart = (mesh, id, zh) => {
    mesh.name = id;
    mesh.userData.partId = id;
    mesh.userData.partZh = zh;
    root.add(mesh);
    parts.push({ id, zh, mesh });
    return mesh;
  };

  /* 中央核心 */
  let coreH = 1.2;
  if (spec.central) {
    const m = shapeMesh(spec.central.shape, glowMat);
    if (spec.central.shape === 'cylinder') { m.scale.setScalar(spec.central.big); coreH = 1.2 * spec.central.big; }
    if (spec.central.shape === 'sphere') { m.scale.setScalar(spec.central.big); coreH = 1.0 * spec.central.big; }
    if (spec.central.shape === 'cone') { m.scale.setScalar(spec.central.big); coreH = 0.9 * spec.central.big; }
    if (spec.central.shape === 'torus') { m.rotation.x = 0; coreH = 1.0; }
    addPart(m, 'core', '核心');
  } else {
    coreH = 0.6; // 无核心时外围环以原点为心
  }

  /* 外围环绕（均匀圆布） */
  if (spec.ring) {
    const count = Math.max(1, Math.min(spec.ring.count, 24));
    const R = 1.15 + coreH * 0.35;
    for (let i = 0; i < count; i++) {
      const a = (i / count) * Math.PI * 2;
      const m = shapeMesh(spec.ring.shape, mat);
      if (spec.ring.shape === 'torus') m.rotation.y = a;   // 环面朝向切向
      m.position.set(Math.cos(a) * R, coreH * 0.5, Math.sin(a) * R);
      addPart(m, `satellite_${i + 1}`, `外围件 ${i + 1}`);
    }
  }

  /* 上下层板 */
  for (const p of spec.plates) {
    const m = shapeMesh(p.shape, mat);
    m.position.y = p.top ? coreH * 0.5 + 0.55 : -(coreH * 0.5) - 0.35;
    addPart(m, p.top ? 'top_plate' : 'bottom_plate', p.top ? '上层板' : '下层板');
  }

  /* 连接立柱：上板↔下板 或 核心↔地面基准 */
  if (spec.struts) {
    const count = Math.max(1, Math.min(spec.struts.count, 24));
    const hasPlates = spec.plates.length > 0;
    const y0 = hasPlates ? -(coreH * 0.5) - 0.35 : -(coreH * 0.5);
    const y1 = hasPlates ? coreH * 0.5 + 0.55 : coreH * 0.5;
    const R = hasPlates ? 0.38 : 0.62;
    for (let i = 0; i < count; i++) {
      const a = (i / count) * Math.PI * 2 + Math.PI / 4;
      const m = shapeMesh('cylinder', mat);
      m.scale.set(0.22, Math.max(0.2, y1 - y0), 0.22);
      m.position.set(Math.cos(a) * R, (y0 + y1) / 2, Math.sin(a) * R);
      addPart(m, `strut_${i + 1}`, `支撑 ${i + 1}`);
    }
  }

  return { root, parts };
}

/* —— 入口：解析+构建一步，返回可检查的结构摘要 —— */
export function generateFromText(text) {
  const parsed = parseSpec(text);
  if (!parsed.ok) return parsed;
  const { root, parts } = buildFromSpec(parsed.spec);
  return { ok: true, spec: parsed.spec, root, parts,
    summary: parts.map((p) => p.id).join(', ') };
}
