/* =============================================================
   设备配置：B&T GL-06 肩射榴弹发射器（教学拆解件）
   社区 GLB（Sketchfab），27 网格：Obj_1-22_Lowpoly 匿名 + Scope_1-6 瞄准镜组
   （bbox 431×1077×2483，Z 为枪管轴：z -1267 枪口 → +1215 尾端）
   位置聚类：大件按网格判读点名，其余按 rel 坐标带归组
   —— 教育拆解视角：仅呈现结构事实，不含任何操作指导
============================================================= */
import { makeDevice } from './_kit/factory.js';

export default makeDevice({
  id: 'gl-06-launcher',
  name: 'B&T GL-06',
  en: 'B&T GL-06 40×46MM',
  category: '枪械',
  brand: 'B&T',
  tagline: '40×46mm 低速榴弹 · 瑞士警用肩射发射器',
  description: 'B&T（布鲁加-托梅）GL-06 是瑞士 Brügger & Thomet 推出的 40×46mm 低速榴弹肩射发射器，单发撅开式结构、空重约 2.05kg，是同级中最轻的 40mm 发射器之一，广泛用于警务与军援单位。本页为教育拆解视角的结构展示：线膛管、机匣、发射机组、可折叠肩托与机匣上方瞄具按真实布局分区。内容仅呈现结构事实，不含任何操作指导。',
  specs: [
    ['口径','40×46mm 低速榴弹'],['全长','590 mm（肩托展开）'],
    ['收纳','385 mm（肩托折叠）'],['枪管','280 mm · 线膛'],
    ['空重','约 2.05 kg'],['结构','单发 · 撅开式'],
    ['外尺寸','宽 60 × 高 200 mm'],['定位','警用 / 军援装备'],
  ],
  accent: '#556b2f',
  source: 'Sketchfab 社区模型',
  modelCredit: 'Game Ready PBR Grenade Launcher GL-06 by Leo_Newman (Sketchfab, CC-BY 4.0)',
  modelSource: 'https://sketchfab.com/3d-models/game-ready-pbr-grenade-launcher-gl-06-c06031637904402c85179bfce8b73e28',
  targetWidth: 9.5,
  glb: '/assets/gl-06-launcher.glb',
  tour: ['receiver','barrel','frame-housing','trigger-group','grip','rear-stock','scope','sight'],
  xrayShellIds: ['receiver','frame-housing'],
  normalize: 'full',
  frontAxis: '-z',           /* 原生枪口朝 -z，转到 +z 朝观众 */
  unmappedTo: 'frame-housing',
  mapByPosition(name, p, rel){
    if(name.startsWith('Scope')) return 'scope';
    /* 大件按网格判读点名（实际名带 _Lowpoly_材质 后缀，用 Obj_N_ 前缀） */
    if(name.startsWith('Obj_14_')) return 'barrel';                        /* 枪管段 4268 tris · c z -729 */
    if(name.startsWith('Obj_1_'))  return 'receiver';                      /* 机匣主体 8970 tris · c z 71 */
    if(name.startsWith('Obj_6_') || name.startsWith('Obj_4_')) return 'rear-stock';
    if(name.startsWith('Obj_2_'))  return 'trigger-group';                 /* 发射机座 2080 · c z 368 */
    if(name.startsWith('Obj_12_')) return 'sight';                         /* 提把/照门 1964 · c z 567 */
    if(name.startsWith('Obj_20_')) return 'grip';                          /* 折叠握把 256 · c z -304 */
    /* 其余小件按 rel 坐标带归组（枪口侧原生 -z 端 → rel.z≈0） */
    if(rel.z > 0.85) return 'rear-stock';
    if(rel.z > 0.55) return 'receiver';
    if(rel.z > 0.3)  return 'trigger-group';
    if(rel.z < 0.18) return 'barrel';
    if(rel.y < 0.45) return 'grip';
    return 'frame-housing';
  },
  realPartIds: ['receiver','barrel','rear-stock','trigger-group','grip','scope','sight','frame-housing'],
  parts: [
    { id:'receiver', zh:'机匣', en:'RECEIVER', real:true,
      ex:[0,.3,.6], lo:[0,1.4,0], tag:'铝合金承载核心 · 顶部瞄具轨',
      desc:'铝合金机匣是全枪的承载核心：枪管尾端铰接于机匣、由闩锁锁定，构成撅开式布局的骨架；顶部整合瞄具安装基面，下方连接握把与发射机组。模型中为最大单件网格（8970 三角面）。',
      specs:[['材质','铝合金 · 聚构件'],['铰接','管尾撅开式'],['接口','顶部瞄具基面']] },
    { id:'barrel', zh:'线膛管', en:'RIFLED BARREL', real:true,
      ex:[0,.5,3.0], lo:[0,1.2,0], tag:'280 mm 线膛 · 旋转稳定',
      desc:'280mm 线膛管发射 40×46mm 低速榴弹：弹体依赖线膛自旋稳定飞行，管口端为枪口断面，尾端与机匣铰接。整管位于枪管轴 -z 端（原生坐标 z -1267 起）。',
      specs:[['口径','40×46mm 低速'],['长度','280 mm'],['稳定方式','线膛自旋'],['内弹道','低速 · 低后坐']] },
    { id:'rear-stock', zh:'可折叠肩托', en:'FOLDING STOCK', real:true,
      ex:[0,.3,-2.8], lo:[0,1.1,0], tag:'折叠后 385 mm · 缓冲托板',
      desc:'肩托向机匣侧折叠，折叠态全长缩至 385mm 便于携行；展开后托底板贴合肩部传递后坐冲量，肩托板与尾托网格共同构成这一组件。',
      specs:[['收纳','385 mm（折叠）'],['全长','590 mm（展开）'],['功能','后坐缓冲 · 携行']] },
    { id:'trigger-group', zh:'发射机组', en:'FIRE CONTROL GROUP', real:true,
      ex:[0,-1.8,1.2], lo:[0,.9,0], tag:'扳机 · 阻铁 · 击针链路',
      desc:'发射机组由扳机、阻铁与击针簧组构成击发链路，机匣侧设保险件；本页仅作结构认知展示，呈现各零件的空间构成关系。',
      specs:[['组成','扳机 · 阻铁 · 击针'],['保险','机匣侧保险件'],['布局','机匣下侧']] },
    { id:'grip', zh:'握把', en:'PISTOL GRIP', real:true,
      ex:[.7,-2.2,1.6], lo:[0,.9,0], tag:'聚合物握把 · 连杆通道',
      desc:'聚合物手枪握把连接于机匣下侧，供持握稳定指向；内部贯穿扳机连杆通道，与发射机组机械衔接。',
      specs:[['材质','聚合物'],['集成','扳机连杆通道'],['角度','持握人机工学']] },
    { id:'scope', zh:'瞄准镜', en:'OPTIC SIGHT', real:true,
      ex:[0,2.4,.4], lo:[0,.8,0], tag:'独立材质组 · 6 件网格',
      desc:'机匣上方的光学瞄具组件：模型中 Scope_1-6 共 6 件网格、使用区别于主体的独立材质（Material_26），由镜身、调节座与夹持件构成，锁定在机匣顶面基座上。',
      specs:[['安装','机匣顶部基座'],['构成','镜身 · 调节座 · 夹环'],['网格','Scope_1-6 独立材质']] },
    { id:'sight', zh:'提把/照门', en:'CARRY HANDLE SIGHT', real:true,
      ex:[-.9,2.2,.2], lo:[0,.8,0], tag:'提把一体后备照门',
      desc:'机匣上方的提把兼作后备机械照门（网格 Obj_12，带横梁结构），与枪管口部的准星构成应急瞄准线，光学瞄具失效时兜底使用。',
      specs:[['形式','提把一体化照门'],['配合','枪口准星'],['定位','后备机械瞄具']] },
    { id:'frame-housing', zh:'护件/框架护盖', en:'FOREND HOUSING', real:true,
      ex:[1.7,0,.8], lo:[0,.9,0], tag:'枪管外周护盖 · 隔热持握',
      desc:'包覆枪管外周与机匣侧面的护盖、连接件等结构件归入此组：隔热隔振，同时提供持握与非持握手位，是匿名小网格的兜底分区。',
      specs:[['位置','枪管外周 · 机匣侧面'],['功能','隔热 · 持握位'],['构成','护盖 · 连接件']] },
  ],
  tick: null,
});
