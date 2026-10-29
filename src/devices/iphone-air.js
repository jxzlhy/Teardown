/* =============================================================
   设备配置：Apple iPhone Air (2025)
   官方 GLB：Apple 产品页 AR 资产转换（平放：高 156mm 沿 X、屏朝 -Z）
   5.6mm 超薄：主板在相机 Plateau、电池在脊柱——拆解叙事的核心
============================================================= */
import { makeDevice, anchorParts, composePostLoad } from './_kit/factory.js';
import { mainboard, battery, cameraModule, portPcb } from './_kit/internals.js';

const builders = {
  board: (g)=> mainboard(g, { w:4.6, h:2.6, soc:[-1.0,.5], ram:[1.0,.7], label:'APPLE A19 PRO', sub:'820-0xxxx · PLATEAU BOARD', pcb:'#1a2a4a', smalls:14 }),
  battery: (g)=> battery(g, { w:5.6, h:2.2, d:.4, label:'APPLE', capacity:'3149 mAh', model:'A3xxx', rating:'3.87V' }),
  camera: (g)=> cameraModule(g, .8, .9),
  'usb-pcb': (g)=> portPcb(g, 1.5, 1.0),
};

export default makeDevice({
  id: 'iphone-air',
  name: 'Apple iPhone Air',
  en: 'IPHONE AIR 2025',
  category: '手机',
  brand: 'APPLE',
  tagline: '5.6mm · 主板搬进相机高原',
  description: 'iPhone Air：5.6mm 的 iPhone 史上最薄机身——钛金属框架 + 钛铝一体后壳，A19 Pro 与全部主板元件收纳进背部相机高原，电池纵贯脊柱，eSIM-only。官方产品页模型（Apple AR 资产转换），内构件为示意重建。',
  specs: [
    ['芯片','A19 Pro'],['屏幕','6.5″ 超视网膜 · 120Hz'],['厚度','5.6 mm'],
    ['后摄','48MP Fusion'],['前摄','18MP Center Stage'],['电池','3149 mAh'],
    ['机身','钛金属框架 · 钛铝后壳'],['SIM','eSIM only'],
  ],
  accent: '#cfd8e0',
  source: 'Apple 官网 AR 模型（USDZ 转制）',
  targetWidth: 12.0,
  glb: '/assets/iphone-air.glb',
  normalize: 'full',
  frontAxis: '-z',      /* 资产平放、屏幕朝 -Z（资产屏幕默认熄屏） */
  mapByPosition(name, p, rel){
    if(p.z > 0.3) return 'camera-plateau';
    if(p.z < -0.1) return 'display';
    return 'back-cover';
  },
  realPartIds: ['display','back-cover','camera-plateau'],
  builders,
  parts: [
    { id:'display', zh:'正面屏幕', en:'SUPER RETINA XDR', real:true,
      ex:[0,.2,2.8], lo:[0,1.6,0], tag:'6.5″ · 120Hz ProMotion',
      desc:'6.5 英寸超视网膜 XDR 直屏：ProMotion 1-120Hz 自适应刷新，峰值亮度 3000nit，为 5.6mm 机身定制的超薄背光模组；Ceramic Shield 2 前盖抗刮降反光。',
      specs:[['尺寸','6.5 英寸'],['刷新','1-120Hz'],['亮度','3000nit 峰值'],['玻璃','Ceramic Shield 2']] },
    { id:'back-cover', zh:'钛铝一体后壳', en:'TITANIUM-ALUMINUM BACK', real:true,
      ex:[0,-.2,-2.8], lo:[0,1.4,0], tag:'5.6mm 一体成型',
      desc:'钛金属外框与喷砂铝合金后壳的一体成型件：中框为 Grade 5 钛，背板是 5.6mm 内收纳电池与扬声器的“脊柱”结构，天线缝隙注塑于框体。',
      specs:[['中框','Grade 5 钛'],['背板','再生铝喷砂'],['厚度','5.6 mm'],['重量','165 g']] },
    { id:'camera-plateau', zh:'相机高原', en:'CAMERA PLATEAU', real:true,
      ex:[1.8,2.4,-2.0], lo:[0,1.6,0], tag:'全机主板所在',
      desc:'背部的横向“高原”凸台：iPhone Air 的设计核心——48MP Fusion 单摄与 A19 Pro 主板整体移入其中，机身主体只留电池与扬声器，换来 5.6mm 的极限厚度。',
      specs:[['集成','48MP 摄像头 + 主板'],['结构','横向凸台'],['意义','主板移出机身']] },
    { id:'board', zh:'主板（高原内）', en:'A19 PRO BOARD',
      ex:[1.6,3.0,-1.2], lo:[0,1.5,0], tag:'A19 Pro · 高原堆叠',
      desc:'收纳在相机高原内的主板：A19 Pro SoC 与内存、闪存、基带（高通骁龙 X 调制解调器）双面堆叠，是 iPhone 历史上最小的一块主板。',
      specs:[['SoC','A19 Pro'],['基带','高通 X 调制解调器'],['内存','8/12GB'],['存储','256GB-1TB']] },
    { id:'battery', zh:'电池（脊柱）', en:'SPINE BATTERY',
      ex:[-1.2,-2.2,.8], lo:[0,1.5,0], tag:'3149 mAh · 纵贯机身',
      desc:'纵贯机身的“脊柱”电池：3149 mAh 在超薄机身内靠 A19 Pro 的能效撑起全天续航，支持 MagSafe 无线充与 20W 有线。',
      specs:[['容量','3149 mAh'],['无线充','MagSafe Qi2'],['快充','20W 有线'],['形态','纵向长条']] },
    { id:'camera', zh:'主摄模组', en:'48MP FUSION CAMERA',
      ex:[2.0,2.9,-.8], lo:[0,1.3,0], tag:'48MP Fusion · 高原内',
      desc:'48MP Fusion 主摄：f/1.65 光圈与传感器位移式 OIS 收纳在高原前段，默认输出 24MP，支持 2× 光学品质变焦与 4K 60 杜比视界。',
      specs:[['传感器','48MP Fusion'],['光圈','f/1.65'],['防抖','Sensor-Shift OIS'],['前摄','18MP 方形传感']] },
    { id:'usb-pcb', zh:'尾插小板', en:'CHARGER FPC',
      ex:[1.4,-2.6,-1.0], lo:[0,1.0,0], tag:'USB-C · 底缘',
      desc:'底缘的 USB-C 尾插小板：5.6mm 机身内的超薄连接器方案，集成扬声器触点与天线馈点。',
      specs:[['接口','USB-C 2.0'],['充电','20W PD']] },
  ],
  postLoad: composePostLoad(
    anchorParts({
      board:     { ref:'camera-plateau', dz:-.5 },
      camera:    { ref:'camera-plateau', dz:-.9 },
      battery:   { ref:'display', dy:1.4, dz:-.4 },
      'usb-pcb': { ref:'display', dy:-3.0, dz:-.3 },
    }),
  ),
  tick: null,
});
