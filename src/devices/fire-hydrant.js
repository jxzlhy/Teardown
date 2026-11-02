/* =============================================================
   设备配置：欧式消防栓（干式立柱消火栓）
   Poly Haven（CC0 扫描）：5 网格全语义命名（本体 + 3 出水口盖 + 链）；
   源模型带同款做旧变体（*_aged），构建期已用 tools/strip-nodes.mjs 剔除
============================================================= */
import { makeDevice } from './_kit/factory.js';

export default makeDevice({
  id: 'fire-hydrant',
  name: '欧式消防栓',
  en: 'DRY BARREL HYDRANT',
  category: '市政机构',
  brand: 'GENERIC',
  tagline: '街角的红色哨兵 · 五角扳手才请得动',
  description: '干式消火栓是城市供水网与火灾之间最后一米的接口：阀座深埋在冰冻线以下，立管平时是"干"的——不存水、不冻裂；只有消防员用专用扳手压开顶部阀杆，水才会涌进栓体，从两侧闷盖后的出水口接上水带。三个出水口的闷盖用防丢链拴在栓身上——拧开就丢的零件，一百多年前就想好了对策。街角的红色柱子一年开不了一次，但每周都要巡检：查闷盖、查链子、查阀杆润滑油。',
  specs: [
    ['类型', '干式立柱（防冻）'],
    ['阀座', '深埋冰冻线以下'],
    ['接口', '双侧面 + 顶部大口'],
    ['专用', '五角/内五角扳手开启'],
    ['时代', '1801 费城首例专利'],
    ['来源', 'Poly Haven（CC0 扫描）'],
  ],
  accent: '#d94f3d',
  era: 1801,
  source: 'Poly Haven（CC0）',
  modelCredit: 'Fire Hydrant by Poly Haven (CC0)',
  modelSource: 'https://polyhaven.com/a/fire_hydrant',
  targetWidth: 6.5,
  normalize: 'full',
  glb: '/assets/fire-hydrant.glb',
  tour: ['body', 'cap-a', 'cap-b', 'cap-c', 'chain'],
  xrayShellIds: ['body'],
  mapping: {
    'fire_hydrant': 'body',
    'fire_hydrant_cap_01': 'cap-a',
    /* cap_02/03 经 strip-nodes（gltf-transform）保存后改名 Cylinder025/026 —— __RAW.names 实测 */
    'fire_hydrant_cap_02': 'cap-b',
    'Cylinder025': 'cap-b',
    'fire_hydrant_cap_03': 'cap-c',
    'Cylinder026': 'cap-c',
    'fire_hydrant_chain': 'chain',
  },
  realPartIds: ['body', 'cap-a', 'cap-b', 'cap-c', 'chain'],
  parts: [
    { id: 'body', zh: '栓体与阀杆', en: 'BARREL & STEM', real: true,
      ex: [0, 0, -1.2], lo: [0, 1.8, 0], tag: '干式立管 · 冰冻线下的阀',
      desc: '栓体：铸铁立柱里藏着一根贯穿的阀杆，阀座在地下冰冻线以下——关着的时候整根立管无水，任凭地面冻到零下也不会裂；顶部螺母是专用扳手的接口，顺时针压到底，地下的主阀才打开，水在几秒内充满栓体待命。',
      specs: [['阀座', '冰冻线以下（干式）'], ['开启', '顶部螺母 · 专用扳手'], ['材质', '铸铁 · 防腐涂层'], ['巡检', '每周外观 · 年度试水']] },
    { id: 'cap-a', zh: '正面出水口闷盖', en: 'FRONT OUTLET CAP', real: true,
      ex: [0, 0.4, 3.2], lo: [0, 1.6, 0], tag: '大口径主力接口',
      desc: '正面大口径出水口：接主力供水干线的大流量接口，闷盖用螺纹拧紧防尘防破坏。盖内是标准化的出水螺纹——消防水带的接口规格全城统一，任何一辆消防车的水带都能拧上任何一个栓。',
      specs: [['口径', '大口径 · 主力供水'], ['密封', '螺纹 + 垫圈'], ['统一', '全城接口标准化'], ['防尘', '闷盖常闭']] },
    { id: 'cap-b', zh: '侧面出水口闷盖（右）', en: 'SIDE OUTLET CAP R', real: true,
      ex: [3.0, 0.6, 1.0], lo: [0, 1.6, 0], tag: '分水接口 · 一栓两带',
      desc: '侧面出水口：一个栓同时给两条水带供水的分水设计——正面接大口干线，两侧接分水支线。闷盖上铸着凸起的防滑纹，戴着厚手套也能拧开；盖子拧下后挂在链子上，绝不落地沾泥。',
      specs: [['角色', '分水支线接口'], ['防滑', '盖面凸纹 · 戴手套可拧'], [' etiquette', '拧下挂链不落地'], ['水压', '与市政管网同压']] },
    { id: 'cap-c', zh: '侧面出水口闷盖（左）', en: 'SIDE OUTLET CAP L', real: true,
      ex: [-3.0, 0.6, 1.0], lo: [0, 1.6, 0], tag: '对称双路 · 备份冗余',
      desc: '另一侧出水口：两侧对称的备份接口——火场上水带走向不定，左右双路让消防车无论停在哪一侧都能就近接水。闷盖的螺纹需要年度上脂：一次打不开的消火栓，延误的可能是一条街。',
      specs: [['冗余', '左右对称双接口'], ['维护', '螺纹年度上脂'], ['记录', '试水结果入档案'], ['禁忌', '私占/遮挡 = 违法']] },
    { id: 'chain', zh: '防丢链', en: 'RETAINING CHAINS', real: true,
      ex: [0.8, 1.4, 2.6], lo: [0, 1.6, 0], tag: '一百年的小智慧 · 拧开就挂上',
      desc: '防丢链：把三只闷盖拴在栓身上的细铁链——消防分秒必争，拧下的盖子随手一放就会被踩进泥里；链子让每一只盖子"取下即悬挂"，用完顺手拧回。一根几块钱的链条，保住的是火场上最不能等的东西。',
      specs: [['作用', '闷盖取下即悬挂'], ['代价', '几块钱一根'], ['避免', '盖子落地丢失/污染'], ['哲学', '把"归位"做成默认']] },
  ],
});
