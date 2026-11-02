/* =============================================================
   设备配置：机智号火星直升机（Ingenuity Mars Helicopter，NASA/JPL）
   官方 GLB（NASA 3D Resources，公有领域）：35 原语全语义命名，~7.6k tris
   bbox 0.85×0.58×1.18m —— 机身坐姿、双层对转旋翼在 y 轴向上堆叠
   网格名即真机结构（bus/leg_01-04/rotors_01-02/solar_panel/cams/parts），
   mapping 前缀批量归组
============================================================= */
import { makeDevice } from './_kit/factory.js';

export default makeDevice({
  id: 'ingenuity-helicopter',
  era: 2021,
  name: '机智号火星直升机',
  en: 'NASA INGENUITY',
  category: '航天',
  brand: 'NASA/JPL',
  tagline: '另一颗行星上的第一次动力飞行 · 1.8kg',
  description: '机智号（Ingenuity）是 NASA/JPL 的火星直升机：2021 年 4 月 19 日完成人类首次地外动力飞行，原本计划 5 次试飞，最终飞了 72 次、累计 2 小时 17 分钟，2024 年 1 月因旋翼桨叶折断退役。整机仅 1.8kg，学费却极贵——火星大气密度只有地球的 1%，要靠双层对转旋翼以每分钟约 2400–2900 转的转速硬拉起自己；机身是一台恒温「保温箱」，锂电池白天靠顶置太阳能板充电，夜间靠核素加热器在 −90°C 的火星夜里续命。它随毅力号火星车吊挂在腹部登陆火星，是人类第一架地外飞行器。模型为 NASA 官方资产（35 原语全语义命名），旋翼/太阳能板/起落架逐件可点读。',
  specs: [
    ['首飞', '2021-04-19 · 耶泽罗陨石坑'],
    ['质量', '1.8 kg'],
    ['旋翼', '双层对转 · 2400–2900 rpm'],
    ['桨展', '1.2 m'],
    ['能源', '顶置太阳能板 + 锂电池'],
    ['飞行', '72 次 · 累计 2h17m'],
    ['退役', '2024-01 · 桨叶折断'],
    ['运载', '毅力号火星车腹部吊挂'],
  ],
  accent: '#c9a15a',
  source: '官方公开模型（NASA 3D Resources · 公有领域）',
  modelCredit: 'Ingenuity Mars Helicopter by NASA/JPL (NASA 3D Resources, 公有领域)',
  modelSource: 'https://science.nasa.gov/3d-resources/ingenuity-mars-helicopter/',
  targetWidth: 6.5,
  camDist: 1.15,
  glb: '/assets/ingenuity-helicopter.glb',
  /* 策展导览：能源→旋翼系统→机身→起落架 */
  tour: ['solar-panel', 'rotor-upper', 'rotor-lower', 'avionics', 'landing-legs'],
  xrayShellIds: ['avionics'],
  normalize: 'full',
  /* 模型为对称坐姿：旋翼在 +y、腿向下；取景以旋翼为视觉头部 */
  frontAxis: '+z',
  unmappedTo: 'avionics',
  demos: [
    { partId: 'rotor-upper', label: '上旋翼自转（降速示意）', spin: 'auto', speed: 3.2 },
    { partId: 'rotor-lower', label: '下旋翼对转（降速示意）', spin: 'auto', speed: -3.2 },
  ],
  /* 引擎侧名字是 NASA CAD 节点名（多 primitive 带 _N 后缀），startsWith 前缀归组：
     10460522*=太阳能板 / MHP_*ROTOR_STOWED+Cylinder028/019=四腿 / Cylinder014+035=下旋翼 /
     Cylinder017+005=上旋翼 / Cube012+002=机身（官方 CAD 命名，位置聚类已实测核对） */
  mappingPrefix: {
    '10460522': 'solar-panel',
    'MHP_JR_AV_ROTOR_STOWED': 'landing-legs',
    'Cylinder028': 'landing-legs',
    'Cylinder019': 'landing-legs',
    'Cylinder014': 'rotor-lower',
    'Cylinder035': 'rotor-lower',
    'Cylinder017': 'rotor-upper',
    'Cylinder005': 'rotor-upper',
    'Cube012': 'avionics',
    'Cube002': 'avionics',
  },
  realPartIds: ['solar-panel', 'rotor-upper', 'rotor-lower', 'avionics', 'landing-legs'],
  parts: [
    { id: 'solar-panel', zh: '顶置太阳能板', en: 'SOLAR PANEL', real: true,
      ex: [0, 1.7, 0], lo: [0, 1.5, 0], tag: '唯一的能量入口 · 每日一次短飞',
      desc: '太阳能板：机身顶上的方形光伏板，是这台直升机唯一的能量来源。火星上的太阳光只有地球的约四成，每天充一整个白昼的电量，只够飞几十秒到两分钟——所以机智号的每次飞行都精确到秒：起飞、悬停、平移、降落，全程自拍留证，落地后把数据打包发给毅力号再中继回地球。',
      specs: [['能量', '火星日照 ~40% 地球'], ['充电', '整日光照 → 一次短飞'], ['任务', '每次 ≤2 分钟'], ['能量分配', '飞行 + 夜间保温']] },
    { id: 'rotor-upper', zh: '上旋翼', en: 'UPPER ROTOR', real: true,
      ex: [0, 1.15, 0], lo: [0, 1.4, 0], tag: '对转双旋翼之上层 · 2400–2900 rpm',
      desc: '上旋翼：碳纤维桨叶组成的共轴对转双旋翼之上层（含桨毂与轴段）。火星大气密度只有地球的约 1%，等效于在地球 3 万米高空飞行——远超任何直升机的工作极限，唯一的办法是把转速拉到每分钟 2400–2900 转（地球直升机约 400–600 转），用超高速硬生生「拍」出升力。模型中桨叶为收拢平铺姿态。',
      specs: [['桨叶', '碳纤维'], ['转速', '2400–2900 rpm'], ['等效高度', '~30000 m（地球）'], ['对转', '抵消反扭矩']] },
    { id: 'rotor-lower', zh: '下旋翼', en: 'LOWER ROTOR', real: true,
      ex: [0, 0.35, 0], lo: [0, 1.2, 0], tag: '对转双旋翼之下层 · 反向同速',
      desc: '下旋翼：与上旋翼同轴反向旋转，含桨毂与传动轴段。两副旋翼对转，机身受到的反扭矩互相抵消——这是没有尾桨也能稳定悬停的关键。2024 年 1 月的第 72 次飞行中，桨叶在降落时触及沙地折断约 1/4，这台小直升机就此结束传奇：72 次飞行、17 公里航程、2 小时 17 分钟留空。',
      specs: [['对转', '与上旋翼反向同速'], ['反扭矩', '对转自消'], ['终章', '第 72 飞桨叶折断'], ['遗产', 'Dragonfly 土卫六飞行器概念前身']] },
    { id: 'avionics', zh: '机身航电舱', en: 'AVIONICS BOX', real: true,
      ex: [0, -0.3, 1.0], lo: [0, 1.2, 0], tag: '恒温保温箱 · 手机级大脑',
      desc: '航电舱：约 0.2m 见方的「保温箱」，里面是飞控计算机、惯导、锂电池与加热器。处理器用的是手机级芯片（骁龙 801）——在火星上开先河；−90°C 的火星夜里，核素加热器与电池抱团取暖，保证电子件不被冻死。舱底平板件为天线与传感器窗口，与毅力号通联，自己没有直连地球的带宽。',
      specs: [['尺寸', '~0.2 m 见方'], ['大脑', '骁龙 801（手机级）'], ['保温', '核素加热器 + 气凝胶'], ['通联', '↔ 毅力号中继']] },
    { id: 'landing-legs', zh: '起落架', en: 'LANDING LEGS', real: true,
      ex: [0, -0.42, 0], lo: [0, 1.0, 0], tag: '四条外张支腿 · 沙地安全边界',
      desc: '起落架：四条向外张开的支腿（模型中四个角落的桁架组件），把 1.8kg 的机身稳稳架在沙地上，也让高速旋转的旋翼与地面保持安全距离。腿脚的落点选择曾是每次飞行的生死题——第 72 次飞行正是因为降落点沙面不平，桨叶触地折断。火星的地形导航全靠下视相机与惯导，没有 GPS 可用。',
      specs: [['数量', '4 条外张支腿'], ['职责', '架高旋翼防触地'], ['导航', '下视相机 + 惯导'], ['教训', '72 飞落地不平即终局']] },
  ],
});
