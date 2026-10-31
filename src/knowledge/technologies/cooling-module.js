/* 散热模块（热管/VC 均热板/风扇） —— 部件详情卡「原理」区词条 */
export default {
  id: 'cooling-module',
  zh: '散热模块（热管/VC 均热板/风扇）',
  principle:
    '热管与 VC 均热板是同一种原理的两种形态：密封腔内的工质液体在热端蒸发吸热，' +
    '蒸气流向冷端凝结放热，再经毛细结构/重力回流——相变传热的等效导热率远高于实心铜。' +
    'VC 均热板是摊平的二维热管，适合把芯片热点摊成整面；风扇则用强制对流把热量带走，' +
    '游戏本与游戏手机会同时使用两者。',
  relatedParts: ['fan', 'heatsink', 'thermal', 'cooling'],
  relatedDevices: ['action4', 'framework-laptop13', 'mac-mini'],
  invented: '1963',
  history: [
    ['1963', 'George Grover 在 Los Alamos 制成现代热管'],
    ['1970s', '热管用于航天器温度调节'],
    ['2000s', '笔记本散热进入热管时代'],
    ['2010s', 'VC 均热板成为手机/游戏本旗舰标配'],
  ],
  sources: [
    { label: 'Wikipedia — Heat pipe（含 Vapor chamber 一节）', url: 'https://en.wikipedia.org/wiki/Heat_pipe' },
  ],
  confidence: 'verified-3rd',
};
