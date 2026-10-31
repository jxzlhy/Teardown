/* =============================================================
   设备配置：DJI Avata 2（WM169）· 沉浸式 FPV 飞行无人机
   官方 GLB，56 网格，全语义命名（Battery/Motor/Gimbal...）
============================================================= */
import * as THREE from 'three';
import { box, addMesh, matSilver, matGold } from '../engine/materials.js';

const builders = {
  battery(g){
    addMesh(g, box(3.4,1.4,5.2,0.3), new THREE.MeshPhysicalMaterial({ color:0x24262b, metalness:0.55, roughness:0.5, clearcoat:0.3 }));
    for(let i=0;i<3;i++) addMesh(g, box(0.24,0.2,0.12,0.02), matGold(), -0.9+i*0.9, 0.72, -1.6);
  }
};

function postLoad({ partsById }){
  const body = partsById['shell'];
  if(body){
    const bb = new THREE.Box3().setFromObject(body.group);
    const c = bb.getCenter(new THREE.Vector3());
    const s = bb.getSize(new THREE.Vector3());
    partsById['battery'].base.set(c.x, c.y + s.y*0.28, c.z);
  }
}

export default {
  id: 'avata2',
  era: 2024,
  brand: 'DJI',
  name: 'DJI Avata 2',
  en: 'WM169',
  category: '无人机',
  tagline: '沉浸式 FPV 穿越机 · 一键翻滚',
  description: 'DJI Avata 2：内置桨叶保护罩的沉浸式穿越机，配合飞行眼镜带来第一人称视角飞行体验，支持一键翻滚与 4K/100fps 超广角 HDR 影像。官方实机模型（56 网格，语义化命名）。',
  specs: [
    ['影像','1/1.3″ CMOS · 4K/100fps HDR'],
    ['视场','155° 超广角 FPV'],['续航','约 23 分钟'],
    ['图传','O4 · 13 km'],['抗风','5 级 (10.7 m/s)'],
    ['特技','一键翻滚 · 惯性翻转'],['重量','约 377 g'],
  ],
  accent: '#ffb35c',
  targetWidth: 8.2,
  glb: '/assets/avata2.glb',
  /* 策展导览：壳→云台→动力→电池 */
  tour: ['shell','gimbal','powertrain','battery'],
  xrayShellIds: ['shell'],
  draco: true,
  frontAxis: '+z',
  orientationProbe: null,
  mapping: {
    'Lens2':'gimbal','PITCH_ASSISTANT':'gimbal','PITCH_ASSISTANT_2':'gimbal',
    'PITCH_COVER_PC':'gimbal','WA520_GM_BL_COVER':'gimbal','WA520_GM_HG_619':'gimbal',
    'WA520_GM_VDBALL_body1_1':'gimbal','GM_VDBALL_body1_2':'gimbal',
    'WA520_GIM_HOLDER_FORMAL_01_RUB':'gimbal',
    'Battery':'battery','Battery2':'battery','Battery_Buttons':'battery',
    'Motor_1':'powertrain','MOTOR_BLADECCW_75_66_body1_1':'powertrain',
    'MOTORD_BASE_01_body1_1':'powertrain','MOTORD_MAGNETS_01_body1_2':'powertrain',
    'PROPELLER_SCREW_body1_5':'powertrain','Arm_Cover_1':'powertrain','Arm_Cover_2':'powertrain',
    'IMU_HD_0505_ASM':'shell','IMU_SAB_body1_1':'shell','WM169_TOF_GLASS_body1':'shell',
    'WA520_FISH_EVA':'shell','WA520_MINI_FISH8004_CAP_1':'shell',
    'COOLING_V2':'shell','POWER_COOLING_V2':'shell','Port_Cover':'shell',
    'TopCover':'shell','TopCover_light':'shell','TopCover_screws':'shell',
    'Wing_Bracket':'shell','QX003619_0400_1':'shell','空白':'shell','挤压':'shell','挤压_1':'shell',
    'glass1':'shell','glass3':'shell','glass_2':'shell','glass2.001':'shell','glass2_1':'shell',
    'AC203_JP_SY_001':'shell','Circle':'shell','Circle_001':'shell','Circle_002':'shell',
    'Circle_003':'shell','Circle_004':'shell','Circle_005':'shell','Circle_006':'shell',
    'Circle_007':'shell','Cube':'shell','Body':'shell','Body_Screws':'shell',
    'MIDDLE_FRAME_body':'shell','Shell3':'shell','shell_2':'shell'
  },
  unmappedTo: 'shell',
  realPartIds: ['shell','gimbal','battery','powertrain'],
  assembledPos: {
    'shell': [0,0,0], 'gimbal': [0,0,0], 'battery': [0,0.9,0], 'powertrain': [0,0,0]
  },
  labelOffsets: {
    'shell': [0,1.8,0], 'gimbal': [0,1.1,0], 'battery': [0,1.0,0], 'powertrain': [0,1.4,0]
  },
  builders,
  parts: [
    { id:'shell', zh:'机身与护罩', en:'UNIBODY & PROP GUARD',
      offset:[0,0,0], tag:'一体化护罩 · 鱼眼视窗',
      desc:'一体化中框集成桨叶保护罩与全向视觉视窗，内置散热风道与 ToF/鱼眼传感；顶部舱盖可开合更换电池。',
      specs:[['结构','一体式保护罩'],['传感','ToF + 鱼眼 ×2'],['散热','双风道'],['重量','约 377 g']] },
    { id:'gimbal', zh:'云台相机', en:'GIMBAL CAMERA',
      offset:[0,-0.5,2.0], tag:'1/1.3″ · 155° FPV',
      desc:'单轴俯仰增稳云台搭载 1/1.3 英寸传感器，155° 超广角 FPV 视野，支持 4K/100fps 超广角 HDR 与竖拍。',
      specs:[['传感器','1/1.3″ CMOS'],['视场','155°'],['视频','4K/100fps HDR'],['增稳','单轴俯仰 + RockSteady']] },
    { id:'battery', zh:'飞行电池', en:'FLIGHT BATTERY',
      offset:[0,2.2,0.2], tag:'2150 mAh · 23 分钟',
      desc:'顶部插入式 2150 mAh 智能电池，按键电量自检，为沉浸式飞行提供约 23 分钟续航。',
      specs:[['容量','2150 mAh'],['续航','约 23 分钟'],['安装','顶部插入式'],['供电','双电芯']] },
    { id:'powertrain', zh:'动力系统', en:'PROPULSION SYSTEM',
      offset:[0,1.6,-1.6], tag:'四电机 · 保护罩内桨叶',
      desc:'四组无刷电机藏于保护罩内，桨叶采用 CCW/CW 成对设计并螺接固定，兼顾穿越机的爆发力与安全性。',
      specs:[['电机','四组无刷'],['桨叶','CCW/CW 成对'],['防护','全包络保护罩'],['速度','最高 12 m/s']] },
  ],
  postLoad,
  tick: null
};
