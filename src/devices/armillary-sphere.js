/* =============================================================
   设备配置：浑天仪（环组球 · 装饰复刻件）
   Sketchfab · Annestra（CC-BY）：7 网格 = 六层环圈（各 ~10 万 tri，高密雕花）
   + 中心件；模型无底座、未标注各环天文学名 → 页内按环层命名并如实注明。
   全部网格同材质（一张贴图集）。
============================================================= */
import { makeDevice } from './_kit/factory.js';

export default makeDevice({
  id: 'armillary-sphere',
  name: '浑天仪',
  en: 'ARMILLARY SPHERE',
  category: '天文仪器',
  brand: 'GENERIC',
  tagline: '把整个天空缩进一套铜环里',
  description: '浑天仪是最古老的天文教学仪器：以地球为中心，一组同心铜环分别代表天赤道、黄道、子午圈与地平圈——古人转动环圈，就能演示太阳在四季里"穿行星座"的路径。希腊化时代与战国《石申天文》的观测传统里都有它的祖先，哥白尼书桌上摆的也是它。这件复刻为装饰件：六层环圈逐层可拆，中心小件为视界与轴心；模型未逐环标注天文学名，页内按环层命名——结构关系如实，考据不下结论。',
  specs: [
    ['形制', '六层环组 · 中心视界'],
    ['谱系', '希腊化时代 ↔ 中国浑仪'],
    ['用途', '演示天体视运动'],
    ['工艺', '高密雕花环圈（~66 万面）'],
    ['来源', '社区模型（Sketchfab · CC-BY）'],
  ],
  accent: '#c9a35a',
  source: '社区模型（Sketchfab）',
  modelCredit: 'Armillary Sphere by Annestra (Sketchfab, CC-BY)',
  modelSource: 'https://sketchfab.com/3d-models/armillary-sphere-a1a4213b62c34d5f91a09a57bf839499',
  targetWidth: 8,
  normalize: 'full',
  glb: '/assets/armillary-sphere.glb',
  tour: ['ring-outer', 'ring-mid-a', 'ring-mid-b', 'ring-inner-a', 'ring-inner-b', 'core'],
  xrayShellIds: ['ring-outer'],
  demos: [
    /* 六环异轴缓转：环组球最迷人的就是"天空在转"的多轴层次（示意速率） */
    { partId: 'ring-outer', label: '环组多轴旋转 · 天球视运动示意（降速）', spin: [0, 0, 0.16],
      also: [
        { partId: 'ring-mid-a', spin: [0.13, 0, 0] },
        { partId: 'ring-mid-b', spin: [0, 0.11, 0] },
        { partId: 'ring-inner-a', spin: [0.1, 0, 0.08] },
        { partId: 'ring-inner-b', spin: [0, 0.09, -0.1] },
      ] },
  ],
  mapping: {
    'Object_5': 'ring-outer',
    'Object_8': 'ring-mid-a',
    'Object_6': 'ring-mid-b',
    'Object_7': 'ring-inner-a',
    'Object_9': 'ring-inner-b',
    'Object_10': 'ring-inner-a',
    'Object_11': 'core',
  },
  realPartIds: ['ring-outer', 'ring-mid-a', 'ring-mid-b', 'ring-inner-a', 'ring-inner-b', 'core'],
  parts: [
    { id: 'ring-outer', zh: '外环 · 子午圈位', en: 'OUTER RING', real: true,
      ex: [0, 0.9, 2.4], lo: [0, 1.6, 0], tag: '最外层 · 南北走向的大圆',
      desc: '外层环：经典浑天仪里这个位置是子午圈——过天极、南北走向的大圆，是整个环系的"骨架"。它上面常刻 360 度分度与黄道十二宫符号；演示中绕竖直轴缓转，模拟一整夜的星空东升西落。',
      specs: [['位置', '环系最外层'], ['分度', '360° / 十二宫（此类件惯例）'], ['演示', '绕竖轴缓转'], ['形制', '双轨环槽结构']] },
    { id: 'ring-mid-a', zh: '中层环 A · 地平圈位', en: 'MIDDLE RING A', real: true,
      ex: [2.2, 0, -1.2], lo: [0, 1.6, 0], tag: '水平大圆 · 天与地的分界',
      desc: '中层环之一：地平圈位——水平放置的大圆，把天球分成可见与不可见两半，环上分方位刻度。古人报"某星在地平上几度"，读的就是它。',
      specs: [['位置', '中层 · 水平大圆'], ['分度', '方位刻度'], ['演示', '绕横轴缓摆'], ['作用', '可见半球分界']] },
    { id: 'ring-mid-b', zh: '中层环 B · 赤道圈位', en: 'MIDDLE RING B', real: true,
      ex: [-2.2, 0, -1.2], lo: [0, 1.6, 0], tag: '天赤道 · 周日运动的跑道',
      desc: '中层环之二：天赤道位——与地轴垂直的大圆，所有星辰的周日运动都沿着与它平行的"跑道"东升西落。赤道圈上常附二十四节气刻线，太阳走到哪一格，就是哪个节气。',
      specs: [['位置', '中层 · 垂直地轴'], ['意义', '周日运动基准'], ['演示', '绕纵轴缓转'], ['附刻', '节气 / 赤经']] },
    { id: 'ring-inner-a', zh: '内环 A · 黄道圈位', en: 'INNER RING A', real: true,
      ex: [0, 1.7, -2.0], lo: [0, 1.6, 0], tag: '倾斜 23.5° · 太阳的年度轨道',
      desc: '内环：黄道圈位——相对赤道倾斜约 23.5° 的大圆，太阳一年的视运动轨迹。黄道与赤道的两个交点就是春分与秋分；环上常带一枚小小的太阳标记，拨着它走一圈就是一年。',
      specs: [['位置', '内层 · 倾斜大圆'], ['倾角', '~23.5°'], ['意义', '太阳周年路径'], ['交点', '春秋分所在']] },
    { id: 'ring-inner-b', zh: '内环 B', en: 'INNER RING B', real: true,
      ex: [0, -1.7, -2.0], lo: [0, 1.6, 0], tag: '辅助环 · 回归线位',
      desc: '内层辅助环：这一类小环常扮演南北回归线（太阳直射的最北/最南界线）或可转动的星座环——文艺复兴的浑天仪里，它甚至是可整周转动的"星盘环"。本件模型未标注名称，位置与作用以实物惯例推写。',
      specs: [['位置', '内层辅助'], ['常例', '回归线 / 星座环'], ['演示', '反向缓转'], ['口径', '形制推写 · 如实注明']] },
    { id: 'core', zh: '中心视界与轴', en: 'CORE & AXIS', real: true,
      ex: [0, 0, 0], lo: [0, 1.6, 0], tag: '环系的锚点',
      desc: '中心组件：所有环圈共同绕着的轴心与视界——它代表观测者所在的地球。浑天仪的"浑天"二字说的就是这套世界观：天如鸡子，地如中黄。环圈转得再花，锚定在中心的那颗小点永远不动。',
      specs: [['角色', '轴心 · 观测者'], ['世界观', '天如鸡子 · 地如中黄'], ['结构', '全环系共轴'], ['不动点', '中心即大地']] },
  ],
});
