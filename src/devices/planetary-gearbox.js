/* =============================================================
   设备配置：行星齿轮箱（Khronos glTF 官方样例 GearboxAssy · CC-BY）
   42 网格全匿名（mesh N），双排行星轮系沿 X 对称分布
   → mapByPosition 按 rel.x 分左右轮系、按网格尺寸分大齿轮/小件
============================================================= */
import { makeDevice } from './_kit/factory.js';

export default makeDevice({
  id: 'planetary-gearbox',
  name: '行星齿轮箱（CAD）',
  en: 'GEARBOX ASSEMBLY',
  category: '机械',
  brand: 'GENERIC',
  tagline: '两排轮系咬合出 30:1 的扭矩魔法',
  description: 'Khronos 官方的经典 CAD 教学件：双排行星轮系——太阳轮居中，行星轮经行星架绕它公转，外圈齿圈反向固定。输入轴转一圈，输出轴以约 1/30 的转速输出数倍扭矩。行星布局让齿轮受力均摊、结构同轴紧凑，从自动变速箱到电钻、风电机偏航系统，全是它的地盘。这份数据是从 CAD 装配体直接导出的：每一个轮齿都保留着工程制图的精确。',
  specs: [
    ['结构', '双排 · 太阳轮 + 行星轮×N + 齿圈'],
    ['传动比', '~30:1（示例双级）'],
    ['优点', '同轴 / 受力均摊 / 紧凑'],
    ['应用', '自动变速箱 / 电钻 / 风电'],
    ['数据', 'CAD 装配体直出 · 保留轮齿精度'],
    ['来源', 'Khronos glTF 官方样例（CC-BY）'],
  ],
  accent: '#a4b494',
  /* 质量分级 B：策展 tour + xrayShellIds 齐备，署名/许可证/部件 desc 完整（Khronos 官方样例 CC-BY）；未经运行时逐件核验，不评 A */
  quality: 'B',
  source: 'Khronos glTF 样例',
  modelCredit: 'Gearbox Assy by Khronos Group (glTF Sample Models, CC-BY)',
  targetWidth: 12,
  camDist: 1.1,
  normalize: 'full',
  glb: '/assets/planetary-gearbox.glb',
  tour: ['gears-a','gears-b','hardware-a','hardware-b'],
  /* X-Ray 外壳：两排行星轮系（含外圈齿圈）是箱内最外层，半透明后露出轴系/卡簧小件；
     避免 realPartIds 兜底把全部 4 组部件雾化 */
  xrayShellIds: ['gears-a', 'gears-b'],
  mapByPosition(name, p, rel, ext) {
    const big = ext && Math.max(ext.x, ext.y, ext.z) > 3.2;
    const left = rel.x < 0.5;
    if (big) return left ? 'gears-a' : 'gears-b';
    return left ? 'hardware-a' : 'hardware-b';
  },
  realPartIds: ['gears-a', 'gears-b', 'hardware-a', 'hardware-b'],
  parts: [
    { id: 'gears-a', zh: '第一排行星轮系', en: 'GEAR SET A', real: true,
      ex: [-2.2, 0, 0.8], lo: [0, 1.2, 0], tag: '太阳轮 · 行星轮 · 齿圈',
      desc: '第一排轮系：中央太阳轮输入，3–4 颗行星轮经行星架分担负载，外圈齿圈固定作反作用件。行星布局的妙处在于力从四面八方对称进出——轴承只受纯扭矩，齿轮模数可以做小，箱子因此又短又粗。',
      specs: [['布局', '太阳 + 行星 ×N + 齿圈'], ['受力', '多齿对称均摊'], ['同轴', '输入输出共线'], ['典型', '变速箱一挡 / 电钻二级']] },
    { id: 'gears-b', zh: '第二排行星轮系', en: 'GEAR SET B', real: true,
      ex: [2.2, 0, -0.8], lo: [0, 1.2, 0], tag: '级联第二排 · 传动比相乘',
      desc: '第二排轮系：与第一排串联——第一排的行星架成为第二排的太阳轮输入，两排传动比相乘（如 5.5 × 5.5 ≈ 30:1）。级联是行星箱拿到大减速比的唯一正道，每一排都在分摊总减速比的压力。',
      specs: [['级联', '前排行星架 = 后排太阳'], ['传动比', '两排相乘 ~30:1'], ['输出', '后排行星架'], ['用途', '需要大扭矩的执行器']] },
    { id: 'hardware-a', zh: '第一排轴系与小件', en: 'HARDWARE A', real: true,
      ex: [-1.2, -1.6, 0.9], lo: [0, 1.0, 0], tag: '轴 · 垫圈 · 卡簧',
      desc: '第一排轴系件：输入轴、隔套、垫圈与卡簧——行星轮的销轴穿在行星架的等分孔里，销轴的平行度直接决定轮齿啮合的接触斑点形状。装配师傅用涂色法检查接触斑点来验证轴系精度。',
      specs: [['组成', '轴 / 隔套 / 卡簧'], ['精度', '销轴平行度'], ['检验', '涂色法看斑点'], ['失效', '偏载 = 断齿前兆']] },
    { id: 'hardware-b', zh: '第二排轴系与小件', en: 'HARDWARE B', real: true,
      ex: [1.2, -1.6, -0.9], lo: [0, 1.0, 0], tag: '输出端 · 承受全部扭矩',
      desc: '第二排轴系件：输出轴与行星架销轴——全部减速比换来的扭矩都从这里的轴承经过，是整个齿轮箱受力最凶的位置。轴承预紧与润滑状态决定这台箱子的剩余寿命。',
      specs: [['输出', '全扭矩经过'], ['轴承', '圆锥滚子预紧'], ['润滑', '齿轮油飞溅'], ['寿命', '轴承定生死']] },
  ],
});
