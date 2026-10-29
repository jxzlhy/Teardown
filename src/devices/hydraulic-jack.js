/* =============================================================
   设备配置：卧式液压千斤顶（教学模型）
   社区 GLB（Sketchfab）：96 网格匿名 Object_N + 无语义材质，205k tris
   bbox 0.26×0.27×0.13 m（Y 上）—— Object_22/46/53 三大件居中
   （底座 / 顶升臂 / 液压缸体），其余小件围绕
   按 rel.y 分层 + 侧向手柄 + 尺寸阈值兜底聚类；帕斯卡原理教学视角
============================================================= */
import { makeDevice } from './_kit/factory.js';

export default makeDevice({
  id: 'hydraulic-jack',
  name: '卧式液压千斤顶',
  en: 'HYDRAULIC FLOOR JACK',
  category: '机械',
  brand: 'GENERIC',
  tagline: '帕斯卡定律 · 小活塞顶起大载荷',
  description: '卧式液压千斤顶是帕斯卡定律的典型应用：手柄驱动小直径柱塞泵对封闭液压油加压，压强经油路均布到大直径顶升缸，顶升力按活塞面积比放大——小力即可托起整车。单向阀锁住高压腔逐行程泵油，旋开释放阀让液压油回流储油腔，载荷受控下降。本页为社区教学模型（米制比例），按典型卧式千斤顶结构分区拆解：鞍座、顶升臂、液压缸、底座、手柄与阀组。',
  specs: [
    ['原理','帕斯卡定律 P = F/A'],['放大','F₂ = F₁ × A₂/A₁'],
    ['类型','卧式 · 手动往复泵'],['承载','常见 2T 级（教学泛化）'],
    ['回路','柱塞泵 + 单向阀 + 释放阀'],['控制','释放阀受控下降'],
    ['比例','教学模型 · 非真机参数'],
  ],
  accent: '#e0a832',
  source: 'Sketchfab 社区模型',
  modelCredit: 'Hydraulic Jack by tflexcad (Sketchfab, CC-BY-NC 4.0)',
  modelSource: 'https://sketchfab.com/3d-models/hydraulic-jack-35617bca4a064a7296858470e5c27102',
  targetWidth: 7,
  glb: '/assets/hydraulic-jack.glb',
  normalize: 'full',
  unmappedTo: 'base',
  mapByPosition(name, p, rel, ext){
    if(Math.abs(rel.x - 0.5) > 0.4) return 'handle';   /* 侧向伸出的手柄杆 */
    const m = Math.max(ext.x, ext.y, ext.z);
    if(m < 0.018) return 'valves';                     /* 米制资产：毫米级阀件/油塞 */
    if(rel.y > 0.75) return 'saddle';                  /* 顶部承重鞍座 */
    if(rel.y > 0.45) return 'lift-arm';                /* 顶升臂连杆层 */
    if(rel.y > 0.25) return 'hydraulic-ram';           /* 液压缸/柱塞泵层 */
    if(m < 0.05) return 'valves';                      /* 底部小件（油塞/螺堵） */
    return 'base';
  },
  realPartIds: ['saddle','lift-arm','hydraulic-ram','base','handle','valves'],
  parts: [
    { id:'saddle', zh:'承重鞍座', en:'SADDLE', real:true,
      ex:[0,2.6,0], lo:[0,1.0,0], tag:'顶部承重面 · 防滑纹',
      desc:'顶部鞍座是力的输出端面：直接托住车辆底边等载荷，接触面带防滑纹路防止滑移；它与顶升臂末端铰接，随臂的弧线运动升降。',
      specs:[['位置','顶升臂末端'],['表面','防滑纹路'],['功能','直接承力面']] },
    { id:'lift-arm', zh:'顶升臂', en:'LIFT ARM', real:true,
      ex:[.8,1.4,0], lo:[0,.9,0], tag:'铰接连杆 · 行程放大',
      desc:'铰接摆臂组把液压缸的短行程直线顶升转换为鞍座的大幅弧线抬升，是千斤顶的运动放大环节；连杆与机架销轴铰接，几何布局决定升程曲线。',
      specs:[['形式','铰接连杆组'],['功能','行程放大'],['铰点','销轴连接']] },
    { id:'hydraulic-ram', zh:'液压缸（泵组）', en:'HYDRAULIC RAM', real:true,
      ex:[-.9,.5,.6], lo:[0,.9,0], tag:'帕斯卡放大 · 大活塞顶升',
      desc:'大直径顶升缸是力的放大输出端：柱塞泵小活塞加压的液压油经油路进入缸体，压强按帕斯卡定律均布，顶升力随大/小活塞面积比放大（F₂ = F₁ × A₂/A₁）——代价是小活塞需走更长的泵油行程。',
      specs:[['原理','帕斯卡定律'],['构成','缸体 · 柱塞 · 油路'],['放大','面积比 A₂/A₁'],['代价','小活塞长行程']] },
    { id:'base', zh:'底座（储油腔）', en:'BASE / OIL RESERVOIR', real:true,
      ex:[0,-1.6,0], lo:[0,.9,0], tag:'一体铸造 · 兼作油箱',
      desc:'一体铸造底座兼作液压油储油腔：容纳回油与泵体吸油口，底面以最大接触面积把满载载荷传给地面，是整机的承力与供油基础。',
      specs:[['集成','储油腔'],['功能','承力基座 · 供油'],['稳定性','大接触面积']] },
    { id:'handle', zh:'手柄', en:'HANDLE', real:true,
      ex:[1.8,-.2,0], lo:[0,.8,0], tag:'往复摆动 · 驱动柱塞泵',
      desc:'往复压动手柄驱动柱塞泵逐行程泵油：上行程吸入液压油、下行程把油压入高压腔，单向阀保证每行程只进不出，压强逐行程累积。',
      specs:[['操作','往复摆动'],['联动','柱塞泵'],['保压','单向阀逐行程锁油']] },
    { id:'valves', zh:'阀组', en:'VALVE GROUP', real:true,
      ex:[-1.7,-.7,-.4], lo:[0,.8,0], tag:'单向阀 + 释放阀',
      desc:'进油/出油单向阀与释放阀是液压回路的心脏：泵油时单向阀锁住高压腔防回流，旋开释放阀则液压油经旁路回流储油腔——载荷以受控速率缓缓下降。',
      specs:[['单向阀','保压锁油'],['释放阀','受控下降'],['回路','泵-缸-油箱']] },
  ],
  tick: null,
});
