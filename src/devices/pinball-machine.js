/* =============================================================
   设备配置：弹珠台（实体弹珠机 · 纯机械游戏设备）
   社区模型（Sketchfab · Ranguel，CC-BY 4.0）：94 网格 / 17 语义材质
   （球/木台面/金属板/玻璃/红橡胶/亚克力/铝/铜/锁紧螺母…）
   bbox 0.72×2.00×1.36m，Y 上直立体：玻璃+台面 y≈1.0，灯箱 y>1.3，
   玩家侧（弹射板/发球道）在 +Z → frontAxis '+z'
   映射：材质名为主 + rel.y 分离灯箱（mapByPosition 第 5 参材质）
   结构：柜体台面→灯箱→钢珠→弹射板→弹柱→落靶→弹射器→橡胶圈→柱件
============================================================= */
import { makeDevice } from './_kit/factory.js';

export default makeDevice({
  id: 'pinball-machine',
  name: '弹珠台',
  en: 'PINBALL MACHINE',
  category: '游戏',
  brand: 'GENERIC',
  tagline: '一颗钢珠 · 纯机械的得分艺术',
  description: '实体弹珠台是把机械结构做成游戏的极限案例：没有程序，得分全靠弹射板、弹柱、落靶与橡胶圈这些真实机构的物理反馈。本页按真实构造拆成 9 组——玻璃下的台面电路、可动的弹射板与弹射器、计分的落靶组、遍布台面的橡胶圈与柱件，以及顶部的计分灯箱。钢珠是唯一的"处理器"。',
  specs: [
    ['类型', '实体弹珠机（机械得分）'],
    ['核心', '弹射板 / 弹柱 / 落靶 / 橡胶圈'],
    ['台面', '木制台面 + 钢化玻璃'],
    ['得分', '传感器 + 灯箱计分'],
    ['玩家侧', '+Z（弹射板与发球道）'],
  ],
  accent: '#d94f6b',
  source: '社区模型（Sketchfab）',
  modelCredit: 'Pinball Machine by Ranguel (Sketchfab, CC-BY 4.0)',
  modelSource: 'https://sketchfab.com/3d-models/pinball-machine-cc2a49ca2ad14910abce89b5a78bb09f',
  targetWidth: 14,
  normalize: 'full',
  frontAxis: '+z',
  camDist: 1.15,
  glb: '/assets/pinball-machine.glb',
  mapByPosition(name, p, rel, ext, mat) {
    if (mat === 'ball_metal') return 'ball';
    if (rel.y > 0.64) return 'backbox';
    if (mat === 'red_rubber') return 'flippers';
    if (mat === 'copper') return 'slingshots';
    if (mat === 'red_transparent_plastic') return 'targets';
    if (mat === 'red_acrilic' || mat === 'aluminum') return 'bumpers';
    if (mat === 'black_rubber' || mat === 'white_rubber') return 'rubbers';
    if (mat === 'board_wood' || mat === 'board_metal_sheet' || mat === 'exit_cover'
      || mat === 'glass' || mat === 'black_metal') return 'cabinet';
    return 'posts'; /* locknut_metal / white_plastic / white_trasparent_plastic / Material */
  },
  tour: ['cabinet', 'backbox', 'ball', 'flippers', 'slingshots', 'bumpers', 'targets', 'rubbers', 'posts'],
  xrayShellIds: ['cabinet'],
  realPartIds: ['cabinet', 'backbox', 'ball', 'flippers', 'bumpers', 'targets', 'rubbers', 'posts', 'slingshots'],
  parts: [
    { id: 'cabinet', zh: '台面与柜体', en: 'PLAYFIELD & CABINET', real: true,
      ex: [0, -0.6, 0.8], lo: [0, 1.4, 0], tag: '木制台面 · 一切机构的舞台',
      desc: '弹珠台的台面不是平的：微小的坡度让钢珠始终向玩家侧滚动，重力就是它的"游戏循环"。木制台面上密布安装孔与走线槽，金属护轨把钢珠约束在得分区里；钢化玻璃既是防尘盖，也是玩家"拍台"泄愤时最先牺牲的部件。',
      specs: [['坡度', '约 6.5° 向玩家侧'], ['台面', '木制 + 丝印美术'], ['护面', '钢化玻璃']] },
    { id: 'backbox', zh: '计分灯箱', en: 'BACKBOX', real: true,
      ex: [0, 2.4, -1.6], lo: [0, 1.2, -0.5], tag: '得分显示 · 灯光矩阵',
      desc: '台顶的灯箱是弹珠台的"屏幕"：得分数码管、奖励灯组与背玻璃美术都在这里。机柜深处的继电器与电源也藏在这层结构背后——从机械时代到固态电路，灯箱始终是机器自我表达的地方。',
      specs: [['功能', '计分 / 灯效 / 美术'], ['内部', '电源与控制板'], ['背板', '透光玻璃彩绘']] },
    { id: 'ball', zh: '钢珠', en: 'PINBALL', real: true,
      ex: [1.2, 1.2, 0], lo: [0, 1.0, 0], tag: 'Φ27mm · 唯一的"执行器"',
      desc: '一颗 27mm 硬化钢珠就是弹珠台的全部"程序载体"：它的每一次碰撞、滚动与弹跳都在被台面传感器追踪。抛光钢面让滚动阻力最小，也让它在高速下依然可预测——弹珠台的手感，一半来自这颗珠子的重量。',
      specs: [['直径', 'Φ27mm'], ['材质', '硬化钢 · 抛光'], ['重量', '约 80g']] },
    { id: 'flippers', zh: '弹射板', en: 'FLIPPERS', real: true,
      ex: [-1.2, 0.8, 2.2], lo: [0, 1.0, 1.0], tag: '玩家唯一的主动权',
      desc: '一对弹射板是玩家唯一的主动手段：按下按键，线圈把带橡胶套的板体拍到上限，松手靠弹簧复位。板轴的角度与橡胶的弹性决定全部手感——老玩家说的"这台机器手感正"，说的就是这两个部件。',
      specs: [['驱动', '电磁线圈 · 瞬时通电'], ['复位', '回位弹簧'], ['接触面', '橡胶套']] },
    { id: 'slingshots', zh: '弹射器', en: 'SLINGSHOTS', real: true,
      ex: [1.4, 0.7, 1.6], lo: [0, 1.0, 0.6], tag: '三角形反叛者 · 专把球踢回给你',
      desc: '台面下方的两个三角弹射器是"敌对装置"：钢珠压到它的橡胶条上，传感器触发线圈把球狠狠弹回台面中央——得分机器的天性就是不让你得 分。它的结构与弹射板同源，只是永远站在机器那一边。',
      specs: [['形式', '三角橡胶条 + 线圈'], ['触发', '压力传感器'], ['性格', '把球踢回中央']] },
    { id: 'bumpers', zh: '弹柱（气泡 Bumper）', en: 'POP BUMPERS', real: true,
      ex: [0, 1.8, -1.2], lo: [0, 1.2, -0.3], tag: '碰一下 · 罩一下 · 得一分',
      desc: '台面上部的弹柱是得分发动机：钢珠一碰，柱体被线圈向下吸一口再弹回，同时计分与亮灯。红亚克力罩下的这一吸一弹每天重复上万次，是全机动作最频繁的机构——它的垫圈与线圈也是最常保养的。',
      specs: [['数量', '典型 3-4 只'], ['动作', '线圈吸合 → 弹回'], ['寿命', '全机动作最频繁']] },
    { id: 'targets', zh: '落靶组', en: 'DROP TARGETS', real: true,
      ex: [0, 1.5, -0.4], lo: [0, 1.1, -0.3], tag: '打倒 · 计分 · 再弹起',
      desc: '一排红色半透明落靶嵌在台面槽里：钢珠正面击中即倒下并计分，全组倒下触发奖励，随后电磁铁逐一把它弹回原位。"打倒一排"是弹珠台最古老的成就系统，从机械时代一直沿用到今天。',
      specs: [['形式', '击倒式靶面'], ['复位', '电磁铁逐一弹起'], ['奖励', '全组倒下触发']] },
    { id: 'rubbers', zh: '橡胶圈', en: 'RUBBER RINGS', real: true,
      ex: [-1.0, 1.2, -0.8], lo: [0, 1.1, 0], tag: '台面的弹性全靠它们',
      desc: '套在柱件上的橡胶圈是台面反弹性格的来源：新圈弹得又快又准，老化后发黏变脆、球路全变。职业玩家保养机器的第一件事就是换整套橡胶——它是弹珠台世界里最便宜的"性能改装"。',
      specs: [['角色', '反弹 / 变向 / 缓冲'], ['老化', '发黏 → 球路变差'], ['保养', '成套定期更换']] },
    { id: 'posts', zh: '柱件与紧固件', en: 'POSTS & FASTENERS', real: true,
      ex: [0.8, 1.4, 0.6], lo: [0, 1.0, 0], tag: '球路的路标 · 也是螺母海洋',
      desc: '台面上散布的柱件决定钢珠的每一条可能路径：可调柱改变通道宽度，橡胶柱承担碰撞。而锁紧螺母是弹珠台的另一重身份——一台机器下面有上百颗，维修时翻过来先看到的就是这片"螺母海洋"。',
      specs: [['角色', '限定球路 / 支撑胶圈'], ['可调', '部分柱可换位改难度'], ['数量', '单台锁紧件 100+']] },
  ],
});
