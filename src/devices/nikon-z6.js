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
  /* 策展导览（2026-11-01 V2 3.4 映射校正后）：镜头→卡口环→机身→主板→电池 */
  tour: ['lens','mount-ring','body','board','battery'],
  xrayShellIds: ['body'],
  normalize: 'full',
  frontAxis: '-x',
  mapByPosition(name, p, rel){
    /* 2026-11-01 V2 3.4 校正（__MAPPTS 帧系实测）：原阈值 p.z>5/p.z>0.2 在该帧系
       下把全部机身块判进 mount-ring，body/grip/top-plate/back 四部件零网格。
       实测：镜头 p=[-9.02,5.42,5.92]、卡口环 [-2.75,3.53,4.67]、机身块 5 片
       x∈[-2.01,0.56]。逐网格隔离渲染无法可靠区分手柄/顶盖/背板 → 按真实性
       原则合并为「机身主体」单一部件（desc 已如实标注源模型拆分粒度限制）。 */
    if(p.x < -5) return 'lens';
    if(p.x < -2 && p.z > 4.4) return 'mount-ring';
    return 'body';
  },
  realPartIds: ['lens', 'mount-ring', 'body'],
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
    { id:'body', zh:'机身主体（含手柄·顶盖·背板）', en:'MAGNESIUM BODY', real:true,
      ex:[0,-0.3,-1.4], lo:[0,1.2,0], tag:'深笼镁合金 · 全天候密封',
      desc:'Z6 机身骨架：镁合金压铸深笼结构外包蒙皮，接缝密封达到与 D850 同级防尘防滴；五轴防抖机构就悬在卡口正后方，传感器组件可独立浮动，拆下镜头能看到 IBIS 上的传感器居中静止。手柄、顶盖与翻折背屏在本源模型中未按独立网格拆分，故合并展示——以上细节为真实 Z6 结构资料，非本模型几何承诺。',
      specs:[['结构','镁合金深笼'],['防抖','5 轴 IBIS · 约 5 档'],['密封','防尘防滴'],['重量','约 585g 整机']] },
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
