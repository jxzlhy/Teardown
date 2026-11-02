/* =============================================================
   设备配置：航海干式罗盘（带盖袖珍罗盘）
   Poly Haven（CC0 扫描）：3 网格语义命名（本体/盖/磁针）
============================================================= */
import { makeDevice } from './_kit/factory.js';

export default makeDevice({
  id: 'seadogs-compass',
  name: '航海干式罗盘',
  en: 'DRY CARD COMPASS',
  category: '航海仪器',
  brand: 'GENERIC',
  tagline: '一根磁针，替你记住北在哪里',
  description: '带铜盖的干式罗盘：磁化的钢针顶在轴尖上，几乎无摩擦地转向磁北，针上（或针下）的刻度卡盘把"北"翻译成航向数字。所谓"干式"，是相对后来灌满酒精防震油的"湿式"罗盘——干式读数锐利、没有气泡，但船一摇晃针就摆；湿式稳，代价是液体折射让刻度看起来变了形。舵手的话精准概括了两者：干式告诉你北在哪，湿式让你看见自己怎么歪。',
  specs: [
    ['类型', '干式 · 轴尖支承'],
    ['指向', '磁化钢针 → 磁北'],
    ['对比', '湿式（油浴）防晃稳读'],
    ['误差', '磁偏角 + 船磁自差'],
    ['来源', 'Poly Haven（CC0 扫描）'],
  ],
  accent: '#e0b36a',
  era: 1700,
  source: 'Poly Haven（CC0）',
  modelCredit: 'Seadogs Compass by Poly Haven (CC0)',
  modelSource: 'https://polyhaven.com/a/seadogs_compass',
  targetWidth: 5.5,
  normalize: 'full',
  glb: '/assets/seadogs-compass.glb',
  tour: ['card', 'needle', 'lid'],
  xrayShellIds: ['card'],
  demos: [
    /* 磁针回摆：受扰后绕轴尖慢慢找回磁北（示意） */
    { partId: 'needle', label: '磁针回摆 · 找回磁北（示意）', wobble: [0.05, 0.55, 0.05], wobbleF: 1.4 },
  ],
  mapping: {
    'seadogs_compass': 'card',
    'seadogs_compass_lid': 'lid',
    'seadogs_compass_needle': 'needle',
  },
  realPartIds: ['card', 'lid', 'needle'],
  parts: [
    { id: 'card', zh: '罗盆与刻度盘', en: 'BOWL & CARD', real: true,
      ex: [0, 0, -1.4], lo: [0, 1, 0], tag: '方位的底稿 · 罗经卡',
      desc: '罗盆与刻度：盆体护住刻度卡盘，盘面以罗经点与度数刻出 360 个方位——东北风（NNE）、西南偏西（WSW），水手的每一句行话都对应盘上一格。盆口与盖的螺纹要擦油保养：海上盐雾一天就能让黄铜长出绿锈。',
      specs: [['刻度', '罗经点 32 方位 + 度数'], ['行话', 'NNE / WSW 即盘上一格'], ['材质', '黄铜盆 · 玻璃面'], ['保养', '螺纹防盐雾上油']] },
    { id: 'needle', zh: '磁针与轴尖', en: 'NEEDLE & PIVOT', real: true,
      ex: [0.4, 1.4, 2.2], lo: [0, 1, 0], tag: '极简的指向机构',
      desc: '磁针：一根磁化钢针，倒立顶在打磨光滑的轴尖上——接触面积只有针尖那么一点，摩擦力近乎为零，地磁的微小扭矩就足以让它转身。船体越造越大、铁钉越用越多之后，"船磁自差"成了大问题：19 世纪 Flinders 发明软铁球来抵消它，罗经旁从此多了一对"牛顿苹果"。',
      specs: [['支承', '轴尖 · 最小摩擦'], ['动力', '地磁扭矩'], ['天敌', '船磁自差 · 铁器'], ['解法', '软铁球 / Flinders 杆']] },
    { id: 'lid', zh: '旋合铜盖', en: 'SCREW LID', real: true,
      ex: [0, 0, 1.6], lo: [0, 1, 0], tag: '口袋里的海 · 合盖即封存',
      desc: '铜盖：螺纹旋合的密封盖，揣进大衣口袋带上海船也不进灰不进水。合盖前舵手会看一眼针是否落回轴尖——颠簸会把针震离支点，下次打开先"扶针"再读数，是老水手的手部肌肉记忆。',
      specs: [['密封', '螺纹旋合'], ['便携', '口袋 / 桌案两用'], ['开盖', '先扶针再读数'], ['场景', '小艇 · 救生艇 · 岸测']] },
  ],
});
