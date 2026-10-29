/* =============================================================
   设备配置：毅力号火星车（Mars 2020 Perseverance，NASA/JPL）
   官方级社区 GLB（Sketchfab）：68 网格全语义命名，250k tris，23 段动画（引擎忽略）
   bbox 2.70×1.85×3.11 —— 车头 hazcams_front 位于 +z
   网格名直接对应真机载荷（Mastcam-Z/PIXL/RIMFAX/WATSON/钻头/MMRTG），
   用 mappingPrefix 批量归组（具体前缀在前，startsWith 首中即停）
============================================================= */
import { makeDevice } from './_kit/factory.js';

export default makeDevice({
  id: 'perseverance-rover',
  name: '毅力号火星车',
  en: 'MARS 2020 PERSEVERANCE',
  category: '航天',
  brand: 'NASA/JPL',
  tagline: '耶泽罗陨石坑 · 1025kg 核动力探测车',
  description: '毅力号（Mars 2020）是 NASA/JPL 的火星车：2021 年 2 月 18 日着陆耶泽罗陨石坑古湖泊三角洲，整车 1025kg，携 7 台科学仪器（共 59kg）寻找远古生命痕迹，钻取样本封入 43 支样本管等待未来返回地球，机身腹部还搭载直升机同伴 Ingenuity。模型为官方级社区资产（68 网格全语义命名），PIXL/WATSON/RIMFAX/Mastcam-Z/取芯钻/MMRTG 等网格与真机载荷一一对应，逐件可点读。',
  specs: [
    ['着陆','2021-02-18 · 耶泽罗陨石坑'],['质量','1025 kg'],
    ['电源','MMRTG 约 110 W'],['载荷','7 台仪器 · 59 kg'],
    ['样本','43 支密封样本管'],['相机','23 颗'],
    ['机械臂','2.1 m · 转塔 45 kg'],['同伴','Ingenuity 直升机'],
  ],
  accent: '#d9a05b',
  source: '官方公开模型（NASA 3D Resources · 公有领域）',
  modelCredit: 'Mars 2020 Perseverance Rover by NASA/JPL (NASA 3D Resources, 公有领域)',
  modelSource: 'https://science.nasa.gov/3d-resources/mars-2020-perseverance-rover',
  targetWidth: 12.5,
  camDist: 1.1,
  glb: '/assets/perseverance-rover.glb',
  normalize: 'full',
  frontAxis: '+z',           /* 车头 hazcams_front 在原生 +z */
  unmappedTo: 'shell',
  /* 实测引擎侧网格名是 CAD 编号（Cube008 / 10453412-101_B_…），
     正则名匹配 + rel 位置兜底双层分流 */
  mapByPosition(name, p, rel, ext){
    if(/HAZCAM/i.test(name)) return 'hazcams';
    if(/WHEEL/i.test(name)) return 'wheels';
    if(/SUSP|ROCKER|BOGIE/i.test(name)) return 'suspension';
    if(/RTG|MMRTG/i.test(name)) return 'rtg';
    if(/ANT|UHF|HGA|X.BAND/i.test(name)) return 'antennas';
    if(/CORING|DRILL|BIT.CAROUSEL/i.test(name)) return 'drill';
    if(/RIMFAX/i.test(name)) return 'body';
    if(/PIXL|WATSON|TURRET|SDC|ABLR/i.test(name)) return 'turret';
    if(/MASTCAM|NAVCAM|SUPER|MICRO/i.test(name)) return 'mast-head';
    if(/ARM/i.test(name)) return 'arm';
    if(/CALIB/i.test(name)) return 'calibration-target';
    /* 位置兜底（匿名件）：低层大网格=轮组/悬架、前下转塔、顶前桅杆、后上 RTG */
    if(rel.y < 0.42 && Math.max(ext.x, ext.y, ext.z) > 1.8) return 'wheels';
    if(rel.y < 0.55 && rel.z > 0.6 && rel.x > 0.4) return 'turret';
    if(rel.y < 0.55) return 'suspension';
    if(rel.z > 0.7 && rel.y > 0.55) return 'mast-head';
    if(rel.z < 0.3 && rel.y > 0.55) return 'rtg';
    if(rel.z > 0.35 && rel.y > 0.5) return 'arm';
    return 'body';
  },
  realPartIds: ['body','wheels','suspension','arm','turret','drill','mast-head','hazcams','antennas','rtg','calibration-target','shell'],
  parts: [
    { id:'body', zh:'车体', en:'ROVER BODY', real:true,
      ex:[0,.4,.2], lo:[0,1.5,0], tag:'保温箱体 · 计算机/电源舱',
      desc:'保温箱式车体容纳火星车计算机、电源分配与 UHF/X 波段通信电子，顶部甲板布置桅杆基座、天线与标定靶；RIMFAX 探地雷达的电子舱也藏于车体之内。',
      specs:[['质量','整车 1025 kg'],['内部','计算机 · 电源 · 通信'],['车载雷达','RIMFAX 电子舱']] },
    { id:'wheels', zh:'车轮 ×6', en:'WHEELS ×6', real:true,
      ex:[0,-2.4,.4], lo:[0,1.0,0], tag:'钛辐条 · 每轮独立驱动',
      desc:'六只钛辐条车轮独立驱动，四角轮可独立转向；胎面带抓地横条，应对耶泽罗陨石坑的沙地、砾石与岩层地形（模型中 6 轮一体网格、23616 三角面）。',
      specs:[['布局','6 轮 · 摇臂悬架'],['驱动','每轮独立电机'],['转向','四角独立转向'],['材质','钛辐条']] },
    { id:'suspension', zh:'摇臂悬架', en:'ROCKER-BOGIE SUSPENSION', real:true,
      ex:[0,-1.2,-1.0], lo:[0,1.0,0], tag:'被动无弹簧 · 六轮贴地',
      desc:'摇臂-转向架（rocker-bogie）悬架为无弹簧被动设计：摇臂与转向架两级铰接让六轮始终贴合地形，翻越轮径级障碍时车身姿态保持平稳。',
      specs:[['形式','摇臂-转向架'],['特性','被动 · 无弹簧'],['通过性','轮径级障碍']] },
    { id:'arm', zh:'机械臂', en:'ROBOTIC ARM', real:true,
      ex:[0,2.0,1.8], lo:[0,1.1,0], tag:'2.1 m · 5 自由度',
      desc:'2.1m 长五自由度机械臂，肩部方位/俯仰、肘部与腕部关节串联展开，末端转塔载荷约 45kg，能把科学仪器精确抵近岩面作业；臂上可见走线束与关节铰接件。',
      specs:[['长度','2.1 m'],['自由度','5'],['转塔载荷','约 45 kg']] },
    { id:'turret', zh:'仪器转塔', en:'ARM TURRET', real:true,
      ex:[1.7,.5,3.0], lo:[0,1.0,0], tag:'PIXL + WATSON + 上/下视相机',
      desc:'机械臂末端转塔集成两台主力就位仪器：PIXL 以 X 射线荧光解析岩石元素成分，WATSON 显微相机拍摄纹理特写；转塔另带下视/上视相机辅助对位与接近成像。',
      specs:[['PIXL','X 射线荧光元素分析'],['WATSON','显微成像相机'],['辅助','Down/Up Look 相机']] },
    { id:'drill', zh:'取芯钻', en:'CORING DRILL', real:true,
      ex:[-1.6,-.5,3.1], lo:[0,.9,0], tag:'岩芯钻取 · 43 支样本管',
      desc:'转塔上的取芯钻（corring drill）以旋转冲击方式钻取铅笔粗细的岩芯，封入 43 支密封样本管之一——2022 年起部分样本管已投放地表，构成未来火星样本返回任务的备用 Depot。',
      specs:[['方式','旋转-冲击钻取'],['样本','43 支密封管'],['去向','火星样本返回任务']] },
    { id:'mast-head', zh:'桅杆头部', en:'MAST HEAD', real:true,
      ex:[0,3.2,.6], lo:[0,.9,0], tag:'Mastcam-Z 双目变焦 + SuperCam',
      desc:'桅杆顶端是火星车的“头”：Mastcam-Z 双目变焦相机（4:1 变焦、400-1000nm 多光谱）与 NavCams 导航相机组，SuperCam 激光诱导击穿光谱仪同位于头部，可远距离轰击岩石分析成分；麦克风同步收录火星环境声。',
      specs:[['Mastcam-Z','双目 4:1 变焦'],['SuperCam','激光诱导击穿光谱'],['导航','NavCams 立体对'],['音频','机身麦克风']] },
    { id:'hazcams', zh:'避障相机', en:'HAZCAMS', real:true,
      ex:[0,-.4,2.8], lo:[0,.8,0], tag:'前/后广角立体对',
      desc:'车体前后各一组黑白广角避障相机（hazcams），以立体对为自主行驶提供近场地形图；模型含前后组与其保护盖、走线，前组位于车头（+z 端，作朝向基准）。',
      specs:[['位置','前/后各一组'],['用途','自主避障行驶'],['形式','广角立体对']] },
    { id:'antennas', zh:'天线组', en:'ANTENNAS', real:true,
      ex:[-2.2,2.3,-.6], lo:[0,.9,0], tag:'UHF 中继 + 高增益对地',
      desc:'UHF 天线经火星轨道器中继返送绝大部分数据，高增益天线支持对地直接 X 波段链路，低增益天线作应急备份——三条链路保证科学数据不中断回传地球。',
      specs:[['UHF','轨道器中继'],['高增益','对地直接链路'],['备份','低增益天线']] },
    { id:'rtg', zh:'核电源 MMRTG', en:'MMRTG POWER', real:true,
      ex:[0,1.5,-2.7], lo:[0,1.0,0], tag:'钚-238 温差发电 · 约 110W',
      desc:'尾部多任务放射性同位素温差发电机（MMRTG）利用钚-238 衰变热持续输出约 110W，昼夜与沙尘暴中不断电，配两块锂离子电池缓冲峰值功耗；位于车尾便于排散废热。',
      specs:[['功率','约 110 W'],['热源','钚-238 衰变热'],['缓冲','锂电池 ×2'],['寿命','设计 14 年+']] },
    { id:'calibration-target', zh:'标定靶', en:'CALIBRATION TARGETS', real:true,
      ex:[2.4,1.3,-.2], lo:[0,.8,0], tag:'甲板校准靶片组',
      desc:'甲板上的标定靶板组供 Mastcam-Z/SuperCam 等仪器在轨校准光谱与色彩基准，支架把靶片固定在尘土不易堆积的方位，让“在火星上比色”成为可能。',
      specs:[['用途','仪器在轨校准'],['服务','Mastcam-Z · SuperCam 等'],['安装','甲板支架']] },
    { id:'shell', zh:'甲板杂件', en:'DECK MISC', real:true,
      ex:[0,.3,-.5], lo:[0,1.3,0], tag:'铭牌 · 盖板 · 附件兜底',
      desc:'甲板盖板、附件与未细分网格的兜底组：铭牌（Name_Chips）携带千万公众名字的硅芯片随车抵达火星，各类盖板与端盖小件也归于此处。',
      specs:[['铭牌','千万名字硅芯片'],['构成','盖板 · 甲板附件'],['归组','未细分网格兜底']] },
  ],
  tick: null,
});
