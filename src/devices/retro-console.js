/* =============================================================
   设备配置：立方游戏主机（Poly Haven · CC0 扫描）
   2 网格（机身/顶盖）
============================================================= */
import { makeDevice } from './_kit/factory.js';

export default makeDevice({
  id: 'retro-console',
  era: 2001,
  name: '立方游戏主机',
  en: 'RETRO CUBE CONSOLE',
  category: '游戏机',
  brand: 'GENERIC',
  tagline: '一个手提箱大小的游戏宇宙',
  description: '初代 Xbox 形态的家用主机（2001，第六世代）：方砖机身、正面吸入式光驱托盘、中央圆形电源键、顶面 XBOX 标——它是第一台内置硬盘（8GB，存读档与音乐抓轨）与以太网口（Xbox Live 联机）的主机，把「客厅联网」这件事提前了整整一代。定制 733MHz x86 处理器加 NVIDIA 图形芯片，本质上是一台被驯服的 PC。',
  specs: [
    ['形态', '方砖 · 正面托盘光驱'],
    ['世代', '第六世代（128 位时代）'],
    ['首创', '内置 8GB 硬盘 + 以太网'],
    ['手柄', '4 × 专有接口（带记忆棒位）'],
    ['家族', 'PS2 / GameCube / Dreamcast 同代'],
    ['来源', 'Poly Haven（CC0 扫描）'],
  ],
  accent: '#8f6bd6',
  source: 'Poly Haven（CC0）',
  modelCredit: 'Gaming Console by Poly Haven (CC0)',
  modelSource: 'https://polyhaven.com/a/gaming_console',
  targetWidth: 10,
  normalize: 'full',
  glb: '/assets/retro-console.glb',
  tour: ['body','lid'],
  xrayShellIds: ['body'],
  mapping: {
    'gaming_console': 'body',
    'gaming_console_lid': 'lid',
  },
  realPartIds: ['body', 'lid'],
  parts: [
    { id: 'body', zh: '主机机身', en: 'CONSOLE BODY', real: true,
      ex: [0, -0.2, -0.4], lo: [0, 1.3, 0], tag: '被驯服的 PC · 内置硬盘的第一代',
      desc: '机身：方砖内是定制 x86 处理器 + NVIDIA 图形芯片 + 3.5 寸硬盘的紧凑堆叠——硬盘让它能存读档、抓 CD 音乐进游戏，以太网口让 Xbox Live 在 2002 年就跑起了主机联机对战。前面板托盘光驱与中央电源环是它的正面签名。',
      specs: [['架构', 'x86 CPU + NVIDIA GPU'], ['首创', '8GB 硬盘 + 以太网'], ['接口', '4× 手柄口'], ['文化', 'Xbox Live 起点']] },
    { id: 'lid', zh: '顶盖', en: 'TOP LID', real: true,
      ex: [0, 1.6, 0.8], lo: [0, 1.1, 0], tag: 'XBOX 标 · 一块磁吸大盖板',
      desc: '顶盖：印着 XBOX 标的整块上盖——拆下它就是用户级的升级通道：换硬盘不加锁（初代唯一不锁盘的主机）、清灰、换风扇都从这里开始。盖板下是裸露的金属屏蔽罩，把 PC 心脏关进客厅家电的壳里。',
      specs: [['结构', '整块上盖'], ['彩蛋', '下盖即升级通道'], ['硬盘', '不锁盘可换'], ['屏蔽', '金属罩内 PC 心脏']] },
  ],
});
