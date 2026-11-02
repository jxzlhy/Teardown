/* =============================================================
   设备配置：星型活塞发动机（径向 9 缸 · 教学模型）
   社区模型（Sketchfab）：basharnazzal「Radial Engine」（CC-BY 4.0）
   29 网格全 Blender 泛名（Cylinder.xxx）+ 程序化材质无贴图；
   气缸环绕曲轴在 YZ 平面成环、曲轴沿 X 轴、桨毂在 -X 端（inspect 实测）
   → frontAxis '-x'（桨面朝观众），映射走 mapByPosition 角度/半径聚类
============================================================= */
import { makeDevice } from './_kit/factory.js';

export default makeDevice({
  id: 'radial-engine',
  name: '星型活塞发动机',
  en: 'RADIAL ENGINE',
  category: '机械',
  brand: 'GENERIC',
  tagline: '9 缸星排 · 一圈气缸绕一根曲轴',
  description: '星型（径向）活塞发动机：9 个气缸沿曲轴圆周呈放射状一圈排开，全部连杆接到曲轴唯一的「主连杆」上——这是它与直列/V 型发动机最大的结构差别。星型排布让每缸都能迎风冷却（早期航空发动机的经典方案），也把曲轴做得又短又粗；起动时曲轴每转一圈，9 缸各点火一次中的 5 缸（四冲程每两转点火），扭矩输出绵密。本件为社区教学模型：曲轴箱、九只气缸、桨毂与桨轴均为独立网格。',
  specs: [
    ['布局','单排星型 · 9 缸'],['冷却','气冷（放射排布迎风）'],
    ['曲轴','单销 · 主连杆 + 副连杆'],['点火','四冲程 · 每两转 9 缸轮点'],
    ['用途','早期飞机动力 · 教学模型'],['构件','29 独立网格'],
  ],
  accent: '#c8a86b',
  quality: 'B',   /* 2026-11-01：结构/映射/演示实测；活塞未单独建模，气门机构待核 */
  source: '社区模型（Sketchfab）',
  modelCredit: 'Radial Engine by basharnazzal (Sketchfab, CC-BY 4.0)',
  modelSource: 'https://sketchfab.com/3d-models/radial-engine-25b49d63734748f7a37da9e065da2f72',
  targetWidth: 8,
  camDist: 1.0,
  normalize: 'full',
  frontAxis: '-x',
  glb: '/assets/radial-engine.glb',
  tour: ['crankcase','cylinders','hub'],
  /* X-Ray 外壳：曲轴箱/气缸环即发动机本体（无独立罩壳网格），按「最外层 1-2 件」口径
     选 -X 端桨毂与螺旋桨作半透明目标；避免 realPartIds 兜底把全部 3 组部件雾化 */
  xrayShellIds: ['hub'],
  demos: [
    { partId: 'hub', label: '螺旋桨轴旋转 · 星型发动机输出端', spinPivot: 'center', spin: 'auto' },
  ],
  /* V4.0 MI①：3 大件展示模型——旋转输出与缸排固定关系；内部活塞/连杆/曲柄未单独建模，不虚构。 */
  mech: { driver: 'hub', edges: [
    { id: 'rv-hub-crankcase', type: 'revolute', from: 'crankcase', to: 'hub', kinematic: 'approx',
      note: '螺旋桨轴/轮毂绕曲轴箱轴线旋转（星型 9 缸的曲柄-连杆-活塞机构未单独建模，旋转为输出端示意）' },
    { id: 'fx-crankcase-cyl', type: 'fixed', from: 'crankcase', to: 'cylinders', note: '九个气缸星型排布固定于曲轴箱' },
  ] },
  parts: [
    { id:'crankcase', zh:'曲轴箱', en:'CRANKCASE', real:true,
      ex:[0,-.2,-1.6], lo:[0,1.2,0], tag:'主连杆 · 曲轴轴承座',
      desc:'星型发动机的心脏座：九根连杆全部汇接到曲轴唯一的曲柄销上——一根主连杆（master rod）带八根副连杆（slave rods）。曲轴短而粗是星型排布带来的天然刚度优势；后部安装座与附件驱动也在箱体上。',
      specs:[['汇接','1 主连杆 + 8 副连杆'],['曲轴','单销 · 短粗高刚']] },
    { id:'cylinders', zh:'气缸环（×9）', en:'9-CYLINDER BANK', real:true,
      ex:[0,.8,1.4], lo:[0,1.2,0], tag:'放射排布 · 气冷散热',
      desc:'九只气缸沿曲轴圆周等角（40°/缸）放射排成一圈：每只缸都能被螺旋桨气流直接吹拂，气冷效率远胜多排直列；一圈气缸共享一根曲轴销，结构紧凑到几乎没有「发动机背面」。',
      specs:[['缸数','9 · 等角 40°'],['冷却','迎风气冷'],['排布','单排星型']] },
    { id:'hub', zh:'桨毂与螺旋桨', en:'PROPELLER HUB', real:true,
      ex:[-2.2,.4,0], lo:[0,1.1,0], tag:'螺旋桨安装端',
      desc:'曲轴前端穿过气缸环中央，经减速齿轮驱动螺旋桨——桨毂与碳纤维桨叶就是这台发动机的「输出端」。星型发动机迎风面大，本身就是飞行器前部的结构件。',
      specs:[['输出','曲轴前端 · 减速驱动'],['位置','-X 端（迎风面）']] },
  ],
  mapByPosition(name, p, rel){
    /* 2026-11-01 __RAW.rel 实测聚类（29 网格）：
       曲轴中线 yz≈(0.345,0.525)；x<0.35 = 桨毂/桨叶；距中线 >0.08 = 气缸环（15 块）；其余 = 曲轴箱/后部 */
    if(rel.x < 0.35) return 'hub';
    const d = Math.hypot(rel.y - 0.345, rel.z - 0.525);
    if(d > 0.08) return 'cylinders';
    return 'crankcase';
  },
  realPartIds: ['crankcase','cylinders','hub'],
});
