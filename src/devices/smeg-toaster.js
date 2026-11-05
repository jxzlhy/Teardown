/* =============================================================
   设备配置：Smeg 烤面包机（复古电热 · 双片式）
   社区模型（Sketchfab · Thefreshlab，CC-BY 4.0）：18 图元匿名 Object_N，
   按位置/尺寸/材质聚类映射（Chrome 包边 / Toaster_Body 搪瓷壳 /
   silver_plastic 内构件 / Emissive_Light 指示灯）
   bbox 0.31×0.20×0.19，Y 上；起弹杆在 +x 侧 → frontAxis '+x' 真机校准
   结构：机身→顶盖→底座→起弹杆→升降架→控制件
============================================================= */
import { makeDevice } from './_kit/factory.js';

export default makeDevice({
  id: 'smeg-toaster',
  name: 'Smeg 烤面包机',
  en: 'SMEG TOASTER',
  category: '厨电',
  brand: 'SMEG',
  tagline: '镀铬曲线下的电热丝 · 复古外表的精确控温',
  description: 'Smeg 复古烤面包机：50 年代曲线造型下是精确的电热控制——双片槽口内的云母电热丝从两侧同时加热，升降架由电磁吸持，计时器决定上色程度，"再弹起"机构在计时结束时切断并弹起面包。本页按 6 组拆解：机身壳体、顶盖、底座与底脚、侧面起弹杆、内部升降架、控制与指示件。品牌名仅作型号署名。',
  specs: [
    ['形式', '双片槽口 · 两侧电热'],
    ['控制', '上色拨盘 + 解冻/再加热'],
    ['机构', '电磁吸持 · 计时弹起'],
    ['外壳', '镀铬包边 + 搪瓷壳体'],
    ['拆解', '6 组核心部件'],
  ],
  accent: '#d4a13c',
  source: '社区模型（Sketchfab）',
  modelCredit: 'Smeg Toaster by Thefreshlab (Sketchfab, CC-BY 4.0)',
  modelSource: 'https://sketchfab.com/3d-models/smeg-toaster-646838d76f204c83ae952e049f2948b1',
  targetWidth: 8,
  normalize: 'full',
  frontAxis: '+x',
  glb: '/assets/smeg-toaster.glb',
  realSizeMM: 310,   /* 真实最大外形尺寸（Smeg 官方产品页 TSF01 310×198×195mm）：测量工具 mm 标定基准 */
  /* 匿名网格：按语义判读 + 位置/尺寸聚类（见 AUTONOMOUS_LOG） */
  mapping: {
    'Object_10': 'shell',
    'Object_14': 'shell',
    'Object_16': 'shell',
    'Object_20': 'shell',
    'Object_8':  'shell',
    'Object_6':  'top-crown',
    'Object_4':  'base',
    'Object_25': 'base',
    'Object_27': 'base',
    'Object_12': 'lever',
    'Object_21': 'carriage',
    'Object_23': 'controls',
    'Object_18': 'controls',
    'Object_22': 'controls',
    'Object_29': 'controls',
    'Object_30': 'controls',
    'Object_32': 'controls',
    'Object_33': 'controls',
  },
  tour: ['shell', 'top-crown', 'controls', 'lever', 'carriage', 'base'],
  xrayShellIds: ['shell', 'top-crown'],
  realPartIds: ['shell', 'top-crown', 'base', 'lever', 'carriage', 'controls'],
  parts: [
    { id: 'shell', zh: '机身壳体', en: 'CHROME BODY', real: true,
      ex: [0, 0.3, 0.6], lo: [0, 1.2, 0], tag: '搪瓷壳 + 镀铬包边',
      desc: 'Smeg 的标志性曲线壳体：搪瓷钢板主体配镀铬包边圆角。造型之外还有功能——壳体与电热腔之间留有隔热空气层，外壳温升被控制在可触摸的范围。壳体开孔同时承担散热与弹起机构的行程让位。',
      specs: [['主体', '搪瓷钢板'], ['包边', '镀铬圆角'], ['隔热', '壳体-电热腔空气层']] },
    { id: 'top-crown', zh: '顶盖与槽口', en: 'TOP CROWN', real: true,
      ex: [0, 1.6, -0.4], lo: [0, 1.3, 0], tag: '双片槽口 · 热辐射的出口',
      desc: '顶部的双片槽口是唯一的"进出通道"：面包从这里进入升降架，热空气和水汽从这里排出。槽口边缘的镀铬卷边既防割手也反射辐射热——让热量尽量留在槽内而不是烤糊面包顶面。',
      specs: [['槽口', '双片 28mm 级'], ['卷边', '镀铬防割'], ['热管理', '顶部排汽']] },
    { id: 'controls', zh: '控制与指示件', en: 'CONTROLS & LIGHTS', real: true,
      ex: [0.9, 0.5, 1.4], lo: [0, 1.0, 0.6], tag: '上色拨盘 · 解冻/停止 · 氛围灯',
      desc: '控制集群：上色拨盘决定计时器行程（1-6 档对应不同的断电时刻），解冻与再加热是并联在计时器上的旁路触点（延长通电时间），发光件同时是"通电中"的指示。拨盘手感来自凸轮+棘爪，旋钮松动的根源多是它。',
      specs: [['上色', '1-6 档计时'], ['旁路', '解冻 / 再加热'], ['指示', '通电发光件']] },
    { id: 'lever', zh: '起弹杆', en: 'CARRIAGE LEVER', real: true,
      ex: [1.6, 0.2, -0.6], lo: [0, 1.1, 0.4], tag: '一杆三职：压下 · 锁定 · 触发',
      desc: '侧面的镀铬起弹杆把升降架压到低位，锁定钩咬合，同时触发主开关开始计时——它是全机唯一的"用户输入执行器"。计时结束锁定钩释放，弹簧把面包顶回。杆的行程末端的"轻抬位"只断电不起动，用于中途取出。',
      specs: [['动作', '压下 → 锁定 → 触发'], ['释放', '计时结束弹起'], ['细节', '轻抬位仅断电']] },
    { id: 'carriage', zh: '内部升降架', en: 'CARRIAGE', real: true,
      ex: [0, 0.9, 1.6], lo: [0, 1.1, 0], tag: '藏在壳内的面包托架',
      desc: '升降架平时藏在壳体内：两片带栏栅的托架由导向轨约束只能垂直运动，底部连接弹起弹簧与锁定机构。栏栅的间隙设计成"夹得住薄面包、推得动厚贝果"——它是最容易被面包屑卡住的部件。',
      specs: [['导向', '垂直双轨'], ['动力', '弹起弹簧'], ['故障', '面包屑卡滞']] },
    { id: 'base', zh: '底座与底脚', en: 'BASE & FEET', real: true,
      ex: [0, -1.2, 0.8], lo: [0, 1.0, 0.4], tag: '集屑盘的家 · 重心所在',
      desc: '底座是重心的位置：变压器级的发热部件都压在下半部，两只防滑底脚保证按压起弹杆时机身不翘。底面开有集屑盘抽拉口——面包屑是烤面包机唯一需要"维护"的东西，不清理它就是下一条火灾新闻。',
      specs: [['重心', '下半部配重'], ['底脚', '防滑 ×2'], ['维护', '底部集屑盘定期清理']] },
  ],
});
