/* 发条与上弦机构 —— 部件详情卡「原理」区词条 */
export default {
  id: 'mainspring-drive',
  zh: '发条与上弦机构',
  principle:
    '发条是一根卷紧的弹性钢带：上弦（转动表冠/钥匙）把螺旋卷得更紧，能量以弹性势能储存；' +
    '随后缓慢释放，经轮系减速驱动指针或唱盘。棘轮与止逆爪保证上弦时不倒转。' +
    '动力在释放过程中不断衰减，所以钟表还要靠擒纵机构把能量"切成"均匀的小份输出。',
  relatedParts: ['mainspring', 'crank'],
  relatedDevices: ['tourbillon-movement', 'gramophone'],
  invented: '约 1430',
  history: [
    ['约 1430', '发条动力出现，便携钟表成为可能'],
    ['1525', '塔形轮（fusee）补偿发条力矩衰减'],
    ['1760s', '发条驱动的自动机械（杰奎德罗 automata）盛行'],
    ['1877', '发条驱动留声机/唱机成为百年标准动力'],
  ],
  sources: [
    { label: 'Wikipedia — Mainspring', url: 'https://en.wikipedia.org/wiki/Mainspring' },
  ],
  confidence: 'verified-3rd',
};
