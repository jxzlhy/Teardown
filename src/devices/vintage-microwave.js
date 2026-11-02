/* =============================================================
   设备配置：复古微波炉（Poly Haven · CC0 扫描 + 程序化示意内构件）
   混合路径（Game Boy 先例）：真实外壳（2 网格：壳体+门玻璃）+
   磁控管/变压器/电容/转盘为示意重建件（原模型无内构件），页面口径如实标注。
   归一化后壳体 6.5×3.22×4.56（x×y×z），门在 +z 面，内构件按真机布局摆位。
============================================================= */
import { makeDevice } from './_kit/factory.js';
import * as THREE from 'three';
import { matShell, matDark } from '../engine/materials.js';

const builders = {
  /* 示意内构件：引擎尺度（归一化后壳体 6.5 宽），位置表达真机布局关系 */
  magnetron: (g) => {
    const body = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.85, 0.8),
      new THREE.MeshStandardMaterial({ color: 0x9aa2a8, metalness: 0.6, roughness: 0.45 }));
    body.position.set(1.15, 0.5, -1.2);
    body.name = 'MagnetronBody';
    g.add(body);
    /* 散热鳍片 */
    const finMat = new THREE.MeshStandardMaterial({ color: 0x8a9298, metalness: 0.65, roughness: 0.4 });
    for (let i = 0; i < 6; i++) {
      const fin = new THREE.Mesh(new THREE.BoxGeometry(1.08, 0.03, 0.85), finMat);
      fin.position.set(1.15, 0.17 + i * 0.11, -1.2);
      fin.name = 'MagnetronFin' + i;
      g.add(fin);
    }
    /* 波导腔（伸向腔体角） */
    const wg = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.34, 0.5), finMat);
    wg.position.set(0.5, 0.5, -0.75);
    wg.name = 'Waveguide';
    g.add(wg);
    /* 天线帽 */
    const ant = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.2, 12),
      new THREE.MeshStandardMaterial({ color: 0xd8dde0, metalness: 0.8, roughness: 0.3 }));
    ant.position.set(1.15, 1.05, -1.2);
    ant.name = 'MagnetronAntenna';
    g.add(ant);
  },
  transformer: (g) => {
    const coreMat = new THREE.MeshStandardMaterial({ color: 0x4a4f55, metalness: 0.5, roughness: 0.55 });
    const copper = new THREE.MeshStandardMaterial({ color: 0xb08d57, metalness: 0.9, roughness: 0.38 });
    /* E-I 叠片铁芯：中柱 + 双侧柱 */
    const EI = new THREE.Group();
    const center = new THREE.Mesh(new THREE.BoxGeometry(0.42, 1.0, 0.55), coreMat);
    const sideL = new THREE.Mesh(new THREE.BoxGeometry(0.28, 1.0, 0.55), coreMat);
    const sideR = new THREE.Mesh(new THREE.BoxGeometry(0.28, 1.0, 0.55), coreMat);
    center.position.set(0, 0, 0); sideL.position.set(-0.52, 0, 0); sideR.position.set(0.52, 0, 0);
    EI.add(center, sideL, sideR);
    /* 绕组 */
    const w1 = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.56, 20), copper);
    w1.rotation.x = Math.PI / 2; w1.position.set(0, 0.12, 0);
    const w2 = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.56, 20), copper);
    w2.rotation.x = Math.PI / 2; w2.position.set(0, -0.38, 0);
    EI.add(w1, w2);
    EI.position.set(-1.9, -0.75, -1.3);
    EI.name = 'HVTransformer';
    g.add(EI);
  },
  capacitor: (g) => {
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.26, 0.95, 18),
      new THREE.MeshStandardMaterial({ color: 0x2f3a44, metalness: 0.4, roughness: 0.5 }));
    cap.rotation.z = Math.PI / 2;
    cap.position.set(0.3, -1.05, -1.4);
    cap.name = 'HVCapacitor';
    g.add(cap);
    /* 高压二极管（微动保护联 idea） */
    const diode = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.35, 10),
      new THREE.MeshStandardMaterial({ color: 0x22262a, metalness: 0.2, roughness: 0.6 }));
    diode.rotation.z = Math.PI / 2;
    diode.position.set(0.3, -1.5, -1.35);
    diode.name = 'HVDiode';
    g.add(diode);
  },
  turntable: (g) => {
    /* 转盘电机 */
    const motor = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.4, 16),
      new THREE.MeshStandardMaterial({ color: 0x555b60, metalness: 0.6, roughness: 0.5 }));
    motor.rotation.x = Math.PI / 2;
    motor.position.set(0.95, -0.6, 0.1);
    motor.name = 'TurntableMotor';
    g.add(motor);
    /* 玻璃托盘（腔内） */
    const tray = new THREE.Mesh(new THREE.CylinderGeometry(1.55, 1.55, 0.05, 36),
      new THREE.MeshStandardMaterial({ color: 0x30373c, metalness: 0.1, roughness: 0.15, transparent: true, opacity: 0.35 }));
    tray.position.set(0, 0, 0);
    tray.name = 'GlassTray';
    g.add(tray);
    /* 托盘辊环 */
    const rollers = new THREE.Mesh(new THREE.TorusGeometry(1.05, 0.045, 8, 32),
      new THREE.MeshStandardMaterial({ color: 0x6a7178, metalness: 0.5, roughness: 0.5 }));
    rollers.rotation.x = Math.PI / 2;
    rollers.position.set(0, -0.07, 0);
    rollers.name = 'TrayRollers';
    g.add(rollers);
  },
};

export default makeDevice({
  id: 'vintage-microwave',
  name: '复古微波炉',
  en: 'VINTAGE MICROWAVE',
  category: '厨电',
  brand: 'GENERIC',
  tagline: '2.45GHz 的磁控管 · 把水分子摇热的箱子',
  description: '微波炉的拆解看点全在后背：磁控管把市电变成 2.45GHz 微波，经波导馈入金属腔体——腔壁反射微波、食物吸收，水分子随交变电场每秒 49 亿次的摆动摩擦生热。高压侧由升压变压器（约 2100V）、高压电容与二极管组成倍压整流供磁控管；腔底转盘电机以约 5rpm 匀速转动玻璃托盘，弥补驻波场的不均匀。外壳与门玻璃来自 Poly Haven CC0 扫描；磁控管、变压器、电容、转盘为示意重建件（原模型无内构件），按真机布局摆放并如实标注口径。',
  specs: [
    ['工作频率', '2.45 GHz（ISM 频段）'],
    ['磁控管', '~1000W 输出 · 波导馈能'],
    ['高压侧', '变压器 ~2100V + 倍压整流'],
    ['转盘', '~5 rpm · 弥补场不均'],
    ['腔体', '金属反射腔 · 门网孔屏泄漏'],
    ['来源', 'Poly Haven CC0（外壳）+ 示意内构件'],
  ],
  accent: '#c96a3b',
  source: 'Poly Haven（CC0 扫描）· 内构件为示意重建',
  modelCredit: 'Vintage Microwave by Poly Haven (CC0)',
  modelSource: 'https://polyhaven.com/a/vintage_microwave',
  targetWidth: 6.5,
  normalize: 'full',
  glb: '/assets/vintage-microwave.glb',
  tour: ['shell', 'magnetron', 'transformer', 'capacitor', 'turntable', 'door-glass'],
  xrayShellIds: ['shell'],
  frontAxis: '+z',
  unmappedTo: 'shell',
  /* 壳体 2 primitive 同名（GLTFLoader 多 primitive 不加后缀）→ 按材质名分流（玻璃材质唯一） */
  materialMapping: {
    'vintage_microwave': 'shell',
    'vintage_microwave_glass': 'door-glass',
  },
  realPartIds: ['shell', 'door-glass'],
  builders,
  demos: [
    { partId: 'turntable', label: '转盘真实速率旋转（~5rpm 示意）', spin: 'auto', speed: 0.5 },
  ],
  parts: [
    { id: 'shell', zh: '机身壳体与腔体', en: 'CHASSIS & CAVITY', real: true,
      ex: [0, 0.4, 0], lo: [0, 1.5, 0], tag: '金属反射腔 · 门网孔防泄漏',
      desc: '壳体：冲压钢板围出的金属腔——微波在腔壁间来回反射，只在被食物吸收时衰减；门上的网孔玻璃让可见光通过（孔径远小于 12.4cm 波长）而把微波关在里面。腔体谐振形成驻波场，冷点热点交替，这正是转盘存在的理由。外壳来自 Poly Haven CC0 扫描，腔内布局由示意件表达。',
      specs: [['结构', '冲压钢板腔 + 门网孔'], ['反射', '腔壁来回反射'], ['驻波', '冷热点交替'], ['来源', 'Poly Haven CC0']] },
    { id: 'magnetron', zh: '磁控管与波导', en: 'MAGNETRON & WAVEGUIDE', real: false, kind: 'board',
      pos: [0, 0, 0],
      ex: [1.4, 0.6, -1.6], lo: [0, 1.3, 0], tag: '2.45GHz · 真空管微波源',
      desc: '磁控管（示意重建）：阳极铜瓣块 + 阴极 + 恒磁铁构成的真空二极管——电子在正交电磁场里摆出「轮辐」旋转，谐振腔瓣把能量变成 2.45GHz 微波，经波导馈入腔体。它把 ~1000W 的射频功率灌进一个饭盒大小的腔里，是微波炉唯一的「发动机」。示意件按真机位置（腔体右上后方）摆位。',
      specs: [['频率', '2.45 GHz'], ['功率', '~1000W'], ['原理', '正交场真空管'], ['口径', '示意重建']] },
    { id: 'transformer', zh: '高压变压器', en: 'HV TRANSFORMER', real: false, kind: 'board',
      pos: [0, 0, 0],
      ex: [-1.4, -0.2, -1.6], lo: [0, 1.2, 0], tag: '~2100V · 铁芯裸露的大家伙',
      desc: '高压变压器（示意重建）：E-I 叠片铁芯 + 初级/高压次级绕组，把 220V 市电升到约 2100V 供磁控管——微波炉里最重的单个元件（实机 3-4kg，铁芯裸露散热）。它是「漏磁变压器」：故意让漏磁大，磁控管起振后电流自限，省掉复杂的稳流电路。',
      specs: [['输出', '~2100V'], ['结构', 'E-I 铁芯 + 铜绕组'], ['特性', '漏磁自限流'], ['口径', '示意重建']] },
    { tag2: undefined, id: 'capacitor', zh: '高压电容与二极管', en: 'HV CAPACITOR & DIODE', real: false, kind: 'board',
      pos: [0, 0, 0],
      ex: [0.2, -0.9, -1.7], lo: [0, 1.1, 0], tag: '倍压整流 · 断电后仍致命',
      desc: '高压电容与二极管（示意重建）：与变压器次级组成倍压整流，把 ~2100V 抬到磁控管需要的负高压；断电后电容仍储有致命电荷——维修微波炉的第一戒律。示意件按真机位置（变压器旁）摆位。',
      specs: [['作用', '倍压整流'], ['危险', '断电后仍带电'], ['维修戒律', '先放电再动手'], ['口径', '示意重建']] },
    { id: 'turntable', zh: '转盘电机与玻璃托盘', en: 'TURNTABLE & TRAY', real: false, kind: 'board',
      pos: [-0.35, -0.35, 0.75],
      ex: [0, -1.3, 1.2], ex2: undefined,
      lo: [0, 1.0, 0], tag: '~5rpm 真实速率 · 摊平驻波冷热点',
      desc: '转盘与电机（示意重建）：腔底小齿轮电机以约 5rpm 匀速转托盘，让食物均匀扫过驻波场的冷点热点——没有它，加热斑纹会印在食物上。玻璃托盘与辊环为示意件，旋转演示用真实速率（无降频）。',
      specs: [['转速', '~5 rpm（真实速率）'], ['作用', '摊平冷热点'], ['传动', '电机 → 齿轮 → 托盘'], ['口径', '示意重建']] },
    { id: 'door-glass', zh: '门玻璃', en: 'DOOR GLASS', real: true,
      ex: [0, 0.2, 1.5], lo: [0, 1.2, 0], tag: '网孔屏 · 光进微波不出',
      desc: '门玻璃：带金属网孔的视窗——网孔直径远小于微波半波长（12.4cm），可见光畅通而微波被反射回腔内，法拉第笼原理最日常的应用。开门联锁开关在门钩带动下瞬间切断高压供电，门没关严微波炉是启动不了的。',
      specs: [['原理', '法拉第笼 · 网孔屏'], ['孔径', '≪ 12.4cm 半波长'], ['联锁', '门钩 → 双重联锁开关'], ['来源', 'Poly Haven CC0']] },
  ],
});
