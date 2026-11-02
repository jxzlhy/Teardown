/* =============================================================
   设备配置：军用双筒望远镜（保罗棱镜式 · Poly Haven CC0）
   社区模型（Poly Haven · Luke，CC0）：8 节点全语义命名
   （left/right_lens + left/right_prism + middle 铰链 + eye_relief
   + focus + diopter），双端保罗棱镜独立建模，光路可完整拆讲
   bbox 0.19×0.07×0.20（米制 · Y 上 · 物镜端 z=-0.1 → frontAxis '-z'）
   结构：物镜 → 保罗棱镜（正像）→ 目镜，中轴铰链 + 调焦 + 屈光
============================================================= */
import { makeDevice } from './_kit/factory.js';

export default makeDevice({
  id: 'vintage-binocular',
  name: '军用双筒望远镜',
  en: 'VINTAGE BINOCULAR',
  category: '科学仪器',
  brand: 'GENERIC',
  tagline: '光在体内拐四个弯，你看见的是正像',
  description: '保罗棱镜式双筒望远镜：每只筒里两块直角棱镜把倒像转正、把长光路折叠进短镜身——这就是"又短又能望远"的全部秘密。两侧物镜收光，经保罗棱镜组四次全反射后到达目镜；中央调焦轮驱动内调焦组，右目镜的屈光度环补偿双眼视差。本件为 Poly Haven CC0 扫描级资产，双端四块棱镜全部独立建模，是全馆光路最完整的展品。',
  specs: [
    ['型式', '保罗棱镜 · 中央调焦'],
    ['光路', '物镜 → 棱镜×2/筒 → 目镜'],
    ['机构', '中轴铰链 · 调焦轮 · 屈光环'],
    ['来源', 'Poly Haven · CC0'],
  ],
  accent: '#5d8aa8',
  /* 质量分级 B：CC0 无署名义务、节点级验证含双端棱镜；未经运行时逐件核验，不评 A */
  quality: 'B',
  source: '社区模型（Poly Haven）',
  modelCredit: 'Vintage Binocular by Luke (Poly Haven, CC0)',
  modelSource: 'https://polyhaven.com/a/vintage_binocular',
  targetWidth: 9.5,
  normalize: 'full',
  frontAxis: '-z',
  glb: '/assets/vintage-binocular.glb',
  mappingPrefix: {
    'vintage_binocular_left_lens': 'objective-l',
    'vintage_binocular_right_lens': 'objective-r',
    'vintage_binocular_left_prism': 'prism-l',
    'vintage_binocular_right_prism': 'prism-r',
    'vintage_binocular_middle': 'hinge',
    'vintage_binocular_eye_relief': 'eyecup',
    'vintage_binocular_focus': 'focus',
    'vintage_binocular_diopter': 'diopter',
  },
  tour: ['objective-l', 'prism-l', 'prism-r', 'objective-r', 'focus', 'eyecup', 'diopter', 'hinge'],
  /* X-Ray 外壳：无独立外壳网格（整机即光路本体），不设 xrayShellIds，X-Ray 淡出整目镜身 */
  realPartIds: ['objective-l', 'objective-r', 'prism-l', 'prism-r', 'hinge', 'eyecup', 'focus', 'diopter'],
  parts: [
    { id: 'objective-l', zh: '左物镜', en: 'OBJECTIVE L', real: true,
      ex: [-0.5, 0, -1.3], lo: [0, 1.2, -0.2], tag: '收光 · 光路起点',
      desc: '左筒物镜是光路的第一站：口径越大收集的光越多，夜视能力越强。军用风双筒的物镜深藏在护罩内——防反光暴露位置，也是老式镜的识别特征。光从这里进入，将在筒内拐四个弯。',
      specs: [['角色', '光路起点 · 收光']] },
    { id: 'objective-r', zh: '右物镜', en: 'OBJECTIVE R', real: true,
      ex: [0.5, 0, -1.3], lo: [0, 1.2, -0.2], tag: '收光 · 右筒起点',
      desc: '右筒物镜与左筒完全对称——双筒望远镜的本质是两台并排的小型折射望远镜，共用一根中轴铰链保证两条光轴永远平行，否则双眼看到的两个像无法在脑内融合。',
      specs: [['角色', '右筒收光']] },
    { id: 'prism-l', zh: '左保罗棱镜组', en: 'PORRO PRISM L', real: true,
      ex: [-0.6, 1.1, 0], lo: [0, 1.3, 0], tag: '四次全反射 · 正像',
      desc: '保罗棱镜组（Ignazio Porro，1854）：两块 45°-90°-45° 直角棱镜背对背拼接，光在四个反射面上发生全反射——把上下颠倒、左右相反的倒像旋转 180° 转正，同时把直射光路折叠成 Z 形，让镜身比"开普勒式"短一半。老式保罗镜的棱镜座凸出镜身，一眼可辨。',
      specs: [['原理', '全反射 · 180° 转像'], ['发明', 'Ignazio Porro · 1854']] },
    { id: 'prism-r', zh: '右保罗棱镜组', en: 'PORRO PRISM R', real: true,
      ex: [0.6, 1.1, 0], lo: [0, 1.3, 0], tag: '四次全反射 · 右筒正像',
      desc: '右筒棱镜组与左筒对称——每只筒各一组、共四块棱镜。棱镜必须在光路上精确对位：角度差一分，出射像就偏；所以高级镜的棱镜座用螺丝+定位销锁定，出厂后不再动。',
      specs: [['对称', '每筒一组 · 共四块']] },
    { id: 'focus', zh: '中央调焦轮', en: 'CENTER FOCUS', real: true,
      ex: [0, 1.4, 0.2], lo: [0, 1.3, 0.3], tag: '一只轮子 · 双筒同步对焦',
      desc: '中央调焦轮同时驱动两筒的内调焦组：转动时两筒的目镜组沿光轴同步移动，把无穷远到近距纳入焦内。铰链中轴里的铰链轴把一只轮子的转动分配给左右两筒——这是"中央调焦"结构的标准答案。',
      specs: [['结构', '中轴内同步机构']] },
    { id: 'eyecup', zh: '目镜罩', en: 'EYE RELIEF', real: true,
      ex: [0, 0, 1.5], lo: [0, 1.2, 0.3], tag: '眼点距离 · 遮杂光',
      desc: '翻折式目镜罩固定眼点到目镜的距离（eye relief）：戴眼镜要翻下、裸眼翻起。它同时遮住视场外的杂光，军用镜的目镜罩还要防雨水——眼点不稳，全镜白搭。',
      specs: [['功能', '固定眼点 · 遮光']] },
    { id: 'diopter', zh: '屈光度调节环', en: 'DIOPTER RING', real: true,
      ex: [0.5, 0.4, 1.1], lo: [0, 1.2, 0.2], tag: '双眼视差 · 补偿环',
      desc: '中央调焦只能对齐"双眼平均"，但两眼度数常不一样：先闭左眼用屈光环单独校右筒，再用中央轮整体对焦——两只眼就都清晰了。环上刻着 ±度数刻度，记住自己的档位，下次直接归位。',
      specs: [['功能', '右筒独立补焦']] },
    { id: 'hinge', zh: '中轴铰链', en: 'CENTER HINGE', real: true,
      ex: [0, -1.4, 0], lo: [0, 1.2, 0], tag: '双筒光轴 · 平行的保证',
      desc: '中轴铰链把两只筒连成一体并承担全部调节：两筒绕它张合以适配瞳距，铰链轴内部走调焦联动。铰链刚度决定两条光轴的平行度——平行差超角分，双眼像就无法融合，长时间观察会头晕。',
      specs: [['结构', '张合 · 调焦联动']] },
  ],
});
