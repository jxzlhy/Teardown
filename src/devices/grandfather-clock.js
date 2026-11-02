/* =============================================================
   设备配置：落地摆钟（Poly Haven · CC0 扫描 + 程序化示意内构件）
   混合路径（Game Boy / 微波炉先例）：真实钟壳+双针（3 节点名语义）+
   摆锤/重锤/机芯为示意重建件（原模型无内构件），页面口径如实标注。
   归一化后钟壳 1.87×6.5×1.28（x×y×z，纵向最长轴归一），原点=bbox 中心。
   摆锤演示用真实速率（周期约 2s，ω=π rad/s）——肉眼可见的真实物理。
============================================================= */
import { makeDevice } from './_kit/factory.js';
import * as THREE from 'three';

const builders = {
  /* 示意内构件：引擎尺度（钟壳高 6.5），按真机布局摆位 */
  pendulum: (g) => {
    const grp = new THREE.Group();
    /* 摆杆（木质细杆） */
    const rod = new THREE.Mesh(new THREE.BoxGeometry(0.07, 3.4, 0.05),
      new THREE.MeshStandardMaterial({ color: 0x6b4a2f, metalness: 0.1, roughness: 0.7 }));
    rod.position.y = -1.55;
    rod.name = 'PendulumRod';
    grp.add(rod);
    /* 摆簧（顶部调节簧视觉） */
    const spring = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.3, 8),
      new THREE.MeshStandardMaterial({ color: 0xb08d57, metalness: 0.9, roughness: 0.38 }));
    spring.position.y = 0.15;
    spring.name = 'PendulumSpring';
    grp.add(spring);
    /* 摆锤（黄铜圆盘） */
    const bob = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.09, 28),
      new THREE.MeshStandardMaterial({ color: 0xb08d57, metalness: 0.9, roughness: 0.32 }));
    bob.rotation.x = Math.PI / 2;
    bob.position.y = -3.25;
    bob.name = 'PendulumBob';
    grp.add(bob);
    grp.name = 'PendulumGrp';
    g.add(grp);
  },
  weights: (g) => {
    /* 两只重锤（走时/报时各一，铸铁筒形）——真实落地钟常见双锤或三锤 */
    const iron = new THREE.MeshStandardMaterial({ color: 0x3a3f44, metalness: 0.55, roughness: 0.5 });
    for (const [i, x] of [-0.42, 0.42].entries()) {
      const w = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.17, 0.62, 18), iron);
      w.position.set(x, -0.9 - i * 0.35, 0.18);
      w.name = 'Weight' + (i + 1);
      g.add(w);
      const hook = new THREE.Mesh(new THREE.TorusGeometry(0.045, 0.012, 6, 14),
        new THREE.MeshStandardMaterial({ color: 0xb08d57, metalness: 0.9, roughness: 0.38 }));
      hook.position.set(x, -0.55 - i * 0.35, 0.18);
      hook.name = 'WeightHook' + (i + 1);
      g.add(hook);
    }
  },
  movement: (g) => {
    /* 机芯轮系示意：三轮 + 擒纵叉位（钟面后方） */
    const brass = new THREE.MeshStandardMaterial({ color: 0xb08d57, metalness: 0.9, roughness: 0.36 });
    const steel = new THREE.MeshStandardMaterial({ color: 0x8d969e, metalness: 0.82, roughness: 0.4 });
    const gear = (r, thick, mat) => {
      const ge = new THREE.Mesh(new THREE.CylinderGeometry(r, r, thick, 24), mat);
      ge.rotation.x = Math.PI / 2;
      return ge;
    };
    const g1 = gear(0.34, 0.06, brass); g1.position.set(-0.28, 2.35, 0.02); g1.name = 'Wheel1';
    const g2 = gear(0.22, 0.06, brass); g2.position.set(0.16, 2.48, 0.02); g2.name = 'Wheel2';
    const g3 = gear(0.16, 0.05, steel); g3.position.set(0.42, 2.3, 0.02); g3.name = 'Wheel3';
    const arbor = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.4, 8), steel);
    arbor.position.set(-0.28, 2.35, 0.02); arbor.name = 'Arbor1';
    g.add(g1, g2, g3, arbor);
    /* 擒纵叉示意（指向摆杆顶） */
    const anchor = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.08, 0.04), steel);
    anchor.position.set(0, 2.05, 0.02);
    anchor.rotation.z = 0.18;
    anchor.name = 'EscapementAnchor';
    g.add(anchor);
  },
};

export default makeDevice({
  id: 'grandfather-clock',
  name: '落地摆钟',
  en: 'GRANDFATHER CLOCK',
  category: '钟表',
  brand: 'GENERIC',
  tagline: '重锤与摆的重力时钟 · 一摆一秒',
  description: '落地摆钟（ grandfather clock）是机械钟的集大成者：两只铸铁重锤的引力势能经绳索与轮系驱动指针，摆锤以约 2 秒一周的节拍通过擒纵机构「放行」齿轮——每摆一次，齿轮恰好转过一齿，滴答声就是擒纵叉锁住与释放轮齿的声音。摆长决定周期（单摆公式 T=2π√(L/g)），约 1 米的摆给出 2 秒的节拍，这也是钟壳要做成一人高的原因。钟面指针由轮系末端驱动，时针与分针的 12:1 减速在轮系里一目了然。钟壳与双针来自 Poly Haven CC0 扫描；摆锤、重锤、机芯轮系为示意重建件（原模型无内构件），按真机布局摆放并如实标注口径。',
  specs: [
    ['动力', '重锤势能（双锤：走时+报时）'],
    ['调速', '单摆 · 周期约 2s（摆长约 1m）'],
    ['节拍', '擒纵机构 · 一摆一齿'],
    ['轮系', '分针:时针 = 60:1 减速'],
    ['精度', '±数秒/日（恒温下）'],
    ['来源', 'Poly Haven CC0（钟壳）+ 示意内构件'],
  ],
  accent: '#8a6a45',
  source: 'Poly Haven（CC0 扫描）· 内构件为示意重建',
  modelCredit: 'Vintage Grandfather Clock by Poly Haven (CC0)',
  modelSource: 'https://polyhaven.com/a/vintage_grandfather_clock_01',
  targetWidth: 6.5,
  normalize: 'full',
  glb: '/assets/grandfather-clock.glb',
  tour: ['case', 'pendulum', 'weights', 'movement', 'hour-hand', 'minute-hand'],
  xrayShellIds: ['case'],
  frontAxis: '+z',
  unmappedTo: 'case',
  /* 3 节点语义名直映；Body 的两枚同名 primitive 同归钟壳 */
  mapping: {
    'vintage_grandfather_clock_01_Body': 'case',
    'vintage_grandfather_clock_01_HourHand': 'hour-hand',
    'vintage_grandfather_clock_01_MinuteHand': 'minute-hand',
  },
  realPartIds: ['case', 'hour-hand', 'minute-hand'],
  builders,
  demos: [
    { partId: 'pendulum', label: '摆锤真实周期摆动（~2s，示意）', wobble: [0.055, 0, 0], wobbleF: Math.PI },
    { partId: 'minute-hand', label: '分针真实速率旋转（1 圈/小时）', spin: 'auto', speed: 0.00175 },
    { partId: 'hour-hand', label: '时针真实速率旋转（1 圈/12 小时）', spin: 'auto', speed: 0.000145 },
  ],
  parts: [
    { id: 'case', zh: '钟壳与钟面', en: 'CASE & DIAL', real: true,
      ex: [0, 0.4, 0], lo: [0, 1.4, 0], tag: '一人高的原因 · 摆长约 1 米',
      desc: '钟壳：细高的木壳不是为了气派——单摆周期 T=2π√(L/g)，要 2 秒一周的从容节拍就得有约 1 米的摆长，钟壳因此必须一人高。壳内的玻璃门让人看见摆锤与重锤的运转；钟面（表盘）在轮系末端，双针背后的 12:1 减速轮系直接写在本页机芯示意里。钟壳来自 Poly Haven CC0 扫描。',
      specs: [['高度', '~2 m（摆长约 1 m）'], ['周期', 'T=2π√(L/g) ≈ 2s'], ['玻璃门', '透视摆与锤'], ['来源', 'Poly Haven CC0']] },
    { id: 'pendulum', zh: '摆杆与摆锤', en: 'PENDULUM', real: false, kind: 'board',
      pos: [0, 1.7, 0.12],
      ex: [0, -0.5, 1.3], lo: [0, 1.1, 0], tag: '一摆一秒 · 摆长定周期',
      desc: '摆锤（示意重建）：黄铜摆盘挂在细摆杆上，杆顶经微调簧悬挂——旋簧可微调摆长从而校准快慢。摆是钟的「心脏节拍器」：重力把它拉回中位，惯量让它越过中位，一次完整往复约 2 秒；擒纵机构在每个周期放行轮齿一格。摆动演示用真实周期（约 2s）。',
      specs: [['周期', '~2 s（真实速率演示）'], ['摆长', '~1 m'], ['校准', '杆顶微调簧'], ['口径', '示意重建']] },
    { id: 'weights', zh: '驱动重锤', en: 'DRIVE WEIGHTS', real: false, kind: 'board',
      pos: [0, 0, 0],
      ex: [0, -1.2, 0.9], lo: [0, 1.0, 0], tag: '引力势能 · 一周上一次弦',
      desc: '重锤（示意重建）：两只铸铁锤筒挂在绳索上，缓缓下坠输出动力——一只驱动走时轮系，一只驱动报时敲击；每周用手柄把锤拉回顶位（上弦）。重力是这只钟唯一的「电池」：不烧油不耗电，靠地球引力稳定输出，连续走一周。',
      specs: [['动力', '重锤下坠 · 引力势能'], ['数量', '双锤（走时+报时）'], ['上弦', '每周一次'], ['口径', '示意重建']] },
    { id: 'movement', zh: '机芯轮系', en: 'MOVEMENT TRAIN', real: false, kind: 'board',
      pos: [0, 0, 0],
      ex: [0, 1.3, -0.9], lo: [0, 1.2, 0], tag: '擒纵放行 · 一摆一齿',
      desc: '机芯轮系（示意重建）：重锤经绳筒驱动轮系，轮系末端被擒纵叉锁住——摆锤每摆过一次，擒纵叉释放一齿，轮系精确前进一格，「滴答」就是这两次锁-放的声音。轮系把速度逐级减下来：秒轮→分轮→时轮，分针与时针之间正好 60:1。三枚轮+擒纵叉为布局示意。',
      specs: [['擒纵', '一摆放行一齿'], ['滴答声', '锁齿-放齿两次'], ['减速', '分:时 = 60:1'], ['口径', '示意重建']] },
    { id: 'hour-hand', zh: '时针', en: 'HOUR HAND', real: true,
      ex: [0, 1.1, 0.9], lo: [0, 1.2, 0], tag: '12 小时一圈 · 真实速率',
      desc: '时针：从钟面轴心伸出的短针，12 小时转一圈——由时轮直接驱动，轮系在它身后已经把重锤的动力减速了数千倍。它慢到肉眼无法察觉转动，但这正是机械钟的庄严：一切都精确、缓慢、从不停歇。旋转演示用真实速率（1 圈/12 小时）。',
      specs: [['周期', '12 h / 圈（真实速率）'], ['驱动', '时轮'], ['减速', '轮系末端'], ['来源', 'Poly Haven CC0']] },
    { id: 'minute-hand', zh: '分针', en: 'MINUTE HAND', real: true,
      ex: [0, 0.6, 1.2], lo: [0, 1.0, 0], tag: '1 小时一圈 · 真实速率',
      desc: '分针：长针直接坐在分轮轴上，1 小时转一圈；它与时针之间是轮系里最重要的 60:1 减速对。分针的「步进」其实来自擒纵的一格格放行——每一次滴答，分针都前进了一圈的 1/3600。旋转演示用真实速率（1 圈/小时）。',
      specs: [['周期', '1 h / 圈（真实速率）'], ['驱动', '分轮直连'], ['步进', '每滴答 1/3600 圈'], ['来源', 'Poly Haven CC0']] },
  ],
});
