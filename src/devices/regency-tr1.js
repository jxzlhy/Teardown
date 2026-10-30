/* =============================================================
   设备配置：Regency TR-1（1954 · 史上第一台商用晶体管收音机）
   社区模型（Sketchfab · cyclonicninja69，CC-BY 4.0）：3 网格
   （Object_4 机身含面板拨盘 / Object_5 背盖电池仓 / Object_7 为
   5.3m 展示地面板——经引擎 excludeMeshes 排除，不计入设备）
   bbox 0.076×0.127×0.036（真机尺寸 127×76×32mm，Y 上）
   结构：机身（面板拨盘一体成型）→ 背盖电池仓
============================================================= */
import { makeDevice } from './_kit/factory.js';

export default makeDevice({
  id: 'regency-tr1',
  name: 'Regency TR-1 晶体管收音机',
  en: 'REGENCY TR-1',
  category: '影音',
  brand: 'REGENCY',
  tagline: '1954 · 晶体管把收音机装进口袋',
  description: 'Regency TR-1（1954）：史上第一台商用晶体管收音机——四颗锗晶体管替代了真空管，不用预热、功耗骤降，收音机第一次真正"便携"。它与本馆的 Admiral 电子管收音机相隔仅数年，却是两个技术时代的分界线。机身注塑一体成型，面板的拨盘与音量旋钮直接做在壳体上——晶体管时代的制造逻辑：少零件、薄壳体、低成本。电池仓开在背面，四颗笔芯电池供电。',
  specs: [
    ['发布', '1954 · Regency + I.D.E.A.'],
    ['晶体管', '4 颗锗晶体管'],
    ['供电', '22.5V 电池（笔芯电池组）'],
    ['机身', '注塑一体成型'],
    ['意义', '史上首台商用晶体管收音机'],
  ],
  accent: '#7a9e7e',
  source: '社区模型（Sketchfab）',
  modelCredit: 'Regency TR-1 Transistor Radio by cyclonicninja69 (Sketchfab, CC-BY 4.0)',
  modelSource: 'https://sketchfab.com/3d-models/vintage-portable-transistor-radioregency-tr-1-c01869269a8b4bd2a8a05b8162fe7a11',
  targetWidth: 9,
  normalize: 'full',
  frontAxis: '+z',
  glb: '/assets/regency-tr1.glb',
  excludeMeshes: ['Object_7'],
  mappingPrefix: {
    'Object_4': 'body',
    'Object_5': 'back-plate',
  },
  tour: ['body', 'back-plate'],
  realPartIds: ['body', 'back-plate'],
  parts: [
    { id: 'body', zh: '机身（面板拨盘一体）', en: 'BODY', real: true,
      ex: [0, 0.2, 0.8], lo: [0, 1.2, 0.4], tag: '注塑一体 · 晶体管时代的制造逻辑',
      desc: 'TR-1 的机身是注塑一体成型的范例：面板上的拨盘、音量旋钮与刻度直接做在壳体上——没有真空管收音机的木壳装配工序，注塑机一出就是整面。这正是晶体管带来的制造革命：元件小了、发热低了，壳体从"家具"变成了"消费品"。四颗锗晶体管藏在旋钮背后的电路板上。',
      specs: [['工艺', '注塑一体成型'], ['面板', '拨盘/旋钮/刻度直塑'], ['电路', '4 颗锗晶体管']] },
    { id: 'back-plate', zh: '背盖与电池仓', en: 'BACK PLATE', real: true,
      ex: [0, -0.3, -0.8], lo: [0, 1.1, -0.2], tag: '拆开背盖 · 便携性的代价与荣光',
      desc: '背盖之下是 TR-1 的电池仓：22.5V 电池组（数节笔芯电池串联）为锗晶体管供电——电压远高于真空管机，但电流消耗只有毫安级，一組电池能听数十小时。背盖与机身以卡扣结合，无螺丝：便携设备的"快换电池"设计从第一代晶体管机就开始了。',
      specs: [['电池', '22.5V 电池组'], ['续航', '数十小时（毫安级电流）'], ['结构', '卡扣免螺丝']] },
  ],
});
