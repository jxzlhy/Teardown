/* =============================================================
   设备配置：Apple Studio Display (2026)
   官方 GLB：Apple 产品页 AR 资产转换（含支架）
============================================================= */
import { makeDevice, anchorParts, composePostLoad } from './_kit/factory.js';
import { mainboard, speakerBox, shield } from './_kit/internals.js';

const builders = {
  board: (g)=> mainboard(g, { w:10.0, h:4.6, soc:[-2.0,.8], ram:[1.7,.6], label:'APPLE A13', sub:'820-0xxxx · DISPLAY BOARD', pcb:'#1a2a4a', smalls:14 }),
  psu: (g)=> shield(g, 8.6, 3.6, .5),
  speaker: (g)=> speakerBox(g, 3.4, 1.2, .8),
};

export default makeDevice({
  id: 'studio-display',
  era: 2022,
  name: 'Apple Studio Display',
  en: 'STUDIO DISPLAY',
  category: '台式机',
  brand: 'APPLE',
  tagline: '27″ 5K · 一体铝',
  description: 'Studio Display：27 英寸 5K（218 PPI）玻璃与铝一体成型显示器，内置 A13 芯片驱动 Center Stage 人物居中与空间音频，600nit 全屏亮度，可为 Mac 反向供电 96W。官方产品页模型（Apple AR 资产转换），内构件为示意重建。',
  specs: [
    ['面板','27″ IPS 5120×2880（218 PPI）'],['亮度','600 nit 全屏'],['色域','P3 · 原彩显示'],
    ['芯片','A13（Center Stage · Siri）'],['摄像头','12MP 超广角'],['音频','六扬声器 · 三麦'],
    ['供电','96W 主机反充'],['接口','雷雳 3 ×3 · USB-C ×2'],
  ],
  accent: '#c4ccd4',
  source: 'Apple 官网 AR 模型（USDZ 转制）',
  distribution: 'local-demo-only',
  targetWidth: 13.0,
  camDist: 1.3,
  glb: '/assets/studio-display.glb',
  /* 策展导览：显示体→支架→底座→主板→电源→扬声器 */
  tour: ['display-body','stand','foot','board','psu','speaker'],
  xrayShellIds: ['display-body'],
  normalize: 'full',
  mapByPosition(name, p, rel){
    if(p.y < -14) return p.z < 2 ? 'stand' : 'foot';
    return 'display-body';
  },
  realPartIds: ['display-body','stand','foot'],
  builders,
  parts: [
    { id:'display-body', zh:'显示体', en:'DISPLAY ENCLOSURE', real:true,
      ex:[0,.6,2.8], lo:[0,1.9,0], tag:'27″ 5K · 11.5mm',
      desc:'27 英寸 5K 显示体：5120×2880 分辨率（218 PPI）、600nit 全屏亮度与 P3 广色域，窄边框玻璃与铝壳一体成型；Nano-texture 纳米纹理玻璃可选。',
      specs:[['分辨率','5120×2880 5K'],['像素密度','218 PPI'],['亮度','600 nit'],['可选','纳米纹理玻璃']] },
    { id:'stand', zh:'支架', en:'STAND', real:true,
      ex:[0,-1.6,.8], lo:[0,1.5,0], tag:'阻力铰链 · 免工具',
      desc:'铝制支架：阻力铰链一指调节俯仰 -5°~+25°；可选高度可调或 VESA 壁装版本，拆装免工具。',
      specs:[['俯仰','-5° ~ +25°'],['选配','高度可调 / VESA'],['材质','一体铝']] },
    { id:'foot', zh:'底座', en:'BASE', real:true,
      ex:[0,-2.6,.4], lo:[0,1.2,0], tag:'大面积稳定底座',
      desc:'宽大底座保证 27 英寸屏体的稳定，底面整圈防滑垫。',
      specs:[['结构','一体铝底座'],['防滑','环形胶垫']] },
    { id:'board', zh:'逻辑主板', en:'A13 DISPLAY BOARD',
      ex:[0,2.4,-.4], lo:[0,1.6,0], tag:'A13 · 信号处理',
      desc:'显示体内主板：A13 芯片驱动 12MP Center Stage 人物居中摄像头、Siri 语音与“喂 Siri”唤醒，同时负责 5K 信号处理与雷雳 3 菊花链。',
      specs:[['芯片','A13'],['摄像头','12MP 超广角'],['扩展','3× 雷雳 3 菊花链'],['麦克风','录音室级三麦']] },
    { id:'psu', zh:'电源模块', en:'POWER SUPPLY',
      ex:[-2.2,2.6,-1.2], lo:[0,1.4,0], tag:'96W 主机反充',
      desc:'内置 96W 电源：单根雷雳线缆同时传 5K 画面并为 MacBook Air/Pro 反向供电，桌面只剩一根线。',
      specs:[['功率','96W 反充'],['接口','雷雳 3 单线方案']] },
    { id:'speaker', zh:'扬声器系统', en:'SIX-SPEAKER SYSTEM',
      ex:[2.2,2.4,-1.0], lo:[0,1.4,0], tag:'六扬声器 · 杜比全景声',
      desc:'下巴两侧各三枚扬声器：双低音强制消振，支持空间音频与杜比全景声，三麦克风景音室级收音。',
      specs:[['配置','6 扬声器（含 2 低音）'],['特性','空间音频'],['录音','三麦阵列']] },
  ],
  postLoad: composePostLoad(
    anchorParts({
      board:   { ref:'display-body', dy:1.8, dz:-.2 },
      psu:     { ref:'display-body', dy:1.8, dz:-1.4 },
      speaker: { ref:'display-body', dy:2.2, dz:1.8 },
    }),
  ),
  tick: null,
});
