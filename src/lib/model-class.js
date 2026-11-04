/* 模型来源口径（唯一实现，供引擎徽章/大厅统计/清单生成共用）：
   有 modelCredit 且非官方机构公开几何 → 社区模型。
   NASA 3D Resources（hubble/perseverance/jwst）与 Smithsonian 开放获取
   （wright-flyer 等）均为机构官方几何、公有领域/CC0，计官方。 */
export function isCommunityModel(d){
  return !!d.modelCredit && !/NASA|Smithsonian/i.test(d.modelCredit || '');
}
export function modelClassLabel(d){
  if(!d.glb) return '程序化';
  return isCommunityModel(d) ? '社区模型' : '官方模型';
}
