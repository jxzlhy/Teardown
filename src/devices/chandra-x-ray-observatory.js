/* =============================================================
   设备配置：钱德拉X射线天文台（Chandra X-ray Observatory，NASA/SAO·CXC）
   官方 GLB（NASA 3D Resources，公有领域）：6 primitive（AO_HRMA 镜组件 /
   tex_01 主体 / foil_silver 前段筒 / foil_gold 仪器舱段 / shiny_panel 太阳能翼）
   bbox 13.78×5.14×19.51 —— 舱体沿 +x（镜口端），太阳能翼横跨 z ±9.75
============================================================= */
import { makeDevice } from './_kit/factory.js';

export default makeDevice({
  id: 'chandra-x-ray-observatory',
  era: 1999,
  name: '钱德拉X射线天文台',
  en: 'CHANDRA X-RAY OBSERVATORY',
  category: '航天',
  brand: 'NASA/CXC',
  tagline: '看清黑洞的 X 射线之眼 · 镜面精度原子级',
  description: '钱德拉X射线天文台（Chandra X-ray Observatory）是 NASA「大天文台计划」的 X 射线之眼：1999 年由哥伦比亚号航天飞机（人类首次女性指令长任务）释放入一条远地点 13.3 万公里的大椭圆轨道——那里避开了地球辐射带，一次曝光可连续观测 55 小时。它的高分辨率镜组件（HRMA）由 4 对镀铱沃尔特Ⅰ型掠射镜组成，抛光到原子级：若把镜面放大到地球尺寸，最高山峰不足 2 厘米。X 射线无法像可见光那样折射，只能以近乎平行入射的「掠射」方式被镜面轻轻兜住——四对套筒像冰淇淋筒层层嵌套，把掠过的 X 光光子汇成焦点。黑洞喷流、星系团中的暗物质分布、超新星遗迹里的元素图谱，都出自它的底片。模型为 NASA 官方资产（6 primitive），镜组件/仪器舱/太阳能翼逐件可点读。',
  specs: [
    ['发射', '1999-07-23 · 哥伦比亚号 STS-93'],
    ['波段', 'X 射线（0.1–10 keV）'],
    ['镜组件', 'HRMA · 4 对镀铱沃尔特Ⅰ型'],
    ['镜面精度', '原子级抛光（<0.05 μm 粗糙度）'],
    ['轨道', '~16000 × 133000 km 大椭圆'],
    ['观测效率', '单次曝光最长 55 小时'],
    ['命名', 'Subrahmanyan Chandrasekhar（诺奖得主）'],
  ],
  accent: '#5b8dd9',
  source: '官方公开模型（NASA 3D Resources · 公有领域）',
  modelCredit: 'Chandra X-ray Observatory by NASA/CXC & SAO (NASA 3D Resources, 公有领域)',
  modelSource: 'https://science.nasa.gov/3d-resources/chandra-x-ray-observatory/',
  targetWidth: 11,
  camDist: 1.05,
  glb: '/assets/chandra-x-ray-observatory.glb',
  tour: ['xray-mirrors', 'instrument-module', 'bus-body', 'forward-foil', 'solar-wings'],
  xrayShellIds: ['bus-body'],
  normalize: 'full',
  frontAxis: '+x',           /* 镜口端（AO_HRMA）在原生 +x */
  unmappedTo: 'bus-body',
  mapping: {
    'AO_HRMA': 'xray-mirrors',
    'foil_gold': 'instrument-module',
    'tex_01': 'bus-body',
    'foil_silver': 'forward-foil',
    'shiny_panel': 'solar-wings',
  },
  realPartIds: ['xray-mirrors', 'instrument-module', 'bus-body', 'forward-foil', 'solar-wings'],
  postLoad: ({ partsById }) => {
    /* 官方 HRMA 材质（col 0.8 无贴图）在夜厅强光+Bloom 下过曝：仅镜组件无条件压暗 */
    const p = partsById['xray-mirrors']; if (!p) return;
    p.group.traverse(o => {
      if (!o.isMesh) return;
      const mats = Array.isArray(o.material) ? o.material : [o.material];
      for (const m of mats) { if (m.color) m.color.multiplyScalar(0.5); }
    });
  },
  parts: [
    { id: 'xray-mirrors', zh: 'X 射线镜组件', en: 'HRMA MIRRORS', real: true,
      ex: [1.9, 0, 0], lo: [0, 1.2, 0], tag: '4 对镀铱掠射镜 · 原子级抛光',
      desc: '高分辨率镜组件（HRMA）：4 对镀铱沃尔特Ⅰ型掠射镜层层嵌套。X 射线光子能量太高，任何常规镜面都会直接穿透——唯一办法是让光子以小于 1° 的角度「掠射」到镜壁上被轻轻兜住，像石片打水漂。镜面抛光到原子级粗糙度：若等比放大到地球尺寸，最高山峰不足 2 厘米。它是钱德拉的心脏，也是人类造过的最光滑曲面之一。',
      specs: [['结构', '4 对嵌套抛物面/双曲面'], ['镀层', '铱（Iridium）'], ['原理', '掠射角 <1°'], ['精度', '原子级 · 人类最光滑曲面之一']] },
    { id: 'instrument-module', zh: '科学仪器舱', en: 'INSTRUMENT MODULE', real: true,
      ex: [0, 0, 1.9], lo: [0, 1.2, 0], tag: '焦点之后的眼睛 · ACIS/HRC',
      desc: '科学仪器舱：镜组件焦点后方承载两套相机——ACIS 电荷耦合成像谱仪与 HRC 高分辨相机，把被镜面汇聚的 X 光光子逐个「点数」。舱段外裹金箔控温：仪器要感受的是宇宙深处最微弱的 X 光，自身却必须冷到不发一丝红外噪声。每记录一个光子，都是 13 万公里外的一次精准接球。',
      specs: [['载荷', 'ACIS 成像谱仪 + HRC 相机'], ['温控', '金箔裹身'], ['工作', '逐光子记录'], ['轨道红利', '55 小时连续曝光']] },
    { id: 'bus-body', zh: '主体平台', en: 'SPACECRAFT BUS', real: true,
      ex: [0, 0.9, -0.8], lo: [0, 1.2, 0], tag: '大椭圆轨道 · 避开辐射带',
      desc: '主体平台：承载电源、姿控与通信。钱德拉的大椭圆轨道是精心计算过的避难所——远地点 13.3 万公里（地球到月球距离的 1/3），绕开地球辐射带，换来单次 55 小时无干扰曝光；代价是每年轨道维护要精打细算燃料。二十六年过去，它仍是 X 射线天空的分辨率之王。',
      specs: [['轨道', '~16000 × 133000 km'], ['规避', '地球辐射带'], ['曝光', '最长 55 h/次'], ['在役', '1999 至今 · 26 年']] },
    { id: 'forward-foil', zh: '前段隔热筒', en: 'FORWARD OPTICS BENCH FOIL', real: true,
      ex: [0, 0, -1.9], lo: [0, 1.2, 0], tag: '银箔镜筒 · 光路的洁净室',
      desc: '前段隔热筒：包裹光学台与光路的银色箔层结构。X 射线镜组对温度均匀性极其敏感——筒体箔层维持镜组处于均匀低温，防止热胀冷缩毁掉原子级光轴。掠射镜的「水漂」只容忍极小角度误差，任何毫弧级的形变都会让光子偏离焦点；这段银箔护住的是整台望远镜的命根。',
      specs: [['职责', '光学台恒温包裹'], ['敏感度', '毫弧级形变即失焦'], ['材质', '银色 MLI 箔'], ['背后', '镜组件的恒温护卫']] },
    { id: 'solar-wings', zh: '太阳能双翼', en: 'SOLAR WINGS', real: true,
      ex: [0, -0.7, 0], lo: [0, 1.1, 0], tag: '19.5m 翼展 · 远日点也晒得到',
      desc: '太阳能双翼：横跨约 19.5m 的两片电池翼。钱德拉轨道远地点远超地球阴影范围，几乎全程日照，供电充裕；翼面朝向受姿态约束最小，是全船最自由的部件。19.5m 翼展与 13.8m 镜筒，让它在轨展开后如同一架天空中的滑翔机——这台望远镜至今仍在刷新人类 X 射线视觉的极限。',
      specs: [['翼展', '~19.5 m'], ['轨道', '近乎全程日照'], ['供电', '充裕'], ['姿态', '全船最自由构件']] },
  ],
});
