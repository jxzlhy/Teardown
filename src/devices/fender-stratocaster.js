/* =============================================================
   设备配置：Fender Stratocaster 电吉他（Tequila Sunrise · 展台陈列）
   社区模型（Sketchfab · dark_igorek，CC-BY 4.0）：157 网格
   （Fender 材质 152 = 琴体/琴颈/弦钮/五金；podium+text+light = 陈列展台）
   bbox 3.68×7.73×3.46 立于展台；X 为琴身厚度轴
   映射：尺寸分档（琴体>2.5 / 琴颈>1.2 / 弦钮微型 / 其余五金）
   结构：琴体→琴颈→弦钮与琴头→五金→展台
============================================================= */
import { makeDevice } from './_kit/factory.js';

export default makeDevice({
  id: 'fender-stratocaster',
  name: 'Fender Stratocaster 电吉他',
  en: 'FENDER STRATOCASTER',
  category: '乐器',
  brand: 'FENDER',
  tagline: '1954 年以来电吉他的默认答案',
  description: 'Stratocaster 是电吉他的"默认机型"：双缺角琴体、三颗单线圈拾音器、五档拾音切换与同步颤音系统（tremolo bridge）——1954 年由 Leo Fender 定型后几乎没有改动。琴体 双切角让高把位左手够得到；三颗单线圈的五档组合覆盖从清亮到爆裂的音色。本页按 5 组拆解：琴体（含护板与拾音器）、琴颈、弦钮与琴头、琴桥五金与陈列展台。品牌名即型号署名。',
  specs: [
    ['定型', '1954 · Leo Fender'],
    ['拾音', '单线圈 ×3 · 五档切换'],
    ['颤音', '同步颤音琴桥'],
    ['琴体', '桤木 / 赤杨 · 双缺角'],
    ['拆解', '5 组核心部件'],
  ],
  accent: '#d4713c',
  source: '社区模型（Sketchfab）',
  modelCredit: 'Fender Stratocaster Tequila Sunrise by dark_igorek (Sketchfab, CC-BY 4.0)',
  modelSource: 'https://sketchfab.com/3d-models/a393cf85ebf84a398d9c7636eb3fd6dc',
  targetWidth: 11,
  normalize: 'full',
  frontAxis: '+x',
  glb: '/assets/fender-stratocaster.glb',
  mapByPosition(name, p, rel, ext, mat) {
    if (mat !== 'Fender') return 'podium';
    const biggest = Math.max(ext.x, ext.y, ext.z);
    if (biggest > 2.5) return 'guitar-body';
    if (biggest > 1.2) return 'neck';
    if (biggest > 0.25) return 'hardware';
    return 'tuners';
  },
  tour: ['guitar-body', 'neck', 'tuners', 'hardware', 'podium'],
  xrayShellIds: ['guitar-body'],
  realPartIds: ['guitar-body', 'neck', 'tuners', 'hardware', 'podium'],
  parts: [
    { id: 'guitar-body', zh: '琴体', en: 'BODY', real: true,
      ex: [0.6, 0.2, 0.4], lo: [0, 1.2, 0.2], tag: '双缺角 · 高把位的通行证',
      desc: 'Stratocaster 的双缺角琴体（double cutaway）是功能主义设计：上下两个弧形缺口让左手按到高把位的品丝不被琴体挡住。桤木琴体的音色均衡中性，Tequila Sunrise 橙红渐变漆面下是 1954 年定型的经典轮廓——70 年来几乎未改。',
      specs: [['形状', '双缺角 double cutaway'], ['材质', '桤木/赤杨'], ['漆面', 'Tequila Sunrise 渐变']] },
    { id: 'neck', zh: '琴颈', en: 'NECK', real: true,
      ex: [-0.8, 0.4, -0.4], lo: [0, 1.2, 0], tag: '枫木琴颈 · 22 品丝',
      desc: '一体枫木琴颈是 Strat 的标志之一（早年为降低成本与形变）：琴颈背面的"现代 C 形"弧度适合拇指长时间握持，正面 22 根品丝把弦长 12 等分出半音。琴颈通过四颗螺栓与琴体连接——可拆卸设计让换颈成为可能。',
      specs: [['材质', '一体枫木'], ['品丝', '22 品'], ['连接', '四颗螺栓可拆']] },
    { id: 'tuners', zh: '弦钮与琴头', en: 'TUNERS & HEADSTOCK', real: true,
      ex: [0.4, 1.4, -0.6], lo: [0, 1.2, -0.4], tag: '6 颗弦钮 · 定音的终点',
      desc: '琴头正面 6 颗弦钮一字排开——Strat 的弦钮全部在琴头单侧，弦从压弦钮穿过并缠绕定音。弦钮的齿轮比决定调音精度；琴头的后倾角度让弦在螺母处保持下压角度，减少打品。六颗弦钮在模型里是六颗独立的微型件。',
      specs: [['弦钮', '6 颗单侧排布'], ['功能', '定音 / 弦角'], ['齿轮比', '调音精度来源']] },
    { id: 'hardware', zh: '琴桥五金', en: 'BRIDGE & HARDWARE', real: true,
      ex: [-0.8, -0.4, 0.4], lo: [0, 1.0, 0.3], tag: '同步颤音系统的心脏',
      desc: '琴桥五金是 Strat 的灵魂发明：六枚鞍座把弦固定在浮动的颤音块上，摇把压放让整块琴桥以支点旋转——弦张力同步增减产生颤音。琴体背面的两根弹簧与琴桥张力对抗，平衡点决定摇把的"软硬"手感。',
      specs: [['系统', '同步颤音 synchronized tremolo'], ['结构', '6 鞍座 + 浮动颤音块'], ['对抗', '琴体背面双弹簧']] },
    { id: 'podium', zh: '陈列展台', en: 'DISPLAY PODIUM', real: true,
      ex: [0, -0.8, -0.6], lo: [0, 1.0, -0.2], tag: '琴行的光 · 展示语境',
      desc: '圆形展台与环形灯带来自原模型的陈列场景：琴行与博物馆用同样的方式展示乐器——垂直悬挂、环形补光。灯带在琴体下方补出轮廓光，让渐变漆面的色彩在任何展厅里都保持一致。这不是吉他的一部分，却是它被"观看"的方式。',
      specs: [['组成', '圆台 + 环形灯带 + 支架'], ['功能', '展示补光'], ['语境', '琴行 / 博物馆陈列']] },
  ],
});
