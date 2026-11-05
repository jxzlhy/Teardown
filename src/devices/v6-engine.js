/* =============================================================
   设备配置：V 型发动机教学模型（含 12 组活塞连杆）
   社区模型（Sketchfab）：260 网格，法语命名（Bielle=连杆/
   Piston=活塞）+ 俄语材质（Procladka=垫片）+ mojibake 曲线名
   映射：名字前缀分流（includes 绕开 mojibake）+ rel.y 高度带兜底
============================================================= */
import { makeDevice } from './_kit/factory.js';

export default makeDevice({
  id: 'v6-engine',
  name: 'V 型发动机（教学）',
  en: 'V-ENGINE TEARDOWN',
  category: '机械',
  brand: 'GENERIC',
  tagline: '12 组活塞连杆 · V 型夹角 · 全构件教学件',
  description: '一台社区 V 型发动机教学模型：260 个独立网格把 12 组活塞、连杆、火花塞、曲轴皮带轮、正时皮带、排气歧管、空滤全部分开建模——虽然文件名叫 V6，实际按 12 缸规模建模（V12 或双 V6 布局），正好把「一缸一活塞一连杆」的配气点火结构看得明明白白。部件名是法语（Bielle=连杆、Piston=活塞），材质名里还混着俄语（Procladka=垫片）。',
  specs: [
    ['布局','V 型多缸（12 组活塞连杆）'],['核心','曲柄连杆机构'],
    ['配气','顶置气门 + 火花塞点燃'],['点火','PLUG 陶瓷绝缘火花塞 ×4 建模'],
    ['传动','正时皮带 + 曲轴皮带轮'],['附件','排气歧管 · 空滤 · 垫片组'],
    ['用途','结构教学拆解'],['来源','社区模型（Sketchfab）'],
  ],
  accent: '#c9a227',
  /* 质量分级 B：策展 tour + xrayShellIds 齐备，署名/许可证/部件 desc 完整（社区模型 CC-BY）；未经运行时逐件核验，不评 A */
  quality: 'B',
  source: '社区模型（Sketchfab）',
  modelCredit: 'V6 car engine with engine [MoreThem] by Blendoriano (Sketchfab, CC-BY 4.0)',
  modelSource: 'https://sketchfab.com/3d-models/v6-car-engine-with-engine-morethem-7309cf5e6b07435c962f954513ca170e',
  targetWidth: 11,
  camDist: 1.0,
  normalize: 'full',
  glb: '/assets/v6-engine.glb',
  /* 策展导览：缸体→活塞→连杆→火花塞→管路→前驱动 */
  tour: ['block','pistons','rods','plugs','hoses','drive-front'],
  /* X-Ray 外壳：缸体总成（缸体+缸盖+歧管一体）是唯一罩壳件，半透明后露出活塞/连杆/火花塞；
     避免 realPartIds 兜底把全部 6 组部件雾化 */
  xrayShellIds: ['block'],
  mapByPosition(name, p, rel){
    if(name.includes('zierCurve')) return 'hoses';
    if(name.startsWith('Piston')) return 'pistons';
    if(name.startsWith('Bielle'))  return 'rods';
    if(name.startsWith('PLUG'))    return 'plugs';
    if(name.startsWith('hute'))    return 'drive-front';
    if(rel.y < 0.2) return 'block';
    return 'block';
  },
  realPartIds: ['pistons','rods','plugs','hoses','drive-front','block'],
  /* AURORA 后/V5.1 内容深度：V6 机构关系（与 v8-engine 同族口径，机构学：往复式内燃机）
     曲轴未独立拆件（含于缸体部件）——边 from 用 block 并在 note 如实声明；
     连杆组独立拆件，故曲柄滑块传动拆为大端支承+小端铰接两段真实关系。 */
  mech: { edges: [
    { id:'sc-block-pistons', type:'slider_crank', from:'block', to:'pistons', kinematic:'approx',
      note:'V6 双列十二活塞沿缸轴往复；曲轴含于缸体部件（未独立拆件），连杆摆动以平动近似' },
    { id:'bs-block-rods', type:'bearing_support', from:'block', to:'rods', kinematic:'exact',
      note:'连杆大端支承于曲轴连杆颈（曲轴位于缸体部件内）' },
    { id:'rv-rods-pistons', type:'revolute', from:'rods', to:'pistons', kinematic:'exact',
      note:'连杆小端经活塞销与活塞铰接（往复平面内摆动）' },
    { id:'belt-block-front', type:'belt_drive', from:'block', to:'drive-front', kinematic:'approx',
      note:'曲轴前端皮带轮经附件带驱动轮系（速比未标定，不作数值声明）' },
    { id:'fx-plugs-block', type:'fixed', from:'plugs', to:'block', kinematic:'exact',
      note:'火花塞螺纹紧固于缸盖安装孔' },
  ] },
  parts: [
    { id:'block', zh:'缸体与缸盖', en:'BLOCK + HEADS', real:true,
      ex:[0,.6,1.8], lo:[0,1.4,0], tag:'V 型缸体 · 缸盖 · 歧管',
      desc:'缸体总成：V 型布置的两组气缸体与缸盖、气门室盖（Metal_Paint 涂装件）、进气歧管与排气歧管（Collector 材质）全部归集于此——发动机的「结实部分」，缸内燃烧压力全部由它扛。',
      specs:[['构成','缸体 · 缸盖 · 歧管'],['涂装','金属漆缸盖罩'],['密封','Procladka 垫片组']] },
    { id:'pistons', zh:'活塞组 ×12', en:'PISTONS ×12', real:true,
      ex:[1.6,-.6,1.2], lo:[0,1.3,0], tag:'12 组活塞 · 燃烧室做功',
      desc:'12 组活塞：可燃混合气在缸内爆燃推动活塞下行——发动机唯一的「做功」零件；裙部导向、顶部承压，经活塞销与连杆小头铰接。',
      specs:[['数量','12 组'],['行程','燃烧做功 → 排气'],['连接','活塞销 ↔ 连杆']] },
    { id:'rods', zh:'连杆组 ×12', en:'CONNECTING RODS ×12', real:true,
      ex:[-1.6,-.8,1.0], lo:[0,1.3,0], tag:'大小头变旋转为往复',
      desc:'12 根连杆（法语 Bielle）：连接活塞与曲轴，把活塞的直线往复运动转换为曲轴的旋转运动——发动机里受力最暴力的小零件，大头端剖分面用螺栓锁死抱住曲柄销。',
      specs:[['数量','12 根'],['功能','往复 → 旋转'],['细节','剖分大头 + 轴瓦']] },
    { id:'plugs', zh:'火花塞', en:'SPARK PLUGS', real:true,
      ex:[.8,1.8,-.6], lo:[0,1.2,0], tag:'陶瓷绝缘体 · 点火源',
      desc:'火花塞（Ceramic 陶瓷绝缘体建模）：万伏级电弧跳过电极间隙点燃混合气，白瓷部分既是绝缘体也是散热路径；V 型机上每缸一只，沿两缸盖斜面插入。',
      specs:[['结构','中心电极 + 陶瓷体'],['电压','万伏级电弧'],['位置','缸盖斜面插入']] },
    { id:'hoses', zh:'管路系统', en:'HOSES & DUCTS', real:true,
      ex:[-1.2,1.4,-1.4], lo:[0,1.1,0], tag:'Bézier 曲线放样管路',
      desc:'管路系统（BézierCurve 放样建模）：冷却水管、进气软管与真空管——发动机的「血管」，走位绕开热源与运动件。',
      specs:[['构成','水管 · 进气 · 真空管'],['建模','Bézier 曲线放样']] },
    { id:'drive-front', zh:'前端轮系', en:'FRONT DRIVE', real:true,
      ex:[0,-1.0,-2.2], lo:[0,1.2,0], tag:'曲轴皮带轮 + 正时带',
      desc:'前端轮系：曲轴皮带轮（hute_pulley_crank）驱动正时皮带（Remen 材质）同步凸轮轴与附件（发电机/水泵），齿轮箱壳（hute_gearbox）罩住张紧机构——正时错一齿，气门顶活塞。',
      specs:[['构成','皮带轮 · 正时带 · 张紧轮'],['功能','凸轮轴正时同步'],['风险','跳齿 = 顶气门']] },
  ],
});
