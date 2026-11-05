/* =============================================================
   设备配置：阿波罗 11 号乘员舱门（CAD 模型 · Smithsonian CC0）
   来源：3d.si.edu（S3 免 key 通道）· NASM A19791810000 · CM-107 Columbia
   hatch_CAD_combined-100k-2048_draco.glb：3 组件×3 材质（default.056/057/058）
   按材质名直映射三部件；98k 三角面；bbox 1.04×0.80×0.34m（真机 75×100×27cm 含框）
   结构：统一舱门 = 外部结构门板（含 27cm 圆窗）+ 内部增压密封门 + 舱壁框与铰链
   历史：Apollo 1 火灾（1967-01）后改型——一扇门同时覆盖压力舱与热防护层开口
============================================================= */
import { makeDevice } from './_kit/factory.js';

export default makeDevice({
  id: 'apollo-hatch',
  era: 1969,
  name: '阿波罗 11 号乘员舱门',
  en: 'APOLLO 11 HATCH',
  category: '航天',
  brand: 'SMITHSONIAN',
  tagline: '统一舱门 · 一扇门三层世界',
  description: '阿波罗 11 号指令舱"哥伦比亚"（CM-107）的乘员舱门——NASA 工程 CAD 模型的数字化。它是"统一舱门"（unified hatch）设计的代表：1967 年阿波罗 1 号地面测试火灾夺去三名航天员生命后，舱门被彻底重新设计——必须能从舱内 10 秒内推开（老舱门内开且锁闭复杂，航天员无法逃生）；同时一扇门要同时密封增压座舱、抗再入大气层 3000°C 热流、溅落后防水。门上 27cm 圆窗供对接目视。本件三组件：外部结构门板（含窗框）、内部增压密封门、舱壁框与铰链——层与层之间的密封逻辑一目了然。',
  specs: [
    ['舱门', '统一舱门（unified hatch）'],
    ['尺寸', '75 × 100 × 27 cm · 129.7 kg'],
    ['舷窗', '10 5/8 in（27 cm）'],
    ['改型', 'Apollo 1 火灾后（1967）'],
    ['馆藏', 'NASM A19791810000 · CM-107'],
  ],
  accent: '#b8b8c0',
  /* 质量分级 B：NASA 官方 CAD + 3 组件直映射；未经运行时逐件核验不评 A */
  quality: 'B',
  source: 'Smithsonian 开放获取（NASA CAD）',
  modelCredit: 'Apollo 11 Crew Hatch CAD Model — Smithsonian NASM (A19791810000), CC0',
  modelSource: 'https://3d.si.edu/object/3d/hatch-crew-apollo-11-cad-model:936d1822-b237-4431-bb3f-a1f9d39a2e90',
  targetWidth: 9,
  camDist: 1.1,
  normalize: 'full',
  frontAxis: '+z',
  glb: '/assets/apollo-hatch.glb',
  realSizeMM: 990,   /* 真实最大外形尺寸（Smithsonian 收藏件口径：统一舱门 ~990×790mm 外框）：测量工具 mm 标定基准 */
  /* 3 组件按材质名映射（CAD 分组，逐组件隔离截图核验语义）：
     default.056 = 门上五金群（锁闩×12/铰链/通风阀/齿轮箱/窗框圈）
     default.057 = 舱门主体板（圆窗开口 + 红边密封 + 背面加强筋）
     default.058 = 舱壁框板（方形开口侧壁板 + 铰链座） */
  mapByPosition(name, p, rel, ext, mat) {
    if (mat === 'default.056') return 'hardware';
    if (mat === 'default.057') return 'door-panel';
    if (mat === 'default.058') return 'wall-frame';
    return 'wall-frame';
  },
  tour: ['door-panel', 'hardware', 'wall-frame'],
  realPartIds: ['door-panel', 'hardware', 'wall-frame'],
  parts: [
    { id: 'door-panel', zh: '舱门主体板', en: 'DOOR PANEL', real: true,
      ex: [0, 0, 1.0], lo: [0, 1.2, 0.3], tag: '27cm 圆窗 · 红边密封',
      desc: '统一舱门的主体结构板：中央 10 5/8 英寸（27cm）圆窗是航天员对接时目视的唯一的窗——阿姆斯特朗就是透过同级舱窗完成与"鹰号"的对接；四周红色边缘是密封面，与舱壁框压紧密封。板背面的加强筋网格把 5 psi 舱压（约 2 吨总推力）均匀传给框——它同时要扛住再入 3000°C 热流边缘烘烤与溅落后的海水。',
      specs: [['结构', '加强筋网格 · 铝'], ['舷窗', '27cm · 对接目视'], ['密封', '周边红边']] },
    { id: 'hardware', zh: '门锁五金组', en: 'LATCH HARDWARE', real: true,
      ex: [0, 0.4, -1.0], lo: [0, 1.2, -0.2], tag: '12 组锁闩 · 齿轮箱 · 通风阀',
      desc: '挂在门板背面的全部五金：周边 12 组锁闩把门匀压在框上（阿波罗 1 的教训——老舱门锁闭复杂且内开，三人来不及逃生；统一舱门改为 10 秒可开）；左上齿轮箱传动锁闩组，压力平衡阀在内外压差过大时自动进气，另有铰链座与应急释放。每一件都在 CAD 里精确到螺栓。',
      specs: [['锁闩', '12 组匀压'], ['传动', '齿轮箱联动'], ['安全', '10 秒开启（改型指标）']] },
    { id: 'wall-frame', zh: '舱壁框板', en: 'WALL FRAME', real: true,
      ex: [-1.0, 0, 0], lo: [0, 1.2, 0], tag: '方形开口 · 三层世界的界面',
      desc: '舱门在指令舱侧壁上的安装框板：中央方形开口容纳门板组件，周边平面贴合舱壁——外门、密封门、舱壁三者在此对位，密封槽与铰链座的位置精度决定密封成败。这扇门随"哥伦比亚"绕月 31 圈，等阿姆斯特朗他们从月面回来再打开；它在真空与 3000°C 的往返中守住了这扇"家门"。',
      specs: [['对位', '密封槽 + 铰链座'], ['经历', '绕月 31 圈 · 再入']] },
  ],
});
