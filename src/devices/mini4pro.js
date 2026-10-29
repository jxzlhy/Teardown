/* =============================================================
   设备配置：DJI Mini 4 Pro（WM240）· 249g 轻量航拍机
   官方 GLB（Draco 压缩），207 网格匿名命名 → 按世界坐标聚类映射
   （资产沿 X 轴平铺：云台在 -Z 前向（球体/圆盘），机体 ±4，
     前臂 +5..9，后臂 -5..-12，外侧 ±13..19 为折叠桨/臂端）
============================================================= */
import * as THREE from 'three';
import { box, addMesh, matSilver, matGold } from '../engine/materials.js';

const builders = {
  battery(g){
    addMesh(g, box(2.6,1.1,3.4,0.2), new THREE.MeshPhysicalMaterial({ color:0x24262b, metalness:0.55, roughness:0.5, clearcoat:0.3 }));
    for(let i=0;i<3;i++) addMesh(g, box(0.2,0.14,0.1,0.02), matGold(), -0.6+i*0.6, 0.56, 1.2);
  }
};

function postLoad({ partsById }){
  const body = partsById['body'];
  if(body){
    const bb = new THREE.Box3().setFromObject(body.group);
    const c = bb.getCenter(new THREE.Vector3());
    partsById['battery'].base.set(c.x, c.y + 0.1, c.z + 0.2);
  }
}

export default {
  id: 'mini4pro',
  brand: 'DJI',
  name: 'DJI Mini 4 Pro',
  en: 'WM240',
  category: '无人机',
  tagline: '249g 免登记全能mini航拍机',
  description: 'DJI Mini 4 Pro：249g 起飞重量免登记，具备全向避障与 O4 图传，支持全向激光雷达避障与 4K/60fps HDR 视频，续航 34 分钟。官方实机模型（207 网格，Draco 压缩）。',
  specs: [
    ['重量','< 249 g'],['影像','1/1.3″ · 4K/60fps HDR'],
    ['避障','全向 + 激光雷达'],['续航','34 分钟'],
    ['图传','O4 · 20 km'],['视频','10-bit D-Log M'],
    ['最大速度','16 m/s'],['抗风','10.7 m/s'],
  ],
  accent: '#c792ea',
  targetWidth: 12,
  normalize: 'full',         // 资产为沿 X 平铺布局，按整体包围盒归一化
  glb: '/assets/mini4pro.glb',
  draco: true,
  frontAxis: '-z',           // 云台球体聚类在 -Z（机头朝 -Z）
  orientationProbe: null,
  mapByPosition(name, p){
    if(p.z < -4 && Math.abs(p.x) < 4) return 'gimbal';              // 云台（-Z 前向）
    if(p.x > 12 || p.x < -12.5) return 'propellers';                // 折叠桨 / 臂端
    if(p.x >= 4) return 'arms-front';                               // 前机臂
    if(p.x <= -4.5) return 'arms-rear';                             // 后机臂
    return 'body';                                                  // 机身中段
  },
  unmappedTo: 'body',
  realPartIds: ['body','gimbal','arms-front','arms-rear','propellers'],
  assembledPos: {
    'body': [0,0,0], 'gimbal': [0,0,0], 'arms-front': [0,0,0],
    'arms-rear': [0,0,0], 'propellers': [0,0,0], 'battery': [0,0,0]
  },
  labelOffsets: {
    'body': [0,1.6,0], 'gimbal': [0,1.0,0], 'arms-front': [0,1.2,0],
    'arms-rear': [0,1.2,0], 'propellers': [0,1.5,0], 'battery': [0,0.9,0]
  },
  builders,
  parts: [
    { id:'body', zh:'机身', en:'AIRFRAME',
      offset:[0,0,0], tag:'249g · 免登记',
      desc:'249g 起飞重量的轻量化机身，免实名登记即可飞行；上下壳体容纳飞控、散热与电池仓，尾部集成散热格栅。',
      specs:[['重量','< 249 g'],['续航','34 分钟'],['定位','GPS+GLONASS+Galileo'],['灯组','尾部 LED']] },
    { id:'gimbal', zh:'云台相机', en:'GIMBAL CAMERA',
      offset:[0,-0.4,2.4], tag:'1/1.3″ · 全向避障',
      desc:'单轴云台搭载 1/1.3 英寸传感器，f/1.7 光圈，支持 4K/60fps HDR 与全像素双核对焦；配合全向双目实现避障。',
      specs:[['传感器','1/1.3″ CMOS'],['光圈','f/1.7'],['视频','4K/60fps HDR'],['增稳','单轴 + RockSteady']] },
    { id:'arms-front', zh:'前机臂', en:'FRONT ARMS',
      offset:[1.3,1.3,0.3], tag:'前臂电机组',
      desc:'两条前机臂折叠向机头方向收拢，内置前电机与电调，臂端集成前避障双目视觉。',
      specs:[['电机','前臂 ×2'],['折叠','向机头收拢'],['传感','前视双目'],['LED','前臂灯']] },
    { id:'arms-rear', zh:'后机臂', en:'REAR ARMS',
      offset:[-1.3,1.3,0.3], tag:'后臂电机组',
      desc:'两条后机臂折叠向机尾方向收拢，内置后电机，臂端集成后视避障与散热结构。',
      specs:[['电机','后臂 ×2'],['折叠','向机尾收拢'],['传感','后视双目'],['散热','臂端风道']] },
    { id:'propellers', zh:'螺旋桨', en:'PROPELLERS',
      offset:[0,1.8,0], tag:'低噪快拆桨',
      desc:'低噪声快拆螺旋桨，正反桨成对设计；折叠后贴合机臂，展开后提供高效升力与 10.7 m/s 抗风能力。',
      specs:[['数量','4 片（成对）'],['类型','快拆低噪桨'],['抗风','10.7 m/s'],['降噪','气动优化']] },
    { id:'battery', zh:'智能飞行电池', en:'INTELLIGENT BATTERY',
      offset:[0,-1.2,0.6], tag:'2453 mAh · 34 分钟',
      desc:'2453 mAh 智能电池提供 34 分钟续航，支持电量自检与双电池快充方案。',
      specs:[['容量','2453 mAh'],['续航','34 分钟'],['充电','双电池快充'],['自检','按键电量显示']] },
  ],
  postLoad,
  tick: null
};
