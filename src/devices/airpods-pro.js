/* =============================================================
   设备配置：Apple AirPods Pro 2 (USB-C)
   官方 GLB：Apple 产品页 AR 资产转换（含充电盒与双耳塞）
   位置映射：耳塞 z>1.5 分 x / 盒体下半 y<-1 / 其余盒盖
============================================================= */
import { makeDevice, anchorParts, composePostLoad } from './_kit/factory.js';
import { driver, battery } from './_kit/internals.js';

const builders = {
  'driver-r': (g)=> driver(g, .8),
  'driver-l': (g)=> driver(g, .8),
  'case-battery': (g)=> battery(g, { w:2.8, h:1.8, d:.5, label:'APPLE', capacity:'1.98 Wh', model:'A2965', rating:'3.81V' }),
};

export default makeDevice({
  id: 'airpods-pro',
  name: 'Apple AirPods Pro 2',
  en: 'A3047 · USB-C',
  category: '耳机',
  brand: 'APPLE',
  tagline: '入耳降噪标杆 · H2 芯片',
  description: 'AirPods Pro 2（USB-C）：H2 芯片驱动的入耳式降噪标杆——自适应通透、对话感知与 hearing aid 助听功能，MagSafe 充电盒内置扬声器与挂绳孔。官方产品页模型（Apple AR 资产转换），内构件为示意重建。',
  specs: [
    ['芯片','Apple H2'],['降噪','2× 主动降噪'],['驱动','定制高振幅单元'],
    ['音频','自适应通透 · 对话感知'],['电池','单次 6h · 连 30h'],['接口','USB-C · MagSafe'],
    ['特性','助听器功能 · 精确查找'],['防护','IP54'],
  ],
  accent: '#e8ebee',
  source: 'Apple 官网 AR 模型（USDZ 转制）',
  targetWidth: 7.5,
  glb: '/assets/airpods-pro.glb',
  /* 策展导览：双耳塞→双驱动器→仓体→仓电池→仓盖 */
  tour: ['bud-l','bud-r','driver-l','driver-r','case-bottom','case-battery','case-lid'],
  xrayShellIds: ['bud-l','bud-r','case-bottom','case-lid'],
  normalize: 'full',
  mapByPosition(name, p, rel){
    if(p.z > 1.5 && p.x > 0.3) return 'bud-r';
    if(p.z > 1.5 && p.x < -0.3) return 'bud-l';
    if(p.y < -1.0) return 'case-bottom';
    return 'case-lid';
  },
  realPartIds: ['bud-l','bud-r','case-bottom','case-lid'],
  builders,
  parts: [
    { id:'bud-l', zh:'左耳塞', en:'LEFT BUD', real:true,
      ex:[-1.6,.3,1.8], lo:[0,1.3,0], tag:'硅胶耳塞四尺寸',
      desc:'左耳塞：短柄设计内藏 H2、皮肤传感器与压力杆；出音管硅胶耳塞提供 XS-L 四种尺寸，配合自适应 EQ 逐耳测量耳形。',
      specs:[['芯片','H2'],['传感','皮肤检测'],['控制','按压杆'],['耳塞','XS/S/M/L']] },
    { id:'bud-r', zh:'右耳塞', en:'RIGHT BUD', real:true,
      ex:[1.6,.3,1.8], lo:[0,1.3,0], tag:'高振幅驱动单元',
      desc:'右耳塞与左耳对称：定制高振幅驱动单元配合 H2 的计算音频，低频下潜与降噪深度同时提升；向下麦克风检测耳内泄漏实时补偿。',
      specs:[['驱动','高振幅定制单元'],['降噪','2× H2 联算'],['麦克风','向下检测泄露']] },
    { id:'case-bottom', zh:'充电盒下壳', en:'CASE BODY', real:true,
      ex:[0,-.8,1.4], lo:[0,1.3,0], tag:'MagSafe · 挂绳孔',
      desc:'充电盒下壳：内置锂离子电池、扬声器（精确查找播放提示音）与 U2 芯片；侧边挂绳孔为全系首次，底面 USB-C / MagSafe 双充。',
      specs:[['电池','1.98 Wh'],['无线充','MagSafe/Qi'],['查找','U2 · 内置扬声器'],['挂绳','侧边开孔']] },
    { id:'case-lid', zh:'充电盒上盖', en:'CASE LID', real:true,
      ex:[0,.6,1.2], lo:[0,1.2,0], tag:'磁吸翻盖',
      desc:'充电盒上盖以钕磁铁开合，盖缘与下壳的断差形成单手可抠的开启槽；合盖即触发耳塞休眠。',
      specs:[['开合','钕磁吸合'],['配对','开盖弹窗'],['休眠','合盖断电']] },
    { id:'driver-r', zh:'右驱动单元', en:'CUSTOM DRIVER',
      ex:[3.0,-.8,2.4], lo:[0,1.1,0], tag:'高振幅 · 低失真',
      desc:'右耳塞内的定制驱动单元：高振幅设计配合 H2 放大器，输出更深的低频同时压低失真。',
      specs:[['类型','高振幅动圈'],['特性','低失真'],['芯片','H2 驱动']] },
    { id:'driver-l', zh:'左驱动单元', en:'CUSTOM DRIVER',
      ex:[-3.0,-.8,2.4], lo:[0,1.1,0], tag:'高振幅 · 低失真',
      desc:'左耳塞内的定制驱动单元，与右侧对称组成立体声，Vent 系统平衡耳压。',
      specs:[['类型','高振幅动圈'],['泄压','Vent 平衡耳压']] },
    { id:'case-battery', zh:'盒内电池', en:'CASE BATTERY',
      ex:[0,-2.8,2.0], lo:[0,1.1,0], tag:'1.98 Wh · 补电 4 次',
      desc:'充电盒内置 1.98 Wh 电池：可为双耳塞补电约 4 次，合计 30 小时续航；快充 5 分钟给耳塞补 1 小时。',
      specs:[['容量','1.98 Wh'],['补电','约 4 次'],['快充','5min → 1h'],['总续航','30 小时']] },
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
