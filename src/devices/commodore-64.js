/* =============================================================
   设备配置：Commodore 64 全套（1982 · 家用电脑的国民机）
   社区模型（Sketchfab · dark_igorek，CC-BY 4.0）：13 网格匿名命名，
   按位置聚类 5 部件（位置簇实测：前中=主机 / 后中抬升=显示器 /
   右后=驱动器 / 右前=磁带机或打印机 / 左后=外设，真机校准定名）
   bbox 10.75×3.78×10.46（桌面场景）；前中键盘面朝 +Z
   结构：主机→显示器→外设→驱动器→桌面件
============================================================= */
import { makeDevice } from './_kit/factory.js';

export default makeDevice({
  id: 'commodore-64',
  name: 'Commodore 64 全套（1982）',
  en: 'COMMODORE 64',
  category: '复古计算机',
  brand: 'COMMODORE',
  tagline: '吉尼斯认证销量最高的家用电脑 · 1700 万台',
  description: 'Commodore 64（1982）：64KB 内存在当年是"家用电脑的天花板"，1700 万台的销量让它成为吉尼斯认证的销量最高单一电脑型号。全套系统 = C64 主机（键盘即机身）+ 显示器 + 1541 软盘驱动器 + 磁带机——买回家的是一桌设备。它把 BASIC 编程带进千家万户，Sid 音频芯片开创了芯片音乐时代。本页按桌面陈设拆成 5 组。',
  specs: [
    ['发布', '1982 · Commodore'],
    ['销量', '约 1700 万台（吉尼斯认证）'],
    ['内存', '64KB RAM'],
    ['处理器', 'MOS 6510 @ 1MHz'],
    ['音频', 'SID 6581 三振荡器芯片'],
    ['拆解', '5 组桌面陈设'],
  ],
  accent: '#a08c6a',
  source: '社区模型（Sketchfab）',
  modelCredit: 'Commodore 64 Full Pack by dark_igorek (Sketchfab, CC-BY 4.0)',
  modelSource: 'https://sketchfab.com/3d-models/1f43612fa2d54041bbe2bdff8164c2cd',
  targetWidth: 11,
  normalize: 'full',
  frontAxis: '+z',
  glb: '/assets/commodore-64.glb',
  mapByPosition(name, p, rel, ext, mat) {
    if (p.z < -0.8 && p.y > 0.8) return 'monitor';      // 后方抬升 = 显示器
    if (p.z > 1.2 && Math.abs(p.x) < 2) return 'console'; // 前中 = 主机键盘
    if (p.x < -0.8) return 'drive';                     // 左后 = 1541 驱动器
    if (p.z < 0.5) return 'power-supply';               // 右后 = 外置电源
    return 'joystick';                                  // 右前 = 游戏摇杆
  },
  tour: ['console', 'monitor', 'drive', 'joystick', 'power-supply'],
  xrayShellIds: ['monitor', 'console'],
  realPartIds: ['console', 'monitor', 'drive', 'joystick', 'power-supply'],
  parts: [
    { id: 'console', zh: 'C64 主机', en: 'C64 CONSOLE', real: true,
      ex: [0, 0.3, 1.6], lo: [0, 1.1, 0.4], tag: '键盘即机身 · 米色面包屑配色',
      desc: 'C64 主机把主板、64KB 内存与键盘压进一个面包形外壳——"键盘即电脑"是家用电脑的标配形态。米色塑料的"面包屑"配色（breadbox）是它的绰号来源；右侧 Carry 系统卡槽可外接系统扩展。开机直接进入 BASIC，光标闪烁等你输入第一行代码。',
      specs: [['形态', '键盘机身一体'], ['内存', '64KB RAM'], ['开机', '直接进 BASIC']] },
    { id: 'monitor', zh: '显示器', en: 'MONITOR', real: true,
      ex: [0, 1.6, -1.8], lo: [0, 1.3, -0.4], tag: 'CRT 玻璃屏 · 彩色输出',
      desc: 'C64 的 CRT 显示器把主机的复合视频信号转成 16 色画面——C64 的 16 色调色板是它游戏统治力的基础。CRT 玻璃屏的曲面与机壳的塑料格栅都是那个年代显示器的通用语言；屏幕闪烁与嗡嗡声是几代人的共同记忆。',
      specs: [['类型', 'CRT 复合视频'], ['调色板', '16 色'], ['信号', '复合视频 / S 端子']] },
    { id: 'drive', zh: '1541 软盘驱动器', en: '1541 DRIVE', real: true,
      ex: [-1.6, 0.2, -1.2], lo: [0, 1.1, -0.4], tag: '5.25 英寸软盘 · 比主机还贵',
      desc: '1541 软盘驱动器用 5.25 英寸软盘存储 170KB 数据——发售价与主机相当，是"全家桶"里最贵的配件。它有自己的处理器（6502 的近亲），堪称第二台电脑；拷一张盘要几分钟，游戏玩家互拷卡带与软盘撑起了校门口经济。',
      specs: [['介质', '5.25″ 软盘 170KB'], ['内置', '独立 6502 处理器'], ['地位', '比主机还贵的配件']] },
    { id: 'joystick', zh: '游戏摇杆', en: 'JOYSTICK', real: true,
      ex: [1.4, 0.2, 1.6], lo: [0, 1.0, 0.6], tag: '红色按钮 · 单发射击的肌肉记忆',
      desc: 'Competition Pro 式游戏摇杆：黑色球头 + 红色大按钮，是 C64 游戏体验的"输入终端"。它内部就是四颗微动开关加一颗按钮——没有芯片，坏了自己十分钟修好。街机厅的手感被原样搬回家，"搓摇杆"是一代人的肌肉记忆。',
      specs: [['结构', '四向微动开关 + 单按钮'], ['维护', '免焊十分钟修复'], ['文化', '街机手感家用化']] },
    { id: 'power-supply', zh: '外置电源', en: 'POWER SUPPLY', real: true,
      ex: [1.6, 0.2, -1.2], lo: [0, 1.1, -0.4], tag: 'C64 唯一"易死"的部件',
      desc: 'C64 的电源砖是整机著名的"定时炸弹"：早期型号的稳压芯片老化后可能输出高压，瞬间烧毁主板——C64 玩家修机第一件事就是换第三方安全电源。它外置的原因与散热有关：9V 交流与 5V 直流双路输出，发热量大不宜塞进键盘机身。',
      specs: [['输出', '9V AC + 5V DC 双路'], ['风险', '老化高压烧主板'], ['忠告', '换安全电源再用']] },
  ],
});
