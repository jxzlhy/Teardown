/* 燃气涡轮发动机（涡扇） —— 部件详情卡「原理」区词条 */
export default {
  id: 'turbine-engine',
  zh: '燃气涡轮发动机（涡扇）',
  principle:
    '吸气→压缩→燃烧→膨胀→排气的连续循环：风扇/压气机把空气压缩增压，燃烧室喷油点燃，' +
    '高温燃气驱动涡轮（涡轮又反过来带动前端的风扇与压气机），最后经喷管高速排出产生推力。' +
    '涡扇发动机让一部分进气从外涵道直接绕过核心机——涵道比越高越省油安静（民航客机），' +
    '越低越适合高速（战斗机）。',
  relatedParts: ['core', 'fan-section', 'nozzle', 'afterburner'],
  relatedDevices: ['jet-engine'],
  invented: '1959',
  history: [
    ['1939', 'He 178 试飞，涡轮喷气发动机首次推动飞机'],
    ['1959', 'Rolls-Royce Conway 投产，首型涡轮风扇'],
    ['1960s末', '高涵道比涡扇（JT9D/CF6）开启宽体客机时代'],
    ['今天', '齿轮传动风扇（GTF）继续压低油耗与噪声'],
  ],
  sources: [
    { label: 'Wikipedia — Turbofan', url: 'https://en.wikipedia.org/wiki/Turbofan' },
  ],
  confidence: 'verified-3rd',
};
