/* =============================================================
   设备配置：准双曲面齿轮组（Sketchfab · cyamahat · CC-BY，带动画）
   4 网格全命名（axis1.001/pinion/axis2.001/large gear——空格清洗为 _）
============================================================= */
import { makeDevice } from './_kit/factory.js';

export default makeDevice({
  id: 'hypoid-gear',
  name: '准双曲面齿轮组',
  en: 'HYPOID GEAR SET',
  category: '机械',
  brand: 'GENERIC',
  tagline: '两根不相交的轴 · 最安静的强力传动',
  description: '准双曲面（Hypoid）齿轮是汽车后桥的核心：主动小齿轮（pinion）的轴线低于从动大齿轮的轴线，两根轴在空间里「擦肩而过」永不相交。这个错位让齿面之间既有滚动又有滑动——啮合更平稳、噪音更低，还顺手把传动轴降到了车厢地板之下。代价是齿面滑移摩擦剧烈，必须用特制的双曲面齿轮油（有极压添加剂的那种），绝不能拿普通齿轮油凑合。',
  specs: [
    ['特征', '两轴空间交错不相交'],
    ['优点', '平稳 / 低噪 / 降低传动轴'],
    ['代价', '齿面滑移 → 极压润滑油'],
    ['应用', '汽车后桥 / 差速器'],
    ['对比', '螺旋锥齿轮（轴线相交）'],
    ['来源', '社区模型（Sketchfab · CC-BY）'],
  ],
  accent: '#8899aa',
  /* 质量分级 B：策展 tour + xrayShellIds 齐备，署名/许可证/部件 desc 完整（社区模型 CC-BY）；未经运行时逐件核验，不评 A */
  quality: 'B',
  source: '社区模型（Sketchfab）',
  modelCredit: 'Hypoid Gear by cyamahat (Sketchfab, CC-BY)',
  modelSource: 'https://sketchfab.com/3d-models/hypoid-gear-6592b808326541dd8b887bcf3da44619',
  targetWidth: 9,
  normalize: 'full',
  glb: '/assets/hypoid-gear.glb',
  /* 策展导览：输入轴→主动小齿轮→从动大齿轮（准双曲面偏置）→输出轴 */
  tour: ['input-shaft','pinion','ring-gear','output-shaft'],
  /* X-Ray 外壳：全暴露齿轮副、无差速器壳体，按「最外层 1-2 件」口径选盘状大齿轮
     （最能遮挡小齿轮啮合的一件）作半透明目标；避免 realPartIds 兜底全部雾化 */
  xrayShellIds: ['ring-gear'],
  mapping: {
    /* 节点名点号被 sanitizeNodeName 清洗：axis1.001_0 → axis1001_0 */
    'axis1001_0': 'input-shaft',
    'pinion_0': 'pinion',
    'axis2001_0': 'output-shaft',
    'large_gear_0': 'ring-gear',
  },
  realPartIds: ['input-shaft', 'pinion', 'output-shaft', 'ring-gear'],
  postLoad: ({ partsById }) => {
    /* 白色渲染件过曝：整体压暗并微调金属感 */
    for (const p of Object.values(partsById)) {
      p.group.traverse(o => {
        if (!o.isMesh) return;
        const mats = Array.isArray(o.material) ? o.material : [o.material];
        for (const m of mats) { if (m.color) m.color.multiplyScalar(0.5); }
      });
    }
  },
  parts: [
    { id: 'input-shaft', zh: '主动轴', en: 'INPUT SHAFT', real: true,
      ex: [1.6, 0.8, 0.6], lo: [0, 1.1, 0], tag: '从传动轴来 · 位置偏低',
      desc: '主动轴：连接传动轴的输入轴——它的轴线比大齿轮轴线低一截，这正是 Hypoid 的定义：两轴偏置而不相交。偏置量还分上偏下偏，决定了这副齿轮是给左舵车还是右舵车用（啮合方向相反）。',
      specs: [['特征', '轴线偏置'], ['偏置量', '决定左右舵适配'], ['轴承', '圆锥滚子成对'], ['输入', '来自传动轴']] },
    { id: 'pinion', zh: '主动小齿轮', en: 'PINION', real: true,
      ex: [1.8, 0.2, -0.8], lo: [0, 1.2, 0], tag: '螺旋齿 · 贴着大齿轮「钻」过去',
      desc: '主动小齿轮：螺旋锥形齿轮，齿槽沿着双曲面渐开线扭转——它不「啮入」大齿轮，而是像螺丝一样「钻」过去，多齿同时接触把扭矩化整为零。5 万面数的它每一条齿面都是 Gerber 曲线拟合出来的， CNC 磨齿机的看家活。',
      specs: [['形态', '螺旋渐开锥齿'], ['接触', '多齿同时啮合'], ['制造', 'CNC 磨齿'], ['噪音', '比直齿低 10dB 级']] },
    { id: 'ring-gear', zh: '从动大齿轮', en: 'RING GEAR', real: true,
      ex: [-1.8, 0.6, 0.8], lo: [0, 1.2, 0], tag: '盘状大齿轮 · 减速放大扭矩',
      desc: '从动大齿轮：螺栓固定在差速器壳上的盘状齿轮——主减速比就是它的齿数除以小齿轮齿数（如 41/10 = 4.1:1），把发动机的高转速换成轮上的大扭矩。齿面研磨留下的花纹是装配对位的「指纹」。',
      specs: [['减速比', '齿数比（例 4.1:1）'], ['安装', '螺栓 + 差速器壳'], ['对位', '研磨花纹配对'], ['材料', '渗碳合金钢']] },
    { id: 'output-shaft', zh: '从动轴', en: 'OUTPUT SHAFT', real: true,
      ex: [-1.6, -0.8, -0.6], lo: [0, 1.0, 0], tag: '去左右车轮 · 与输入轴永不相交',
      desc: '从动轴：大齿轮背后的输出轴，把扭矩送往左右半轴到车轮——它与主动轴在空间里交错，投影图上像要相交、实际永远差着一段偏置距离。两根轴的轴承都预紧到「零游隙」，后桥的哒哒异响十有八九从这里来。',
      specs: [['输出', '至左右半轴'], ['几何', '与输入轴永不相交'], ['轴承', '预紧零游隙'], ['异响', '后桥哒哒 top 嫌犯']] },
  ],
});
