/* =============================================================
   设备配置：门锁机构（百年老锁 · 弹子锁机械）
   社区模型（Sketchfab · ReAnimate.xyz，CC-BY 4.0）：25 网格匿名命名，
   材质语义可靠（Brass 黄铜 / Steel_1 钢件 / Steel-High_Carbon 高碳钢簧片），
   描述含爆炸动画（分件已被动画证实）；静态位姿为装配态
   映射：材质功能聚类 + 尺寸分档（mapByPosition 第 4/5 参）
   结构：黄铜锁体→铜配件→钢制栓件→高碳钢簧片
============================================================= */
import { makeDevice } from './_kit/factory.js';

export default makeDevice({
  id: 'door-lock-mechanism',
  name: '门锁机构（百年老锁）',
  en: 'DOOR LOCK MECHANISM',
  category: '精密机械',
  brand: 'REANIMATE',
  tagline: '一把钥匙 · 五组弹子的精确对话',
  description: '弹子门锁的全部秘密在于"对齐"：钥匙的齿形把每组弹子顶到恰好齐平于锁芯分界线的位置，锁芯才能旋转——差一丝都不行。本页按零件材质与功能拆成 4 组：黄铜锁体与锁芯件（Brass）、钢制栓件与传动件（Steel）、高碳钢簧片（弹簧钢，负责把弹子顶回"锁死"位）、以及铜质配件。原模型带爆炸装配动画，分件关系经过动画验证。',
  specs: [
    ['类型', '弹子锁（pin tumbler）'],
    ['原理', '齿形对齐弹子分界线'],
    ['材质', '黄铜锁体 · 钢栓 · 高碳钢簧'],
    ['来源', '爆炸装配动画验证分件'],
    ['拆解', '4 组核心部件'],
  ],
  accent: '#b3822f',
  source: '社区模型（Sketchfab）',
  modelCredit: 'Door Locking Mechanism by ReAnimate.xyz (Sketchfab, CC-BY 4.0)',
  modelSource: 'https://sketchfab.com/3d-models/6cdf6da929644ec09bfc6ff6fe0d3528',
  targetWidth: 9,
  normalize: 'full',
  frontAxis: '+z',
  glb: '/assets/door-lock-mechanism.glb',
  mapByPosition(name, p, rel, ext, mat) {
    const biggest = Math.max(ext.x, ext.y, ext.z);
    if (mat === 'Steel-High_Carbon') return 'springs';
    if (mat === 'Brass') return 'lock-body';
    return 'steel-works';
  },
  tour: ['lock-body', 'steel-works', 'springs'],
  xrayShellIds: ['lock-body'],
  realPartIds: ['lock-body', 'steel-works', 'springs'],
  parts: [
    { id: 'lock-body', zh: '黄铜锁体', en: 'BRASS LOCK BODY', real: true,
      ex: [0, 0.4, 1.2], lo: [0, 1.2, 0], tag: '弹子系统的舞台 · 耐磨的黄金合金',
      desc: '锁体是整个机构的骨架：锁芯孔、弹子孔与栓槽都在黄铜件上加工成形。用黄铜不只为了好看——铜合金软硬适中，钥匙千次插拔后孔位不易毛刺卡死，且耐磨蚀。百年老锁还能转动，靠的就是这组合金件的耐受性。',
      specs: [['材质', '黄铜（铜锌合金）'], ['功能', '锁芯孔 / 弹子孔 / 栓槽'], ['寿命', '插拔千次级']] },
    { id: 'steel-works', zh: '钢制栓件与销钉', en: 'BOLT & PINS', real: true,
      ex: [-1.4, 0.2, 1.2], lo: [0, 1.1, 0.3], tag: '真正"锁门"的那根铁',
      desc: '钢制件是锁的执行与联动层：栓舌伸出或缩回直接执行"开门/锁门"，锁芯内的弹子与销钉则和簧片构成"锁死-对齐"的二态系统——钥匙不正确，弹子就卡在分界线上。钢的硬度保证栓舌在门框反复撞击下不变形；小件的加工精度决定钥匙"牙花"的组合数。',
      specs: [['执行', '栓舌伸出 / 缩回'], ['联动', '弹子 / 销钉 / 垫片'], ['材料', '钢（抗撞不变形）']] },
    { id: 'springs', zh: '高碳钢簧片', en: 'SPRINGS', real: true,
      ex: [0, 1.4, -1.2], lo: [0, 1.1, -0.2], tag: '把一切推回"锁死"的力量',
      desc: '高碳钢簧片是锁"自动上锁"的原因：每颗弹子都被簧片向下顶住，直到正确钥匙把它们顶到分界线。簧片的弹性衰减是老锁失灵的主因——压久了弹不回去，锁就"永远开着"。含碳量越高弹性越好，但也越脆。',
      specs: [['材料', '高碳钢（弹簧钢）'], ['功能', '常顶弹子至锁死位'], ['老化', '弹性衰减 → 失灵']] },
  ],
});
