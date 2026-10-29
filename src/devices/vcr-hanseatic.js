/* =============================================================
   设备配置：Hanseatic VCR 200 录像机
   社区模型（Sketchfab · AleixoAlonso，CC-BY）：45 网格全匿名
   （Object_N），但 5 组材质有语义 → materialMapping 分部件；
   前面板（带仓/按键）在 +Z 侧
============================================================= */
import { makeDevice } from './_kit/factory.js';

export default makeDevice({
  id: 'vcr-hanseatic',
  name: 'Hanseatic VCR 200 录像机',
  en: 'HANSEATIC VCR 200',
  category: '影音',
  brand: 'HANSEATIC',
  tagline: '上磁带、按播放，全家等你三秒',
  description: 'Hanseatic 是德国汉堡百货帝国 Kaufhof 的自有电器品牌，这台 VCR 200 是八十年代进入西德千家万户的 VHS 录像机：上置式带仓吞下一盘 VHS 带，磁鼓以 1500rpm 旋转，两个磁头斜着扫过磁带扫出影像——录像机是那个时代家里最精密的机电装置，「调定时录像」曾是一代人的家庭科技挑战。',
  specs: [
    ['制式', 'VHS · PAL'],
    ['磁鼓', '双磁头 ~1500rpm 螺旋扫描'],
    ['走带', 'M 型绕带加载'],
    ['画质', '~240 线 · SP 2 小时'],
    ['特征', '上置带仓 · 机械按键'],
    ['来源', '社区模型（Sketchfab · CC-BY）'],
  ],
  accent: '#8f9bb3',
  source: '社区模型（Sketchfab）',
  modelCredit: 'VCR (Hanseatic VCR 200) by AleixoAlonso (Sketchfab, CC-BY)',
  targetWidth: 12,
  normalize: 'full',
  glb: '/assets/vcr-hanseatic.glb',
  materialMapping: {
    'ELX0002_Body': 'case',
    'ELX0002_Parts': 'front-panel',
    'ELX0002_Circuit_Board_COL': 'pcb',
    'ELX0002_Mechanisms_COL': 'mechanism',
    'ELX0002_Plastic_Red': 'red-parts',
  },
  realPartIds: ['case', 'front-panel', 'pcb', 'mechanism', 'red-parts'],
  parts: [
    { id: 'case', zh: '机壳与带仓', en: 'CASE & LOADER', real: true,
      ex: [0, 0, 0], lo: [0, 1.3, 0], tag: '银灰铁壳 · 上置吞带口',
      desc: '机壳：一体冲压铁壳，顶面开口是上置式带仓——VHS 带从上面「吞」进去，由加载架接住下放。八十年代录像机是这个体积不是因为它需要，而是因为「越大的机器越配得上录像机这个身份」。',
      specs: [['结构', '冲压铁壳 + 塑料面板'], ['带仓', '上置 Top-Loading'], ['风道', '侧壁栅格排热'], ['重量', '~7kg（压得住桌子的那种）']] },
    { id: 'front-panel', zh: '按键面板', en: 'FRONT PANEL', real: true,
      ex: [0, 0.4, 2.2], lo: [0, 1.2, 0], tag: '机械键排 · 带计数器',
      desc: '面板：一排真实的机械自锁按键——REW/PLAY/FF/STOP/REC，按下去「咔哒」一声那是真实的杠杆在切换机芯状态；副面板上的机械计数器一格一格数走带长度，定时录像要对着它校零。',
      specs: [['按键', '机械自锁式'], ['计数', '机械轮计数器'], ['定时', '旋钮式 OTR'], ['手感', '每颗键 = 一根杠杆']] },
    { id: 'pcb', zh: '电路板', en: 'MAIN PCB', real: true,
      ex: [0, 2.2, 0], lo: [0, 1.2, 0], tag: '伺服大脑 · 卧在机芯之下',
      desc: '主电路板：伺服电路是录像机的心脏——磁鼓 1500 转与走带速度必须锁相到「磁头每次都扫在同一条磁迹上」，靠的是对比磁头切换脉冲与控制磁迹（CTL）信号的相位误差并实时修正。板上那排可调电感/电位器是维修技师的「伺服校准阵」。',
      specs: [['核心', '鼓伺服 + 带伺服锁相'], ['基准', 'CTL 控制磁迹'], ['校准', '示波器看切换点'], ['芯片', '早期专用 ASIC 前夜']] },
    { id: 'mechanism', zh: '走带机构', en: 'TAPE MECHANISM', real: true,
      ex: [0, -1.8, 0], lo: [0, 1.2, 0], tag: '磁鼓 · 导柱 · 压带轮',
      desc: '走带机构：录像机的机械精华——斜置的磁鼓、M 型绕带的加载环、阻尼轮、全抹磁头、音控磁头一字排开；加载时两根导柱沿弧线把磁带从带盒里「拽」出来包住磁鼓，动作行云流水且从不失误，直到磁带受潮发粘。',
      specs: [['磁鼓', 'φ62mm 双磁头'], ['加载', 'M 型绕带'], ['音控', 'A/C 磁头组件'], ['天敌', '受潮磁带粘连']] },
    { id: 'red-parts', zh: '红色 REC 件', en: 'RED ACCENTS', real: true,
      ex: [0.9, 0.8, 1.6], lo: [0, 1.1, 0], tag: '红色 = 录像警示色',
      desc: '红色件：REC 录像键与红色指示窗——家电行业惯例用红色标注「会抹掉东西/产生法律责任」的操作。录像键通常要求两键同按才能触发，就是防熊孩子一指头抹掉全家福。',
      specs: [['角色', 'REC 键 + 指示'], ['惯例', '红=录制/抹除'], ['防呆', '双键同按触发'], ['记忆点', '亮红 REC 灯']] },
  ],
});
