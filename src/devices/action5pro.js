/* =============================================================
   设备配置：DJI Osmo Action 5 Pro（AC204）
   官方 GLB（DJI 官网 CDN），与 Action 4 同套 JISHEN 命名体系，
   且带显式前/后屏幕网格。沿用 Action 4 的映射约定。
============================================================= */
import * as THREE from 'three';
import { box, addMesh, roundedRectShape, matShell, matDark, matSilver, matGold } from '../engine/materials.js';

const W = 7.05, H = 4.44;
const LENS_X = 1.72;

const builders = {
  battery(g){
    addMesh(g, box(4.1,3.0,1.5,0.14), new THREE.MeshPhysicalMaterial({ color:0x24262b, metalness:0.55, roughness:0.5, clearcoat:0.3 }));
    for(let i=0;i<3;i++) addMesh(g, box(0.16,0.3,0.1,0.02), matGold(), 1.98, -0.7+i*0.55, 0);
  },
  mainboard(g){
    addMesh(g, box(5.7,3.7,0.14,0.08), new THREE.MeshStandardMaterial({ color:0x0a3021, metalness:0.45, roughness:0.6 }));
    addMesh(g, box(1.7,1.4,0.24,0.04), matSilver(), -1.35,0.75,0.12);
    addMesh(g, box(1.25,1.25,0.18,0.03), new THREE.MeshPhysicalMaterial({ color:0x07090d, metalness:0.25, roughness:0.14, clearcoat:1 }), 1.05,0.55,0.11);
  },
  thermal(g){
    addMesh(g, box(5.3,3.1,0.12,0.06), new THREE.MeshStandardMaterial({ color:0xa86030, metalness:0.95, roughness:0.36 }));
    for(let i=0;i<6;i++) addMesh(g, box(5.1,0.09,0.4,0.02), new THREE.MeshStandardMaterial({ color:0xa86030, metalness:0.95, roughness:0.36 }), 0, -1.05+i*0.42, 0.24);
  },
  'cover-glass'(){}
};

function postLoad({ partsById }){
  const lensBox = new THREE.Box3().setFromObject(partsById['lens'].group);
  const lensC = lensBox.getCenter(new THREE.Vector3());
  partsById['sensor'].base.set(lensC.x, lensC.y, -0.2);
  partsById['battery'].base.set(lensC.x - 2.8, lensC.y - 0.4, -0.6);
  partsById['mainboard'].base.set(lensC.x - 0.4, lensC.y + 0.2, -0.5);
  partsById['thermal'].base.set(lensC.x - 0.4, lensC.y + 0.2, -0.9);

  /* 散件回收：官方资产把部分部件平铺在机身远端（营销爆炸图布局），
     把它们整体搬回机身附近，否则爆炸时这些部件在视野外 */
  const _v = new THREE.Vector3();
  const shellBB = new THREE.Box3().setFromObject(partsById['shell'].group);
  const sc = shellBB.getCenter(new THREE.Vector3());
  const ssize = shellBB.getSize(new THREE.Vector3());
  const limit = Math.max(ssize.x, ssize.y, 1) * 2.5;
  for(const pid of ['shutter','rear-screen','battery-cover','qs','io-door','mount','shell']){
    const p = partsById[pid]; if(!p) continue;
    const scattered = [];
    p.group.traverse(o=>{ if(o.isMesh){ o.getWorldPosition(_v); if(Math.abs(_v.x - sc.x) > limit) scattered.push(o); } });
    if(!scattered.length) continue;
    const cb = new THREE.Box3();
    scattered.forEach(o=>cb.expandByObject(o));
    const cc = cb.getCenter(new THREE.Vector3());
    const d = sc.clone().sub(cc);
    scattered.forEach(o=>{ o.position.x += d.x; o.position.y += d.y; o.position.z += d.z; });
  }
}

export default {
  id: 'action5pro',
  era: 2024,
  brand: 'DJI',
  source: 'DJI 官网产品页 3D/GLB 资产（CDN 直下）· 仅本机演示不再分发',
  distribution: 'local-demo-only',
  name: 'DJI Osmo Action 5 Pro',
  en: 'AC204',
  category: '相机',
  tagline: '超长续航 · 4K/120fps 运动相机',
  description: 'DJI Osmo Action 5 Pro：同级最大 195g 机身内塞入 47GB/s 带宽与 4 小时续航，1/1.3 英寸传感器与 10-bit D-Log M，前后双触摸屏。官方实机模型。',
  specs: [
    ['传感器','1/1.3″ CMOS'],['视频最高','4K / 120 fps'],
    ['续航','最长 4 小时'],['防水','裸机 20 m'],
    ['色彩','10-bit D-Log M'],['防抖','RockSteady 3.0'],
    ['重量','约 195 g'],['存储','内置 47GB + microSD'],
  ],
  accent: '#7ee787',
  targetWidth: 7.05,
  glb: '/assets/action5pro.glb',
  realSizeMM: 70.5,   /* 真实最大外形尺寸（DJI 官方规格 70.5×44.2×32.8mm，与 Action 4 同模具）：测量工具 mm 标定基准 */
  /* 策展导览：与 action4 同构（镜头→传感→主板→散热→电池→外壳→屏幕） */
  tour: ['lens','sensor','mainboard','thermal','battery','battery-cover','shell','rear-screen','front-screen','mount','shutter','qs','io-door','cover-glass'],
  xrayShellIds: ['shell','battery-cover','io-door','front-screen','rear-screen','mount','shutter','qs'],
  mapping: {
    'GLASS':'lens','GLASS_2':'lens','lens01':'lens','lens02':'lens','lens03':'lens',
    '镜头丝印':'lens','镜头环_':'lens','JISHEN_09':'lens','JISHEN_022':'lens',
    'JISHEN_023':'lens','JISHEN_026':'lens','JISHEN_028':'lens',
    '前屏幕':'front-screen','BOLI':'front-screen','JISHEN_020':'front-screen',
    '后屏幕':'rear-screen','JISHEN_013':'rear-screen',
    '前壳':'shell','AC5_LOGO':'shell','AC204_CAMERA_TPU_FRONT':'shell',
    'JISHEN_04':'shell','JISHEN_031':'shell','JISHEN_07_1':'shell',
    'JISHEN_012':'shutter','JISHEN_015':'qs',
    'JISHEN_05':'battery-cover','JISHEN_019_1':'battery-cover',
    'JISHEN_08':'io-door','JISHEN_014':'shell','JISHEN_016':'mount',
    'JISHEN_017':'mount','JISHEN_018':'mount'
  },
  unmappedTo: 'shell',
  realPartIds: ['shell','cover-glass','lens','front-screen','rear-screen','shutter','qs','io-door','battery-cover','mount'],
  /* AURORA 后/V5.1 内容深度：Action 5 Pro 机构（与 Action 4 同模具同构，DJI 官方口径）——
     云台边与操作件边同 action4 口径；5 Pro 特有 47GB 内置存储（无机构差异）。 */
  mech: { edges: [
    { id:'rv-shell-lens', type:'revolute', from:'shell', to:'lens', kinematic:'exact',
      note:'镜头组（含传感器总成）经三轴增稳云台相对壳体增稳回转（云台机构含于 lens 部件汇总口径）' },
    { id:'mg-mount-shell', type:'linkage', from:'mount', to:'shell', kinematic:'exact',
      note:'底部快拆 mounting 耳（磁吸+双爪 Quick Release）与壳体锁接——装拆为操作机构' },
    { id:'fx-cover-glass-lens', type:'fixed', from:'cover-glass', to:'lens', kinematic:'exact',
      note:'镜头保护镜磁吸附于镜头组前端' },
    { id:'fx-shutter-shell', type:'revolute', from:'shutter', to:'shell', kinematic:'exact',
      note:'顶部快门键/模式拨轮摇臂绕壳体支点摆动（操作件回转）' },
    { id:'fx-io-door-shell', type:'revolute', from:'io-door', to:'shell', kinematic:'exact',
      note:'侧仓门（电池/存储）绕壳侧轴翻开' },
    { id:'fx-batterycover-shell', type:'revolute', from:'battery-cover', to:'shell', kinematic:'exact',
      note:'电池舱盖翻扣于壳体' },
  ] },
  orientationProbe: null,
  frontAxis: '+z',
  labelAnchorDx: {},
  assembledPos: {
    'cover-glass': [LENS_X,0,1.76], 'lens': [LENS_X,0,0.85], 'sensor': [LENS_X,0,-0.2],
    'front-screen': [-1.75,0.35,1.42], 'mainboard': [0,0,-0.05], 'thermal': [0,0.55,-0.5],
    'shell': [0,0,0], 'battery': [0,-0.1,-1.05], 'battery-cover': [-3.56,-0.25,0.0],
    'rear-screen': [0,0,-1.49], 'mount': [0,-2.34,0], 'shutter': [-1.8,2.22,0.0],
    'qs': [3.56,1.0,0.0], 'io-door': [3.56,-1.1,0.0]
  },
  labelOffsets: {
    'cover-glass': [0,0.8,0], 'lens': [0,1.8,0], 'sensor': [0,1.2,0], 'front-screen': [0,1.7,0],
    'mainboard': [0,2.1,0], 'thermal': [0,1.9,0], 'shell': [0,2.6,0], 'battery': [0,2.0,0],
    'battery-cover': [0,1.4,0], 'rear-screen': [0,2.4,0], 'mount': [0,0.9,0], 'shutter': [0,0.8,0],
    'qs': [0,0.8,0], 'io-door': [0,1.0,0]
  },
  builders, parts: [
    { id:'cover-glass', zh:'镜头保护镜', en:'PROTECTIVE GLASS', offset:[0,0,2.9], tag:'强化玻璃 · 高透光',
      desc:'镜头最前端的强化玻璃镜片，为内部镜组提供第一道防护，抗刮擦且不损失画质。',
      specs:[['类型','强化玻璃'],['特性','高透光 · 抗刮擦']] },
    { id:'lens', zh:'广角镜头模组', en:'WIDE LENS MODULE', offset:[0,0,2.4], tag:'f/2.8 · 155° 超广角',
      desc:'定焦超广角镜头，多组非球面镜片，支持水下色彩还原与 155° 视野。',
      specs:[['光圈','f/2.8'],['视场角','155°'],['特性','水下色彩还原']] },
    { id:'sensor', zh:'图像传感器', en:'1/1.3″ CMOS', offset:[0,0,1.9], tag:'1/1.3 英寸大底',
      desc:'1/1.3 英寸大底 CMOS，2.4μm 融合大像素，弱光画质显著提升，动态范围高达 13.5 档。',
      specs:[['尺寸','1/1.3 英寸'],['融合像素','2.4μm'],['动态范围','13.5 档']] },
    { id:'front-screen', zh:'前置触摸屏', en:'FRONT TOUCHSCREEN', offset:[-2.4,0.3,1.8], tag:'触摸自拍屏',
      desc:'前置彩色触摸屏，自拍构图与参数调整一屏完成。',
      specs:[['类型','彩色触摸屏'],['功能','自拍预览 · 设参']] },
    { id:'mainboard', zh:'主板', en:'MAINBOARD', offset:[0,2.6,0.8], tag:'10-bit · D-Log M',
      desc:'整机运算核心，支持 10-bit D-Log M 与 4K/120fps 处理管线。',
      specs:[['色深','10-bit D-Log M'],['码率','最高 130 Mbps']] },
    { id:'thermal', zh:'散热模块', en:'THERMAL MODULE', offset:[1.7,2.6,-0.6], tag:'导热板 + 石墨',
      desc:'将处理器热量快速传导至机身表面，支撑 4 小时长续航高负载录制。',
      specs:[['方案','导热板 + 石墨'],['收益','长时间稳定录制']] },
    { id:'shell', zh:'机身框架', en:'UNIBODY FRAME', offset:[0,0,0], tag:'裸机防水 20 m',
      desc:'一体成型机身，裸机 20 米防水，内置 47GB 存储与 1950mAh 电池。',
      specs:[['防水','裸机 20 m'],['内置存储','47 GB'],['重量','约 195 g']] },
    { id:'battery', zh:'电池', en:'BATTERY 1950 mAh', offset:[-2.5,-1.7,0.3], tag:'最长 4 小时续航',
      desc:'1950mAh 高容量电池，室温下最长约 4 小时续航，支持快充与反向充电。',
      specs:[['容量','1950 mAh'],['续航','最长 4 小时'],['充电','快充 · 反向充电']] },
    { id:'battery-cover', zh:'电池仓盖', en:'BATTERY COVER', offset:[-2.3,1.9,-0.2], tag:'左侧面 · 上滑开启',
      desc:'左侧电池仓滑动仓盖，仓内集成电池与 microSD 卡槽，合盖密封防水。',
      specs:[['开启','释放键 + 上滑'],['仓内','电池 + microSD']] },
    { id:'rear-screen', zh:'后置触摸屏', en:'REAR TOUCHSCREEN', offset:[1.6,-2.6,-0.6], tag:'高清触控屏',
      desc:'背部高清触摸屏，全参数触控与回放。',
      specs:[['类型','高清触摸屏'],['功能','全参数触控 · 回放']] },
    { id:'mount', zh:'快拆底座', en:'QUICK-RELEASE MOUNT', offset:[0,-3.1,0.5], tag:'底部快拆',
      desc:'底部快拆结构，兼容 Action 系列配件生态与 1/4″ 螺口转接。',
      specs:[['结构','底部快拆'],['兼容','Action 配件 · 1/4″']] },
    { id:'shutter', zh:'快门按键', en:'SHUTTER BUTTON', offset:[-1.3,2.5,0.5], tag:'一键开录',
      desc:'顶部录制键，短按拍摄，长按快拍开机。',
      specs:[['短按','拍照 / 录制'],['长按','SnapShot 快拍']] },
    { id:'qs', zh:'QS 快切按键', en:'QUICK-SWITCH', offset:[2.7,1.1,0.5], tag:'长按开关机',
      desc:'右侧快切键，长按开关机，短按切换拍摄模式。',
      specs:[['长按','开关机'],['短按','切换模式']] },
    { id:'io-door', zh:'USB-C 仓盖', en:'USB-C PORT COVER', offset:[2.5,-1.7,0.6], tag:'右侧面仓盖',
      desc:'右侧橡胶仓盖保护 USB-C 接口，支持充电、传输与外接麦克风。',
      specs:[['接口','USB-C'],['扩展','麦克风 · Webcam']] },
  ],
  postLoad,
  tick: null
};
