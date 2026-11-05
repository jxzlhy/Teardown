/* =============================================================
   设备配置：Apple iPhone 16（2024）
   社区模型（Sketchfab）：41 匿名网格 + 39 哈希材质（无语义）
   bbox 7.27×14.74×1.13，Y 直立、屏朝 +z（z 0.39 前屏层实测）
   映射：mapByPosition 位置聚类（相机簇 rel.x≈0.8 rel.y≈0.85、
   底部 rel.y<0.08、按键 rel.x≈1.0、背玻璃 rel.z<0.35）
============================================================= */
import { makeDevice, anchorParts, composePostLoad } from './_kit/factory.js';
import { makePhoneScreen } from './_kit/screen.js';
import { mainboard, battery, cameraModule, chargeCoil, speakerBox, portPcb } from './_kit/internals.js';

const screen = makePhoneScreen({ w: 620, h: 1348, brand: 'IPHONE', carrier: '5G', accent: '#6ec6b8' });

const builders = {
  board: (g)=> mainboard(g, { w:4.8, h:3.0, soc:[-1.2,.5], ram:[1.1,.8], label:'APPLE A18', sub:'3nm · MAIN BOARD', pcb:'#1a2a4a', smalls:16 }),
  battery: (g)=> battery(g, { w:4.4, h:3.5, d:.5, label:'APPLE', capacity:'3561 mAh', model:'A3xxx', rating:'3.87V' }),
  'camera-module': (g)=> { cameraModule(g, .9, .95); cameraModule(g, .8, .85); },
  coil:   (g)=> chargeCoil(g, 1.7),
  speaker: (g)=> speakerBox(g, 2.2, 1.0, .55),
  'usb-pcb': (g)=> portPcb(g, 1.5, 1.05),
};

export default makeDevice({
  id: 'iphone-16',
  era: 2024,
  name: 'Apple iPhone 16',
  en: 'IPHONE 16',
  category: '手机',
  brand: 'APPLE',
  tagline: 'A18 · 拍照按钮首秀 · 竖排双摄回归',
  description: 'iPhone 16（2024）：为空间视频拍摄把双摄改回竖排，机身左侧新增 Action 按键、右侧新增电容式拍照按钮（Camera Control）——本模型侧缘的独立小网格就是这两颗新按键。社区模型（Sketchfab），内构件为示意重建。',
  specs: [
    ['芯片','A18 · 3nm（第二代）'],['屏幕','6.1″ 超视网膜 XDR OLED'],
    ['主摄','48MP Fusion · 2× 光学品质变焦'],['超广角','12MP · 微距'],
    ['新按键','Camera Control 拍照按钮'],['电池','3561 mAh'],
    ['AI','Apple Intelligence'],['重量','170 g'],
  ],
  accent: '#6ec6b8',
  source: '社区模型（Sketchfab）',
  modelCredit: 'iPhone 16 - Free by wimell (Sketchfab, Free Standard License)',
  modelSource: 'https://sketchfab.com/3d-models/iphone-16-free-d58591e88a824dfd8cef0af616273b02',
  targetWidth: 13.5,
  camDist: 1.15,
  normalize: 'full',
  glb: '/assets/iphone-16.glb',
  realSizeMM: 147.6,   /* 真实最大外形尺寸（Apple 官方规格 147.6×71.6×7.8mm）：测量工具 mm 标定基准 */
  /* 策展导览：屏→边框→主板→摄像→电池→底部→后玻璃 */
  tour: ['display','frame','board','camera-module','camera','battery','coil','usb-pcb','port','speaker','buttons','back-glass'],
  xrayShellIds: ['display','back-glass','frame'],
  mapByPosition(name, p, rel){
    if(rel.z > 0.7) return 'display';
    if(rel.y < 0.08) return Math.abs(rel.x - 0.5) < 0.2 ? 'port' : 'speaker';
    if(rel.x > 0.9) return 'buttons';
    if(rel.z < 0.45 && rel.y > 0.72 && rel.x > 0.4) return 'camera';
    if(rel.z < 0.35) return 'back-glass';
    return 'frame';
  },
  realPartIds: ['display','back-glass','camera','buttons','port','speaker','frame'],
  builders,
  parts: [
    { id:'display', zh:'正面屏幕', en:'SUPER RETINA XDR', real:true,
      ex:[0,.2,2.8], lo:[0,1.5,0], tag:'6.1″ OLED · 灵动岛',
      desc:'6.1 英寸超视网膜 XDR OLED：2556×1179、灵动岛药丸区居顶；支持 1-120Hz 自适应（本代仅 Pro 系有 ProMotion，数字系 60Hz）。',
      specs:[['尺寸','6.1″ 2556×1179'],['玻璃','Ceramic Shield 2'],['形态','灵动岛全面屏']] },
    { id:'back-glass', zh:'后盖玻璃', en:'BACK GLASS', real:true,
      ex:[0,-.2,-2.8], lo:[0,1.4,0], tag:'多层色熔玻璃',
      desc:'本代新配色的后盖玻璃：多层色熔工艺在玻璃内做出渐变层次（海蓝/群青/粉/白/黑五色）；MagSafe 磁阵藏于玻璃之下。',
      specs:[['工艺','多层色熔玻璃'],['配色','五色系'],['集成','MagSafe 磁阵']] },
    { id:'camera', zh:'竖排双摄模组', en:'FUSION DUAL CAMERA', real:true,
      ex:[1.4,2.4,-1.8], lo:[0,1.5,0], tag:'竖排回归 · 48MP Fusion',
      desc:'竖排双摄回归（12/13 系的斜排改回竖排）：48MP Fusion 主摄支持 2× 光学品质裁切变焦，竖排布局让手机横拍时双摄都处于水平方向——这是为空间视频（Vision Pro 观看）做的设计。',
      specs:[['主摄','48MP Fusion'],['超广角','12MP 微距'],['变焦','2× 光学品质'],['空间视频','支持录制']] },
    { id:'buttons', zh:'新增按键组', en:'ACTION + CAMERA CONTROL', real:true,
      ex:[2.6,.4,1.2], lo:[0,1.2,0], tag:'拍照按钮首秀',
      desc:'本代新增两颗按键：Action 操作键（替代静音拨片，可自定义功能）与 Camera Control 拍照按钮——后者是嵌在边框里的电容触控 + 力度感应条，轻按对焦、重按拍照、滑动变焦。',
      specs:[['Action 键','可自定义'],['Camera Control','电容+压感'],['位置','右侧边框中下']] },
    { id:'port', zh:'尾插与扬声器区', en:'USB-C PORT', real:true,
      ex:[1.5,-3.0,.6], lo:[0,1.0,0], tag:'USB-C 2.0',
      desc:'USB-C 尾插区：USB 2.0 速率（Pro 系为 USB 3），旁边是底部麦克风与扬声器开孔。',
      specs:[['接口','USB-C 2.0'],['快充','30W+ PD']] },
    { id:'speaker', zh:'底部扬声器', en:'BOTTOM SPEAKER', real:true,
      ex:[1.8,-2.9,-.6], lo:[0,1.0,0], tag:'立体声双扬之一',
      desc:'底部主扬声器，与听筒组成立体声双扬。',
      specs:[['配置','立体声双扬']] },
    { id:'frame', zh:'铝金属边框', en:'ALUMINUM FRAME', real:true,
      ex:[0,0,1.8], lo:[0,1.2,0], tag:'航空级铝 · 二代阳极',
      desc:'航空级铝金属边框：二代阳极氧化工艺让本代配色更饱和（海蓝色饱和度显著提升）；边框轮廓延续直角微弧设计。',
      specs:[['材质','航空级铝'],['工艺','二代阳极氧化']] },
    { id:'board', zh:'主板', en:'A18 MAINBOARD',
      ex:[0,2.4,.4], lo:[0,1.5,0], tag:'A18 3nm · 8GB',
      desc:'A18 主板：第二代 3nm 工艺，6 核 CPU + 5 核 GPU（桌面级架构下放），硬件光追支持，8GB 内存为 Apple Intelligence 提供本地算力底线。',
      specs:[['SoC','A18 3nm'],['内存','8GB'],['GPU','5 核 + 光追'],['AI','Apple Intelligence']] },
    { id:'battery', zh:'电池', en:'BATTERY 3561 mAh',
      ex:[-1.0,-2.0,1.0], lo:[0,1.5,0], tag:'3561 mAh · 22h 视频',
      desc:'3561 mAh 电池：视频播放最长 22 小时，A18 能效提升下续航继续改善。',
      specs:[['容量','3561 mAh'],['续航','22h 视频']] },
    { id:'camera-module', zh:'主摄模组', en:'48MP FUSION MODULE',
      ex:[1.6,2.8,-.9], lo:[0,1.3,0], tag:'Fusion · 裁切变焦',
      desc:'48MP Fusion 主摄模组：四合一像素输出 24MP 默认成片，支持 12MP/48MP ProRAW；2× 变焦由传感器中部裁切实现（光学品质）。',
      specs:[['传感器','48MP Fusion'],['默认输出','24MP'],['变焦','2× 光学品质']] },
    { id:'coil', zh:'无线充电线圈', en:'MAGSAFE COIL',
      ex:[.3,-2.6,-.9], lo:[0,1.1,0], tag:'MagSafe Qi2 25W',
      desc:'MagSafe 磁吸线圈：Qi2 25W 无线快充（需官方磁吸充电器）。',
      specs:[['标准','Qi2 · 25W']] },
    { id:'usb-pcb', zh:'尾插小板', en:'CHARGER FPC',
      ex:[1.5,-3.1,-1.0], lo:[0,1.0,0], tag:'USB-C 2.0 走线',
      desc:'USB-C 尾插小板：充电与 USB 2.0 数据走线，底部麦克风也在此板。',
      specs:[['接口','USB-C 2.0']] },
  ],
  /* screen: painted —— display 无原生贴图（screen-audit 2026-11-01），painted UI 为唯一屏方案 */
  postLoad: composePostLoad(
    ({ addLiveScreen })=>{ screen.hook(addLiveScreen, 'display'); },
    anchorParts({
      board:     { ref:'display', dy: 4.2, dz:-.5 },
      battery:   { ref:'display', dy:-1.7, dz:-.6 },
      'camera-module': { ref:'camera', dz:-1.0 },
      coil:      { ref:'back-glass', dy:-3.0, dz:.6 },
      speaker:   { ref:'back-glass', dy:-6.4, dz:.5 },
      'usb-pcb': { ref:'back-glass', dy:-6.8, dz:.5 },
    }),
  ),
  tick: screen.tick,
});
