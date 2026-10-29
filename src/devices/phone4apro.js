/* =============================================================
   设备配置：Nothing Phone (4a) Pro
   官方 GLB：nothing.tech 产品页资产（Sanity CDN，cm 尺度）
   网格匿名命名（01..06）→ 按位置聚类：屏 z<-0.25 / 相机岛 y>11.8 / 侧键 |x|>3.4
============================================================= */
import { makeDevice, composePostLoad } from './_kit/factory.js';

export default makeDevice({
  id: 'phone4apro',
  name: 'Nothing Phone (4a) Pro',
  en: 'A067',
  category: '手机',
  brand: 'NOTHING',
  tagline: 'Glyph 137 灯 · 中端透明旗舰',
  description: 'Nothing Phone (4a) Pro：金属中框 + 三颗 50MP（3.5× 潜望长焦回归），137 颗 mini-LED 组成 Glyph 灯语，骁龙 7 Gen 4 与 5080 mAh 大电池。官方产品页模型，内构件随透明设计可视。',
  specs: [
    ['处理器','骁龙 7 Gen 4'],['主摄','50MP LYT-700C · OIS'],['长焦','50MP 3.5× 潜望'],
    ['屏幕','6.83″ AMOLED · 144Hz'],['电池','5080 mAh · 50W'],['灯语','Glyph 137 mini-LED'],
    ['系统','Nothing OS 4.1'],['发布','2026 年 3 月 · $499'],
  ],
  accent: '#d9d9d9',
  source: 'Nothing 官网产品页模型',
  targetWidth: 14.6,   /* 高 163.7mm 为最大维 */
  glb: '/assets/phone4apro.glb',
  normalize: 'full',
  frontAxis: '-z',      /* 屏幕层在 -Z */
  materialMapping: {
    'Light_On':'glyph','Light_Off':'glyph',
    'Screen_Black_Rdge':'screen','Black_Rough':'midframe','Red':'midframe','Speaker':'midframe','USB':'usb',
  },
  mapByPosition(name, p, rel){
    if(p.z < -0.25) return 'screen';
    if(p.y > 11.8 && p.z > 0.05) return 'camera-island';
    if(Math.abs(p.x) > 3.4) return 'buttons';
    if(p.y < 1.0 && Math.abs(p.x) < 1.5) return 'usb';
    return 'midframe';
  },
  realPartIds: ['screen','camera-island','glyph','midframe','buttons','usb'],
  parts: [
    { id:'screen', zh:'正面屏幕', en:'FRONT DISPLAY', real:true,
      ex:[0,.2,3.0], lo:[0,1.5,0], tag:'6.83″ AMOLED · 144Hz',
      desc:'6.83 英寸 AMOLED 大屏：1.5K（2800×1260）分辨率、144Hz 高刷与 10-bit 色深，全程 DC 调光无频闪；屏下光学指纹，四边等宽边框。',
      specs:[['尺寸','6.83 英寸'],['分辨率','1.5K 2800×1260'],['刷新率','144Hz'],['调光','DC 无频闪']] },
    { id:'camera-island', zh:'后置相机岛', en:'REAR CAMERA ISLAND', real:true,
      ex:[1.3,2.6,-2.0], lo:[0,1.6,0], tag:'50MP 三摄 · 3.5× 潜望',
      desc:'背板左上的竖排相机岛：50MP 主摄（Sony LYT-700C，OIS）、50MP 3.5× 潜望长焦（最高 140× 混合变焦）与 50MP 超广角三摄同规格，镜头环做金属光泽处理。',
      specs:[['主摄','50MP LYT-700C OIS'],['潜望','50MP 3.5×'],['超广角','50MP'],['混合变焦','最高 140×']] },
    { id:'glyph', zh:'Glyph 灯语', en:'GLYPH MINI-LED', real:true,
      ex:[-1.8,2.8,-2.2], lo:[0,1.4,0], tag:'137 颗 mini-LED',
      desc:'围绕相机岛的 137 颗 mini-LED 组成 Glyph 灯语条：来电、计时、充电进度与 Essential 通知各有专属灯效，夜间不点亮屏幕即可获取信息。',
      specs:[['类型','mini-LED 灯带'],['数量','137 颗'],['功能','通知 · 计时 · 充电'],['配合','Essential Space']] },
    { id:'midframe', zh:'中板与内部件', en:'MID-PLATE & INTERNALS', real:true,
      ex:[0,0,.4], lo:[0,1.3,0], tag:'金属中板 · 可视支架',
      desc:'金属中板承载主板与电池，透明设计语言下保留可视的支架与排线排布；主板（骁龙 7 Gen 4 + UFS 4.1）与 5080 mAh 电池均藏于中板之下。',
      specs:[['结构','金属中板'],['主板','骁龙 7 Gen 4 · UFS 4.1'],['电池','5080 mAh'],['充电','50W 有线']] },
    { id:'buttons', zh:'按键组', en:'SIDE BUTTONS', real:true,
      ex:[2.0,1.0,1.2], lo:[0,1.0,0], tag:'电源 + Essential Key',
      desc:'右侧电源/音量键与 Essential Key，长按直入 Essential Space 记忆助手。',
      specs:[['电源键','右侧面'],['Essential Key','长按唤醒'],['材质','金属按键']] },
    { id:'usb', zh:'USB-C 尾插', en:'USB-C PORT', real:true,
      ex:[1.4,-2.5,.4], lo:[0,1.0,0], tag:'50W PD 快充',
      desc:'底部 USB-C 尾插支持 50W PD 快充，约 50 分钟充满 5080 mAh。',
      specs:[['接口','USB-C'],['充电','50W PD']] },
  ],
  postLoad: composePostLoad(),
  tick: null,
});
