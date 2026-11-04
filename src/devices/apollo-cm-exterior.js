/* =============================================================
   设备配置：阿波罗 11 号指令舱外壳（Smithsonian CC0）
   来源：3d.si.edu（S3 免 key 通道）· uuid d8c6457e（CM-107 外部包）
   2 单网格分包 merge + fix-scene：shell(90k 级 主壳) + top(160k 级 锥顶)
   bbox 毫米扫描坐标（shell 中心 y≈150 / top y≈285 → y<220 路由）
   结构：主壳体（热盾烧结面+侧壁）→ 顶部锥段（对接环+主伞舱盖）
   与 apollo-cm-interior / apollo-hatch 构成"外壳→座舱→舱门"递进展线
============================================================= */
import { makeDevice } from './_kit/factory.js';

export default makeDevice({
  id: 'apollo-cm-exterior',
  era: 1969,
  name: '阿波罗 11 号指令舱外壳',
  en: 'APOLLO CM EXTERIOR',
  category: '航天',
  brand: 'SMITHSONIAN',
  tagline: '28,000 km/h 回来时的样子',
  description: '阿波罗 11 号指令舱"哥伦比亚"（CM-107）的外壳——从月球回来的模样：再入大气层时它以每小时 4 万公里的速度扎进大气，表面温度烧到 3000°C，热盾烧结出的碳化层与烧蚀痕迹原样保留在壳体上。锥形侧壁覆盖不锈钢钎焊蜂窝层（外层钢、中间铜、内层铝的"三明治"），顶部锥段藏着主降落伞舱与对接环。舱内世界见相邻展项：座舱内部扫描与舱门 CAD——这层金属皮，是三名航天员与真空之间唯一的墙。',
  specs: [
    ['结构', '钎焊蜂窝三明治（钢/铜/铝）'],
    ['再入', '~40000 km/h · 表面 3000°C'],
    ['热盾', 'AVCOAT 烧蚀材料'],
    ['顶部', '对接环 + 主伞舱盖'],
    ['馆藏', 'NASM · CM-107 Columbia'],
  ],
  accent: '#8f9aa3',
  /* 质量分级 B：SI 官方扫描 + 2 组件位置路由；未经运行时逐件核验不评 A */
  quality: 'B',
  source: 'Smithsonian 开放获取（NASA 扫描）',
  modelCredit: 'Apollo 11 Command Module Exterior — Smithsonian NASM (CM-107), CC0',
  modelSource: 'https://3d.si.edu/',
  targetWidth: 9.5,
  camDist: 1.15,
  normalize: 'full',
  frontAxis: '+z',
  glb: '/assets/apollo-cm-exterior.glb',
  /* 2 组件位置路由（merge 后扫描坐标实测）：top 锥段中心 y≈285 */
  mapByPosition(name, p, rel) {
    if (p.y > 220) return 'nose-section';
    return 'main-shell';
  },
  tour: ['main-shell', 'nose-section'],
  realPartIds: ['main-shell', 'nose-section'],
  parts: [
    { id: 'main-shell', zh: '主壳体', en: 'MAIN SHELL', real: true,
      ex: [-0.9, 0.2, 0.4], lo: [0, 1.2, 0.2], tag: '烧蚀热盾 · 蜂窝三明治',
      desc: '指令舱的主壳体：钝头底部是一整块 AVCOAT 烧蚀热盾——再入时它按设计"烧掉自己"带走热量，表面烧结的碳化纹理在扫描件上清晰可见；锥形侧壁是钎焊蜂窝三明治（外钢/中铜/内铝），每格蜂窝手工填入钎料，阿波罗计划共填了 47 万格。侧壁上那道纵缝就是舱门的安装位——舱门展项的主角就嵌在这里。',
      specs: [['热盾', 'AVCOAT 烧蚀 · 一次性'], ['侧壁', '钎焊蜂窝 ×47 万格'], ['痕迹', '再入烧结原样保留']] },
    { id: 'nose-section', zh: '顶部锥段', en: 'NOSE SECTION', real: true,
      ex: [0, 1.2, 0], lo: [0, 1.2, 0], tag: '对接环 · 主伞舱盖',
      desc: '锥形顶段：最前端是对接环（与登月舱"鹰号"对接的接口，窗前的目视参照就在这里），环下四个圆孔是主降落伞的伞舱——溅落前三顶 25 米大伞从这里弹出，把 5.9 吨的舱体从每小时 400 公里减速到 35 公里落海。伞舱盖在开伞时被弹射抛掉，所以馆藏件上是敞开的孔口。',
      specs: [['对接', '探针-环式 · 目视手动'], ['回收', '三伞 25m · 溅落 35km/h']] },
  ],
});
