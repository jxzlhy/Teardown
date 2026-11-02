/* =============================================================
   设备配置：Apple iPhone 18 Pro Max（曜黑 · 2026）
   官方系 AR 资产：43 匿名网格 + 34 语义材质，屏朝 +z 实测
   （screen z=+0.0043 / back z=-0.0038 / lens z=-0.0074）
   映射策略：与 iphone-17 同源的 mapByPosition 位置聚类
============================================================= */
import { makeDevice, anchorParts, composePostLoad } from './_kit/factory.js';
import { mainboard, battery, cameraModule, chargeCoil, speakerBox, portPcb } from './_kit/internals.js';

const builders = {
  board: (g)=> mainboard(g, { w:5.2, h:3.2, soc:[-1.3,.6], ram:[1.2,.9], label:'APPLE A20 PRO', sub:'2nm · MAIN BOARD', pcb:'#1a2a4a', smalls:18 }),
  battery: (g)=> battery(g, { w:5.0, h:4.2, d:.5, label:'APPLE', capacity:'5567 mAh', model:'A4xxx', rating:'3.89V' }),
  camera: (g)=> { cameraModule(g, 1.0, 1.05); cameraModule(g, .8, .85); cameraModule(g, .8, .85); },
  coil:   (g)=> chargeCoil(g, 1.8),
  speaker: (g)=> speakerBox(g, 2.3, 1.0, .55),
  'usb-pcb': (g)=> portPcb(g, 1.5, 1.05),
};

export default makeDevice({
  id: 'iphone-18-pro-max',
  era: 2026,
  name: 'Apple iPhone 18 Pro Max',
  en: 'IPHONE 18 PRO MAX BLACK',
  category: '手机',
  brand: 'APPLE',
  tagline: '2nm A20 Pro · 可变光圈首秀 · 钛回归',
  description: 'iPhone 18 Pro Max（2026）曜黑配色：A20 Pro 用上 2nm 工艺，主摄第一次搭载机械可变光圈——光圈叶片像相机一样物理开合来控制进光与景深；钛金属边框回归。官方产品页模型（Apple AR 资产），内构件为示意重建。',
  specs: [
    ['芯片','A20 Pro · 2nm'],['屏幕','6.9″ 超视网膜 XDR · 120Hz'],
    ['主摄','48MP Pro Fusion · 可变光圈'],['电池','约 5567 mAh · 视频 44h'],
    ['内存','12GB'],['边框','钛金属（回归）'],
    ['视频','4K · 杜比视界'],['起售价','$1,199 / 256GB'],
  ],
  accent: '#9db8d2',
  source: 'Apple 官网 AR 模型（USDZ/GLB 资产）',
  distribution: 'local-demo-only',
  targetWidth: 14.5,
  camDist: 1.25,
  normalize: 'full',
  glb: '/assets/iphone-18-pro-max.glb',
  /* 策展导览：屏→框→板→影像→电池→底部→后玻璃 */
  tour: ['display','frame','board','camera','camera-island','battery','coil','speaker','usb-pcb','back-glass'],
  xrayShellIds: ['display','back-glass','frame'],
  mapByPosition(name, p, rel){
    /* 屏幕平面 z≈+0.004(rel≈1.0) / 中框层 ≈0.45-0.8 / 背板 ≈0.3 / 镜头 ≈0.02 */
    if(rel.z > 0.8) return 'display';
    if(rel.z < 0.45){
      if(rel.x > 0.55 && rel.y > 0.6) return 'camera-island';
      return 'back-glass';
    }
    return 'frame';
  },
  realPartIds: ['display','back-glass','camera-island','frame'],
  builders,
  parts: [
    { id:'display', zh:'正面屏幕', en:'SUPER RETINA XDR', real:true,
      ex:[0,.2,3.0], lo:[0,1.5,0], tag:'6.9″ · 120Hz ProMotion',
      desc:'6.9 英寸超视网膜 XDR：ProMotion 自适应 1-120Hz 刷新，全天候显示，户外峰值亮度再创新高；超窄四等边让机身宽度几乎不变的前提下显示面积继续增大。',
      specs:[['尺寸','6.9 英寸'],['刷新','1-120Hz'],['玻璃','Ceramic Shield 后代'],['形态','四等边全面屏']] },
    { id:'back-glass', zh:'后盖玻璃', en:'BACK GLASS', real:true,
      ex:[0,-.2,-3.0], lo:[0,1.4,0], tag:'磨砂玻璃 · 钛框一体',
      desc:'曜黑磨砂玻璃后盖：细腻磨砂质感防指纹，与黑色钛边框同色一体化；MagSafe 磁体阵列藏于玻璃之下。',
      specs:[['材质','磨砂强化玻璃'],['集成','MagSafe 磁阵'],['配色','曜黑']] },
    { id:'camera-island', zh:'后置相机岛', en:'REAR CAMERA ISLAND', real:true,
      ex:[1.5,2.7,-2.0], lo:[0,1.6,0], tag:'48MP 可变光圈 · 三摄',
      desc:'横贯式相机岛：48MP Pro Fusion 主摄首次搭载机械可变光圈——叶片物理开合控制进光量与景深，强光下收小光圈保细节、弱光下全开保进光；配合超广角与潜望长焦组成三摄系统。',
      specs:[['主摄','48MP · 可变光圈 OIS'],['超广角','48MP'],['长焦','潜望式'],['视频','4K 120 杜比视界']] },
    { id:'frame', zh:'钛金属边框', en:'TITANIUM FRAME', real:true,
      ex:[0,0,2.0], lo:[0,1.2,0], tag:'钛回归 · 航天合金',
      desc:'钛金属边框回归（上一代为铝一体机身）：五级钛合金经拉丝/喷砂处理，强度更高、更耐腐蚀；内部依然是铝内骨架支撑的天线一体结构。',
      specs:[['材质','五级钛合金'],['重量','较铝框更轻'],['工艺','喷砂 + 拉丝']] },
    { id:'board', zh:'主板', en:'A20 PRO MAINBOARD',
      ex:[0,2.5,.4], lo:[0,1.5,0], tag:'A20 Pro 2nm · 12GB',
      desc:'A20 Pro 主板：2nm 工艺（移动芯片首例），6 核 CPU（2 性能核 + 4 能效核）较上代提速约 18%，GPU 提速传闻达 40%；12GB 内存与 256GB 起 NVMe 存储。',
      specs:[['SoC','A20 Pro 2nm'],['内存','12GB'],['存储','256GB 起'],['CPU 提升','~18%']] },
    { id:'battery', zh:'电池', en:'BATTERY 5567 mAh',
      ex:[-1.0,-2.2,1.0], lo:[0,1.5,0], tag:'5567 mAh · 视频 44h',
      desc:'约 5567 mAh 锂离子电池（eSIM 版本容量，实体 SIM 版略小）：官方标称视频播放最长 44 小时，是 iPhone 续航新高；配合更高能效的 2nm 芯片与 40W 级快充。',
      specs:[['容量','约 5567 mAh'],['续航','44h 视频'],['快充','40W+ PD']] },
    { id:'camera', zh:'主摄模组', en:'48MP VAP MODULE',
      ex:[1.6,3.0,-1.0], lo:[0,1.3,0], tag:'可变光圈 · OIS',
      desc:'48MP 主摄模组：本代最大升级是机械可变光圈（VAP）——多叶式光圈环物理开合，光圈叶片模组与传感器位移 OIS 叠加，实现「一颗镜头应对全天候」。',
      specs:[['传感器','48MP Quad-Pixel'],['光圈','机械可变'],['防抖','Sensor-Shift OIS']] },
    { id:'coil', zh:'无线充电线圈', en:'MAGSAFE COIL',
      ex:[.3,-2.8,-1.0], lo:[0,1.1,0], tag:'MagSafe Qi2',
      desc:'MagSafe 磁吸线圈与磁体阵列：Qi2 25W 无线快充，磁体对位即吸即充，反向无线充可为耳机补电。',
      specs:[['标准','Qi2 · 25W'],['集成','磁阵 + NFC']] },
    { id:'speaker', zh:'扬声器', en:'SPEAKER MODULE',
      ex:[1.7,-3.0,-.6], lo:[0,1.0,0], tag:'底部主扬声器',
      desc:'底部主扬声器与顶部听筒组成双扬声器立体声，支持空间音频与杜比全景声播放。',
      specs:[['配置','双扬声器立体声'],['音效','空间音频']] },
    { id:'usb-pcb', zh:'尾插小板', en:'CHARGER FPC',
      ex:[1.5,-3.2,-1.0], lo:[0,1.0,0], tag:'USB-C · 快充走线',
      desc:'USB-C 尾插小板：快充与数据走线，支持 USB 3 级传输与外接显示。',
      specs:[['接口','USB-C'],['传输','USB 3 级']] },
  ],
  postLoad: composePostLoad(
    anchorParts({
      board:     { ref:'display', dy: 4.6, dz:-.5 },
      battery:   { ref:'display', dy:-1.8, dz:-.6 },
      camera:    { ref:'camera-island', dz:-1.1 },
      coil:      { ref:'back-glass', dy:-3.2, dz:.6 },
      speaker:   { ref:'back-glass', dy:-6.2, dz:.5 },
      'usb-pcb': { ref:'back-glass', dy:-7.0, dz:.5 },
    }),
  ),
});
