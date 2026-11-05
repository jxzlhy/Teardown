/* =============================================================
   设备配置：Sony TC-510 磁带机（Sketchfab · Dolgov12 · CC-BY）
   6 网格：Sony_a（面板）/Sony_a_b（走带底盘）/Sony_b+glass（顶盖玻璃）
   /Sticker/旋钮
============================================================= */
import { makeDevice } from './_kit/factory.js';

export default makeDevice({
  id: 'sony-tc510',
  era: 1977,   /* 约 1977–1978 */
  name: 'Sony TC-510 磁带机',
  en: 'SONY TC-510',
  category: '音频',
  brand: 'SONY',
  tagline: '七十年代客厅里的银色开盘机',
  description: 'Sony TC-510 是七十年代开盘磁带机（reel-to-reel）进入家庭的代表：两只 7 寸带盘立在银色面板上，磁带以 9.5cm/s 匀速走过三磁头组——抹音、录音、放音各司其职。它比卡带早一代，音质上限也高一截：频响轻松覆盖全音频带，代价是「听歌要手动穿带」。VU 表的指针随音乐摆动，是那个时代客厅最有科技感的画面。',
  specs: [
    ['年代', '1970s · Sony'],
    ['介质', '1/4 寸开盘带 · 7 寸盘'],
    ['带速', '9.5 / 19 cm/s'],
    ['磁头', '抹音 · 录音 · 放音 三磁头'],
    ['特色', 'VU 电平表 · 银色面板'],
    ['来源', '社区模型（Sketchfab · CC-BY）'],
  ],
  accent: '#c0c7d1',
  source: '社区模型（Sketchfab）',
  modelCredit: 'Sony TC-510-2 Tape Recorder by Dolgov12 (Sketchfab, CC-BY)',
  modelSource: 'https://sketchfab.com/3d-models/sony-tc-510-2-tape-recorder-32acbe50ba0f4abc99af88e0d76f28f9',
  targetWidth: 12,
  normalize: 'full',
  glb: '/assets/sony-tc510.glb',
  realSizeMM: 333,   /* 真实最大外形尺寸（Sony TC-510 官方口径 333×136×296mm，便携开盘机）：测量工具 mm 标定基准 */
  tour: ['front-panel','knob','deck','lid','sticker'],
  xrayShellIds: ['lid','front-panel'],
  mapping: {
    'Sony_a_M_Sony_a_0': 'front-panel',
    'Sony_a_M_Sony_b_0': 'deck',
    'Sony_b_M_Sony_b_0': 'lid',
    'Sony_b_M_Sony_glass_0': 'lid',
    'Sony_b_M_Sony_Sticker_0': 'sticker',
    'Object008_M_Sony_b_0': 'knob',
  },
  realPartIds: ['front-panel', 'deck', 'lid', 'sticker', 'knob'],
  parts: [
    { id: 'front-panel', zh: '银色面板', en: 'FRONT PANEL', real: true,
      ex: [0, 0, 1.6], lo: [0, 1.3, 0], tag: '拉丝铝 · 按键一排像琴键',
      desc: '面板：拉丝铝面上一排机械自锁按键——REW / PLAY / FF / STOP / REC，按下的手感是实打实的连杆在切换机芯状态。两个 VU 表的指针随电平摆动，录音时盯它别过载，是开盘机玩家的肌肉记忆。',
      specs: [['按键', '机械自锁五键'], ['表计', '双 VU 电平表'], ['材质', '拉丝铝'], ['操作', '录放像弹琴一样按']] },
    { id: 'deck', zh: '走带底盘', en: 'TAPE DECK', real: true,
      ex: [0, 0.6, -1.2], lo: [0, 1.2, 0], tag: '马达 · 飞轮 · 三磁头的心脏',
      desc: '走带底盘：两根带轴由马达经皮带驱动匀速走带，磁带依次经过抹音磁头（清旧信号）、录音磁头（写入）、放音磁头（回放校验）——三磁头布局让「边录边监听」成为可能，这是开盘机音质严谨的标志。',
      specs: [['三磁头', '抹 / 录 / 放分立'], ['带速', '9.5 / 19 cm/s 双速'], ['驱动', '马达 + 皮带 + 飞轮'], ['功能', '带后监听']] },
    { id: 'lid', zh: '透明护盖', en: 'PROTECTIVE LID', real: true,
      ex: [0, 1.6, 0.4], lo: [0, 1.1, 0], tag: '看得到带盘转的那扇窗',
      desc: '护盖：半透明亚克力罩住带盘区——既能看两只带盘悠悠地转，又挡住灰尘落进磁头缝隙。开盘机磁头缝隙以微米计，一粒灰就是一次掉音，这扇盖子是机器的口罩。',
      specs: [['材质', '亚克力'], ['作用', '防尘 + 观察'], ['痛点', '磁头怕灰'], ['姿势', '放音时盖着也行']] },
    { id: 'sticker', zh: '型号铭贴', en: 'MODEL BADGE', real: true,
      ex: [-1.2, -0.6, 1.2], lo: [0, 1.0, 0], tag: 'SONY 四个字母的年代学',
      desc: '铭贴：面板上的 Sony 标与型号贴纸——七十年代的 logo 字体与位置是鉴定批次与产地的依据。收藏圈靠这一小片贴纸分辨「日版」「美版」，原装贴纸的完整度直接影响身价。',
      specs: [['内容', 'SONY 标 + 型号'], ['鉴定', '字体定年代产地'], ['收藏', '原贴完整性 = 身价'], ['材质', '铝箔/印刷']] },
    { id: 'knob', zh: '旋钮', en: 'CONTROL KNOB', real: true,
      ex: [1.5, -0.4, 0.9], lo: [0, 1.0, 0], tag: '电平 · 音调 · 带速的手感',
      desc: '旋钮：录音电平、输出音量与音调控制——开盘机的录音电平旋钮要配合 VU 表把峰值压在 0dB 附近：推太高磁带饱和失真，太低信噪比变差。「把电平调漂亮」是磁带录音的第一门手艺。',
      specs: [['功能', '电平 / 音量 / 音调'], ['配合', '盯 VU 表调电平'], ['要领', '峰值压 0dB'], ['手感', '金属旋钮阻尼']] },
  ],
});
