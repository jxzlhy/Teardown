/* =============================================================
   设备配置：无人机内部剖面（四旋翼教学件）
   社区 GLB（Sketchfab）：仅 1 个网格 Drone01（30287 tris + 剖面绘画纹理）
   bbox 0.13×0.06×0.16 m —— 单网格全部进 shell；
   内部以程序化构件补示意：电池（下层）+ 飞控主板（上层）+ 前视相机（机头），
   postLoad anchorParts 锚定 shell 部件包围盒内偏移
============================================================= */
import { makeDevice, anchorParts, composePostLoad } from './_kit/factory.js';
import { battery, mainboard, cameraModule } from './_kit/internals.js';

const builders = {
  battery: (g)=>{
    battery(g, { w:5.2, h:2.0, d:1.0, label:'LI-PO', capacity:'3000 mAh', model:'DRN-3S1P', rating:'11.1V' });
    g.rotation.x = -Math.PI/2;      /* 平放：板面朝上，厚度沿 Y */
  },
  board: (g)=>{
    mainboard(g, { w:4.4, h:3.0, soc:[-1.0,.4], ram:[1.0,.5], label:'FLIGHT CONTROLLER', sub:'FC · 4-IN-1 ESC · GPS', pcb:'#12325a', smalls:14 });
    g.rotation.x = -Math.PI/2;      /* 平放：元件面朝上 */
  },
  camera: (g)=> cameraModule(g, .8, .9),   /* 镜头沿 +z（机头朝观众） */
};

export default makeDevice({
  id: 'inside-drone',
  name: '无人机内部剖面',
  en: 'QUADCOPTER CUTAWAY',
  category: '无人机',
  brand: 'GENERIC',
  tagline: '剖面透视 · 电池-飞控-相机三层布局',
  description: '四旋翼无人机剖面教学件：资产为单网格剖面模型，内部布局以绘制纹理呈现——电池在下、飞控居中、相机在机头。本配置另以程序化构件重建这三层内部示意（锚定于壳体包围盒内），拆解后可与剖面纹理对照。四旋翼典型动力链路为：LiPo 电池 → 电源分配 → 飞控 → 四合一电调 → 四角无刷电机，前视相机经排线回传图像。',
  specs: [
    ['机型','四旋翼 · 剖面教学件'],['布局','电池下 · 飞控中 · 相机前'],
    ['电池','LiPo 3S/4S（示意）'],['动力','无刷电机 ×4 · 四合一 ESC'],
    ['传感','IMU · 气压计 · GPS'],['资产','单网格 + 绘制纹理'],
  ],
  accent: '#45c8ff',
  source: 'Sketchfab 社区模型',
  modelCredit: 'Inside Drone by freakering (Sketchfab, CC-BY 4.0)',
  modelSource: 'https://sketchfab.com/3d-models/inside-drone-d38af0afb72343f69eed6da6457df11b',
  targetWidth: 10,
  glb: '/assets/inside-drone.glb',
  normalize: 'full',
  frontAxis: '+z',                    /* 单网格资产探测无效，以 +z 为机头假设 */
  orientationProbe: ['camera', 'board'],
  realPartIds: ['shell'],
  builders,
  parts: [
    { id:'shell', zh:'剖面壳体', en:'CUTAWAY SHELL', real:true,
      ex:[0,.2,.6], lo:[0,1.2,0], tag:'单网格剖面 · 绘制纹理内部',
      desc:'单一网格剖面模型：外部为四旋翼无人机壳体剖面，四臂伸向机身四角的电机座；内部结构以绘制纹理呈现，本页程序化构件（电池/主板/相机）为示意重建，分层锚定于壳体包围盒内。',
      specs:[['资产','单网格 Drone01'],['内部','绘制纹理呈现'],['重建','程序化示意件']] },
    { id:'battery', zh:'动力电池', en:'LI-PO BATTERY',
      ex:[0,-1.8,.4], lo:[0,1.0,0], tag:'LiPo 3S/4S · 下层重心位',
      desc:'锂聚合物动力电池贴装机身下层重心处：3S/4S 电芯组经电源分配向四路电调供电，低重心布局提升飞行稳定性；充电口与平衡头引出机尾。',
      specs:[['类型','LiPo 3S/4S'],['位置','机身下层'],['供电','四路电调']] },
    { id:'board', zh:'飞控主板', en:'FLIGHT CONTROLLER',
      ex:[0,2.2,-.4], lo:[0,.9,0], tag:'MCU+IMU · 四合一 ESC',
      desc:'飞控主板居中上层：主控 MCU 与 IMU/气压计融合解算姿态，下接四合一电调（ESC）驱动四角无刷电机，GPS、接收机与图传经排线接入；是全机信号与动力的中枢。',
      specs:[['构成','MCU · IMU · 气压计'],['扩展','四合一 ESC'],['接入','GPS · 图传 · 接收机']] },
    { id:'camera', zh:'前视相机', en:'FRONT CAMERA',
      ex:[0,.4,2.6], lo:[0,.9,0], tag:'机头模组 · FPC 回传',
      desc:'机头前视相机模组（航拍/FPV 用）：镜头朝机头方向，传感器经柔性排线与主板相连，图传链路把画面实时回传地面。',
      specs:[['形式','前视模组'],['连接','FPC 排线'],['回传','图传链路']] },
  ],
  postLoad: composePostLoad(
    anchorParts({
      battery: { ref:'shell', dy:-1.2, dz:.6 },   /* 电池：下层层 */
      board:   { ref:'shell', dy:1.5, dz:-.8 },   /* 飞控：上层层 */
      camera:  { ref:'shell', dy:.7, dz:3.6 },    /* 相机：机头端 */
    }),
  ),
  tick: null,
});
