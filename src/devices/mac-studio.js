/* =============================================================
   设备配置：Apple Mac Studio (M4 Max / M3 Ultra, 2025)
   官方 GLB：Apple 产品页 AR 资产转换，位置聚类映射
============================================================= */
import { makeDevice, anchorParts, composePostLoad } from './_kit/factory.js';
import { mainboard, fan } from './_kit/internals.js';

const builders = {
  board: (g)=>{ mainboard(g, { w:12.4, h:12.4, soc:[-2.6,2.2], ram:[2.3,1.9], label:'APPLE M4 MAX', sub:'820-0xxxx · ULTRA DENSITY BOARD', pcb:'#1a2a4a', smalls:22 }); g.rotation.x = -Math.PI/2; },
  'fan-a': (g)=>{ fan(g, 3.0, .55); g.rotation.x = -Math.PI/2; },
  'fan-b': (g)=>{ fan(g, 3.0, .55); g.rotation.x = -Math.PI/2; },
};

export default makeDevice({
  id: 'mac-studio',
  name: 'Apple Mac Studio',
  en: 'MAC STUDIO 2025',
  category: '台式机',
  brand: 'APPLE',
  tagline: '工作站级性能 · 塔式散热',
  description: 'Mac Studio (2025)：M4 Max 与 M3 Ultra 双芯方案，19.7cm 见方的铝机身内塞进塔式散热系统——双离心风扇从底部吸入冷风，流经完整覆盖主板的巨型散热体后从背面蜂窝风口排出。官方产品页模型（Apple AR 资产转换），内构件为示意重建。',
  specs: [
    ['芯片','M4 Max / M3 Ultra'],['内存','32-512GB 统一内存（Ultra）'],['存储','512GB-16TB SSD'],
    ['端口','雷雳 5 ×10 · SDXC ×2'],['尺寸','19.7 × 19.7 × 9.5 cm'],['散热','双风扇塔式'],
    ['算力','Ultra Fusion 双芯互联'],['网络','10GbE · Wi-Fi 6E'],
  ],
  accent: '#c8ccd2',
  source: 'Apple 官网 AR 模型（USDZ 转制）',
  targetWidth: 12.5,
  camDist: 1.25,
  glb: '/assets/mac-studio.glb',
  normalize: 'full',
  mapByPosition(name, p, rel){
    if(p.y < 1.2) return 'base';
    if(p.z < -9.0) return 'io-rear';
    if(p.y > 4.6) return 'top-plate';
    return 'body';
  },
  realPartIds: ['body','base','io-rear','top-plate'],
  builders,
  parts: [
    { id:'body', zh:'铝金属机身', en:'ALUMINUM CHASSIS', real:true,
      ex:[0,.6,2.6], lo:[0,1.8,0], tag:'一体成型 · 精密蜂窝',
      desc:'铝挤+CNC 一体机身：底面与背面的蜂窝出风孔以数千个微孔阵列保证风量与防尘的平衡，边缘倒角与 Mac mini 同语言。机身高度 9.5cm，内部是完整塔式散热架构。',
      specs:[['材质','回收再生铝'],['尺寸','19.7 × 19.7 × 9.5 cm'],['重量','2.7-3.6 kg'],['工艺','铝挤 + CNC']] },
    { id:'io-rear', zh:'后置接口区', en:'REAR I/O PANEL', real:true,
      ex:[0,.4,4.6], lo:[0,1.8,0], tag:'10 × 雷雳 5',
      desc:'后置 4-6× 雷雳 5、10GbE 网口、HDMI、电源口，加上 SDXC 卡槽与前面板接口，全机最多 10 条雷雳通道——外接 8 台显示器不成问题。',
      specs:[['雷雳','后置 4-6 + 前置 4'],['视频','最高 8 台显示器'],['卡槽','SDXC ×2（UHS-II）'],['网络','10GbE']] },
    { id:'base', zh:'底座进风板', en:'INTAKE BASE', real:true,
      ex:[0,-1.2,1.6], lo:[0,1.0,0], tag:'蜂窝进风 · 可拆',
      desc:'底部蜂窝进风板：圆形蜂窝阵列把冷风均匀导入双风扇，逆时针旋开即可拆下，是进入内部的唯一通道。',
      specs:[['结构','旋开式蜂窝板'],['风量','双风扇进风'],['材质','阳极铝']] },
    { id:'top-plate', zh:'顶盖板', en:'TOP PLATE', real:true,
      ex:[0,1.4,2.0], lo:[0,1.6,0], tag:'压印 Apple 徽标',
      desc:'顶盖以激光压印 Apple 徽标，卡扣固定于机身；取下后即见主板散热体顶部。',
      specs:[['固定','隐藏卡扣'],['工艺','激光压印徽标']] },
    { id:'board', zh:'逻辑主板', en:'MAIN LOGIC BOARD',
      ex:[0,4.8,-1.0], lo:[0,1.8,0], tag:'M4 Max / M3 Ultra',
      desc:'占据机身绝大部分面积的方形主板：M4 Max 或 M3 Ultra SoC、最高 512GB 统一内存（M3 Ultra 32 通道）与最高 16TB 闪存全部板载，是 Apple Silicon 集成度的代表之作。',
      specs:[['SoC','M4 Max 16核 / M3 Ultra 32核'],['内存','32-512GB'],['存储','512GB-16TB'],['互联','Ultra Fusion 819GB/s']] },
    { id:'fan-a', zh:'风扇 A（进风）', en:'INTAKE FAN',
      ex:[2.6,6.8,-2.0], lo:[0,1.4,0], tag:'底部进风风扇',
      desc:'两枚离心风扇之一：位于散热体正下方，从底座蜂窝板吸入冷风并加压送入散热柱阵列。',
      specs:[['类型','离心风扇'],['位置','散热体下方'],['转速','自适应调速']] },
    { id:'fan-b', zh:'风扇 B（进风）', en:'INTAKE FAN 2',
      ex:[-2.8,6.2,-2.0], lo:[0,1.4,0], tag:'底部进风风扇',
      desc:'第二枚离心风扇，与风扇 A 对角布置，形成均匀的底部进风场，满载时整机仍保持低噪音。',
      specs:[['类型','离心风扇'],['布置','对角双扇'],['噪音','满载仍低噪']] },
  ],
  postLoad: composePostLoad(
    anchorParts({
      board:  { ref:'body', dy:.1, dz:0 },
      'fan-a': { ref:'body', dy:1.4, dz:1.6 },
      'fan-b': { ref:'body', dy:1.4, dz:-1.6 },
    }),
  ),
  tick: null,
});
