/* 三轴机械增稳云台 —— 部件详情卡「原理」区词条 */
export default {
  id: 'three-axis-gimbal',
  zh: '三轴机械增稳云台',
  principle:
    '相机通过三个正交轴（俯仰/横滚/偏航）的轴承串接悬挂在机身上，每轴由一颗无刷电机直驱；' +
    'IMU 感知机身姿态后，控制器分解出手抖与主动转动的差别，只抵消不想要的抖动、保留有意的摇移，' +
    '让相机在空间中保持指向。与光学防抖（移动镜片/传感器）不同，机械云台稳定的是整台相机。',
  relatedParts: ['gimbal'],
  relatedDevices: ['pocket3', 'action4'],
  invented: '2010s',
  history: [
    ['古代', '常平架（cardan suspension）用于船上悬挂罗盘/油灯'],
    ['2013', 'DJI Phantom 系列把电动三轴云台带进消费级航拍'],
    ['2014', '手持云台（Osmo 系列前身）出现，vlog 用户随身增稳'],
    ['2010s末', '手机折叠云台相机成为独立品类'],
  ],
  sources: [
    { label: 'Wikipedia — Gimbal（含 3 轴相机增稳一节）', url: 'https://en.wikipedia.org/wiki/Gimbal' },
  ],
  confidence: 'verified-3rd',
};
