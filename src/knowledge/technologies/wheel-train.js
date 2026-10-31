/* 齿轮传动系 —— 部件详情卡「原理」区词条 */
export default {
  id: 'wheel-train',
  zh: '齿轮传动系',
  principle:
    '齿轮啮合传递旋转运动，传动比同时就是转矩比：小轮带大轮，转速降低、转矩放大，反之亦然。' +
    '一组齿轮系把动力"换挡"到需要的速度与力量——钟表轮系把发条的高速小力矩换成指针的慢速，' +
    '汽车变速箱则在行驶中连续改写这个比例。',
  relatedParts: ['wheel-train', 'turntable', 'belt-drive', 'gears'],
  relatedDevices: ['tourbillon-movement', 'gramophone'],
  invented: '约公元前 150',
  history: [
    ['约公元前 150', '安提基特拉机械已使用精密青铜齿轮系'],
    ['13 世纪', '欧洲钟塔的擒纵+轮系定型'],
    ['1885', '汽车变速齿轮箱随内燃机汽车出现'],
  ],
  sources: [
    { label: 'Wikipedia — Gear train', url: 'https://en.wikipedia.org/wiki/Gear_train' },
  ],
  confidence: 'verified-3rd',
};
