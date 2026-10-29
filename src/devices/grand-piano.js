/* =============================================================
   设备配置：三角钢琴（活动击弦机 · 3D 打印可动件）
   开源分件模型（Thingiverse thing:4059233 · icefox1983，CC-BY 4.0）：
   22 个二进制 STL 分件（原始件 vendor/assets/originals/grand-piano/），
   经 tools/stl2glb-batch.mjs 逐件命名合并（--up Y-up），draco 105KB
   低多边形分件（3.2 万面）：琴键/音板/琴桥/铸铁板/踏板/琴盖/琴凳全分件
============================================================= */
import { makeDevice } from './_kit/factory.js';

export default makeDevice({
  id: 'grand-piano',
  name: '三角钢琴（活动击弦机）',
  en: 'GRAND PIANO',
  category: '乐器',
  brand: 'GENERIC',
  tagline: '88 个杠杆的连锁反应 · 从琴键到琴槌',
  description: '三角钢琴是"用琴槌敲击琴弦的机器"：琴键是第一级杠杆，通过击弦机把指尖的力放大传导给琴槌，琴槌击弦后必须立刻脱离让弦自由振动——这套"击发后脱进"的连杆机构是钢琴三百年演化的核心。本页按 8 组拆解：黑白琴键与键框、音板与琴桥、铸铁板、琴体、琴盖、踏板组、琴凳与脚轮。分件来自开源 3D 打印可动模型（活动击弦机）。',
  specs: [
    ['形式', '三角钢琴 · 88 键'],
    ['核心', '击弦机（escapement action）'],
    ['传声', '琴弦 → 琴桥 → 音板'],
    ['张力', '铸铁板承担约 20 吨弦张力'],
    ['拆解', '8 组核心部件'],
  ],
  accent: '#8a6f4d',
  source: '开源分件模型（Thingiverse · CC-BY 4.0）',
  modelCredit: 'Grand piano with moving parts by icefox1983 (Thingiverse, CC-BY 4.0)',
  modelSource: 'https://www.thingiverse.com/thing:4059233',
  targetWidth: 12,
  camDist: 1.3,
  normalize: 'full',
  frontAxis: '+z',
  glb: '/assets/grand-piano.glb',
  postLoad: ({ partsById }) => {
    /* 打印白模过曝：整体压暗 */
    for (const pid of ['keys', 'soundboard', 'plate', 'case', 'lid', 'pedals', 'furniture']) {
      const p = partsById[pid]; if (!p) continue;
      p.group.traverse(o => {
        if (!o.isMesh) return;
        const mats = Array.isArray(o.material) ? o.material : [o.material];
        for (const m of mats) { if (m.color) m.color.multiplyScalar(0.42); }
      });
    }
  },
  mappingPrefix: {
    'keys_white':  'keys',
    'keys_black':  'keys',
    'key_frame':   'keys',
    'key_lid':     'keys',
    'sound_board': 'soundboard',
    'bridge':      'soundboard',
    'plate_1':     'plate',
    'plate_2':     'plate',
    'case':        'case',
    'bottom_back': 'case',
    'bottom_front':'case',
    'brace':       'case',
    'lid':         'lid',
    'lid_rim':     'lid',
    'lid_drop':    'lid',
    'pedals':      'pedals',
    'pedal_base':  'pedals',
    'pedal_bar_x2':'pedals',
    'bench':       'furniture',
    'leg_x3':      'furniture',
    'wheel_x3':    'furniture',
    'music_rack':  'furniture',
  },
  tour: ['keys', 'lid', 'case', 'soundboard', 'plate', 'pedals', 'furniture'],
  xrayShellIds: ['case', 'lid'],
  realPartIds: ['keys', 'soundboard', 'plate', 'case', 'lid', 'pedals', 'furniture'],
  parts: [
    { id: 'keys', zh: '琴键与键框', en: 'KEYS & KEY FRAME', real: true,
      ex: [0, 0.8, 2.0], lo: [0, 1.2, 0.6], tag: '第一级杠杆 · 88 个输入端',
      desc: '52 白键 + 36 黑键架在键框上，每颗键都是一支杠杆：指尖压下前端，后端翘起顶起击弦机的顶杆。黑键比白键短一截、高一阶——它们的杠杆比不同，这正是黑键手感更"重"的原因。键盖（key_lid）合上时保护键盘。',
      specs: [['数量', '52 白 + 36 黑'], ['原理', '第一级杠杆'], ['手感', '配重铅块藏在键内']] },
    { id: 'soundboard', zh: '音板与琴桥', en: 'SOUNDBOARD & BRIDGE', real: true,
      ex: [0, 1.6, -0.8], lo: [0, 1.3, -0.6], tag: '琴弦的扩音器',
      desc: '琴弦本身推动的空气少得可怜——音板才是"喇叭"：弦的振动经琴桥（bridge）传到巨大的云杉音板上，音板整面振动推动空气。琴桥上的每一颗销钉对应一根弦的定位，音板开裂（湿度失控）是钢琴最昂贵的维修。',
      specs: [['传声链', '弦 → 琴桥 → 音板'], ['材质', '云杉拼板'], ['天敌', '湿度剧烈变化']] },
    { id: 'plate', zh: '铸铁板', en: 'CAST IRON PLATE', real: true,
      ex: [0, 2.6, -1.8], lo: [0, 1.4, -0.8], tag: '扛住约 20 吨弦张力的骨架',
      desc: '两百多根钢弦的总张力约 20 吨——全靠这一块铸铁板扛住。它金色的原因不是装饰：早期木框架撑不住张力会爆开，铸铁板的普及让钢琴的音域扩展到 88 键。板上开孔的每一个位置都对应一根弦的通过角度。',
      specs: [['张力', '约 20 吨（全部琴弦）'], ['材料', '铸铁（金色喷涂）'], ['历史', '木框架 → 铸铁的进化']] },
    { id: 'case', zh: '琴体', en: 'CASE & RIM', real: true,
      ex: [0, -0.6, 0.8], lo: [0, 1.2, 0], tag: '弯曲木层压的大曲线',
      desc: '三角钢琴的 rim（外壳大曲线）是把薄木条加热加压弯出来的——这条曲线不是装饰：它围成的刚性腔体让音板有稳定的支撑边界。底板前后段（bottom_back/front）封住箱体底部，撑条（brace）把结构应力分散到琴腿。',
      specs: [['工艺', '薄木热压弯曲'], ['功能', '音板边界刚性'], ['组成', 'rim + 底板 + 撑条']] },
    { id: 'lid', zh: '琴盖', en: 'LID', real: true,
      ex: [0, 2.2, 1.4], lo: [0, 1.4, 0.4], tag: '可调的反射角',
      desc: '大盖板支起的角度决定声音投向前方听众还是向上消散——音乐厅里开满盖、家庭里半开（short prop stick）就是这个原因。lid_drop 是盖板的限位落杆，lid_rim 是密封沿。盖板内侧通常也涂装成镜面，让观众从舞台上看见"钢琴的背面"。',
      specs: [['开度', '全开 / 短撑半开'], ['声学', '反射方向控制'], ['细节', '限位落杆防滑落']] },
    { id: 'pedals', zh: '踏板组', en: 'PEDALS', real: true,
      ex: [-1.2, 0.2, 1.6], lo: [0, 1.0, 0.8], tag: '右延音 · 左弱音',
      desc: '三角钢琴三个踏板：右踏板抬起全部制音器让弦自由共鸣（延音），左踏板把整个击弦机横移让琴槌少敲一根弦（弱音），中踏板只保持已按下的制音器（selective sustain）。踏板经 base 与 bar 两级杠杆传到机芯——脚法是钢琴演奏的第二语言。',
      specs: [['右', '延音（抬全部制音器）'], ['左', '弱音（击弦机移位）'], ['中', '选择性延音']] },
    { id: 'furniture', zh: '琴凳与脚轮', en: 'BENCH & CASTERS', real: true,
      ex: [1.6, -0.2, 2.0], lo: [0, 1.0, 0.6], tag: '三条腿上的 490 公斤',
      desc: '三角钢琴重达 490 公斤，三条粗腿与脚轮承担全部重量——腿的结构要同时抵抗弦张力带来的前倾力矩。琴凳高度决定演奏姿势，谱架（music rack）承放乐谱。这些"非发声部件"占了一架钢琴一半的木工量。',
      specs: [['重量', '约 490 kg'], ['受力', '弦张力前倾力矩'], ['附件', '琴凳 / 谱架 / 脚轮']] },
  ],
});
