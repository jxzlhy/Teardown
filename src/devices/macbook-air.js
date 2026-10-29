/* =============================================================
   设备配置：Apple MacBook Air 15″ (M4, 2026 天蓝)
   官方 GLB：Apple 产品页 AR 资产转换（开盖态）
   无风扇设计是拆解叙事核心
============================================================= */
import { makeDevice, anchorParts, composePostLoad } from './_kit/factory.js';
import { mainboard, battery, speakerBox } from './_kit/internals.js';

const builders = {
  board: (g)=>{ mainboard(g, { w:8.4, h:5.0, soc:[-1.6,.8], ram:[1.4,.7], label:'APPLE M4', sub:'820-0xxxx · LOGIC BOARD', pcb:'#1a2a4a', smalls:16 }); g.rotation.x = -Math.PI/2; },
  battery: (g)=>{ battery(g, { w:8.0, h:5.2, d:.5, label:'APPLE', capacity:'53.8 Wh', model:'A3xxx', rating:'11.4V' }); g.rotation.x = -Math.PI/2; },
  'speaker-l': (g)=> speakerBox(g, 3.0, 1.3, .7),
  'speaker-r': (g)=> speakerBox(g, 3.0, 1.3, .7),
};

export default makeDevice({
  id: 'macbook-air',
  name: 'Apple MacBook Air 15″ (M4)',
  en: 'MBA15 2026',
  category: '笔记本',
  brand: 'APPLE',
  tagline: '天蓝色 · 无风扇静音设计',
  description: 'MacBook Air 15″：M4 芯片、天蓝色全新阳极配色与无风扇静音设计——没有风扇的笔记本靠铝壳散热，是“少即是多”的工程范本。官方产品页模型（2026 天蓝款，Apple AR 资产转换），内构件为示意重建。',
  specs: [
    ['芯片','Apple M4（10 核）'],['屏幕','15.3″ Liquid Retina 2880×1864'],['散热','无风扇'],
    ['电池','53.8 Wh · 18h 视频'],['端口','雷雳 4 ×2 · MagSafe 3'],['摄像头','12MP Center Stage'],
    ['配色','天蓝（2026 新色）'],['重量','1.51 kg'],
  ],
  accent: '#9fc3d9',
  source: 'Apple 官网 AR 模型（USDZ 转制）',
  targetWidth: 13.0,
  thumbDir: [0.9, 0.35, 1.4],
  camDist: 1.2,
  glb: '/assets/macbook-air.glb',
  /* 策展导览：屏→顶壳→主板→电池→双扬声器→底壳（无风扇叙事） */
  tour: ['display-assembly','top-case','board','battery','speaker-l','speaker-r','bottom-case'],
  xrayShellIds: ['top-case','bottom-case','display-assembly'],
  normalize: 'full',
  frontAxis: '-z',
  mapByPosition(name, p, rel){
    if(p.y > 3.0) return 'display-assembly';
    if(p.y < -5.0) return 'bottom-case';
    return 'top-case';
  },
  realPartIds: ['display-assembly','top-case','bottom-case'],
  builders,
  parts: [
    { id:'display-assembly', zh:'屏幕总成', en:'DISPLAY ASSEMBLY', real:true,
      ex:[0,1.6,2.6], lo:[0,1.8,0], tag:'15.3″ Liquid Retina',
      desc:'15.3 英寸 Liquid Retina：2880×1864、500nit 与 P3 广色域，刘海内藏 12MP Center Stage 摄像头，支持 iPhone 同款前置正方形取景。',
      specs:[['面板','IPS LCD 2880×1864'],['亮度','500 nit'],['色域','P3 广色域'],['摄像头','12MP Center Stage']] },
    { id:'top-case', zh:'C 面（键盘与触控板）', en:'TOP CASE', real:true,
      ex:[0,.2,2.4], lo:[0,1.6,0], tag:'一体铝 · 无风扇静音',
      desc:'CNC 一体 C 面：背光 Magic Keyboard 与 Force Touch 触控板；C 面之下没有风扇——M4 的能效让整个散热系统只是一片铝。',
      specs:[['键盘','背光 Magic Keyboard'],['触控板','Force Touch'],['散热','无风扇设计'],['材质','100% 再生铝']] },
    { id:'bottom-case', zh:'D 面（底壳）', en:'BOTTOM CASE', real:true,
      ex:[0,-1.4,2.0], lo:[0,1.4,0], tag:'pentalobe ×4',
      desc:'D 面经 4 颗 pentalobe 螺丝固定：底面两侧细缝进气、铰链处出风的被动风道，配合大面积铝壳把 M4 的热量直接散进空气。',
      specs:[['固定','pentalobe ×4'],['风道','底进铰链出'],['特性','无风扇 · 静音']] },
    { id:'board', zh:'逻辑主板', en:'M4 LOGIC BOARD',
      ex:[0,2.6,-1.0], lo:[0,1.5,0], tag:'M4 · 板载内存',
      desc:'窄条主板贴装于 C 面后部：M4（10 核 CPU / 10 核 GPU）与 16-32GB 统一内存板载；没有散热器和热管——M4 低功耗直接由铝壳导出。',
      specs:[['SoC','M4 10 核'],['内存','16-32GB'],['存储','256GB-2TB'],['散热','被动（无风扇）']] },
    { id:'battery', zh:'电池', en:'BATTERY 53.8 Wh',
      ex:[0,-3.0,-.6], lo:[0,1.6,0], tag:'53.8 Wh · 18 小时',
      desc:'53.8 Wh 锂聚合物电池：M4 能效支撑 18 小时视频续航；无风扇机身内部没有任何活动件，安静且几乎免维护。',
      specs:[['容量','53.8 Wh'],['续航','18h 视频'],['快充','MagSafe 3 70W']] },
    { id:'speaker-l', zh:'左扬声器', en:'LEFT SPEAKER',
      ex:[-2.8,-.8,1.4], lo:[0,1.3,0], tag:'双单元（左）',
      desc:'左侧扬声器组藏于 C 面两侧：低音 + 高音双单元经掌托侧面栅格出音，支持杜比全景声。',
      specs:[['配置','低音 + 高音'],['特性','杜比全景声']] },
    { id:'speaker-r', zh:'右扬声器', en:'RIGHT SPEAKER',
      ex:[2.8,-.8,1.4], lo:[0,1.3,0], tag:'双单元（右）',
      desc:'右侧扬声器组与左侧对称，录音室级三麦克风阵列集成于上缘。',
      specs:[['配置','低音 + 高音'],['录音','三麦阵列']] },
  ],
  postLoad: composePostLoad(
    anchorParts({
      board:       { ref:'top-case', dy:-.2, dz:-2.0 },
      battery:     { ref:'top-case', dy:-1.0, dz:-.4 },
      'speaker-l': { ref:'top-case', dy:-.4, dz:1.4 },
      'speaker-r': { ref:'top-case', dy:-.4, dz:1.4 },
    }),
  ),
  tick: null,
});
