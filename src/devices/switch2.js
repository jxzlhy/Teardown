/* =============================================================
   设备配置：Nintendo Switch 2（HAC-002）
   模型：NAIT Studio "Nintendo Switch 2 Realistic"（Sketchfab，CC-BY 4.0）
   资产平放（屏幕朝 +Y），长轴 Z；Joy-Con 2 磁吸在 ±X 侧
============================================================= */
import { makeDevice, anchorParts, composePostLoad } from './_kit/factory.js';
import { mainboard, fan, battery } from './_kit/internals.js';

const builders = {
  board:   (g)=>{ mainboard(g, { w:5.6, h:3.4, soc:[-1.2,.6], ram:[1.1,.8], label:'NVIDIA T239', sub:'HAC-002 · BOARD REV 1.0', pcb:'#1a2a3a', smalls:14 }); g.rotation.x = -Math.PI/2; },
  fan:     (g)=>{ fan(g, 1.2, .38); g.rotation.x = -Math.PI/2; },
  battery: (g)=>{ battery(g, { w:4.6, h:2.6, d:.4, label:'NINTENDO', capacity:'5222 mAh', model:'HAC-004', rating:'3.7V' }); g.rotation.x = -Math.PI/2; },
};

export default makeDevice({
  id: 'switch-2',
  name: 'Nintendo Switch 2',
  en: 'HAC-002',
  category: '游戏机',
  brand: 'NINTENDO',
  tagline: '7.9″ 1080p · 磁吸 Joy-Con 2',
  description: 'Nintendo Switch 2：7.9 英寸 1080p/120Hz LCD、磁吸 Joy-Con 2（支持鼠标模式）与 NVIDIA 定制 T239 芯片，底座输出 4K/60，双风扇散热首次进入 Switch 形态。模型来自 NAIT Studio（Sketchfab，CC-BY 4.0），内构件为示意重建。',
  specs: [
    ['屏幕','7.9″ LCD 1920×1080 · 120Hz VRR'],['芯片','NVIDIA T239 定制'],['内存','12GB LPDDR5X'],
    ['存储','256GB + microSD Express'],['电池','5222 mAh · 2.5-6.5h'],['底座输出','4K/60 · 1440p/120'],
    ['Joy-Con 2','磁吸 · 鼠标模式 · C 键'],['重量','534 g（含手柄）'],
  ],
  accent: '#e60012',
  source: 'NAIT Studio（Sketchfab · CC-BY 4.0）',
  modelCredit: 'Nintendo Switch 2 Realistic by NAIT Studio (CC-BY 4.0), via Sketchfab',
  targetWidth: 13.0,
  camDist: 1.15,
  glb: '/assets/switch-2.glb',
  normalize: 'full',
  mapByPosition(name, p, rel){
    /* 资产平放：主机宽度沿 Z，Joy-Con 2 磁吸在 Z 两端 */
    if(p.z < -0.38) return 'joycon-l';
    if(p.z > 0.38) return 'joycon-r';
    return 'console';
  },
  realPartIds: ['console','joycon-l','joycon-r'],
  xrayShellIds: ['console','joycon-l','joycon-r'],
  tour: ['console','joycon-l','joycon-r','board','fan','battery'],
  builders,
  parts: [
    { id:'console', zh:'主机本体', en:'CONSOLE', real:true,
      ex:[0,.4,2.4], lo:[0,1.6,0], tag:'7.9″ LCD · 0.1 秒唤醒',
      desc:'Switch 2 主机：7.9 英寸 1080p LCD 支撑 120Hz VRR 与 HDR10，边框较上代收窄；顶部集成散热出风格栅与游戏卡槽，C 键直通 GameChat 语音。屏幕支持磁吸笔输入（另售）。',
      specs:[['屏幕','7.9″ 1920×1080'],['刷新','120Hz VRR · HDR10'],['亮度','较上代提升'],['支架','加宽可调']] },
    { id:'joycon-l', zh:'左 Joy-Con 2', en:'JOY-CON 2 (L)', real:true,
      ex:[2.0,1.3,.6], lo:[0,1.4,0], tag:'磁吸 · 鼠标模式',
      desc:'左 Joy-Con 2：磁吸滑轨取代卡扣，拆装零按压；摇杆增大并回中位，SL/SR 按键加大。平放滑动即可进入鼠标模式——桌面就是你的光学鼠标垫。',
      specs:[['连接','磁吸滑轨'],['摇杆','加大版'],['鼠标模式','光学传感'],['扳机','新增侧键']] },
    { id:'joycon-r', zh:'右 Joy-Con 2', en:'JOY-CON 2 (R)', real:true,
      ex:[-2.0,-1.3,.6], lo:[0,1.4,0], tag:'磁吸 · C 键 · NFC',
      desc:'右 Joy-Con 2：同样磁吸连接，新增 C 键（GameChat 一键通话）、NFC 读取区与 HD 震动 2；内置光学传感器支撑鼠标模式。',
      specs:[['C 键','GameChat'],['NFC','amiibo'],['震动','HD 震动 2'],['连接','磁吸']] },
    { id:'board', zh:'主板', en:'MAIN BOARD',
      ex:[0,2.8,-.8], lo:[0,1.5,0], tag:'NVIDIA T239 · 12GB',
      desc:'定制 NVIDIA T239 芯片：8 核 Cortex-A78C 搭配 Ampere 架构 GPU（1536 CUDA 核），支持 DLSS 超分与光线追踪；12GB LPDDR5X 与 256GB 存储板载。',
      specs:[['SoC','T239（8 核 A78C）'],['GPU','Ampere · 1536 CUDA'],['特性','DLSS · 光线追踪'],['内存','12GB LPDDR5X']] },
    { id:'fan', zh:'散热风扇', en:'DUAL FANS',
      ex:[2.2,3.4,-.8], lo:[0,1.2,0], tag:'双风扇 · 顶部出风',
      desc:'Switch 形态首次塞进双风扇：底面进风、顶缘格栅出风，掌机模式高负载（如 4K 底座输出转屏）也能压住 T239 的功耗。',
      specs:[['结构','离心风扇 ×2'],['风道','底进顶出'],['噪音','自适应调速']] },
    { id:'battery', zh:'电池', en:'BATTERY 5222 mAh',
      ex:[0,-2.8,.8], lo:[0,1.4,0], tag:'5222 mAh · 2.5-6.5h',
      desc:'5222 mAh 锂离子电池（较上代 +20%）：掌机 1080p/60 中负载约 3.5 小时，轻度独立游戏可到 6.5 小时；支持 PD 快充与底座直供。',
      specs:[['容量','5222 mAh'],['续航','2.5-6.5h'],['充电','USB-C PD 45W']] },
  ],
  postLoad: composePostLoad(
    anchorParts({
      board:   { ref:'console', dy:.06, dz:.2 },
      fan:     { ref:'console', dy:.12, dz:.2 },
      battery: { ref:'console', dy:-.05, dz:.2 },
    }),
  ),
  tick: null,
});
