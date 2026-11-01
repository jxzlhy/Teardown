/* =============================================================
   设备配置：Marshall JCM800 音箱（Sketchfab · dark_igorek · CC-BY）
   38 匿名网格 Object_N，5 组材质有语义 → materialMapping 分件；
   地面网格（floor 材质）故意不映射——随孤儿 shell 隐藏
============================================================= */
import { makeDevice } from './_kit/factory.js';

export default makeDevice({
  id: 'marshall-jcm800',
  era: 1981,
  name: 'Marshall JCM800 音箱头',
  en: 'MARSHALL JCM800',
  category: '音频',
  brand: 'MARSHALL',
  tagline: '八十年代重金属之声的黄金标尺',
  description: 'JCM800（1981）是 Marshall 的摇滚定音锤：四个 ECC83 前级电子管把吉他信号推到崩溃边缘，四只 EL34 功率管接力输出 100W——它的高增益通道定义了 Iron Maiden、Slayer 与整场 NWOBHM（英伦重金属新浪潮）的音墙。面板上的白色数字编号（1987/2203/2210）是乐手之间的接头暗号；把它怼上一台 4×12 倾斜箱体，就是「摇滚乐」这个词的物理形态。',
  specs: [
    ['上市', '1981 · 英国 Marshall'],
    ['前级', '4× ECC83 电子管'],
    ['功率级', '4× EL34 · 100W'],
    ['通道', 'Clean / Boost（2210 双通道）'],
    ['经典', 'NWOBHM 音墙标配'],
    ['来源', '社区模型（Sketchfab · CC-BY）'],
  ],
  accent: '#d4b13f',
  /* 质量分级 B：策展 tour + xrayShellIds 齐备，署名/许可证/部件 desc 完整（社区模型 CC-BY · dark_igorek）；未经运行时逐件核验，不评 A */
  quality: 'B',
  source: '社区模型（Sketchfab）',
  modelCredit: 'Marshall Sc20h // JCM 800 by dark_igorek (Sketchfab, CC-BY)',
  modelSource: 'https://sketchfab.com/3d-models/marshall-sc20h-jcm-800-7b93c2501e0646cbbf49d1d594fde9a0',
  targetWidth: 11,
  camDist: 1.1,
  normalize: 'full',
  glb: '/assets/marshall-jcm800.glb',
  materialMapping: {
    'base_body_mat': 'cabinet',
    'text': 'badge',
    'side_details_mat': 'trim',
    'inner_details_mat': 'panel',
  },
  realPartIds: ['cabinet', 'badge', 'trim', 'panel'],
  /* 策展导览：外壳→护角→标牌→核心面板（从整机外观逐步收拢到音色的物理载体） */
  tour: ['cabinet', 'trim', 'badge', 'panel'],
  /* X-Ray 外壳：箱体与外部护角/提手是仅有的罩壳件，半透明后金面板组件浮出；
     面板/标牌保持实心（面板即「内部核心」，标牌是展品图腾不做雾化） */
  xrayShellIds: ['cabinet', 'trim'],
  postLoad: ({ partsById }) => {
    /* 模型自带"About Marshall"说明卡与纸条：主体包围盒之外的游离 mesh 一律隐藏 */
    const T = window.__THREE;
    const bb = new T.Box3().setFromObject(partsById.cabinet.group);
    const yFloor = bb.min.y + 0.02 * (bb.max.y - bb.min.y);
    for (const pid of ['cabinet', 'badge', 'trim', 'panel']) {
      const p = partsById[pid]; if (!p) continue;
      p.group.traverse(o => {
        if (!o.isMesh) return;
        o.geometry.computeBoundingBox();
        const c = o.geometry.boundingBox.getCenter(new T.Vector3());
        o.localToWorld(c);
        if (c.y < yFloor) o.visible = false;
      });
    }
  },
  parts: [
    { id: 'cabinet', zh: '箱体与金框', en: 'CABINET & GOLD FRAME', real: true,
      ex: [0, 0, 0.8], lo: [0, 1.3, 0], tag: '黑色鳄鱼纹 · 金色滚边',
      desc: '箱体：多层桦木胶合板外贴黑色鳄鱼纹乙烯革，金色滚边框住正面——这个配色自 1962 年沿用至今，是摇滚乐的视觉商标。箱内按电子管布局分区屏蔽：前级舱远离变压器，避免 50Hz 嗡声混进增益最高的通道。',
      specs: [['板材', '桦木多层胶合'], ['包覆', '鳄鱼纹乙烯革'], ['布局', '前级舱远离变压器'], ['配色', '黑金 = 摇滚商标']] },
    { id: 'panel', zh: '金面板与旋钮阵', en: 'GOLD CONTROL PANEL', real: true,
      ex: [0, 1.2, 1.6], lo: [0, 1.2, 0], tag: '两排旋钮 · 增益的艺术',
      desc: '控制面板：金色阳极氧化铝板上一排旋钮——Pre Vol 一（Clean）、Pre Vol 二（Boost 高增益）、Master、以及 Bass/Middle/Treble/Presence 四段 EQ。2203 型没有通道切换：把 Pre Vol II 拧满就是失真，音色全在旋钮的刻度里。',
      specs: [['前级', '双 Pre Vol 设计'], ['EQ', 'Bass/Middle/Treble/Presence'], ['玩法', '拧满 II = 失真'], ['材质', '金铝板 + 白字']] },
    { id: 'badge', zh: 'Marshall 标牌', en: 'LOGO BADGE', real: true,
      ex: [-1.6, 2.0, 1.0], lo: [0, 1.1, 0], tag: '白色手写体 · 舞台上的灯',
      desc: '标牌：白色手写体 Marshall 徽标，内部透光——舞台暗下来的时候，整台音箱只剩这个名字亮着。它是乐手「装备信仰」的图腾，仿冒品的标牌字体永远差着那一笔。',
      specs: [['字体', '手写体透光'], ['功能', '夜场照明'], ['地位', '装备图腾'], ['鉴定', '字体笔画辨真假']] },
    { id: 'trim', zh: '角件与护边', en: 'CORNERS & TRIM', real: true,
      ex: [1.5, -0.9, -0.6], lo: [0, 1.0, 0], tag: '黑色包角 · 巡演的铠甲',
      desc: '角件：箱体八角的黑色金属包角与侧边提手护条——音箱是要被扔上货车、磕着墙角巡演的，这些包角是它经久耐用的一生。侧面提手的位置经过配重计算，单人能拎起 100W 的箱头。',
      specs: [['包角', '八角金属护角'], ['提手', '配重位单手拎'], ['工况', '巡演级磕碰'], ['细节', '乙烯革包边']] },
  ],
});
