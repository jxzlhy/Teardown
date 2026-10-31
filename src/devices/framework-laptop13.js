/* =============================================================
   设备配置：Framework Laptop 13
   官方 CAD（github.com/FrameworkComputer/Framework-Laptop-13 · CC-BY 4.0）
   STEP 整机装配体转 GLB（gmsh 三角化，107 零件，闭合态平放）
   位置+尺寸聚类：键帽阵列 / 触控板 / 顶壳 / 底壳 / 显示层 / 铰链
============================================================= */
import { makeDevice, anchorParts, composePostLoad } from './_kit/factory.js';
import { mainboard, battery, fan, speakerBox } from './_kit/internals.js';

const builders = {
  board: (g)=>{ mainboard(g, { w:8.2, h:4.6, soc:[-1.6,.8], ram:[1.4,.6], label:'FRAMEWORK MAINBOARD', sub:'DIY EDITION · swappable', pcb:'#1d4a34', smalls:18 }); g.rotation.x = -Math.PI/2; },
  battery: (g)=>{ battery(g, { w:7.6, h:4.4, d:.5, label:'FW276', capacity:'55 Wh', model:'FW27601', rating:'11.55V' }); g.rotation.x = -Math.PI/2; },
  fan: (g)=>{ fan(g, 1.1, .35); g.rotation.x = -Math.PI/2; },
  'speaker-l': (g)=> speakerBox(g, 2.6, 1.0, .5),
  'speaker-r': (g)=> speakerBox(g, 2.6, 1.0, .5),
};

export default makeDevice({
  id: 'framework-laptop13',
  era: 2021,
  name: 'Framework Laptop 13',
  en: 'FW LAPTOP 13',
  category: '笔记本',
  brand: 'FRAMEWORK',
  tagline: '可维修模块化 · 官方 CAD 开源',
  description: 'Framework Laptop 13：为维修而生的模块化笔记本——主板可换、接口模块热插拔、官方公开全套 CAD（CC-BY 4.0），本页外观即官方 STEP 装配体（107 零件）直接三角化，拆到键盘每一颗键帽。内构件（电池/主板/风扇）为示意重建。',
  specs: [
    ['芯片','Intel Core Ultra / AMD AI 300 可选'],['屏幕','13.5″ 3:2 2256×1504'],['特性','模块化可维修 10/10'],
    ['接口','Expansion Card 热插拔 ×4'],['键盘','1.5mm 键程 · 键帽可单换'],['电池','55 Wh 可换'],
    ['维修','iFixit 10/10 满分'],['重量','1.3 kg'],
  ],
  accent: '#5ac8fa',
  source: 'Framework 官方 CAD（CC-BY 4.0）',
  modelCredit: 'Framework Laptop 13 CAD by Framework (CC-BY 4.0)',
  targetWidth: 12.5,
  camDist: 1.2,
  glb: '/assets/framework-laptop13.glb',
  /* 策展导览：可维修叙事——底壳→板层→可换件→输入设备→顶壳→屏幕 */
  tour: ['bottom-case','internals','board','battery','fan','speaker-l','speaker-r','keyboard','touchpad','top-case','display-panel','speakers','hinge'],
  xrayShellIds: ['bottom-case','top-case'],
  normalize: 'full',
  mapByPosition(name, p, rel, ext){
    /* 平放闭合态：z=0 为铰链侧、z=229 为前缘；y=0 底壳、y=18 键盘面 */
    if(ext.y > 5 && rel.z < 0.08) return 'hinge';
    if(rel.z < 0.08 && rel.y > 0.12) return 'speakers';
    if(ext.x < 22 && ext.z < 22 && rel.y > 0.3) return 'keyboard';
    if(ext.z > 55 && ext.z < 95 && ext.x > 85 && ext.x < 145) return 'touchpad';
    if(ext.x > 280 && ext.z > 215 && ext.y < 3.5) return 'bottom-case';
    if(rel.y > 0.6) return 'top-case';
    if(ext.x > 250 && ext.z > 150) return 'display-panel';
    return 'internals';
  },
  realPartIds: ['top-case','keyboard','touchpad','bottom-case','display-panel','hinge','speakers','internals'],
  builders,
  parts: [
    { id:'top-case', zh:'顶壳（A 面）', en:'TOP CASE', real:true,
      ex:[0,2.6,1.2], lo:[0,1.7,0], tag:'铝合金 CNC',
      desc:'A 面顶壳：5052 铝合金冲压 + CNC 边缘，Logo 区域可换个性化顶盖（官方彩色顶盖配件）；内侧贴合显示模组与天线结构。',
      specs:[['材质','5052 铝合金'],['工艺','冲压 + CNC'],['个性化','可换彩色顶盖']] },
    { id:'display-panel', zh:'显示面板层', en:'DISPLAY PANEL', real:true,
      ex:[0,3.4,-.6], lo:[0,1.6,0], tag:'13.5″ 3:2 · 2256×1504',
      desc:'显示面板层：13.5 英寸 3:2 比例 IPS，2256×1504 分辨率，官方 CAD 连面板支架层一起公开——闭合态下它平铺在顶壳内侧。',
      specs:[['分辨率','2256×1504 (3:2)'],['比例','3:2 生产力屏'],['色域','100% sRGB']] },
    { id:'keyboard', zh:'键盘（逐键 CAD）', en:'KEYCAPS ARRAY', real:true,
      ex:[0,1.4,2.4], lo:[0,1.6,0], tag:'每颗键帽独立零件',
      desc:'官方 CAD 里每颗键帽都是独立实体：1.5mm 键程剪刀脚结构，键帽可单独更换（KBL 键位自定义印字可选）；这一层直接来自官方装配体。',
      specs:[['键程','1.5 mm'],['结构','剪刀脚'],['维修','键帽单换'],['背光','白色 LED']] },
    { id:'touchpad', zh:'触控板', en:'TOUCHPAD', real:true,
      ex:[.8,1.0,2.6], lo:[0,1.3,0], tag:'独立模块 · 可换',
      desc:'独立触控板模块：玻璃表面 + 全域按压，整块可从 C 面拆下更换（官方卖替代品）。',
      specs:[['表面','玻璃'],['按压','全域单点'],['维修','整块可换']] },
    { id:'bottom-case', zh:'底壳（D 面）', en:'BOTTOM CASE', real:true,
      ex:[0,-2.2,-1.0], lo:[0,1.5,0], tag:'五角螺丝 · 快开',
      desc:'D 面底壳：5 颗防丢五角螺丝，拧开即露出全部内部——主板、电池、风扇、扬声器全部不用拆键盘就能维修，是 iFixit 10 分的核心。',
      specs:[['固定','5× 防丢螺丝'],['快开','免拆键盘'],['材质','再生铝']] },
    { id:'hinge', zh:'铰链', en:'HINGE BARREL', real:true,
      ex:[0,-.4,3.2], lo:[0,1.3,0], tag:'单轴长铰链',
      desc:'贯穿机身的单轴长铰链：官方 CAD 连铰链桶和两端固定件都单独建模，扭力可换（可选更紧/更松铰链套件）。',
      specs:[['结构','单轴长桶'],['扭力','可换套件'],['建模','含端盖独立件']] },
    { id:'speakers', zh:'扬声器条', en:'SPEAKER BARS', real:true,
      ex:[0,-.2,2.8], lo:[0,1.2,0], tag:'铰链侧双条',
      desc:'藏在铰链侧的两条扬声器：经 C 面键盘上方的栅格出音，组成双声道。',
      specs:[['布局','铰链侧双条'],['出音','键盘上方栅格']] },
    { id:'internals', zh:'内部板层', en:'INTERNAL PLATES', real:true,
      ex:[.6,.6,-1.6], lo:[0,1.4,0], tag:'屏蔽板 · 支架层',
      desc:'官方装配体中的内部板层：电磁屏蔽板、镁合金支架与天线层——框架在 CAD 里连这些“看不见的层”都公开了。',
      specs:[['构成','屏蔽板 · 支架'],['开放','全层公开']] },
    { id:'board', zh:'主板（可换）', en:'SWAPPABLE MAINBOARD',
      ex:[0,-.8,-1.8], lo:[0,1.5,0], tag:'整块可换 · 官方开卖',
      desc:'Framework 的灵魂：整块主板可单独更换（换 CPU 代际=换主板），Intel/AMD/Ryzen AI 多代可选，官方长期供应；接口全部经 Expansion Card 热插拔模块扩展。',
      specs:[['形态','整板可换'],['代际','Intel 13th→Core Ultra / AMD'],['接口','4× Expansion Card'],['维修','官方备件长期供应']] },
    { id:'battery', zh:'电池（可换）', en:'BATTERY 55 Wh',
      ex:[-1.0,-1.8,1.4], lo:[0,1.5,0], tag:'55 Wh · 免拆键盘更换',
      desc:'55 Wh 电池：免拆键盘即可更换（拧开底壳直接取），官方单卖；M3 代际起容量与快充都有提升。',
      specs:[['容量','55 Wh'],['更换','免拆键盘'],['官方','单卖备件']] },
    { id:'fan', zh:'散热风扇', en:'COOLING FAN',
      ex:[2.4,.4,-1.8], lo:[0,1.2,0], tag:'单风扇 · 双热管',
      desc:'单风扇 + 双热管的紧凑散热：压住 Core Ultra 28W 释放，清灰只需开底壳。',
      specs:[['结构','单风扇 + 双热管'],['维护','开底壳即可清灰']] },
    { id:'speaker-l', zh:'左扬声器模组', en:'LEFT SPEAKER MODULE',
      ex:[-2.8,-1.0,1.6], lo:[0,1.2,0], tag:'独立模块（左）',
      desc:'左侧扬声器为独立模块，排线连接主板，坏了单独换。',
      specs:[['形态','独立模块'],['维修','单独更换']] },
    { id:'speaker-r', zh:'右扬声器模组', en:'RIGHT SPEAKER MODULE',
      ex:[2.8,-1.0,1.6], lo:[0,1.2,0], tag:'独立模块（右）',
      desc:'右侧扬声器模组与左侧对称，支持智能功放。',
      specs:[['形态','独立模块'],['功放','智能功放']] },
  ],
  postLoad: composePostLoad(
    anchorParts({
      board:       { ref:'bottom-case', dy:1.6, dz:-1.6 },
      battery:     { ref:'bottom-case', dy:1.4, dz:1.8 },
      fan:         { ref:'bottom-case', dy:1.8, dz:-2.6 },
      'speaker-l': { ref:'bottom-case', dy:1.2, dz:3.4 },
      'speaker-r': { ref:'bottom-case', dy:1.2, dz:3.4 },
    }),
  ),
  tick: null,
});
