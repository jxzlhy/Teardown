/* =============================================================
   设备配置：汪克尔转子发动机（实物剖切教具数字化）
   社区模型（Sketchfab · museoETSII 马德里理工大学发动机实验室，CC-BY）
   7 网格全匿名（mainMeshNode）· 1 材质 · 708k 三角面（扫描级）
   按位置聚类 5 部件：前端盖(z<-0.2) / 中壳体 / 后端盖(z>0.15) /
   油底壳(y<-0.3) / 转子与偏心轴(x>0.25 · 58k 面)
   bbox 1.43×1.62×1.84（Y 上）
   结构：三角转子在 8 字形气缸内偏心旋转，端盖合壳，剖切可见内部
============================================================= */
import { makeDevice } from './_kit/factory.js';

export default makeDevice({
  id: 'wankel-engine',
  name: '汪克尔转子发动机',
  en: 'WANKEL ENGINE',
  category: '机械',
  brand: 'GENERIC',
  tagline: '三角转子 · 没有活塞的发动机',
  description: '汪克尔转子发动机（Wankel）：没有活塞、没有连杆、没有曲柄——一枚三角形转子在"8 字形"（孪生外摆线）气缸里偏心旋转，三个弧面把缸腔分成三个逐次变化的工作室，各面依次走完进气-压缩-做功-排气。体积只有同功率往复机的一半、转速轻松上万转、运转如丝般平滑：马自达 787B 靠它在 1991 年登上勒芒最高领奖台。代价是转子刮片与缸壁的高频磨损与油耗。本件为高校发动机实验室剖切教具的数字化（马德里理工大学 ETSII），剖开的缸体把转子与偏心轴的啮合关系直接亮给你看。',
  specs: [
    ['原理', '三角转子 · 偏心轴'],
    ['工作室', '3 弧面 · 每圈三行程'],
    ['代表', 'NSU KKM · Mazda 787B（1991 勒芒冠军）'],
    ['来源', 'UPM ETSII 发动机实验室 · 剖切教具'],
  ],
  accent: '#d98e4a',
  /* 质量分级 C：剖切教具摄影扫描件——剖开面（+z）构图佳（转子/缸腔/偏心轴可读），
     但底部/背面扫描破损明显（熔毁区，源模型自带）；位置聚类映射 5 部件已隔离截图核验 */
  quality: 'C',
  source: '社区模型（Sketchfab）',
  modelCredit: 'Motor Wankel (seccionado) by museoETSII (Sketchfab, CC-BY)',
  modelSource: 'https://sketchfab.com/3d-models/motor-wankel-c0b73b5a311e4ebb86d2c8411aa7ae44',
  targetWidth: 9,
  camDist: 1.1,
  normalize: 'full',
  frontAxis: '+z',
  glb: '/assets/wankel-engine.glb',
  /* 7 个同名网格按中心聚类：转子在 +x 侧（58k 面），端盖按 z 分前后，油底壳在 -y */
  mapByPosition(name, p, rel) {
    if (p.x > 0.25) return 'rotor';
    if (p.z > 0.15) return 'rear-housing';
    if (p.z < -0.2) return 'front-housing';
    if (p.y < -0.3) return 'sump';
    return 'mid-housing';
  },
  tour: ['rotor', 'front-housing', 'mid-housing', 'rear-housing', 'sump'],
  /* 无独立外壳（剖切态即展品形态），不设 xrayShellIds */
  realPartIds: ['rotor', 'front-housing', 'mid-housing', 'rear-housing', 'sump'],
  parts: [
    { id: 'rotor', zh: '三角转子与偏心轴', en: 'ROTOR & ECCENTRIC', real: true,
      ex: [0.8, 0.2, 0.2], lo: [0, 1.1, 0], tag: '发动机的心脏 · 偏心三弧面',
      desc: '三角转子是唯一的运动主角：三个弧面把缸腔分成三个工作室，转子转一圈、偏心轴转三圈（齿轮内啮合保证相位），每个工作室都依次完成一次进气-压缩-做功-排气——相当于三台两冲程机合体。偏心轴相当于往复机的曲轴，转子在其偏心轮上既公转又自转。',
      specs: [['相位', '转子 1 圈 = 轴 3 圈'], ['密封', '径向刮片 + 端面气封']] },
    { id: 'front-housing', zh: '前端盖', en: 'FRONT HOUSING', real: true,
      ex: [0, 0.15, -0.8], lo: [0, 1.1, -0.2], tag: '侧壁气口 · 相位齿轮座',
      desc: '端盖合拢缸体两侧，内部走气口与相位齿轮：转子内圈齿轮与偏心轴上的固定齿轮啮合，锁定"转子转 1 圈、轴转 3 圈"的运动关系。剖切教具把这一侧整个切开，齿轮座与轴承位直接可见。',
      specs: [['内置', '相位齿轮 · 轴承位']] },
    { id: 'mid-housing', zh: '缸体（8 字形气缸）', en: 'TROCHOID HOUSING', real: true,
      ex: [0, 0.5, 0.4], lo: [0, 1.2, 0.3], tag: '孪生外摆线型线 · 刮片槽',
      desc: '缸体内壁是精确的孪生外摆线（double-epitrochoid）曲线——不是"8 字"的随意比方，而是转子顶点在偏心旋转中扫出的真实轨迹。缸壁上的刮片槽让转子三个顶点的密封片紧贴缸壁，把三个工作室始终隔开。这是全机加工公差最严酷的表面。',
      specs: [['型线', 'double-epitrochoid'], ['公差', '镜面级缸壁']] },
    { id: 'rear-housing', zh: '后端盖', en: 'REAR HOUSING', real: true,
      ex: [0, 0.15, 0.8], lo: [0, 1.1, 0.2], tag: '进气/排气道 · 周边气口',
      desc: '后端盖布置进排气道：转子机的气门不是凸轮顶的蘑菇阀，而是转子弧面本身扫过缸壁上的气口——像二冲程一样"开闭即程序"，没有气门机构，因此转速上限极高（民用转子机轻松 9000rpm+，赛用上万）。',
      specs: [['气门', '无气门机构 · 端面/周边气口'], ['高转', '9000rpm+ 无气门弹簧限制']] },
    { id: 'sump', zh: '油底壳', en: 'OIL PAN', real: true,
      ex: [0, -0.7, 0], lo: [0, 1.1, -0.2], tag: '润滑 · 刮片与轴颈共饮',
      desc: '油底壳储存机油：转子机需要同时润滑刮片尖端与偏心轴轴承——刮片润滑混入燃油（四冲程转子机实际要烧机油就是这个部位），轴颈走独立油道。剖切件下方可见集油与回油路径。',
      specs: [['润滑', '刮片混燃 + 轴颈油道']] },
  ],
});
