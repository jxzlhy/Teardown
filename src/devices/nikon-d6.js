/* =============================================================
   设备配置：Nikon D6 (2020)
   社区 GLB（Sketchfab）：78 网格匿名 Object_N + 仅 2 材质（Material__35/Lens）
   bbox 0.17×0.17×0.24 m（Y 上，z 为机身深度+镜头，镜头群在 z>0 侧，手柄在 x>0）
   位置聚类（rel 全包围盒）：镜头群 / 卡口 / 手柄 / 顶盖 / 背面 / 底盖 / 机身
============================================================= */
import { makeDevice, anchorParts, composePostLoad } from './_kit/factory.js';
import { mainboard, battery } from './_kit/internals.js';

const builders = {
  battery: (g)=> battery(g, { w:2.3, h:3.2, d:1.1, label:'NIKON', capacity:'4000 mAh', model:'EN-EL18c', rating:'10.8V' }),
  board:   (g)=> mainboard(g, { w:3.8, h:2.6, soc:[-1.0,.5], ram:[1.0,.6], label:'NIKON D6', sub:'EXPEED 6 · MAIN PCB', pcb:'#1a2a4a', smalls:14 }),
};

export default makeDevice({
  id: 'nikon-d6',
  name: 'Nikon D6',
  en: 'NIKON D6 FLAGSHIP DSLR',
  category: '相机',
  brand: 'NIKON',
  tagline: '末代 F 卡口旗舰 · 14fps 奥运机',
  description: 'Nikon D6：2020 年 2 月发布的旗舰单反，为东京奥运与体育摄影而生，也是 Nikon 最后一代 F 卡口顶级机身。20.8MP 全画幅 CMOS 搭配 EXPEED 6，14fps 连拍配合 Multi-CAM 37XXX 的 105 点全十字对焦，双 CFexpress Type B 槽与千兆以太网直出体育社图传流程。模型为社区资产（78 网格），按包围盒位置聚类拆为镜头群、卡口、手柄、顶盖、背面、底盖与机身，电池与主板为示意重建。',
  specs: [
    ['发布','2020 年 2 月（$6,499）'],['传感器','20.8MP 全画幅 CMOS'],
    ['处理器','EXPEED 6'],['连拍','14fps（AF/AE 跟踪）'],
    ['对焦','105 点全十字 · Multi-CAM 37XXX'],['存储','双 CFexpress Type B / XQD'],
    ['屏幕','3.2″ 约 236 万点触控'],['电池','EN-EL18c · 10.8V 4000mAh'],
    ['快门','1/8000s · 40 万次寿命'],['网络','千兆以太网 + Wi-Fi + 蓝牙'],
    ['重量','约 1450g（含电池）'],
  ],
  accent: '#d94f3d',
  source: '社区模型（Sketchfab）· 内构件为示意重建',
  modelCredit: 'Nikon D6 model by community (Sketchfab)',
  targetWidth: 8.5,
  glb: '/assets/nikon-d6.glb',
  normalize: 'full',
  /* 朝向待定：探测镜头群与背面，保证镜头群朝观众 +z */
  orientationProbe: ['lens', 'back'],
  mapByPosition(name, p, rel){
    /* rel 为全包围盒相对坐标（0..1）：z 前后拆镜头/卡口/背面，x 拆手柄，y 拆顶底 */
    if(rel.z > 0.7) return 'lens';
    if(rel.z > 0.55) return 'mount';
    if(rel.x > 0.55 && rel.y < 0.5) return 'grip';
    if(rel.y > 0.78) return 'top-plate';
    if(rel.z < 0.3) return 'back';
    if(rel.y < 0.12) return 'bottom-plate';
    return 'body';
  },
  realPartIds: ['lens', 'mount', 'grip', 'top-plate', 'back', 'bottom-plate', 'body'],
  builders,
  parts: [
    { id:'lens', zh:'镜头群', en:'LENS GROUP', real:true,
      ex:[0,0.3,3.4], lo:[0,1.3,0], tag:'F 卡口光学群 · 近 2 万三角面',
      desc:'随模型附带的镜头组件（Object_135 镜筒群，约 1.96 万三角面）：多组镜片与对焦环套叠成镜筒，经 F 卡口锁入机身。D6 作为末代 F 卡口旗舰，可完整继承 1959 年以来六十余年的 F 卡口镜头群。',
      specs:[['卡口','Nikon F'],['镀膜','纳米结晶涂层（N 系列）'],['减震','镜头端 VR'],['机型','末代 F 卡口旗舰']] },
    { id:'mount', zh:'卡口环', en:'F MOUNT', real:true,
      ex:[0,0,2.0], lo:[0,1.2,0], tag:'F 卡口 · 55mm 口径',
      desc:'不锈钢卡口环：F 卡口 55mm 内径与 46.5mm 法兰距自 1959 年延用至今，机械接环传递光圈与对焦信息，触点负责镜头识别与电磁光圈控制；拆下镜头即露出镜箱内的反光镜与对焦屏。',
      specs:[['口径','55 mm'],['法兰距','46.5 mm'],['传承','1959 年至今'],['锁定','旋转卡口 + 镜头释放钮']] },
    { id:'grip', zh:'一体手柄', en:'INTEGRATED GRIP', real:true,
      ex:[2.8,-0.3,0.6], lo:[0,1.1,0], tag:'内置电池仓 · 竖拍人机工学',
      desc:'加深的右侧一体手柄：内藏 EN-EL18c 电池仓（仓门在手柄底部），蒙皮覆盖的曲面握位由大型手部撑满；手柄肩部布置竖拍快门、前拨轮与 AF-ON，竖构图拍摄与横拍完全同权。',
      specs:[['电池仓','EN-EL18c ×1'],['竖拍','快门 + 前后拨轮'],['蒙皮','防滑橡胶饰皮'],['深度','可满握大手']] },
    { id:'top-plate', zh:'顶盖', en:'TOP PLATE', real:true,
      ex:[0,2.8,0.4], lo:[0,1.2,0], tag:'肩屏 + 双指令盘',
      desc:'镁合金顶盖：中央大号肩屏实时显示光圈/快门/ISO/剩余张数，双指令盘直接调参；模式盘、热靴与录制键沿轴线排布，快门键延续旗舰机的前倾角度设计。',
      specs:[['肩屏','机身状态总览'],['指令盘','前后双拨轮'],['热靴','ISO 518 标准'],['材质','镁合金压铸']] },
    { id:'back', zh:'背面（屏+取景器）', en:'REAR PANEL & VF', real:true,
      ex:[0,0.2,-3.0], lo:[0,1.3,0], tag:'3.2″ 236 万点 + 光学五棱镜',
      desc:'机背总成：3.2 英寸约 236 万点触控屏（固定式，未沿用 D5 的翻折结构以保密封性），光学取景器经五棱镜给出约 0.72× 放大率的全画面视野；十字键、LV 杆与 i 菜单键集中于拇指区。',
      specs:[['屏幕','3.2″ · 约 236 万点'],['触控','电容触控选点'],['取景器','光学 · 约 0.72×'],['覆盖','100% 视野率']] },
    { id:'bottom-plate', zh:'底盖', en:'BOTTOM PLATE', real:true,
      ex:[0,-2.8,0], lo:[0,1.0,0], tag:'三脚架孔 · 电池仓门',
      desc:'镁合金底盖：大口径三脚架接孔与手柄底部的电池仓门——EN-EL18c 从竖握手柄下方插入锁止；龙骨式走线让 USB/以太网外接盒可从底部引出而不挡手柄。',
      specs:[['接孔','1/4″ 三脚架'],['仓门','手柄底部抽换电池'],['引线','底部外接盒走线'],['材质','镁合金']] },
    { id:'body', zh:'机身主体', en:'MAGNESIUM CHASSIS', real:true,
      ex:[0,0,0.8], lo:[0,1.4,0], tag:'镁合金骨架 · 全天候密封',
      desc:'机身承力骨架：镁合金压铸框架外包复合材料蒙皮，接缝与按键全部点胶密封，达到旗舰级防尘防滴；反光镜箱内的镜组由平衡弹簧与阻尼器压住，14fps 高速连拍下仍维持取景与对焦时序。',
      specs:[['框架','镁合金压铸'],['密封','全天候防尘防滴'],['快门','碳纤维叶片 · 40 万次'],['反光镜','平衡阻尼机构']] },
    { id:'battery', zh:'电池', en:'EN-EL18c 4000 mAh',
      ex:[3.4,-1.0,0.8], lo:[0,1.0,0], tag:'10.8V 4000mAh · 旗舰锂电',
      desc:'EN-EL18c 锂离子电池：10.8V 4000mAh 规格，与 D5/D4 系列电池座兼容，低温下仍能支撑 14fps 连拍与千兆网长时间直传；一块电池即够体育记者全天拍摄。',
      specs:[['型号','EN-EL18c'],['容量','4000 mAh · 10.8V'],['低温','支持严寒环境'],['兼容','D5/D4 系列机身']] },
    { id:'board', zh:'主板', en:'EXPEED 6 MAINBOARD',
      ex:[0,1.8,1.2], lo:[0,1.1,0], tag:'EXPEED 6 · 双 CFexpress 控制器',
      desc:'竖置主电路板（示意重建）：EXPEED 6 处理器驱动 20.8MP 数据流与 105 点对焦运算，双 CFexpress Type B 控制器支持同步写入/接力存储，千兆以太网 PHY 直接焊在板上供图传直连。',
      specs:[['处理器','EXPEED 6'],['存储','双 CFexpress Type B'],['网络','1000BASE-T 以太网'],['视频','4K UHD 30p']] },
  ],
  postLoad: composePostLoad(
    anchorParts({
      battery: { ref:'grip' },
      board:   { ref:'body', dy:0.5, dz:0.6 },
    }),
  ),
  tick: null,
});
