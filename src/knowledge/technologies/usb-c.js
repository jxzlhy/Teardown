/* USB-C 接口 —— 部件详情卡「原理」区词条 */
export default {
  id: 'usb-c',
  zh: 'USB-C 接口',
  principle:
    '24 针的双面对称连接器——不再有"插反"这回事。正反插靠的是两排镜像触点：' +
    '线缆里的芯片根据插接方向把信号路由到正确引脚。除了数据与供电（最高可达 240W 的 ' +
    'USB PD），同一个口还能承载 DisplayPort 视频与模拟音频，是"一个口统一所有设备"的尝试。',
  relatedParts: ['usb', 'port', 'usb-pcb'],
  relatedDevices: ['s25', 'iphone-16', 'action4'],
  invented: '2014',
  history: [
    ['2012', 'USB-IF 启动 Type-C 连接器研发'],
    ['2014', 'Type-C 规范 1.0 发布（8 月 11 日）'],
    ['2015', '首批 USB-C 设备上市（MacBook 12″ 等）'],
    ['2020', 'USB PD 扩展至 240W（EPR），取代大部分专用充电口'],
  ],
  sources: [
    { label: 'Wikipedia — USB-C', url: 'https://en.wikipedia.org/wiki/USB-C' },
  ],
  confidence: 'verified-3rd',
};
