/* =============================================================
   设备配置：DJI Osmo Pocket 3 · 一英寸口袋全景相机
   官方 GLB（无 Draco），119 网格匿名命名 → 按世界坐标聚类映射
   （资产为沿 X 轴平铺的部件布局：云台在 x≈0/y≈1.3，握把群 -30..-45，
     背板 -47..-72，电池仓 -73..-99，屏幕 +12..16，按键 +2..9）
============================================================= */
import * as THREE from 'three';
import { box, addMesh, matSilver, matGold, matScreen } from '../engine/materials.js';
import { paintPreviewScene } from '../engine/previewScene.js';

/* Pocket 3 屏幕实时 UI（黄昏取景 + 录制状态） */
const scrC = document.createElement('canvas'); scrC.width = 640; scrC.height = 480;
const scrTex = new THREE.CanvasTexture(scrC); scrTex.colorSpace = THREE.SRGBColorSpace;
let recSec = 0, lastTick = 0;
function drawScreen(){
  const g = scrC.getContext('2d'), W = 640, H = 480;
  paintPreviewScene(g, W, H);
  g.strokeStyle = 'rgba(120,180,220,.16)'; g.lineWidth = 1;
  for(let i = 1; i < 3; i++){
    g.beginPath(); g.moveTo(W*i/3, 0); g.lineTo(W*i/3, H); g.stroke();
    g.beginPath(); g.moveTo(0, H*i/3); g.lineTo(W, H*i/3); g.stroke();
  }
  g.font = '600 30px -apple-system,"PingFang SC","Microsoft YaHei",sans-serif';
  g.fillStyle = '#eaf3fa'; g.textAlign = 'left';
  g.fillText('4K/120', 26, 46);
  g.textAlign = 'right'; g.fillStyle = '#9fdcf2';
  g.fillText('ISO 200', W - 26, 46);
  const m = String(Math.floor(recSec/60)).padStart(2,'0'), s2 = String(recSec%60).padStart(2,'0');
  const blink = Math.floor(performance.now()/500) % 2 === 0;
  g.textAlign = 'right';
  if(blink){ g.fillStyle = '#ff5252'; g.beginPath(); g.arc(W - 170, H - 42, 10, 0, Math.PI*2); g.fill(); }
  g.fillStyle = '#eaf3fa'; g.font = '600 32px -apple-system,"PingFang SC","Microsoft YaHei",sans-serif';
  g.fillText('00:' + m + ':' + s2, W - 32, H - 34);
  g.textAlign = 'left'; g.fillStyle = '#45e0ff';
  g.fillText('ROCKSTEADY 3.0', 32, H - 34);
  scrTex.needsUpdate = true;
}
drawScreen();
function tick(){
  if(performance.now() - lastTick > 500){ lastTick = performance.now(); recSec++; drawScreen(); }
}

const builders = {
  battery(g){
    addMesh(g, box(2.2,3.4,1.1,0.12), new THREE.MeshPhysicalMaterial({ color:0x24262b, metalness:0.55, roughness:0.5, clearcoat:0.3 }));
    for(let i=0;i<2;i++) addMesh(g, box(0.14,0.26,0.1,0.02), matGold(), -0.5+i*1.0, 0, 0.56);
  }
};

function postLoad({ partsById, addLiveScreen }){
  const body = partsById['body'];
  if(body){
    const bb = new THREE.Box3().setFromObject(body.group);
    const c = bb.getCenter(new THREE.Vector3());
    partsById['battery'].base.set(c.x + 0.3, c.y, c.z);
  }
  /* 点亮 2 英寸旋转屏 */
  addLiveScreen('screen', -1, scrTex, scrC, 0.9);
}

export default {
  id: 'pocket3',
  era: 2023,   /* 官方公告 2023-10-25（dji.com media-center） */
  brand: 'DJI',
  name: 'DJI Osmo Pocket 3',
  en: 'OP3',
  category: '相机',
  tagline: '一英寸 CMOS 口袋云台相机',
  description: 'DJI Osmo Pocket 3：1 英寸 CMOS 与 2 英寸旋转屏装进口袋尺寸，三轴机械增稳云台，4K/120fps 与全像素 D-Log，Vlog 用户的随身旗舰。官方实机模型（119 网格）。',
  specs: [
    ['传感器','1 英寸 CMOS'],['视场','183° · f/2.0'],
    ['视频','4K/120fps · 全像素 D-Log'],['屏幕','2 英寸旋转触控屏'],
    ['增稳','三轴机械云台'],['续航','约 166 分钟'],
    ['重量','约 179 g'],['尺寸','139.7 × 42.2 × 33.5 mm'],
  ],
  accent: '#ff8fab',
  targetWidth: 5.8,
  normalize: 'full',         // 资产为沿 X 平铺的部件布局，按整体包围盒归一化
  glb: '/assets/pocket3.glb',
  realSizeMM: 139.7,   /* 真实最大外形尺寸（官方规格 139.7×42.2×33.5mm）：测量工具 mm 标定基准 */
  /* 逐步装配组序（内件先装）：机身→电池→控制→云台→旋转屏→背板与仓盖 */
  assembleStep: [
    ['body'],
    ['battery'],
    ['controls'],
    ['gimbal'],
    ['screen'],
    ['backplate','battery-door'],
  ],
  /* 视觉原理演示（Phase 5）：选中云台时三轴姿态微调示意（增稳工作状态） */
  demos: [
    { partId: 'gimbal', label: '三轴机械增稳 · 姿态微调', wobble: [0.14, 0.2, 0.11], wobbleF: 0.9 },
  ],
  /* 策展导览：屏→云台→控制→机身→电池→仓盖→背板 */
  tour: ['screen','gimbal','controls','body','battery','battery-door','backplate'],
  xrayShellIds: ['body','backplate','screen'],
  draco: false,
  frontAxis: '+z',
  orientationProbe: null,
  /* 匿名网格：按相对坐标聚类（经运行时 dump 校准）
     y>0.6 = 顶部云台相机簇；x>0.9 = 平铺的旋转屏；y 0.35-0.6 = 侧面按键 */
  mapByPosition(name, p, rel){
    if(rel.y > 0.6) return 'gimbal';
    if(rel.x > 0.9) return 'screen';
    if(rel.y > 0.35 && rel.y < 0.6) return 'controls';
    return 'body';
  },
  unmappedTo: 'body',
  realPartIds: ['body','gimbal','screen','controls','battery-door','backplate'],
  assembledPos: {
    'body': [0,0,0], 'gimbal': [0,0,0], 'screen': [0,0,0],
    'controls': [0,0,0], 'battery-door': [0,0,0], 'backplate': [0,0,0],
    'battery': [0,-0.2,0.3]
  },
  labelOffsets: {
    'body': [0,1.2,0], 'gimbal': [0,1.0,0], 'screen': [0,1.4,0],
    'controls': [0,0.9,0], 'battery-door': [0,1.1,0], 'backplate': [0,1.3,0],
    'battery': [0,0.9,0]
  },
  builders,
  parts: [
    { id:'body', zh:'机身握把', en:'GRIP BODY',
      offset:[0,0,0], tag:'口袋尺寸 · 一体握把',
      desc:'垂直握把式机身，一手掌握；内藏三轴云台减震结构与散热系统，顶部集成云台保护盖。',
      specs:[['尺寸','139.7 × 42.2 × 33.5 mm'],['重量','约 179 g'],['接口','USB-C · WiFi/蓝牙'],['握把','防滑蒙皮']] },
    { id:'gimbal', zh:'三轴云台相机', en:'3-AXIS GIMBAL CAMERA',
      offset:[0,0.5,2.6], tag:'1 英寸 CMOS · 183°',
      desc:'1 英寸 CMOS 大底搭配 183° 超广角定焦镜头，三轴机械增稳，4K/120fps 与全像素 D-Log M 随手可拍。',
      specs:[['传感器','1 英寸 CMOS'],['光圈','f/2.0 · 183°'],['视频','4K/120fps'],['增稳','三轴机械']] },
    { id:'screen', zh:'2 英寸旋转屏', en:'2″ ROTATING SCREEN',
      offset:[2.4,0.3,0.3], tag:'旋转即开机',
      desc:'2 英寸旋转触控屏，向外旋转即自动开机进入拍摄，支持横竖拍切换与触控调参。',
      specs:[['尺寸','2 英寸'],['类型','旋转触控屏'],['特性','旋转即开机']] },
    { id:'controls', zh:'控制区', en:'CONTROLS',
      offset:[2.4,-1.4,0.5], tag:'模式拨轮 · 快门',
      desc:'侧面功能拨轮切换变焦与增益，快门键与菜单键布局于单手操作位。',
      specs:[['拨轮','变焦 / 增益'],['快门','一键拍摄'],['菜单','触屏 + 实体键']] },
    { id:'battery-door', zh:'电池仓盖', en:'BATTERY DOOR',
      offset:[-2.6,-1.5,0.5], tag:'底部抽取式电池',
      desc:'握把底部抽取式电池仓，5000 mAh 电池支持 16 分钟快充充至 80%，可边充边拍。',
      specs:[['容量','5000 mAh'],['快充','16 分钟至 80%'],['续航','约 166 分钟']] },
    { id:'backplate', zh:'背板与散热', en:'BACKPLATE & VENTS',
      offset:[-2.2,1.8,-1.4], tag:'散热风道 · 扬声器',
      desc:'握把背部集成散热风道与扬声器，高负载录制时主动降温并保留收音提示。',
      specs:[['散热','主动风道'],['扬声器','提示音']] },
    { id:'battery', zh:'电池', en:'BATTERY 5000 mAh',
      offset:[0,-1.8,1.4], tag:'5000 mAh',
      desc:'5000 mAh 大容量电池，支持边充边拍与 PD 快充。',
      specs:[['容量','5000 mAh'],['快充','PD 30W']] },
  ],
  postLoad,
  tick
};
