/* =============================================================
   设备配置：Lamborghini Countach LPI 800-4（2021 限量）
   社区模型（Sketchfab）：41 匿名网格，Z 车长（z 4.68 车头实测）
   四轮+刹车盘 bbox 中心 x 相对车心 ±2.0、z ±2.9 → 位置聚类
============================================================= */
import { makeDevice } from './_kit/factory.js';

export default makeDevice({
  id: 'countach-lpi800-4',
  name: 'Lamborghini Countach LPI 800-4',
  en: 'COUNTACH LPI 800-4',
  category: '汽车',
  brand: 'LAMBORGHINI',
  tagline: 'V12 混动 · 致敬 1971 · 限量 112 台',
  description: 'Countach LPI 800-4（2021）：致敬 1971 年原版 Countach LP500 的限量复刻——50 年后重新投产这个让「兰博基尼」四个字刻进一代人海报记忆的车名。6.5L V12 自然吸气 + 48V 轻混，819 PS，剪刀门当然还在。社区模型（Sketchfab）。',
  specs: [
    ['动力','6.5L V12 NA + 48V 轻混'],['综合功率','819 PS'],
    ['零百','2.8 s'],['极速','355 km/h'],
    ['限量','112 台（复刻 LP500 之意）'],['车名','Countach = 皮埃蒙特语惊叹词'],
    ['变速箱','7 速 ISR'],['驱动','四驱（800-4 即 800PS-4WD）'],
  ],
  accent: '#ffd166',
  source: '社区模型（Sketchfab）',
  modelCredit: '2021 Lamborghini Countach LPI 800-4 by fa001569 (Sketchfab, CC-BY 4.0)',
  modelSource: 'https://sketchfab.com/3d-models/2021-lamborghini-countach-lpi-800-4-9c94c70abb2641c6ab7caf5efdfb9607',
  targetWidth: 14,
  camDist: 1.2,
  normalize: 'full',
  glb: '/assets/countach-lpi800-4.glb',
  tour: ['body','front-hood','engine-bay','cockpit','wheels-front','wheels-rear'],
  xrayShellIds: ['body'],
  mapByPosition(name, p, rel, ext){
    /* 车心 x≈-2.1：|p.x+2.1|>1.3 为两侧轮位；z 正负分前后轴 */
    if(Math.abs(p.x + 2.1) > 1.3 && p.y < 0.2) return p.z > 0 ? 'wheels-front' : 'wheels-rear';
    if(p.z > 3.2) return 'front-hood';
    if(p.z < -2.5) return 'engine-bay';
    if(p.y > 0.55 && Math.abs(p.z + 0.5) < 2.5) return 'cockpit';
    return 'body';
  },
  realPartIds: ['body','cockpit','wheels-front','wheels-rear','engine-bay','front-hood'],
  parts: [
    { id:'body', zh:'楔形车身', en:'WEDGE BODY', real:true,
      ex:[0,.4,2.4], lo:[0,1.4,0], tag:'一刀切楔形 · 剪刀门',
      desc:'Countach 的楔形轮廓是汽车设计史的分水岭：低到贴地的车头、一刀切的腰线、NACA 进气道——1971 年 Marcello Gandini 画下这条线时，全世界的超跑设计都被改写了。剪刀门上翻的瞬间就是这台车的全部意义。',
      specs:[['设计','Gandini 楔形'],['车门','剪刀门'],['细节','NACA 侧进气道']] },
    { id:'cockpit', zh:'座舱', en:'COCKPIT', real:true,
      ex:[0,.8,1.2], lo:[0,1.2,0], tag:'单雨刷 · 战斗机视角',
      desc:'座舱：视野极差的「坦克狭缝」式后视窗是 Countach 的著名槽点——为了楔形轮廓牺牲一切；内饰是 80 年代意大利式的直线狂欢。',
      specs:[['后视野','狭缝式（著名槽点）'],['风格','直线化战斗舱']] },
    { id:'wheels-front', zh:'前轮组', en:'FRONT AXLE', real:true,
      ex:[0,-.8,2.0], lo:[0,1.2,0], tag:'255/35 ZR19',
      desc:'前轴轮组：Countach 标志性的大直径电话拨号盘式轮毂（Teledial），前轮 255 宽胎——在 1971 年这个宽度是异端。',
      specs:[['规格','255/35 ZR19'],['轮毂','Teledial 拨号盘']] },
    { id:'wheels-rear', zh:'后轮组', en:'REAR AXLE', real:true,
      ex:[0,-.8,-2.0], lo:[0,1.2,0], tag:'335/30 ZR20 · 承接 V12',
      desc:'后轴轮组：335 宽胎把 819 PS 钉在地面上——Countach 原型当年后轮只有 255，50 年间的动力膨胀全写在这条胎上。',
      specs:[['规格','335/30 ZR20'],['制动','碳陶瓷大盘']] },
    { id:'engine-bay', zh:'V12 发动机舱', en:'V12 ENGINE BAY', real:true,
      ex:[0,.6,-2.6], lo:[0,1.3,0], tag:'6.5L NA V12 + 48V',
      desc:'后置 V12 发动机舱：6.5L 自然吸气 V12（780 PS）叠加 48V 轻混电机凑成 819 PS——LPI 即 Longitudinale Posteriore Ibride（纵置后混）。透过尾舱玻璃看进去，V12 永远是兰博基尼的图腾。',
      specs:[['排量','6.5L V12 自然吸气'],['轻混','48V 34 PS'],['声浪','9000 rpm 限定']] },
    { id:'front-hood', zh:'前舱盖', en:'FRONT HOOD', real:true,
      ex:[0,.3,3.0], lo:[0,1.2,0], tag:'行李舱 · 前散热',
      desc:'前舱盖之下是行李舱与前散热器——中置 V12 布局让车头只剩收纳功能，低矮的鼻锥是楔形设计的起点。',
      specs:[['功能','行李舱 + 散热'],['造型','鼻锥起点']] },
  ],
});
