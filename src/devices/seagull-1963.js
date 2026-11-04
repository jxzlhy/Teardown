/* =============================================================
   设备配置：海鸥 1963 计时码表（ST19 柱轮机芯 · 社区高精度复刻）
   社区模型（Sketchfab · johnny.buxton，CC-BY）：142 网格 × 20 语义材质
   （M_Case/M_Crystal/Dial/hand_black/M_CROWN/sTRAP/movementSteel/
   Brass/Blued/Bridge/PolishedSteel…）→ 材质名×位置混合映射
   bbox 1.97×0.88×3.44（表带沿 z 展开 · Y 上）
   结构：表盘/指针（面）→ 水晶 → 壳体与表冠 → 表带 → 背面 ST19 柱轮机芯
   史实：1963 年天津手表厂为空军试制的航空计时码表（中国第一只空军表），
   21 钻手动上链 ST19（维纳斯 175 型柱轮系血统），模型带机芯运转动画
============================================================= */
import { makeDevice } from './_kit/factory.js';

export default makeDevice({
  id: 'seagull-1963',
  era: 1963,
  name: '海鸥 1963 计时码表',
  en: 'SEA-GULL 1963',
  category: '钟表',
  brand: 'SEA-GULL',
  tagline: '中国空军的第一只航空表',
  description: '海鸥 1963 计时码表（D304）：1963 年天津手表厂为中国空军试制的航空计时码表——中国第一只空军表，也是"海鸥"品牌的前身之作。机芯 ST19 由瑞士维纳斯 175（Venus 175）柱轮计时系血统国产化：21 钻手动上链，柱轮（column wheel）协调启动/停止/归零，40 小时动储。本件为社区高精度复刻模型：表盘指针、双面水晶、壳体表冠、表带与背面机芯全部分件，烤蓝钢螺丝与黄铜甲板按实物资色，带机芯运转演示。馆内钟表线新增"机械计时"一环——与怀表（走时）不同，计时码表多一套"测量"机构。',
  specs: [
    ['年代', '1963 · 天津手表厂'],
    ['机芯', 'ST19 · 21 钻手动 · 柱轮计时'],
    ['血统', '瑞士 Venus 175 国产化'],
    ['动储', '40 小时'],
    ['身份', '中国第一只空军航空表'],
  ],
  accent: '#c9a227',
  /* 质量分级 B：20 语义材质映射 + 官方史实可考；未经运行时逐件核验不评 A */
  quality: 'B',
  source: '社区模型（Sketchfab）',
  modelCredit: 'Sea-Gull 1963 Chronograph Watch (38mm) by johnny.buxton (Sketchfab, CC-BY)',
  modelSource: 'https://sketchfab.com/3d-models/sea-gull-1963-chronograph-watch-38mm-20dd01bf520c43b09ea1f405629089db',
  targetWidth: 9,
  camDist: 1.2,
  normalize: 'full',
  frontAxis: '+z',
  glb: '/assets/seagull-1963.glb',
  /* 材质语义映射（第 5 参 mat，位置兜底）：
     表盘面 Dial·hand_black·Blued · 机芯 movementSteel·Brass·Bridge · 壳 M_Case·PolishedSteel · 冠 M_CROWN · 带 sTRAP · 水晶 M_Crystal */
  mapByPosition(name, p, rel, ext, mat) {
    if (mat === 'M_Crystal') return 'crystal';
    if (mat === 'sTRAP') return 'strap';
    if (mat === 'M_CROWN') return 'crown';
    if (mat === 'M_Case' || mat === 'PolishedSteel' || mat === 'Brushed' || mat === 'material_0' || mat === 'material') return 'case';
    if (mat === 'Dial' || mat === 'hand_black' || mat === 'Material.001' || mat === 'Material.002') return 'dial';
    if (/^movementSteel|Brass|Bridge|^Blued/.test(mat || '')) return 'movement';
    return 'case';
  },
  tour: ['dial', 'crystal', 'crown', 'case', 'strap', 'movement'],
  realPartIds: ['dial', 'crystal', 'crown', 'case', 'strap', 'movement'],
  demos: [
    { partId: 'movement', label: 'ST19 机芯摆轮与轮系运转 · 示意', spinPivot: 'center', spin: 'auto' },
  ],
  parts: [
    { id: 'dial', zh: '表盘与三针', en: 'DIAL & HANDS', real: true,
      ex: [0, 0.3, 0.8], lo: [0, 1.2, 0.3], tag: '三眼布局 · 烤蓝指针',
      desc: '黑色三眼表盘：中央时/分针与三个小计盘（30 分钟累计、60 秒累计、小秒针）——计时码表与普通表的差别就是这套"停表"系统：按下按钮，中央秒针独立起跑，走完归零。指针做烤蓝处理（Blued，190°C 热染氧化色）——既是防锈也是钟表匠的审美签名。时标与刻度准确对应空军飞行计算需求。',
      specs: [['布局', '三眼计时 · 中央大秒针'], ['指针', '烤蓝钢 · 190°C 热染']] },
    { id: 'crystal', zh: '双水晶玻璃', en: 'CRYSTAL', real: true,
      ex: [0, 0.5, 0.9], lo: [0, 1.2, 0.3], tag: '前表镜 + 机芯展示底',
      desc: '前后两块透明水晶：正面表镜护住表盘，背面透底水晶把整枚 ST19 机芯亮给你——柱轮、导柱轮、摆轮一览无余。航空表的"透底"在 1963 年是罕见的奢侈：机芯的加工与装配精度经得起从背后看，这是天津厂对自家工艺的自信。',
      specs: [['配置', '前表镜 + 后透底'], ['意义', '机芯背透 · 工艺自信']] },
    { id: 'crown', zh: '表冠与计时按钮', en: 'CROWN & PUSHERS', real: true,
      ex: [0.9, 0.3, 0], lo: [0, 1.2, 0], tag: '一枚两用 · 柱轮的指挥棒',
      desc: '表冠上链兼调时，上下两颗计时按钮才是主角：上按钮启动/停止中央计时秒针，下按钮归零——每次按压都推动机芯里的柱轮旋转一格，柱轮的凸齿依次接通/断开离合轮与制动杠杆。三件套的按压手感（"咔哒"定位）就来自柱轮的机械记忆。',
      specs: [['按钮', '2 计时 + 1 表冠'], ['传动', '按压 → 柱轮转格']] },
    { id: 'case', zh: '壳体', en: 'CASE', real: true,
      ex: [-0.9, 0.2, 0.5], lo: [0, 1.2, 0], tag: '38mm 钢壳 · 空军规格',
      desc: '38 毫米不锈钢壳体（以今天眼光刚好，以 1963 年眼光偏大——军用规格）：抛光表圈与拉丝侧面对比处理，四耳一体出。壳形是典型的"蘑菇头"计时壳——按钮位加宽以容纳按钮杆。壳底旋紧以通过气压与防水测试（空军表必须扛住座舱压力变化）。',
      specs: [['直径', '38mm 不锈钢'], ['处理', '抛光圈 + 拉丝侧'], ['军规', '气压/防水测试']] },
    { id: 'strap', zh: '表带', en: 'STRAP', real: true,
      ex: [0, -0.6, 0.8], lo: [0, 1.1, 0.2], tag: '飞行员折叠扣',
      desc: '原版配飞行员皮表带（后来服役单位常见换装织物带）：飞行时表要戴在飞行服外——"驾驶舱表"的戴法，表带因此做得偏长。模型里的表带沿展布态呈现，与壳体分件。',
      specs: [['型制', '飞行员长带'], ['戴法', '飞行服外（驾驶舱表）']] },
    { id: 'movement', zh: 'ST19 柱轮机芯', en: 'ST19 MOVEMENT', real: true,
      ex: [0, 0.2, -1.0], lo: [0, 1.2, -0.2], tag: '21 钻 · 维纳斯 175 血统',
      desc: '整表的灵魂：ST19 手动上链机芯——1960 年代从瑞士维纳斯 175 柱轮计时机芯（1960 年代停产前卖给了苏联与中国的技术）国产化而来，至今仍在生产，是世界上最便宜的真·柱轮计时芯。黄铜甲板（Brass/Base/Cleanish/Bevel 四种饰面）、钢制轮系与夹板、烤蓝螺丝——透过背透水晶看柱轮起转，是机械表的"点火瞬间"。',
      specs: [['规格', '21 钻 · 手动 · 40h 动储'], ['血统', 'Venus 175 → 国产 ST19'], ['计时', '柱轮 · 三段式']] },
  ],
});
