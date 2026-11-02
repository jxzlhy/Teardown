/* 创作工作室 · 本地规则诊断（V5.0.5 种子切片）
   纯规则引擎：逐条可解释、可定位到节点；不是 AI 推断，UI 文案如实标注。
   每条 finding：{ rule, severity: 'error'|'warn'|'info', title, detail, node? } */

const RULES = [
  {
    rule: 'empty-mesh', severity: 'error',
    title: '空网格（无顶点）', run: (r) => r.meshes.filter((m) => m.verts === 0)
      .map((m) => ({ node: m.name, detail: '0 顶点 · 渲染与导出均无意义，多为建模残留' })),
  },
  {
    rule: 'zero-size', severity: 'warn',
    title: '零尺寸网格', run: (r) => {
      const out = [];
      for (const m of r.meshes) {
        if (!m.ref) continue;
        m.ref.geometry.computeBoundingSphere();
        const s = m.ref.geometry.boundingSphere && m.ref.geometry.boundingSphere.radius;
        if (s !== undefined && s <= 1e-7) out.push({ node: m.name, detail: `包围球半径 ${s} — 缩放为 0 或几何为空` });
      }
      return out;
    },
  },
  {
    rule: 'extreme-aspect', severity: 'warn',
    title: '极端长宽比', run: (r) => {
      if (!r.stats.bbox.ok) return [];
      const s = r.stats.bbox.size.filter((n) => n > 1e-9);
      if (s.length < 2) return [];
      const ratio = Math.max(...r.stats.bbox.size) / Math.min(...s);
      return ratio > 1000 ? [{ detail: `整体三轴比 1:${Math.round(ratio)} — 常见于单位标错（米/毫米）或散落远点` }] : [];
    },
  },
  {
    rule: 'invalid-bounds', severity: 'error',
    title: '几何含无效坐标（NaN/Infinity）', run: (r) => r.stats.bbox.ok ? [] : [{ detail: '包围盒计算结果非法，场景中存在非有限坐标' }],
  },
  {
    rule: 'missing-normals', severity: 'warn',
    title: '缺失法线（光照将失效）', run: (r) => r.meshes
      .filter((m) => !m.hasNormals && m.materials.some((x) => x.ref && x.ref.isMeshStandardMaterial))
      .map((m) => ({ node: m.name, detail: '标准材质依赖法线属性，缺失会导致全黑/平光' })),
  },
  {
    rule: 'missing-material', severity: 'warn',
    title: '无材质的网格', run: (r) => {
      const out = [];
      r.root.traverse((o) => {
        if (o.isMesh && (!o.material || (Array.isArray(o.material) && o.material.every((x) => !x)))) {
          out.push({ node: o.name || '(未命名)', detail: '以默认白色渲染，导入前应绑定材质' });
        }
      });
      return out;
    },
  },
  {
    rule: 'no-texture', severity: 'info',
    title: '纯色材质（无任何贴图）', run: (r) => r.materials.filter((m) => m.ref && m.textureCount === 0)
      .map((m) => ({ node: m.name, detail: `${m.type} · 0 张贴图 — 合法，但注意与作者意图核对` })),
  },
  {
    rule: 'unnamed-node', severity: 'info',
    title: '未命名节点', run: (r) => {
      const n = r.nodes.filter((x) => !x.name).length;
      return n ? [{ detail: `${n} 个节点无名称 — 影响后续零件映射与组件 ID 稳定性` }] : [];
    },
  },
  {
    rule: 'heavy-scene', severity: 'warn',
    title: '超大场景', run: (r) => {
      const out = [];
      if (r.stats.triTotal > 5_000_000) out.push({ detail: `${(r.stats.triTotal / 1e6).toFixed(1)}M 三角形 — 移动端帧率风险` });
      if (r.stats.nodeCount > 5000) out.push({ detail: `${r.stats.nodeCount} 个节点 — 建议合并静态分支` });
      return out;
    },
  },
  {
    rule: 'orphan-animation', severity: 'warn',
    title: '动画轨道指向不存在的节点', run: (r) => r._orphanAnim
      .map((a) => ({ node: a.name, detail: `${a.orphan}/${a.tracks} 条轨道目标缺失 — 播放时该部分无效果` })),
  },
];

/* 孤儿动画轨道需要在 report 上补算（r.nodesByPath 是 three 对象表） */
function withOrphanAnim(report) {
  report._orphanAnim = [];
  const have = new Set();
  report.root.traverse((o) => { if (o.name) have.add(o.name); });
  for (const clip of report.animations || []) {
    if (!clip.ref) continue;
    const orphan = clip.ref.tracks.filter((t) => {
      const nm = t.name.split('.')[0];
      return nm && !have.has(nm);
    }).length;
    if (orphan) report._orphanAnim.push({ name: clip.name, tracks: clip.tracks, orphan });
  }
  return report;
}

export function runDiagnostics(report) {
  withOrphanAnim(report);
  const findings = [];
  for (const r of RULES) {
    try {
      for (const hit of r.run(report) || []) {
        findings.push({ rule: r.rule, severity: r.severity, title: r.title, ...hit });
      }
    } catch { /* 单条规则异常不阻塞其余诊断 */ }
  }
  const bySeverity = { error: 0, warn: 0, info: 0 };
  for (const f of findings) bySeverity[f.severity]++;
  return { findings, bySeverity };
}
