/* =============================================================
   设备配置：Royal 打字机（1930s 机械打字机）
   社区模型（Sketchfab · topfrank2013，CC-BY）：11 网格 /
   11 材质全命名（Royal_typewriter_* / Metal_Chrome…）
   键盘在 +Z → frontAxis 默认 +z；原型为 Royal Aristocrat 一代
============================================================= */
import { makeDevice } from './_kit/factory.js';

/* 机身黑漆纹理近纯黑，暗厅里圆顶隐形：把漫反射贴图借给自发光通道，
   让机体以暗灰浮雕感显形（不改资产，仅运行时材质补偿） */
function lift(pid, level) {
  return ({ partsById }) => {
    const p = partsById[pid]; if (!p) return;
    p.group.traverse(o => {
      if (!o.isMesh) return;
      const mats = Array.isArray(o.material) ? o.material : [o.material];
      for (const m of mats) {
        if (!m.map) continue;
        if (!m.emissiveMap) { m.emissiveMap = m.map; m.emissive.setScalar(level); }
      }
    });
  };
}

export default makeDevice({
  id: 'royal-typewriter',
  era: '1930s',
  name: 'Royal 打字机',
  en: 'ROYAL TYPEWRITER',
  category: '打字机',
  brand: 'ROYAL',
  tagline: '每一下敲击都是一次纯机械的排版',
  description: 'Royal 是 20 世纪美国打字机三巨头之一（与 Underwood、Remington 齐名），这台 1930 年代的无背带式（desktop）机型是它的黄金时代产品：按下琴键，键杆（typebar）像扇面一样弹起击打墨带前方的滚筒——字形是反向铸在键杆头上的，敲击的瞬间才变成正向。全机没有一个电子元件：空格、回车、换行、大小写切换，全部由弹簧、凸轮与杠杆完成。它生产了四十余年，QWERTY 布局借它这类机器钉进了全人类的肌肉记忆。',
  specs: [
    ['年代', '1930s（Royal 黄金时代）'],
    ['结构', '键杆扇面击打 · 色带升降'],
    ['键位', 'QWERTY + 四排琴键'],
    ['动力', '纯机械（弹簧 + 杠杆）'],
    ['滚筒', '橡胶 platen，手柄换行'],
    ['字距', '10/12 cpi 可选'],
    ['来源', '社区模型（Sketchfab · CC-BY）'],
  ],
  accent: '#2dd4bf',
  source: '社区模型（Sketchfab）',
  modelCredit: 'Typewriter (Royal) by topfrank2013 (Sketchfab, CC-BY；原模型页已下架，链接为作者主页)',
  modelSource: 'https://sketchfab.com/topfrank2013',
  targetWidth: 10.5,
  camDist: 1.2,
  normalize: 'full',
  glb: '/assets/royal-typewriter.glb',
  tour: ['body','keys','typebars','platen','ribbon-mech','ribbon','paper-support','paper-scale','paper','nameplate'],
  xrayShellIds: ['body'],
  /* three.js GLTFLoader sanitizeNodeName：节点名空格→下划线（'17 - Default' → '17_-_Default'） */
  mapping: {
    'Bodymy01_17_-_Default_0': 'body',
    'Neri_Royal_typewriter_Buttons_0': 'keys',
    'Neri_Royal_typewriter_Plastic_0': 'paper-support',
    'Neri_Metal_Chrome_0': 'typebars',
    'Neri_Royal_typewriter_Rubber_0': 'platen',
    'Neri_Royal_typewriter_Measure_0': 'paper-scale',
    'Neri_Royal_typewriter_Tape_0': 'ribbon',
    'Neri_Royal_typewriter_Paper_0': 'paper',
    'Targa_Material_#51_0': 'nameplate',
    'Logo_Royal_typewriter_Label_0': 'nameplate',
    'Neri_Royal_typewriter_Metal_black_0': 'ribbon-mech',
  },
  realPartIds: ['body', 'keys', 'paper-support', 'typebars', 'platen', 'paper-scale',
    'ribbon', 'paper', 'nameplate', 'ribbon-mech'],
  postLoad: (ctx) => {
    lift('body', 0.5)(ctx);
    lift('platen', 0.35)(ctx);
    lift('ribbon-mech', 0.4)(ctx);
    lift('typebars', 0.25)(ctx);
    lift('paper-support', 0.3)(ctx);
  },
  parts: [
    { id: 'body', zh: '机身与键杆机构', en: 'BODY & MECHANISM', real: true,
      ex: [0, 0, 1.4], lo: [0, 1.4, 0], tag: '铸铁骨架 · 几百根杠杆的家',
      desc: '机身：铸铁/钢骨架，里面塞着键杆扇面、拉杆、凸轮与弹簧组——按下琴键到字头击打滚筒，力要经过 3–4 级杠杆放大。Royal 的机身涂装（绿纹烤漆 + 镀铬件）是 30 年代装饰艺术风的代表。',
      specs: [['结构', '铸铁骨架 + 扇面键杆'], ['键杆数', '~44 根（含符号）'], ['涂装', '装饰艺术烤漆'], ['重量', '10kg 级（抬不动的那种）']] },
    { id: 'keys', zh: '琴键键盘', en: 'KEYBOARD', real: true,
      ex: [0, -0.6, 2.4], lo: [0, 1.2, 0], tag: '四排 QWERTY · 玻璃圆键',
      desc: '琴键：四排布局（QWERTY 于第三排），金属键杆顶着圆形键帽——这一代 Royal 用黑玻璃键帽白字圈，指感清脆。键程深、回弹靠盘簧，连续打字是正经的「手指力量训练」。Shift 与空格条是仅有的两根「横杆」。',
      specs: [['排布', '四排 QWERTY'], ['键帽', '玻璃圈边'], ['Shift', '双向换挡'], ['空格', '前移空格条']] },
    { id: 'typebars', zh: '键杆扇面', en: 'TYPEBAR BASKET', real: true,
      ex: [0, 1.8, -0.6], lo: [0, 1.3, 0], tag: '倒立字模 · 击打瞬间成字',
      desc: '键杆扇面：每根键杆末端反向铸着一个字模，平时收拢成「篮子」竖在滚筒上方；击发时沿扇形弧线弹起砸向墨带。字要对准滚筒上的击打点（type guide），几十根杆的弧线公差全靠装配师傅的手感。',
      specs: [['字模', '反向铸造'], ['击打点', 'type guide 单点'], ['纠偏', '弧线 + 导槽'], ['卡杆', '快打时的经典故障']] },
    { id: 'platen', zh: '滚筒', en: 'PLATEN', real: true,
      ex: [0.6, 2.3, 0.8], lo: [0, 1.2, 0], tag: '橡胶钢芯 · 纸张的握持者',
      desc: '滚筒（platen）：钢芯包硬橡胶的圆柱，纸张绕着它卷入，字头隔着墨带打在它身上——橡胶的弹性让印痕均匀又不穿透纸。换行时它绕轴转一格（行距棘轮），松开把手还能左右滑动做粗定位。',
      specs: [['结构', '钢芯 + 硬橡胶'], ['行距', '棘轮 1/1.5/2 可选'], ['滑动', '左右自由定位'], ['老化', '橡胶硬化是老机通病']] },
    { id: 'paper-support', zh: '纸架', en: 'PAPER SUPPORT', real: true,
      ex: [-0.6, 1.0, -1.6], lo: [0, 1.2, 0], tag: '托住 A4 的优雅弧板',
      desc: '纸架：滚筒后方的弧形托板，接住卷出来的纸并让它保持平整——打长文时纸不会「甩尾巴」。许多型号纸架兼作提手（机器两侧的卷边把手），Royal 的弧线纸架是它上照度最高的部件。',
      specs: [['形态', '弧形托板'], ['副业', '兼提手（部分型号）'], ['调平', '随滚筒角度联动'], ['装饰', '烤漆同色']] },
    { id: 'paper-scale', zh: '纸边卡尺', en: 'PAPER SCALE', real: true,
      ex: [-1.7, 2.6, -1.2], lo: [0, 1.2, 0], tag: '对齐页边距的刻度尺',
      desc: '纸边卡尺：纸架前的金属刻度尺，与滚筒上的指针配合读出「当前行打到第几格」——设定页边距、对齐抬头全靠它。打字没有「光标」，这把尺就是唯一的视觉参照。',
      specs: [['刻度', '字符格 / 英寸'], ['配合', '滚筒指针'], ['用途', '页边距 / 居中'], ['移动', '随滚筒滑动']] },
    { id: 'ribbon-mech', zh: '色带机构', en: 'RIBBON MECHANISM', real: true,
      ex: [0.8, 0.2, 1.8], lo: [0, 1.2, 0], tag: '双轴卷带 · 黑红双色切换',
      desc: '色带机构：两个卷轴之间的尼龙/丝绸墨带，击打时自动换向收放；杆上的双色切换钮决定让字的哪一面蹭过墨带——黑或红。墨带靠棘轮步进，用完换一条即可，是这个「打印机」唯一的耗材。',
      specs: [['色带', '0.5 英寸尼龙/丝绸'], ['双色', '黑 / 红切换'], ['步进', '击打自动卷带'], ['反向', '到头自动反转']] },
    { id: 'ribbon', zh: '墨带', en: 'INK RIBBON', real: true,
      ex: [0, 2.6, 0.6], lo: [0, 1.1, 0], tag: '墨水的中介者',
      desc: '墨带：字头不直接碰纸——它隔着这条浸墨的带子击打，所以每个字都是「盖章」出来的。一条墨带大约能打十几万字，颜色由深变浅的过程就是这条带子的「进度条」。',
      specs: [['宽度', '~12.7mm'], ['寿命', '~10–20 万字'], ['颜色', '黑 / 红'], ['替换', '徒手可换']] },
    { id: 'paper', zh: '纸张', en: 'PAPER', real: true,
      ex: [-0.4, 2.0, -0.9], lo: [0, 1.2, 0], tag: '被排版的对象',
      desc: '纸张：从滚筒上沿卷入、卡尺定位、逐行上移——打字机把「纸」变成了流水线上的工件。这张纸上的每一行都对应一次滚筒棘轮的「咔哒」，一页纸 = 几十次换行手柄的全臂摆动。',
      specs: [['装夹', '滚筒缝 + 压纸轮'], ['对齐', '卡尺 + 指针'], ['行进', '换行棘轮步进'], ['规格', 'A4 / Letter']] },
    { id: 'nameplate', zh: '铭牌饰板', en: 'NAMEPLATE', real: true,
      ex: [0, -0.9, 2.2], lo: [0, 1.1, 0], tag: 'Royal 金标 · 机身正脸',
      desc: '正面饰板与 Royal 金色铭牌：机身正脸的金属面板，品牌徽标嵌在正中——30 年代的 Royal 徽标是一颗「会发光的玻璃宝珠」（Royal Signature 后改为皇冠标），是收藏家辨认年代的依据之一。',
      specs: [['材质', '镀铬 / 铝面板'], ['徽标', 'Royal 金标'], ['年代学', '徽标样式定年份'], ['装饰', '装饰艺术线条']] },
  ],
});
