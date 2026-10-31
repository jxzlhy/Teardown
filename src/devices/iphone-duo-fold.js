/* =============================================================
   设备配置：Apple iPhone Duo 折叠屏（星白 · 2026）
   官方系 AR 资产：展开态平铺（两半共面 17cm 宽）、内屏朝 +z
   （screen 平面 z=+0.0024 全幅覆盖；铰链条在中缝 x≈0 实测）
   映射：rel.z 分层 + rel.x 分左右半区 + 细长小件判铰链
============================================================= */
import { makeDevice, anchorParts, composePostLoad } from './_kit/factory.js';
import { makePhoneScreen } from './_kit/screen.js';
import { mainboard, battery, chargeCoil, speakerBox, portPcb } from './_kit/internals.js';

const screen = makePhoneScreen({ w: 1080, h: 800, brand: 'IPHONE', carrier: '5G', accent: '#7fb8d8' });

const builders = {
  board: (g)=> mainboard(g, { w:4.2, h:3.0, soc:[-1.1,.5], ram:[1.0,.8], label:'APPLE A20', sub:'FOLD · MAIN BOARD', pcb:'#1a2a4a', smalls:16 }),
  battery: (g)=> battery(g, { w:3.4, h:4.0, d:.5, label:'APPLE', capacity:'双电芯', model:'A4xxx ×2', rating:'3.87V' }),
  coil:   (g)=> chargeCoil(g, 1.6),
  speaker: (g)=> speakerBox(g, 2.0, 1.0, .55),
  'usb-pcb': (g)=> portPcb(g, 1.4, 1.05),
};

export default makeDevice({
  id: 'iphone-duo-fold',
  era: 2026,
  name: 'Apple iPhone Duo 折叠屏',
  en: 'IPHONE DUO FOLD',
  category: '手机',
  brand: 'APPLE',
  tagline: '苹果首款折叠 · 无折痕内屏 · 铰链工程',
  description: 'iPhone Duo（2026）：苹果首款折叠屏，9 月 9 日发布、10 月 23 日上市，起售价约 $2,000。书页式折叠展开约 8 英寸内屏，面板来自三星显示，主打「无折痕」；铰链是全系最大的工程挑战——本模型展开态平铺，中缝两端的铰链条清晰可见。官方产品页资产，内构件为示意重建。',
  specs: [
    ['形态','书页式折叠 · 展开约 8″'],['内屏','三星显示 · 无折痕方案'],
    ['芯片','A20 系（2nm）'],['铰链','自研 minimizing 折痕机构'],
    ['上市','2026-10-23'],['起售价','约 $2,000'],
    ['配色','星白（Star White）'],['外屏','折叠态外显示'],
  ],
  accent: '#7fb8d8',
  source: 'Apple 官网 AR 模型（USDZ/GLB 资产）',
  targetWidth: 12.5,
  camDist: 1.1,
  normalize: 'full',
  glb: '/assets/iphone-duo-fold.glb',
  /* 策展导览：屏→铰链→中框→板→电池→底部→背盖（折叠叙事） */
  tour: ['display','hinge','frame','board','battery','coil','speaker','usb-pcb','back-r'],
  xrayShellIds: ['display','back-r','frame'],
  mapByPosition(name, p, rel, ext){
    /* 铰链条：中缝 x≈0 的横向细杆（0.0125×0.0018×0.0017 实测） */
    if(Math.abs(p.x) < 0.012 && ext.x < 0.02 && ext.y < 0.006) return 'hinge';
    if(rel.z > 0.5) return 'display';
    if(rel.z < 0.35) return 'back-r';
    return 'frame';
  },
  realPartIds: ['display','back-r','hinge','frame'],
  builders,
  parts: [
    { id:'display', zh:'无折痕内屏', en:'CREASE-FREE INNER DISPLAY', real:true,
      ex:[0,.3,2.6], lo:[0,1.4,0], tag:'约 8″ · 三星面板',
      desc:'展开约 8 英寸内屏：三星显示供货的面板与自研铰链配合，实现发售时「无可视折痕」——水滴型铰链让屏幕以大曲率弯折而非锐角折叠，避免永久折痕。展开态平铺时整幅面板连续无断开。',
      specs:[['尺寸','约 8″ 展开'],['面板','三星显示'],['折痕','无可视折痕'],['刷新','ProMotion 自适应']] },
    { id:'back-r', zh:'半区背板与相机区', en:'HALF SHELL + CAMERA', real:true,
      ex:[1.6,-.3,-2.4], lo:[0,1.3,0], tag:'星白玻璃 · 右半 · 相机区',
      desc:'半区背板：星白玻璃与后置相机岛所在——折叠态下背板贴合保护内屏，展开拍摄时握持手感与传统直板机一致；无线充电线圈区与天线也布置在这半区。',
      specs:[['材质','星白强化玻璃'],['集成','后置相机岛 · 线圈'],['结构','随折翻拍摄']] },
    { id:'hinge', zh:'水滴型铰链', en:'WATERDROP HINGE', real:true,
      ex:[0,.4,-1.4], lo:[0,1.3,0], tag:'中缝双链条 · 折痕关键',
      desc:'水滴型铰链机构：中缝上下两端的铰链条在模型里清晰可辨——多连杆结构让屏幕弯折成水滴形大曲率而非对折锐角，这是「无折痕」的核心；铰链同时承担阻尼与悬停支撑。',
      specs:[['结构','多连杆水滴型'],['弯折半径','大曲率缓弯'],['功能','阻尼 · 悬停 · 折痕抑制']] },
    { id:'frame', zh:'折叠中框', en:'FOLD FRAME', real:true,
      ex:[0,0,1.6], lo:[0,1.2,0], tag:'钛铝混构 · 天线断点',
      desc:'折叠形态中框：展开态两侧边框与中缝框架连成一体，天线断点绕过铰链区布置；铰链盖板与边框同材质一体化。',
      specs:[['材质','钛铝混构'],['天线','绕铰链区布置'],['一体','含铰链盖板']] },
    { id:'board', zh:'主板', en:'A20 FOLD MAINBOARD',
      ex:[-1.2,2.2,.4], lo:[0,1.4,0], tag:'A20 系 · 分板布局',
      desc:'折叠机主板：为避开铰链区，主板拆分布置在左右两半机身——SoC 一侧、射频另一侧，经跨铰链软板桥接；A20 系芯片（2nm）驱动双屏协同。',
      specs:[['形态','左右分板 + 跨链软板'],['SoC','A20 系 2nm'],['协同','内外屏接力显示']] },
    { id:'battery', zh:'双电芯电池', en:'DUAL-CELL BATTERY',
      ex:[1.2,-2.4,.4], lo:[0,1.4,0], tag:'左右各一 · 对称供电',
      desc:'双电芯电池：左右两半机身各置一块，避开铰链区；双电芯串联架构提升快充电压效率，总容量支撑大屏功耗。',
      specs:[['架构','双电芯分置'],['布局','左右对称'],['快充','高压双路']] },
    { id:'coil', zh:'无线充电线圈', en:'CHARGE COIL',
      ex:[-1.4,-2.6,-.8], lo:[0,1.1,0], tag:'单侧线圈 · 磁阵对位',
      desc:'无线充电线圈（单侧布置）：折叠态下磁体阵列与线圈对位，Qi2 标准充电；折叠厚度限制了线圈直径，充电功率略低于直板旗舰。',
      specs:[['标准','Qi2'],['布置','单侧线圈'],['对位','MagSafe 类磁阵']] },
    { id:'speaker', zh:'扬声器', en:'SPEAKER MODULE',
      ex:[1.8,-2.8,-.6], lo:[0,1.0,0], tag:'底部双单元',
      desc:'底部扬声器单元（左右各一）：展开态组成对称立体声，折叠态下两单元同侧出声。',
      specs:[['配置','底部双单元'],['音效','展开态对称立体声']] },
    { id:'usb-pcb', zh:'尾插小板', en:'CHARGER FPC',
      ex:[1.4,-3.0,-1.0], lo:[0,1.0,0], tag:'USB-C · 底部居中',
      desc:'USB-C 尾插小板：位于折叠底部居中——无论展开还是折叠，接口方向始终一致。',
      specs:[['接口','USB-C'],['位置','底部居中']] },
  ],
  postLoad: composePostLoad(
    ({ addLiveScreen })=>{ screen.hook(addLiveScreen, 'display'); },
    anchorParts({
      board:     { ref:'frame', dy: 3.6, dz:-.5 },
      battery:   { ref:'back-r', dy:-3.4, dz:-.5 },
      coil:      { ref:'back-r', dy:-3.8, dz:.5 },
      speaker:   { ref:'back-r', dy:-4.6, dz:.5 },
      'usb-pcb': { ref:'back-r', dy:-5.4, dz:.5 },
    }),
  ),
  tick: screen.tick,
});
