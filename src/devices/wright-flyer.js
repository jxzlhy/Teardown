/* =============================================================
   设备配置：1903 莱特飞行者（Smithsonian 开放获取 · CC0）
   来源：3d.si.edu（S3 免 key 通道）· NASM A19610048000
   3 网格（Engine/Filler/Wings）×15 primitive · 6 张 2K 贴图 · 真机尺度 12.3m 翼展
   材质名 Default OBJ（扫描资产）→ mappingPrefix 三段直映射
   bbox 12.3×2.8×6.4m（Y 上 · 翼展沿 X）
   结构：12 马力四缸引擎（Taylor 制作）→ 木布机身与起橇 → 双翼+翘曲操纵
============================================================= */
import { makeDevice } from './_kit/factory.js';

export default makeDevice({
  id: 'wright-flyer',
  era: 1903,
  name: '1903 莱特飞行者',
  en: '1903 WRIGHT FLYER',
  category: '航天',
  brand: 'SMITHSONIAN',
  tagline: '12 秒 · 36 米 · 第一次动力飞行',
  description: '1903 年 12 月 17 日，基蒂霍克沙丘上，莱特飞行者载着弟弟奥维尔飞了 12 秒、36 米——人类第一次有动力、可操纵、重于空气的载人飞行。它是自行车匠的杰作：12 马力四缸铝壳引擎由技师查尔斯·泰勒打造（是全机唯一请人帮忙的部分）；三轴操纵靠"翘曲机翼"（wing warping）扭曲翼尖副翼实现，钢质张线经滑轮组牵动翼后缘。全机没有一根多余的杆件——博物馆扫描件（NASM A19610048000）把引擎、骨架与翼面分件数字化，附带 40 条策展人注释。',
  specs: [
    ['首飞', '1903-12-17 · 基蒂霍克'],
    ['引擎', '12 hp · 四缸直列（Charles Taylor 制作）'],
    ['翼展', '12.3 m · 双翼'],
    ['操纵', '三轴 · 翘曲机翼'],
    ['馆藏', 'NASM A19610048000 · Smithsonian'],
  ],
  accent: '#c8a86b',
  /* 质量分级 B：博物馆级扫描 + 40 条官方注释可考；3 网格粗分件，不评 A */
  quality: 'B',
  source: 'Smithsonian 开放获取（CC0）',
  modelCredit: '1903 Wright Flyer — Smithsonian National Air and Space Museum (NASM A19610048000), CC0',
  modelSource: 'https://airandspace.si.edu/collection-objects/1903-wright-flyer/nasm_A19610048000',
  targetWidth: 10,
  camDist: 1.2,
  normalize: 'full',
  frontAxis: '+z',
  glb: '/assets/wright-flyer.glb',
  realSizeMM: 12300,   /* 真实最大外形尺寸（Smithsonian 官方：翼展 12.3m×长 6.4m×高 2.8m，1903 原机藏件）：测量工具 mm 标定基准 */
  mappingPrefix: {
    'CC03-Flyer-Engine-Mesh': 'engine',
    'CC03-Flyer-Filler-Mesh': 'airframe',
    'CC03-Flyer-Wings-Mesh': 'wings',
  },
  tour: ['engine', 'airframe', 'wings'],
  /* 无独立外壳网格（开放骨架结构），不设 xrayShellIds */
  realPartIds: ['engine', 'airframe', 'wings'],
  /* AURORA 后/V5.1 内容深度：1903 飞行者动力传动（机构学史料明确）——
     直列四缸水冷引擎经自行车链条（双链）驱动翼后两具推式螺旋桨（反向对转消扭）。
     链条/桨轴/螺旋桨含于 engine 部件（1953 年前拆解件未细分）——传动关系如实声明于 note。 */
  mech: { edges: [
    { id:'bl-engine-prop', type:'gear_mesh', from:'engine', to:'airframe', kinematic:'approx',
      note:'引擎曲轴经双自行车链条减速驱动翼后两具推式螺旋桨（反向对转消除扭矩反作用——链条与桨含于部件未独立拆件，速比史料口径 1:1.5）' },
    { id:'fx-engine-airframe', type:'fixed', from:'engine', to:'airframe', kinematic:'exact',
      note:'引擎安装于下翼右侧翼梁间的框架（与飞行方向反向布置）' },
    { id:'fx-wings-airframe', type:'fixed', from:'wings', to:'airframe', kinematic:'exact',
      note:'双翼与尾翼组张线支撑固接于骨架（翘曲操纵为柔性变形非机构边）' },
  ] },
  postLoad: ({ partsById }) => {
    /* 白布翼+白光布光下过曝（radial 同款）：整体压暗 */
    for (const pid of ['engine', 'airframe', 'wings']) {
      const p = partsById[pid]; if (!p) continue;
      p.group.traverse(o => {
        if (!o.isMesh) return;
        const mats = Array.isArray(o.material) ? o.material : [o.material];
        for (const m of mats) { if (m.color) m.color.multiplyScalar(0.42); }
      });
    }
  },
  parts: [
    { id: 'engine', zh: '12 马力引擎', en: 'ENGINE', real: true,
      ex: [-0.9, 0.2, 0.4], lo: [0, 1.1, 0.3], tag: '铝壳四缸 · 自行车匠造',
      desc: '12 马力、四缸直列水冷汽油引擎——莱特兄弟唯一请人帮忙的部分：自行车店技师查尔斯·泰勒（Charles Taylor）打造了引擎的大量零件。铝制曲轴箱减重，铸铝工艺在当时极超前；没有化油器，汽油靠重力和引擎震颤自行混合。第一次飞行那天，它连续运转了 12 秒，却改变了整个世界。',
      specs: [['功率', '12 hp · 四缸直列'], ['曲轴箱', '铸铝（时代首创）'], ['制作者', 'Charles E. Taylor']] },
    { id: 'airframe', zh: '机身与起橇', en: 'AIRFRAME', real: true,
      ex: [0, 0.3, -0.9], lo: [0, 1.1, -0.2], tag: '云杉木+平纹布 · 无蒙皮蒙骨',
      desc: '飞行者的"身体"是裸露的骨架：云杉木桁条与张力钢线织成盒形梁，外面不蒙皮——让风穿过结构，减重且便于修理。下方两根雪橇式起落滑橇代替轮子（沙地上滑跑），前端双直立散热片是水冷系统的水箱。自行车匠的思路：能用张力解决的绝不用实心料。',
      specs: [['材料', '云杉木 + 平纹细布 + 钢线'], ['起落', '滑橇（沙地滑跑）']] },
    { id: 'wings', zh: '双翼与翘曲操纵', en: 'WINGS & WARPING', real: true,
      ex: [0, 1.1, 0], lo: [0, 1.3, 0], tag: '三轴操纵 · 翼尖扭曲',
      desc: '上下双翼由支柱与钢质张线张成盒形（wing bracing），翼后缘连接到滑轮组钢线——驾驶座上摇动臀 cradle，机翼后缘反向扭转（wing warping）：一侧增升一侧减升，飞机就此侧倾转弯。这是莱特兄弟的核心专利：三轴操纵让飞机"可控"，比飞起来本身更重要。',
      specs: [['操纵', '翘曲机翼 · 三轴'], ['机构', '滑轮组 + 钢线'], ['专利', 'Wright 821393（1906）']] },
  ],
});
