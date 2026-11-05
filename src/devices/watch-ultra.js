/* =============================================================
   设备配置：Apple Watch Ultra (2022)
   官方 GLB：Apple 产品页 AR 资产（材质名可读 → materialMapping）
   Trail Loop 表带版本
============================================================= */
import { makeDevice, anchorParts, composePostLoad } from './_kit/factory.js';
import { battery, taptic } from './_kit/internals.js';

const builders = {
  battery: (g)=> battery(g, { w:2.6, h:2.4, d:.4, label:'APPLE', capacity:'543 mAh', model:'A2783', rating:'3.85V' }),
  taptic:  (g)=> taptic(g, 1.2, .8, .3),
};

export default makeDevice({
  id: 'watch-ultra',
  era: 2022,
  name: 'Apple Watch Ultra',
  en: 'A2684',
  category: '穿戴',
  brand: 'APPLE',
  tagline: '钛金属 · 49mm 探险级',
  description: 'Apple Watch Ultra：49mm 航空级钛金属表壳、3000nit 屏幕与 36 小时续航的探险级智能手表，双频 GPS 与 100 米防水。官方产品页模型（Trail Loop 表带版，Apple AR 资产，材质可读），内构件为示意重建。',
  specs: [
    ['表壳','49mm 航空级钛金属'],['屏幕','LTPO OLED · 3000nit'],['防水','100m · EN13319 潜水'],
    ['GPS','L1 + L5 双频'],['电池','36h 常规 / 60h 低电'],['传感器','心率 · 血氧 · ECG · 体温'],
    ['按键','Digital Crown + Action 键'],['重量','61 g（钛壳）'],
  ],
  accent: '#e8a33d',
  source: 'Apple 官网 AR 模型（USDZ 转制）',
  distribution: 'local-demo-only',
  targetWidth: 9.0,
  glb: '/assets/watch-ultra.glb',
  realSizeMM: 49,   /* 真实最大外形尺寸（Apple 官方口径 49×44×12mm 壳体）：测量工具 mm 标定基准 */
  /* 策展导览：屏→壳→表冠→动作键→扬声器→传感器→天线带→电池→马达→表带 */
  tour: ['display','case','crown','action-button','speaker','sensor','antenna-band','battery','taptic','band'],
  xrayShellIds: ['display','case','band'],
  normalize: 'full',
  materialMapping: {
    'FrontGlass_USD_MTLSG':'display','screenArt_USD_MTLSG':'display','blackGlass_ao_USD_MTLSG':'display',
    'Titanium_Blasted_USD_MTLSG':'case','titanium_USD_MTLSG':'case','TitaniumBlastedV2_USD_MTLSG':'case',
    'titaniumMachined_USD_MTLSG':'case','N199_body_ao_MLT_USD_MTLSG':'case','initialShadingGroup':'case',
    'blackout_USD_MTLSG':'case','matteBlack_USD_MTLSG':'case','matteBlackLight_USD_MTLSG':'case','textMetal_USD_MTLSG':'case',
    'crownGroove_USD_MTLSG':'crown','crownRing_USD_MTLSG':'crown','crownPinBlackMatte_USD_MTLSG':'crown',
    'Orange_Titanium_USD_MTLSG':'action-button',
    'speakerMesh_USD_MTLSG':'speaker','rubberGasket_USD_MTLSG':'speaker',
    'sensorChip_USD_MTLSG':'sensor','sensorLens_USD_MTLSG':'sensor','backSensorCeramic_USD_MTLSG':'sensor',
    'backCrystal_USD_MTLSG':'sensor','opaqueGlassBack_USD_MTLSG':'sensor',
    'antenna_USD_MTLSG':'antenna-band',
    'B604_YellowThread_USD_MTLSG':'band','velcroStrips_USD_MTLSG':'band','B602BandWhole_USD_MTLSG':'band','strand_USD_MTLSG':'band',
  },
  realPartIds: ['display','case','crown','action-button','speaker','sensor','antenna-band','band'],
  builders,
  parts: [
    { id:'display', zh:'屏幕总成', en:'LTPO OLED DISPLAY', real:true,
      ex:[0,.4,2.6], lo:[0,1.5,0], tag:'3000nit · 平面蓝宝石',
      desc:'49mm 表壳上最大的 Apple Watch 屏幕：LTPO OLED 常亮显示 3000nit 峰值亮度，正上方一整片平面蓝宝石玻璃与表壳齐平，强光与水下都清晰可读。',
      specs:[['面板','LTPO OLED'],['亮度','3000nit（3× 常规款）'],['玻璃','平面蓝宝石'],['刷新','自适应 1-60Hz']] },
    { id:'case', zh:'钛金属表壳', en:'TITANIUM CASE', real:true,
      ex:[0,.2,2.0], lo:[0,1.4,0], tag:'航空级钛 · 拉丝阳极',
      desc:'49mm 航空级钛金属表壳：拉丝阳极氧化处理降低反光，四角以平坦斜面设计保护表镜与表冠；表壳集成双侧扬声器孔与麦克风网，满足 EN13319 潜水标准。',
      specs:[['材质','Grade 5 钛合金'],['工艺','拉丝阳极氧化'],['防水','100m / WR100'],['标准','EN13319 潜水']] },
    { id:'crown', zh:'Digital Crown', en:'DIGITAL CROWN', real:true,
      ex:[1.4,1.2,1.4], lo:[0,1.2,0], tag:'加粗表冠 · 触觉反馈',
      desc:'更大更凸出的 Digital Crown：加大齿纹便于戴手套操作，内置触觉引擎在旋转刻度时给出清脆反馈；表冠轴心防水密封。',
      specs:[['尺寸','加大凸出'],['反馈','旋转触觉'],['操作','支持湿手/手套']] },
    { id:'action-button', zh:'Action 按键', en:'ACTION BUTTON', real:true,
      ex:[-1.5,1.3,1.3], lo:[0,1.2,0], tag:'国际橙 · 可自定义',
      desc:'表壳左侧标志性的国际橙 Action 键：一键直达自定义功能——锻炼、潜水、回溯、手电、标记航点，水下也能盲按。',
      specs:[['配色','国际橙'],['功能','自定义直达'],['特性','水下可操作']] },
    { id:'speaker', zh:'扬声器与麦克风', en:'SPEAKER & MIC', real:true,
      ex:[0,-1.4,1.6], lo:[0,1.2,0], tag:'3 麦克风阵列',
      desc:'表壳两侧集成三麦克风（前、侧、水下降噪）与大功率扬声器：通话、Siri 与警报声在风噪水流中依然清晰。',
      specs:[['麦克风','3 阵列'],['特性','风噪抑制'],['扬声器','大功率输出']] },
    { id:'sensor', zh:'背部传感器', en:'SENSOR ARRAY', real:true,
      ex:[0,-.6,-2.0], lo:[0,1.4,0], tag:'四导光 + 电极',
      desc:'背部陶瓷传感器区：心率四导光二极管、血氧、ECG 电极与体温传感器环绕排布，水下以蓝宝石镜面保护；深度计与水温计集成同区。',
      specs:[['心率','4 导光 LED'],['血氧','SpO2'],['体温','双点测温'],['深度','40m 潜水记录']] },
    { id:'antenna-band', zh:'天线带', en:'ANTENNA LINE', real:true,
      ex:[0,1.6,.6], lo:[0,1.2,0], tag:'LTE 天线缝隙',
      desc:'表壳内嵌的 LTE 天线注塑带：蜂窝版经它直连运营商，撒哈拉或雪山无手机也能定位求援（双频 GPS + 卫星 SOS 逻辑同区布线）。',
      specs:[['蜂窝','LTE 蜂窝版'],['定位','L1+L5 双频'],['求援','SOS 紧急联络']] },
    { id:'band', zh:'Trail Loop 表带', en:'TRAIL LOOP BAND', real:true,
      ex:[0,0,2.8], lo:[0,1.3,0], tag:'超轻尼龙拉环',
      desc:'Trail Loop 尼龙表带：超薄织带 + 可单手拉紧的拉环扣，长端外露织物环方便抽拉；越野跑步中戴手套也能快速调节。',
      specs:[['材质','超薄尼龙织带'],['扣具','拉环快调'],['重量','整表最轻搭配'],['设计','长端外拉环']] },
    { id:'battery', zh:'电池', en:'BATTERY 36H',
      ex:[0,.4,-3.0], lo:[0,1.3,0], tag:'36h 常规续航',
      desc:'表壳内的大容量锂离子电池：常规续航 36 小时、低功耗模式 72 小时，是 Apple Watch 史上续航最长的常规形态机型。',
      specs:[['容量','543 mAh（约）'],['续航','36h / 72h 低功耗'],['充电','磁吸快充']] },
    { id:'taptic', zh:'触觉引擎', en:'TAPTIC ENGINE',
      ex:[-1.8,1.4,-2.2], lo:[0,1.1,0], tag:'线性马达',
      desc:'表壳内触觉引擎：闹钟、App 通知与 Action 键反馈都由它输出，水下也能清晰感知。',
      specs:[['类型','线性马达'],['反馈','通知 · 旋转 · 按键']] },
  ],
  postLoad: composePostLoad(
    anchorParts({
      battery: { ref:'case', dz:.2 },
      taptic:  { ref:'case', dx:-.6, dz:.2 },
    }),
  ),
  tick: null,
});
