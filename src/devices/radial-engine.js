/* =============================================================
   设备配置：星型活塞发动机（2026-11-03 模型置换：分离活塞版）
   社区模型（Sketchfab · senguptaarmaan，CC-BY 4.0）：
   「Final Full Radial Engine Assembly」Fusion 360 装配体——
   51 网格 / 14 语义材质（Aluminum/Brass/Steel/Paint×6/Cherry），
   气缸环（9 缸位 d 88-128）+ 活塞（d 56-77 偏 +x）+ 曲轴中心簇
   + 桨毂（x>55）+ 后安装座（x<-40）均独立建模
   → 置换原 basharnazzal 3 部件版（活塞未分件），启用 stroke 演示
   bbox 230×279×268（曲轴沿 X · 桨毂 +x · 环心 yz≈(145,0)）
   结构：曲轴 → 主连杆+副连杆 → 9 活塞 → 气缸环 → 桨毂输出
============================================================= */
import { makeDevice } from './_kit/factory.js';

export default makeDevice({
  id: 'radial-engine',
  name: '星型活塞发动机',
  en: 'RADIAL ENGINE',
  category: '机械',
  brand: 'GENERIC',
  tagline: '9 缸星排 · 一圈气缸绕一根曲轴',
  description: '星型（径向）活塞发动机：9 个气缸沿曲轴圆周呈放射状一圈排开，全部连杆接到曲轴唯一的「主连杆」上——这是它与直列/V 型发动机最大的结构差别。星型排布让每缸都能迎风冷却（早期航空发动机的经典方案），也把曲轴做得又短又粗；起动时曲轴每转一圈，9 缸各点火一次中的 5 缸（四冲程每两转点火），扭矩输出绵密。本件为课堂装配模型（Fusion 360 按正交图纸逐件建模）：九缸环、活塞、曲轴、桨毂独立分件，活塞随曲轴往复可演示。',
  specs: [
    ['布局','单排星型 · 9 缸'],['冷却','气冷（放射排布迎风）'],
    ['曲轴','单销 · 主连杆 + 副连杆'],['点火','四冲程 · 每两转 9 缸轮点'],
    ['用途','早期飞机动力 · 教学模型'],['构件','51 独立网格'],
  ],
  accent: '#c0563e',
  quality: 'B',   /* 2026-11-03：Fusion 装配体 51 网格分件 + 位置聚类映射；逐件核验后视情升级 */
  source: '社区模型（Sketchfab）',
  modelCredit: 'Final Full Radial Engine Assembly by senguptaarmaan (Sketchfab, CC-BY 4.0)',
  modelSource: 'https://sketchfab.com/3d-models/final-full-radial-engine-assembly-c41d38fa091547d7a43512beafff9fb1',
  targetWidth: 9,
  camDist: 1.1,
  normalize: 'full',
  frontAxis: '+x',
  glb: '/assets/radial-engine.glb',
  excludeMeshes: ['Object_3'],   /* 作者自带木质展示底板（y=10 平板 5.8k 面），非发动机构件 */
  postLoad: ({ partsById }) => {
    /* 银铝+白漆材质在强光+Bloom 下过曝（casio/kitchen-blender 模式）：整体压暗 */
    for (const pid of ['crankcase', 'cylinders', 'crankshaft', 'pistons', 'hub', 'mount']) {
      const p = partsById[pid]; if (!p) continue;
      p.group.traverse(o => {
        if (!o.isMesh) return;
        const mats = Array.isArray(o.material) ? o.material : [o.material];
        for (const m of mats) { if (m.color) m.color.multiplyScalar(0.42); }
      });
    }
  },
  tour: ['crankshaft', 'pistons', 'cylinders', 'crankcase', 'hub'],
  /* X-Ray 外壳：气缸环与曲轴箱即发动机本体，桨毂作半透明目标（沿用旧口径） */
  xrayShellIds: ['hub'],
  realPartIds: ['crankcase', 'cylinders', 'crankshaft', 'pistons', 'hub', 'mount'],
  demos: [
    { partId: 'hub', label: '螺旋桨轴旋转 · 星型发动机输出端', spinPivot: 'center', spin: 'auto' },
    { partId: 'pistons', label: '九缸活塞 40° 均布相位往复 · 示意',
      stroke: { crankAxis: [1, 0, 0], phaseMode: 'radial', phaseN: 9, amp: 0.25, f: 0.8 } },
  ],
  parts: [
    { id:'crankshaft', zh:'曲轴与主连杆', en:'CRANKSHAFT', real:true,
      ex:[-0.4,0.3,0.6], lo:[0,1.2,0], tag:'单销 · 主连杆汇接',
      desc:'星型发动机的心脏：九根连杆全部汇接到曲轴唯一的曲柄销上——一根主连杆（master rod）带八根副连杆（slave rods）。曲轴短而粗是星型排布带来的天然刚度优势；后部安装座与附件驱动也在箱体上。本件曲轴与主连杆为独立网格。',
      specs:[['汇接','1 主连杆 + 8 副连杆'],['曲轴','单销 · 短粗高刚']] },
    { id:'pistons', zh:'活塞（9 组）', en:'PISTONS', real:true,
      ex:[0.6,0.5,0], lo:[0,1.2,0], tag:'随曲轴往复 · stroke 演示',
      desc:'九组活塞沿各自缸轴往复：曲轴每转一圈，各活塞按相位依次到达上/下止点——星型发动机的四冲程点火顺序让九缸在两转内均匀点火，动力输出没有"空档"。本件活塞为独立网格，可按 40° 均布相位演示往复运动（示意动画）。',
      specs:[['缸数','9 · 等角 40°'],['运动','往复 · 均布相位']] },
    { id:'cylinders', zh:'气缸环（×9）', en:'9-CYLINDER BANK', real:true,
      ex:[0,0.5,0.6], lo:[0,1.2,0], tag:'放射排布 · 气冷散热',
      desc:'九只气缸沿曲轴圆周等角（40°/缸）放射排成一圈：每只缸都能被螺旋桨气流直接吹拂，气冷效率远胜多排直列；一圈气缸共享一根曲轴销，结构紧凑到几乎没有「发动机背面」。',
      specs:[['缸数','9 · 等角 40°'],['冷却','迎风气冷'],['排布','单排星型']] },
    { id:'crankcase', zh:'曲轴箱', en:'CRANKCASE', real:true,
      ex:[0,-0.5,0.7], lo:[0,1.2,0], tag:'汇接壳体 · 附件驱动',
      desc:'曲轴箱把九只气缸的根部门圈收拢成一体：曲轴主轴承、凸轮盘与附件驱动都装在箱体上。星型机的曲轴箱呈短粗的圆筒形——它不需要像直列机那样为长曲轴提供全长支撑，刚度天然占优。',
      specs:[['结构','短粗圆筒'],['内置','主轴承 · 附件驱动']] },
    { id:'hub', zh:'桨毂与螺旋桨', en:'PROPELLER HUB', real:true,
      ex:[1.2,0,0], lo:[0,1.1,0], tag:'螺旋桨安装端',
      desc:'曲轴前端穿过气缸环中央，经减速齿轮驱动螺旋桨——桨毂与桨叶就是这台发动机的「输出端」。星型发动机迎风面大，本身就是飞行器前部的结构件。',
      specs:[['输出','曲轴前端 · 减速驱动'],['位置','+X 端（迎风面）']] },
    { id:'mount', zh:'后部安装座', en:'REAR MOUNT', real:true,
      ex:[-1.2,0,0], lo:[0,1.1,0], tag:'机体安装界面',
      desc:'发动机与飞机机体（防火墙）的安装界面：星型发动机经安装环螺栓固定在机头，扭矩与陀螺力矩全部通过这几只支臂传入机体。后部同时挂附件驱动与化油器进气。',
      specs:[['界面','安装环 · 防火墙'],['载荷','扭矩 + 陀螺力矩']] },
  ],
  /* 位置聚类（inspect 实测）：环心 yz≈(145,0)，
     活塞 = 45≤d≤82 且 x>-13.2（环体在 x=-13.5 平面），
     气缸 = d>82，曲轴 = d<45 或连杆带 x≤-13.2，桨毂 x>55，安装座 x<-40 */
  mapByPosition(name, p, rel) {
    if (p.x > 55) return 'hub';
    if (p.x < -40) return 'mount';
    const d = Math.hypot(p.y - 145, p.z);
    if (d > 82) return 'cylinders';
    if (d >= 45) return p.x > -13.2 ? 'pistons' : 'crankshaft';
    return 'crankshaft';
  },
});
