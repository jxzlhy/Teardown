/* 留声机号筒拾放声 —— 部件详情卡「原理」区词条 */
export default {
  id: 'acoustic-horn',
  zh: '留声机号筒拾放声',
  principle:
    '纯机械的声音链：唱针沿旋转蜡筒/唱片的刻槽振动，带动振膜发声，喇叭形号筒把振膜的' +
    '微弱声阻抗匹配到开阔空气里——号筒的渐展曲线既是"扩音器"也是指向性控制。' +
    '录音是同一套机构反向运行：大号筒收声推动振膜，振膜带动刻针在介质上刻下声纹。',
  relatedParts: ['horn', 'turntable'],
  relatedDevices: ['gramophone'],
  invented: '1877',
  history: [
    ['1877', '爱迪生留声机：锡箔圆筒上的第一段录音'],
    ['1887', 'Berliner 转向圆盘唱片，量产复制成为可能'],
    ['1890s', '号筒式全机械留声机进入家庭'],
    ['1925', '电子拾音与电声录音取代纯声学录音'],
  ],
  sources: [
    { label: 'Wikipedia — Phonograph', url: 'https://en.wikipedia.org/wiki/Phonograph' },
  ],
  confidence: 'verified-3rd',
};
