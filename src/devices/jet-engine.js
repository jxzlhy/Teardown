/* =============================================================
   设备配置：涡轮喷气发动机（教学）
   社区模型（Sketchfab）：4 大网格（原 specGloss 材质已转
   metalRough），X 轴为发动机轴线 → probe ['fan-section','nozzle']
============================================================= */
import { makeDevice } from './_kit/factory.js';

export default makeDevice({
  id: 'jet-engine',
  name: '涡轮喷气发动机',
  en: 'TURBOJET ENGINE',
  category: '机械',
  brand: 'GENERIC',
  tagline: '布雷顿循环四段 · 压气机-涡轮同轴',
  description: '一台涡轮喷气发动机教学模型，按四大段展示：进气风扇段、核心机（压气机-燃烧室-涡轮）、尾喷管与尾锥。它跑的是布雷顿循环——吸入空气、压缩、喷油燃烧、喷出加速：压气机与涡轮同轴对转，涡轮「偷」走一部分燃气能量就是为了回头驱动压气机，剩下的能量全部变成推力。',
  specs: [
    ['循环','布雷顿（Brayton）四过程'],['结构','进气 → 压气 → 燃烧 → 喷气'],
    ['核心','压气机-涡轮同轴'],['推力','动量定理（喷气反作用）'],
    ['压比','多级轴流压气机逐级增压'],['燃烧','环管燃烧室连续燃烧'],
    ['用途','推进原理教学'],['来源','社区模型（Sketchfab）'],
  ],
  accent: '#ff8c42',
  /* 质量分级 B：策展 tour + xrayShellIds 齐备，署名/许可证/部件 desc 完整（社区模型 CC-BY）；未经运行时逐件核验，不评 A */
  quality: 'B',
  source: '社区模型（Sketchfab）',
  modelCredit: 'Jet Engine by playerhack (Sketchfab, CC-BY 4.0)',
  modelSource: 'https://sketchfab.com/3d-models/jet-engine-ea66c2db873d4182b116529697d18571',
  targetWidth: 12,
  camDist: 1.05,
  normalize: 'full',
  glb: '/assets/jet-engine.glb',
  /* 策展导览：风扇段→核心机→加力燃烧室→尾喷管（沿气流方向；对象条目带讲解词） */
  tour: [
    { id: 'fan-section', note: '进气风扇段：把空气吸入并初步增压，涡扇发动机大部分推力其实来自这级风扇推过的气流。' },
    { id: 'core', note: '核心机：压气机逐级增压后喷油燃烧，高温燃气驱动涡轮——涡轮又回头驱动前端的压气机。' },
    { id: 'afterburner', note: '加力燃烧室：在涡轮后再喷油复燃，短时间爆发额外推力，战斗机起飞与冲刺时使用。' },
    { id: 'nozzle', note: '尾喷管：把高压燃气加速喷出，动量定理在这里变成推力。' },
  ],
  /* 视觉原理演示（Phase 5）：选中风扇段绕发动机轴线（X）旋转 */
  demos: [
    { partId: 'fan-section', label: '进气风扇段旋转 · 布雷顿循环吸气', spin: [3.4, 0, 0] },
  ],
  /* X-Ray 外壳：模型仅 4 大段网格、无独立外壳件，按「最外层 1-2 件」口径选两端
     （进气风扇段/尾喷管）作半透明目标，核心机与加力段保持实心；
     避免 realPartIds 兜底把全部 4 段雾化 */
  xrayShellIds: ['fan-section', 'nozzle'],
  mapping: {
    'Object_12': 'fan-section',
    'Object_13': 'nozzle',
    'Object_16': 'core',
    'Object_19': 'afterburner',
  },
  realPartIds: ['fan-section','core','nozzle','afterburner'],
  orientationProbe: ['fan-section', 'nozzle'],
  parts: [
    { id:'fan-section', zh:'进气风扇段', en:'FAN / INTAKE', real:true,
      ex:[0,.4,2.6], lo:[0,1.3,0], tag:'吸入空气 · 预压缩',
      desc:'进气段：风扇以近音速吸入空气并做初步压缩——涵道风扇的设计决定一台涡扇发动机 80% 的推力与噪音特性；进气唇口的圆滑度直接决定喘振边界。',
      specs:[['功能','吸气 + 预压缩'],['关键','喘振裕度'],['噪音','主要来源']] },
    { id:'core', zh:'核心机', en:'GAS GENERATOR CORE', real:true,
      ex:[-1.8,1.2,-1.2], lo:[0,1.3,0], tag:'压气机 → 燃烧室 → 涡轮',
      desc:'核心机是发动机的心脏：多级轴流压气机把空气压缩到数十倍大气压，环管燃烧室连续喷油燃烧（两千度量级），高温高压燃气吹动涡轮——涡轮与压气机同轴，被吹着转的同时回头驱动前面的压气机叶片，形成自持循环。',
      specs:[['压气机','多级轴流'],['燃烧室','连续燃烧 ~2000°C'],['涡轮','同轴驱动压气机'],['核心指标','总压比 EPR']] },
    { id:'nozzle', zh:'尾喷管', en:'EXHAUST NOZZLE', real:true,
      ex:[1.8,.4,-1.6], lo:[0,1.3,0], tag:'收敛喷管 · 热能变动能',
      desc:'尾喷管：收敛型管道把高温燃气加速到高速喷出——推力就来自「喷出去的动量」与「吸进来的动量」之差；喷口面积可调的型号（加力段）能改变排气压力匹配工况。',
      specs:[['功能','热能 → 动能'],['推力','动量差'],['类型','收敛/收敛-扩散']] },
    { id:'afterburner', zh:'尾锥与加力段', en:'TAIL CONE', real:true,
      ex:[2.4,-.4,-2.4], lo:[0,1.2,0], tag:'尾锥整流',
      desc:'尾锥：整流燃气流并支撑喷管结构；带加力燃烧室的型号在这一段二次喷油——用「费油」换瞬间 50% 推力增量，战斗机起飞与突破音障的家底。',
      specs:[['功能','整流 + 支撑'],['加力','二次喷油 +50% 推力'],['代价','油耗数倍']] },
  ],
});
