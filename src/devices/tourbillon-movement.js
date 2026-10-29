/* =============================================================
   设备配置：陀飞轮机芯（3D 打印机械怀表 · Christoph Laimer 开源设计）
   开源分件模型（Pinshape · Christoph Laimer，CC-BY 4.0）：33 个二进制 STL
   分件（原始件 vendor/assets/originals/clockwerk/），经 tools/stl2glb-batch.mjs
   逐件命名合并（打印位姿 → --up Y-up），draco 压缩 855KB
   bbox 179×57.9×139mm；主发条/擒纵/轮系/陀飞轮框架全语义命名 → 7 部件
============================================================= */
import { makeDevice } from './_kit/factory.js';

export default makeDevice({
  id: 'tourbillon-movement',
  name: '陀飞轮机芯（3D 打印怀表）',
  en: 'TOURBILLON MOVEMENT',
  category: '钟表',
  brand: 'LAIMER',
  tagline: '连发条都是 3D 打印的 · 每分钟自转一周的机械奇迹',
  description: 'Christoph Laimer 的开源 3D 打印陀飞轮怀表：51 个打印件组成可真正走时的机械机芯——连最难的主发条都是打印的。陀飞轮框架每分钟自转一周，把重力对擒纵的影响"平均掉"；瑞士杠杆式擒纵、皮带减速轮系与打印主发条全部由本页 7 组分件呈现。齿轮齿数（29/38/19）即传动比的直接证据。原设计为 CC-BY 4.0 开源硬件。',
  specs: [
    ['类型', '机械怀表机芯 · 陀飞轮'],
    ['自转', '陀飞轮框架 1 圈/分'],
    ['擒纵', '瑞士杠杆式（Swiss lever）'],
    ['特殊', '3D 打印主发条'],
    ['传动', '皮带减速 · 29/38/19 齿'],
    ['来源', '开源硬件 CC-BY 4.0'],
  ],
  accent: '#c9a227',
  source: '开源分件模型（Pinshape · CC-BY 4.0）',
  modelCredit: '3D-printed Watch with Tourbillon by Christoph Laimer (Pinshape, CC-BY 4.0)',
  modelSource: 'https://pinshape.com/items/30212-3d-printed-watch-with-tourbillon',
  targetWidth: 10,
  camDist: 1.35,
  normalize: 'full',
  frontAxis: '+z',
  glb: '/assets/tourbillon-movement.glb',
  postLoad: ({ partsById }) => {
    /* 打印树脂白模在强光+Bloom 下过曝：整体压暗 */
    for (const pid of ['mainspring', 'escapement', 'cage', 'wheel-train', 'belt-drive', 'plates', 'assembly-aids']) {
      const p = partsById[pid]; if (!p) continue;
      p.group.traverse(o => {
        if (!o.isMesh) return;
        const mats = Array.isArray(o.material) ? o.material : [o.material];
        for (const m of mats) { if (m.color) m.color.multiplyScalar(0.38); }
      });
    }
  },
  mappingPrefix: {
    'Spring':           'mainspring',
    'Balance':          'escapement',
    'Fork':             'escapement',
    'Impulse':          'escapement',
    'U':                'escapement',
    'TourbillonCage':   'cage',
    '29teeth':          'wheel-train',
    '38Teeth':          'wheel-train',
    '19Teeth':          'wheel-train',
    '19teeth':          'wheel-train',
    'Teeth-Stationary': 'wheel-train',
    'Wheel':            'wheel-train',
    'GearCap':          'wheel-train',
    'GearBridge':       'wheel-train',
    'Clutch':           'wheel-train',
    'Pulley':           'belt-drive',
    'Bowl':             'plates',
    'Post2X':           'plates',
    'Beam-':            'plates',
    'ShaftClip':        'plates',
    'CounterWeightCover': 'plates',
    'NameBridge':       'plates',
    'Jig':              'assembly-aids',
  },
  tour: ['mainspring', 'wheel-train', 'escapement', 'cage', 'belt-drive', 'plates', 'assembly-aids'],
  realPartIds: ['mainspring', 'escapement', 'cage', 'wheel-train', 'belt-drive', 'plates', 'assembly-aids'],
  parts: [
    { id: 'mainspring', zh: '打印主发条', en: 'PRINTED MAINSPRING', real: true,
      ex: [0, 1.8, 0.8], lo: [0, 1.2, 0], tag: '全机芯最不可能打印的零件',
      desc: '机械表的能量来源是一根被盘紧的弹簧钢——而这条主发条是 3D 打印的。它靠螺旋臂的弹性形变储能，打印方向必须顺着受力纹理，否则几十次上弦就会断裂。它是整个开源项目里"打印机极限"的象征：设计者为此迭代了多版截面形状。',
      specs: [['材料', '打印树脂/PLA（顺纹理）'], ['储能', '螺旋臂弹性形变'], ['迭代', '多版截面设计']] },
    { id: 'wheel-train', zh: '轮系', en: 'WHEEL TRAIN', real: true,
      ex: [0, 0.8, 1.8], lo: [0, 1.2, 0], tag: '29/38/19 齿 · 传动比写在零件上',
      desc: '从发条盒到擒纵轮的减速链：每个轮的齿数都直接命名在文件里（29 齿、38 齿、19 齌……），传动比不需要查表——数一数齿就知道。轮系末端把转速降到擒纵机构需要的节奏，任何一颗轮的毛刺都会让整表停摆。',
      specs: [['齿数', '29 / 38 / 19（文件名即参数）'], ['末端', '擒纵轮'], ['公差', '毛刺即停摆']] },
    { id: 'escapement', zh: '擒纵机构', en: 'SWISS LEVER ESCAPEMENT', real: true,
      ex: [-1.6, 1.6, 0.4], lo: [0, 1.2, 0], tag: '摆轮 + 叉瓦 + 冲击销',
      desc: '瑞士杠杆式擒纵：摆轮游丝系统以固定周期振荡，擒纵叉的两颗叉瓦交替锁住擒纵轮并释放能量，冲击销把每一拍"滴答"传回摆轮。它与本项目已有的瑞士杠杆式擒纵教具同构——但这里每一颗零件都从打印机里出来。',
      specs: [['形式', '瑞士杠杆式'], ['周期', '摆轮游丝决定'], ['功能', '锁住-释放-补能']] },
    { id: 'cage', zh: '陀飞轮框架', en: 'TOURBILLON CAGE', real: true,
      ex: [0, 2.4, -0.8], lo: [0, 1.4, 0], tag: '每分钟自转一周的重力平均器',
      desc: '陀飞轮框架把擒纵机构和摆轮整个装进去，每分钟自转一周——重力把走时快慢"往一个方向拉"的效应被旋转平均掉。三段框架（主架/O 型架/A 型架）的打印姿态与配重决定旋转是否平稳：框架偏一丝，一分钟的自转就会肉眼可见地抖。',
      specs: [['自转', '1 圈/分钟'], ['结构', '主架 + O 架 + A 架'], ['难点', '配重与打印姿态']] },
    { id: 'belt-drive', zh: '皮带传动', en: 'BELT DRIVE', real: true,
      ex: [1.4, 0.2, -1.4], lo: [0, 1.0, -0.4], tag: '微型皮带替代齿轮啮合',
      desc: '这只机芯不用齿轮互相啮合传递动力，而是用微型皮带与带轮——打印件最怕齿隙与毛刺，皮带传动把误差"柔性化"。带轮与轴承座一体打印，皮带的张力决定了轮系是否打滑：太松走不起来，太紧加速磨损。',
      specs: [['形式', '微型皮带 + 带轮'], ['优点', '柔性化打印误差'], ['调试', '皮带张力']] },
    { id: 'plates', zh: '主夹板与结构件', en: 'PLATES & FRAMES', real: true,
      ex: [0, -1.4, 0.4], lo: [0, 1.1, 0], tag: '所有轴承位的家',
      desc: '上下主夹板（Bowl 系列碗形件）确定每根轴的垂直位置——轴承孔的同心度是走时精度的地基。立柱、轴夹与配重盖把两层夹板锁成一个刚性框架；铭牌桥（NameBridge）兼作外观件。打印时轴承孔不加支撑，孔径公差直接决定轴是否卡死。',
      specs: [['组成', '碗形夹板 + 立柱 + 轴夹'], ['关键', '轴承孔同心度'], ['打印', '孔位无支撑成型']] },
    { id: 'assembly-aids', zh: '装配工装', en: 'ASSEMBLY JIG', real: true,
      ex: [1.5, -0.4, 1.6], lo: [0, 1.0, 0.4], tag: '开源硬件的诚意：连工装都给',
      desc: '随模型附带的装配夹具：把发条、轮系与夹板按顺序压装到位的定位工装。它不是手表的一部分，却是开源硬件精神的注脚——作者把"怎么装"也做成了文件。保留它在展馆里，是对所有开源设计者的致意。',
      specs: [['用途', '压装定位'], ['归属', '非佩戴部件'], ['意义', '开源可复现性']] },
  ],
});
