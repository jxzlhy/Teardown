/* 动圈式扬声器 —— 部件详情卡「原理」区词条 */
export default {
  id: 'loudspeaker',
  zh: '动圈式扬声器',
  principle:
    '音圈悬浮在永磁体的环形磁隙中，音频电流通过音圈时依安培力（法拉第定律）被快速推拉，' +
    '音圈带动振膜（锥盆或球顶）推动空气产生声波。振膜、磁路和悬边的设计决定频响与失真；' +
    '手机微小型扬声器用平衡衔铁或微型动圈在极小腔体内完成同一件事。',
  relatedParts: ['speaker', 'speaker-l', 'speaker-r', 'driver-l', 'driver-r', 'earpiece'],
  relatedDevices: ['iphone-12-teardown'],
  invented: '1877',
  history: [
    ['1877', 'Siemens 描述动圈式换能原理'],
    ['1925', 'Rice 与 Kellogg 推出现代直接辐射式动圈扬声器'],
    ['1950s', '小型化与分频系统成熟，立体声普及'],
    ['2010s', '微型动圈 + 平衡衔铁成为手机/耳机的标准方案'],
  ],
  sources: [
    { label: 'Wikipedia — Loudspeaker', url: 'https://en.wikipedia.org/wiki/Loudspeaker' },
  ],
  confidence: 'verified-3rd',
};
