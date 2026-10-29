/* =============================================================
   设备配置：DeWalt D28136 角磨机（电动工具 · 教学拆解）
   社区模型（Sketchfab · Den.Prodan，CC-BY 4.0）：18 网格
   （body/disk/cyl/button/joint 语义根 × 1001/1002 双材质配色）
   bbox 0.28×0.12×0.50m，Z 为机身轴：齿轮头 +z（砂轮片朝下 y-0.1）→ frontAxis '+z'
   结构：机壳→齿轮头→护罩→砂轮片→开关/锁钮
============================================================= */
import { makeDevice } from './_kit/factory.js';

export default makeDevice({
  id: 'angle-grinder',
  name: '角磨机（DeWalt D28136）',
  en: 'ANGLE GRINDER',
  category: '工具',
  brand: 'DEWALT',
  tagline: '1 万转的直角传动 · 最危险也最常用的电动工具',
  description: '角磨机：电机转子轴与砂轮片成 90°，靠一对螺旋伞齿轮把纵轴动力拐进横轴——齿轮头是全机机械密度最高的位置。本页拆成 5 组：机壳（含电机定子腔）、齿轮头、活动护罩、砂轮片与开关/主轴锁。D28136 是 125mm 砂轮、1 万转级的标准角磨机；品牌名仅作型号署名。',
  specs: [
    ['型号', 'D28136（125mm 级）'],
    ['空载转速', '约 10000 r/min'],
    ['传动', '螺旋伞齿轮直角换轴'],
    ['砂轮', 'Φ125mm 树脂切割/打磨片'],
    ['护罩', '活动卡扣 · 无工具快调'],
    ['安全', '主轴锁 + 防重启开关'],
  ],
  accent: '#e8b431',
  source: '社区模型（Sketchfab）',
  modelCredit: 'Angle Grinder DeWalt D28136 by Den.Prodan (Sketchfab, CC-BY 4.0)',
  modelSource: 'https://sketchfab.com/3d-models/angle-grinder-dewalt-d28136-d3da4a887d524714a2cfa358be2c907f',
  targetWidth: 9,
  normalize: 'full',
  frontAxis: '+z',
  glb: '/assets/angle-grinder.glb',
  mappingPrefix: {
    'body':      'body',
    'joint1':    'gearhead',
    'joint2':    'gearhead',
    'joint3':    'gearhead',
    'cyl1':      'guard',
    'cyl2':      'guard',
    'disk':      'disk',
    'button_low': 'switches',
    'button2_low': 'switches',
  },
  tour: ['body', 'switches', 'gearhead', 'guard', 'disk'],
  xrayShellIds: ['body', 'gearhead', 'guard'],
  realPartIds: ['body', 'gearhead', 'guard', 'disk', 'switches'],
  parts: [
    { id: 'body', zh: '机壳（电机仓）', en: 'MOTOR HOUSING', real: true,
      ex: [0, 0.3, -1.6], lo: [0, 1.2, -0.5], tag: '筒形壳内藏 1500W 级电机',
      desc: '长筒形机壳里竖着串励电机：定子压进铝内胆，转子轴直通齿轮头。壳体中段的收腰是握持区，防滑纹理以"压铸+包胶"两段成型。角磨机没有离合器——堵转的全部反扭矩都从手柄直接传到腕关节，所以握持区的形状比外观重要得多。',
      specs: [['电机', '串励 · 风冷'], ['握持', '收腰防滑区'], ['风险', '堵转反扭矩']] },
    { id: 'switches', zh: '开关与主轴锁', en: 'SWITCH & SPINDLE LOCK', real: true,
      ex: [0, 1.8, 0.6], lo: [0, 1.1, 0], tag: '防重启 · 换片必备',
      desc: '尾部拨动开关带防重启联锁：断电后不拨回就不会再启动，这是角磨机最要命的安全设计。机身侧面的圆形主轴锁按下去锁死转子，才能用扳手拆砂轮——两颗按钮一红一黑，承担了全机的"可控性"。',
      specs: [['开关', '防重启拨动式'], ['主轴锁', '按入锁转子'], ['换片', '锁轴 + 双销扳手']] },
    { id: 'gearhead', zh: '齿轮头', en: 'GEAR HEAD', real: true,
      ex: [0, 1.4, 2.2], lo: [0, 1.2, 0.8], tag: '一对螺旋伞齿轮 · 直角换轴',
      desc: '齿轮头把电机纵轴的动力拐 90° 输出到砂轮主轴：螺旋伞齿轮啮合， grease 润滑封闭在铝壳内。它是角磨机发热与异响的第一现场——润滑脂干涸后温升直线上升，绝大部分"机头烫手"都从这里开始。',
      specs: [['传动', '螺旋伞齿轮 90°'], ['润滑', '封闭润滑脂'], ['故障', '温升 / 异响首位']] },
    { id: 'guard', zh: '活动护罩', en: 'ADJUSTABLE GUARD', real: true,
      ex: [0, -1.8, 1.8], lo: [0, 0.9, 1.0], tag: '卡扣快调 · 挡火花与断片',
      desc: '护罩环抱砂轮上半周，沿齿轮头法兰旋转定位、卡扣锁定：切割时把开口背向自己，打磨时转到侧面。它挡的不只是火花——砂轮片碎裂时，这道金属弧是操作者与 1 万转碎片之间唯一的屏障。',
      specs: [['形式', '环抱式 · 无工具快调'], ['作用', '挡火花 / 挡断片'], ['规范', '切割作业不得拆除']] },
    { id: 'disk', zh: '砂轮片', en: 'ABRASIVE DISC', real: true,
      ex: [0, -3.0, 0.6], lo: [0, 1.0, 0.8], tag: 'Φ125 树脂结合剂 · 消耗品',
      desc: '树脂结合剂砂轮片由玻璃纤维网两面夹持磨料压制而成——强度来自纤维网而非树脂本身。切割片与打磨片不可混用：切割片薄且不能受侧向力，侧压是它碎裂的第一诱因。寿命以毫米计，是全机唯一的规律性消耗件。',
      specs: [['直径', 'Φ125mm'], ['结构', '磨料 + 玻纤网增强'], ['红线', '切割片严禁侧压']] },
  ],
});
