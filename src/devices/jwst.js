/* =============================================================
   设备配置：詹姆斯·韦伯空间望远镜（NASA 工程模型数字化 · CC0）
   来源：Smithsonian 开放获取（免 key S3 bucket，样本 si-research/jwst.glb）
   1600 网格 / 46 材质 / 无贴图（PBR 纯色：MLI 毯金银黑 + 金镜面 + 碳纤维）
   网格名带 521 部件族前缀（mirror/aftsd/mboom/iec/harness…）
   → mapByPosition 名字规则路由 + 兜底背板
   bbox 27.4×12×14.8（主镜环 Y-Z 平面 · 遮阳板 -X 展开 · 米字撑 ±7）
   结构：主镜 18 分段 → 背板环 → 仪器塔/电子舱 → 遮阳板五层结构 → 总线+太阳翼
============================================================= */
import { makeDevice } from './_kit/factory.js';

export default makeDevice({
  id: 'jwst',
  era: 2021,
  name: '詹姆斯·韦伯空间望远镜',
  en: 'JWST',
  category: '航天',
  brand: 'NASA/ESA/CSA',
  tagline: '6.5 米金镜 · 折叠后塞进火箭头顶',
  description: '詹姆斯·韦伯空间望远镜（JWST）：人类最大的空间望远镜——6.5 米口径的 18 块镀铍六边形主镜，叠上五层网球场大的 Kapton 遮阳板，还要折叠塞进阿丽亚娜 5 的火箭整流罩，飞到 150 万公里外的日地拉格朗日 L2 点再展开。红外波段观测宇宙第一代星系，镜面必须冷到 -233°C 以下——遮阳板就是它的"人造日食"。本件为 NASA 工程模型的数字化（1600 部件级网格，含 30 公里级线缆束的走线），18 块主镜分段、遮阳板展开结构、米字撑架、航天器总线均为独立建模。',
  specs: [
    ['主镜', '6.5m · 18 块镀金铍六边形'],
    ['遮阳板', '5 层 Kapton · 约 21×14m'],
    ['轨道', '日地 L2 · 150 万 km'],
    ['发射', '2021-12-25 · 阿丽亚娜 5'],
    ['波段', '红外 0.6-28.3μm'],
  ],
  accent: '#d4af37',
  /* 质量分级 B：NASA CC0 工程模型 + 1600 部件级网格；膜层是否单独建模待目检，不评 A */
  quality: 'B',
  source: 'NASA 3D Resources（经 Smithsonian 开放获取通道获取）',
  modelCredit: 'James Webb Space Telescope (NASA engineering model) — NASA 3D Resources, public domain',
  modelSource: 'https://science.nasa.gov/3d-resources/james-webb-space-telescope/',
  targetWidth: 10,
  camDist: 1.25,
  normalize: 'full',
  frontAxis: '+z',
  glb: '/assets/jwst.glb',
  /* 名字规则路由（1600 网格 521 族）：族前缀 → 部件；位置兜底走背板 */
  mapByPosition(name, p, rel) {
    const n = name.replace(/^James_Webb_Space_Telescope:/, '').replace(/^(asm_|hr_)[a-z0-9_]*?_v\d{3}:/, '').split(':')[0];
    if (/^mirror/.test(n)) return 'primary-mirror';
    if (/^omni/.test(n)) return 'secondary-mirror';
    if (/^mboom/.test(n)) return 'metering-boom';
    if (/^aftsd|^fwdshield|^aftshield|^aft_flap|^batwing|^aft_spreader|^fwd_spreader/.test(n)) return 'sunshield';
    if (/^twr|^iec/.test(n)) return 'instruments';
    if (/^sc_/.test(n)) return 'bus';
    if (/^sa_|^solar/.test(n)) return 'solar-array';
    if (/^hga/.test(n)) return 'hga';
    if (/^harness|^cleat/.test(n)) return 'harness';
    return 'backplane';
  },
  tour: ['primary-mirror', 'secondary-mirror', 'metering-boom', 'backplane', 'instruments', 'sunshield', 'bus', 'solar-array', 'hga', 'harness'],
  /* 无独立外壳（开放结构），不设 xrayShellIds */
  realPartIds: ['primary-mirror', 'secondary-mirror', 'metering-boom', 'sunshield', 'backplane', 'instruments', 'bus', 'solar-array', 'hga', 'harness'],
  parts: [
    { id: 'primary-mirror', zh: '主镜（18 分段）', en: 'PRIMARY MIRROR', real: true,
      ex: [0.9, 0.3, 0], lo: [0, 1.2, 0], tag: '6.5m 镀金铍 · 分块可折叠',
      desc: '6.5 米主镜由 18 块六边形铍镜拼成，每块镀上约 48 克黄金——金对红外波段反射率最高。单块火箭装不下，镜段分三瓣折叠，入轨后由 126 台电机逐块展开、以头发丝 1/10000 的精度对齐。铍在 -233°C 下几乎不热胀冷缩，这是它击败玻璃的原因。',
      specs: [['口径', '6.5m（哈勃 2.4m 的 2.7 倍）'], ['集光面积', '25 m²'], ['面形精度', '±20nm']] },
    { id: 'secondary-mirror', zh: '副镜与三脚撑', en: 'SECONDARY MIRROR', real: true,
      ex: [1.6, 0.8, 0], lo: [0, 1.2, 0], tag: '0.74m · 三臂展开',
      desc: '副镜只有 0.74 米，却决定整台望远镜的成像：主镜汇聚的光经它反射折回背后的仪器舱。三根碳纤维撑臂从主镜边缘展开锁定——发射时折叠贴着镜背，展开误差要求毫米级，撑臂长 7.6 米却没有二次展开修正机会。',
      specs: [['口径', '0.74m'], ['撑臂', '3 根 · 7.6m']] },
    { id: 'metering-boom', zh: '米字撑架', en: 'METERING STRUCTURE', real: true,
      ex: [0, 0.3, 1.1], lo: [0, 1.2, 0.2], tag: '光学基准 · 稳定到千分之一波长',
      desc: '连接主镜、副镜与仪器的碳纤维桁架：它不是"架子"而是光学基准——所有镜面的相对位置由它锁定，温度变化时的形变要小于波长的千分之一。桁架管间大量采用绞链与锁定机构，收拢时整个光学系统压成 4.5 米高的包裹。',
      specs: [['材料', '碳纤维桁架'], ['角色', '光学位置基准']] },
    { id: 'backplane', zh: '背板环', en: 'BACKPLANE', real: true,
      ex: [0.4, 0.9, 0], lo: [0, 1.2, 0], tag: '18 块镜的骨架',
      desc: '背板是主镜背后的碳纤维蜂窝骨架：18 块镜段、副镜撑臂、仪器舱全部装在它上面。它自己也要"呼吸"——从地面室温到轨道 -233°C 收缩十几厘米，所有镜位精度由背板与温控设计共同兜住。图中环状结构即主镜背板。',
      specs: [['材料', '碳纤维复合材料'], ['温区', '室温 → -233°C']] },
    { id: 'instruments', zh: '仪器塔与电子舱', en: 'INSTRUMENTS & IEC', real: true,
      ex: [0, 1.4, -0.6], lo: [0, 1.2, 0], tag: '四大仪器的家',
      desc: '背板正后方是综合科学仪器模块（ISIM）：近红外相机 NIRCam、近红外光谱仪 NIRSpec、中红外仪 MIRI、精细导星传感器 FGS 四大仪器装在一体内。旁边整合电子舱（IEC）负责数据处理与通信——它必须待在暖区，与镜面的冰冻世界只隔一层结构。',
      specs: [['仪器', 'NIRCam / NIRSpec / MIRI / FGS'], ['温区', '仪器 ~-233°C · 电子舱常温']] },
    { id: 'sunshield', zh: '遮阳板结构', en: 'SUNSHIELD', real: true,
      ex: [-1.2, 0.2, 0], lo: [0, 1.2, 0], tag: '五层 Kapton · 人造日食',
      desc: '遮阳板是韦伯的生命线：五层信用卡厚的 Kapton 薄膜（双面镀铝、朝日面掺硅）展开约 21×14 米。层间真空让热量逐层衰减——第 1 层约 110°C，第 5 层低于 -233°C，温差 340 度。本件数字化了展开桁架、张紧机构与前后板结构；薄膜层未单独建模。',
      specs: [['层数', '5 层 Kapton 镀铝'], ['尺寸', '约 21×14m'], ['温差', '110°C → -233°C']] },
    { id: 'bus', zh: '航天器总线', en: 'SPACECRAFT BUS', real: true,
      ex: [-0.6, -0.8, 0], lo: [0, 1.2, 0], tag: '推进 · 姿控 · 供电',
      desc: ' Bus 是韦伯的"身体"：姿态控制（星敏感器+反作用轮）、轨道维持（推进剂够 10 年以上，2021 年精确入轨省下的燃料又续了 20 年寿命）、配电与通信都在这里。它始终朝阳，为全船供 2kW 电力，同时是遮阳板的安装基座。',
      specs: [['供电', '2kW 太阳能'], ['轨道维持', 'L2 · 燃料 10 年+']] },
    { id: 'solar-array', zh: '太阳翼', en: 'SOLAR ARRAY', real: true,
      ex: [-0.4, -1.0, 0.6], lo: [0, 1.1, 0.2], tag: '2kW · 总线的电源',
      desc: '太阳翼始终朝向太阳——韦伯在 L2 点运行时，太阳、地球、月球永远在同一个方向，遮阳板一次展开就能永远挡住它们，太阳翼也永远发电。这种"三体一线"的轨道几何，是 L2 点送给韦伯的最大礼物。',
      specs: [['功率', '~2kW'], ['几何', 'L2 三体一线']] },
    { id: 'hga', zh: '高增益天线', en: 'HIGH-GAIN ANTENNA', real: true,
      ex: [-0.5, -0.6, 1.0], lo: [0, 1.1, 0.3], tag: '数据回传 · 每日两次',
      desc: '高增益天线是韦伯与地球的唯一宽带通道：每天两次把数十 GB 观测数据通过深空网络传回。天线装在遮阳板暖侧——它必须始终指向地球，而镜面必须始终背对太阳，两者夹角由轨道几何锁死。',
      specs: [['频段', 'Ka 波段'], ['回传', '~28GB/日 · 两次窗口']] },
    { id: 'harness', zh: '线缆束与卡扣', en: 'HARNESS & CLEATS', real: true,
      ex: [0, 0.6, -1.2], lo: [0, 1.1, 0], tag: '30 公里级 · 走线即工程',
      desc: '本模型最惊人的部分：239 段独立建模的线缆束与上百个卡扣。韦伯全船线缆总长约 30 公里——冷区与暖区之间的每根导线都是热桥，走向、卡扣位置、余量长度全部经过热力学计算。工程模型把走线也建出来，是因为它们真的会影响镜面温度。',
      specs: [['总长', '约 30km'], ['建模', '239 段线缆 + 卡扣']] },
  ],
});
