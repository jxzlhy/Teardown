/* =============================================================
   设备配置：瑞士杠杆式擒纵机构（机械钟表心脏）
   社区模型（Sketchfab · cyamahat，CC-BY）：10 网格全命名，
   平放在支架上的演示件，+Z 朝观众；附 8 段走时动画（引擎未用）
============================================================= */
import { makeDevice } from './_kit/factory.js';

export default makeDevice({
  id: 'swiss-escapement',
  demos: [
    { partId: 'balance-wheel', label: '摆轮振荡（降频示意）', wobble: [0.32, 0.04, 0.04], wobbleF: 2.5 },
  ],
  name: '瑞士杠杆式擒纵机构',
  en: 'SWISS LEVER ESCAPEMENT',
  category: '钟表',
  brand: 'GENERIC',
  tagline: '每秒 6 次的受控泄漏 · 机械表的「心跳」',
  description: '瑞士杠杆式擒纵机构（Swiss Lever Escapement，1754 年 Thomas Mudge 发明）是机械腕表的心脏：发条的能量经由轮系传到擒纵轮，擒纵叉像道闸一样「放行-锁止」交替卡住轮齿，把连续的能量流切成固定的小份喂给摆轮；摆轮与游丝组成的谐振系统再以固定频率回授「节拍」。每一次「滴答」，都是一次受控的能量泄漏——正是这个看起来在浪费能量的动作，让齿轮得以按时间计量转动。',
  specs: [
    ['发明', '1754 · Thomas Mudge'],
    ['结构', '擒纵轮 + 擒纵叉 + 摆轮游丝'],
    ['频率', '常见 2.5–5 Hz（18000–36000 vph）'],
    ['角色', '能量分配 + 时间基准'],
    ['摩擦', '宝石轴承 ×5（人工红宝石）'],
    ['地位', '至今 90% 机械表的标准擒纵'],
    ['来源', '社区模型（Sketchfab · CC-BY）'],
  ],
  accent: '#e0a63f',
  /* 质量分级 B：策展 tour + xrayShellIds 齐备，署名/许可证/部件 desc 完整（社区模型 CC-BY）；未经运行时逐件核验，不评 A */
  quality: 'B',
  source: '社区模型（Sketchfab）',
  modelCredit: 'Swiss lever escapement mechanism by cyamahat (Sketchfab, CC-BY)',
  modelSource: 'https://sketchfab.com/3d-models/swiss-lever-escapement-mechanism-96cf82a6bdcd4ddda7635fbd33d0e016',
  targetWidth: 11,
  normalize: 'full',
  glb: '/assets/swiss-escapement.glb',
  /* 策展导览：擒纵轮→叉瓦→擒纵叉→摆轮→摆轴→冲击销→游丝→限位钉→夹持工装 */
  tour: ['escape-wheel','pallets','lever','balance-wheel','balance-axle','impulse-pin','hairspring','banking-pins','fixtures'],
  /* X-Ray 外壳：全暴露演示机构、无封闭罩壳，按「最外层 1-2 件」口径仅选演示支架（相当于
     实机主夹板的定位基准）作半透明目标；避免 realPartIds 兜底把全部 9 件雾化 */
  xrayShellIds: ['fixtures'],
  mapping: {
    /* 注意：three.js GLTFLoader 会把节点名空白清洗为下划线（sanitizeNodeName），
       故 'escape wheel_0' 在运行时的真名是 'escape_wheel_0' */
    'fixations_0': 'fixtures',
    'escape_wheel_0': 'escape-wheel',
    'Pallets_0': 'pallets',
    'escapement_0': 'lever',
    'Balance_Axle_0': 'balance-axle',
    'Impulse_Pin_0': 'impulse-pin',
    'Balance_Wheel_0': 'balance-wheel',
    'Hsp0_0': 'hairspring',
    'Pin1_0': 'banking-pins',
    'Pin2_0': 'banking-pins',
  },
  realPartIds: ['fixtures', 'escape-wheel', 'pallets', 'lever', 'balance-axle', 'impulse-pin', 'balance-wheel', 'hairspring', 'banking-pins'],
  /* AURORA 后/V5.1 内容深度：瑞士杠杆式擒纵（Swiss lever escapement）机构关系——
     机构学来源：Horopedia「Swiss Lever Escapement」/ Wikipedia Lever escapement（标准原理）。
     动力端（发条轮系）不在展件内，故不设 driver；擒纵轮齿与杠杆瓦为间歇啮合（非连续），
     gear_mesh 为最近似类型并如实注记。 */
  mech: { edges: [
    { id:'gm-escapewheel-pallets', type:'gear_mesh', from:'escape-wheel', to:'pallets', kinematic:'exact',
      note:'擒纵轮齿与杠杆进/出瓦交替锁接-释放（间歇啮合：每摆动周期放行一齿，齿冲面传冲）' },
    { id:'fx-pallets-lever', type:'fixed', from:'pallets', to:'lever', kinematic:'exact',
      note:'进/出瓦（红宝石）镶固于杠杆叉臂' },
    { id:'lk-lever-impulsepin', type:'linkage', from:'lever', to:'impulse-pin', kinematic:'exact',
      note:'杠杆叉槽与摆轮冲钉往复冲击传递（释放/给冲相位）' },
    { id:'fx-impulsepin-balancewheel', type:'fixed', from:'impulse-pin', to:'balance-wheel', kinematic:'exact',
      note:'冲钉固装于摆轮滚盘' },
    { id:'fx-hairspring-balanceaxle', type:'fixed', from:'hairspring', to:'balance-axle', kinematic:'exact',
      note:'游丝内桩固接摆轴（外桩侧固定于夹板）——摆轮-游丝谐振回路' },
    { id:'fx-balancewheel-axle', type:'fixed', from:'balance-wheel', to:'balance-axle', kinematic:'exact',
      note:'摆轮刚接于摆轴' },
    { id:'bs-balanceaxle-fixtures', type:'bearing_support', from:'balance-axle', to:'fixtures', kinematic:'exact',
      note:'摆轴榫支承于夹板宝石轴承' },
    { id:'bs-escapewheel-fixtures', type:'bearing_support', from:'escape-wheel', to:'fixtures', kinematic:'exact',
      note:'擒纵轮轴支承于夹板轴孔' },
    { id:'bs-lever-fixtures', type:'bearing_support', from:'lever', to:'fixtures', kinematic:'exact',
      note:'杠杆轴支承于夹板轴孔' },
    { id:'fx-bankingpins-fixtures', type:'fixed', from:'banking-pins', to:'fixtures', kinematic:'exact',
      note:'限位钉固定于夹板，限制杠杆往复转角（锁接安全间隙）' },
  ] },
  parts: [
    { id: 'fixtures', zh: '支架夹具', en: 'FIXTURES', real: true,
      ex: [0, -0.8, 0], lo: [0, 1.0, 0], tag: '演示底座 · 石板夹持',
      desc: '演示支架：博物馆式的展示底座，把整套擒纵机构按实际相对位置悬空夹持——真实机芯里这些部件都钉在主夹板（main plate）与桥板（bridge）上，这里用透空的支架代替夹板，方便看清每一个啮合点。',
      specs: [['角色', '定位基准'], ['对应实机', '主夹板 / 桥板']] },
    { id: 'escape-wheel', zh: '擒纵轮', en: 'ESCAPE WHEEL', real: true,
      ex: [-1.8, 0.6, 1.6], lo: [0, 1.3, 0], tag: '15 齿 · 能量的最后一级',
      desc: '擒纵轮：轮系的最后一个齿轮，特殊齿形（钟表齿）专为被「卡住」而生——它的齿尖交替抵在擒纵叉的两颗宝石瓦上。每被放行半格，它就转过一个半角，把一份发条能量推给摆轮；齿数与轮系比决定了「滴」与「答」的节奏骨架。',
      specs: [['齿数', '常见 15 齿'], ['驱动', '轮系 / 发条'], ['动作', '步进（受控释放）'], ['齿形', '锁面 + 冲面双角']] },
    { id: 'lever', zh: '擒纵叉', en: 'PALLET FORK', real: true,
      ex: [-0.6, 1.7, 2.2], lo: [0, 1.3, 0], tag: '道闸 · 锁止与放行',
      desc: '擒纵叉（杠杆）：船形的杠杆臂，一端两颗宝石瓦交替卡住擒纵轮，另一端的叉槽（notch）接住摆轮上的冲击销——它是能量与时间信号之间的中继站：轮子推它一下，它去拨一下摆轮；摆轮荡回来，它再放一格轮齿。',
      specs: [['形态', '船形杠杆'], ['两端', '宝石瓦 ↔ 叉槽'], ['动作', '绕轴左右摆动'], ['润滑', '瓦面特制微润滑']] },
    { id: 'pallets', zh: '宝石瓦', en: 'PALLET STONES', real: true,
      ex: [-0.9, 2.5, 2.6], lo: [0, 1.2, 0], tag: '人造红宝石 · 锁面/冲面',
      desc: '两颗矩形人造红宝石，以极小角度镶在擒纵叉两端：内侧的「锁面」以近乎垂直的角度卡住轮齿（锁定），外侧的「冲面」以斜面放行并承受轮齿的推力（传能）。进瓦与出瓦角度不同——这套几何是擒纵效率的全部秘密。',
      specs: [['材质', '人造刚玉（红宝石）'], ['数量', '进瓦 + 出瓦'], ['功能', '锁定 + 传能'], ['磨损', '保养维修主要对象']] },
    { id: 'balance-wheel', zh: '摆轮', en: 'BALANCE WHEEL', real: true,
      ex: [1.9, 0.9, 1.9], lo: [0, 1.3, 0], tag: '谐振飞轮 · 时间的心跳',
      desc: '摆轮：带重缘的飞轮，与游丝组成谐振系统，以固定频率来回振荡——摆轮每摆一次，就通过冲击销「请求」擒纵叉放行一格。摆轮缘上的螺钉（或砝码）用于精确配平，冷热补偿与方位差调整都靠它们。',
      specs: [['角色', '谐振质量'], ['频率', '即表的节拍'], ['配平', '缘上螺钉 / 砝码'], ['轴承', '防震器（Incabloc 类）']] },
    { id: 'balance-axle', zh: '摆轮轴', en: 'BALANCE STAFF', real: true,
      ex: [2.6, -0.5, 2.4], lo: [0, 0.8, 0], tag: '最脆弱的一根轴',
      desc: '摆轮轴：比牙签还细的钢轴，两端轴尖只有头发丝粗细却承受整个摆轮的惯量——机械表摔落时最容易断的就是它，所以现代机芯在两端装了弹性防震器（Kif / Incabloc），让冲击通过位移被吸收。',
      specs: [['直径', '轴尖 ~0.06–0.10 mm'], ['材料', '淬硬钢'], ['防护', '防震器弹性轴承'], ['失效', '摔落断轴 Top1']] },
    { id: 'impulse-pin', zh: '冲击销', en: 'IMPULSE PIN', real: true,
      ex: [2.7, 2.2, 1.5], lo: [0, 1.2, 0], tag: '摆轮的「门把手」',
      desc: '冲击销：镶在摆轮轮辐上的小宝石销，随摆轮进入擒纵叉的叉槽——它进去「拉」叉一下，叉的另一端便放行擒纵轮；半个摆幅后它再从另一侧把叉推回去。摆轮与叉的全部对话都通过这一颗销完成。',
      specs: [['材质', '宝石 / 钢'], ['位置', '摆轮轮辐'], ['作用', '双向往复传能'], ['尺寸', '亚毫米级']] },
    { id: 'hairspring', zh: '游丝', en: 'HAIRSPRING', real: true,
      ex: [1.9, 2.1, 1.9], lo: [0, 1.3, 0], tag: '阿基米德螺线 · 频率来源',
      desc: '游丝：极细的合金螺线（约 0.02 mm），内端固定在摆轮轴上，外端固定在夹板桩上。摆轮摆动时游丝被反复卷紧与舒张，提供的回复力矩与转角成正比——这正是谐振频率稳定的根源。Breguet 末端曲线、防磁硅材质，都是为了让这条螺线更「守时」。',
      specs: [['厚度', '~0.02 mm'], ['螺线', '阿基米德 10–14 圈'], ['材料', 'Nivarox 合金 / 硅'], ['决定', '表的走时精度']] },
    { id: 'banking-pins', zh: '限位钉', en: 'BANKING PINS', real: true,
      ex: [-0.4, 2.9, 1.6], lo: [0, 1.2, 0], tag: '擒纵叉的左右边界',
      desc: '两根限位钉夹在擒纵叉摆动路径的两侧，限定叉的最大转角：摆轮的冲击销每次都必须越过这条边界才能「解锁」擒纵轮，形成稳定的节拍边界。没有它们，叉会摆过头，节拍立刻紊乱。',
      specs: [['数量', '进 / 出 各一'], ['作用', '限定叉角'], ['节拍', '解锁的边界条件'], ['调整', '微调钉距校节拍']] },
  ],
});
