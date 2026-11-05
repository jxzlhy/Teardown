/* =============================================================
   设备配置：前驱变速驱动桥总成（手动变速器+差速器+半轴+车轮悬架）
   社区模型（Sketchfab · avredu，CC-BY）：92 网格（Object_N 匿名名）
   × 40 材质（材质名/颜色语义）→ 逐部件隔离截图（iso-*.png）+ 材质色
   解码后按「材质×位置」混合映射：
   - 变速器齿轮排 z≈10（Gear_1..5 彩蓝系 + 红同步器 Material_2 + 橙圈 Material_13）
   - 输入轴 z≈11.4（Clutch_Shaft 黄 #9f9054）
   - 主减速器/差速器 线A x -6..0（红环齿 Material_2 + 深红壳 23_-_Default 17.4k + 紫行星轮 gear_pin）
   - 半轴 CV（rubber 黑套 ×3 + gear_shaft 轴段，x -11.6..+11）
   - 车轮与制动 x≥11.9（黑胎 + 白轮辐 Material_4 + 灰制动盘 + 卡钳群 z8.2-8.8）
   - 麦弗逊悬架 x 9.6-10.6 y 10.6-22（黄绿弹簧 Material_14）
   bbox 32×23×29（Y 上 · 长轴沿 X · 车轮在 +x 端）
   结构：输入轴 → 齿轮排 → 差速器 → 半轴 → 车轮，上方换挡+悬架
============================================================= */
import { makeDevice } from './_kit/factory.js';

export default makeDevice({
  id: 'manual-gearbox',
  name: '前驱变速驱动桥总成',
  en: 'FWD TRANSAXLE',
  category: '机械',
  brand: 'GENERIC',
  tagline: '从换挡杆到车轮 · 一条完整动力链',
  description: '前驱变速驱动桥（transaxle）教学总成：手动变速器与差速器合体，外加半轴、车轮与麦弗逊悬架——一条从换挡杆到接地面的完整动力链。输入轴把发动机扭矩带进来，五前一倒的齿轮排经同步器换挡，主减速器环齿把动力转向 90° 交给差速器，两侧半轴经等速万向节驱动车轮；麦弗逊支柱与螺旋弹簧撑起车身。馆内的行星齿轮箱与准双曲面齿轮展项讲"单一机构"，本件讲"总成协作"——齿轮系如何一步步把扭矩送到地面。',
  specs: [
    ['布局', '前驱横置 · 变速器+差速器合体'],
    ['挡位', '五前一倒 · 同步器'],
    ['末端', '环齿转向 90° + 半轴 CV 节'],
    ['悬架', '麦弗逊支柱 + 螺旋弹簧'],
  ],
  accent: '#c0563e',
  /* 质量分级 B：逐部件隔离截图核验映射 + 材质色解码；无贴图纯材质，未经细节复核不评 A */
  quality: 'B',
  source: '社区模型（Sketchfab）',
  modelCredit: 'Manual Transmission Gearbox With Differential by avredu (Sketchfab, CC-BY)',
  modelSource: 'https://sketchfab.com/3d-models/manual-transmission-gearbox-with-differential-d48d46543d844857b31475e56f941410',
  targetWidth: 10,
  camDist: 1.15,
  normalize: 'full',
  frontAxis: '+x',
  glb: '/assets/manual-gearbox.glb',
  /* 材质×位置混合映射（第 5 参材质名）：材质语义优先，位置兜底。
     校准依据 tools 外部 isolate 截图 + 材质色表（2026-11-02） */
  mapByPosition(name, p, rel, ext, mat) {
    if (p.x > 9 && p.y > 10) return 'suspension';
    if (p.x >= 11.9 || (p.x > 11.4 && p.z > 7.6)) return 'wheel';
    if (mat === 'Clutch_Shaft' || mat === 'Material_21') return 'input-shaft';
    if (/^Gear_[1-5]$/.test(mat) || mat === 'Gear_-_Main_Shaft' || mat === 'Bearings') return 'gear-set';
    if (mat.startsWith('Reverse_')) return 'reverse';
    if (mat === 'rubber' || mat === 'gear_shaft') return 'halfshaft';
    if (p.y < 6.9) return 'shifter';
    if (p.y > 8.9 && p.z <= 9.3) return 'shifter';
    if (p.z < 7.6) {
      if (p.x < 5.5) return 'final-drive';
      if (mat === 'Material_9') return 'halfshaft';
      return 'halfshaft';
    }
    if (p.z > 9.3) return 'gear-set';
    return 'final-drive';
  },
  tour: ['input-shaft', 'gear-set', 'reverse', 'shifter', 'final-drive', 'halfshaft', 'wheel', 'suspension'],
  /* 无独立外壳网格（开放式总成），不设 xrayShellIds */
  realPartIds: ['input-shaft', 'gear-set', 'reverse', 'shifter', 'final-drive', 'halfshaft', 'wheel', 'suspension'],
  /* AURORA 后/V5.1 内容深度：前驱变速驱动桥机构链（手动 MT 口径）。
     gear-set 内各挡齿轮副未逐挡拆件——啮合关系以 gear-set 聚合声明；倒挡独立拆件单列。 */
  mech: { edges: [
    { id:'gm-input-gearset', type:'gear_mesh', from:'input-shaft', to:'gear-set', kinematic:'exact',
      note:'输入轴常啮合齿轮与各挡从动轮常啮合（前进挡动力进入齿轮组）' },
    { id:'gm-reverse-idler', type:'gear_mesh', from:'input-shaft', to:'reverse', kinematic:'exact',
      note:'倒挡经中间惰轮再次啮合——旋向反转（与前进挡反向）' },
    { id:'sh-gearset-final', type:'shaft_coupling', from:'gear-set', to:'final-drive', kinematic:'exact',
      note:'输出轴将选定挡位扭矩传入主减速器（最终驱动）' },
    { id:'gm-final-halfshaft', type:'gear_mesh', from:'final-drive', to:'halfshaft', kinematic:'exact',
      note:'主减速器锥齿轮副改向减速后经差速器分至两侧半轴' },
    { id:'sh-halfshaft-wheel', type:'shaft_coupling', from:'halfshaft', to:'wheel', kinematic:'exact',
      note:'半轴经花键同轴驱动车轮' },
    { id:'sl-shifter-gearset', type:'linkage', from:'shifter', to:'gear-set', kinematic:'exact',
      note:'换挡杆经拨叉选/换结合套——挡位选择为操作机构（非动力流）' },
  ] },
  parts: [
    { id: 'input-shaft', zh: '输入轴', en: 'INPUT SHAFT', real: true,
      ex: [0, 1.2, 2.6], lo: [0, 1.2, 0.3], tag: '动力入口 · 离合器端花键',
      desc: '输入轴是动力链的第一站：前端花键接离合器摩擦片，发动机一转它就转。轴上的常啮合齿轮与齿轮排永久咬合——只要发动机在转、离合器在结合，整副齿轮系就一直在转，等待接合套选择谁向车轮传力。',
      specs: [['角色', '发动机 → 变速器'], ['接合', '离合器花键']] },
    { id: 'gear-set', zh: '齿轮排与同步器', en: 'GEAR SET', real: true,
      ex: [0, 2.6, 0], lo: [0, 1.2, 0.2], tag: '五前一倒 · 红色同步器',
      desc: '变速器的核心：一到五挡齿轮一字排开（各自空套在轴上），其间是红色的同步器接合套——换挡时接合套先把同步环"磨"到同速再锁定，动力经选中的齿轮流向输出。一挡齿大扭矩倍增，五挡齿小巡航省油，齿比的减与增全在这一排齿轮的直径差里。',
      specs: [['挡位', '1-5 挡 + 同步器'], ['原理', '常啮合 · 接合套选挡']] },
    { id: 'reverse', zh: '倒挡组', en: 'REVERSE GEAR', real: true,
      ex: [0, 3.6, -1.0], lo: [0, 1.2, 0.2], tag: '惰轮 · 反向旋转',
      desc: '倒挡的秘密是一只惰轮与其拨叉：前进挡的啮合次数为偶数、输出正转；挂倒挡时惰轮插进啮合链，奇数次啮合让输出反转。旁边的小开关在挂入倒挡时接通倒车灯电路——机构与电气在这里握手。',
      specs: [['原理', '奇次啮合 · 反转'], ['附加', '倒车灯开关']] },
    { id: 'shifter', zh: '换挡机构', en: 'SHIFT MECHANISM', real: true,
      ex: [0, 4.2, -2.2], lo: [0, 1.2, -0.3], tag: '拉杆与拨叉 · 手感的来源',
      desc: '挡把的"手动"动作最终落到这组拉杆与拨叉上：换挡拉杆把挡把的位移传进变速器，拨叉卡进接合套环槽推它选挡，互锁机构保证一次只挂一挡。那根最长的拉杆一路伸到车厢里的挡把底座——你手上每一丝"吸入感"都来自这组杆系的铰点。',
      specs: [['结构', '拉杆 + 拨叉 + 互锁'], ['输入', '车厢挡把杆系']] },
    { id: 'final-drive', zh: '主减速器与差速器', en: 'FINAL DRIVE & DIFF', real: true,
      ex: [-3.0, 0.6, 0.6], lo: [0, 1.2, 0], tag: '环齿转向 90° · 行星锥齿',
      desc: '主减速器的环齿把变速器输出转向 90°交给差速器壳；壳内的行星锥齿轮允许两侧半轴转速不同——过弯时外侧车轮多转、内侧少转，轮胎才不拖磨。深红色的差速器壳里，两颗紫色行星齿轮正对着你：最简单的齿轮，做着最聪明的补偿。',
      specs: [['构成', '环齿 + 壳体 + 行星锥齿'], ['功能', '转向 90° · 转速差补偿']] },
    { id: 'halfshaft', zh: '半轴与等速万向节', en: 'HALFSHAFT & CV JOINT', real: true,
      ex: [0, -1.2, 2.2], lo: [0, 1.1, 0], tag: '黑色橡胶套 · 六珠球道',
      desc: '半轴把差速器的动力横向送到车轮，路上全靠等速万向节（CV joint）：车轮要随悬架上下跳动、随转向左右摆动，刚性轴做不到。三只黑色橡胶防尘套保护着球节内的润滑脂——防尘套一旦破裂，油脂甩尽，几小时后球节就会磨出"哒哒"声。前驱车半轴异响，八成是它。',
      specs: [['结构', '球笼式等速万向节'], ['易损', '橡胶防尘套']] },
    { id: 'wheel', zh: '车轮与制动', en: 'WHEEL & BRAKE', real: true,
      ex: [1.6, 0, 0], lo: [0, 1.2, 0], tag: '接地端 · 制动盘与卡钳',
      desc: '动力链的终点：轮毂上的制动盘被卡钳夹住减速，轮胎把全部扭矩咬进地面——发动机几百牛·米的输出，最终就是这四片橡胶接触面上的摩擦。轮辐后的制动盘与卡钳座清晰可见，盘式制动的"夹"字诀一目了然。',
      specs: [['制动', '盘式 · 浮动卡钳'], ['输出', '轮胎接地面']] },
    { id: 'suspension', zh: '麦弗逊悬架', en: 'MACPHERSON STRUT', real: true,
      ex: [0.4, 1.6, 0], lo: [0, 1.2, 0], tag: '螺旋弹簧 + 阻尼柱',
      desc: '麦弗逊支柱（MacPherson，1949）把减振柱、螺旋弹簧与转向节揉成一件：弹簧撑住车重，柱内阻尼油把颠簸化为热。它结构简单、占位小，是前驱车的前悬标准答案——动力总成与悬架在这里交接，车轮既传力又跳动。',
      specs: [['型式', 'MacPherson · 1949'], ['构成', '弹簧 + 阻尼柱 + 转向节']] },
  ],
});
