/* =============================================================
   设备配置：Western Electric 500 旋转拨号电话（1950s 美国国民电话）
   社区模型（Sketchfab · vicky12218，CC-BY 4.0，PBR 4K）：26 网格全语义命名
   （听筒/螺旋线/旋转拨盘×4/叉簧/插口×2/底脚×8/主体/底板…）
   bbox 0.28×0.12×0.21；前中为拨盘与听筒 → frontAxis '+z'
   结构：听筒与螺旋线→机身底座→旋转拨盘→叉簧开关→线路插头
============================================================= */
import { makeDevice } from './_kit/factory.js';

export default makeDevice({
  id: 'we500-rotary-phone',
  name: 'Western Electric 500 旋转拨号电话',
  en: 'WE 500 ROTARY PHONE',
  category: '复古通信',
  brand: 'WESTERN ELECTRIC',
  tagline: '拨盘转回时的咔嗒声 · 一个世纪的通话记忆',
  description: 'Western Electric 500（1950s）：美国贝尔系统的国民电话，拨盘式设计的终极形态。拨号时手指伸进转盘孔位转到止位松开，转盘回弹的咔嗒声次数就是号码本身——脉冲拨号的原理是"断开电路的次数"。本页按 5 组拆解：听筒与螺旋线、机身底座、旋转拨盘组、叉簧开关（挂断听筒压下的那颗开关）、线路插头。型号精确、PBR 材质。',
  specs: [
    ['型号', 'Western Electric 500'],
    ['拨号', '旋转脉冲拨号（10 脉冲/秒）'],
    ['听筒', '手持柄 + 螺旋线'],
    ['叉簧', '压下即挂断'],
    ['拆解', '5 组核心部件'],
  ],
  accent: '#41576b',
  source: '社区模型（Sketchfab）',
  modelCredit: 'Western Electric 500 Vintage Rotary Telephone by vicky12218 (Sketchfab, CC-BY 4.0)',
  modelSource: 'https://sketchfab.com/3d-models/western-electric-500-vintage-rotary-telephone-4425a0d9629c420788cf6b0d072f4564',
  targetWidth: 9,
  normalize: 'full',
  frontAxis: '+z',
  glb: '/assets/we500-rotary-phone.glb',
  /* 前缀首中即停：Handset_Jack 必须在 Handset 之前 */
  mappingPrefix: {
    'Handset_Jack': 'handset',
    'Plug_Handset': 'handset',
    'Handset':      'handset',
    'Coiled_Cord':  'handset',
    'Main_Body':    'body',
    'Base_Plate':   'body',
    'Base_Feet':    'body',
    'Black_Object': 'body',
    'Base_Volume':  'rotary-dial',
    'Rotary_Dial':  'rotary-dial',
    'Dial_Number':  'rotary-dial',
    'Switch_Hook':  'switch-hook',
    'Plug_Base':    'line-plug',
    'Line_Jack':    'line-plug',
  },
  tour: ['handset', 'body', 'rotary-dial', 'switch-hook', 'line-plug'],
  xrayShellIds: ['body'],
  realPartIds: ['handset', 'body', 'rotary-dial', 'switch-hook', 'line-plug'],
  parts: [
    { id: 'handset', zh: '听筒与螺旋线', en: 'HANDSET & COILED CORD', real: true,
      ex: [0, 0.8, 1.2], lo: [0, 1.2, 0.4], tag: '送话与受话 · 一体双端',
      desc: '500 型听筒把送话器与受话器合在一根柄的两端——"手持通话"的人体工学自它定型。连接听筒与机身的螺旋线是设计经典：拉伸时提供够长的活动半径，松开时自行收短不占桌面。螺旋线的 5 万三角面是全模型最密的部件——每一圈都要圆滑。',
      specs: [['结构', '送话器 + 受话器双端'], ['连接', '螺旋线（可拉伸）'], ['建模', '51k 面 · 全模型最密']] },
    { id: 'body', zh: '机身与底座', en: 'BODY & BASE', real: true,
      ex: [0, -0.4, 0.6], lo: [0, 1.2, 0.2], tag: '一体成型的梯形轮廓',
      desc: '500 型机身的梯形轮廓是工业设计教科书案例：斜面托住听筒，正面斜坡安放拨盘，四颗底脚与中央垫高保证桌面稳定。壳体一体成型把内部电路全部罩住——用户唯一需要接触的就是听筒、拨盘和那颗叉簧。',
      specs: [['轮廓', '梯形斜面'], ['底脚', '四角 + 中央垫高'], ['集成', '电路全罩内']] },
    { id: 'rotary-dial', zh: '旋转拨盘组', en: 'ROTARY DIAL', real: true,
      ex: [0, 0.8, -1.4], lo: [0, 1.2, -0.4], tag: '脉冲拨号的机械发生器',
      desc: '旋转拨盘是这部电话的灵魂：数字孔位、金属止指器、中心帽与号牌卡组成完整拨盘组。手指拨到止位松开，发条把转盘拉回原位——回弹过程中调速离心器保证断续脉冲均匀（10 脉冲/秒），交换机靠脉冲次数识别号码。拨"0"要等十个咔嗒，是最长的等待。',
      specs: [['组成', '孔位盘 + 止指器 + 中心帽 + 号牌'], ['脉冲', '10 次/秒均匀断续'], ['数字 0', '10 个脉冲最长拨号']] },
    { id: 'switch-hook', zh: '叉簧开关', en: 'SWITCH HOOK', real: true,
      ex: [0, 1.0, 0.8], lo: [0, 1.1, 0.4], tag: '压下听筒即挂断',
      desc: '叉簧是听筒座下那颗"看不见的开关"：听筒压上，电路断开进入待机；拿起听筒，簧片弹起接通线路——交换机听到"摘机"信号才送出拨号音。它也是许多电话功能的状态起点：闪断叉簧一秒，就能触发交换机的转接服务。',
      specs: [['功能', '摘机/挂断状态切换'], ['原理', '簧片弹起接通'], ['应用', '闪断触发转接']] },
    { id: 'line-plug', zh: '线路插头', en: 'LINE PLUG', real: true,
      ex: [0, -0.8, -0.8], lo: [0, 1.0, -0.2], tag: '电话与网络的唯一接口',
      desc: '线路插口与插头是电话接入公共网络的唯一接口：500 型之前电话多与墙线硬接，可插拔设计让"搬家带着电话走"成为可能。四脚插头与标准插座确立了电话"终端设备可更换"的理念——这个理念最终演化成了今天所有可插拔通信终端。',
      specs: [['接口', '四脚插头 + 墙面插座'], ['理念', '终端可更换'], ['演化', '至今日所有插拔终端']] },
  ],
});
