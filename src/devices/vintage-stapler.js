/* =============================================================
   设备配置：订书机（经典压臂式）
   Poly Haven（CC0 扫描）：4 网格语义命名（压臂/底座/钉排/单颗）
============================================================= */
import { makeDevice } from './_kit/factory.js';
import * as THREE from 'three';

export default makeDevice({
  id: 'vintage-stapler',
  name: '经典订书机',
  en: 'VINTAGE STAPLER',
  category: '文具',
  brand: 'GENERIC',
  tagline: '一枚弯脚，把纸钉进秩序里',
  description: '压臂式订书机是一台被低估的精密小机器：弹簧把钉排一格格往前推，压臂把最前面那枚 U 形钉往下砸——钉脚穿过纸页，撞在底座砧板的凹槽上被掰弯成"冂"形，把纸页咬死。1877 年专利定型以来，它的机构几乎没变过：一枚钉的成型只需要 0.1 秒，旋转砧板还能在"钉死"与"夹住（可无损取钉）"两种弯脚之间切换。哒哒两声，纸堆从此有了页码的秩序。',
  specs: [
    ['定型', '1877 · 压臂式专利'],
    ['机构', '推钉弹簧 + 冲击压臂'],
    ['成型', '砧板凹槽掰弯钉脚'],
    ['玩法', '旋转砧板切换钉/夹'],
    ['来源', 'Poly Haven（CC0 扫描）'],
  ],
  accent: '#c9705a',
  era: 1877,
  source: 'Poly Haven（CC0）',
  modelCredit: 'Vintage Stapler by Poly Haven (CC0)',
  modelSource: 'https://polyhaven.com/a/vintage_stapler',
  targetWidth: 6.5,
  normalize: 'full',
  glb: '/assets/vintage-stapler.glb',
  tour: ['arm', 'staples', 'anvil'],
  xrayShellIds: ['arm'],
  mapping: {
    'vintage_stapler_top': 'arm',
    'vintage_stapler_staples': 'staples',
    'vintage_stapler_staple_single': 'staples',
    'vintage_stapler_base': 'anvil',
  },
  realPartIds: ['arm', 'staples', 'anvil'],
  postLoad: ({ partsById }) => {
    /* 源模型把钉排摆在"击发中"的抬升姿态：按实测落差把钉排坐回压臂储钉槽
       （base 是每帧 position 的插值原点，二者必须同步改） */
    const arm = partsById['arm'], st = partsById['staples'];
    if (!arm || !st) return;
    const ab = new THREE.Box3().setFromObject(arm.group);
    const sb = new THREE.Box3().setFromObject(st.group);
    const dy = (ab.max.y - 0.01) - sb.max.y;
    if (dy < 0) { st.base.y += dy; st.group.position.y += dy; }
  },
  parts: [
    { id: 'arm', zh: '压臂与储钉槽', en: 'TOP ARM & MAGAZINE', real: true,
      ex: [0, 0.9, -0.5], lo: [0, 0.8, 0], tag: '一压一击 · 0.1 秒成型',
      desc: '压臂：掀开就是储钉槽，一排 U 形钉躺在里面被弹簧顶住；合上一压，冲头把最前端那枚钉推出导槽、穿过纸页。压臂的转轴与回位弹簧决定了手感——好订书机压到底"咚"一声闷响，差的一压就卡壳，多半是推钉弹簧疲了。',
      specs: [['动作', '冲头冲击成钉'], ['供钉', '弹簧连续推进'], ['手感', '转轴 + 回位弹簧'], ['卡壳', '多为弹簧疲软/钉排歪']] },
    { id: 'staples', zh: 'U 形钉排', en: 'STAPLE STRIP', real: true,
      ex: [0, 1.6, 0], lo: [0, 0.8, 0], tag: '钉尖朝下的标准件',
      desc: '书钉：几十枚 U 形钉粘成一整条，像子弹链一样插进储钉槽。钉的规格（26/6、24/8……）对应能穿透的纸厚——钉腿比纸总厚长出 3mm 才能在砧板上弯成漂亮的圆脚；太短只会在纸背划一道口子。',
      specs: [['规格', '26/6 · 24/8 等'], ['余量', '钉腿 ≈ 纸厚 + 3mm'], ['供弹', '粘合成条 · 弹簧推进'], ['装钉', '压臂掀开 180°']] },
    { id: 'anvil', zh: '底座与砧板', en: 'BASE & ANVIL', real: true,
      ex: [0, -0.9, 0.5], lo: [0, 0.8, 0], tag: '弯脚的模具 · 旋转切换钉/夹',
      desc: '底座：铸铁配重压住桌面，砧板上那道凹槽是钉脚成型的"模具"——钉脚穿纸而下撞进槽里，被槽壁掰成规整的圆脚。许多经典款把砧板做成可旋转的两面：一面弯脚钉死，一面只把钉腿掰直"夹住"纸页，方便无损拆订。',
      specs: [['成型', '凹槽掰弯钉脚'], ['配重', '铸铁压台'], ['切换', '旋转砧板钉/夹两用'], ['寿命', '砧板磨平则弯脚不圆']] },
  ],
});
