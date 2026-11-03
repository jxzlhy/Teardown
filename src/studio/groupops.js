/* 创作工作室 · 组件分组（V5.0.2 收尾项，总任务书 7.4 零件分组）
   命令化组操作：组合（世界变换保持）/ 解散，撤销精确还原原始父节点+兄弟序+局部变换。
   纯几何逻辑（无渲染依赖）——tools/groupops-unit.mjs 可在 Node 级完整验证。 */

import * as THREE from 'three';

/* 原始状态快照：撤销时逐字段精确还原 */
function captureOriginal(mesh) {
  return {
    mesh,
    parent: mesh.parent,
    index: mesh.parent ? mesh.parent.children.indexOf(mesh) : -1,
    pos: mesh.position.toArray(),
    quat: mesh.quaternion.toArray(),
    scl: mesh.scale.toArray(),
  };
}

function restoreOriginal(snap) {
  const { mesh, parent, index } = snap;
  if (mesh.parent) mesh.parent.remove(mesh);
  if (!parent) return;
  /* 精确插回原兄弟序（three 无 insertAt，直接操作 children 数组） */
  parent.children.splice(Math.min(index, parent.children.length), 0, mesh);
  mesh.parent = parent;
  mesh.position.fromArray(snap.pos);
  mesh.quaternion.fromArray(snap.quat);
  mesh.scale.fromArray(snap.scl);
  mesh.updateMatrixWorld(true);
}

/* 过滤掉「选集中的祖先节点」——把父子同时入组会把祖先连同其它子孙一起带走 */
export function filterAncestors(meshes) {
  return meshes.filter((m) => !meshes.some((o) => o !== m && m.getObjectById(o.id)));
}

/* 组合：组固定挂在场景根（可预期）；attach 保持各网格世界变换 */
export function createGroupCommands(root, meshes, name) {
  const picked = filterAncestors(meshes.filter((m) => m && m.isMesh && m.parent));
  if (picked.length < 1) return null;
  const snaps = picked.map(captureOriginal);

  const group = new THREE.Group();
  group.name = String(name || '组件').slice(0, 60);
  group.userData.__studioGroup = true;

  return {
    group,
    count: picked.length,
    cmds: [{
      redo: () => {
        root.add(group);
        for (const m of picked) group.attach(m);   // 世界变换重算进局部
        root.updateMatrixWorld(true);
      },
      undo: () => {
        for (const m of picked) if (m.parent) m.parent.remove(m);
        root.remove(group);
        /* 必须按原兄弟序升序插回：snaps 是"选择顺序"，乱序选择时（如先选 C 再选 A）
           按选择序 splice 会产出 A,B,D,C 这类错序（审计 RS-03） */
        for (const s of [...snaps].sort((a, b) => a.index - b.index)) restoreOriginal(s);
        root.updateMatrixWorld(true);
      },
    }],
  };
}

/* 解散：子节点回到组所在父节点的组位置，组移除 */
export function ungroupCommands(group) {
  if (!group || !group.isObject3D || !group.userData.__studioGroup) return null;
  const parent = group.parent;
  if (!parent) return null;
  const index = parent.children.indexOf(group);
  const children = [...group.children];
  /* 解散后回到「组的世界变换」下的等价局部变换：先取各子节点世界变换快照 */
  group.updateMatrixWorld(true);
  const world = children.map((c) => ({
    mesh: c,
    p: c.getWorldPosition(new THREE.Vector3()).toArray(),
    q: c.getWorldQuaternion(new THREE.Quaternion()).toArray(),
    s: c.getWorldScale(new THREE.Vector3()).toArray(),
  }));

  return {
    count: children.length,
    cmds: [{
      redo: () => {
        for (const c of children) group.remove(c);
        parent.children.splice(Math.min(index, parent.children.length), 0, ...children);
        for (const c of children) c.parent = parent;
        parent.remove(group);
        parent.updateMatrixWorld(true);
      },
      undo: () => {
        for (const c of children) {
          const i = parent.children.indexOf(c);
          if (i >= 0) parent.children.splice(i, 1);
        }
        parent.add(group);
        group.updateMatrixWorld(true);
        for (const w of world) {
          w.mesh.parent = group;
          group.children.push(w.mesh);
          w.mesh.position.fromArray(w.p);
          w.mesh.quaternion.fromArray(w.q);
          w.mesh.scale.fromArray(w.s);
        }
        group.updateMatrixWorld(true);
      },
    }],
  };
}
