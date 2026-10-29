/* =============================================================
   设备配置：Apple Mac mini (M4, 2024)
   官方 GLB：Apple 产品页 AR 资产（自研 USDZ→GLB 转换，网格匿名）
   位置映射：底部 y<1.2 = 脚垫 / z<-5.5 后置 IO / z>5.5 前置 / 其余机身
============================================================= */
import { makeDevice, anchorParts, composePostLoad } from './_kit/factory.js';
import { mainboard, fan, shield } from './_kit/internals.js';

const builders = {
  board: (g)=>{ mainboard(g, { w:8.6, h:8.6, soc:[-1.8,1.6], ram:[1.6,1.4], label:'APPLE M4', sub:'820-04173 · MAIN LOGIC BOARD', pcb:'#1a2a4a', smalls:18 }); g.rotation.x = -Math.PI/2; },
  fan:   (g)=>{ fan(g, 2.6, .5); g.rotation.x = -Math.PI/2; },
  psu:   (g)=>{ shield(g, 7.4, 4.6, .5); g.rotation.x = -Math.PI/2; },
};

export default makeDevice({
  id: 'mac-mini',
  name: 'Apple Mac mini (M4)',
  en: 'MAC MINI 2024',
  category: '台式机',
  brand: 'APPLE',
  tagline: '12.7cm 方寸 · M4 能效怪兽',
  description: 'Mac mini (M4)：仅 12.7cm 见方、5cm 薄的最小 Mac 主机，前置双 USB-C 与电源键首次移到正面，M4/M4 Pro 芯片以内置电源方案实现全新小型化。官方产品页模型（Apple AR 资产转换），内构件为示意重建。',
  specs: [
    ['芯片','Apple M4 / M4 Pro'],['内存','16-64GB 统一内存'],['存储','256GB-8TB SSD'],
    ['端口','雷雳 4 ×3/5 · HDMI · 网口'],['尺寸','12.7 × 12.7 × 5.0 cm'],['散热','单风扇 + 铜散热体'],
    ['电源','内置 155W/310W'],['无线','Wi-Fi 6E · 蓝牙 5.3'],
  ],
  accent: '#b8c2cc',
  source: 'Apple 官网 AR 模型（USDZ 转制）',
  targetWidth: 12.7,
  camDist: 1.12,
  glb: '/assets/mac-mini.glb',
  /* 策展导览：机身→前后 IO→主板→风扇→电源→底脚 */
  tour: ['body','io-front','io-rear','board','fan','psu','feet'],
  xrayShellIds: ['body'],
  normalize: 'full',
  mapByPosition(name, p, rel){
    if(p.y < 1.2) return 'feet';
    if(p.z < -5.5) return 'io-rear';
    if(p.z > 5.5) return 'io-front';
    return 'body';
  },
  realPartIds: ['body','feet','io-rear','io-front'],
  builders,
  parts: [
    { id:'body', zh:'铝金属机身', en:'ALUMINUM UNIBODY', real:true,
      ex:[0,.6,2.4], lo:[0,1.6,0], tag:'100% 再生铝 一体成型',
      desc:'一块回收再生铝经 CNC 铣削与喷砂阳极氧化成型的一体机身：顶部为logo浮雕圆盘，四周以精密出风口环绕，底部以卡扣连接天线板，无需任何可见螺丝。',
      specs:[['材质','100% 再生铝'],['工艺','一体 CNC + 喷砂'],['高度','5.0 cm'],['重量','0.67 kg (M4)']] },
    { id:'io-rear', zh:'后置接口区', en:'REAR I/O PANEL', real:true,
      ex:[0,.4,4.4], lo:[0,1.6,0], tag:'雷雳 4 · HDMI · 万兆',
      desc:'后置 I/O：M4 版 3× 雷雳 4（M4 Pro 为 5×，含前面板 2 口共 5 个）、HDMI（支持 8K）、2.5GbE/10GbE 网口与电源插口，接口区经 CNC 开孔与铝壳无缝衔接。',
      specs:[['雷雳','3/5 × 雷雳 4/5'],['视频','HDMI 8K'],['网络','2.5GbE / 10GbE 选配'],['音频','3.5mm（支持高阻耳机）']] },
    { id:'io-front', zh:'前置接口与电源键', en:'FRONT I/O & POWER', real:true,
      ex:[0,.2,3.6], lo:[0,1.5,0], tag:'正面双 USB-C（M4 Pro）',
      desc:'Mac mini 历史上首次把接口放到正面：M4 Pro 版前置 2× 雷雳 5 与电源键，插拔外置盘与耳机不必再绕到机后。',
      specs:[['USB-C','2× 雷雳 5（M4 Pro）'],['电源键','机身正面'],['指示','无状态灯（极简）']] },
    { id:'feet', zh:'底部脚垫', en:'FEET', real:true,
      ex:[0,-1.0,1.6], lo:[0,.9,0], tag:'环形减震脚垫',
      desc:'底部四角与环形脚垫：抬升机身形成进风间隙，冷风从底部经天线板格栅吸入，穿过主板散热体后从四周环形风口排出。',
      specs:[['结构','环形进风间隙'],['风道','底部进 → 四周出'],['材质','TPE 减震']] },
    { id:'board', zh:'逻辑主板', en:'MAIN LOGIC BOARD',
      ex:[0,4.6,-1.2], lo:[0,1.6,0], tag:'Apple M4 · 板载统一内存',
      desc:'方形主板居于机身正中：Apple M4/M4 Pro SoC 与统一内存、闪存全部板载封装，双面贴片；正反两面以屏蔽罩包裹，经排线与前后 I/O、天线板相连。',
      specs:[['SoC','M4 10核 / M4 Pro 14核'],['内存','16-64GB LPDDR5X'],['存储','256GB-8TB NVMe'],['布局','方形双面板']] },
    { id:'fan', zh:'散热风扇', en:'BLOWER FAN',
      ex:[1.8,6.4,-1.4], lo:[0,1.4,0], tag:'底部进风 · 单风扇',
      desc:'单枚大直径离心风扇贴于散热体上方：冷风自底部天线板格栅吸入，经风扇加压吹过 M4 芯片上方的铜合金散热柱，热风由机身四周环形风口排出，满载噪音仍低于 30 分贝。',
      specs:[['结构','离心式单风扇'],['风道','底进侧出'],['噪音','满载 < 30 dB'],['散热体','铜柱 + 均热板']] },
    { id:'psu', zh:'内置电源模块', en:'INTERNAL POWER SUPPLY',
      ex:[-1.9,5.6,-2.4], lo:[0,1.4,0], tag:'首次内置电源',
      desc:'Mac mini 首次把电源内置进机身（上代为外置适配器）：155W（M4）/ 310W（M4 Pro）开关电源板置于散热体旁，使桌面只剩一根电源线。',
      specs:[['功率','155W / 310W'],['变革','电源内置化'],['输入','100-240V 宽压']] },
  ],
  postLoad: composePostLoad(
    anchorParts({
      board: { ref:'body', dy:.2, dz:0 },
      fan:   { ref:'body', dy:1.1, dz:0 },
      psu:   { ref:'body', dy:1.1, dz:2.2 },
    }),
  ),
  tick: null,
});
