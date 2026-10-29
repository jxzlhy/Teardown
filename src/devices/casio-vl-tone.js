/* =============================================================
   设备配置：Casio VL-Tone 计算器琴（Sketchfab · AleixoAlonso · CC-BY）
   46 网格：机身/玻璃/Reset/OKP 左右 + 30+ 按音名命名的琴键
   （G0/A0/B0/C1/D1…）——琴键用 unmappedTo 归入 keys 件
============================================================= */
import { makeDevice } from './_kit/factory.js';

export default makeDevice({
  id: 'casio-vl-tone',
  name: 'Casio VL-Tone 计算器琴',
  en: 'CASIO VL-TONE VL-1',
  category: '音频',
  brand: 'CASIO',
  tagline: '一台会唱歌的计算器 · 芯片音乐的老祖宗',
  description: 'VL-1（1979）：一半是八位计算器，一半是单音电子琴——按 MODE 键在「算账」与「弹琴」之间切换。它的发声核心是一片 4-bit LSI，用方波合成 10 种预设音色，还带一个 100 步音序器：把旋律按成计算器按键序列，它就能自己循环播放。German Dances 这段预置旋律被 Kraftwerk 巡演带上过舞台，是 chiptune 文化的活化石。全球卖出约 1000 万台。',
  specs: [
    ['上市', '1979 · Casio'],
    ['芯片', '4-bit LSI · 方波合成'],
    ['键盘', '计算器键位 × 电子琴键位复用'],
    ['音序', '100 步内建音序器'],
    ['销量', '~1000 万台'],
    ['来源', '社区模型（Sketchfab · CC-BY）'],
  ],
  accent: '#e8b04c',
  source: '社区模型（Sketchfab）',
  modelCredit: 'Keyboard (Casio VL-Tone) by AleixoAlonso (Sketchfab, CC-BY)',
  modelSource: 'https://sketchfab.com/3d-models/keyboard-casio-vl-tone-be22fbe1ef0044f3bedc6e3edf459593',
  targetWidth: 8,
  normalize: 'full',
  glb: '/assets/casio-vl-tone.glb',
  tour: ['body','keys','controls','glass'],
  xrayShellIds: ['body','glass'],
  unmappedTo: 'keys',
  mapping: {
    '#INT0002_Body_#INT0002_Textures_0': 'body',
    '#INT0002_Body_#INT0002_Glass_0': 'glass',
    '#INT0002_Reset_#INT0002_Textures_0': 'controls',
    '#INT0002_OKP_Left_#INT0002_Textures_0': 'controls',
    '#INT0002_OKP_Right_#INT0002_Textures_0': 'controls',
  },
  realPartIds: ['body', 'glass', 'controls', 'keys'],
  postLoad: ({ partsById }) => {
    /* 白色机身在强光下过曝：整体压暗 */
    for (const pid of ['body', 'keys', 'controls']) {
      const p = partsById[pid]; if (!p) continue;
      p.group.traverse(o => {
        if (!o.isMesh) return;
        const mats = Array.isArray(o.material) ? o.material : [o.material];
        for (const m of mats) { if (m.color) m.color.multiplyScalar(0.55); }
      });
    }
  },
  parts: [
    { id: 'body', zh: '机身与计算器键区', en: 'BODY & CALC KEYS', real: true,
      ex: [0, 0, 0.6], lo: [0, 1.2, 0], tag: '一半算账 · 一半弹琴',
      desc: '机身：名片大小的塑料壳，左半是标准计算器键区（0-9 与四则运算），右半的琴键与数字键共用——MODE 一按，同一块键盘从「算账键盘」变成「一排琴键」。屏幕是单行 LCD，算账时显示数字，弹琴时显示音符步数。',
      specs: [['双模式', 'CALCULATOR / MUSIC'], ['屏幕', '单行 LCD'], ['尺寸', '名片级便携'], ['供电', '2×AA']] },
    { id: 'glass', zh: '显示窗', en: 'LCD WINDOW', real: true,
      ex: [0, 0.6, 1.2], lo: [0, 1.0, 0], tag: '数字与音符共用一扇窗',
      desc: '显示窗：透明亚克力盖着单行 LCD——计算模式显示 8 位数字，音乐模式显示当前步进序号与音名。那个年代的「多任务界面」就靠一行字切换语境。',
      specs: [['材质', '亚克力窗口'], ['复用', '数字/音符双显'], ['时代', '无背光'], ['划痕', '岁月的包浆']] },
    { id: 'keys', zh: '琴键排', en: 'TONE KEYS', real: true,
      ex: [0, -0.8, 1.4], lo: [0, 1.0, 0], tag: '按音名命名的 G0→B3',
      desc: '琴键排：29 个白灰键按音名编号（G0、A0、B0、C1…B3）——它不是钢琴键盘而是「音名键盘」，弹旋律要看着音名表按。每个键按下就是触发 LSI 里对应频率的方波振荡器，音色单薄但绝对忠实：8-bit 游戏机时代前夜的声音。',
      specs: [['键数', '29 键（G0–B3）'], ['发声', '方波单音'], ['记谱', '音名直标键面'], ['文化', 'chiptune 老祖宗']] },
    { id: 'controls', zh: '模式与复位键', en: 'MODE & RESET', real: true,
      ex: [1.5, 0.8, -0.6], lo: [0, 1.0, 0], tag: '算账 / 弹琴 一键切换',
      desc: '控制键：MODE 在计算器与琴之间切换世界，RESET 复位音序器，左右 OKP 键录放你的 100 步旋律——先把旋律按进计算器，它就能无限循环替你弹。1980 年代的「编程」启蒙，很多人是从这台机器开始的。',
      specs: [['MODE', '双世界切换'], ['音序', '100 步录放'], ['OKP', '录音 / 放音'], ['启蒙', '一代人的编程初体验']] },
  ],
});
