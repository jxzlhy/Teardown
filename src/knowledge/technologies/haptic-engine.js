/* 线性马达触觉反馈 —— 部件详情卡「原理」区词条 */
export default {
  id: 'haptic-engine',
  zh: '线性马达触觉反馈',
  principle:
    '线性谐振执行器（LRA）让一块质量块在线圈磁场中沿直线往复振动，' +
    '相比偏心旋转马达（ERM）起振与停振都快得多，能打出"干脆"的触觉节拍——' +
    'Apple 的 Taptic Engine 就是典型 LRA。配合驱动芯片的宽频控制，' +
    '不同波形可以模拟从轻点到敲击的不同质感。',
  relatedParts: ['taptic'],
  relatedDevices: ['iphone-12-teardown', 's25'],
  invented: '2010s',
  history: [
    ['1880s', '人工肌肉/触觉反馈概念随电话与电报出现雏形'],
    ['1990s', 'ERM 偏心马达广泛用于手机振动'],
    ['2015', 'Apple Watch/iPhone 6s 的 Taptic Engine 将 LRA 推向主流'],
    ['2010s末', '宽频 X 轴线性马达成为安卓旗舰标配'],
  ],
  sources: [
    { label: 'Wikipedia — Haptic technology（含 Taptic Engine/LRA）', url: 'https://en.wikipedia.org/wiki/Haptic_technology' },
  ],
  confidence: 'verified-3rd',
};
