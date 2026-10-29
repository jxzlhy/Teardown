/* =============================================================
   设备配置：便携卡带机（Poly Haven · CC0 扫描）
   3 网格（机身/透明盖/卡带）——盖与磁带可独立拆
============================================================= */
import { makeDevice } from './_kit/factory.js';

export default makeDevice({
  id: 'portable-cassette-player',
  name: '便携卡带机',
  en: 'PORTABLE CASSETTE PLAYER',
  category: '音频',
  brand: 'GENERIC',
  tagline: '翻面之前，先把磁带倒回去',
  description: '开盖式便携卡带机（Walkman 形态）：透明铰链盖掀起，卡带水平滑入两根带轴之间，合盖后压带轮把磁带压到主导轴上——「咔哒」一声，马达、飞轮、磁头同时上岗。这类机器的拆解是入门电子维修的经典第一课：皮带老化、磁头脏污、压带轮发粘，三样修好就满血复活。',
  specs: [
    ['形态', '上开盖 · 卧式走带'],
    ['介质', 'Compact Cassette（1963）'],
    ['走带', '4.76 cm/s · A/B 两面'],
    ['供电', '2×AA 电池'],
    ['维护三件', '皮带 / 磁头 / 压带轮'],
    ['来源', 'Poly Haven（CC0 扫描）'],
  ],
  accent: '#5aa9e6',
  source: 'Poly Haven（CC0）',
  modelCredit: 'Portable Cassette Player by Poly Haven (CC0)',
  targetWidth: 9,
  normalize: 'full',
  glb: '/assets/portable-cassette-player.glb',
  mapping: {
    /* 重名节点运行时回退为网格名：Plane097=透明盖、Cylinder015=机身，见 __RAW.names */
    'Cylinder015': 'body',
    'Cylinder015_1': 'body',
    'Plane097': 'lid',
    'Plane097_1': 'lid',
    'portable_cassette_player_casette': 'cassette',
  },
  realPartIds: ['body', 'lid', 'cassette'],
  parts: [
    { id: 'body', zh: '机身与走带底盘', en: 'BODY & DECK', real: true,
      ex: [0, 0, 0], lo: [0, 1.2, 0], tag: '马达 · 飞轮 · 磁头都在下面',
      desc: '机身：掀开卡带就能看到的走带底盘——直流马达经橡胶皮带驱动大飞轮稳住转速，两根主轴对应卡带的两只卷轴，磁头从下方贴上磁带。机械按键通过杠杆切换机芯状态，那份「机械手感」是它区别于后来的 CD 机的灵魂。',
      specs: [['驱动', 'DC 马达 + 皮带 + 飞轮'], ['走带', '4.76cm/s 恒速'], ['磁头', '抹/录/放 三合一'], ['按键', '机械杠杆自锁']] },
    { id: 'lid', zh: '透明铰链盖', en: 'CLEAR LID', real: true,
      ex: [0, 1.4, -0.6], lo: [0, 1.1, 0], tag: '看得到磁带转的那扇窗',
      desc: '透明盖：亚克力铰链盖让你随时看得到磁带在转——「看着它走完 C60 的 30 分钟」是卡带时代的仪式感。盖内衬防滑垫压住卡带，合盖的「咔哒」由盖扣弹簧完成。',
      specs: [['材质', '透明亚克力'], ['结构', '铰链 + 盖扣'], ['彩蛋', '偷看磁带余量'], ['故障', '铰链断 = 常见死法']] },
    { id: 'cassette', zh: '卡带', en: 'CASSETTE', real: true,
      ex: [0.6, 0.4, 1.6], lo: [0, 1.1, 0], tag: 'C60 · A面与B面的人生',
      desc: '卡带：两只带轮卷着 90 米磁带，A 面放完翻个面继续——「翻面」是这一代人的音乐记忆。带盒里还有压带垫与导带柱，磁带涂层（氧化铁/铬带）决定音质等级。用铅笔手动倒带是时代的标志性手势。',
      specs: [['容量', 'C60 / C90'], ['磁带', '氧化铁 / 铬带'], ['操作', '铅笔手动倒带'], ['翻面', 'A/B 两面人生']] },
  ],
});
