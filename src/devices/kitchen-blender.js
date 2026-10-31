/* =============================================================
   设备配置：厨房搅拌机（台式 · 食品制备机械）
   社区模型（Sketchfab · shiskin，CC-BY 4.0）：13 网格
   （3ds Max 匿名名 Cylinder004/Object005…，位置语义明确）
   bbox 48×101×50cm，Y 上；前面板（拨盘/刻度）在 +Z → frontAxis '+z'
   结构：底座→控制拨盘→联轴器→搅拌杯（含柄）→刀组→杯盖
============================================================= */
import { makeDevice } from './_kit/factory.js';

export default makeDevice({
  id: 'kitchen-blender',
  demos: [
    { partId: 'blades', label: '搅拌刀片高速旋转（降速示意）', spin: 'auto', speed: 12 },
  ],
  name: '厨房搅拌机',
  en: 'KITCHEN BLENDER',
  category: '厨电',
  brand: 'GENERIC',
  tagline: '电机在上 · 刀组在下 · 一杯打天下',
  description: '台式搅拌机：底座里立式电机通过联轴器直接驱动杯底的刀组，杯体旋紧即闭合安全回路。它是把"马达 + 刀 + 容器"压进一个 footprint 的最短路径——没有传动带、没有齿轮箱，转速直接上到两万转级别。本页按"底座→控制→传动→杯体→刀组"拆成 6 组，刀组三片金属刀刃与杯底耦合器各自独立网格。',
  specs: [
    ['类型', '台式搅拌机（立式电机直驱）'],
    ['结构', '底座电机 · 联轴器 · 杯底刀组'],
    ['控制', '刻度拨盘（多段速）'],
    ['杯体', '锥形搅拌杯 + 侧手柄'],
    ['拆解', '6 组核心部件'],
  ],
  accent: '#5ec8a8',
  source: '社区模型（Sketchfab）',
  modelCredit: 'Kitchen Blender by shiskin (Sketchfab, CC-BY 4.0)',
  modelSource: 'https://sketchfab.com/3d-models/kitchen-blender-ce3d8add9f454fb6b6aa70f0ddcefa22',
  targetWidth: 12,
  camDist: 1.3,
  normalize: 'full',
  frontAxis: '+z',
  glb: '/assets/kitchen-blender.glb',
  postLoad: ({ partsById }) => {
    /* 白色塑料机身在强光+Bloom 下过曝：整体压暗 */
    for (const pid of ['base', 'control-dial', 'coupler', 'jar', 'blades', 'lid']) {
      const p = partsById[pid]; if (!p) continue;
      p.group.traverse(o => {
        if (!o.isMesh) return;
        const mats = Array.isArray(o.material) ? o.material : [o.material];
        for (const m of mats) { if (m.color) m.color.multiplyScalar(0.42); }
      });
    }
  },
  mappingPrefix: {
    'Cylinder004_01': 'base',
    'Object005_09':   'base',
    'TextPlus002_09': 'control-dial',
    'numbers002_09':  'control-dial',
    'numbers003_09':  'control-dial',
    'Object006_metal':'control-dial',
    'Cylinder004_09': 'coupler',
    'Cylinder005_02': 'jar',
    'Object004_01':   'jar',
    'Object007_08':   'blades',
    'Plane003_metal': 'blades',
    'Plane004_metal': 'blades',
    'Cylinder006_01': 'lid',
  },
  tour: ['base', 'control-dial', 'coupler', 'blades', 'jar', 'lid'],
  xrayShellIds: ['jar', 'base'],
  realPartIds: ['base', 'control-dial', 'coupler', 'jar', 'blades', 'lid'],
  parts: [
    { id: 'base', zh: '底座（电机仓）', en: 'MOTOR BASE', real: true,
      ex: [0, -0.4, 1.2], lo: [0, 1.0, 0], tag: '立式电机直驱 · 无中间传动',
      desc: '底座是整机的重量中心：立式电机竖装其中，输出轴朝上穿过顶面。直驱结构意味着没有皮带或齿轮——电机的两万转就是刀的两万转，也因此底座必须用配重和减震脚把振动压住。杯体旋上时顶压微动开关闭合回路，这是搅拌机的"安全联锁"。',
      specs: [['驱动', '立式电机直驱'], ['联锁', '杯体压合微动开关'], ['减振', '配重 + 减震脚']] },
    { id: 'control-dial', zh: '控制拨盘', en: 'CONTROL DIAL', real: true,
      ex: [0, -0.9, 2.2], lo: [0, 0.8, 1.4], tag: '刻度盘 · 从点动到碎冰',
      desc: '正面刻度拨盘：低段用于搅拌/混合，高段用于碎冰与破壁，点动档靠脉冲通断控制冲击力。旋钮背后的凸轮开关是底座里少数的机械易损件——手感变"肉"通常就是它磨了。',
      specs: [['形式', '旋转刻度盘'], ['档位', '点动 / 多段速'], ['易损', '凸轮开关']] },
    { id: 'coupler', zh: '联轴器', en: 'COUPLER', real: true,
      ex: [1.4, 0.6, 0.6], lo: [0, 1.2, 0], tag: '电机轴 → 刀轴的唯一定位',
      desc: '联轴器是电机轴与刀轴之间唯一的机械接口：两端各带啮合齿，杯底刀座的齿插进电机联轴器的齿里，旋紧杯体即完成"合轴"。它是全机受力最集中也最常换的塑料件——打硬物打滑，多半是这里磨圆了。',
      specs: [['形式', '啮合齿直连'], ['材料', '强化塑料'], ['失效', '齿面磨圆 → 打滑']] },
    { id: 'blades', zh: '刀组', en: 'BLADE ASSEMBLY', real: true,
      ex: [0, 1.6, 0.8], lo: [0, 1.3, 0], tag: '三片焊接刀刃 · 轴承座一体',
      desc: '刀组焊在轴套上，经 FOOD 级轴承座装进杯底：下端进联轴器，上端三片刀刃按不同倾角排布——下压、上抛、侧卷，形成漩涡把食材反复带向刀刃。刀组与杯底之间是全机最关键的水密点。',
      specs: [['刃数', '3 片焊接'], ['轴承', '食品级水密封'], ['失效', '密封圈老化渗漏']] },
    { id: 'jar', zh: '搅拌杯', en: 'BLENDER JAR', real: true,
      ex: [-1.6, 2.2, 0.4], lo: [0, 1.4, 0], tag: '锥形杯体 · 漩涡的形状来源',
      desc: '杯体上宽下窄的锥形不是造型——它迫使漩涡直径向下收敛，把食材不断压回刀刃区；侧手柄与杯口螺纹承担全部旋紧力。杯壁刻度既是量具，也标出了安全容量上限：超过它，漩涡会把盖子顶开。',
      specs: [['形状', '上宽下窄锥形'], ['功能', '引导漩涡收敛'], ['上限', '刻度即安全容量']] },
    { id: 'lid', zh: '杯盖', en: 'LID', real: true,
      ex: [0, 3.0, -0.6], lo: [0, 1.2, 0], tag: '密封 + 减压双职责',
      desc: '杯盖不只是防溅：中央的弹性塞在杯内形成正压时可以顶开泄压——破壁机打热食时这一步不能省，否则蒸汽会把整杯内容物推出来。盖沿的硅胶圈同时是密封件与旋紧后的缓冲层。',
      specs: [['密封', '盖沿硅胶圈'], ['减压', '中央弹性塞'], ['风险', '热食蒸汽压']] },
  ],
});
