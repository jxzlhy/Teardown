/* =============================================================
   设备配置：阿波罗 11 号指令舱座舱（可进入式扫描 · Smithsonian CC0）
   来源：3d.si.edu（S3 免 key 通道）· uuid d8c63e8a（CM-107 内部包）
   4 单网格分包 merge：hull(44.6k tri) + panel(10.7k) + seats(59k) + graffiti(429)
   merge 后节点名丢失（undefined×4）→ mapByPosition 位置特征路由：
   graffiti z<-20（薄层贴花）/ seats y<170（低位座舱）/ panel z<20 / hull 其余
   bbox 279×251×249mm 扫描坐标（真机座舱 2.8m 直径）
   结构：压力壳内壁 → 仪表面板 → 三席座椅与束带 → 墙面涂鸦层
============================================================= */
import { makeDevice } from './_kit/factory.js';

export default makeDevice({
  id: 'apollo-cm-interior',
  era: 1969,
  name: '阿波罗 11 号指令舱座舱',
  en: 'APOLLO CM INTERIOR',
  category: '航天',
  brand: 'SMITHSONIAN',
  tagline: '3.1 立方米 · 三个人的月球往返',
  description: '阿波罗 11 号指令舱"哥伦比亚"（CM-107）的座舱内部——博物馆级"可进入式"扫描，全馆唯一能看进舱里的展品。直径 2.8 米的锥形舱里塞下三张座椅、两台导航望远镜、四个主仪表面板和 600 多个开关；舱壁上还有航天员们起飞前留下的铅笔涂鸦（本件的 graffiti 层扫描把这些手迹原样带回来了）。没有洗手间、没有铺位、热控靠 miniskirt 短裤——三名航天员就在这三立方米的甜蜜家里挤了八天。门、热盾与外部防热层见相邻展项：舱门 CAD 与指令舱外壳。',
  specs: [
    ['舱内容积', '约 3.1 m³（乘车 3 人）'],
    ['面板', '4 主面板 · 600+ 开关'],
    ['座椅', '3 席 · 五点束带'],
    ['涂鸦', '舱壁铅笔手迹（graffiti 层）'],
    ['馆藏', 'NASM · CM-107 Columbia'],
  ],
  accent: '#9aa5ad',
  /* 质量分级 B：SI 可进入式扫描 + 4 组件位置路由；未经运行时逐件核验不评 A */
  quality: 'B',
  source: 'Smithsonian 开放获取（NASA 扫描）',
  modelCredit: 'Apollo 11 Command Module Interior — Smithsonian NASM (CM-107), CC0',
  modelSource: 'https://3d.si.edu/',
  targetWidth: 9.5,
  camDist: 1.15,
  normalize: 'full',
  frontAxis: '+z',
  glb: '/assets/apollo-cm-interior.glb',
  /* merge 后网格无名 → 位置特征路由（GLB JSON 实测中心/面数）：
     graffiti 429 面 z≈-43 薄层 / seats 中心 y≈160 / panel z≈7 / hull 其余 */
  mapByPosition(name, p, rel) {
    if (p.z < -20) return 'graffiti';
    if (p.y < 170) return 'seats';
    if (p.z < 20) return 'panel';
    return 'hull';
  },
  tour: ['hull', 'panel', 'seats', 'graffiti'],
  realPartIds: ['hull', 'panel', 'seats', 'graffiti'],
  parts: [
    { id: 'hull', zh: '压力舱壳内壁', en: 'PRESSURE HULL', real: true,
      ex: [0, 0.3, 0.7], lo: [0, 1.2, 0.2], tag: '双曲面铝壳 · 3.1 m³',
      desc: '座舱的家底：双层铝制压力壳的内壁——外壁扛再入热流，内壁维持 5 psi 纯氧环境。锥形截面是"能塞进火箭头顶"与"装下三个人"之间的妥协；内壁上密布的螺接框是面板与储物袋的安装轨。整个座舱只有 3.1 立方米——三个成年人挤八天，比一辆小轿车还小。',
      specs: [['结构', '双层铝壳 · 夹层'], ['容积', '约 3.1 m³'], ['环境', '5 psi 纯氧']] },
    { id: 'panel', zh: '仪表面板组', en: 'INSTRUMENT PANELS', real: true,
      ex: [-0.6, 0.5, -0.4], lo: [0, 1.2, -0.2], tag: '600+ 开关 · 飞行的全部命令',
      desc: '面板 1-4 号覆盖舱的前半部：导航望远镜、计算机显示键盘、姿态控制器、燃料电池状态、告警矩阵——飞船的每一个命令都从这几块面板发出。设计哲学是"飞行器信不过自动系统"：600 多个开关让航天员对每一步都有一票否决。阿姆斯特朗登月那年，这些开关背后的手册有整整一书架。',
      specs: [['面板', '4 组 · 主面板在左席'], ['开关', '600+ · 手动优先'], ['导航', '望远镜 + 惯性平台']] },
    { id: 'seats', zh: '三席座椅与束带', en: 'COUCHES & HARNESSES', real: true,
      ex: [0, -0.9, 0.3], lo: [0, 1.1, 0], tag: '五点束带 · 7g 发射过载',
      desc: '三张定制座椅（按每人的体型 individually 制作）挂在舱壁悬臂上：发射与再入时承受最高 7g 过载，五点束带把人锁进座椅——座椅本身没有减震，缓冲全靠座垫与姿态。土星五号点火那一刻，三人躺在这些座椅上经历了人类历史上最响的起飞；回程时他们又躺在同样的位置，看着月球一点点变大再变小。',
      specs: [['布局', '2+1 · 指令长居左'], ['过载', '发射 ~4g · 再入 ~7g'], ['定制', '按体型 individually']] },
    { id: 'graffiti', zh: '舱壁涂鸦层', en: 'GRAFFITI LAYER', real: true,
      ex: [0.5, 0.9, -0.6], lo: [0, 1.2, -0.3], tag: '铅笔手迹 · 扫描原样带回',
      desc: '本件最动人的部分：墙体上的铅笔字迹与圆规刻痕——发射前查克·月球车配件的清单、玩笑、倒计时标记，全部被毫米级扫描原样数字化。NASA 工程师与航天员在机器上留下的"人味"，正式文档里永远不会记录；这层薄薄的贴花是他们在场的唯一物证。扫描件把它单独分层，让它可以被单独看见。',
      specs: [['内容', '清单 · 玩笑 · 标记'], ['数字化', '独立贴花层 · 毫米级']] },
  ],
});
