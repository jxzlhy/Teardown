/* =============================================================
   设备配置：V8 发动机（已拆解态 · 200 万三角面教学件）
   社区模型（Sketchfab）：90 匿名网格，出厂即拆解布局
   （缸盖 y≈4.8 / 进气居中 / 排气两侧 x≈±4.4 / 曲轴 y≈-3.3 /
   活塞群 y≈-4.7~-8.8 实测）→ rel.y 高度带 + rel.x 左右分侧
============================================================= */
import { makeDevice } from './_kit/factory.js';

export default makeDevice({
  id: 'v8-engine',
  name: 'V8 发动机（拆解态）',
  en: 'DISASSEMBLED V8 ENGINE',
  category: '机械',
  brand: 'GENERIC',
  tagline: '出厂即拆解 · 90 独立构件 · 200 万面',
  description: '一台出厂即呈拆解态的 V8 发动机教学模型：90 个独立网格把左右缸盖、气门传动、进气歧管、双侧排气歧管、曲轴、八组活塞连杆、油底壳分列排开——200 万三角面的雕琢让每一颗螺栓孔都可见。推杆式（OHV）V8 是美式肌肉车的心脏结构：单凸轮藏在缸体夹角里，经推杆摇臂驱动每缸两气门，结构简单到能在车库里大修。',
  specs: [
    ['布局','V8 · 90° 夹角（推杆 OHV）'],['构件','90 独立网格'],
    ['上部','左右缸盖 + 气门传动'],['两侧','左右排气歧管'],
    ['下部','曲轴 + 八组活塞连杆'],['面数','约 200 万三角面'],
    ['用途','结构教学 · 拆解演示'],['来源','社区模型（Sketchfab）'],
  ],
  accent: '#8a8f98',
  source: '社区模型（Sketchfab）',
  modelCredit: 'Disassembled V8 engine model by community (Sketchfab)',
  targetWidth: 10,
  camDist: 1.0,
  normalize: 'full',
  glb: '/assets/v8-engine.glb',
  mapByPosition(name, p, rel){
    if(rel.z < 0.35 && rel.y > 0.4) return 'front-drive';
    if(rel.y > 0.72) return rel.x > 0.5 ? 'head-r' : 'head-l';
    if(rel.y > 0.42) return (Math.abs(rel.x - 0.5) > 0.3) ? (rel.x > 0.5 ? 'exhaust-r' : 'exhaust-l') : 'intake';
    if(rel.y > 0.3) return 'crank';
    return 'pistons';
  },
  realPartIds: ['head-l','head-r','intake','exhaust-l','exhaust-r','crank','pistons','front-drive'],
  parts: [
    { id:'head-l', zh:'左缸盖', en:'LEFT CYLINDER HEAD', real:true,
      ex:[-2.2,2.2,.8], lo:[0,1.4,0], tag:'燃烧室 + 气门座',
      desc:'左列缸盖：密封四只气缸顶端形成燃烧室，气门座、火花塞孔与摇臂轴支点都在这里；缸盖垫片夹在缸体与缸盖之间扛住燃烧压力。',
      specs:[['角色','燃烧室密封'],['集成','气门座 · 火花塞孔'],['密封','缸垫']] },
    { id:'head-r', zh:'右缸盖', en:'RIGHT CYLINDER HEAD', real:true,
      ex:[2.2,2.2,.8], lo:[0,1.4,0], tag:'与左列对称',
      desc:'右列缸盖：与左列对称，V8 的两列气缸各四缸；拆缸盖是大修的分界线——之后就是「镗缸磨轴」的深水区。',
      specs:[['对称','镜像左列'],['大修','拆盖即深水区']] },
    { id:'intake', zh:'进气歧管', en:'INTAKE MANIFOLD', real:true,
      ex:[0,2.6,-.8], lo:[0,1.3,0], tag:'V 夹角中央 · 8 岐管',
      desc:'进气歧管：跨在 V 型夹角正上方，八根岐管分别导向两列气缸——化油器/节气门体的混合气经这里分发给每个燃烧室，夹角中央是 V8 天然的总管位置。',
      specs:[['位置','V 夹角中央'],['分配','8 岐管导向'],['协同','节气门体']] },
    { id:'exhaust-l', zh:'左排气歧管', en:'LEFT EXHAUST HEADER', real:true,
      ex:[-2.8,.6,-1.6], lo:[0,1.2,0], tag:'四合一出气',
      desc:'左列排气歧管：四根支管汇成一出，把 700°C+ 的废气导向排气侧；等长歧管设计能让各缸排气互不干扰（「回压调音」的物理基础）。',
      specs:[['汇流','4→1'],['温度','700°C+'],['声学','等长管调音']] },
    { id:'exhaust-r', zh:'右排气歧管', en:'RIGHT EXHAUST HEADER', real:true,
      ex:[2.8,.6,-1.6], lo:[0,1.2,0], tag:'与左列对称',
      desc:'右列排气歧管：与左列镜像，双出排气是 V8 声浪的物理来源——两侧脉冲交替排出，形成标志性的「隆隆」节奏。',
      specs:[['对称','镜像右列'],['声浪','双出脉冲交替']] },
    { id:'crank', zh:'曲轴总成', en:'CRANKSHAFT', real:true,
      ex:[0,-1.2,-2.4], lo:[0,1.3,0], tag:'八拐曲拐 · 全机脊梁',
      desc:'曲轴：八组曲柄销对应八只连杆，把八个气缸的爆发按 90° 间隔错相排列成连续旋转；主轴颈由曲轴箱主轴承座（下曲轴箱半环）承托——整台发动机的脊梁。',
      specs:[['曲拐','8 拐 · 90° 错相'],['承托','主轴承半环'],['平衡','配重块']] },
    { id:'pistons', zh:'活塞连杆组 ×8', en:'PISTON-ROD ASSEMBLIES ×8', real:true,
      ex:[1.8,-2.6,1.0], lo:[0,1.3,0], tag:'八组待装 · 裙部可见',
      desc:'八组活塞连杆组件：活塞顶承受爆燃压力，环带上的两道气环一道油环刮布机油，连杆把直线力交给曲轴——拆解态把它们从缸筒里取出来一字排开，裙部侧面细节全部可见。',
      specs:[['数量','8 组'],['环带','两气环 + 一油环'],['状态','拆解陈列']] },
    { id:'front-drive', zh:'前端附件轮系', en:'FRONT ACCESSORY DRIVE', real:true,
      ex:[0,-.4,-3.0], lo:[0,1.2,0], tag:'风扇 · 皮带轮端',
      desc:'发动机前端：曲轴减振皮带轮、风扇与附件驱动轮系——正时链条/皮带与发电机、水泵都从曲轴前端取力，是发动机的「功率分配盘」。',
      specs:[['构成','减振轮 · 风扇 · 轮系'],['取力','曲轴前端'],['功能','正时 + 附件驱动']] },
  ],
});
