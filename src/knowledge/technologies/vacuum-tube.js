/* 真空电子管 —— 部件详情卡「原理」区词条 */
export default {
  id: 'vacuum-tube',
  zh: '真空电子管',
  principle:
    '抽成真空的玻璃壳里，受热阴极发射电子（热电子发射），阳极（板极）收集形成电流；' +
    '中间的控制栅极像一道"电闸"——栅极电压的微小变化就能控制阳极电流的大幅变化，' +
    '这就是放大。在晶体管出现前，收音机、电视、电话中继、第一台电子计算机，全都靠它。',
  relatedParts: ['tubes'],
  relatedDevices: ['admiral-7t10'],
  invented: '1904',
  history: [
    ['1904', 'Fleming 发明真空二极管'],
    ['1906', 'De Forest 加上栅极，三极管诞生——电信号可被放大'],
    ['1946', 'ENIAC 用约 1.8 万只电子管建成'],
    ['1950s末', '晶体管开始批量取代电子管（馆内 Regency TR-1 是先声）'],
  ],
  sources: [
    { label: 'Wikipedia — Vacuum tube', url: 'https://en.wikipedia.org/wiki/Vacuum_tube' },
  ],
  confidence: 'verified-3rd',
};
