/* =============================================================
   设备配置：手摇曲柄钻（Poly Haven · CC0 扫描）
   5 网格全命名（本体/双齿轮/曲柄/夹头）
============================================================= */
import { makeDevice } from './_kit/factory.js';

export default makeDevice({
  id: 'hand-drill',
  demos: [
    { partId: 'crank', label: '手摇曲柄旋转', spin: 'auto', speed: 2.5 },
  ],
  name: '手摇曲柄钻',
  en: 'VINTAGE HAND DRILL',
  category: '工具',
  brand: 'GENERIC',
  tagline: '没有电池的年代，转速全靠手腕',
  description: '手摇曲柄钻（eggbeater drill，打蛋器钻）：曲柄带动一对啮合齿轮增速，把每秒一圈的手腕变成主轴每秒十来圈的旋转——纯机械的「变速箱」只有两片齿轮，却管用了两百年。夹头用两片颚板夹住直柄钻头，尾部的轴承帽顶着掌心提供下压力。木工与模型师的工具墙上，它永远挂在电钻旁边：慢，但永远不会没电。',
  specs: [
    ['别名', '打蛋器钻 / Eggbeater Drill'],
    ['传动', '曲柄 → 齿轮对 → 主轴（约 3–4×增速）'],
    ['夹头', '两颚片 + 锁紧环'],
    ['用途', '木工 / 模型 / 精密小孔'],
    ['年代', '19 世纪中至今仍在产'],
    ['来源', 'Poly Haven（CC0 扫描）'],
  ],
  accent: '#b0503c',
  source: 'Poly Haven（CC0）',
  modelCredit: 'Vintage Hand Drill by Poly Haven (CC0)',
  modelSource: 'https://polyhaven.com/a/vintage_hand_drill',
  targetWidth: 8,
  normalize: 'full',
  glb: '/assets/hand-drill.glb',
  tour: ['crank','gears','chuck-head','body'],
  xrayShellIds: ['body'],
  mapping: {
    'vintage_hand_drill': 'body',
    'vintage_hand_drill_cog1': 'gears',
    'vintage_hand_drill_cog2': 'gears',
    'vintage_hand_drill_crank': 'crank',
    'vintage_hand_drill_head': 'chuck-head',
  },
  realPartIds: ['body', 'gears', 'crank', 'chuck-head'],
  /* AURORA 后/V5.1 内容深度：手摇曲柄钻传动链——曲柄→齿轮增速/换向→钻夹头（人力输入）。 */
  mech: { edges: [
    { id:'gm-crank-gears', type:'gear_mesh', from:'crank', to:'gears', kinematic:'exact',
      note:'曲柄直驱输入齿轮，经齿轮系增速换向（人力输入，速比未标定不作数值声明）' },
    { id:'sh-gears-chuck', type:'shaft_coupling', from:'gears', to:'chuck-head', kinematic:'exact',
      note:'输出齿轮经主轴同轴耦合驱动钻夹头' },
    { id:'bs-body-gears', type:'bearing_support', from:'body', to:'gears', kinematic:'exact',
      note:'齿轮系轴支承于机身轴孔' },
  ] },
  parts: [
    { id: 'body', zh: '本体与主轴', en: 'FRAME & SPINDLE', real: true,
      ex: [0, 0, 0.8], lo: [0, 1.2, 0], tag: '铸铁框架 · 手感即精度',
      desc: '本体：铸铁/钢制框架夹着主轴——主轴在框架两端的轴承里转动，直不直全看这两孔的同心度。框架中部的大圆孔穿曲柄轴，尾部轴承帽顶住掌心。整把工具没有任何电子件，保养就一条：上油。',
      specs: [['结构', '框架 + 两端轴承'], ['主轴', '同心度定精度'], ['保养', '定期上油'], ['寿命', '传两代人']] },
    { id: 'gears', zh: '增速齿轮对', en: 'GEAR PAIR', real: true,
      ex: [-1.3, 0.9, 0.3], lo: [0, 1.1, 0], tag: '一大一小 · 手腕的增速器',
      desc: '齿轮对：曲柄上的大齿轮啮合主轴小齿轮，齿数比约 3–4:1——手腕转一圈，钻头转三四圈。这对开式齿轮没有任何防护罩，油泥里偶尔夹着木屑；它的啮合手感是判断一把老钻「还活着」的听诊器。',
      specs: [['齿比', '~3–4:1 增速'], ['形态', '开式直齿轮'], ['润滑', '黄油薄涂'], ['听诊', '啮合声辨状态']] },
    { id: 'crank', zh: '曲柄摇把', en: 'CRANK HANDLE', real: true,
      ex: [1.5, -0.3, -0.4], lo: [0, 1.1, 0], tag: '动力输入端 · 圆头旋木柄',
      desc: '曲柄：偏心轴 + 旋木手柄——手腕沿圆周发力，圆头木柄让掌心不打滑。曲柄半径决定力矩与转速的取舍：半径越大越省力越慢。摇 «匀速» 是个手艺活，忽快忽慢的转速会在孔壁留下螺旋纹。',
      specs: [['结构', '偏心轴 + 木柄'], ['发力', '圆周匀速'], ['取舍', '半径 = 力矩×转速'], ['手感', '匀速出光孔']] },
    { id: 'chuck-head', zh: '夹头', en: 'CHUCK HEAD', real: true,
      ex: [0, -1.6, 0.6], lo: [0, 1.0, 0], tag: '两颚片 · 夹住一切直柄钻头',
      desc: '夹头：主轴末端的两片颚板 + 锁紧环——插进直柄钻头，旋紧环锁死。相比三爪夹头它更简单耐造，但定心稍逊；尾部轴承帽在手摇时用掌心顶住，提供下压力的同时跟着空转，不磨手心。',
      specs: [['结构', '双颚 + 锁紧环'], ['适配', '0.5–8mm 直柄钻'], ['尾帽', '掌心轴承顶'], ['换头', '徒手十秒']] },
  ],
});
