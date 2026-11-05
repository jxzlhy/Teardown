/* =============================================================
   设备配置：Nothing Phone (3a) Lite（SM683 平台）
   官方 GLB：nothing.tech 产品页资产（Sanity CDN，cm 尺度）
   命名带平台代号 SM683/SM68A，语义化映射
============================================================= */
import { makeDevice, composePostLoad } from './_kit/factory.js';

export default makeDevice({
  id: 'phone3alite',
  era: 2025,
  name: 'Nothing Phone (3a) Lite',
  en: 'SM683',
  category: '手机',
  brand: 'NOTHING',
  tagline: '最亲民的 Glyph 手机',
  description: 'Nothing Phone (3a) Lite：入门定位却保留了 Glyph 灯语与 6.77 英寸 120Hz AMOLED，天玑 7300 Pro 加 50MP OIS 主摄，去掉长焦换来的亲民定价。官方产品页模型（带透明中板设计）。',
  specs: [
    ['处理器','天玑 7300 Pro 5G'],['主摄','50MP · OIS'],['前摄','16MP'],
    ['屏幕','6.77″ AMOLED · 120Hz'],['电池','5000 mAh'],['灯语','Glyph 简化版'],
    ['系统','Nothing OS 3.5 · 6 年更新'],['尺寸','164 × 78 × 8.3 mm'],
  ],
  accent: '#c9c9c9',
  source: 'Nothing 官网产品页模型',
  distribution: 'local-demo-only',
  targetWidth: 14.6,   /* 高 164.1mm 为最大维 */
  glb: '/assets/phone3alite.glb',
  realSizeMM: 164.1,   /* 真实最大外形尺寸（官方支持页 164.1×78.1×8.3mm）：测量工具 mm 标定基准 */
  tour: ['screen','frame','midframe','internals','camera','buttons','glyph'],
  xrayShellIds: ['screen','frame'],
  normalize: 'full',
  frontAxis: '-z',      /* 屏幕层在 -Z（TP_GLASS z≈-0.36） */
  materialMapping: {
    'glyph':'glyph','screen':'screen','front glass':'screen','back panel':'midframe','back glass':'midframe',
    'frame':'frame','front black frame':'frame','side button':'buttons','screw':'internals','camera lens':'camera','camera glass':'camera',
  },
  mapping: {
    'TP_GLASS-0614.001':'screen','TP_GLASS-0614.002':'screen','TP_GLASS-0614.003':'screen',
    'OCA':'screen','OCA.001':'screen','165190B01-100-X1.001':'screen',
    '03-SM68A-BAT-COVER.001':'midframe','03-SM68A-BAT-COVER.002':'midframe',
    '03-SM68A-DECO-CG-ADH.001':'midframe','03-SM68A-DECO-CG':'midframe',
    'SM683-T-FRONT-HOSING-PLASTIC.002':'frame','SM683-.001':'frame',
    'INNER_SHELL':'midframe','2ND_IM':'midframe','UV_GLUE':'midframe','SCREW-24121T-M1445.005':'internals',
    '02-SM683-T-2M_CAM_LENS':'camera','03-SM68A-WIDE-CAM-DECO.001':'camera','DL2164.002':'camera','DL2164.001':'camera',
    '03-SM683-FLASH-LENS.001':'camera','03-SM683-LIGHT-LENS.001':'camera','03-SM683-REC-DECO':'camera','03_SM683-DECO-PLATE':'camera',
    '04-SM683-AI-KEY-CAP-.001':'buttons','03-SM683-FLASH-LENS.001':'camera',
    'pSphere1_2.001':'camera','Plane':'internals','Plane.003':'internals',
  },
  realPartIds: ['screen','camera','glyph','midframe','frame','buttons','internals'],
  parts: [
    { id:'screen', zh:'正面屏幕', en:'FRONT DISPLAY', real:true,
      ex:[0,.2,2.9], lo:[0,1.5,0], tag:'6.77″ AMOLED · 120Hz',
      desc:'6.77 英寸 FHD+ AMOLED 柔性屏，120Hz 自适应刷新率，支持 Ultra HDR 显示；屏下光学指纹，屏幕堆叠以 OCA 光学胶全贴合。',
      specs:[['尺寸','6.77 英寸'],['分辨率','FHD+ 2392×1080'],['刷新率','120Hz'],['特性','Ultra HDR']] },
    { id:'camera', zh:'后置相机组', en:'REAR CAMERA GROUP', real:true,
      ex:[1.3,2.6,-2.0], lo:[0,1.5,0], tag:'50MP OIS 单主摄',
      desc:'背板左上的 50MP 主摄（OIS 光学防抖）与补光灯、REC 指示点：砍掉长焦把成本让给屏幕与灯语，成像由 TrueLens Engine 4.0 算法补足。',
      specs:[['主摄','50MP f/1.88 OIS'],['补光','LED 闪光灯'],['算法','TrueLens Engine 4.0'],['前摄','16MP']] },
    { id:'glyph', zh:'Glyph 灯语', en:'GLYPH LIGHTS', real:true,
      ex:[-1.8,2.8,-2.2], lo:[0,1.4,0], tag:'简化版灯带',
      desc:'入门定位保留的简化 Glyph 灯带：围绕相机区的弧形灯条承担来电、充电与计时提醒，与 Essential Space 联动。',
      specs:[['类型','弧形灯带'],['功能','通知 · 充电 · 计时'],['联动','Essential Space']] },
    { id:'midframe', zh:'透明中板', en:'TRANSPARENT MID-PLATE', real:true,
      ex:[0,0,.4], lo:[0,1.3,0], tag:'印刷内视设计',
      desc:'Phone (3a) Lite 的标志性透明中板：以印刷图形呈现“内部分层”，真正的中板、主板（天玑 7300 Pro）与 5000 mAh 电池藏于其后，铝制电池框增强整机刚性。',
      specs:[['设计','印刷透明风格'],['主板','天玑 7300 Pro 5G'],['电池','5000 mAh'],['结构','铝制电池框']] },
    { id:'frame', zh:'中框', en:'FRAME', real:true,
      ex:[0,0,1.5], lo:[0,1.2,0], tag:'前壳注塑框架',
      desc:'前壳注塑框架与铝合金层共同构成机身骨架，按键与 AI 键（AI-KEY-CAP）嵌于框体侧面。',
      specs:[['结构','注塑框架 + 铝层'],['按键','实体侧键'],['AI 键','左侧独立按键']] },
    { id:'buttons', zh:'按键组', en:'SIDE BUTTONS', real:true,
      ex:[2.0,1.0,1.1], lo:[0,1.0,0], tag:'电源 + AI 键',
      desc:'右侧电源/音量键与左侧独立 AI 键：按下直达 Essential Space 或 AI 助手。',
      specs:[['电源键','右侧'],['AI 键','左侧独立'],['功能','Essential Space']] },
    { id:'internals', zh:'内部细节', en:'INTERNAL DETAILS', real:true,
      ex:[-1.6,1.1,-1.2], lo:[0,1.1,0], tag:'螺丝与支架',
      desc:'透过透明中板可见的螺丝、支架与泡棉细节，Nothing 将工程痕迹保留为设计语言。',
      specs:[['构成','螺丝 · 支架'],['设计','功能性外露']] },
  ],
  postLoad: composePostLoad(),
  tick: null,
});
