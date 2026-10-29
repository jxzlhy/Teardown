/* =============================================================
   设备配置：数字腕表（Poly Haven · CC0 扫描）
   4 网格全命名（本体/表扣/上带/下带）
============================================================= */
import { makeDevice } from './_kit/factory.js';

export default makeDevice({
  id: 'digital-watch',
  name: '数字腕表',
  en: 'DIGITAL WRIST WATCH',
  category: '穿戴',
  brand: 'GENERIC',
  tagline: '一排七段数码管 · 时间的工业美学',
  description: '七十年代开始的数字腕表革命：用一块液晶屏取代几十个齿轮——按一下侧键，时间就变成四个会闪烁的数字。它没有擒纵与游丝，走时靠石英振荡器 32768 Hz 的分频；「比机械表准一百倍、便宜十倍」的它，曾在瑞士钟表业掀起一场石英危机。',
  specs: [
    ['时代', '1970s 石英革命'],
    ['显示', 'LCD 七段数码'],
    ['走时', '石英 32768Hz 分频'],
    ['精度', '±15 秒/月级'],
    ['结构', '表体 + 双表带 + 折叠扣'],
    ['来源', 'Poly Haven（CC0 扫描）'],
  ],
  accent: '#7fd1c0',
  source: 'Poly Haven（CC0）',
  modelCredit: 'Digital Wrist Watch by Poly Haven (CC0)',
  modelSource: 'https://polyhaven.com/a/digital_wrist_watch',
  targetWidth: 7,
  normalize: 'full',
  glb: '/assets/digital-watch.glb',
  mapping: {
    /* 重名节点运行时回退为网格名 Plane008（表体双网格），见 __RAW.names */
    'Plane008': 'case',
    'Plane008_1': 'case',
    'digital_wrist_watch_clasp': 'clasp',
    'digital_wrist_watch_strap_a': 'strap-a',
    'digital_wrist_watch_strap_b': 'strap-b',
  },
  realPartIds: ['case', 'clasp', 'strap-a', 'strap-b'],
  parts: [
    { id: 'case', zh: '表体与液晶屏', en: 'CASE & LCD', real: true,
      ex: [0, 0.4, 0.8], lo: [0, 1.2, 0], tag: '石英机芯 · 七段数码',
      desc: '表体：塑料/金属壳里是石英机芯——电池给振荡电路供电，32768 Hz 的石英音叉经 15 级二分频变成 1 秒脉冲，驱动步进小马达或直接点亮 LCD。没有齿轮系，意味着没有润滑与磨损，这是它便宜又准的全部秘密。',
      specs: [['核心', '石英振荡 + 分频'], ['显示', 'LCD 七段码'], ['电池', '钮扣电池 1–2 年'], ['历史', '石英危机主角']] },
    { id: 'clasp', zh: '折叠表扣', en: 'FOLDING CLASP', real: true,
      ex: [0, 0.2, -1.3], lo: [0, 1.0, 0], tag: '双折扣 · 摘戴的机关',
      desc: '折叠扣：两段金属板对折咬合，侧面小卡簧锁死——摘表时掰开折页，戴表时「咔哒」一声吸合。它让表带不用打孔就能微调松紧，是金属表带的标配机关。',
      specs: [['结构', '双折页 + 卡簧'], ['材质', '不锈钢'], ['优点', '免打孔可微调'], ['失效', '卡簧疲软合不严']] },
    { id: 'strap-a', zh: '上表带', en: 'UPPER STRAP', real: true,
      ex: [0, 1.5, 0.3], lo: [0, 1.0, 0], tag: '12 点位方向 · 链节或树脂',
      desc: '上表带：从 12 点侧伸出的半条表带，链节式（每节销轴连接）或一体树脂式——数字表多用树脂/橡胶带，轻、防水、运动场景友好。它与表体连接的「生耳」是一根细弹簧销，换带全靠它。',
      specs: [['形式', '链节 / 树脂'], ['连接', '生耳弹簧销'], ['场景', '运动防水'], ['更换', '生耳一压即拆']] },
    { id: 'strap-b', zh: '下表带', en: 'LOWER STRAP', real: true,
      ex: [0, -1.5, -0.3], lo: [0, 1.0, 0], tag: '6 点位方向 · 带孔的一侧',
      desc: '下表带：6 点位侧的另一半，末端一排调节孔——与折叠扣咬合的一侧。上下两带在手腕背侧由表扣收拢，松紧以「能塞进一根手指」为黄金标准。',
      specs: [['末端', '调节孔排'], ['标准', '塞一指松紧'], ['咬合', '与折叠扣配合'], ['磨损', '孔位边缘最易裂']] },
  ],
});
