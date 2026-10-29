/* =============================================================
   设备配置：Admiral 7T10 电子管收音机（1940s 台式）
   社区模型（Sketchfab · CC-BY 4.0）：4 网格全语义命名
   （case 外壳 / tubes 电子管 / tuner 调谐器 / wires 线路——
   作者描述"modeled with the full internal components"，网格名证实）
   bbox 0.47×0.23×0.49 台式横置
   结构：外壳→电子管→调谐器→线路
============================================================= */
import { makeDevice } from './_kit/factory.js';

export default makeDevice({
  id: 'admiral-7t10',
  name: 'Admiral 7T10 电子管收音机',
  en: 'TUBE RADIO 1940S',
  category: '影音',
  brand: 'ADMIRAL',
  tagline: '电子管的暖光 · 一家客厅的中心',
  description: '1940 年代的电子管台式收音机：旋钮调谐、真空管放大、木质外壳——它曾是一个家庭了解世界的唯一窗口。本页按 4 组拆解：胶木外壳、真空管组（玻璃壳内的灯丝与栅极）、调谐器（可变电容与天线线圈）、以及把这一切连成电路的线路组。作者按"完整内部元件"建模，网格名与真实结构一一对应。',
  specs: [
    ['年代', '1940s'],
    ['放大', '真空管（电子管）'],
    ['调谐', '可变电容 + 天线线圈'],
    ['外壳', '胶木 / 木质'],
    ['拆解', '4 组核心部件'],
  ],
  accent: '#c98f4e',
  source: '社区模型（Sketchfab）',
  modelCredit: 'Vintage Radio 1940s by Sketchfab community (CC-BY 4.0)',
  modelSource: 'https://sketchfab.com/3d-models/vintage-radio-1940s-7724f81ad4e043079b7bf4b16146c087',
  targetWidth: 9,
  normalize: 'full',
  frontAxis: '+z',
  glb: '/assets/admiral-7t10.glb',
  mappingPrefix: {
    'case_case':  'case',
    'tubes_tubes':'tubes',
    'tuner_Tuner':'tuner',
    'wires_Wire': 'wires',
  },
  tour: ['case', 'tubes', 'tuner', 'wires'],
  xrayShellIds: ['case'],
  realPartIds: ['case', 'tubes', 'tuner', 'wires'],
  parts: [
    { id: 'case', zh: '外壳', en: 'CASE', real: true,
      ex: [0, 0.3, 1.0], lo: [0, 1.2, 0.2], tag: '胶木曲线 · 客厅的家具',
      desc: '40 年代收音机的外壳是"家具"而非"设备"：胶木或木壳的曲线造型要融入客厅的陈设，格栅后面藏着扬声器，正面只露出调谐刻度盘与两个旋钮。外壳的开口位置同时是散热口——真空管的余热从这里排出。',
      specs: [['材质', '胶木 / 木质'], ['造型', '家具化曲线'], ['开口', '散热 + 声学格栅']] },
    { id: 'tubes', zh: '真空管组', en: 'VACUUM TUBES', real: true,
      ex: [0, 1.2, -0.8], lo: [0, 1.2, -0.2], tag: '玻璃壳里的灯丝与栅极',
      desc: '真空管是电子管收音机的心脏：玻璃壳内的灯丝加热后，阴极发射的电子穿过栅极到达屏极——几级管子级联完成放大。开机后管内灯丝发出橙红色的暖光，是"电子管音色"传说之外的真实视觉记忆。管子插在管座上，坏了拔下来换一颗即可——用户可维修设计的典范。',
      specs: [['原理', '热阴极发射 → 栅极控制 → 屏极'], ['视觉', '开机橙红暖光'], ['维护', '插拔即换 · 用户可修']] },
    { id: 'tuner', zh: '调谐器', en: 'TUNER', real: true,
      ex: [0, -0.4, -1.0], lo: [0, 1.0, -0.3], tag: '可变电容选出电台',
      desc: '调谐器由可变电容与天线线圈组成：旋转旋钮改变电容极片的正对面积，电路的谐振频率随之移动——当它对准某个电台的频率，那个台的声音就从无数电波里被"选"了出来。刻度盘上的城市名是当年各台的位置表。',
      specs: [['核心', '可变电容 + 天线线圈'], ['操作', '旋钮连续调谐'], ['刻度', 'kHz 频率 + 城市名']] },
    { id: 'wires', zh: '线路组', en: 'WIRING', real: true,
      ex: [0, -0.8, 0.6], lo: [0, 1.0, 0.2], tag: '把元件连成电路的手工活',
      desc: '真空管收音机的线路是手工焊接的：元件之间用带颜色标识的导线直连——红色走电源、黑色走地线，检修时顺着颜色就能读电路。线路的走线方式直接影响音质与稳定，老技师的"走线艺术"是电子管收音机收藏者最看重的细节。',
      specs: [['工艺', '手工焊接直连'], ['标识', '颜色区分电路'], ['检修', '顺色读电路']] },
  ],
});
