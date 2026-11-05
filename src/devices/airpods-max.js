/* =============================================================
   设备配置：Apple AirPods Max (USB-C, 2024)
   官方 GLB：Apple 产品页 AR 资产转换（午夜色，155 网格）
   位置映射：头带 y>9.5（|x|>4.8 支架） / 耳罩 |x|>3.2 / 连臂居中
============================================================= */
import { makeDevice, anchorParts, composePostLoad } from './_kit/factory.js';
import { driver, battery } from './_kit/internals.js';

const builders = {
  'driver-r': (g)=> driver(g, 1.9),
  'driver-l': (g)=> driver(g, 1.9),
  battery: (g)=> battery(g, { w:2.6, h:1.6, d:.5, label:'APPLE', capacity:'20.3 Wh', model:'A3217', rating:'3.81V' }),
};

export default makeDevice({
  id: 'airpods-max',
  era: 2020,
  name: 'Apple AirPods Max',
  en: 'A3217 · USB-C',
  category: '耳机',
  brand: 'APPLE',
  tagline: '头戴降噪 · 金属声学',
  description: 'AirPods Max：阳极氧化铝耳罩 + 不锈钢框架 + 针织网面头带的头戴降噪旗舰，H1 芯片 ×2、40mm 动圈与计算音频。官方产品页模型（午夜色，Apple AR 资产转换），内构件为示意重建。',
  specs: [
    ['芯片','H1 ×2（左右各一）'],['驱动','40mm 动圈 ×2'],['降噪','主动降噪 + 通透模式'],
    ['音频','计算音频 · 空间音频'],['电池','20.3 Wh · 20h 降噪播放'],['接口','USB-C（2024 款）'],
    ['材质','阳极铝 + 不锈钢 + 针织'],['重量','348.5 g'],
  ],
  accent: '#7d848d',
  source: 'Apple 官网 AR 模型（USDZ 转制）',
  distribution: 'local-demo-only',
  targetWidth: 11.5,
  thumbDir: [0.8, 0.05, 1.35],   /* 正面平视：双耳罩侧面轮廓 + 头带 */
  camDist: 1.05,
  glb: '/assets/airpods-max.glb',
  realSizeMM: 187.3,   /* 真实最大外形尺寸（Apple 官方规格 187.3×168.6×83.4mm）：测量工具 mm 标定基准 */
  /* 策展导览： canopy→头带框架→轭臂→耳罩与驱动器→电池 */
  tour: ['canopy','band-frame','yoke','earcup-l','driver-l','earcup-r','driver-r','battery'],
  xrayShellIds: ['earcup-l','earcup-r','canopy'],
  normalize: 'full',
  mapByPosition(name, p, rel){
    if(p.y > 9.5) return Math.abs(p.x) > 4.8 ? 'band-frame' : 'canopy';
    if(p.x > 3.2) return 'earcup-r';
    if(p.x < -3.2) return 'earcup-l';
    return 'yoke';
  },
  realPartIds: ['canopy','band-frame','earcup-l','earcup-r','yoke'],
  builders,
  parts: [
    { id:'canopy', zh:'Canopy 头带网面', en:'KNIT-MESH CANOPY', real:true,
      ex:[0,1.2,2.0], lo:[0,1.6,0], tag:'透气针织穹顶',
      desc:'Canopy 头带以双层针织网面绷在不锈钢弓形架上：外层织物、内层透气网，穹顶造型把接触压强分散到整个头顶，久戴不夹。',
      specs:[['结构','双层针织 + 弓形架'],['接触','穹顶分散压强'],['材质','针织网面'],['配色','与耳罩同色系']] },
    { id:'band-frame', zh:'不锈钢框架', en:'STAINLESS STEEL FRAME', real:true,
      ex:[0,.8,1.6], lo:[0,1.5,0], tag:'弓形臂 · 伸缩滑轨',
      desc:'两侧的镜面不锈钢弓形臂：从耳罩延伸至头顶汇合，臂内藏伸缩滑轨自动调节长度，转轴以精密阻尼铰链衔接耳罩。',
      specs:[['材质','镜面不锈钢'],['调节','伸缩滑轨'],['铰链','阻尼转轴'],['走线','臂内音频线']] },
    { id:'earcup-l', zh:'左耳罩', en:'LEFT EARCUP', real:true,
      ex:[-1.8,.4,1.8], lo:[0,1.5,0], tag:'阳极铝声学腔',
      desc:'左侧阳极氧化铝耳罩：一体成型的声学腔体，磁吸耳垫可徒手摘下；内藏 40mm 动圈与左声道 H1 芯片，双环出音结构消除腔体共鸣。',
      specs:[['材质','阳极氧化铝'],['耳垫','磁吸可拆'],['声学','双环形出音'],['芯片','H1（左）']] },
    { id:'earcup-r', zh:'右耳罩', en:'RIGHT EARCUP', real:true,
      ex:[1.8,.4,1.8], lo:[0,1.5,0], tag:'数字表冠 · 电池仓',
      desc:'右侧耳罩集成 Digital Crown：旋钮调音量、按播放、长按切降噪/通透；侧键独立切换模式。耳罩内还藏着整机唯一的锂离子电池。',
      specs:[['旋钮','Digital Crown'],['按键','降噪/通透切换'],['电池','20.3 Wh 内置'],['芯片','H1（右）']] },
    { id:'yoke', zh:'连接臂', en:'YOKE', real:true,
      ex:[0,.2,2.4], lo:[0,1.2,0], tag:'悬摆结构',
      desc:'连接弓形架与耳罩的悬摆臂：耳罩可绕臂自由微摆，佩戴时自动贴合头型角度，保持耳垫密封。',
      specs:[['结构','悬摆铰接'],['作用','自适应贴合'],['材质','不锈钢']] },
    { id:'driver-r', zh:'右驱动单元', en:'40MM DYNAMIC DRIVER',
      ex:[3.4,-.6,2.6], lo:[0,1.2,0], tag:'40mm 双环磁路',
      desc:'40mm 动圈单元：双环钕磁体系统降低 THD，振膜由 H1 实时驱动计算音频——根据耳垫贴合度逐帧补偿低频。',
      specs:[['尺寸','40mm 动圈'],['磁路','双环钕磁'],['特性','计算音频补偿'],['位置','右耳罩内']] },
    { id:'driver-l', zh:'左驱动单元', en:'40MM DYNAMIC DRIVER',
      ex:[-3.4,-.6,2.6], lo:[0,1.2,0], tag:'40mm 双环磁路',
      desc:'左侧 40mm 动圈：与右耳对称布置，独立 H1 芯片以 9 麦克风（每侧 4+降噪）实时做声学泄露补偿。',
      specs:[['尺寸','40mm 动圈'],['麦克风','每侧 4 颗 + 降噪'],['位置','左耳罩内']] },
    { id:'battery', zh:'电池', en:'BATTERY 20.3 Wh',
      ex:[2.8,-2.4,1.6], lo:[0,1.2,0], tag:'20.3 Wh · 20 小时',
      desc:'藏于右耳罩的锂离子电池：20.3 Wh 声称 20 小时降噪播放，智能休眠（正放/侧放）可再省电。',
      specs:[['容量','20.3 Wh'],['续航','20h（降噪开）'],['充电','USB-C · 5 分钟 1.5h'],['休眠','智能摆放检测']] },
  ],
  postLoad: composePostLoad(
    anchorParts({
      'driver-r': { ref:'earcup-r', dz:-.4 },
      'driver-l': { ref:'earcup-l', dz:-.4 },
      battery:    { ref:'earcup-r', dy:-.9, dz:-.3 },
    }),
  ),
  tick: null,
});
