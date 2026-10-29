/* =============================================================
   设备配置：Apple AirPods 5 (2026)
   官方 GLB：Apple 产品页 AR 资产转换（含充电盒与双耳塞）
============================================================= */
import { makeDevice, anchorParts, composePostLoad } from './_kit/factory.js';
import { driver, battery } from './_kit/internals.js';

const builders = {
  'driver-r': (g)=> driver(g, .75),
  'driver-l': (g)=> driver(g, .75),
  'case-battery': (g)=> battery(g, { w:2.7, h:1.7, d:.5, label:'APPLE', capacity:'~1.8 Wh', model:'A3xxx', rating:'3.81V' }),
};

export default makeDevice({
  id: 'airpods-5',
  name: 'Apple AirPods 5',
  en: 'AIRPODS 5 2026',
  category: '耳机',
  brand: 'APPLE',
  tagline: '实时通话翻译 · 降噪普及款',
  description: 'AirPods 5（2026）：入门定位却补齐主动降噪与通透模式，新增实时通话翻译（Live Translation）与增强 Siri 交互，电池可维修性较上代改善。官方产品页模型（Apple AR 资产转换），内构件为示意重建。',
  specs: [
    ['降噪','主动降噪 + 通透模式'],['续航','4h（ANC 开）/ 6h（关）'],['总续航','配合充电盒 20h'],
    ['快充','盒内 5 分钟 ≈ 1 小时'],['新功能','实时通话翻译 · Siri'],['电池','可维修性改善'],
    ['防护','IP54 级'],['发布','2026 年 9 月'],
  ],
  accent: '#e9edf2',
  source: 'Apple 官网 AR 模型（USDZ 转制）',
  targetWidth: 7.2,
  glb: '/assets/airpods-5.glb',
  /* 策展导览：双耳塞→双驱动器→仓体→仓电池→仓盖 */
  tour: ['bud-l','bud-r','driver-l','driver-r','case-bottom','case-battery','case-lid'],
  xrayShellIds: ['bud-l','bud-r','case-bottom','case-lid'],
  normalize: 'full',
  mapByPosition(name, p, rel){
    if(p.z > 1.4 && p.x > 0.3) return 'bud-r';
    if(p.z > 1.4 && p.x < -0.3) return 'bud-l';
    if(p.y < -1.0) return 'case-bottom';
    return 'case-lid';
  },
  realPartIds: ['bud-l','bud-r','case-bottom','case-lid'],
  builders,
  parts: [
    { id:'bud-l', zh:'左耳塞', en:'LEFT BUD', real:true,
      ex:[-1.6,.3,1.8], lo:[0,1.3,0], tag:'ANC 入耳 · 压力杆',
      desc:'左耳塞：入耳式降噪设计，硅胶耳塞多尺寸可换，短柄压力杆控制播放与降噪切换，皮肤传感器摘下即停。',
      specs:[['降噪','主动降噪'],['控制','压力杆'],['传感','皮肤检测'],['耳塞','多尺寸硅胶']] },
    { id:'bud-r', zh:'右耳塞', en:'RIGHT BUD', real:true,
      ex:[1.6,.3,1.8], lo:[0,1.3,0], tag:'实时通话翻译',
      desc:'右耳塞与左耳对称：本代核心功能实时通话翻译经双耳协同完成——对方讲话实时转译入耳，Siri 交互也大幅增强。',
      specs:[['翻译','Live Translation'],['语音','增强 Siri'],['驱动','定制高振幅单元']] },
    { id:'case-bottom', zh:'充电盒下壳', en:'CASE BODY', real:true,
      ex:[0,-.8,1.4], lo:[0,1.3,0], tag:'总续航 20 小时',
      desc:'充电盒下壳：内置电池为双耳塞补电，合计 20 小时续航；支持 USB-C 与 MagSafe/Qi 无线充，盒内快充 5 分钟 ≈ 1 小时。',
      specs:[['总续航','20h（ANC 开）'],['快充','5min ≈ 1h'],['无线充','MagSafe / Qi']] },
    { id:'case-lid', zh:'充电盒上盖', en:'CASE LID', real:true,
      ex:[0,.6,1.2], lo:[0,1.2,0], tag:'磁吸翻盖',
      desc:'充电盒上盖：钕磁铁开合，合盖即休眠；本代上盖与下壳的接缝做了防尘密封加强。',
      specs:[['开合','磁吸'],['特性','合盖休眠']] },
    { id:'driver-r', zh:'右驱动单元', en:'CUSTOM DRIVER',
      ex:[1.7,-.6,2.0], lo:[0,1.1,0], tag:'高振幅动圈',
      desc:'右耳塞定制高振幅动圈单元：本代音质与降噪双提升的核心，配合新声学算法压低失真。',
      specs:[['类型','高振幅动圈'],['特性','低失真']] },
    { id:'driver-l', zh:'左驱动单元', en:'CUSTOM DRIVER',
      ex:[-1.7,-.6,2.0], lo:[0,1.1,0], tag:'高振幅动圈',
      desc:'左耳塞定制驱动单元，与右侧对称组成立体声；Vent 泄压孔平衡耳压。',
      specs:[['类型','高振幅动圈'],['泄压','Vent 平衡耳压']] },
    { id:'case-battery', zh:'盒内电池', en:'CASE BATTERY',
      ex:[0,-1.6,-.6], lo:[0,1.1,0], tag:'约 1.8 Wh',
      desc:'充电盒内置电池：本代电池模块的安装方式更利于维修（媒体拆解评价较上代改善）。',
      specs:[['容量','约 1.8 Wh'],['维修','较上代改善']] },
  ],
  postLoad: composePostLoad(
    anchorParts({
      'driver-r':     { ref:'bud-r', dz:-.3 },
      'driver-l':     { ref:'bud-l', dz:-.3 },
      'case-battery': { ref:'case-bottom', dz:-.1 },
    }),
  ),
  tick: null,
});
