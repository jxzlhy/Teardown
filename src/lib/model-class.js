/* 模型来源口径（唯一实现，供引擎徽章/大厅统计/清单生成共用）：
   有 modelCredit 且非 NASA 官方公开几何 → 社区模型。
   NASA 3D Resources 模型（hubble/perseverance）为厂商官方几何、公有领域，计官方。 */
export function isCommunityModel(d){
  return !!d.modelCredit && !/NASA/i.test(d.modelCredit || '');
}
export function modelClassLabel(d){
  if(!d.glb) return '程序化';
  return isCommunityModel(d) ? '社区模型' : '官方模型';
}
