/* =============================================================
   代际对比分组（策展数据；只收同系列、可对照的设备）
   - 规格行由各设备 specs 同名键自动聚类（CompareView），不逐条手抄
   - 对比口径为官方规格文本，未出现的规格显示 —（不臆造）
============================================================= */
const comparisons = [
  {
    id: 'iphone',
    zh: 'iPhone 代际',
    ids: ['iphone-12-teardown', 'iphone-13', 'iphone-16', 'iphone-17', 'iphone-air'],
  },
  {
    id: 's25',
    zh: 'Galaxy S25 三兄弟',
    ids: ['s25', 's25-plus', 's25-ultra'],
  },
  {
    id: 'action',
    zh: 'Osmo Action 两代',
    ids: ['action4', 'action5pro'],
  },
];

export default comparisons;

export function groupOf(deviceId){
  return comparisons.find(g => g.ids.includes(deviceId)) || null;
}
