/* 打字机字杆联动 —— 部件详情卡「原理」区词条 */
export default {
  id: 'typebar-linkage',
  zh: '打字机字杆联动',
  principle:
    '每枚按键连着一根细长的字杆（typebar），杆头铸着反字的字模：按键时连杆把字杆甩向滚筒，' +
    '字模隔着色带砸在纸上印出正字。几十根字杆要在瞬间汇聚到同一击打点，全靠杠杆与扇形导槽的几何编排；' +
    'Shift 让同一字杆的大小写错开击点，色带则自动进给换位。',
  relatedParts: ['typebars', 'platen', 'ribbon-mech', 'keys'],
  relatedDevices: ['royal-typewriter'],
  invented: '1868',
  history: [
    ['1868', 'Sholes 等获打字机专利，QWERTY 布局随定'],
    ['1874', 'Remington No.1 量产，打字机进入办公室'],
    ['1961', 'IBM Selectric 用旋转字球取代字杆，击打结构革命'],
  ],
  sources: [
    { label: 'Wikipedia — Typewriter（Typebar 一节）', url: 'https://en.wikipedia.org/wiki/Typewriter' },
  ],
  confidence: 'verified-3rd',
};
