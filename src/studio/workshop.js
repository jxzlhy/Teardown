/* 创作工作室 · 编辑器核心（V5.0.2 MODEL WORKSHOP 首切片）
   命令化编辑层：变换/材质修改 → 可撤销命令栈（上限 50），数据与视口解耦。
   v1 口径：网格级编辑（选中即网格）；材质编辑影响共享该材质的所有网格（UI 如实提示）。 */

const D2R = Math.PI / 180;
const R2D = 180 / Math.PI;

export function createWorkshop(report) {
  const history = [];
  let future = [];                       // 重做栈
  const HISTORY_MAX = 50;

  /* 导入时快照：复位变换的基准（导入态 ≠ 过程态，复位语义以导入时为准） */
  const snapshot = new Map();
  for (const [path, obj] of report.nodesByPath) {
    if (!obj.isMesh) continue;
    snapshot.set(path, {
      p: obj.position.toArray(),
      r: [obj.rotation.x, obj.rotation.y, obj.rotation.z],
      s: obj.scale.toArray(),
    });
  }

  const objOf = (path) => {
    const o = report.nodesByPath.get(path);
    return o && o.isMesh ? o : null;
  };

  const push = (cmd) => {
    history.push(cmd);
    if (history.length > HISTORY_MAX) history.shift();
    future = [];
  };

  /* —— 变换 —— */
  function getTransform(path) {
    const o = objOf(path);
    if (!o) return null;
    return {
      position: o.position.toArray().map((n) => +n.toFixed(4)),
      rotation: [o.rotation.x * R2D, o.rotation.y * R2D, o.rotation.z * R2D].map((n) => +n.toFixed(2)),
      scale: o.scale.toArray().map((n) => +n.toFixed(4)),
    };
  }

  function setTransform(path, next, label) {
    const o = objOf(path);
    if (!o) return false;
    const before = {
      p: o.position.toArray(),
      r: [o.rotation.x, o.rotation.y, o.rotation.z],
      s: o.scale.toArray(),
    };
    const apply = (t) => {
      if (t.p) o.position.fromArray(t.p);
      if (t.r) o.rotation.set(t.r[0], t.r[1], t.r[2]);
      if (t.s) o.scale.fromArray(t.s);
      o.updateMatrixWorld(true);
    };
    const after = {
      p: next.position ? next.position.slice() : null,
      r: next.rotation ? next.rotation.map((d) => d * D2R) : null,
      s: next.scale ? next.scale.slice() : null,
    };
    apply(after);
    push({ label: label || '变换', undo: () => apply({ p: before.p, r: before.r, s: before.s }), redo: () => apply(after) });
    return true;
  }

  function resetTransform(path) {
    const snap = snapshot.get(path);
    if (!snap) return false;
    return setTransform(path, { position: snap.p, rotation: snap.r.map((x) => x * R2D), scale: snap.s }, '复位变换');
  }

  /* —— 材质 —— */
  function getMaterial(path) {
    const o = objOf(path);
    if (!o) return null;
    const m = Array.isArray(o.material) ? o.material[0] : o.material;
    if (!m) return null;
    /* 共享计数：同 uuid 材质被几块网格引用（编辑会连带） */
    let shared = 0;
    report.root.traverse((x) => {
      if (!x.isMesh) return;
      const list = Array.isArray(x.material) ? x.material : [x.material];
      if (list.includes(m)) shared++;
    });
    const row = { shared, hasColor: !!m.color, hasPbr: m.metalness !== undefined };
    if (m.color) row.color = '#' + m.color.getHexString();
    if (m.metalness !== undefined) { row.metalness = m.metalness; row.roughness = m.roughness; }
    return row;
  }

  function setMaterialProp(path, patch, label) {
    const o = objOf(path);
    if (!o) return false;
    const m = Array.isArray(o.material) ? o.material[0] : o.material;
    if (!m) return false;
    const before = {};
    if (patch.color !== undefined) before.color = '#' + m.color.getHexString();
    if (patch.metalness !== undefined) before.metalness = m.metalness;
    if (patch.roughness !== undefined) before.roughness = m.roughness;
    const apply = (v) => {
      if (v.color !== undefined) m.color.set(v.color);
      if (v.metalness !== undefined) m.metalness = v.metalness;
      if (v.roughness !== undefined) m.roughness = v.roughness;
    };
    apply(patch);
    push({ label: label || '材质', undo: () => apply(before), redo: () => apply(patch) });
    return true;
  }

  return {
    getTransform, setTransform, resetTransform,
    getMaterial, setMaterialProp,
    undo: () => { const c = history.pop(); if (c) { c.undo(); future.push(c); } return !!c; },
    redo: () => { const c = future.pop(); if (c) { c.redo(); history.push(c); } return !!c; },
    canUndo: () => history.length > 0,
    canRedo: () => future.length > 0,
    lastLabel: () => (history.length ? history[history.length - 1].label : ''),
    dispose: () => { history.length = 0; future = []; },
  };
}
