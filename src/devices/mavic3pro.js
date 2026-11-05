/* =============================================================
   设备配置：DJI Mavic 3 Pro（WM260）
   官方 GLB（DJI 官网 CDN 资产），181 网格，拼音/代号节点名。
============================================================= */
import * as THREE from 'three';
import { box, addMesh, matDark, matSilver, matGold } from '../engine/materials.js';

const builders = {
  battery(g){
    /* 官方模型不含电池内构件：程序化补充（顶部智能飞行电池） */
    addMesh(g, box(6.2,1.2,4.2,0.25), new THREE.MeshPhysicalMaterial({ color:0x24262b, metalness:0.55, roughness:0.5, clearcoat:0.3 }));
    const label = addMesh(g, new THREE.PlaneGeometry(4.6,1.0),
      new THREE.MeshStandardMaterial({ color:0x1b1e24, roughness:0.5, metalness:0.2 }), 0, 0.61, 0, -Math.PI/2, 0, 0);
    label.material.emissive = new THREE.Color(0x0a2030);
    for(let i=0;i<4;i++) addMesh(g, box(0.3,0.12,0.14,0.02), matGold(), -1.5+i*1.0, 0.28, 2.0);
  },
  'flight-controller'(g){
    addMesh(g, box(4.6,0.5,3.4,0.08), new THREE.MeshStandardMaterial({ map:null, color:0x0a3021, metalness:0.45, roughness:0.6 }));
    addMesh(g, box(1.6,0.3,1.4,0.05), matSilver(), -1.2,0.4,0);
    addMesh(g, box(1.2,0.3,1.2,0.05), matDark(), 1.3,0.4,0.3);
  }
};

/* 云台相机朝向：+Z（机头方向） */
function postLoad({ partsById, addLiveScreen }){
  /* 云台相机轴线：程序化电池块对中即可（官方无内构件） */
  const shell = partsById['shell'];
  if(shell){
    const bb = new THREE.Box3().setFromObject(shell.group);
    const c = bb.getCenter(new THREE.Vector3());
    const s = bb.getSize(new THREE.Vector3());
    partsById['battery'].base.set(c.x, c.y + s.y*0.18, c.z);
    partsById['flight-controller'].base.set(c.x, c.y - s.y*0.18, c.z + 0.4);
  }
}

export default {
  id: 'mavic3pro',
  era: 2023,
  brand: 'DJI',
  source: 'DJI 官网产品页 3D/GLB 资产（CDN 直下）· 仅本机演示不再分发',
  distribution: 'local-demo-only',
  name: 'DJI Mavic 3 Pro',
  en: 'WM260',
  category: '无人机',
  tagline: '三摄哈苏 · 43 分钟续航旗舰航拍机',
  description: 'DJI Mavic 3 Pro：哈苏 4/3 CMOS 主摄 + 双长焦三摄系统，无限旋转云台，最长 43 分钟续航，全向避障。官方实机模型（181 网格），拆解云台相机、四组机臂电机与螺旋桨。',
  specs: [
    ['主摄','哈苏 4/3 CMOS · 2000 万'],['长焦','70mm / 166mm 双长焦'],
    ['续航','最长 43 分钟'],['图传','O3+ · 15 km'],
    ['避障','全向双目 + 激光雷达'],['重量','约 958 g'],
    ['最大速度','21 m/s'],['抗风','12 m/s'],
  ],
  accent: '#45e0ff',
  targetWidth: 9.5,          // 翼展方向
  glb: '/assets/mavic3pro.glb',
  realSizeMM: 347.5,   /* 真实最大外形尺寸（DJI 官方规格：展开 347.5×290.8×107.7mm / 折叠 231.1×98×95.4mm）：测量工具 mm 标定基准 */
  frontAxis: '+x',           // GLB 原生机头朝 +X（云台部件聚类在 +X 侧）
  mapping: {
    'cam_shell':'gimbal', '_HOLDER_1__1':'gimbal', 'LENS01':'gimbal', 'LENS02':'gimbal',
    'lens03':'gimbal', 'L_黑底':'gimbal', 'R_黑底':'gimbal', 'OH300531099_1_2__1':'gimbal',
    '管道':'gimbal', '53299_SINK_2_1__1':'gimbal',
    'YC_ST_LL000140_01_body1':'arms','YC_ST_LL000140_01_body1_2':'arms',
    'YC_ST_LL000140_body1':'arms','YC_ST_LL000140_body1_2':'arms',
    'WM260_FRONT_ARM_LED_FPC':'arms','WM260_FRONT_ARM_LED_FPC_2':'arms',
    'YC_JG_ZS001398_ARMRFLED_body1':'arms','YC_JG_ZS001398_ARMRFLED_body1_2':'arms',
    'YC_JG_ZS001604_ARM_RBTPU':'arms','YC_JG_ZS001605_ARM_LBTPU':'arms',
    'YC_JG_ZS002096_ARM_PAD_3':'arms','YC_JG_ZS002096_ARM_PAD_4':'arms',
    'YC_JG_ZS003300_LB_MOTOR':'arms','YC_JG_ZS003301_RB_MOTOR':'arms',
    'YC_JG_ZS003320_LB_FOOT':'arms','YC_JG_ZS003322_RB_FOOT':'arms',
    'YC_JG_ZS003321_RB_HINGE_1':'arms','YC_JG_ZS003321_RB_HINGE_1_2':'arms',
    'YC_JG_MY000921_1_body1':'vision','YC_JG_MY000921_1_body1_1':'vision',
    'YC_JG_YZ000627_1':'gimbal','YC_JG_YZ000628_1':'gimbal','YC_JG_YZ000629':'gimbal',
    'YC_JG_YZ000630_1':'gimbal','YC_JG_YZ000631':'gimbal','YC_JG_YZ000632_1':'gimbal',
    'YC_JG_ZS003233_1':'gimbal','YC_JG_ZS003234':'gimbal',
    'YC_OC_PG000143':'gimbal','YC_OC_PG000144':'gimbal','YC_OC_PG000145':'gimbal',
    'WM261_BOT_WINDGUIDE_20220901':'shell'
  },
  /* 前缀映射：同名前缀批量归组 */
  mappingPrefix: {
    '机身':'shell', '桨叶':'propellers', '螺丝':'shell'
  },
  unmappedTo: 'shell',
  realPartIds: ['shell','gimbal','propellers','arms','vision'],
  /* AURORA 后/V5.1 内容深度：Mavic 3 Pro 机构——三轴云台+动力系统（DJI 官方口径）。
     四机臂折叠为操作机构（折叠态产品形态），不设折叠边；桨叶回转 revolute。 */
  mech: { edges: [
    { id:'rv-shell-gimbal', type:'revolute', from:'shell', to:'gimbal', kinematic:'exact',
      note:'哈苏 4/3 主摄经三轴增稳云台（roll/pitch/yaw）相对机身增稳回转' },
    { id:'rv-arms-propellers', type:'revolute', from:'arms', to:'propellers', kinematic:'exact',
      note:'四组桨叶绕机臂电机轴回转（动力输出；折叠为操作件不设边）' },
    { id:'fx-arms-shell', type:'fixed', from:'arms', to:'shell', kinematic:'exact',
      note:'四机臂固接于机身框架' },
    { id:'fx-battery-shell', type:'fixed', from:'battery', to:'shell', kinematic:'exact',
      note:'大容量电池插装于机身后部' },
    { id:'fx-vision-shell', type:'fixed', from:'vision', to:'shell', kinematic:'exact',
      note:'全向视觉感知模组阵列固装于机身' },
    { id:'fx-fc-shell', type:'fixed', from:'flight-controller', to:'shell', kinematic:'exact',
      note:'飞控固装于机身中央（含 IMU/气压计冗余）' },
  ] },
  xrayShellIds: ['shell'],
  tour: ['propellers','arms','vision','gimbal','shell','flight-controller','battery'],
  /* 视觉原理演示（Phase 5）：选中螺旋桨绕桨轴旋转（真实为四桨对转，此处同向降速示意） */
  demos: [
    { partId: 'propellers', label: '螺旋桨旋转（降速 · 同向示意）', spin: 'auto', speed: 14 },
  ],
  orientationProbe: null,    // 已显式声明 frontAxis，跳过探测
  labelAnchorDx: {},
  assembledPos: {
    'shell': [0,0,0], 'gimbal': [0,0,0], 'propellers': [0,0,0],
    'arms': [0,0,0], 'vision': [0,0,0],
    'battery': [0,0.6,0.2], 'flight-controller': [0,-0.6,0.2]
  },
  labelOffsets: {
    'shell': [0,1.6,0], 'gimbal': [0,1.2,0], 'propellers': [0,1.6,0],
    'arms': [0,1.2,0], 'vision': [0,1.0,0],
    'battery': [0,0.9,0], 'flight-controller': [0,0.8,0]
  },
  /* 爆炸方向（相机屏幕基准：右/上/朝观察者） */
  explodeOffsets: {
    'shell': [0,0,0], 'gimbal': [0,-0.6,2.6], 'propellers': [0,3.0,0.4],
    'arms': [0,1.2,-1.2], 'vision': [0,0.2,1.8],
    'battery': [0,1.4,1.0], 'flight-controller': [0,-1.0,0.8]
  },
  builders,
  parts: [
    { id:'shell', zh:'机身框架', en:'MONOCOQUE AIRFRAME',
      offset:[0,0,0], tag:'一体成型 · 折叠设计',
      desc:'Mavic 3 Pro 机身采用一体成型框架，前后机臂可向内折叠收纳；上下壳体间以 14 颗精密螺丝紧固，内部容纳飞控、图传与散热风道。',
      specs:[['结构','折叠四旋翼'],['收纳尺寸','231 × 98 × 95 mm'],['展开尺寸','348 × 283 × 108 mm'],['重量','约 958 g']] },
    { id:'gimbal', zh:'云台相机（哈苏三摄）', en:'HASSELBLAD TRIPLE CAMERA',
      offset:[0,-0.6,2.6], tag:'4/3 CMOS · 三摄影像',
      desc:'三轴机械增稳云台集成哈苏三摄：24mm 主摄（4/3 CMOS 2000 万像素）、70mm 中长焦与 166mm 长焦，支持无损变焦与 Apple ProRes 编码。',
      specs:[['主摄','4/3 CMOS · 24mm'],['中长焦','70mm · 700 万'],['长焦','166mm · 1200 万'],['增稳','三轴机械云台']] },
    { id:'propellers', zh:'螺旋桨', en:'PROPELLERS ×4',
      offset:[0,3.0,0.4], tag:'低噪声桨叶 · 四组',
      desc:'四组低噪声桨叶，折叠后贴合机臂；桨叶气动外形经优化降噪约 4dB，配合电机动力系统提供最高 21 m/s 飞行速度。',
      specs:[['数量','4 组（正反桨）'],['类型','快拆低噪声桨'],['降噪','约 4dB'],['材质','工程塑料']] },
    { id:'arms', zh:'机臂与电机', en:'ARMS & MOTORS',
      offset:[0,1.0,-1.8], tag:'四电机 · 折叠铰链',
      desc:'前后四条机臂内嵌无刷电机与电调，铰链处带橙色缓冲垫；后臂先折、前臂再合，机臂末端集成 LED 状态灯与起落脚架。',
      specs:[['电机','四组无刷电机'],['铰链','折叠缓冲设计'],['LED','前后状态灯'],['脚架','一体起落腿']] },
    { id:'vision', zh:'视觉传感系统', en:'VISION SENSING',
      offset:[-1.8,0.3,1.6], tag:'全向双目 · 激光雷达',
      desc:'机身遍布双目视觉相机与ToF/激光雷达：机头双目、底部下视双目与ToF、机身四周全向避障，实现全向精准悬停与绕障。',
      specs:[['水平','双目视觉 ×2'],['下视','双目 + ToF'],['避障','全向感知'],['辅助','补光灯']] },
    { id:'battery', zh:'智能飞行电池', en:'INTELLIGENT FLIGHT BATTERY',
      offset:[0,1.9,1.3], tag:'5000 mAh · 43 分钟',
      desc:'顶部嵌入 5000 mAh 智能飞行电池，支持 65W 快充与电量自检；配合机身风道为飞控散热，实现最长 43 分钟续航。',
      specs:[['容量','5000 mAh'],['续航','最长 43 分钟'],['充电','65W 快充'],['监控','电量自检']] },
    { id:'flight-controller', zh:'飞控与图传', en:'FLIGHT CONTROLLER & O3+',
      offset:[0,-1.5,0.6], tag:'O3+ 图传 · 全向避障算力',
      desc:'飞控主板集成 IMU、气压计与 O3+ 图传模块，15km 高清低延迟图传；配合全向视觉算力实现精准悬停与智能飞行功能。',
      specs:[['图传','O3+ · 15 km'],['延迟','最低 82 ms'],['定位','GPS + GLONASS + Galileo'],['算力','全向避障']] },
  ],
  postLoad,
  tick: null
};
