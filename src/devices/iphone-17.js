/* =============================================================
   设备配置：Apple iPhone 17 (2025)
   官方 GLB：Apple 产品页 AR 资产转换（直立 Y，屏朝 +Z）
   背部相机岛为竖向椭圆胶囊 → 按位置聚类（哈希网格名）
============================================================= */
import { makeDevice, anchorParts, composePostLoad } from './_kit/factory.js';
import { mainboard, battery, cameraModule, chargeCoil, speakerBox, portPcb } from './_kit/internals.js';

const builders = {
  board: (g)=> mainboard(g, { w:4.8, h:3.0, soc:[-1.2,.5], ram:[1.1,.8], label:'APPLE A19', sub:'820-0xxxx · MAIN BOARD', pcb:'#1a2a4a', smalls:16 }),
  battery: (g)=> battery(g, { w:4.6, h:3.6, d:.5, label:'APPLE', capacity:'3677 mAh', model:'A3xxx', rating:'3.87V' }),
  camera: (g)=> { cameraModule(g, .95, 1.0); cameraModule(g, .75, .8); },
  coil:   (g)=> chargeCoil(g, 1.7),
  speaker: (g)=> speakerBox(g, 2.2, 1.0, .55),
  'usb-pcb': (g)=> portPcb(g, 1.5, 1.05),
};

export default makeDevice({
  id: 'iphone-17',
  era: 2025,
  name: 'Apple iPhone 17',
  en: 'IPHONE 17 2025',
  category: '手机',
  brand: 'APPLE',
  tagline: '120Hz 全面下放 · 双 48MP',
  description: 'iPhone 17：ProMotion 120Hz 首次下放到数字系列，A19 芯片 + 双 48MP 摄像头（主摄与超广角），6.3 英寸大屏与铝金属一体机身。官方产品页模型（Apple AR 资产转换），内构件为示意重建。',
  specs: [
    ['芯片','A19'],['屏幕','6.3″ 超视网膜 · 120Hz'],['主摄','48MP Fusion'],
    ['超广角','48MP'],['前摄','18MP Center Stage'],['电池','3677 mAh'],
    ['机身','铝金属 · Ceramic Shield 2'],['重量','177 g'],
  ],
  accent: '#9db8d2',
  source: 'Apple 官网 AR 模型（USDZ 转制）',
  distribution: 'local-demo-only',
  targetWidth: 14.0,
  glb: '/assets/iphone-17.glb',
  realSizeMM: 149.6,   /* 真实最大外形尺寸（Apple 官方规格 149.6×71.5×7.95mm）：测量工具 mm 标定基准 */
  /* 策展导览：屏→框→板→影像→电池→底部→后玻璃 */
  tour: ['display','frame','board','camera','camera-island','battery','coil','speaker','usb-pcb','back-glass'],
  xrayShellIds: ['display','back-glass','frame'],
  normalize: 'full',
  mapByPosition(name, p, rel){
    if(p.z > 0.25) return 'display';
    if(p.z < -0.25){
      if(rel.y > 0.6 && rel.x < 0.55) return 'camera-island';
      return 'back-glass';
    }
    return 'frame';
  },
  realPartIds: ['display','back-glass','camera-island','frame'],
  builders,
  parts: [
    { id:'display', zh:'正面屏幕', en:'SUPER RETINA XDR', real:true,
      ex:[0,.2,2.8], lo:[0,1.5,0], tag:'6.3″ · 120Hz ProMotion',
      desc:'6.3 英寸超视网膜 XDR：iPhone 17 首次在数字系列标配 ProMotion 1-120Hz 与全天候显示，峰值亮度 3000nit，屏下超声波级 Face ID 红外与前置摄像头开孔居顶。',
      specs:[['尺寸','6.3 英寸'],['刷新','1-120Hz'],['亮度','3000nit'],['玻璃','Ceramic Shield 2']] },
    { id:'back-glass', zh:'后盖玻璃', en:'BACK GLASS', real:true,
      ex:[0,-.2,-2.8], lo:[0,1.4,0], tag:'一体化玻璃 · 可拆换',
      desc:'铝金属一体机身背面的玻璃后盖：与中框同色阳极处理，MagSafe 磁体阵列藏于玻璃之下，可整体拆换维修。',
      specs:[['材质','强化玻璃'],['集成','MagSafe 磁阵'],['维修','可独立更换']] },
    { id:'camera-island', zh:'后置相机岛', en:'REAR CAMERA ISLAND', real:true,
      ex:[1.3,2.6,-1.9], lo:[0,1.6,0], tag:'双 48MP · 竖向胶囊',
      desc:'竖向椭圆胶囊相机岛：48MP Fusion 主摄（f/1.6 OIS）与 48MP 超广角双摄，Pro 系列同款镜头镀膜；凸台与背玻璃一体成型。',
      specs:[['主摄','48MP f/1.6 OIS'],['超广角','48MP'],['变焦','2× 光学品质'],['视频','4K 60 杜比视界']] },
    { id:'frame', zh:'铝金属中框', en:'ALUMINUM FRAME', real:true,
      ex:[0,0,1.8], lo:[0,1.2,0], tag:'一体铝 · 天线注塑',
      desc:'航空级铝金属一体成型的中框：阳极氧化同色处理，注塑天线带隔离金属腔，Action 按键与音量键桥接主板。',
      specs:[['材质','航空级铝'],['工艺','一体成型 + 阳极氧化'],['按键','Action 键']] },
    { id:'board', zh:'主板', en:'A19 MAINBOARD',
      ex:[0,2.4,.4], lo:[0,1.5,0], tag:'A19 · 板载存储',
      desc:'主板集中于机身上部：A19 SoC（3nm）与 8GB LPDDR5X、256GB+ NVMe 板载，双面贴片加盖屏蔽罩，射频前端分布两侧。',
      specs:[['SoC','A19 3nm'],['内存','8GB LPDDR5X'],['存储','256GB+'],['基带','高通 X 调制解调器']] },
    { id:'battery', zh:'电池', en:'BATTERY 3677 mAh',
      ex:[-1.0,-2.0,1.0], lo:[0,1.5,0], tag:'3677 mAh · 视频播放 30h',
      desc:'3677 mAh 锂离子电池：A19 能效加成下视频播放最长 30 小时，支持 40W PD 快充（60 分钟充满）与 MagSafe 无线充。',
      specs:[['容量','3677 mAh'],['续航','30h 视频'],['快充','40W PD'],['无线充','MagSafe Qi2']] },
    { id:'camera', zh:'主摄模组', en:'48MP FUSION MODULE',
      ex:[1.5,2.9,-.9], lo:[0,1.3,0], tag:'双摄 · OIS',
      desc:'双摄模组：48MP 主摄与 48MP 超广角同尺寸传感器是本代最大升级，VCM 马达驱动 OIS，经 FPC 折返接入主板。',
      specs:[['主摄','48MP f/1.6'],['超广角','48MP f/2.2'],['防抖','Sensor-Shift']] },
    { id:'coil', zh:'无线充电线圈', en:'MAGSAFE COIL',
      ex:[.3,-2.6,-.9], lo:[0,1.1,0], tag:'MagSafe Qi2 25W',
      desc:'MagSafe 磁吸线圈与磁体阵列：Qi2 25W 无线快充，磁体对位即吸即充。',
      specs:[['标准','Qi2 · 25W'],['集成','MagSafe 磁阵 + NFC']] },
    { id:'speaker', zh:'扬声器', en:'SPEAKER MODULE',
      ex:[1.6,-2.8,-.5], lo:[0,1.0,0], tag:'底部主扬声器',
      desc:'底部主扬声器与顶部听筒组成双扬声器立体声，支持空间音频播放。',
      specs:[['配置','双扬声器立体声']] },
    { id:'usb-pcb', zh:'尾插小板', en:'CHARGER FPC',
      ex:[1.5,-3.0,-1.0], lo:[0,1.0,0], tag:'USB-C 2.0',
      desc:'USB-C 尾插小板：40W PD 快充走线与底部麦克风。',
      specs:[['接口','USB-C 2.0'],['快充','40W PD']] },
  ],
  postLoad: composePostLoad(
    anchorParts({
      board:     { ref:'display', dy: 4.4, dz:-.5 },
      battery:   { ref:'display', dy:-1.6, dz:-.6 },
      camera:    { ref:'camera-island', dz:-1.0 },
      coil:      { ref:'back-glass', dy:-3.0, dz:.6 },
      speaker:   { ref:'back-glass', dy:-5.8, dz:.5 },
      'usb-pcb': { ref:'back-glass', dy:-6.6, dz:.5 },
    }),
  ),
});
