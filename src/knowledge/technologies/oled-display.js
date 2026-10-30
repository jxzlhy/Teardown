/* OLED 显示面板 —— 部件详情卡「原理」区词条 */
export default {
  id: 'oled-display',
  zh: 'OLED 显示面板',
  principle:
    'OLED 的有机发光层在电流通过时自发光（电致发光）：每个像素自己就是光源，' +
    '不需要 LCD 那样的背光模组——黑色像素直接熄灭，对比度理论上无限，' +
    '且面板可以做薄、可弯曲（柔性屏/折叠屏的物质基础）。' +
    '代价是有机材料寿命与烧屏风险，驱动要靠 TFT 背板逐像素控制。',
  relatedParts: ['display', 'screen', 'front-screen', 'rear-screen'],
  relatedDevices: ['iphone-12-teardown', 's25', 'pocket3'],
  invented: '1987',
  history: [
    ['1987', 'Kodak 的邓青云与 Van Slyke 发明实用 OLED 器件'],
    ['2007', '索尼推出首款 OLED 电视 XEL-1'],
    ['2010s', 'AMOLED 成为旗舰手机主流屏'],
    ['2019', '三星 Galaxy Fold 与柔宇折叠屏商品化'],
  ],
  sources: [
    { label: 'Wikipedia — OLED', url: 'https://en.wikipedia.org/wiki/OLED' },
  ],
  confidence: 'verified-3rd',
};
