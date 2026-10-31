/* =============================================================
   设备配置：Apple Vision Pro
   官方 GLB：Apple 产品页 AR 资产转换（Dual Knit 绑带版，163 网格）
   位置映射：前玻璃/光密封罩 z>8.5 分 y / 头带 y>5 / 扬声器 |x|>7
============================================================= */
import * as THREE from 'three';
import { makeDevice, anchorParts, composePostLoad } from './_kit/factory.js';
import { mainboard, fan, battery, driver } from './_kit/internals.js';
import { addMesh, matDark, matSilver } from '../engine/materials.js';

const builders = {
  display: (g)=>{
    /* 内屏堆栈：双 1.42″ micro-OLED + 光学模组示意 */
    for(const sx of [-1,1]){
      addMesh(g, new THREE.CylinderGeometry(1.5,1.5,.3,32), matDark(), sx*1.7, 0, 0, 0,0,Math.PI/2);
      addMesh(g, new THREE.CylinderGeometry(1.28,1.28,.12,32), new THREE.MeshPhysicalMaterial({ color:0x0a1a3a, roughness:.1, metalness:.1, clearcoat:1, emissive:0x1a3a7a, emissiveIntensity:.5 }), sx*1.7, 0, .2, 0,0,Math.PI/2);
      addMesh(g, new THREE.CylinderGeometry(1.05,1.35,.9,32,1,false), new THREE.MeshPhysicalMaterial({ color:0x9fb8d8, transmission:.7, ior:1.5, thickness:.6, roughness:.05 }), sx*1.7, 0, -.6, 0,0,Math.PI/2);
    }
  },
  board: (g)=> mainboard(g, { w:6.4, h:3.2, soc:[-1.5,.5], ram:[1.4,.8], label:'APPLE M2 + R1', sub:'820-xxxx · ISP BOARD', pcb:'#1a2a4a', smalls:16 }),
  fan:   (g)=> fan(g, 1.4, .4),
  'battery-pack': (g)=> battery(g, { w:4.4, h:2.6, d:1.2, label:'APPLE 3569 mAh', capacity:'3569 mAh', model:'A2793', rating:'13.2V' }),
};

export default makeDevice({
  id: 'vision-pro',
  era: 2024,
  name: 'Apple Vision Pro',
  en: 'A2117',
  category: '头显',
  brand: 'APPLE',
  tagline: '空间计算 · 双 micro-OLED',
  description: 'Apple Vision Pro：双 1.42 英寸 micro-OLED（2300 万像素）、M2 + R1 双芯片与外部供电电池的一体成型铝制头显。官方产品页模型（Dual Knit 绑带版，Apple AR 资产转换），内构件为示意重建。',
  specs: [
    ['芯片','M2 + R1（12ms 延迟）'],['显示','双 1.42″ micro-OLED'],['像素','2300 万 · HDR'],
    ['光学','三片式 Pancake 镜组'],['音效','空间音频 · 双驱动单元'],['电池','外置 3569 mAh · 2 小时'],
    ['交互','眼动 + 手势 + 语音'],['重量','600-650 g'],
  ],
  accent: '#9fb8d8',
  source: 'Apple 官网 AR 模型（USDZ 转制）',
  targetWidth: 13.5,
  camDist: 1.15,
  glb: '/assets/vision-pro.glb',
  normalize: 'full',
  mapByPosition(name, p, rel){
    if(p.x > 7) return 'speaker-r';
    if(p.x < -7) return 'speaker-l';
    if(p.y > 5.2) return 'headband';
    if(p.z > 8.2 && p.y < 0.2) return 'light-seal';
    if(p.z > 8.2) return 'front-glass';
    return 'visor-frame';
  },
  realPartIds: ['front-glass','light-seal','headband','speaker-l','speaker-r','visor-frame'],
  xrayShellIds: ['front-glass','light-seal','headband','speaker-l','speaker-r','visor-frame'],
  tour: ['front-glass','light-seal','visor-frame','headband','speaker-l','speaker-r','display','board','fan','battery-pack'],
  builders,
  parts: [
    { id:'front-glass', zh:'前面板玻璃', en:'LAMINATED GLASS', real:true,
      ex:[0,.3,3.2], lo:[0,1.7,0], tag:'单片层压 · EyeSight',
      desc:'一整片三维成型的层压玻璃贴合到铝制前框上：玻璃之下是 EyeSight 显示阵列——数千颗微 LED 与柱镜透镜层把你的眼睛“投射”到外表面，让周围的人看见佩戴者的视线。',
      specs:[['结构','3D 成型层压玻璃'],['集成','EyeSight 外显'],['传感器','5 麦克风 · 环境光'],['工艺','光学贴合']] },
    { id:'light-seal', zh:'光密封罩', en:'LIGHT SEAL', real:true,
      ex:[0,-.6,2.6], lo:[0,1.4,0], tag:'织物面罩 · 多尺寸',
      desc:'织物包覆的光密封罩：双层织物泡沫贴合脸部轮廓，隔绝环境光进入光学系统；配两种尺寸面罩与三种宽度的垫圈，按脸型组合更换（磁吸定位）。',
      specs:[['材质','双层织物泡沫'],['规格','2 尺寸 × 3 垫圈'],['安装','磁吸卡位'],['卫生','可拆洗更换']] },
    { id:'headband', zh:'Dual Knit 头带', en:'DUAL KNIT BAND', real:true,
      ex:[0,1.6,1.0], lo:[0,1.6,0], tag:'针织双带 · 前后配重',
      desc:'Dual Knit 头带以一体针织工艺织出缓冲与透气结构：底部窄带托住后脑、顶部宽带分散重量，头带内置线缆连接电池；旋钮式调节环单手即可收紧。',
      specs:[['工艺','一体针织双层'],['调节','棘轮旋钮'],['走线','内置电池线缆'],['配重','前后均衡设计']] },
    { id:'speaker-l', zh:'左音频臂', en:'LEFT AUDIO STRAP', real:true,
      ex:[-1.8,.6,1.4], lo:[0,1.2,0], tag:'耳外定向声场',
      desc:'左侧音频臂：骨架内走线，末端驱动单元悬于耳廓外侧，通过定向声场把声音送入耳内同时让环境声保持可闻——空间音频不用塞进耳朵。',
      specs:[['类型','耳外定向扬声器'],['特性','个人化空间音频'],['集成','头带线缆走线']] },
    { id:'speaker-r', zh:'右音频臂', en:'RIGHT AUDIO STRAP', real:true,
      ex:[1.8,.6,1.4], lo:[0,1.2,0], tag:'耳外定向声场',
      desc:'右侧音频臂与 Digital Crown 集成在右侧：旋钮调节沉浸度（完全沉浸 ↔ AR 透视），下方拍照键抓取空间照片。',
      specs:[['集成','Digital Crown'],['沉浸调节','无级旋转'],['快门','空间照片键']] },
    { id:'visor-frame', zh:'铝制主体框架', en:'ALUMINUM VISOR FRAME', real:true,
      ex:[0,0,1.8], lo:[0,1.5,0], tag:'一体铝合金 · 风道',
      desc:'包裹显示与光学系统的铝制框架：侧面集成散热风道与传感器舱，顶部旋钮锁紧光密封罩；全部计算硬件（M2、R1、存储、风扇）都藏在这层框架之内。',
      specs:[['材质','一体铝合金'],['集成','12 相机 · 5 传感器'],['散热','主动风道'],['定位','M2 + R1 双芯']] },
    { id:'display', zh:'micro-OLED 显示堆栈', en:'MICRO-OLED STACK',
      ex:[0,.6,4.2], lo:[0,1.6,0], tag:'双 1.42″ · 2300 万像素',
      desc:'双 1.42 英寸 micro-OLED 面板：每眼单像素尺寸仅 7.5 微米，合共 2300 万像素超越 4K 电视；面板光线经三片式 Pancake 折叠光路放大成像，透过率与清晰度兼得。',
      specs:[['面板','1.42″ micro-OLED ×2'],['像素','3660×3200/眼'],['光路','Pancake 三片式'],['刷新','90/96/100Hz']] },
    { id:'board', zh:'计算主板', en:'M2 + R1 BOARD',
      ex:[0,4.6,.8], lo:[0,1.6,0], tag:'M2 + R1 双芯片',
      desc:'M2 负责 visionOS 与图形渲染，R1 专用芯片以 12ms 延迟并行处理 12 颗相机与 5 个传感器的实时流——两颗芯片各司其职，是 Vision Pro 实时空间感知的核心。',
      specs:[['主芯','Apple M2'],['协处理器','R1 · 12ms 延迟'],['存储','256GB-1TB'],['互联','板载封装']] },
    { id:'fan', zh:'散热风扇', en:'THERMAL FAN',
      ex:[-2.4,5.6,-1.0], lo:[0,1.3,0], tag:'静音主动散热',
      desc:'藏在框架上缘的微型离心风扇：把 M2/R1 的热量经前框风道导出，满载时仍几乎不可闻。',
      specs:[['类型','微型离心'],['风道','前框侧面出风'],['噪音','近静音']] },
    { id:'battery-pack', zh:'外置电池', en:'EXTERNAL BATTERY PACK',
      ex:[0,-4.4,-2.2], lo:[0,1.4,0], tag:'3569 mAh · 2h 续航',
      desc:'外置双芯电池包（3569 mAh）：经编织线缆连接头带，兼顾配重与安全——高能量电池远离头部；支持热插拔更换与 20W 边充边用。',
      specs:[['容量','3569 mAh（双芯）'],['续航','约 2 小时'],['连接','编织线缆 · 磁吸'],['特性','热插拔 · 边充边用']] },
  ],
  postLoad: composePostLoad(
    anchorParts({
      display: { ref:'front-glass', dz:-1.6 },
      board:   { ref:'visor-frame', dz:-.3 },
      fan:     { ref:'visor-frame', dy:1.2, dz:-.2 },
      'battery-pack': { ref:'headband', dy:-.8, dz:-1.4 },
    }),
    ({ partsById, addLiveScreen })=>{},
  ),
  tick: null,
});
