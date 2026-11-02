/* V4.0 MECHANICAL INTELLIGENCE · 机械关系系统数据层（任务书 §4）
   关系类型（§4.2 全集，逐步采用）：fixed / revolute / prismatic / slider_crank /
   gear_mesh / belt_drive / shaft_coupling / bearing_support / linkage / visual_only。
   硬规则（§4.4）：引用稳定零件 ID；父子装配 ≠ 机械关系；可序列化可校验；
   未实现真实约束的关系必须 visual_only 或标注 kinematic:'approx'。 */

export const MECH_EDGE_TYPES = [
  'fixed', 'revolute', 'prismatic', 'slider_crank', 'gear_mesh',
  'belt_drive', 'shaft_coupling', 'bearing_support', 'linkage', 'visual_only',
];

export const MECH_TYPE_LABEL = {
  fixed: '固定连接', revolute: '转动副', prismatic: '移动副', slider_crank: '曲柄滑块',
  gear_mesh: '齿轮啮合', belt_drive: '带传动', shaft_coupling: '轴系耦合',
  bearing_support: '轴承支撑', linkage: '连杆机构', visual_only: '视觉组织',
};

/* 校验（可序列化 + ID 稳定 + 引用存在 + 类型合法）。返回 {ok, errors}；
   device.mech = { edges: [{ id, type, from, to, note?, kinematic? ('exact'|'approx'|'visual'),
                              axis?, anchor?, ratio? }], driver?: partId } */
export function validateMech(device) {
  const errors = [];
  const mech = device && device.mech;
  if (!mech || !Array.isArray(mech.edges)) return { ok: device ? !mech : true, errors: device && mech ? ['mech.edges 缺失'] : [] };
  const partIds = new Set((device.parts || []).map(p => p.id));
  const seen = new Set();
  mech.edges.forEach((e, i) => {
    const at = `edges[${i}]`;
    if (!e.id) errors.push(`${at}: 缺稳定 ID`);
    else if (seen.has(e.id)) errors.push(`${at}: ID 重复 ${e.id}`);
    seen.add(e.id);
    if (!MECH_EDGE_TYPES.includes(e.type)) errors.push(`${at}: 非法类型 ${e.type}`);
    if (!partIds.has(e.from)) errors.push(`${at}: from 引用不存在 ${e.from}`);
    if (!partIds.has(e.to)) errors.push(`${at}: to 引用不存在 ${e.to}`);
    if (e.kinematic && !['exact', 'approx', 'visual'].includes(e.kinematic)) errors.push(`${at}: kinematic 非法 ${e.kinematic}`);
  });
  if (mech.driver && !partIds.has(mech.driver)) errors.push(`driver 引用不存在 ${mech.driver}`);
  return { ok: errors.length === 0, errors };
}
