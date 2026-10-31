/* 印制电路板与 SoC —— 部件详情卡「原理」区词条 */
export default {
  id: 'pcb-soc',
  zh: '印制电路板与 SoC',
  principle:
    'PCB 是导电层与绝缘层交替压合的"三明治"：铜箔蚀刻出走线，把芯片、阻容元件按电路图连接。' +
    '多层板把更多布线层叠进同一厚度，配合表面贴装（SMT）实现高密度；手机主板还要把' +
    '应用处理器（SoC）、存储、射频折叠堆进几平方厘米。SoC 则是把 CPU/GPU/ISP/基带' +
    '集成进一颗芯片的系统级方案，是现代电子设备的"心脏"。',
  relatedParts: ['board', 'mainboard', 'usb-pcb', 'board-cover', 'antenna'],
  relatedDevices: ['iphone-12-teardown', 's25', 'inside-drone'],
  invented: '1936',
  history: [
    ['1936', 'Paul Eisler 提出印制电路板工艺'],
    ['1940s末', 'PCB 在军用电子中量产，随后进入消费电子'],
    ['1960s', '双面板与多层板工艺成熟'],
    ['1980s', 'SMT 表面贴装普及，元件密度倍增'],
    ['2010s', '手机主板进入 HDI 任意层互连与堆叠封装时代'],
  ],
  sources: [
    { label: 'Wikipedia — Printed circuit board', url: 'https://en.wikipedia.org/wiki/Printed_circuit_board' },
  ],
  confidence: 'verified-3rd',
};
