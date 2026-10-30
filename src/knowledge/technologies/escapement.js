/* 擒纵机构 —— 部件详情卡「原理」区词条 */
export default {
  id: 'escapement',
  zh: '擒纵机构',
  principle:
    '擒纵机构是"守门员"式的机械连杆：它周期性地把轮系的转动放行一小格（擒），' +
    '同时把发条的能量以固定节拍补给振荡元件——摆轮或钟摆（纵），让计时元件持续等幅振荡。' +
    '钟表走时的"滴答"声就是擒纵叉每次锁定/放行 escape wheel 的撞击。不同的擒纵设计' +
    '（杠杆式、同轴式、陀飞轮框架等）在等时性与摩擦管理上各有取舍。',
  relatedParts: ['escapement'],
  relatedDevices: ['tourbillon-movement'],
  invented: '约 1300',
  history: [
    ['约 1300', '欧洲出现机轴擒纵（verge escapement），机械钟诞生'],
    ['1657', '惠更斯把摆引入钟，等时性大幅提升'],
    ['1757', 'Mudge 发明杠杆擒纵（lever escapement），成为怀表/腕表标准'],
    ['1801', '宝玑获陀飞轮专利，用旋转框架平均化重力误差'],
  ],
  sources: [
    { label: 'Wikipedia — Escapement', url: 'https://en.wikipedia.org/wiki/Escapement' },
  ],
  confidence: 'verified-3rd',
};
