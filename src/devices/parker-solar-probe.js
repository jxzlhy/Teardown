/* =============================================================
   设备配置：帕克太阳探测器（Parker Solar Probe，NASA/JHUAPL）
   官方 GLB（NASA 3D Resources，公有领域）：15 原语语义命名，~43k tris
   bbox 5.75×5.26×6.61 —— 热盾几何并入 BUS 网格（安装环独立），盾朝 -z，磁强计悬臂在 +z 尾部
============================================================= */
import { makeDevice } from './_kit/factory.js';

export default makeDevice({
  id: 'parker-solar-probe',
  era: 2018,
  name: '帕克太阳探测器',
  en: 'PARKER SOLAR PROBE',
  category: '航天',
  brand: 'NASA/JPL',
  tagline: '人类最快的人造物 · 触摸日冕',
  description: '帕克太阳探测器（Parker Solar Probe）是 NASA 触摸太阳的使命：2018 年发射，七次借力金星不断贴近太阳，2024 年 12 月 24 日以每小时 69.2 万公里（每秒 192 公里）的速度飞掠距太阳表面仅 610 万公里的日冕——成为史上最快的人造物，快到「从华盛顿到东京只需一分钟」。它靠 11.4cm 厚的碳复合热盾在约 1400°C 的炙烤中保住身后的电子舱（常温工作），靠一条去离子水液冷环路给太阳能板降温，尾部 2.2m 悬臂上的磁强计远离炽热机体测量太阳风。以太阳风物理学家尤金·帕克命名——这是 NASA 第一次以在世者命名探测器。模型为 NASA 官方资产（15 原语语义命名）；官方将热盾几何与电子舱合并为同一网格，馆内按「热盾与主体」一体呈现并如实注明口径，太阳能翼/液冷/磁强计悬臂逐件可点读。',
  specs: [
    ['发射', '2018-08-12 · Delta IV Heavy'],
    ['最快', '692,000 km/h（人造物纪录）'],
    ['最近', '距太阳表面 610 万 km'],
    ['热盾', '11.4 cm 碳复合 · 迎 ~1400°C'],
    ['冷却', '去离子水环路 ~5 L'],
    ['轨道', '24 圈 · 7 次金星借力'],
    ['命名', '太阳风之父 Eugene Parker'],
  ],
  accent: '#e8862e',
  source: '官方公开模型（NASA 3D Resources · 公有领域）',
  modelCredit: 'Parker Solar Probe by NASA/JHUAPL (NASA 3D Resources, 公有领域)',
  modelSource: 'https://science.nasa.gov/3d-resources/parker-solar-probe/',
  targetWidth: 11,
  camDist: 1.05,
  glb: '/assets/parker-solar-probe.glb',
  /* 策展导览：热盾→太阳翼→液冷→载荷→天线→悬臂 */
  tour: ['bus', 'solar-wings', 'cooling', 'instruments', 'hga', 'mag-boom'],
  xrayShellIds: ['bus'],
  normalize: 'full',
  frontAxis: '-z',           /* 热盾迎光面在原生 -z */
  unmappedTo: 'bus',
  mapping: {
    'solarArray_arms': 'solar-wings',
    'solarWing_LeftBacking': 'solar-wings',
    'solarWing_RightBacking': 'solar-wings',
    'CoolingSystem': 'cooling',
    'CoolingSystem_frame': 'cooling',
    'BUS': 'bus',
    'Instruments': 'instruments',
    'electricAntennas': 'instruments',
    'HGA': 'hga',
    'boom': 'mag-boom',
    'magnetometers': 'mag-boom',
    'heatShield_Mounting': 'bus',
    'vents': 'bus',
  },
  realPartIds: ['solar-wings', 'cooling', 'bus', 'instruments', 'hga', 'mag-boom'],
  postLoad: ({ partsById }) => {
    /* 官方白箔材质（foil_silver/PSP col=1.0）在夜厅强光+Bloom 下过曝：整体压暗 */
    for (const pid of ['bus', 'solar-wings', 'instruments', 'mag-boom', 'cooling']) {
      const p = partsById[pid]; if (!p) continue;
      p.group.traverse(o => {
        if (!o.isMesh) return;
        const mats = Array.isArray(o.material) ? o.material : [o.material];
        for (const m of mats) { if (m.color && m.color.r > 0.9) m.color.multiplyScalar(0.5); }
      });
    }
  },
  parts: [
    { id: 'bus', zh: '热盾与主体总线', en: 'TPS & SPACECRAFT BUS', real: true,
      ex: [0, 0, -2.2], lo: [0, 1.4, 0], tag: '11.4cm 碳盾 · 一侧炙烤一侧常温',
      desc: '热盾与主体总线（官方模型将两者合并为同一网格，一并展示）：直径约 2.4m 的热防护盾（TPS）是两面碳碳板夹 11.4cm 碳泡沫的三明治结构，迎光面白色陶瓷涂层反射大部分热流——迎着约 1400°C 的日冕炙烤，盾后电子舱却维持常温工作；黑色安装环与散热格栅在盾侧与舱侧衔接。整台探测器的任务设计，本质上是「如何躲在一片盾牌后面摸太阳」。',
      specs: [['热盾', '~2.4 m · 11.4 cm 碳泡沫'], ['工况', '迎面 ~1400°C'], ['背面', '常温 · 电子舱存活线'], ['口径', '官方网格盾舱合并']] },
    { id: 'solar-wings', zh: '太阳能双翼', en: 'SOLAR WINGS', real: true,
      ex: [2.2, -0.3, 0], lo: [0, 1.3, 0], tag: '越飞越收 · 只留翼尖发电',
      desc: '太阳能双翼：两片特制的太阳能板翼。离太阳越近光越毒，这对翼会随距离逐渐收拢——大部分时间只留翼尖一小条对准太阳发电（够用且不至于烧毁），翼尖还装了液冷管路给电池片降温。用太阳能靠近太阳，本身就是一场与物理定律讨价还价。',
      specs: [['布局', '左右双翼'], ['策略', '渐进收拢 · 只留翼尖'], ['降温', '翼尖液冷'], ['供电', '~344 W（近日点）']] },
    { id: 'cooling', zh: '液冷系统', en: 'ACTIVE COOLING', real: true,
      ex: [-1.8, -0.2, -0.4], lo: [0, 1.2, 0], tag: '约 5L 去离子水 · 太阳能板的生命线',
      desc: '液冷系统：一条环形泵驱动的去离子水回路（约 5 升），从太阳能翼尖把热量带回背部散热器排出——这是史上第一次给航天器太阳能板做主动液冷。水在这里不是冷却发动机，而是在给「离太阳最近的发电站」续命；回路一旦冻住或烧干，任务即告终。',
      specs: [['工质', '去离子水 ~5 L'], ['循环', '泵驱动闭环'], ['对象', '太阳能翼尖'], ['地位', '首个板级主动液冷']] },
    { id: 'instruments', zh: '科学载荷', en: 'INSTRUMENT SUITE', real: true,
      ex: [0, -1.2, 1.8], lo: [0, 1.2, 0], tag: '四套仪器 · 直接采样太阳风',
      desc: '科学载荷：四套仪器直接伸到热盾边缘之外采样——WISPR 相机拍摄日冕与太阳风成像，SWEAP 收集抛出的电子与质子，FIELDS 测量电场磁场与等离子体波，ISOIS 数高能粒子。2021 年它证实了「阿尔芬临界面上方」存在清晰的分层，改写了教科书里的日冕加热与太阳风加速图景。',
      specs: [['套数', 'WISPR / SWEAP / FIELDS / ISOIS'], ['姿态', '从盾后探出采样'], ['成就', '证实日冕加热分层'], ['产出', '太阳风加速直接观测']] },
    { id: 'hga', zh: '高增益天线', en: 'HIGH-GAIN ANTENNA', real: true,
      ex: [-2.0, -1.0, 0.6], lo: [0, 1.1, 0], tag: '锅盖贴脸 · 数据靠盲发',
      desc: '高增益天线：背在探测器侧后方的碟形天线。由于多数时间机体必须保持盾面迎日，天线无法始终对准地球——大量观测数据先存在机内，等飞到远离太阳的轨道段再回头慢慢下传；日冕穿越的关键数据甚至「盲发」地球，晚了几个小时到达，但一颗字节都没丢。',
      specs: [['形态', '碟形高增益'], ['约束', '姿态让位于热盾'], ['策略', '存储后回传'], ['日冕段', '关键数据盲发']] },
    { id: 'mag-boom', zh: '磁强计悬臂', en: 'MAGNETOMETER BOOM', real: true,
      ex: [0, 0.5, 2.4], lo: [0, 1.1, 0], tag: '2.2m 长臂 · 离开机体的电磁净土',
      desc: '磁强计悬臂：向尾部伸出 2.2m 的长臂，顶端是测量太阳风磁场的磁强计。把探头放这么远，是因为探测器自身的电流会污染磁场读数——离机体越远，测到的才是太阳的「真话」。真机上臂体由多节桁架展开构成，模型里为官方制作的收拢-展开形态。',
      specs: [['长度', '~2.2 m'], ['目的', '避开机体电磁污染'], ['载荷', 'FIELDS 磁强计'], ['站位', '尾部 +z 远端']] },
  ],
});
