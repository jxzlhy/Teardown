/* =============================================================
   设备配置：浑天仪（脚手架生成 · 待补全）
   上线步骤：GLB → public/assets/armillary-sphere.glb → 本文件补 glb/mapping/realPartIds
============================================================= */
import { makeDevice } from './_kit/factory.js';
import { box, addMesh, matShell, matDark } from '../engine/materials.js';

const builders = {
  body: (g)=>{
    /* TODO：程序化占位外观，按真机改 */
    addMesh(g, box(6, 3, 1), matShell(), 0, 0, 0);
  },
};

export default makeDevice({
  id: 'armillary-sphere',
  name: '浑天仪',
  en: 'ARMILLARY SPHERE',
  category: '天文仪器',
  brand: 'GENERIC',
  tagline: 'TODO · 一句话卖点',
  description: '浑天仪：TODO · 设备介绍。',
  specs: [
    ['状态', '配置待补充'],
  ],
  accent: '#45e0ff',
  targetWidth: 6.5,
  /* glb: '/assets/armillary-sphere.glb',      // GLB 就绪后取消注释并配置映射 */
  parts: [
    { id:'body', zh:'机身', en:'BODY', real:false,
      ex:[0,.6,0], lo:[0,1.5,0], tag:'程序化占位',
      desc:'TODO · 部件介绍。',
      specs:[['状态','待补充']] },
  ],
  builders,
  tick: null,
});
