/* =============================================================
   设备配置：Nintendo Switch OLED（HAC-001-01）
   模型：SceneView 开源资产（CC-BY 4.0 · rtql8d 原作，含屏幕贴图）
   位置映射：|x|>0.075 左右 Joy-Con / 其余主机
============================================================= */
import { makeDevice, anchorParts, composePostLoad } from './_kit/factory.js';
import { mainboard, fan, battery } from './_kit/internals.js';

const builders = {
  board:   (g)=> mainboard(g, { w:5.2, h:3.0, soc:[-1.1,.5], ram:[1.0,.7], label:'NVIDIA TEGRA X1', sub:'HAC-001 · BOARD', pcb:'#1a2a3a', smalls:12 }),
  fan:     (g)=> fan(g, 1.1, .35),
  battery: (g)=> battery(g, { w:4.6, h:2.8, d:.4, label:'NINTENDO', capacity:'4310 mAh', model:'HAC-003', rating:'3.7V' }),
};

export default makeDevice({
  id: 'switch-oled',
  era: 2021,
  name: 'Nintendo Switch OLED',
  en: 'HAC-001(-01)',
  category: '游戏机',
  brand: 'NINTENDO',
  tagline: '7″ OLED · 掌机主机二合一',
  description: 'Nintendo Switch OLED：7 英寸 OLED 掌机屏幕、加宽支架与 64GB 存储——任天堂最畅销的混合形态主机。模型来自开源社区（SceneView 资产库，CC-BY 4.0 · 原作者 rtql8d），内构件为示意重建。',
  specs: [
    ['屏幕','7″ OLED 1280×720'],['存储','64GB + microSD'],['电池','4310 mAh · 4.5-9h'],
    ['芯片','NVIDIA Tegra X1 定制'],['底座输出','1080p HDMI'],['Joy-Con','HD 震动 · IR · 动态捕捉'],
    ['重量','420 g（含手柄）'],['发布','2021 年 10 月'],
  ],
  accent: '#e60012',
  source: 'SceneView 社区模型（CC-BY 4.0 · rtql8d）',
  modelCredit: 'Nintendo Switch OLED model by rtql8d (CC-BY 4.0), via SceneView',
  targetWidth: 13.0,
  camDist: 1.1,
  glb: '/assets/switch-oled.glb',
  tour: ['console','joycon-l','joycon-r','board','fan','battery'],
  xrayShellIds: ['console','joycon-l','joycon-r'],
  normalize: 'full',
  mapByPosition(name, p, rel){
    if(p.x < -0.075) return 'joycon-l';
    if(p.x > 0.075) return 'joycon-r';
    return 'console';
  },
  realPartIds: ['console','joycon-l','joycon-r'],
  builders,
  parts: [
    { id:'console', zh:'主机本体', en:'CONSOLE', real:true,
      ex:[0,.4,2.4], lo:[0,1.6,0], tag:'7″ OLED · 平板形态',
      desc:'Switch 主机本体：7 英寸 OLED（较上代加宽 0.4 英寸、边框收窄）+ 加宽的背面支架与升级扬声器；Tegra 定制芯片掌机模式 720p、底座输出 1080p。',
      specs:[['屏幕','7″ OLED 720p'],['支架','加宽可调'],['扬声器','立体声升级'],['接口','USB-C · 3.5mm']] },
    { id:'joycon-l', zh:'左 Joy-Con', en:'JOY-CON (L)', real:true,
      ex:[-1.5,.3,1.8], lo:[0,1.4,0], tag:'HD 震动 · SL/SR',
      desc:'左 Joy-Con：摇杆居顶位、四方向按键，内置 HD 震动线性马达与动态捕捉 IR；侧滑轨道以卡扣锁紧主机，可独立无线连接。',
      specs:[['摇杆','顶部布局'],['震动','HD 线性马达'],['捕捉','IR 红外'],['续航','约 20h']] },
    { id:'joycon-r', zh:'右 Joy-Con', en:'JOY-CON (R)', real:true,
      ex:[1.5,.3,1.8], lo:[0,1.4,0], tag:'NFC · 动态捕捉',
      desc:'右 Joy-Con：摇杆居下位、ABXY 按键，集成 NFC（amiibo 读取）、HD 震动与动态捕捉相机；顶部 SN 色彩指示灯。',
      specs:[['NFC','amiibo 读取'],['指示','SN 灯 ×4'],['震动','HD 线性马达'],['抓握','可配握把']] },
    { id:'board', zh:'主板', en:'MAIN BOARD',
      ex:[0,2.8,-1.0], lo:[0,1.5,0], tag:'Tegra X1 定制',
      desc:'主机中央的定制 Tegra X1 板：4× Cortex-A57 + Maxwell GPU（掌机降频），4GB LPDDR4X 与 64GB eMMC 板载；散热经均热板连至顶部出风口。',
      specs:[['SoC','Tegra X1 定制 16nm'],['内存','4GB LPDDR4X'],['存储','64GB eMMC'],['输出','掌机 720p / 底座 1080p']] },
    { id:'fan', zh:'散热风扇', en:'COOLING FAN',
      ex:[2.4,3.6,-1.0], lo:[0,1.2,0], tag:'顶部出风离心扇',
      desc:'主机顶部的离心风扇：经均热板把 Tegra 的热量带到顶部栅格排出，掌机满载时风扇声仍轻微。',
      specs:[['类型','离心风扇'],['风道','底进 · 顶出'],['噪音','轻微']] },
    { id:'battery', zh:'电池', en:'BATTERY 4310 mAh',
      ex:[0,-3.2,1.0], lo:[0,1.4,0], tag:'4310 mAh · 4.5-9h',
      desc:'4310 mAh 锂聚合物电池占据主机下半部：OLED 屏的能效让续航达到 4.5-9 小时（依游戏负载），待机 3-18 小时。',
      specs:[['容量','4310 mAh'],['续航','4.5-9h'],['充电','USB-C PD'],['待机','3-18h']] },
  ],
  postLoad: composePostLoad(
    anchorParts({
      board:   { ref:'console', dy:.8, dz:.1 },
      fan:     { ref:'console', dy:1.0, dz:.1 },
      battery: { ref:'console', dy:-.9, dz:.1 },
    }),
  ),
  tick: null,
});
