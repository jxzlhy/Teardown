/* =============================================================
   设备配置：Apple iMac 24" (M4, 2024)
   官方 GLB：Apple 产品页 AR 资产转换（蓝色含键鼠，130 网格）
   位置映射：显示体 y>-8 / 支架 y<-14 & |x|<6 / 底座外扩 / 前方键鼠
   键鼠在资产里悬浮于半空（desk 平面与底座不重合），postLoad 落到地板
============================================================= */
import * as THREE from 'three';
import { makeDevice, anchorParts, composePostLoad } from './_kit/factory.js';
import { mainboard, fan, speakerBox } from './_kit/internals.js';

const builders = {
  board: (g)=> mainboard(g, { w:9.0, h:5.2, soc:[-1.8,.9], ram:[1.6,.7], label:'APPLE M4', sub:'820-04xxx · DISPLAY BOARD', pcb:'#1a2a4a', smalls:18 }),
  fan:   (g)=> fan(g, 1.6, .4),
  speaker: (g)=> speakerBox(g, 3.4, 1.1, .7),
};

export default makeDevice({
  id: 'imac',
  name: 'Apple iMac 24″ (M4)',
  en: 'IMAC 2024',
  category: '台式机',
  brand: 'APPLE',
  tagline: '11.5mm 一体机 · 七彩回归',
  description: 'iMac 24″：M4 芯片、11.5mm 纤薄机身与 4.5K Retina 显示屏的一体机，首次标配 12MP 居中人像摄像头与桌面彩色搭配的键鼠套装。官方产品页模型（蓝色含键盘鼠标，Apple AR 资产转换），内构件为示意重建。',
  specs: [
    ['芯片','Apple M4（10 核）'],['屏幕','24″ 4.5K Retina 4480×2520'],['亮度','500 nit · P3'],
    ['摄像头','12MP Center Stage'],['端口','雷雳 4 ×4'],['厚度','11.5 mm'],
    ['音频','六扬声器系统'],['配色','七色（本机：蓝色）'],
  ],
  accent: '#5b8dd9',
  source: 'Apple 官网 AR 模型（USDZ 转制）',
  targetWidth: 13.5,
  camDist: 1.3,
  glb: '/assets/imac.glb',
  /* 策展导览：屏体→下巴→主板→风扇→扬声器→支架→底座→键鼠 */
  tour: ['display-body','chin','board','fan','speaker','stand','foot','keyboard','mouse'],
  xrayShellIds: ['display-body'],
  normalize: 'full',
  frontAxis: '-z',      /* 资产屏幕朝 -Z（键盘鼠标在 -Z 前方） */
  mapByPosition(name, p, rel){
    if(p.z < -9.0 && p.y > -3.0){
      if(p.x > 9) return 'mouse';
      return 'keyboard';
    }
    if(p.y < -14) return Math.abs(p.x) > 6 ? 'foot' : 'stand';
    if(p.y < -7.5) return 'chin';
    return 'display-body';
  },
  realPartIds: ['display-body','chin','stand','foot','keyboard','mouse'],
  builders,
  parts: [
    { id:'display-body', zh:'显示体', en:'DISPLAY ENCLOSURE', real:true,
      ex:[0,.6,2.8], lo:[0,1.8,0], tag:'11.5mm · 4.5K Retina',
      desc:'24 英寸 4.5K Retina 显示体：11.5mm 厚的铝制外壳内塞下主板、双风扇与六扬声器；4480×2520 分辨率 P3 广色域 500 尼特，屏幕与边框以一体玻璃覆盖。',
      specs:[['屏幕','24″ 4480×2520'],['色域','P3 广色域 · 原彩'],['亮度','500 nit'],['厚度','11.5 mm']] },
    { id:'chin', zh:'下巴与摄像头', en:'CHIN & CAMERA', real:true,
      ex:[0,-.8,2.4], lo:[0,1.4,0], tag:'12MP Center Stage',
      desc:'下巴容纳的 12MP 摄像头首次支持 Center Stage 人物居中与桌面俯视视角（Desk View）；摄像头藏于下巴而非屏幕顶部，让上边框做到极致收窄。',
      specs:[['摄像头','12MP f/2.0'],['特性','Center Stage · Desk View'],['麦克风','录音室级三麦'],['位置','下巴顶部']] },
    { id:'stand', zh:'悬垂支架', en:'FRICTION STAND', real:true,
      ex:[0,-1.6,.8], lo:[0,1.4,0], tag:'阻力铰链 · 一指升降',
      desc:'铝制支架以摩擦阻尼铰链衔接显示体：一根手指即可推拉调整高度与俯仰角，任意位置悬停，无需锁紧机构。',
      specs:[['结构','摩擦阻尼铰链'],['调节','高度 + 俯仰'],['选配','Vomit 壁装 / VESA']] },
    { id:'foot', zh:'底座', en:'BASE', real:true,
      ex:[0,-2.4,.4], lo:[0,1.1,0], tag:'磁吸卡扣固定',
      desc:'平底座以磁吸卡扣与支架固定，拆装免工具；底面整圈防滑垫。',
      specs:[['固定','磁吸卡扣'],['接口','可选网口型号'],['防滑','环形胶垫']] },
    { id:'keyboard', zh:'妙控键盘', en:'MAGIC KEYBOARD', real:true,
      ex:[0,-.4,3.2], lo:[0,1.2,0], tag:'同色 · Touch ID',
      desc:'与机身同色的妙控键盘：剪刀脚结构、稳定键程，右上角 Touch ID 指纹与主机安全芯片配对；高配带数字小键盘。',
      specs:[['结构','剪刀脚'],['Touch ID','指纹解锁/支付'],['连接','蓝牙 + 线充'],['配色','与机身同色']] },
    { id:'mouse', zh:'妙控鼠标', en:'MAGIC MOUSE', real:true,
      ex:[2.2,-.4,3.0], lo:[0,1.2,0], tag:'多点触控表面',
      desc:'与机身同色的妙控鼠标：整面多点触控支持手势滑动，内置可充电锂电（Lightning/USB-C 口在底面）。',
      specs:[['表面','多点触控'],['手势','滚动/轻扫'],['充电','底面接口 2min=9h']] },
    { id:'board', zh:'逻辑主板', en:'MAIN LOGIC BOARD',
      ex:[0,3.8,-1.0], lo:[0,1.6,0], tag:'M4 · 板载内存',
      desc:'主板横向贴装在显示体上半部：M4 SoC 与统一内存、闪存板载，双面屏蔽；显示驱动与 T2 类安全芯片同板集成。',
      specs:[['SoC','M4 10 核'],['内存','16-32GB'],['存储','256GB-1TB'],['布局','双面板载']] },
    { id:'fan', zh:'散热风扇', en:'DUAL FANS',
      ex:[2.4,5.2,-1.6], lo:[0,1.3,0], tag:'双风扇底部出风',
      desc:'两枚极薄离心风扇藏于显示体内：冷风自下巴缝隙吸入，热风从底部与支架交汇处排出，几乎不可闻。',
      specs:[['结构','离心风扇 ×2'],['风道','下巴进 · 底部出'],['噪音','近静音']] },
    { id:'speaker', zh:'扬声器系统', en:'SIX-SPEAKER SYSTEM',
      ex:[-2.4,4.6,-1.4], lo:[0,1.3,0], tag:'六扬声器 · 杜比全景声',
      desc:'下巴两侧各藏三枚扬声器：两枚低音单元强制抵消振动，高音单元经导声管直达屏面，支持空间音频与录音室级三麦克风景音。',
      specs:[['配置','6 扬声器（含 2 低音）'],['特性','杜比全景声'],['录音','三麦录音室级']] },
  ],
  postLoad: composePostLoad(
    anchorParts({
      board:   { ref:'display-body', dy:1.6, dz:-.2 },
      fan:     { ref:'display-body', dy:1.6, dz:1.2 },
      speaker: { ref:'display-body', dy:1.8, dz:1.4 },
    }),
    /* 键鼠落到与底座同一水平面（资产里悬浮） */
    ({ partsById })=>{
      const foot = partsById['foot'];
      if(!foot) return;
      const floor = new THREE.Box3().setFromObject(foot.group).min.y;
      for(const pid of ['keyboard','mouse']){
        const p = partsById[pid];
        if(!p) continue;
        const bb = new THREE.Box3().setFromObject(p.group);
        if(bb.isEmpty()) continue;
        const dy = floor - bb.min.y;
        p.base.y += dy;
        p.group.position.y += dy;
      }
    },
  ),
  tick: null,
});
