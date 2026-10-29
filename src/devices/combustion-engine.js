/* =============================================================
   设备配置：直列内燃机教学模型（143 构件）
   社区模型（Sketchfab）：143 匿名网格（全真实机构件）
   bbox 0.66×0.73×0.58，Y 直立（顶气门 y 0.52 / 底曲轴），
   App* 材质无语义 → rel.y 高度带 + rel.z 端向分流
============================================================= */
import { makeDevice } from './_kit/factory.js';

export default makeDevice({
  id: 'combustion-engine',
  name: '直列内燃机（教学）',
  en: 'INTERNAL COMBUSTION ENGINE',
  category: '机械',
  brand: 'GENERIC',
  tagline: '143 构件 · 四冲程全机构 · 整机教学件',
  description: '一台直列式内燃机教学模型：143 个独立构件覆盖四冲程全套机构——顶置凸轮与气门传动、缸盖、缸筒里的活塞连杆、底部曲轴与飞轮。四冲程循环（进气-压缩-做功-排气）转两圈才点一次火，所有部件的运动相位都锁死在这条链条上。没有贴图的素色呈现反而让机构关系一目了然。',
  specs: [
    ['布局','直列 · 顶置气门'],['构件','143 个独立机构件'],
    ['循环','四冲程（进气-压缩-做功-排气）'],['相位','曲轴两转一循环'],
    ['核心','曲柄连杆 + 凸轮配气'],['飞轮','储能匀速'],
    ['用途','原理教学拆解'],['来源','社区模型（Sketchfab）'],
  ],
  accent: '#5b7f95',
  source: '社区模型（Sketchfab）',
  modelCredit: 'Internal combustion engine model by community (Sketchfab)',
  targetWidth: 10,
  camDist: 0.95,
  normalize: 'full',
  glb: '/assets/combustion-engine.glb',
  mapByPosition(name, p, rel){
    if(rel.y > 0.85) return 'valvetrain';
    if(rel.y > 0.62) return 'head';
    if(rel.y > 0.38) return (Math.abs(rel.x - 0.5) > 0.42) ? 'ancillaries' : 'block';
    if(rel.y > 0.15) return 'pistons';
    return rel.z < 0.3 ? 'flywheel' : 'crank';
  },
  realPartIds: ['valvetrain','head','block','pistons','crank','flywheel','ancillaries'],
  parts: [
    { id:'valvetrain', zh:'气门传动（顶部）', en:'VALVETRAIN', real:true,
      ex:[0,2.4,.4], lo:[0,1.3,0], tag:'凸轮轴 · 挺柱 · 弹簧',
      desc:'气门传动机构：凸轮轴的凸桃按点火顺序压下挺柱与气门——进气门什么时候开、开多大，全由凸轮轮廓决定；顶置布局缩短传动链，高转速响应更好。',
      specs:[['构成','凸轮轴 · 挺柱 · 气门弹簧'],['相位','曲轴 2:1 减速'],['轮廓','凸桃决定正时']] },
    { id:'head', zh:'气缸盖', en:'CYLINDER HEAD', real:true,
      ex:[0,1.6,-.8], lo:[0,1.3,0], tag:'燃烧室成型 · 气道',
      desc:'气缸盖：封闭气缸顶端并铸造出进气道、排气道与燃烧室形状——燃烧效率一半由缸盖气道设计决定，火花塞斜插在气道之间的「屋顶」上。',
      specs:[['集成','进排气道 · 燃烧室'],['关键','气道设计定燃烧效率'],['密封','缸垫对接缸体']] },
    { id:'block', zh:'气缸体', en:'CYLINDER BLOCK', real:true,
      ex:[0,.4,1.4], lo:[0,1.3,0], tag:'缸筒 · 水套 · 主轴承座',
      desc:'气缸体：发动机的骨骼——缸筒引导活塞往复，水套带走燃烧热，底部主轴承座承托曲轴；铸铁缸体百年演进只为「又硬又散热」这一件事。',
      specs:[['角色','全机骨骼'],['内部','缸筒 + 水套'],['承托','曲轴主轴承']] },
    { id:'pistons', zh:'活塞连杆组', en:'PISTON + ROD', real:true,
      ex:[1.5,-.6,.8], lo:[0,1.3,0], tag:'做功原件 · 往复变旋转',
      desc:'活塞与连杆：唯一承受爆燃压力并对外做功的部件组——活塞环密封燃烧室，连杆把直线冲击翻译成曲轴的旋转；每分钟数千次的往复让材料疲劳成为设计主课题。',
      specs:[['角色','做功原件'],['环组','气环 ×2 + 油环'],['转换','往复 → 旋转']] },
    { id:'crank', zh:'曲轴', en:'CRANKSHAFT', real:true,
      ex:[0,-1.2,-1.6], lo:[0,1.3,0], tag:'多拐曲轴 · 错相点火',
      desc:'曲轴：各缸曲拐按点火顺序错相排布，让「一口气变连续旋转」；轴颈淬硬抛光、平衡重抵消往复惯性力——直列机的曲轴是刚度与振动的平衡艺术。',
      specs:[['错相','按点火顺序'],['平衡','配重抵消惯性'],['细节','轴颈淬硬']] },
    { id:'flywheel', zh:'飞轮', en:'FLYWHEEL', real:true,
      ex:[-1.6,-.8,-2.2], lo:[0,1.2,0], tag:'大惯量储能',
      desc:'飞轮：四冲程发动机每两转才有一个缸做功一次，飞轮的大惯量把脉冲式的爆发「抹平」成均匀旋转——没有它，发动机在怠速下根本转不过去。',
      specs:[['功能','储能匀速'],['必要性','四冲程脉冲输出'],['集成','齿圈供起动机']] },
    { id:'ancillaries', zh:'侧向附件', en:'ANCILLARIES', real:true,
      ex:[2.0,.4,-.6], lo:[0,1.1,0], tag:'泵类 · 前端驱动',
      desc:'侧向附件：机油泵、水泵与正时驱动件——发动机的「辅助器官」，机油泵把润滑油压送到每个轴瓦，断油十秒就能报废一台机器。',
      specs:[['构成','机油泵 · 水泵 · 正时件'],['关键','润滑供油连续性'],['驱动','曲轴前端取力']] },
  ],
});
