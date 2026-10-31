/* =============================================================
   设备配置：Apple iPad Air 11″ (M3, 2025)
   官方 GLB：Apple 产品页 AR 资产转换（斜立含配件姿势）
============================================================= */
import { makeDevice, anchorParts, composePostLoad } from './_kit/factory.js';
import { mainboard, battery, cameraModule } from './_kit/internals.js';

const builders = {
  board: (g)=> mainboard(g, { w:7.6, h:4.2, soc:[-1.5,.7], ram:[1.3,.6], label:'APPLE M3', sub:'820-0xxxx · TABLET BOARD', pcb:'#1a2a4a', smalls:14 }),
  battery: (g)=>{ battery(g, { w:7.2, h:4.6, d:.45, label:'APPLE', capacity:'28.93 Wh', model:'A3xxx', rating:'7.6V' }); g.rotation.x = -Math.PI/2; },
  camera: (g)=> cameraModule(g, .6, .8),
};

export default makeDevice({
  id: 'ipad-air',
  era: 2025,
  name: 'Apple iPad Air 11″ (M3)',
  en: 'IPAD AIR M3',
  category: '平板',
  brand: 'APPLE',
  tagline: 'M3 芯片 · 轻量全能平板',
  description: 'iPad Air 11″：M3 芯片、Liquid Retina 屏与 Apple Pencil Pro 支持的全能平板，比 iPad Pro 更轻更便宜的均衡选择。官方产品页模型（含配件姿势，Apple AR 资产转换），内构件为示意重建。',
  specs: [
    ['芯片','Apple M3（8 核）'],['屏幕','11″ Liquid Retina 2360×1640'],['亮度','500 nit · P3'],
    ['电池','28.93 Wh · 10h'],['摄像头','12MP 横置'],['配件','Apple Pencil Pro / 妙控键盘'],
    ['端口','USB-C 3.1 Gen 1'],['重量','462 g（11″）'],
  ],
  accent: '#7fa8d9',
  source: 'Apple 官网 AR 模型（USDZ 转制）',
  targetWidth: 11.5,
  camDist: 1.15,
  glb: '/assets/ipad-air.glb',
  /* 策展导览：屏→机身→板→电池→影像→配件 */
  tour: ['display-front','body','board','battery','camera','accessory'],
  xrayShellIds: ['display-front','body'],
  normalize: 'full',
  mapByPosition(name, p, rel){
    /* 斜立姿势：前侧低区为配件（Pencil/键盘），主屏为 slab */
    if(p.z > 10 && p.y < 6) return 'accessory';
    if(p.z < -4 && p.y > 2) return 'display-front';
    return 'body';
  },
  realPartIds: ['body','display-front','accessory'],
  builders,
  parts: [
    { id:'body', zh:'铝制机身', en:'ALUMINUM BODY', real:true,
      ex:[0,.4,2.2], lo:[0,1.6,0], tag:'5.97mm 一体成型',
      desc:'5.97mm 一体铝机身：与 iPad Pro 同款的方正语言，横置相机凸台与 Touch ID 顶键集成于边框；深空灰/蓝/紫/星光四色阳极氧化。',
      specs:[['厚度','5.97 mm'],['重量','462 g'],['解锁','顶键 Touch ID'],['配色','四色阳极']] },
    { id:'display-front', zh:'Liquid Retina 屏幕', en:'LIQUID RETINA DISPLAY', real:true,
      ex:[0,.6,2.0], lo:[0,1.7,0], tag:'11″ 2360×1640',
      desc:'11 英寸 Liquid Retina：2360×1640、500nit、P3 广色域与原彩显示，层压全贴合抗反射涂层，支持 Apple Pencil Pro 悬停。',
      specs:[['分辨率','2360×1640'],['亮度','500 nit'],['色域','P3'],['触控笔','Pencil Pro 悬停']] },
    { id:'accessory', zh:'随附配件', en:'INCLUDED ACCESSORY', real:true,
      ex:[1.6,-1.0,1.8], lo:[0,1.3,0], tag:'官方展示姿势配件',
      desc:'官方展示姿势中的随附配件（Apple Pencil Pro / 支撑配件）：Pencil Pro 支持侧旋、挤压与触感反馈，磁吸无线充电藏于机身上缘。',
      specs:[['Pencil Pro','侧旋 · 挤压 · 触感'],['充电','磁吸无线'],['悬停','支持']] },
    { id:'board', zh:'逻辑主板', en:'M3 LOGIC BOARD',
      ex:[0,2.2,-.4], lo:[0,1.5,0], tag:'M3 · 板载存储',
      desc:'主板贴装于机身一侧：M3（8 核 CPU / 9 核 GPU，硬件光追）与 8/16GB 统一内存板载，为轻薄机身窄条布板。',
      specs:[['SoC','M3 3nm'],['内存','8/16GB'],['存储','128GB-1TB'],['特性','硬件光追']] },
    { id:'battery', zh:'电池', en:'BATTERY 28.93 Wh',
      ex:[0,-2.2,-.6], lo:[0,1.5,0], tag:'28.93 Wh · 10 小时',
      desc:'28.93 Wh 电池横向铺满机身：Wi-Fi 浏览续航 10 小时，USB-C 快充。',
      specs:[['容量','28.93 Wh'],['续航','10h 浏览']] },
    { id:'camera', zh:'后置相机模组', en:'REAR CAMERA MODULE',
      ex:[1.6,2.6,-.8], lo:[0,1.3,0], tag:'12MP 横置',
      desc:'12MP 广角相机横置于背板长边：横向握持拍摄 4K 视频时摄像头正好居顶，支持 ProRes 录制。',
      specs:[['主摄','12MP f/1.8'],['视频','4K 60'],['位置','长边横置']] },
  ],
  postLoad: composePostLoad(
    anchorParts({
      board:   { ref:'body', dy:1.2, dz:.2 },
      battery: { ref:'body', dy:-.8, dz:.2 },
      camera:  { ref:'body', dx:-3.0, dy:2.0, dz:.1 },
    }),
  ),
  tick: null,
});
