/* =============================================================
   设备配置：石英挂钟（Poly Haven · CC0 扫描）
   4 网格（钟体/时/分/秒针）
============================================================= */
import { makeDevice } from './_kit/factory.js';

export default makeDevice({
  id: 'wall-clock',
  demos: [
    { partId: 'hand-second', label: '石英秒针扫秒（真实速率 · 60 秒/圈）', spin: 'auto', speed: 0.105 },
  ],
  name: '石英挂钟',
  en: 'QUARTZ WALL CLOCK',
  category: '钟表',
  brand: 'GENERIC',
  tagline: '一节电池 · 走一年 · 全世界最准的墙',
  description: '石英挂钟：一节 AA 电池推着 32768 Hz 的石英音叉，经 15 级分频变成 1 秒一步的步进脉冲，驱动步进马达带动三根针——月误差仅几秒，价格却不到机械钟的百分之一。它没有滴答的浪漫，却是「时间守恒」这件事的民主化胜利：墙上、教室、车站，全世界的时间从此对得齐。',
  specs: [
    ['机芯', '石英步进 · 32768Hz 分频'],
    ['供电', 'AA ×1 · 续航 ~1 年'],
    ['精度', '月误差 ±几秒'],
    ['秒针', '跳秒（每秒一格）'],
    ['历史', '1969 Seiko Astron 之后普及'],
    ['来源', 'Poly Haven（CC0 扫描）'],
  ],
  accent: '#9fb4c7',
  source: 'Poly Haven（CC0）',
  modelCredit: 'Wall Clock by Poly Haven (CC0)',
  modelSource: 'https://polyhaven.com/a/wall_clock',
  targetWidth: 10,
  normalize: 'full',
  glb: '/assets/wall-clock.glb',
  tour: ['case','hand-hour','hand-minute','hand-second'],
  xrayShellIds: ['case'],
  mapping: {
    /* 重名节点运行时回退为网格名 frame001（钟体双网格），见 __RAW.names */
    'frame001': 'case',
    'frame001_1': 'case',
    'wall_clock_hours_hand': 'hand-hour',
    'wall_clock_minute_hand': 'hand-minute',
    'wall_clock_second_hand': 'hand-second',
  },
  realPartIds: ['case', 'hand-hour', 'hand-minute', 'hand-second'],
  parts: [
    { id: 'case', zh: '钟体与石英机芯', en: 'CASE & QUARTZ MOVEMENT', real: true,
      ex: [0, 0, 0.8], lo: [0, 1.2, 0], tag: '32768 Hz · 二分频十五次',
      desc: '钟体：壳内一枚硬币大的石英机芯——32768 Hz 是 2 的 15 次方，逐级二分频正好得到 1 秒。步进马达每秒转半圈带动轮系。1969 年 Seiko Astron 引爆的石英革命，把钟表从手艺变成了半导体工业。',
      specs: [['振荡', '石英音叉 32768Hz'], ['分频', '2^15 → 1Hz'], ['驱动', '步进马达'], ['电池', 'AA 一节走一年']] },
    { id: 'hand-hour', zh: '时针', en: 'HOUR HAND', real: true,
      ex: [0, 0.8, 0.9], lo: [0, 1.0, 0], tag: '最短的针 · 最从容的轮',
      desc: '时针：轮系的最后一级输出，12 小时一圈——石英钟的轮系只有三四级齿轮，比机械钟的齿轮塔矮一大截。时针管套在中心轴最外层，徒手就能拔插，对时就是把它直接拨到位。',
      specs: [['周期', '12h/圈'], ['轮系', '石英钟仅 3–4 级'], ['安装', '压插式'], ['对时', '直接手拨']] },
    { id: 'hand-minute', zh: '分针', en: 'MINUTE HAND', real: true,
      ex: [0, 0.4, 1.4], lo: [0, 1.0, 0], tag: '60 分钟一圈 · 中层针管',
      desc: '分针：中层针管的长针，由分轮直接驱动——石英钟的分针每秒被步进马达推 1/60 圈，所以它是「跳」着走的。教室里靠它读上课下课，车站靠它对火车时刻。',
      specs: [['周期', '60min/圈'], ['走法', '跳秒联动'], ['驱动', '分轮直驱'], ['场景', '教室 / 车站']] },
    { id: 'hand-second', zh: '秒针', en: 'SECOND HAND', real: true,
      ex: [0, 0.1, 1.9], lo: [0, 1.0, 0], tag: '跳秒 · 石英钟的心电图',
      desc: '秒针：最细最长的针，每秒「咔」一格——跳秒是石英钟的声纹（机械表多为扫秒或快跳）。这一秒一格的节奏由分频电路精确保证，让它成了全世界对时的默认基准：新闻报时、倒计时、考试铃。',
      specs: [['走法', '每秒跳一格'], ['声纹', '石英钟的「咔」'], ['基准', '全球对时默认'], ['耗电', '跳秒比扫秒省电']] },
  ],
  /* V4.0 MI①：钟表传动链（秒→分→时 = 60:1 齿轮轮系两级；速率真实可算） */
  mech: { driver: 'hand-second', edges: [
    { id: 'gm-sec-min', type: 'gear_mesh', from: 'hand-second', to: 'hand-minute', kinematic: 'exact', ratio: 1 / 60, note: '秒针轴经 60:1 轮系驱动分针（60 秒 = 分针一圈）' },
    { id: 'gm-min-hour', type: 'gear_mesh', from: 'hand-minute', to: 'hand-hour', kinematic: 'exact', ratio: 1 / 12, note: '分针轴经 12:1 轮系驱动时针（12 小时 = 时针一圈）' },
    { id: 'fx-case', type: 'fixed', from: 'case', to: 'hand-second', note: '机芯固定于钟壳，三针同轴叠装' },
  ] },
});
