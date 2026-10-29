/* =============================================================
   设备配置：复古桌面风扇（金属扇头 · 可拆电源线）
   社区模型（Sketchfab · dylanheyes，CC-BY 4.0）：7 网格全语义命名
   （Fan_Body/Fan_Chrome 风头、Body_Body/Body_Chrome 机身、Cable×3 电源线）
   bbox 20.5×19.6×15.8；描述明示"插头与线缆可拆卸"（分件被文本证实）
   结构：风头（网罩+扇叶）→ 机身立柱 → 电源线（可拆）
============================================================= */
import { makeDevice } from './_kit/factory.js';

export default makeDevice({
  id: 'retro-fan',
  name: '复古桌面风扇',
  en: 'RETRO DESK FAN',
  category: '家电',
  brand: 'DYLANHEYES',
  tagline: '摇头、三档、金属网罩 · 风扇的全部哲学',
  description: '复古金属桌面风扇把"送风"简化到不能再简：罩极电机带动扇叶，金属网罩挡住手指，摇头机构让风扫过房间。本页按 3 组拆解——风头（网罩与扇叶）、机身立柱（含底座与摇头机构）、电源线（描述明确标注插头与线缆可拆卸）。这类风扇能传三代：没有电路板，坏了两颗螺丝就能修。',
  specs: [
    ['类型', '金属桌面风扇 · 摇头式'],
    ['风头', '金属网罩 + 扇叶'],
    ['档位', '机械按键调速'],
    ['摇头', '齿轮偏心机构'],
    ['拆解', '3 组核心部件'],
  ],
  accent: '#5b9aa0',
  source: '社区模型（Sketchfab）',
  modelCredit: 'Retro Fan by dylanheyes (Sketchfab, CC-BY 4.0)',
  modelSource: 'https://sketchfab.com/3d-models/45bccd8afa834e84b690fb91e34f9262',
  targetWidth: 10,
  normalize: 'full',
  frontAxis: '+z',
  glb: '/assets/retro-fan.glb',
  mapping: {
    'Fan_Body':   'fan-head',
    'Fan_Chrome': 'fan-head',
    'Body_Body':  'body',
    'Body_Chrome':'body',
    'Cable_Cable':'cable',
    'Cable_Body': 'cable',
    'Cable_Copper':'cable',
  },
  tour: ['fan-head', 'body', 'cable'],
  xrayShellIds: ['fan-head'],
  realPartIds: ['fan-head', 'body', 'cable'],
  parts: [
    { id: 'fan-head', zh: '风头', en: 'FAN HEAD', real: true,
      ex: [0, 1.0, 1.2], lo: [0, 1.2, 0.4], tag: '网罩 + 扇叶 + 罩极电机',
      desc: '风头是风扇的全部功能件：外层金属网罩（几十根钢丝圈成，防止手指触到扇叶），内层扇叶由罩极电机直接驱动。扇叶的倾角与数量决定风感——大倾角低转速风柔，小倾角高转速风硬。网罩的钢丝间距是安全标准的核心指标。',
      specs: [['组成', '网罩 + 扇叶 + 罩极电机'], ['安全', '网罩钢丝间距'], ['风感', '倾角 × 转速']] },
    { id: 'body', zh: '机身与立柱', en: 'BODY & STAND', real: true,
      ex: [0, -0.6, 0.8], lo: [0, 1.1, 0], tag: '摇头机构藏在颈管里',
      desc: '机身立柱把风头举到桌面高度，底座里是配重与调速按键组。风头的"摇头"来自颈管内的偏心齿轮机构：电机输出经齿轮组带动风头每几秒摆动一次——摇头角度由离合按钮控制，按下停止摇头、松开恢复摆动。',
      specs: [['配重', '底座防倾'], ['摇头', '偏心齿轮 + 离合'], ['调速', '底座按键组']] },
    { id: 'cable', zh: '电源线（可拆）', en: 'DETACHABLE CABLE', real: true,
      ex: [-1.2, -0.8, 0.6], lo: [0, 1.0, 0.2], tag: '插头与线缆可拆卸',
      desc: '电源线与插头是可拆卸设计：收纳时拔下线缆缠绕在底座下。可拆线的意义不止收纳——线缆是最易损坏的部件（弯折疲劳、宠物啃咬），可拆意味着换线不需要拆机。铜芯导线的截面决定电流承载，风扇电机功率小，线径安全余量很大。',
      specs: [['形式', '插头 + 线缆可拆卸'], ['维护', '换线免拆机'], ['安全', '线径余量大']] },
  ],
});
