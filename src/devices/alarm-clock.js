/* =============================================================
   设备配置：机械闹钟（Poly Haven · CC0 扫描）
   4 网格（钟体/时针/分针/秒针——源名 houd_hand 为 hour 拼写彩蛋）
============================================================= */
import { makeDevice } from './_kit/factory.js';

export default makeDevice({
  id: 'alarm-clock',
  demos: [
    { partId: 'hand-second', label: '秒针走时（真实速率 · 机械闹钟实际为跳秒）', spin: 'auto', speed: 0.105 },
  ],
  era: '1950s',
  name: '机械闹钟',
  en: 'ALARM CLOCK',
  category: '钟表',
  brand: 'GENERIC',
  tagline: '两只耳朵一排铃 · 被吵醒的一百年',
  description: '双铃机械闹钟：机芯里除了走时轮系还有一条独立的闹轮系——把背面的闹针拨到想要的时刻，发条上紧，到了点，小锤就在两只金属铃之间每秒摆动几十次。它不温柔：1950 年代的广告原话是「能把死人吵醒」。指针是独立插装的三根针，拨针钮从背面直接带动针管。',
  specs: [
    ['形态', '双铃 + 小锤'],
    ['机芯', '走时轮系 + 独立闹轮系'],
    ['动力', '双发条（走时/闹铃各一）'],
    ['闹铃', '~90dB · 铃距 3cm'],
    ['调时', '背面拨针钮 + 闹针'],
    ['来源', 'Poly Haven（CC0 扫描）'],
  ],
  accent: '#e0b64f',
  source: 'Poly Haven（CC0）',
  modelCredit: 'Alarm Clock by Poly Haven (CC0)',
  modelSource: 'https://polyhaven.com/a/alarm_clock_01',
  targetWidth: 7,
  normalize: 'full',
  frontAxis: '-z',
  glb: '/assets/alarm-clock.glb',
  tour: ['case','hand-hour','hand-minute','hand-second'],
  xrayShellIds: ['case'],
  mapping: {
    /* 重名节点运行时回退为网格名 Cylinder030（钟体双网格），见 __RAW.names */
    'Cylinder030': 'case',
    'Cylinder030_1': 'case',
    'houd_hand': 'hand-hour',
    'minute_hand': 'hand-minute',
    'second_hand': 'hand-second',
  },
  realPartIds: ['case', 'hand-hour', 'hand-minute', 'hand-second'],
  parts: [
    { id: 'case', zh: '钟体与双铃机芯', en: 'CASE & BELLS', real: true,
      ex: [0, 0, 0.6], lo: [0, 1.3, 0], tag: '走时 + 闹铃双轮系',
      desc: '钟体：铁皮圆壳里塞着两套轮系——走时一套管三根针，闹轮系一套专管「到点摇铃」。背面两个发条孔、拨针钮与闹针盘；顶上两只黄铜铃由小锤高速摆打。上一次发条走一天半，闹一次响到发条走完为止。',
      specs: [['轮系', '走时 + 闹双发条'], ['铃声', '小锤交替打双铃'], ['续航', '~36 小时/上弦'], ['背板', '拨针 + 闹针设定']] },
    { id: 'hand-hour', zh: '时针', en: 'HOUR HAND', real: true,
      ex: [0, 1.0, 1.0], lo: [0, 1.0, 0], tag: '最短最粗 · 12 小时一圈',
      desc: '时针：套在针管最外层的短针——闹钟的时针与闹针共用表盘，所以闹钟面的刻度印得格外粗黑，为的是睡眼惺忪时也能一眼读对。拆装顺序依然是先秒、再分、后时。',
      specs: [['周期', '12h/圈'], ['层次', '针管最外'], ['读法', '粗黑刻度防误读'], ['拆序', '最后装']] },
    { id: 'hand-minute', zh: '分针', en: 'MINUTE HAND', real: true,
      ex: [0, 0.5, 1.6], lo: [0, 1.0, 0], tag: '60 分钟一圈的中间层',
      desc: '分针：中层针管的长针——调闹钟时的「基准针」：先把分针拨到 12 点整再压下闹钮，闹轮系的触发凸轮才对得齐。它也是齿轮系里走时轮的最后一级输出。',
      specs: [['周期', '60min/圈'], ['角色', '调闹基准'], ['层次', '针管中层'], ['联动', '拨针钮直驱']] },
    { id: 'hand-second', zh: '秒针', en: 'SECOND HAND', real: true,
      ex: [0, 0.1, 2.2], lo: [0, 1.0, 0], tag: '最细的针 · 会「抖」的那种',
      desc: '秒针：最内层细针——机械闹钟的秒针是「抖着走」的，因为廉价机芯用摆轮直接推动秒轮，没有手表的平滑减速。这抖动反而成了「机械感」的听觉视觉双重反馈：滴答声与抖动同频。',
      specs: [['周期', '60s/圈'], ['走法', '抖动式（非扫秒）'], ['来源', '擒纵直接推动'], ['对时', '电台报时仪式']] },
  ],
});
