/* =============================================================
   设备配置：瓦特蒸汽机教学模型（19 世纪 Bourdon 制实物数字化）
   社区模型（Sketchfab · Wirtualne Muzea Małopolska 波兰国家级数字化，CC-BY）
   174 网格（107 Cylinder + 26 Cube + 语义族 noga 支脚/belka 横梁/ramka 框/
   top/inside/back/srodek_gwiazda 星形轮）/ 7 材质 / 12 贴图，带运转动画
   bbox 1.06×1.83×0.43m（立式演示模型 · Y 上 · 底座 y≈0.4 · 顶部机构 y≥1.2）
   结构：底座支脚 → 立框支架 → 汽缸体 → 活塞连杆 → 飞轮与传动 → 星形装饰轮
   位置聚类（y 分层 + x 对称 + 名称族），飞轮传动用 spin 演示
============================================================= */
import { makeDevice } from './_kit/factory.js';

export default makeDevice({
  id: 'watt-steam-engine',
  era: 1835,
  name: '瓦特蒸汽机教学模型',
  en: 'WATT STEAM ENGINE',
  category: '机械',
  brand: 'WIRTUALNE MUZEA',
  tagline: '飞轮一转 · 工业革命的节拍器',
  description: '瓦特蒸汽机 19 世纪教学模型（Eugène Bourdon 制作，约 1835）：波兰"小波兰虚拟博物馆"国家级数字化项目带馆藏编号的实物——转动飞轮即可演示蒸汽机原理的教学具。立式布局集成了瓦特的三项关键改进：分离冷凝器（不再让汽缸忽冷忽热，热效率翻四倍）、行星齿轮传动（把往复运动转为旋转而不需曲柄专利）、离心调速器（转速自动反馈控制——"自动控制"一词的起点）。飞轮、连杆、汽缸、支框全部独立分件，附官方运转动画可对照校验。',
  specs: [
    ['年代', '约 1835 · Eugène Bourdon'],
    ['布局', '立式教学模型 · 飞轮演示'],
    ['三大改进', '分离冷凝器 / 行星齿轮 / 离心调速'],
    ['馆藏', '波兰 muzea.malopolska.pl 数字化'],
  ],
  accent: '#a3763f',
  /* 质量分级 B：国家级数字化 + 174 网格分层；位置聚类未经运行时逐件核验不评 A */
  quality: 'B',
  source: '社区模型（Sketchfab）',
  modelCredit: 'Model of the Watt Steam Engine with animation by Wirtualne Muzea Małopolska (Sketchfab, CC-BY)',
  modelSource: 'https://sketchfab.com/3d-models/model-of-the-watt-steam-engine-with-animation-36e57c231b6546b7bdd19bf4dba8063d',
  targetWidth: 9.5,
  camDist: 1.15,
  normalize: 'full',
  frontAxis: '+z',
  glb: '/assets/watt-steam-engine.glb',
  realSizeMM: 1830,   /* 真实最大外形尺寸（Wirtualne Muzea Małopolska 数字化实测：立式 1.06×1.83×0.43m，19 世纪 Bourdon 制实物）：测量工具 mm 标定基准 */
  /* 位置分层聚类（GLB JSON/inspect 实测）：
     base 底座支脚 y<0.6 / frame 立框横梁 0.6≤y<1.05（ramka/belka/back/inside）
     cylinder 汽缸传动带 1.05≤y<1.25（Cylinder 族+Cube/moga 密集层）
     flywheel-flywheel 顶轮机构 y≥1.25（含 srodek_gwiazda 星形轮 y=1.7） */
  mapByPosition(name, p, rel) {
    const n = name.replace(/_Material.*$/, '');
    if (p.y >= 1.25) return 'flywheel';
    if (p.y < 0.6 || /^noga|^top$|^left|^right/.test(n)) return 'base';
    if (p.y >= 1.05) return 'cylinder';
    return 'frame';
  },
  tour: ['base', 'frame', 'cylinder', 'flywheel'],
  realPartIds: ['base', 'frame', 'cylinder', 'flywheel'],
  /* AURORA 后/V5.1 内容深度：瓦特蒸汽机机构关系（十字头传动为该机型核心机构学特征）。
     活塞杆/十字头/连杆含于 cylinder 部件（174 网格位置聚类拆分，未独立拆件）——
     十字头直线导轨与连杆关系如实声明于 note；重力飞轮储能平顺转速。 */
  mech: { edges: [
    { id:'bl-cylinder-flywheel', type:'slider_crank', from:'cylinder', to:'flywheel', kinematic:'approx',
      note:'蒸汽推动活塞往复，经活塞杆-十字头-连杆转为飞轮回转（十字头沿导轨直线运动，杆系含于 cylinder 部件）' },
    { id:'fx-flywheel-frame', type:'fixed', from:'flywheel', to:'frame', kinematic:'exact',
      note:'飞轮轴支承于立框支架轴承' },
    { id:'fx-cylinder-frame', type:'fixed', from:'cylinder', to:'frame', kinematic:'exact',
      note:'汽缸体固装于立框支架（十字头导轨同体）' },
    { id:'fx-frame-base', type:'fixed', from:'frame', to:'base', kinematic:'exact',
      note:'立框支架螺栓紧固于底座' },
  ] },
  parts: [
    { id: 'base', zh: '底座与支脚', en: 'BASE & LEGS', real: true,
      ex: [0, -0.8, 0.4], lo: [0, 1.1, 0.2], tag: '四脚立式 · 演示台架',
      desc: '教学模型的立式台架：四只弯腿支脚（noga）承起整台机器，横梁（belka）把两侧立框绷成刚性整体。教学模型的底座比实用机器讲究——它要在讲台上被反复转动飞轮而不晃，重心压得极低。',
      specs: [['构成', '四弯腿 + 横梁 + 立框'], ['设计', '低重心 · 讲台演示']] },
    { id: 'frame', zh: '立框与导轨', en: 'FRAME', real: true,
      ex: [-1.0, 0.2, 0.3], lo: [0, 1.2, 0.2], tag: 'ramka 框体 · 运动导向',
      desc: '中部立框（ramka）：给活塞杆与连杆导向的框架结构——蒸汽机的往复运动必须走直线，框架就是"直线"的物化。背板（back）与内侧板（inside）之间藏着传动链的中间段。',
      specs: [['功能', '往复运动导向'], ['构成', '框体 + 背板 + 内衬']] },
    { id: 'cylinder', zh: '汽缸与活塞传动', en: 'CYLINDER & PISTON', real: true,
      ex: [0.7, 0.4, 0.7], lo: [0, 1.2, 0.2], tag: '蒸汽做功的心脏带',
      desc: '汽缸体与活塞连杆的做功带：蒸汽推动活塞往复，连杆把它传给飞轮——这一层 107 根 Cylinder 密布，是全机传动件最密集的区域。瓦特的分离冷凝器让汽缸保持高温（冷凝在隔壁完成），同样的蒸汽做出更多的功——工业革命的算术就是这么简单粗暴。',
      specs: [['做功', '蒸汽 → 往复 → 旋转'], ['关键', '分离冷凝器 · 热效率×4']] },
    { id: 'flywheel', zh: '飞轮与星形装饰轮', en: 'FLYWHEEL', real: true,
      ex: [0, 1.1, 0], lo: [0, 1.2, 0], tag: '惯性储能 · 顶部机构',
      desc: '顶部飞轮机构：活塞每转只有一段行程在做功，飞轮靠惯性把"间隙"补成连续旋转——工业革命的节拍器。中心的星形轮（gwiazda）既是配重也是装饰，19 世纪教学模型在此毫不掩饰对机械之美的炫耀。转动手轮，整套行星齿轮联动开始演示——附带的官方运转动画可作为运动对照。',
      specs: [['功能', '惯性储能 · 连续输出'], ['装饰', '星形轮 gwiazda'], ['演示', '官方动画可对照']] },
  ],
});
