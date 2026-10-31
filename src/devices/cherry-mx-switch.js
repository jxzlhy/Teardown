/* =============================================================
   设备配置：Cherry MX 轴体解剖（蓝轴 · PCB 版）
   社区模型（Sketchfab · blackcube4，CC-BY）：31 网格是 6 个
   轴体变体叠在原点（Low/Mid/各 PCB 版…）；本配置只取 Mid
   （蓝轴带 LED）做单颗解剖，其余变体归入 hidden 件隐藏
============================================================= */
import { makeDevice } from './_kit/factory.js';

export default makeDevice({
  id: 'cherry-mx-switch',
  era: 1984,
  name: 'Cherry MX 轴体解剖',
  en: 'CHERRY MX SWITCH',
  category: '键盘',
  brand: 'CHERRY',
  tagline: '一颗按键里的四两拨千斤',
  description: 'Cherry MX 是 1984 年发明、至今仍是机械键盘黄金标准的按键开关：键帽压下时，金属弹簧顶着滑块下行，滑块的导轨先压缩金属弹片（段落感的来源）、再让两片触点导通——一次按键 = 4mm 行程里一次精确的机械事件。蓝轴有段落、红轴线性、茶轴轻段落，差别全在弹片形状的一两毫米。这台模型取带 LED 的 PCB 版蓝轴，把上盖、轴芯、弹簧、底座逐层拆开。',
  specs: [
    ['发明', '1984 · Cherry（德国）'],
    ['行程', '总 4mm · 触发 ~2.2mm'],
    ['蓝轴', '段落感 50cN · 有声'],
    ['寿命', '单键 1 亿次敲击'],
    ['结构', '上盖+轴芯+弹簧+底座+触点'],
    ['来源', '社区模型（Sketchfab · CC-BY）'],
  ],
  accent: '#4da3ff',
  source: '社区模型（Sketchfab）',
  modelCredit: 'Cherry MX Switches by blackcube4 (Sketchfab, CC-BY)',
  modelSource: 'https://sketchfab.com/3d-models/cherry-mx-switches-71e8e1687abc4a8fbef195ab09581287',
  targetWidth: 7,
  normalize: 'full',
  glb: '/assets/cherry-mx-switch.glb',
  /* 策展导览：轴心上盖→轴心→弹簧→底座→LED→灯座→隐藏件 */
  tour: ['top-housing','stem','spring','bottom-housing','led','led-seat','hidden'],
  xrayShellIds: ['top-housing','bottom-housing'],
  unmappedTo: 'hidden',
  mapping: {
    'Mid_Switch_Blue_Plastic_0': 'stem',
    'Mid_Top_Mid_Top_0': 'top-housing',
    'Mid_Bottom_Mid_Bottom_0': 'bottom-housing',
    'Mid_Spring_Metal_0': 'spring',
    'Mid_LED_LED_0': 'led',
    'Mid_LED_Metal_0': 'led-seat',
  },
  realPartIds: ['stem', 'top-housing', 'bottom-housing', 'spring', 'led', 'led-seat', 'hidden'],
  postLoad: ({ partsById }) => {
    /* 其余 5 个轴体变体与本颗叠在同一原点：整组隐藏，只留解剖对象 */
    const h = partsById.hidden;
    if (h) h.group.visible = false;
    /* 黑色外壳在暗厅隐形：借自发光显形 */
    for (const pid of ['top-housing', 'bottom-housing']) {
      const p = partsById[pid]; if (!p) continue;
      p.group.traverse(o => {
        if (!o.isMesh) return;
        const mats = Array.isArray(o.material) ? o.material : [o.material];
        for (const m of mats) { if (m.map && !m.emissiveMap) { m.emissiveMap = m.map; m.emissive.setScalar(0.45); } }
      });
    }
  },
  parts: [
    { id: 'stem', zh: '轴芯（蓝芯）', en: 'STEM', real: true,
      ex: [0, 2.2, 0.6], lo: [0, 1.1, 0], tag: '十字柱 · 段落感的作者',
      desc: '轴芯：键帽插的十字柱 + 两侧导轨滑块，蓝色即蓝轴身份。下行时滑块侧翼压过金属弹片——「咔哒」的段落感就是弹片被压下再回弹的那一下；轴芯还兼任防误触的导正角色，歪着按也能顺利传力。',
      specs: [['颜色', '蓝 = 有段落'], ['行程', '2.2mm 触发 / 4mm 总'], ['手感', '50cN 段落'], ['配合', '十字键帽座']] },
    { id: 'top-housing', zh: '上盖', en: 'TOP HOUSING', real: true,
      ex: [0, 1.2, -0.6], lo: [0, 1.1, 0], tag: '导轨 + 防尘唇',
      desc: '上盖：塑料壳的上半，内壁是轴芯滑动的精密导轨（公差以丝计），顶部开孔走键帽卡扣，边缘一圈防尘唇——灰尘进得少，润滑油留得住。上盖与底座用卡扣+超声波焊合，拆开基本是一次性的。',
      specs: [['结构', '导轨 + 卡扣'], ['材质', 'POM / PA 塑料'], ['公差', '±0.05mm 级'], ['防尘', '唇边 + 润滑']] },
    { id: 'spring', zh: '弹簧', en: 'SPRING', real: true,
      ex: [0, 0.4, 1.0], lo: [0, 1.0, 0], tag: '回复力 · 手感曲线作者',
      desc: '弹簧：压力克数全由它决定——45cN、55cN、60g 长弹簧……换弹簧是客制化键盘的「第一改装」。弹簧的圈数与线径决定回弹线性度：好坏的标准是全程弹力均匀、不「前软后硬」。',
      specs: [['常见', '45–65cN'], ['材料', '弹簧钢镀金'], ['改装', '换簧 = 换手感'], ['声音', '涂润滑消「弹簧音」']] },
    { id: 'bottom-housing', zh: '底座与触点', en: 'BOTTOM HOUSING', real: true,
      ex: [0, -1.6, 0], lo: [0, 1.0, 0], tag: '金属弹片 · 电路的开关',
      desc: '底座：内嵌两片金属弹片触点——轴芯下行把上触片压到下触片上，电路导通。弹片的形状与角度就是轴体性格的 DNA：蓝轴的「耳朵」凸出所以有段落，红轴的平缓所以线性。PCB 版底座多两根固定插针与 LED 开窗。',
      specs: [['触点', '金合金弹片 ×2'], ['导通', '~2.2mm 处'], ['性格', '弹片形状定轴性'], ['PCB 版', '插针直焊主板']] },
    { id: 'led', zh: 'LED 灯珠', en: 'LED', real: true,
      ex: [0.8, 1.4, -0.9], lo: [0, 1.0, 0], tag: '背光的心脏',
      desc: 'LED 灯珠：2×3×4mm 直插灯，坐在轴体中庭里给键帽打背光——早期单色蓝/绿，后来的 SMD 贴片版才有 RGB。灯珠上方正对轴芯中柱的透光孔，光从「芯」里透出来。',
      specs: [['规格', '2×3×4mm 直插'], ['位置', '轴体中庭'], ['进化', '直插单色 → SMD RGB'], ['视角', '键帽字透光']] },
    { id: 'led-seat', zh: '灯座金属件', en: 'LED SEAT', real: true,
      ex: [-0.8, 0.6, -1.1], lo: [0, 1.0, 0], tag: 'LED 的定位与导通',
      desc: '灯座金属件：LED 两脚的定位与导通夹——既是灯珠的座位，也是把它接入 PCB 回路的触点。小到不起眼，却是「按下去灯亮」这条链路的最后一厘米。',
      specs: [['角色', '定位 + 导电'], ['结构', '金属夹片'], ['失效', '虚焊 → 灯不亮'], ['维修', '镊子级手工活']] },
    { id: 'hidden', zh: '其他轴体变体', en: 'OTHER VARIANTS', real: true,
      ex: [0, -99, 0], lo: [0, -99, 0], tag: '同源模型的兄弟变体（隐藏）',
      desc: '源模型里另有 Low/Mid/Very-Low Profile 等多个轴体变体，全部叠在同一原点——与解剖对象重叠。这里整组隐藏只留蓝轴；想看低轴家族时把这组重新摆开即可。',
      specs: [['内容', 'Low / Mid / Very-Low 变体'], ['处理', '重叠故隐藏'], ['备注', '模型作者的多变体对比件']] },
  ],
});
