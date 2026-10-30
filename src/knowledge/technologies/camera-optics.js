/* 镜头与光学系统 —— 部件详情卡「原理」区词条 */
export default {
  id: 'camera-optics',
  zh: '镜头与光学系统',
  principle:
    '摄影镜头是多片透镜组成的复合光学系统：单片凸/凹透镜各有色差与像差，' +
    '多组镜片（玻璃/树脂、非球面、低色散）互相补偿，把光准确汇聚到焦平面。' +
    '焦距决定视角与放大率，光圈 f 值决定进光量与景深；手机与运动相机的"镜头"是' +
    '几毫米直径的微型化版本，还要叠加 IR 滤片与保护玻璃。',
  relatedParts: ['lens', 'camera', 'camera-island', 'camera-module', 'flash', 'cover-glass', 'camera-plateau'],
  relatedDevices: ['action4', 'iphone-12-teardown', 'iphone-13'],
  invented: '1839',
  history: [
    ['1839', 'Chevalier 为达盖尔相机造出首支摄影镜头'],
    ['1840', 'Petzval 人像镜头：首个经数学设计的镜头'],
    ['1960s', '镀膜与非球面工艺普及，像差控制跃升'],
    ['2000s', '模造玻璃非球面使手机微型镜头成为可能'],
  ],
  sources: [
    { label: 'Wikipedia — Camera lens', url: 'https://en.wikipedia.org/wiki/Camera_lens' },
  ],
  confidence: 'verified-3rd',
};
