/* 创作工作室 · 诊断→修复闭环（V5.0.5 部分，总任务书 7.6/11.9 口径）
   只对「可确定性修复」的规则生成修复命令（缺法线=计算法线、空网格=摘除），
   以可撤销命令组作用于当前工作副本——本地工作流中原始文件本身不可被覆盖，
   等效满足「创建副本/不覆盖原始数据」约束；零尺寸/命名/长宽比等需人工判断，
   修复计划中如实列为不可自动修复并给理由。 */

const MANUAL_RULES = {
  'zero-size': '缩放为 0 可能是作者刻意隐藏，不能替用户判断',
  'extreme-aspect': '单位标错还是模型本身细长需人工确认',
  'invalid-bounds': '非有限坐标的来源需人工定位',
  'no-texture': '纯色材质是合法资产形态，是否补贴图属创作决策',
  'unnamed-node': '命名承载语义，自动命名会污染零件映射',
  'heavy-scene': '减面/合并是建模决策，自动化会破坏结构',
  'orphan-animation': '补目标节点还是删轨道需人工确认',
  'missing-material': '导入器会兜底默认材质，运行时无法区分作者意图',
};

/* 修复计划：可修的给命令工厂，不可修的给理由 */
export function planRepairs(diag) {
  const fixable = [];
  const seen = new Map();
  for (const f of diag.findings) {
    if (!f.fixable) continue;
    if (!seen.has(f.rule)) seen.set(f.rule, { rule: f.rule, title: f.title, count: 0, nodes: [] });
    const e = seen.get(f.rule);
    e.count++;
    if (f.node) e.nodes.push(f.node);
  }
  for (const e of seen.values()) fixable.push(e);
  const manual = [...new Set(diag.findings.filter((f) => !f.fixable).map((f) => f.rule))]
    .map((rule) => ({ rule, reason: MANUAL_RULES[rule] || '需人工确认' }));
  return { fixable, manual };
}

/* 生成修复命令组（不执行）；调用方经 workshop.applyCommands 提交为单条可撤销命令 */
export function buildRepairCommands(report, rule) {
  const cmds = [];
  const touched = [];

  if (rule === 'missing-normals') {
    for (const m of report.meshes) {
      const mesh = m.ref;
      if (!mesh || !mesh.isMesh || m.hasNormals) continue;
      const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      if (!mats.some((x) => x && x.isMeshStandardMaterial)) continue;
      const geo = mesh.geometry;
      cmds.push({
        redo: () => geo.computeVertexNormals(),
        undo: () => geo.deleteAttribute('normal'),   // 精确还原到「无法线」状态
      });
      touched.push(m.name);
    }
  } else if (rule === 'empty-mesh') {
    for (const m of report.meshes) {
      const mesh = m.ref;
      if (!mesh || !mesh.isMesh || m.verts !== 0) continue;
      const parent = mesh.parent;
      if (!parent) continue;
      cmds.push({
        redo: () => parent.remove(mesh),
        undo: () => parent.add(mesh),               // 挂回原父节点（末端；不重建原始 sibling 顺序）
      });
      touched.push(m.name);
    }
  } else {
    return null;                                    // 非可自动修复规则
  }
  return cmds.length ? { cmds, touched } : null;
}

/* 修复后的材质/统计复核提示：计算法线不改变材质与拓扑，无需重普查；
   摘除空网格会改变 meshCount/vertTotal——由 index.js 统一重跑 surveyScene */
export const REPAIR_LABELS = {
  'missing-normals': '计算法线',
  'empty-mesh': '摘除空网格',
};
