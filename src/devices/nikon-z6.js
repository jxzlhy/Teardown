/* =============================================================
   设备配置：Nikon Z6 (2018)
   社区 GLB（Sketchfab）：仅 7 网格但约 50 万三角面，1 材质 LOD0 贴图模型
   原生 bbox x[-16.87,13.09] y[-3.49,13.45] z[0.86,6.02]（≈cm），镜头朝 -x
   frontAxis '-x' 旋转后：世界 = (原生z, 原生y, -原生x)，镜头落在 p.z≈+9
   聚类：p.z 分镜头/卡口环，再按 rel.y/rel.z/rel.x 分顶盖/背面/手柄/机身
============================================================= */
import { makeDevice, anchorParts, composePostLoad } from './_kit/factory.js';
import { mainboard, battery } from './_kit/internals.js';

const builders = {
  battery: (g)=> battery(g, { w:1.1, h:1.7, d:0.55, label:'NIKON', capacity:'1900 mAh', model:'EN-EL15b', rating:'7.0V' }),
  board:   (g)=> mainboard(g, { w:2.4, h:1.7, soc:[-0.7,.35], ram:[0.7,.4], label:'NIKON Z6', sub:'EXPEED 6 · MAIN PCB', pcb:'#1a2a4a', smalls:12 }),
};

export default makeDevice({
  id: 'nikon-z6',
  era: 2018,
  name: 'Nikon Z6',
  en: 'NIKON Z6 MIRRORLESS',
  category: '相机',
  brand: 'NIKON',
  tagline: 'Z 口开山之作 · 24.5MP 五轴防抖',
  description: 'Nikon Z6：2018 年 8 月与 Z7 同场发布的 Z 卡口开山之作，16mm 超短法兰距 + 55mm 大口径让法兰后置世代从这台机身开始。24.5MP 全画幅 BSI CMOS 配 EXPEED 6，机身五轴防抖最高 5 档，273 点焦平面相位检测覆盖约 90% 画面。模型为社区 LOD0 高模（仅 7 网格、约 50 万三角面、单材质贴图），按网格中心坐标聚类拆分，电池与主板为示意重建。',
  specs: [
    ['发布','2018 年 8 月 23 日'],['传感器','24.5MP 全画幅 BSI CMOS'],
    ['处理器','EXPEED 6'],['防抖','机身五轴 VR · 约 5 档'],
    ['对焦','273 点焦平面相位检测'],['连拍','12fps（AF-C 全程跟踪）'],
    ['屏幕','3.2″ 约 236 万点翻折触屏'],['取景器','0.80× · 约 369 万点 OLED'],
    ['电池','EN-EL15b'],['存储','单 XQD / CFexpress 槽'],
    ['卡口','Z 卡口 · φ55mm · 16mm 法兰距'],['重量','约 585g（含电池与存储卡）'],
  ],
  accent: '#d94f3d',
  source: '社区模型（Sketchfab）· 内构件为示意重建',
  modelCredit: 'NIKON Z6 with NIKKOR 24-70 f4 by Metazeon (Sketchfab, CC-BY 4.0)',
  modelSource: 'https://sketchfab.com/3d-models/nikon-z6-with-nikkor-24-70-f4-93775837f09141fd91bf1b41a0c0953e',
  targetWidth: 9,
  glb: '/assets/nikon-z6.glb',
  /* 策展导览：镜头→卡口环→机身→主板→电池→顶盖→握持→背盖 */
  tour: ['lens','mount-ring','body','board','battery','top-plate','grip','back'],
  xrayShellIds: ['body','back','top-plate','grip'],
  normalize: 'full',
  frontAxis: '-x',
  mapByPosition(name, p, rel){
    /* frontAxis '-x' 旋转后 p = (原生z, 原生y, -原生x)：
       镜头网格（原生 x≈-9）落在 p.z≈+9，卡口环 0<p.z<5，机身 p.z<0 */
    if(p.z > 5) return 'lens';
    if(p.z > 0.2) return 'mount-ring';
    if(rel.y > 0.75) return 'top-plate';
    if(rel.z < 0.15) return 'back';
    if(rel.x < 0.38) return 'grip';
    return 'body';
  },
  realPartIds: ['lens', 'mount-ring', 'body', 'grip', 'top-plate', 'back'],
  builders,
  parts: [
    { id:'lens', zh:'Z 24-70mm f/4 S', en:'Z 24-70 f/4 S', real:true,
      ex:[0,0,3.0], lo:[0,1.3,0], tag:'S-Line 标头 · 约 8 万三角面',
      desc:'套机镜头 Z 24-70mm f/4 S（网格约 8.1 万三角面）：8 组 11 片结构，两枚 ED 低色散与三枚非球面镜片，纳米结晶涂层压鬼影；对焦环/变焦环内走线，67mm 滤镜口径在 f/4 变焦头里已算克制。',
      specs:[['规格','24-70mm f/4 S'],['结构','8 组 11 片 · 2 ED + 3 非球面'],['滤镜','φ67mm'],['遮光罩','花瓣式（本模型含罩）']] },
    { id:'mount-ring', zh:'Z 卡口环', en:'Z MOUNT', real:true,
      ex:[0,0,1.7], lo:[0,1.2,0], tag:'φ55mm · 16mm 法兰距',
      desc:'Z 卡口卡环：55mm 大口径加 16mm 法兰距是 Z 系统的灵魂——更垂直的入射光线喂饱边缘画质，也留出了法兰适配环转接 F 镜头的余地；卡环上的 11 触点负责电磁光圈与镜头通信。',
      specs:[['口径','φ55 mm'],['法兰距','16 mm'],['触点','11 点通信'],['转接','FTZ 法兰适配 F 镜头']] },
    { id:'body', zh:'机身主体', en:'MAGNESIUM BODY', real:true,
      ex:[0,-0.3,-1.4], lo:[0,1.2,0], tag:'深笼镁合金 · 全天候密封',
      desc:'Z6 机身骨架：镁合金压铸深笼结构外包蒙皮，接缝密封达到与 D850 同级防尘防滴；五轴防抖机构就悬在卡口正后方，传感器组件可独立浮动，拆下镜头能看到 IBIS 上的传感器居中静止。',
      specs:[['结构','镁合金深笼'],['防抖','5 轴 IBIS · 约 5 档'],['密封','防尘防滴'],['重量','约 585g 整机']] },
    { id:'grip', zh:'手柄', en:'GRIP', real:true,
      ex:[-2.4,0,0.6], lo:[0,1.1,0], tag:'一体握持 · EN-EL15b 仓',
      desc:'右侧一体手柄：曲面握位容纳 EN-EL15b 电池（仓门在底部），快门、前后双指令盘与红圈包围的手柄轮廓延续尼康单反的人机工学；深度虽不及 D 系列旗舰，但握持面积已向单反看齐。',
      specs:[['电池仓','EN-EL15b（底部换装）'],['指令盘','前后双拨轮'],['蒙皮','橡胶饰皮'],['可选','MB-N10 电池匣']] },
    { id:'top-plate', zh:'顶盖', en:'TOP PLATE', real:true,
      ex:[0,2.2,0], lo:[0,1.2,0], tag:'无肩屏极简顶盖',
      desc:'极简顶盖：Z6 没有肩屏，顶面只保留模式盘、曝光补偿盘、热靴与录制键——参数全部交给背屏与大号 EVF；热靴带防尘盖，快门键依旧保留尼康式前倾手感。',
      specs:[['布局','无肩屏 · 双盘'],['热靴','ISO 518'],['录制','独立 REC 键'],['取景器','0.80× 369 万点 EVF 顶部']] },
    { id:'back', zh:'背面（翻折屏）', en:'REAR PANEL', real:true,
      ex:[0,-0.1,-2.6], lo:[0,1.3,0], tag:'3.2″ 翻折触屏 · 拇指区摇杆',
      desc:'机背总成：3.2 英寸约 236 万点触控屏向上翻折（ selfie 角度受限是初代 Z 的妥协），拇指区布置多点摇杆与 i 菜单键；电子取景器居中，放大率 0.80× 为当年全画幅无反最大级别。',
      specs:[['屏幕','3.2″ 翻折触屏'],['分辨率','约 236 万点'],['摇杆','多点子选择器'],['EVF','0.80× · 369 万点 OLED']] },
    { id:'battery', zh:'电池', en:'EN-EL15b 1900 mAh',
      ex:[-1.2,-2.6,0.8], lo:[0,1.0,0], tag:'7.0V 1900mAh · CIPA 310 张',
      desc:'EN-EL15b 锂离子电池：7.0V 1900mAh，与 D7500/D500 通用，CIPA 标准约 310 张；USB 充电可直接在机身内补电，代价是关机仍走电——初代 Z 的名场面。',
      specs:[['型号','EN-EL15b'],['容量','1900 mAh · 7.0V'],['续航','CIPA 约 310 张'],['充电','机身 USB 充电']] },
    { id:'board', zh:'主板', en:'EXPEED 6 MAINBOARD',
      ex:[0,1.6,1.4], lo:[0,1.1,0], tag:'EXPEED 6 · 焦平面相位检测',
      desc:'卡口后方的竖置主板（示意重建）：EXPEED 6 处理 24.5MP BSI 数据流与 273 点 PDAF 运算，XQD/CFexpress 单槽控制器负责 12fps 连拍回写，散热经铜箔导至机身骨架。',
      specs:[['处理器','EXPEED 6'],['对焦','273 点 PDAF · 约 90% 覆盖'],['存储','单 XQD / CFexpress'],['视频','4K UHD 30p 全宽采样']] },
  ],
  postLoad: composePostLoad(
    anchorParts({
      battery: { ref:'body', dy:-1.4, dz:-0.8 },
      board:   { ref:'body', dy:0.5, dz:0.9 },
    }),
  ),
  tick: null,
});
