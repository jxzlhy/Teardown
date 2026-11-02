#!/usr/bin/env node
/* 组件分组（V5.0.2 收尾）Node 级单元验证：
   组合的世界变换保持、撤销的父节点+兄弟序+局部变换精确还原、解散往返、
   选集中祖先过滤、组件标记。纯几何逻辑，无浏览器依赖。
   用法：node tools/groupops-unit.mjs */

import assert from 'node:assert';
import * as THREE from 'three';
import { createGroupCommands, ungroupCommands, filterAncestors } from '../src/studio/groupops.js';

let pass = 0, fail = 0;
const check = (name, ok, detail) => {
  console.log(`${ok ? '✓' : '✗'} ${name}${detail ? ' · ' + detail : ''}`);
  ok ? pass++ : fail++;
};
const mesh = (name, pos) => {
  const m = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.1, 0.1));
  m.name = name;
  m.position.set(...pos);
  return m;
};
const worldPos = (o) => o.getWorldPosition(new THREE.Vector3()).toArray().map((n) => +n.toFixed(6));

/* 场景：root → parentA(m1, m2) / parentB(嵌套 → m3) —— 三个网格来自不同父链 */
const root = new THREE.Group(); root.name = 'ROOT';
const parentA = new THREE.Group(); parentA.name = 'A'; parentA.position.set(1, 0, 0);
const parentB = new THREE.Group(); parentB.name = 'B'; parentB.position.set(0, 2, 0);
const nested = new THREE.Group(); nested.name = 'nested'; nested.position.set(0, 0, 1);
const m1 = mesh('m1', [0.1, 0.2, 0.3]);
const m2 = mesh('m2', [-0.4, 0, 0]);
const m3 = mesh('m3', [0.5, 0.5, 0]);
parentA.add(m1, m2);
nested.add(m3);
parentB.add(nested);
root.add(parentA, parentB);
root.updateMatrixWorld(true);

/* 1. 祖先过滤：祖先被剔除（否则入组会连带其全部子孙），叶子保留 */
const sel = [parentA, m1, m3];
const filtered = filterAncestors(sel);
check('祖先过滤：parentA 被剔除、叶子保留', filtered.length === 2
  && !filtered.includes(parentA) && filtered.includes(m1) && filtered.includes(m3));

/* 2. 跨父链组合 + 世界变换保持 */
const w1 = worldPos(m1), w3 = worldPos(m3);
const idxA = parentA.children.indexOf(m1), idxN = nested.children.indexOf(m3);
const g1 = createGroupCommands(root, [m1, m3], '动力组');
check('组合命令生成（count=2）', !!g1 && g1.count === 2);
g1.cmds[0].redo();
root.updateMatrixWorld(true);
check('组挂根节点且已标记', g1.group.parent === root && g1.group.userData.__studioGroup === true);
check('成员进入组', g1.group.children.length === 2 && g1.group.children.includes(m1) && g1.group.children.includes(m3));
check('世界变换保持（m1）', JSON.stringify(worldPos(m1)) === JSON.stringify(w1), JSON.stringify(worldPos(m1)));
check('世界变换保持（m3 跨嵌套父链）', JSON.stringify(worldPos(m3)) === JSON.stringify(w3));

/* 3. 撤销：父节点 + 兄弟序 + 局部变换精确还原 */
g1.cmds[0].undo();
root.updateMatrixWorld(true);
check('撤销后 m1 回原父', m1.parent === parentA);
check('撤销后 m1 回原兄弟序', parentA.children.indexOf(m1) === idxA);
check('撤销后 m3 回原父（嵌套链）', m3.parent === nested && nested.children.indexOf(m3) === idxN);
check('撤销后局部变换精确还原', JSON.stringify(m1.position.toArray()) === JSON.stringify([0.1, 0.2, 0.3]));
check('撤销后世界变换与初始一致', JSON.stringify(worldPos(m1)) === JSON.stringify(w1));

/* 4. 重做 → 组合回来 */
g1.cmds[0].redo();
root.updateMatrixWorld(true);
check('重做后成员回组', g1.group.children.length === 2 && worldPos(m1).every((n, i) => Math.abs(n - w1[i]) < 1e-6));

/* 5. 解散：子节点回到组所在层，世界变换不变；撤销恢复组 */
const w1b = worldPos(m1);
const u1 = ungroupCommands(g1.group);
check('解散命令生成（count=2）', !!u1 && u1.count === 2);
u1.cmds[0].redo();
root.updateMatrixWorld(true);
check('解散后组移除、成员挂根', !root.children.includes(g1.group) && m1.parent === root && m3.parent === root);
check('解散后世界变换不变', JSON.stringify(worldPos(m1)) === JSON.stringify(w1b));
u1.cmds[0].undo();
root.updateMatrixWorld(true);
check('解散撤销后组与成员还原', root.children.includes(g1.group) && g1.group.children.length === 2
  && worldPos(m1).every((n, i) => Math.abs(n - w1b[i]) < 1e-6));

/* 6. 非组件组拒绝解散 */
const plain = new THREE.Group(); root.add(plain);
check('非组件组（无标记）拒绝解散', ungroupCommands(plain) === null);

/* 7. 单网格可成组（导出结构整理用例），空选集拒绝 */
const g2 = createGroupCommands(root, [m2], '零件组');
check('单网格可成组', !!g2 && g2.count === 1);
check('空/非网格选集拒绝', createGroupCommands(root, [], 'x') === null
  && createGroupCommands(root, [parentA], 'x') === null);

console.log(`\n${fail ? `FAIL(${fail})` : 'ALL PASS'} · ${pass} 过 / ${fail} 败`);
process.exit(fail ? 1 : 0);
