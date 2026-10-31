/* =============================================================
   设备配置：Apple iPad Pro 13" (M4, 2024)
   官方 GLB：Apple 产品页 AR 资产转换（含 Apple Pencil Pro，94 网格）
   位置映射：笔簇（右上斜置）/ 主平板 slab
============================================================= */
import { makeDevice, anchorParts, composePostLoad } from './_kit/factory.js';
import { mainboard, battery, cameraModule } from './_kit/internals.js';

const builders = {
  board: (g)=> mainboard(g, { w:9.2, h:5.0, soc:[-1.8,.8], ram:[1.6,.6], label:'APPLE M4', sub:'820-04xxx · TABLET BOARD', pcb:'#1a2a4a', smalls:18 }),
  battery: (g)=>{ battery(g, { w:8.6, h:5.4, d:.45, label:'APPLE', capacity:'38.99 Wh', model:'A3174', rating:'7.55V' }); g.rotation.x = -Math.PI/2; },
  camera: (g)=> cameraModule(g, .62, .8),
};

export default makeDevice({
  id: 'ipad-pro',
  era: 2024,
  name: 'Apple iPad Pro 13″ (M4)',
  en: 'IPAD PRO M4',
  category: '平板',
  brand: 'APPLE',
  tagline: '5.1mm 史上最薄 iPad',
  description: 'iPad Pro 13″ (M4)：5.1mm 机身、串联 OLED（Tandem OLED）与 M4 芯片——Apple 迄今最薄的产品形态。官方产品页模型（含妙控键盘，Apple AR 资产转换），内构件为示意重建。',
  specs: [
    ['芯片','Apple M4（最高 16 核）'],['屏幕','13″ Tandem OLED 2752×2064'],['厚度','5.1 mm（最薄 Apple 设备）'],
    ['电池','38.99 Wh'],['摄像头','12MP + LiDAR'],['配件','Apple Pencil Pro · 妙控键盘'],
    ['端口','雷雳 / USB-C'],['重量','579 g（13″）'],
  ],
  accent: '#9aa3ad',
  source: 'Apple 官网 AR 模型（USDZ 转制）',
  targetWidth: 12.0,
  camDist: 1.15,
  glb: '/assets/ipad-pro.glb',
  /* 策展导览：屏→机身→妙控键盘→板→电池→影像 */
  tour: ['display-front','body','keyboard-base','board','battery','camera'],
  xrayShellIds: ['display-front','body','keyboard-base'],
  normalize: 'full',
  mapByPosition(name, p, rel){
    /* 主体为中央平板 slab；前侧低区为妙控键盘底座 */
    if(p.z > 10 && p.y < 6) return 'keyboard-base';
    if(p.z < -4 && p.y > 2) return 'display-front';
    return 'body';
  },
  realPartIds: ['body','display-front','keyboard-base'],
  builders,
  parts: [
    { id:'body', zh:'铝制机身', en:'ALUMINUM BODY', real:true,
      ex:[0,.4,2.4], lo:[0,1.6,0], tag:'5.1mm 一体成型',
      desc:'5.1mm 厚的一体铝机身：为塞下 Tandem OLED 与主板，机身纵向重新布板——电池横置、主板窄条化；后置相机岛以凸台收边，横置使用时摄像头居顶。',
      specs:[['厚度','5.1 mm（13″）'],['重量','579 g'],['材质','100% 再生铝'],['相机','横置凸台']] },
    { id:'display-front', zh:'Tandem OLED 屏幕', en:'TANDEM OLED DISPLAY', real:true,
      ex:[0,.6,2.0], lo:[0,1.7,0], tag:'双层串联 OLED',
      desc:'13 英寸串联 OLED：两层 OLED 发光层叠加经光学层合一——亮度翻倍（1000nit 全屏）而功耗更低，ProMotion 10-120Hz 与纳米纹理选配；全球最先进平板屏。',
      specs:[['技术','Tandem 串联 OLED'],['分辨率','2752×2064'],['亮度','1000nit 全屏'],['刷新','10-120Hz ProMotion']] },
    { id:'keyboard-base', zh:'妙控键盘', en:'MAGIC KEYBOARD', real:true,
      ex:[1.6,-1.2,1.8], lo:[0,1.3,0], tag:'悬浮铰链 · 触控板',
      desc:'官方姿势中的妙控键盘：悬浮式铰链让 iPad 可在 90°-120° 间无级调节，剪刀脚键盘与玻璃触控板提供类笔记本输入体验；USB-C 直通供电，磁吸充电轨道兼容 Apple Pencil Pro。',
      specs:[['结构','悬浮铰链底座'],['键盘','剪刀脚背光'],['触控板','玻璃全域'],['直通','USB-C 供电']] },
    { id:'board', zh:'逻辑主板', en:'MAIN LOGIC BOARD',
      ex:[0,3.4,-.8], lo:[0,1.5,0], tag:'M4 · 窄条布板',
      desc:'窄条主板贴装于机身一侧：M4（3nm，最高 16 核 CPU / 40 核 GPU）与统一内存板载，为 5.1mm 机身重新设计的紧凑布板。',
      specs:[['SoC','M4 3nm'],['内存','8/16GB'],['存储','256GB-2TB'],['布板','窄条化设计']] },
    { id:'battery', zh:'电池', en:'BATTERY 38.99 Wh',
      ex:[0,-3.6,-.8], lo:[0,1.5,0], tag:'38.99 Wh · 10 小时',
      desc:'38.99 Wh 电池横向铺满机身中段：Tandem OLED 的能效 + M4 能效使续航保持 10 小时 Wi-Fi 浏览。',
      specs:[['容量','38.99 Wh'],['续航','10h 浏览'],['充电','USB-C 快充']] },
    { id:'camera', zh:'后置相机模组', en:'REAR CAMERA MODULE',
      ex:[2.4,3.8,-1.0], lo:[0,1.3,0], tag:'12MP + LiDAR',
      desc:'12MP 广角与 LiDAR 激光雷达横置于背板长边凸台：横向握持时位于顶部，支持 ProRes 视频与空间扫描。',
      specs:[['主摄','12MP f/1.8'],['深度','LiDAR 扫描仪'],['视频','4K ProRes'],['位置','长边凸台']] },
  ],
  postLoad: composePostLoad(
    anchorParts({
      board:   { ref:'body', dy:1.4, dz:.4 },
      battery: { ref:'body', dy:-1.0, dz:.4 },
      camera:  { ref:'body', dx:-3.4, dy:2.2, dz:.2 },
    }),
  ),
  tick: null,
});
