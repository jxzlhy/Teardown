/* =============================================================
   设备配置：Santa Cruz V10 速降山地车
   社区模型（Sketchfab · fdgasd7，CC-BY）：148 网格 / 28 材质，
   材质名即部件名（M_Frame / M_Fox40 / M_Cassette…），
   轮组与刹车碟前后共用材质 → mapByPosition 按 z 前后拆分；
   车头在 -Z（把横/前叉 z<0，飞轮/后拨 z>0）
============================================================= */
import { makeDevice } from './_kit/factory.js';

/* 节点名形如 'Cylinder.046_M_Wheel_1_0' —— 材质名嵌在 _M_ 与末尾序号之间 */
function matOf(name) {
  return name.replace(/^.*_M_/, '').replace(/_\d+$/, '');
}

export default makeDevice({
  id: 'santacruz-v10',
  name: 'Santa Cruz V10 速降山地车',
  en: 'SANTA CRUZ V10 DH',
  category: '自行车',
  brand: 'SANTA CRUZ',
  tagline: '碳纤维杠杆哲学 · 为坠山而生的链条避震',
  description: 'Santa Cruz V10 是速降世界杯（DH World Cup）赛场上资常青的战车之一，1990 年代末问世至今迭代七代。它的灵魂是 VPP（Virtual Pivot Point，虚拟摆点）后避震：两组短连杆让后轮在行程中走过一条精心设计的杠杆比曲线——起步蹬踏时刚度十足，大冲击时又软得像枕头上山。全套 Fox 40 双冠前叉 + DHX2 后避震、Shimano 碟刹与 11-25T 密比飞轮，全车为「从山上摔下来还活着」这一个目标服务。',
  specs: [
    ['定位', '速降赛（Downhill DH）专用'],
    ['车架', '碳纤维前三角 + 铝后摇（7 代）'],
    ['避震', 'Fox DHX2 后避震，行程 ~215mm'],
    ['前叉', 'Fox 40 双冠，行程 203mm'],
    ['变速', 'Shimano DH 单盘 7 速'],
    ['刹车', 'Shimano 4 活塞碟刹 203mm'],
    ['几何', '低跨高 · 长轴距 · 头管松弛'],
    ['来源', '社区模型（Sketchfab · CC-BY）'],
  ],
  accent: '#ff5a1f',
  source: '社区模型（Sketchfab）',
  modelCredit: 'Santa Cruz V10 Downhill Mountain Bicycle by fdgasd7 (Sketchfab, CC-BY)',
  modelSource: 'https://sketchfab.com/3d-models/santa-cruz-v10-downhill-mountain-bicycle-65e16e9785de4a019e35f599e47c9ee6',
  targetWidth: 13,
  camDist: 1.15,
  normalize: 'full',
  frontAxis: '-z',
  glb: '/assets/santacruz-v10.glb',
  /* 策展导览：车架→避震系统→前叉→操控→传动→制动→轮组→线管 */
  tour: ['frame','rear-shock','linkage','fork','cockpit','saddle','crankset','chain','cassette','rear-derailleur','chainguide','pedals','front-brake','rear-brake','front-wheel','rear-wheel','cables'],
  xrayShellIds: ['frame','fork','rear-shock','cockpit'],
  mapByPosition(name, p, rel) {
    const mat = matOf(name);
    const front = rel.z < 0.5;
    const wheelish = { Wheel_1: 1, Wheel_2: 1 };
    if (wheelish[mat]) return front ? 'front-wheel' : 'rear-wheel';
    if (mat.startsWith('ShimanoBrake') || mat.startsWith('BrakeCaliper')) return front ? 'front-brake' : 'rear-brake';
    if (mat === 'RearBrakeAdapter') return 'rear-brake';
    const table = {
      Frame: 'frame', SantaCruzBadge: 'frame', Cable: 'cables',
      Fox40_1: 'fork', Fox40_2: 'fork',
      FoxDHX2: 'rear-shock',
      MetalOrange: 'linkage',
      HandleBars: 'cockpit', Stem: 'cockpit', Shifter: 'cockpit', BrakeLever: 'cockpit',
      Seat: 'saddle',
      Crankset1: 'crankset', Crankset2: 'crankset',
      Chain: 'chain', Chainguide: 'chainguide',
      Cassette: 'cassette', Cassette_1: 'cassette',
      RearDerailleur_1: 'rear-derailleur', RearDerailleur_2: 'rear-derailleur',
      Pedals: 'pedals',
    };
    return table[mat] || 'frame';
  },
  realPartIds: ['frame', 'fork', 'rear-shock', 'linkage', 'front-wheel', 'rear-wheel',
    'front-brake', 'rear-brake', 'cockpit', 'saddle', 'crankset', 'chain', 'chainguide',
    'cassette', 'rear-derailleur', 'pedals', 'cables'],
  parts: [
    { id: 'frame', zh: '碳纤维车架', en: 'CARBON FRAME', real: true,
      ex: [0, 0.2, 1.6], lo: [0, 1.4, 0], tag: 'VPP 避震平台的上半身',
      desc: 'V10 车架：碳纤维前三角 + 铝合金后摇臂，头管角松弛（约 62–63°）、轴距超长——几何全部为高速下坡稳定服务。上管走内布线，五通与主转点区域碳布堆叠得最厚，那是全车受力最凶的位置。',
      specs: [['前三角', '碳纤维'], ['后摇', '铝合金'], ['头管角', '~62.5°'], ['轴距', '~1275mm（S4）']] },
    { id: 'fork', zh: 'Fox 40 双冠前叉', en: 'FOX 40 FORK', real: true,
      ex: [0, 0.5, -1.8], lo: [0, 1.4, 0], tag: '203mm 行程 · 双夹持刚度',
      desc: 'Fox 40：速降标志性的双肩（double crown）前叉——两只叉冠把转向管上下夹死，换来刚性到「死板」的指向精度，配 203mm 行程的 Grip2 阻尼芯（高速/低速压缩回弹独立可调）。公路车追求轻，它只在乎「撞石头不改方向」。',
      specs: [['行程', '203mm'], ['结构', '双冠 36 棘管'], ['阻尼', 'Grip2 高低速独立'], ['重量', '~2.6kg（故意不省）']] },
    { id: 'rear-shock', zh: 'Fox DHX2 后避震', en: 'FOX DHX2 SHOCK', real: true,
      ex: [0, 1.1, 0.5], lo: [0, 1.3, 0], tag: '线圈弹簧 · 215mm 行程心脏',
      desc: 'DHX2 油气+线圈弹簧后避震：钢质 coil 弹簧提供线性行程，HSB 高速压缩阀防打底，回弹低速可调。速降选手偏爱 coil 的「贴地感」——空气弹簧轻，但线圈弹簧在连续乱石里的置信度无可替代。',
      specs: [['行程', '215mm（车轮侧）'], ['弹簧', '钢 coil，按体重选磅数'], ['阻尼', 'HSB 高速压缩阀'], ['调校', 'SAG 30% 起步']] },
    { id: 'linkage', zh: 'VPP 虚拟摆点连杆', en: 'VPP LINKAGE', real: true,
      ex: [0.3, 1.6, 0.2], lo: [0, 1.2, 0], tag: '两条短杆 · 避震曲线作者',
      desc: 'VPP 连杆组：后摇臂不直接挂在主转点上，而是挂在两根短连杆的「交点延长线」上——虚拟摆点。摆点在行程中会移动，于是后轮的杠杆比曲线可以被「画」出来：初段抗蹬踏、中段线性、末段渐进防打底。这是 Santa Cruz 的看家专利。',
      specs: [['专利', 'VPP Virtual Pivot Point'], ['行程曲线', '前抗踏后渐进'], ['轴承', '全密封 Enduro 轴承'], ['保养', '异响第一嫌疑人']] },
    { id: 'front-wheel', zh: '前轮组', en: 'FRONT WHEEL', real: true,
      ex: [0, 0.3, -2.6], lo: [0, 1.3, 0], tag: '27.5" · 定向胎面朝前',
      desc: '前轮：27.5" 轮径配 2.5" 宽齿胎，胎面定向花纹负责把石头「咬」成前进力；桶轴固定保证拆装刚度。前轮负责转向抓地——它的抓地力上限就是过弯速度上限。',
      specs: [['轮径', '27.5"'], ['胎宽', '~2.5" 钉胎'], ['前花鼓', '20mm 桶轴'], ['胎压', '~1.4–1.8 bar（低到离谱）']] },
    { id: 'rear-wheel', zh: '后轮组', en: 'REAR WHEEL', real: true,
      ex: [0, 0.3, 2.6], lo: [0, 1.3, 0], tag: '驱动与冲击的双重受难地',
      desc: '后轮：同时承受驱动力矩与落地冲击，辐条张力配得比前轮高；花鼓塔基带棘轮离合，反蹬不空转。速降后轮的报废率远高于前轮——它是这台车上真正的耗材。',
      specs: [['轮径', '27.5"'], ['塔基', 'Micro Spline 7 速'], ['辐条', '高张力直拉'], ['寿命', '赛季级耗材']] },
    { id: 'front-brake', zh: '前碟刹', en: 'FRONT BRAKE', real: true,
      ex: [0.4, 0.1, -1.9], lo: [0, 1.2, 0], tag: '203mm 碟盘 · 减速主力',
      desc: '前刹车：203mm 通风碟盘 + 4 活塞卡钳。速降 70% 制动力来自前轮（重心前压时后轮几乎抱死漂浮），前碟的排热能力直接决定长陡坡的「手刹衰减」程度——矿物油与烧结金属来令片是标准答案。',
      specs: [['碟盘', '203mm'], ['卡钳', '4 活塞'], ['来令片', '烧结金属'], ['油液', '矿物油']] },
    { id: 'rear-brake', zh: '后碟刹', en: 'REAR BRAKE', real: true,
      ex: [-0.4, 0.1, 1.9], lo: [0, 1.2, 0], tag: '姿态控制器',
      desc: '后刹车：同规格 203mm 碟盘，但速降里它的角色更接近「姿态控制」——压弯前把后轮滑起来甩尾、出弯前拉直车身，全靠后刹的手感。转接座负责把卡钳对中到 IS 标准座。',
      specs: [['碟盘', '203mm'], ['卡钳', '4 活塞'], ['角色', '滑胎 / 调姿态'], ['转接座', 'IS → PM']] },
    { id: 'cockpit', zh: '车把操控组', en: 'COCKPIT', real: true,
      ex: [0, 1.6, -1.2], lo: [0, 1.3, 0], tag: '把横 + 立管 + 指拨 + 刹把',
      desc: '操控组：800mm 宽把横提供杠杆力，短立管把姿态拉高拉直，指拨与刹把的位置差以毫米计——速降车把上的每一件东西都要在手套里盲操作。刹把行程可调到「一根手指」刹停。',
      specs: [['把横', '~800mm 抬升把'], ['立管', '~45mm 短立'], ['指拨', 'DH 专用短行程'], ['刹把', '单指可调行程']] },
    { id: 'saddle', zh: '车座', en: 'SADDLE', real: true,
      ex: [0, 1.3, 1.0], lo: [0, 1.2, 0], tag: '坐得少 · 挡得多',
      desc: '车座：速降车座 90% 的时间不是用来坐的——它压在两腿之间是过弯时的「第三接触点」，下坡站姿时是方位感参照。所以 DH 座又窄又硬又耐磨，鼻头下削防勾裤。',
      specs: [['形态', '窄硬耐磨'], ['实际用途', '腿间参照物'], ['坐垫比', '坐的时间 <10%'], ['导轨', '合金 / 钛']] },
    { id: 'crankset', zh: '牙盘曲柄', en: 'CRANKSET', real: true,
      ex: [0.5, -0.3, 0.6], lo: [0, 1.1, 0], tag: '单盘 34T · 只为下坡',
      desc: '牙盘组：单盘窄窄 34–36T，两侧装防脱链环——速降不需要爬坡挡位，需要的是落地时链条不打出来。曲柄短（165mm）增加离地间隙，踩踏点过石头的「触底率」更低。',
      specs: [['盘片', '单盘 ~34T + 防脱环'], ['曲柄', '165mm 短柄'], ['牙盘材质', '钢 / 7075 铝'], ['目标', ' never 落链']] },
    { id: 'chain', zh: '链条', en: 'CHAIN', real: true,
      ex: [0, -0.9, 0.6], lo: [0, 1.0, 0], tag: '11 速链条 · 全车最忙的钢件',
      desc: '链条：把蹬踏力传到塔基的唯一通道，在速降里还要忍受「落地瞬间突然卸力」的鞭打。上导板+下导板的链导系统让它全程被夹着走，链条张力器（clutch 后拨）负责收余振。',
      specs: [['速别', 'DH 7/11 速'], ['链导', '上下导板夹持'], ['工况', '冲击 + 鞭打'], ['检查', '每两场测伸长']] },
    { id: 'chainguide', zh: '链导板', en: 'CHAIN GUIDE', real: true,
      ex: [0.2, -1.7, 0.2], lo: [0, 1.0, 0], tag: '上导板 + 下导板',
      desc: '链导系统：ISCG05 标准座上的上导板死死压住链条不让它弹离牙盘，下导板托底防甩入。没有它，一次大落地就可能「炸链」终结比赛——它让单盘速降成为可能。',
      specs: [['标准', 'ISCG05 座'], ['组成', '上导板 + 下托'], ['跳链防护', '结构级'], ['重量', '毫不心疼']] },
    { id: 'cassette', zh: '飞轮', en: 'CASSETTE', real: true,
      ex: [-0.5, -0.4, 2.2], lo: [0, 1.0, 0], tag: '11-25T 密比 · 速度区间很窄',
      desc: '飞轮：DH 飞轮速比区间极窄（如 11-25T）——反正上坡靠推车，下坡只用 3 个挡。密比的意义是每次换挡节奏不断，出弯加速不「断档」。',
      specs: [['速比', '11-25T（示例）'], ['速数', '7 速（DH 规格）'], ['塔基', 'Micro Spline'], ['哲学', '区间窄 = 节奏稳']] },
    { id: 'rear-derailleur', zh: '后变速器', en: 'REAR DERAILLEUR', real: true,
      ex: [0.6, -1.5, 2.0], lo: [0, 1.0, 0], tag: 'clutch 张力器 · 链条稳压器',
      desc: '后拨：带离合（clutch）的张臂——离合器给张臂加阻尼，链条再颠也不「弹琴」。DH 后拨还讲究「命中即换」：一次拨杆动作必须干脆地跨两个飞轮片，容不得半犹豫。',
      specs: [['离合', '张力阻尼 clutch'], ['导轮', '11–13T 大导轮'], ['护框', '可拆防撞框'], ['换挡', '一次跨双片']] },
    { id: 'pedals', zh: '脚踏', en: 'PEDALS', real: true,
      ex: [0.7, -1.1, 0.1], lo: [0, 1.0, 0], tag: '平面钉脚踏 · 随时可逃生',
      desc: '平台钉脚踏：大面积铝合金本体 + 可换钢钉，钉子咬住鞋底——速降几乎不用锁踏，因为摔车时「人与车分离」是保命设计。薄本体（~15mm）降低重心并减少磕石。',
      specs: [['类型', '平台钉踏'], ['本体', '铝合金 ~15mm 薄'], ['钢钉', '可换可调高'], ['为什么不上锁', '保命第一']] },
    { id: 'cables', zh: '线管组', en: 'CABLE HOUSING', real: true,
      ex: [0, 1.9, -0.4], lo: [0, 1.2, 0], tag: '变速/刹车线管 · 半内走',
      desc: '线管组：刹车油管与变速线半内走——车架内走大段，摇臂活动段外露并留冗余弧度。速降车的线管是最容易被泥浆糊住的部位之一，走位既要防蹭石，也要防被树枝「拔管」。',
      specs: [['刹车', '油管（矿物油）'], ['变速', '机械线芯'], ['走位', '半内走 + 冗余弧'], ['隐患', '树枝勾拉']] },
  ],
});
