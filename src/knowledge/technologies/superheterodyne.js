/* 超外差接收 —— 部件详情卡「原理」区词条 */
export default {
  id: 'superheterodyne',
  zh: '超外差接收',
  principle:
    '把天线收到的任意频率信号与本地振荡器混频，统一搬到固定的"中频"上再做放大和检波——' +
    '增益与滤波只需要针对一个固定频率优化，灵敏度与选择性远胜直接放大式收音机。' +
    '从电子管时代到晶体管收音机，"变频→中放→检波→低放"都是民用无线电的主干架构。',
  relatedParts: ['tuner'],
  relatedDevices: ['admiral-7t10', 'regency-tr1'],
  invented: '1917',
  history: [
    ['1917', 'Armstrong（美）与 Lévy（法）分别提出超外差原理'],
    ['1920s', '成为广播接收机的主流架构'],
    ['1954', 'Regency TR-1 以四只晶体管实现超外差，晶体管收音机商用化'],
  ],
  sources: [
    { label: 'Wikipedia — Superheterodyne receiver', url: 'https://en.wikipedia.org/wiki/Superheterodyne_receiver' },
  ],
  confidence: 'verified-3rd',
};
