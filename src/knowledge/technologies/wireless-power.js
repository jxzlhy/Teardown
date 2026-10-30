/* 无线充电（Qi） —— 部件详情卡「原理」区词条 */
export default {
  id: 'wireless-power',
  zh: '无线充电（Qi）',
  principle:
    '电磁感应：充电板内的初级线圈通入交变电流，产生交变磁场；设备背部的次级线圈' +
    '靠近时感应出电流，整流后为电池充电。两线圈要对准且间距极小，所以手机充电线圈' +
    '通常就贴在背板中央。Qi（2008 年起由 WPC 制定，2010 年首发）统一了功率协商与' +
    '异物检测协议，是消费电子无线充电的事实标准。',
  relatedParts: ['coil'],
  relatedDevices: ['iphone-12-teardown', 'iphone-13', 's25'],
  invented: '2010',
  history: [
    ['1894', '特斯拉演示无线电能传输'],
    ['2008', 'WPC 联盟成立，制定 Qi 标准'],
    ['2010', 'Qi 1.0 发布'],
    ['2017', 'iPhone 8/X 加入无线充电，Qi 全面普及'],
  ],
  sources: [
    { label: 'Wikipedia — Inductive charging（含 Qi 一节）', url: 'https://en.wikipedia.org/wiki/Inductive_charging' },
  ],
  confidence: 'verified-3rd',
};
