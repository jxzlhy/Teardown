/* =============================================================
   设备配置：复古电水壶（Poly Haven · CC0 扫描 + 程序化示意内构件）
   混合路径（微波炉先例）：真实壶身+水位窗玻璃（2 primitive，同名同材质）
   → materialMapping 按材质名分流（_glass 材质唯一）+ 电热盘/蒸汽温控器/
   开关连杆/电源耦合器为示意重建件（原模型无内构件），口径如实标注。
   归一化后壶身 6.5×6.09×5.08（x×y×z），原点=bbox 中心。
============================================================= */
import { makeDevice } from './_kit/factory.js';
import * as THREE from 'three';

const builders = {
  /* 示意内构件：引擎尺度（壶宽 6.5），按真机布局摆位 */
  element: (g) => {
    /* 密封电热盘：底面铝盘 + 环形不锈钢电热管 */
    const plate = new THREE.Mesh(new THREE.CylinderGeometry(2.35, 2.35, 0.18, 36),
      new THREE.MeshStandardMaterial({ color: 0xb9c1c8, metalness: 0.85, roughness: 0.32 }));
    plate.position.set(0, -2.85, 0);
    plate.name = 'ElementPlate';
    g.add(plate);
    const tube = new THREE.Mesh(new THREE.TorusGeometry(1.7, 0.11, 10, 44),
      new THREE.MeshStandardMaterial({ color: 0x555b60, metalness: 0.75, roughness: 0.42 }));
    tube.rotation.x = Math.PI / 2;
    tube.position.set(0, -2.98, 0);
    tube.name = 'ElementTube';
    g.add(tube);
  },
  thermostat: (g) => {
    /* 蒸汽温控器：蒸汽管上行 + 手柄底部的双金属蒸汽板 + 突跳开关片 */
    const tube = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 1.7, 10),
      new THREE.MeshStandardMaterial({ color: 0x8d969e, metalness: 0.7, roughness: 0.45 }));
    tube.position.set(0.95, -0.15, 0.55);
    tube.name = 'SteamTube';
    g.add(tube);
    const bimetal = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.5, 0.14),
      new THREE.MeshStandardMaterial({ color: 0x8a6a45, metalness: 0.5, roughness: 0.5 }));
    bimetal.position.set(0.9, 0.15, 0.55);
    bimetal.rotation.x = -0.25;
    bimetal.name = 'BimetalPlate';
    g.add(bimetal);
    const snap = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.06, 0.4),
      new THREE.MeshStandardMaterial({ color: 0xd8dde0, metalness: 0.8, roughness: 0.3 }));
    snap.position.set(0.9, 0.55, 0.55);
    snap.name = 'SnapDisc';
    g.add(snap);
  },
  switch: (g) => {
    /* 开关杆与连杆：手柄上的拨杆 → 连杆下行推动开关触点 */
    const lever = new THREE.Mesh(new THREE.BoxGeometry(0.28, 1.1, 0.18),
      new THREE.MeshStandardMaterial({ color: 0x2e3338, metalness: 0.2, roughness: 0.6 }));
    lever.position.set(1.25, 0.3, 0.6);
    lever.name = 'SwitchLever';
    g.add(lever);
    const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 1.5, 8),
      new THREE.MeshStandardMaterial({ color: 0x8d969e, metalness: 0.8, roughness: 0.35 }));
    rod.position.set(1.2, -0.3, 0.6);
    rod.name = 'SwitchRod';
    g.add(rod);
  },
  connector: (g) => {
    /* 底部 360° 电源耦合器（可任意角度放回底座） */
    const ring = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 0.85, 0.16, 24),
      new THREE.MeshStandardMaterial({ color: 0x22262a, metalness: 0.3, roughness: 0.6 }));
    ring.position.set(0, -3.1, 0);
    ring.name = 'CouplerRing';
    g.add(ring);
    for (let i = 0; i < 3; i++) {
      const a = i / 3 * Math.PI * 2 + 0.5;
      const pin = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.12, 8),
        new THREE.MeshStandardMaterial({ color: 0xb08d57, metalness: 0.9, roughness: 0.38 }));
      pin.position.set(Math.cos(a) * 0.42, -3.17, Math.sin(a) * 0.42);
      pin.name = 'CouplerPin' + (i + 1);
      g.add(pin);
    }
  },
};

export default makeDevice({
  id: 'vintage-kettle',
  name: '复古电水壶',
  en: 'VINTAGE ELECTRIC KETTLE',
  category: '厨电',
  brand: 'GENERIC',
  tagline: '蒸汽自己关火 · 1500W 的沸腾闭环',
  description: '电水壶是「会自己关火的水壶」：底部密封电热盘里的环形电热管把 1500–3000W 灌进一升多水，几分钟烧开。真正的灵魂是自动断汽关火——壶身侧的蒸汽管把沸水蒸汽引到手柄底部的双金属蒸汽板上，水一开、汽一冲、双金属片受热突跳，开关连杆瞬间弹断触点：不用传感器不用芯片，一条蒸汽管和一个双金属片就构成可靠的沸腾检测。底部 360° 电源耦合器让壶可以任意角度放回底座（公母触点分离设计，拎起即断电）。壶身与水位窗来自 Poly Haven CC0 扫描；电热盘、蒸汽温控器、开关连杆、耦合器为示意重建件（原模型无内构件），按真机布局摆放并如实标注口径。',
  specs: [
    ['功率', '1500–3000W 密封电热盘'],
    ['沸腾检测', '蒸汽管 → 双金属板突跳'],
    ['自动关火', '开汽即跳 · 无芯片'],
    ['防干烧', '无水则汽路无蒸汽 → 由突跳温度兜底'],
    ['底座', '360° 耦合器 · 拎起断电'],
    ['来源', 'Poly Haven CC0（壶身）+ 示意内构件'],
  ],
  accent: '#a8552f',
  source: 'Poly Haven（CC0 扫描）· 内构件为示意重建',
  modelCredit: 'Vintage Electric Kettle by Poly Haven (CC0)',
  modelSource: 'https://polyhaven.com/a/vintage_electric_kettle',
  targetWidth: 6.5,
  normalize: 'full',
  glb: '/assets/vintage-kettle.glb',
  tour: ['shell', 'element', 'thermostat', 'switch', 'water-glass', 'connector'],
  xrayShellIds: ['shell'],
  frontAxis: '+z',
  unmappedTo: 'shell',
  /* 2 primitive 同名同材质不可分 → 材质名分流（_glass 材质唯一；主体与窗共用主材质的判别由演示核对） */
  materialMapping: {
    'vintage_electric_kettle': 'shell',
    'vintage_electric_kettle_glass': 'water-glass',
  },
  realPartIds: ['shell', 'water-glass'],
  builders,
  demos: [
    { partId: 'switch', label: '开关连杆拨动示意（开→汽跳→断）', wobble: [0, 0, 0.18], wobbleF: 0.9 },
  ],
  parts: [
    { id: 'shell', zh: '壶身与提手', en: 'BODY & HANDLE', real: true,
      ex: [0, 0.4, 0], lo: [0, 1.4, 0], tag: '不锈钢腔 · 水位窗可见余量',
      desc: '壶身：不锈钢双层腔体（内胆盛水、外壳隔热），提手内藏蒸汽通道与开关连杆——手柄不只是握的，还是「蒸汽传感器的安装位」。壶身来自 Poly Haven CC0 扫描，内部机构由示意件表达。',
      specs: [['结构', '双层不锈钢腔'], ['提手', '藏蒸汽管与连杆'], ['水位窗', '侧窗可视余量'], ['来源', 'Poly Haven CC0']] },
    { id: 'element', zh: '密封电热盘', en: 'SEALED ELEMENT', real: false, kind: 'board',
      pos: [0, 0, 0],
      ex: [0, -1.6, 0], lo: [0, 1.2, 0], tag: '环形电热管 · 1500–3000W',
      desc: '电热盘（示意重建）：壶底一层铝盘里压着环形不锈钢管状电热元件，与水只隔一层金属——热效率高、水垢好清理（盘面平整无死角）。功率 1500–3000W：一升半水从 20°C 到沸腾只要三四分钟，全靠这圈管子把电功率几乎无损耗地灌进水里。',
      specs: [['功率', '1500–3000 W'], ['结构', '铝盘内嵌环形管'], ['效率', '~80% 直热'], ['口径', '示意重建']] },
    { id: 'thermostat', zh: '蒸汽温控器', en: 'STEAM THERMOSTAT', real: false, kind: 'board',
      pos: [0, 0, 0],
      ex: [1.6, 0.8, 1.4], lo: [0, 1.2, 0], tag: '双金属突跳 · 沸腾自动关火',
      desc: '蒸汽温控器（示意重建）：壶身侧的蒸汽管把内胆顶部的沸水蒸汽引到手柄底部的双金属蒸汽板——水开则汽足，双金属片受热形变超过临界点，「啪」地突跳翻转，顶开开关触点。这条无芯片的沸腾检测链稳定可靠到近乎永恒：突跳片几万次循环都不疲劳。',
      specs: [['传感', '蒸汽管 + 双金属板'], ['动作', '突跳翻转（Snap Action）'], ['寿命', '数万次循环'], ['口径', '示意重建']] },
    { id: 'switch', zh: '开关杆与连杆', en: 'SWITCH LEVER & ROD', real: false, kind: 'board',
      pos: [0, 0, 0],
      ex: [1.9, 1.0, 0.9], lo: [0, 1.0, 0], tag: '手动开 · 汽动关 · 连杆一条',
      desc: '开关连杆（示意重建）：手柄上的拨杆经一根直连杆下推底部触点通电；沸腾时双金属突跳反向顶开同一组触点——「人合上、汽断开」，一条连杆两种来源。干烧保护同源：无水时盘温骤升，温控器同样跳断。演示为拨杆摆动示意。',
      specs: [['合闸', '手拨杆 → 连杆 → 触点'], ['断电', '双金属反向顶开'], ['干烧', '同链兜底'], ['口径', '示意重建']] },
    { id: 'water-glass', zh: '水位窗', en: 'WATER GAUGE GLASS', real: true,
      ex: [0, 0.2, 1.5], lo: [0, 1.1, 0], tag: '光进水不出 · 侧窗读余量',
      desc: '水位窗：壶身侧面的玻璃视窗——透过它读水位。玻璃与不锈钢腔的密封靠垫圈压紧；窗内直接接触热水与蒸汽，是最考验密封工艺的部件。玻璃件来自 Poly Haven CC0 扫描。',
      specs: [['读数', '水位余量直观可视'], ['密封', '垫圈压紧'], ['工况', '直面沸水蒸汽'], ['来源', 'Poly Haven CC0']] },
    { id: 'connector', zh: '底部电源耦合器', en: '360° CONNECTOR', real: false, kind: 'board',
      pos: [0, 0, 0],
      ex: [0, -2.4, 1.1], lo: [0, 1.0, 0], tag: '任意角度归位 · 拎起即断电',
      desc: '电源耦合器（示意重建）：壶底的圆形公座与底座的母座可 360° 任意角度啮合——放回底座不用对准方向；触点藏在凹腔里，壶一提离底座即彻底断电，桌面上永远不会有一根带电的线连着壶。这项设计让电水壶成为厨房里最安全的电器之一。',
      specs: [['啮合', '360° 任意角度'], ['安全', '提起即全断电'], ['触点', '凹腔内藏'], ['口径', '示意重建']] },
  ],
});
