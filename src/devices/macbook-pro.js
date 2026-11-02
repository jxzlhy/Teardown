/* =============================================================
   设备配置：Apple MacBook Pro 14" (M4, 2024)
   官方 GLB：Apple 产品页 AR 资产转换（开盖态，46 网格）
   位置映射：屏幕总成 y>3 / 底壳 y<-5 / 其余 C 面
============================================================= */
import { makeDevice, anchorParts, composePostLoad } from './_kit/factory.js';
import { mainboard, fan, battery, speakerBox } from './_kit/internals.js';

const builders = {
  board: (g)=>{ mainboard(g, { w:8.8, h:5.4, soc:[-1.7,.9], ram:[1.5,.7], label:'APPLE M4 PRO', sub:'820-04xxx · LOGIC BOARD', pcb:'#1a2a4a', smalls:20 }); g.rotation.x = -Math.PI/2; },
  'fan-l': (g)=>{ fan(g, 1.5, .4); g.rotation.x = -Math.PI/2; },
  'fan-r': (g)=>{ fan(g, 1.5, .4); g.rotation.x = -Math.PI/2; },
  battery: (g)=>{ battery(g, { w:8.4, h:5.6, d:.5, label:'APPLE', capacity:'72.4 Wh', model:'A3186', rating:'11.47V' }); g.rotation.x = -Math.PI/2; },
  'speaker-l': (g)=> speakerBox(g, 3.2, 1.4, .8),
  'speaker-r': (g)=> speakerBox(g, 3.2, 1.4, .8),
};

export default makeDevice({
  id: 'macbook-pro',
  era: 2024,
  name: 'Apple MacBook Pro 14″ (M4)',
  en: 'MBP14 2024',
  category: '笔记本',
  brand: 'APPLE',
  tagline: 'Nano-texture · 24h 续航',
  description: 'MacBook Pro 14″：M4 系列芯片、Liquid Retina XDR 迷你 LED 屏与全日续航的专业笔记本。官方产品页模型（开盖态，Apple AR 资产转换），内构件为示意重建。',
  specs: [
    ['芯片','M4 / M4 Pro / M4 Max'],['屏幕','14.2″ XDR 3024×1964'],['亮度','1000nit 持续 · 1600 峰值'],
    ['电池','72.4 Wh · 24h 视频'],['端口','HDMI · SDXC · 雷雳 ×3'],['摄像头','12MP Center Stage'],
    ['音频','六扬声器 · 录音室麦'],['重量','1.55 kg'],
  ],
  accent: '#a9b2ba',
  source: 'Apple 官网 AR 模型（USDZ 转制）',
  distribution: 'local-demo-only',
  targetWidth: 13.0,
  thumbDir: [0.9, 0.35, 1.4],   /* 半开形态：压低视角让屏幕占比更大 */
  camDist: 1.2,
  glb: '/assets/macbook-pro.glb',
  /* 策展导览：屏→顶壳→主板→双风扇→电池→扬声器→底壳 */
  tour: ['display-assembly','top-case','board','fan-l','fan-r','battery','speaker-l','speaker-r','bottom-case'],
  xrayShellIds: ['top-case','bottom-case','display-assembly'],
  normalize: 'full',
  frontAxis: '-z',      /* 开盖屏幕朝 -Z */
  mapByPosition(name, p, rel){
    if(p.y > 3.0) return 'display-assembly';
    if(p.y < -5.0) return 'bottom-case';
    return 'top-case';
  },
  realPartIds: ['display-assembly','top-case','bottom-case'],
  builders,
  parts: [
    { id:'display-assembly', zh:'屏幕总成', en:'DISPLAY ASSEMBLY', real:true,
      ex:[0,1.6,2.6], lo:[0,1.8,0], tag:'Liquid Retina XDR',
      desc:'14.2 英寸 Liquid Retina XDR：迷你 LED 背光 2594 分区实现 1,000,000:1 对比度，选配纳米纹理玻璃在强光下去眩光；1000nit 全屏持续亮度为视频调色而生。',
      specs:[['面板','mini-LED 2594 分区'],['分辨率','3024×1964'],['亮度','1000 持续/1600 峰值'],['选配','纳米纹理玻璃']] },
    { id:'top-case', zh:'C 面（键盘与触控板）', en:'TOP CASE', real:true,
      ex:[0,.2,2.4], lo:[0,1.6,0], tag:'一体铝 · 剪刀脚背光键',
      desc:'CNC 一体成型 C 面：1mm 键程剪刀脚背光键盘、Force Touch 触控板与六扬声器腔体集成一块铝板，两侧掌托下藏天线窗口。',
      specs:[['工艺','一体 CNC'],['键盘','背光剪刀脚 1mm'],['触控板','Force Touch'],['音频','六扬声器']] },
    { id:'bottom-case', zh:'D 面（底壳）', en:'BOTTOM CASE', real:true,
      ex:[0,-1.4,2.0], lo:[0,1.4,0], tag:'卡扣 + 六角螺丝',
      desc:'D 面经 6 颗 pentalobe 螺丝与卡扣固定：拆开后即见电池与主板；底面两侧进气缝配合铰链处出风形成完整风道。',
      specs:[['固定','pentalobe ×6'],['进风','底面两侧缝'],['出风','铰链处'],['材质','回收再生铝']] },
    { id:'board', zh:'逻辑主板', en:'MAIN LOGIC BOARD',
      ex:[0,3.4,-1.2], lo:[0,1.6,0], tag:'M4 Pro · 板载内存',
      desc:'主板集中在 C 面后部：M4/M4 Pro/M4 Max SoC 与统一内存、双 SSD 模组板载；SoC 上方是均热板与双风扇的组合散热。',
      specs:[['SoC','M4 10核 / M4 Pro 14核'],['内存','16-48GB（Max 128GB）'],['存储','512GB-4TB'],['散热','均热板 + 双扇']] },
    { id:'fan-l', zh:'左风扇', en:'LEFT FAN',
      ex:[-2.6,4.4,-1.2], lo:[0,1.3,0], tag:'离心风扇（左）',
      desc:'左侧离心风扇：薄至 3mm 的叶片从底面吸气，把 M4 的热量经铰链侧风口排出。',
      specs:[['类型','超薄离心'],['进出','底进 · 铰链出']] },
    { id:'fan-r', zh:'右风扇', en:'RIGHT FAN',
      ex:[2.6,4.4,-1.2], lo:[0,1.3,0], tag:'离心风扇（右）',
      desc:'右侧离心风扇与左侧对称布置，满载渲染时双扇仍维持图书馆级噪音。',
      specs:[['类型','超薄离心'],['噪音','图书馆级']] },
    { id:'battery', zh:'电池', en:'BATTERY 72.4 Wh',
      ex:[0,-3.4,-.8], lo:[0,1.6,0], tag:'72.4 Wh · 24 小时',
      desc:'72.4 Wh 锂聚合物电池铺满 D 面大部分区域：M4 能效让视频播放续航达到 24 小时——全日离电工作成为常态。',
      specs:[['容量','72.4 Wh'],['续航','24h 视频播放'],['快充','96W USB-C'],['电芯','聚合物多电芯']] },
    { id:'speaker-l', zh:'左扬声器', en:'LEFT SPEAKER',
      ex:[-3.2,-1.6,1.6], lo:[0,1.3,0], tag:'低音单元（左）',
      desc:'左侧扬声器组：双低音单元对置消振，经掌托侧面的导声栅出音，低频下潜比上代更深。',
      specs:[['配置','低音 ×2 + 高音'],['出音','掌托侧面栅']] },
    { id:'speaker-r', zh:'右扬声器', en:'RIGHT SPEAKER',
      ex:[3.2,-1.6,1.6], lo:[0,1.3,0], tag:'低音单元（右）',
      desc:'右侧扬声器组与左侧对称，支持空间音频与杜比全景声混音监听。',
      specs:[['配置','低音 ×2 + 高音'],['特性','空间音频']] },
  ],
  postLoad: composePostLoad(
    anchorParts({
      board:       { ref:'top-case', dy:-.2, dz:-2.2 },
      'fan-l':     { ref:'top-case', dy:-.2, dz:-2.2 },
      'fan-r':     { ref:'top-case', dy:-.2, dz:-2.2 },
      battery:     { ref:'top-case', dy:-1.0, dz:-.6 },
      'speaker-l': { ref:'top-case', dy:-.4, dz:1.4 },
      'speaker-r': { ref:'top-case', dy:-.4, dz:1.4 },
    }),
  ),
  tick: null,
});
