/* 锂聚合物电池 —— 部件详情卡「原理」区词条 */
export default {
  id: 'li-po-battery',
  zh: '锂聚合物电池',
  principle:
    '与液态锂离子电池同源：锂离子在正负极之间往返嵌入/脱嵌充放电。差别在于电解质——' +
    '采用固态或凝胶态聚合物电解质，配合铝塑复合膜（软包）外壳代替钢壳铝壳：' +
    '形状自由、重量更轻、可以做得极薄，几乎所有手机与运动相机的电池都是这种形态。' +
    '软包没有硬壳约束，过充或老化时会明显鼓包，这也是拆解中常见的"胖电池"成因。',
  relatedParts: ['battery'],
  relatedDevices: ['action4', 'iphone-12-teardown', 'iphone-13'],
  invented: '1990s',
  history: [
    ['1976', '锂原电池机理确立（Whittingham）'],
    ['1991', '索尼液态锂离子电池商用化'],
    ['1990s', '聚合物电解质与软包工艺出现，锂聚合物电池进入消费电子'],
    ['2010s', '软包成为手机/可穿戴主流封装形态'],
  ],
  sources: [
    { label: 'Wikipedia — Lithium polymer battery', url: 'https://en.wikipedia.org/wiki/Lithium_polymer_battery' },
  ],
  confidence: 'verified-3rd',
};
