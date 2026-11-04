/* =============================================================
   设备配置：手摇留声机（机械录音重放 · 无电力）
   社区模型（Sketchfab · dylanheyes，CC-BY 4.0）：10 网格全语义命名
   （Horn/Body/Vinyl Tray/Vinyl/VinylRing×2/Handle×2/Trim/Chrome）
   bbox 1.30×1.81×1.08（喇叭朝上，Y 负段为箱体）→ normalize full 落地
   结构：喇叭→唱盘组（唱片+托盘+环）→箱体→摇柄
============================================================= */
import { makeDevice } from './_kit/factory.js';

export default makeDevice({
  id: 'gramophone',
  demos: [
    { partId: 'turntable', label: '转盘 33⅓ rpm（真实速率）', spin: 'auto', speed: 3.49 },
  ],
  name: '手摇留声机',
  en: 'GRAMOPHONE',
  category: '影音',
  brand: 'GENERIC',
  tagline: '一根唱针 · 一片喇叭 · 全靠人力驱动',
  description: '手摇留声机是纯机械的声音重放机：摇柄上紧发条，齿轮组以恒速带动唱盘旋转，唱针沿胶木唱片的声槽起伏振动，经音臂的杠杆传导推动喇叭膜片——没有电，没有放大器，声音的"功率"全部来自那一圈圈上紧的发条。本页拆成 5 组：黄铜喇叭、唱盘组（唱片/托盘/压环）、木质箱体与装饰件、摇柄传动。',
  specs: [
    ['驱动', '发条齿轮组（人力上弦）'],
    ['重放', '唱针 → 膜片 → 喇叭'],
    ['介质', '78 转胶木唱片'],
    ['结构', '5 组核心部件'],
  ],
  accent: '#c9a227',
  source: '社区模型（Sketchfab）',
  modelCredit: 'Gramophone by dylanheyes (Sketchfab, CC-BY 4.0)',
  modelSource: 'https://sketchfab.com/3d-models/gramophone-896398c16ed94dbba416a04ecc3f8f01',
  targetWidth: 10,
  normalize: 'full',
  frontAxis: '+z',
  glb: '/assets/gramophone.glb',
  mappingPrefix: {
    'Gramophone_Horn':           'horn',
    'Gramophone_VinylTray':      'turntable',
    'Gramophone_VinylRingInside':'turntable',
    'Gramophone_VinylRingOutside':'turntable',
    'Gramophone_Vinyl':          'turntable',
    'Gramophone_Body':           'cabinet',
    'Gramophone_Trim':           'cabinet',
    'Gramophone_Chrome':         'cabinet',
    'Handle_Handle':             'crank',
    'Handle_Chrome':             'crank',
  },
  tour: ['horn', 'turntable', 'cabinet', 'crank'],
  xrayShellIds: ['cabinet'],
  realPartIds: ['horn', 'turntable', 'cabinet', 'crank'],
  parts: [
    { id: 'horn', zh: '黄铜喇叭', en: 'BRASS HORN', real: true,
      ex: [0, 2.2, -0.8], lo: [0, 1.4, 0], tag: '既是扩音器 · 也是共鸣腔',
      desc: '喇叭不只是"扬声器"——它是整条声学链的最后一段：唱针的机械振动经膜片变成空气振动后，指数展开的铜喇叭负责把声阻抗匹配到开阔空气里。喇叭的锥度曲线决定了音色：越接近指数型，高频越清亮。',
      specs: [['材质', '黄铜旋压'], ['声学', '阻抗匹配 + 共鸣'], ['指向', '喇叭口朝上开腔']] },
    { id: 'turntable', zh: '唱盘组', en: 'TURNTABLE', real: true,
      ex: [0, 0.8, 1.6], lo: [0, 1.1, 0], tag: '唱片 + 托盘 + 压环',
      desc: '唱盘托着 78 转胶木唱片，压环把唱片压平贴合托盘——任何翘曲都会让唱针跳槽。转速恒定是重放的命门：发条走松、转速下降，音调随之变低。唱盘轴的润滑状态直接决定一次上弦能播多久。',
      specs: [['转速', '78 r/min（发条恒速）'], ['平整', '压环压贴唱片'], ['衰减', '发条松弛 → 音调变低']] },
    { id: 'cabinet', zh: '木质箱体', en: 'CABINET', real: true,
      ex: [0, -1.4, 0.6], lo: [0, 1.0, 0], tag: '机构的地板 · 也是共鸣箱',
      desc: '木箱内部藏着发条齿轮组与音臂支座——它是整套机构的安装地板。木材的选择影响音色：硬木箱体把机构振动连同音乐一起轻微染色，这也是"老留声机声音温润"的一部分。铜饰件同时是箱体角部的补强。',
      specs: [['内部', '发条齿轮组 + 音臂座'], ['声学', '箱体轻微染色'], ['饰件', '铜角补强']] },
    { id: 'crank', zh: '摇柄传动', en: 'CRANK & SPRINGS', real: true,
      ex: [1.4, -0.8, -1.2], lo: [0, 1.0, -0.4], tag: '人力 → 发条 → 恒速输出',
      desc: '摇柄带动发条上弦，棘轮防止回弹；播放时发条经齿轮组减速稳速输出到唱盘轴。一整圈摇柄约换 30 秒播放时间——"听一首歌摇三次"是留声机时代的日常。齿轮组的调速离心摆决定恒速品质。',
      specs: [['储能', '发条（棘轮防回弹）'], ['比例', '一圈摇柄 ≈ 30s 播放'], ['稳速', '离心调速摆']] },
  ],
  /* V4.0 MI①：储能→稳速→输出链（33⅓ rpm 真实速率；离心摆调速为示意口径） */
  mech: { driver: 'crank', edges: [
    { id: 'cr-crank-spring', type: 'gear_mesh', from: 'crank', to: 'cabinet', kinematic: 'approx', note: '摇柄经棘轮给发条上弦（棘轮防回弹）；发条藏于柜体内，本模型未建发条件' },
    { id: 'bd-turntable', type: 'bearing_support', from: 'cabinet', to: 'turntable', kinematic: 'exact', note: '唱盘轴支承于柜体轴承' },
    { id: 'gm-drive', type: 'gear_mesh', from: 'cabinet', to: 'turntable', kinematic: 'approx', note: '发条经齿轮组减速稳速输出 33⅓ rpm（离心调速摆稳速——调速细部未建模，示意口径）' },
    { id: 'fx-horn', type: 'fixed', from: 'cabinet', to: 'horn', note: '号角固定于柜体声臂' },
  ] },
});
