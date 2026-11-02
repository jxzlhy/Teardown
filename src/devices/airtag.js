/* =============================================================
   设备配置：Apple AirTag (2025)
   官方 GLB：Apple 产品页 AR 资产转换（仅 0.9MB · 8 网格）
   扁平圆片：+Z 为白色聚合物面
============================================================= */
import { makeDevice, anchorParts, composePostLoad } from './_kit/factory.js';
import { battery } from './_kit/internals.js';
import * as THREE from 'three';
import { addMesh, matSilver, matDark } from '../engine/materials.js';

const builders = {
  'coin-battery': (g)=>{
    /* CR2032 纽扣电池：钢壳 + 正极刻字 */
    addMesh(g, new THREE.CylinderGeometry(1.0, 1.0, .18, 40), matSilver(), 0, 0, 0);
    const cap = addMesh(g, new THREE.CylinderGeometry(.88, .88, .06, 40), new THREE.MeshStandardMaterial({ color:0xd8dde2, metalness:.9, roughness:.3 }), 0, .1, 0);
    cap.rotation.x = 0;
    addMesh(g, new THREE.TorusGeometry(.98, .04, 10, 40), matDark(), 0, -.08, 0).rotation.x = Math.PI/2;
  },
  speaker: (g)=>{
    addMesh(g, new THREE.CylinderGeometry(.5, .5, .1, 24), matDark(), 0, 0, 0);
  },
};

export default makeDevice({
  id: 'airtag',
  era: 2021,
  name: 'Apple AirTag',
  en: 'AIRTAG',
  category: '穿戴',
  brand: 'APPLE',
  tagline: 'UWB 精确查找 · CR2032',
  description: 'AirTag：超宽频（UWB）精确查找 tag——直径 3.19cm 的钢碟里塞进 U1 类芯片、加速度计与扬声器，查找精度可达分米级；CR2032 纽扣电池一年一换。官方产品页模型（Apple AR 资产转换），内构件为示意重建。',
  specs: [
    ['定位','UWB 精确查找 · 全球查找网络'],['电池','CR2032 · 约 1 年可换'],['扬声器','内置（响铃寻物）'],
    ['传感','加速度计 · NFC'],['防护','IP67'],['尺寸','31.9 × 8 mm · 11 g'],
  ],
  accent: '#dfe6ec',
  source: 'Apple 官网 AR 模型（USDZ 转制）',
  distribution: 'local-demo-only',
  targetWidth: 6.5,
  glb: '/assets/airtag.glb',
  /* 策展导览：抛光壳→钢背→纽扣电池→扬声器 */
  tour: ['top-shell','steel-back','coin-battery','speaker'],
  xrayShellIds: ['top-shell'],
  normalize: 'full',
  mapByPosition(name, p, rel){
    if(p.z > 0.35) return 'top-shell';
    return 'steel-back';
  },
  realPartIds: ['top-shell','steel-back'],
  builders,
  parts: [
    { id:'top-shell', zh:'白色聚合物面', en:'POLYCARBONATE TOP', real:true,
      ex:[0,.5,1.6], lo:[0,1.3,0], tag:'一体注塑穹面',
      desc:'白色聚合物穹面：一体注塑成型，UWB/蓝牙信号穿透无衰减；穹面与钢壳以卡扣+密封圈结合，徒手可开（换电池无需工具）。',
      specs:[['材质','聚合物注塑'],['特性','信号全穿透'],['开启','逆时针旋开']] },
    { id:'steel-back', zh:'不锈钢底壳', en:'STAINLESS STEEL BACK', real:true,
      ex:[0,-.2,-1.6], lo:[0,1.3,0], tag:'精抛钢碟 · 刻字面',
      desc:'精抛光不锈钢底壳：外侧可免费激光刻字，内侧容纳扬声器开孔与电池仓触点；整个 AirTag 仅 11g，可挂钥匙扣/塞进包里。',
      specs:[['材质','精抛不锈钢'],['刻字','官方免费激光刻字'],['重量','11 g'],['防护','IP67']] },
    { id:'coin-battery', zh:'CR2032 纽扣电池', en:'CR2032 COIN CELL',
      ex:[0,0,.9], lo:[0,1.2,0], tag:'约 1 年续航',
      desc:'CR2032 纽扣电池：日常用量约一年，Apple 在儿童接触安全上做了苦味涂层处理（防误吞）；旋开背面即可更换。',
      specs:[['型号','CR2032'],['续航','约 1 年'],['安全','苦味涂层防误吞'],['更换','旋开即换']] },
    { id:'speaker', zh:'扬声器与主板', en:'SPEAKER & BOARD',
      ex:[0,-.6,-.9], lo:[0,1.1,0], tag:'响铃寻物 · UWB',
      desc:'内置扬声器与主板：查找时响铃定位，UWB 芯片与 iPhone 上的 U1 协同做分米级“精确查找”方向指示，NFC 芯片支持丢失模式被任何手机轻触读取。',
      specs:[['扬声器','80dB 响铃'],['定位','UWB 分米级'],['丢失模式','NFC 全球可读'],['传感','加速度计（防误触发）']] },
  ],
  postLoad: composePostLoad(
    anchorParts({
      'coin-battery': { ref:'steel-back', dz:.1 },
      speaker:        { ref:'steel-back', dz:-.1 },
    }),
  ),
  tick: null,
});
