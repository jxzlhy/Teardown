/* =============================================================
   设备配置：M4 卡宾枪（低多边形教学件 · 教育视角）
   社区模型（Sketchfab）：11 匿名网格无贴图
   原始资产长轴在 Y → Blender 预旋转 +90°（y→z）后入库，
   Z 现为枪长轴（枪口 -z）→ frontAxis '-z'
   内容仅覆盖结构与公开常识，不含任何操作指导
============================================================= */
import { makeDevice } from './_kit/factory.js';

export default makeDevice({
  id: 'm4-carbine',
  name: 'M4 卡宾枪（结构示意）',
  en: 'M4 CARBINE',
  category: '枪械',
  brand: 'COLT',
  tagline: '直吹导气 · 伸缩托 · AR-15 血统',
  description: 'M4 卡宾枪的低多边形结构示意件：AR-15/M16 家族的缩短型，直吹式（gas impingement）导气——燃气经导气管直接吹进枪机框内腔推动后坐，这是它与 AK 长行程活塞最本质的区别。低模把枪托、机匣、弹匣、护木、枪口等大件分开，适合认识「AR 系一棵树」的模块化分段。本页只讲结构常识。',
  specs: [
    ['口径','5.56×45mm NATO'],['原理','直吹导气（Gas Impingement）'],
    ['血统','AR-15 / M16A2 缩短型'],['枪托','可伸缩四段托'],
    ['护木','圆形护木（可换导轨型）'],['瞄具','提把/光学接口'],
    ['射速','约 700-950 发/分'],['展示','低多边形结构示意'],
  ],
  accent: '#3d4a3a',
  source: '社区模型（Sketchfab）',
  modelCredit: 'Low-Poly M4A1 by TastyTony (Sketchfab, CC-BY 4.0)',
  modelSource: 'https://sketchfab.com/3d-models/low-poly-m4a1-8cab1cbeb82c4396a154f9fc8771417b',
  targetWidth: 9,
  normalize: 'full',
  frontAxis: '-z',
  glb: '/assets/m4-carbine.glb',
  tour: ['receiver','handguard','magazine','grip','stock'],
  xrayShellIds: ['receiver','handguard','stock'],
  mapByPosition(name, p, rel){
    /* 旋转后 Z 为枪长轴：枪托 +z 端、枪口 -z 端 */
    if(rel.z > 0.72) return 'stock';
    if(rel.z > 0.5)  return 'receiver';
    if(rel.z > 0.28) return 'magazine';
    if(rel.z > 0.2)  return 'grip';
    return 'handguard';
  },
  realPartIds: ['stock','receiver','magazine','grip','handguard'],
  parts: [
    { id:'receiver', zh:'上下机匣', en:'UPPER + LOWER RECEIVER', real:true,
      ex:[0,.6,.4], lo:[0,1.3,0], tag:'铝合金锻造 · 两颗销钉连接',
      desc:'上下机匣：AR 系的灵魂设计——上机匣装枪管与枪机、下机匣装发射机，两颗销钉固定即可徒手分离成两半；「lower is the gun」的法规地位也让下机匣成了 AR 文化符号。',
      specs:[['材质','铝合金锻造'],['连接','两颗推销'],['文化','下机匣=本体']] },
    { id:'stock', zh:'伸缩枪托', en:'COLLAPSIBLE STOCK', real:true,
      ex:[-.8,.2,1.8], lo:[0,1.2,0], tag:'四段伸缩 · 缓冲管',
      desc:'四段伸缩托：滑在缓冲管（buffer tube）上按体型/装具调整长度，缓冲管内藏缓冲簧——AR 直吹结构的后坐能量有一半消耗在这根管里。',
      specs:[['类型','四段伸缩'],['集成','缓冲管 + 缓冲簧'],['调节','按装具快调']] },
    { id:'magazine', zh:'弹匣', en:'MAGAZINE', real:true,
      ex:[.5,-1.8,-.4], lo:[0,1.2,0], tag:'30 发铝/聚合物',
      desc:'30 发弹匣：直插下机匣弹匣井，铝/聚合物材质；AR 的直插式弹匣井 + 空仓挂机是它人机工程的名片。',
      specs:[['容弹','30 发'],['安装','直插弹匣井']] },
    { id:'grip', zh:'握把', en:'PISTOL GRIP', real:true,
      ex:[-.6,-1.4,.0], lo:[0,1.0,0], tag:'独立握把 · A2 型',
      desc:'A2 型独立握把：与弹匣井夹角配合形成 AR 经典的持握几何。',
      specs:[['型号','A2 风格'],['独立','销钉可换']] },
    { id:'handguard', zh:'护木与枪管段', en:'HANDGUARD + BARREL', real:true,
      ex:[.8,.2,-1.8], lo:[0,1.2,0], tag:'圆形护木 · 直吹导气管',
      desc:'圆形护木与枪管段：护木包着枪管与导气管——直吹系统的导气管藏在护木下从枪管中段引燃气直送枪机框，结构极简但高温燃气直进机匣是它的维护代价。',
      specs:[['导气','直吹（管藏护木下）'],['代价','机匣积碳'],['对比','AK 长行程活塞']] },
  ],
});
