/* =============================================================
   设备配置：Game Boy（DMG-01 · 1989）
   社区模型（Sketchfab · Smoggybeard，CC-BY 4.0）：外观件 12 网格
   （机身×2/屏幕/玻璃/贴花/十字键/AB 键/START-SELECT/电量灯）
   —— 无任何内构件；主板/电池/卡带/扬声器为**示意重建**（P 部件，
   沿用馆内 nikon-d6 先例，desc 明确标注），经 anchorParts 锚定到机身
   bbox 343×567×85（Y 上，屏幕朝 +z）
============================================================= */
import { makeDevice, anchorParts, composePostLoad } from './_kit/factory.js';
import { box, addMesh, matShell, matDark } from '../engine/materials.js';

const builders = {
  /* 示意内构件：引擎尺度（归一化后机身 6.5×11×1.5），仅表达位置与占位比例 */
  board: (g) => { addMesh(g, box(4.6, 0.22, 3), matShell(), 0, 0, 0); },
  battery: (g) => { addMesh(g, box(4.4, 1.0, 2.8), matDark(), 0, 0, 0); },
  cartridge: (g) => { addMesh(g, box(5, 1.1, 4.6), matDark(), 0, 0, 0); },
  speaker: (g) => { addMesh(g, box(2.4, 0.15, 2.4), matShell(), 0, 0, 0); },
};

export default makeDevice({
  id: 'gameboy',
  era: 1989,
  name: 'Game Boy（DMG-01）',
  en: 'GAME BOY',
  category: '游戏',
  brand: 'NINTENDO',
  tagline: '不够好没关系 · 够皮实够省电就是赢',
  description: '1989 年的 Game Boy 用一块不做背光的绿灰 LCD 和 4 节五号电池打赢了彩色对手——"电池寿命与耐用性优先于性能"是它的设计纲领。本页外壳与按键来自社区外观模型；主板、电池仓、卡带与扬声器为示意重建件（原模型无内构件），用于表达四者的空间关系：卡带从背面顶部插入、主板居中、扬声器在右下开孔后。',
  specs: [
    ['发布', '1989（DMG-01）'],
    ['屏幕', '160×144 反射式 LCD · 无背光'],
    ['供电', 'AA×4 · 约 30 小时'],
    ['处理器', 'Sharp LR35902 @ 4.19MHz'],
    ['卡带', '背面顶部插入'],
    ['备注', '内构件为示意重建'],
  ],
  accent: '#9bb47f',
  source: '社区模型（Sketchfab）· 内构件为示意重建',
  modelCredit: 'Nintendo Game Boy by Smoggybeard (Sketchfab, CC-BY 4.0)',
  modelSource: 'https://sketchfab.com/3d-models/nintendo-game-boy-021b1586089044278164dadc584abb89',
  targetWidth: 11,
  normalize: 'full',
  /* 源模型平躺展示（屏朝上）：绕 X +90° 立起，屏转朝 +Z */
  baseRotation: [Math.PI / 2, 0, 0],
  frontAxis: '-x',
  glb: '/assets/gameboy.glb',
  mappingPrefix: {
    'Nintendo_GAMEBOY_GAMEBOY':  'shell',
    'Nintendo_GAMEBOY_Screen':   'screen',
    'Nintendo_GAMEBOY_Glass':    'screen',
    'Nintendo_GAMEBOY_TEXT':     'screen',
    'Nintendo_GAMEBOY_Text':     'screen',
    'Nintendo_GAMEBOY_Red_Line': 'screen',
    'Nintendo_GAMEBOY_BLUE_Line':'screen',
    'Nintendo_GAMEBOY_BATTERY_LIGHT': 'buttons',
    'Nintendo_GAMEBOY_D-PAD':    'buttons',
    'Nintendo_GAMEBOY_A_B':      'buttons',
    'Nintendo_GAMEBOY_START':    'buttons',
  },
  postLoad: composePostLoad(
    ({ partsById }) => {
      /* 外壳灰塑料偏暗：轻微提亮防止暗厅隐形 */
      for (const pid of ['shell']) {
        const p = partsById[pid]; if (!p) continue;
        p.group.traverse(o => {
          if (!o.isMesh) return;
          const mats = Array.isArray(o.material) ? o.material : [o.material];
          for (const m of mats) { if (m.color) m.color.multiplyScalar(1.6); }
        });
      }
    },
    anchorParts({
      board:     { ref: 'shell', dx: 0, dy: 1.0, dz: -0.3 },
      battery:   { ref: 'shell', dx: 0, dy: -1.5, dz: -0.3 },
      cartridge: { ref: 'shell', dx: 0, dy: 2.4, dz: -0.8 },
      speaker:   { ref: 'shell', dx: 1.1, dy: -1.2, dz: 0.55 },
    }),
  ),
  tour: ['shell', 'screen', 'buttons', 'cartridge', 'board', 'battery', 'speaker'],
  xrayShellIds: ['shell'],
  realPartIds: ['shell', 'screen', 'buttons'],
  builders,
  parts: [
    { id: 'shell', zh: '机身外壳', en: 'SHELL', real: true,
      ex: [0, 0.2, 1.2], lo: [0, 1.3, 0], tag: '四节电池的皮实座机',
      desc: 'DMG-01 的米灰机身是"耐用性优先"的产物：无背光反射屏省电到 30 小时，机身按"从一米掉在硬地上还能玩"设计。正面布局自上而下：屏/十字键/AB/START-SELECT，右侧一颗电量灯——所有元素都是功能位，没有一根装饰线。海湾战争期间更有被炸后仍能开机的传闻机。',
      specs: [['设计纲领', '电池寿命 > 性能'], ['供电', 'AA×4 ≈30h'], ['耐用', '跌落可用']] },
    { id: 'screen', zh: '反射式 LCD', en: 'REFLECTIVE LCD', real: true,
      ex: [0, 1.4, 2.0], lo: [0, 1.2, 0.6], tag: '不发光 · 靠环境光成像',
      desc: '160×144 的 STN 反射式 LCD：没有背光，靠环境光经反射层照亮像素——这也是"在暗处玩不了"的原因。绿灰底色（#8b9a46 一带）来自液晶与偏光片的组合，四阶灰度由帧间抖动凑出。屏上的"DOT MATRIX WITH STEREO SOUND"贴花是任天堂对两大卖点的自夸。',
      specs: [['分辨率', '160×144'], ['灰度', '4 阶（抖动）'], ['采光', '环境光反射']] },
    { id: 'buttons', zh: '按键组', en: 'CONTROLS', real: true,
      ex: [0, -1.2, 1.6], lo: [0, 1.1, 0.4], tag: '十字键 + AB 错位 + 蜂鸣双键',
      desc: '十字键继承自 Game&Watch 的成熟方案；A/B 两键错位排布（贴合拇指弧线而非对称美学），START/SELECT 藏在中下方灰键里。右侧的红色电量灯是整机唯一的"主动发光"——开机即亮、电量越低越暗，玩家靠它判断该换电池了。',
      specs: [['布局', '十字键 / AB 错位 / 双功能键'], ['电量灯', '红色 LED（唯一发光）'], ['传承', 'Game&Watch 十字键']] },
    { id: 'cartridge', zh: '卡带（示意）', en: 'GAME PAK (示意)', real: false, kind: 'board',
      ex: [0, 2.6, -1.6], lo: [0, 1.2, -0.8], tag: '示意重建件 · 背面顶部插入',
      desc: '本件为示意重建（原模型无内构件）：Game Boy 卡带从机身背面顶部插入，卡带内是 ROM 与存档芯片——游戏本体就在这片"砖头"里。卡带即内容的分发形态，让任天堂牢牢握住品质控制权，也造就了"吹卡带"的世界性迷信（其实没用）。',
      specs: [['形态', '背面顶部插入'], ['内容', 'ROM + 存档'], ['口径', '示意重建 · 非真机结构']] },
    { id: 'board', zh: '主板（示意）', en: 'LOGIC BOARD (示意)', real: false, kind: 'board',
      ex: [0, 0.8, 0.4], lo: [0, 1.1, 0.2], tag: '示意重建件 · 一颗 CPU 全包',
      desc: '本件为示意重建：真实主板把 Sharp LR35902 CPU（4.19MHz）、8KB 内存与音频放大器收在一块小板里——CPU 兼容 Z80 但删掉了复杂的寻址模式，换来超低功耗。主板位置居中偏上，连接屏幕排线与底部扬声器。',
      specs: [['CPU', 'Sharp LR35902 @ 4.19MHz'], ['内存', '8KB RAM'], ['口径', '示意重建 · 非真机结构']] },
    { id: 'battery', zh: '电池仓（示意）', en: 'BATTERY BAY (示意)', real: false, kind: 'board',
      ex: [0, -1.8, -0.8], lo: [0, 1.0, -0.2], tag: '示意重建件 · 续航的来源',
      desc: '本件为示意重建：四节五号电池装在机身背面下半部，约 30 小时续航是对手的十倍——"不用天天买电池"是家长买单的真正原因。电池仓盖的卡扣设计成无需工具即可更换，这在 1989 年的掌机里是标配而非亮点。',
      specs: [['供电', 'AA×4 ≈30h'], ['位置', '背面下半部'], ['口径', '示意重建 · 非真机结构']] },
    { id: 'speaker', zh: '扬声器（示意）', en: 'SPEAKER (示意)', real: false, kind: 'board',
      ex: [1.4, -1.2, 0.6], lo: [0, 1.0, 0.4], tag: '示意重建件 · 右下开孔之后',
      desc: '本件为示意重建：单声道扬声器藏在机身右下角，声音经面板上的六孔格栅传出——格栅孔同时也是散气孔。四通道波表音频是 Game Boy 相对同期竞品的隐藏优势，芯片音乐（chiptune）文化因此延续至今。',
      specs: [['声道', '单声道（4 波表通道）'], ['位置', '右下格栅之后'], ['口径', '示意重建 · 非真机结构']] },
  ],
});
