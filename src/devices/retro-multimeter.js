/* =============================================================
   设备配置：指针万用表（Poly Haven · CC0 扫描）
   7 网格全命名（表体/按键/提手/表盘/旋钮/表笔线/指针）
============================================================= */
import { makeDevice } from './_kit/factory.js';

export default makeDevice({
  id: 'retro-multimeter',
  name: '指针万用表',
  en: 'RETRO MULTIMETER',
  category: '工具',
  brand: 'GENERIC',
  tagline: '一根指针 · 万种电信号的翻译官',
  description: '指针式（模拟）万用表：表笔把电压/电流/电阻接到一只灵敏的动圈表头上，线圈在磁场里受力偏转多少，指针就摆多少——没有采样率，没有刷新率，指针的摆动本身就是连续的真实。电子工程师至今偏爱它看「缓变的漂移」与「呼吸式的波动」，数字表反而看不见。换挡旋钮与表笔插孔的排列，是它全部的使用智慧。',
  specs: [
    ['表头', '动圈式（D\'Arsonval）磁电系'],
    ['量程', 'DCV/ACV/DCA/Ω 多档'],
    ['读数', '指针 + 多重刻度弧'],
    ['内阻', '20kΩ/V 级（对电路有负载）'],
    ['维护', '不用时拨到 OFF/ACV 最高档'],
    ['来源', 'Poly Haven（CC0 扫描）'],
  ],
  accent: '#e08f3c',
  source: 'Poly Haven（CC0）',
  modelCredit: 'Retro Multimeter by Poly Haven (CC0)',
  modelSource: 'https://polyhaven.com/a/retro_multimeter',
  targetWidth: 7,
  normalize: 'full',
  glb: '/assets/retro-multimeter.glb',
  tour: ['body','dial','needle','knob','buttons','leads','handle'],
  xrayShellIds: ['body'],
  mapping: {
    /* 重名节点运行时回退为网格名 lP_body002（表体双网格），见 __RAW.names */
    'lP_body002': 'body',
    'lP_body002_1': 'body',
    'retro_multimeter_buttons_LOD0': 'buttons',
    'retro_multimeter_handle_LOD0': 'handle',
    'retro_multimeter_dial_LOD0': 'dial',
    'retro_multimeter_knob_LOD0': 'knob',
    'retro_multimeter_cables_LOD0': 'leads',
    'retro_multimeter_needle_LOD0': 'needle',
  },
  realPartIds: ['body', 'buttons', 'handle', 'dial', 'knob', 'leads', 'needle'],
  postLoad: ({ partsById }) => {
    /* 深色胶木壳在暗厅里隐形：贴图借自发光；纯色材质直接把本色转自发光 */
    for (const pid of ['body', 'dial']) {
      const p = partsById[pid]; if (!p) continue;
      p.group.traverse(o => {
        if (!o.isMesh) return;
        const mats = Array.isArray(o.material) ? o.material : [o.material];
        for (const m of mats) {
          if (m.map && !m.emissiveMap) { m.emissiveMap = m.map; m.emissive.setScalar(0.4); }
          else if (!m.map && m.color && m.emissive) { m.emissive.copy(m.color).multiplyScalar(1.6); }
        }
      });
    }
  },
  parts: [
    { id: 'body', zh: '表体与动圈表头', en: 'BODY & D\'ARSONVAL', real: true,
      ex: [0, 0, 0.5], lo: [0, 1.3, 0], tag: '磁电系表头 · 一切精度的根',
      desc: '表体：核心是一只 D\'Arsonval 动圈表头——细漆包线绕成的线圈悬在永磁体磁场中，电流通过便受力偏转，游丝把它拉回平衡。表头的满偏电流（几十微安）决定整机灵敏度；拜它所赐，模拟表无需电池也能测电压电流（测电阻才用内置电池）。',
      specs: [['原理', '动圈 + 永磁 + 游丝'], ['灵敏度', 'µA 级满偏'], ['免电池', '测 V/A 不用电池'], ['性格', '连续读数无采样']] },
    { id: 'dial', zh: '刻度盘', en: 'DIAL FACE', real: true,
      ex: [0, 0.8, 1.2], lo: [0, 1.1, 0], tag: '七八条刻度弧各管一行',
      desc: '刻度盘：一块玻璃下压着好几条刻度弧——线性电压弧、对数电阻弧（Ω 档越靠左越密）、分贝弧……读哪条取决于旋钮档位。电阻档每次换挡还要「调零」：短接表笔拧调零电位器，这是模拟表独有的仪式。',
      specs: [['刻度', '线性/对数多弧'], ['电阻档', '换挡必调零'], ['读数', '档位 × 刻度'], ['玻璃', '防静电表镜']] },
    { id: 'needle', zh: '指针', en: 'POINTER NEEDLE', real: true,
      ex: [0, 1.4, 0.9], lo: [0, 1.0, 0], tag: '表头的灵魂 · 砸坏一根废一台',
      desc: '指针：轻质铝管针，靠着表头的轴承与游丝悬着——运输要锁表头短接开关，跌落几乎必弯。它的阻尼恰到好处：快信号轻轻颤、慢信号稳稳停，工程师看「指针抖动的性格」就能猜出电路在干什么。',
      specs: [['材质', '铝管 + 配重'], ['保护', '运输锁 / 短接'], ['阻尼', '临界阻尼手感'], ['待遇', '整表最娇贵件']] },
    { id: 'knob', zh: '功能旋钮', en: 'RANGE KNOB', real: true,
      ex: [-1.4, -0.5, 1.1], lo: [0, 1.0, 0], tag: '选错档 = 烧表的第一原因',
      desc: '功能旋钮：DCV/ACV/DCA/Ω 四大类 × 若干量程——「电流档当电压档用」会直接把表头烧断，所以老师的口头禅是「先看档位再碰表笔」。旋钮的档位弹子手感清晰，闭着眼都能听出换到哪一档。',
      specs: [['档位', 'V/A/Ω × 量程阵'], ['大忌', '电流档测电压'], ['手感', '弹子定位'], ['习惯', '用完拨回 ACV 最高档']] },
    { id: 'buttons', zh: '调零与功能键', en: 'ZERO-ADJ & BUTTONS', real: true,
      ex: [1.3, 0.4, 1.0], lo: [0, 1.0, 0], tag: 'Ω 档短接调零专用',
      desc: '调零钮与功能键：电阻档的调零电位器（短接表笔把指针拨到 0Ω），以及有的表的 HFE/蜂鸣附加键——模拟表上每颗小旋钮都对应一次测量前的准备动作，这份「仪式感」是数字表再也给不了的。',
      specs: [['主角', 'Ω 调零电位器'], ['动作', '短接表笔 → 拨到 0Ω'], ['附加', '晶体管 HFE 测试'], ['位置', '面板侧下']] },
    { id: 'leads', zh: '表笔线', en: 'TEST LEADS', real: true,
      ex: [0.4, -1.6, -0.6], lo: [0, 1.0, 0], tag: '红正黑负 · 万用表的手脚',
      desc: '表笔：红正黑负两根线，香蕉插头插进面板对应量程孔——测电压插 VΩ 孔，测大电流要换到 10A 专用孔（插错孔 = 分流器秒烧）。表笔尖端要常打磨，接触电阻小读数才稳。',
      specs: [['颜色', '红正 / 黑负'], ['插孔', 'VΩ 与 10A 分开'], ['维护', '磨尖 + 查断线'], ['事故', '插错孔 Top1']] },
    { id: 'handle', zh: '提手', en: 'CARRY HANDLE', real: true,
      ex: [0, 1.9, -0.8], lo: [0, 1.0, 0], tag: '现场工程师的携带姿态',
      desc: '提手：皮/胶木提手让这块表跟着工程师跑现场——修理部的桌上永远斜立着一块，提手同时兼任「仰角支架」，把刻度盘转向使用者。这个仰角后来成了万用表工业设计的固定语法。',
      specs: [['角色', '提携 + 仰角支架'], ['姿态', '斜立读数'], ['材质', '胶木 / 皮革'], ['场景', '现场维修标配']] },
  ],
});
