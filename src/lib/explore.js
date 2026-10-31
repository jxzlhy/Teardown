/* =============================================================
   探索系统（Phase 7）：纯本地 dtm.* localStorage
   - 收藏 favorites：设备 id 列表
   - 已探索 explored：{ [deviceId]: { at, brand } }（装载完成即记）
   - 徽章 badges：由收藏/已探索即时推导（无独立存储、无状态漂移）
   原则：不打分、不排行、不弹窗；清空 localStorage 即从零复现。
   变更通过简单 pub-sub 通知（同页多组件同步），跨页用 storage 事件。
============================================================= */
const K_FAV = 'dtm.favorites';
const K_EXP = 'dtm.explored';

const listeners = new Set();
function notify(){
  for(const cb of listeners){ try{ cb(); }catch{ /* 单个订阅者异常不影响其余 */ } }
}
export function subscribeExplore(cb){
  listeners.add(cb);
  return () => listeners.delete(cb);
}

function readJSON(key, fallback){
  try{
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  }catch{ return fallback; }
}
function writeJSON(key, val){
  try{ localStorage.setItem(key, JSON.stringify(val)); }catch{ /* 隐私模式等：静默降级 */ }
  notify();
}

/* ---------- 收藏 ---------- */
export function getFavorites(){
  const v = readJSON(K_FAV, []);
  return Array.isArray(v) ? v.filter(x => typeof x === 'string') : [];
}
export function isFavorite(id){
  return getFavorites().includes(id);
}
/** 切换收藏，返回切换后的状态 */
export function toggleFavorite(id){
  const cur = getFavorites();
  const i = cur.indexOf(id);
  if(i >= 0) cur.splice(i, 1); else cur.push(id);
  writeJSON(K_FAV, cur);
  return i < 0;
}

/* ---------- 已探索 ---------- */
export function markExplored(id, brand){
  const map = readJSON(K_EXP, {});
  if(typeof map !== 'object' || !map) return;
  if(!map[id]){
    map[id] = { at: Date.now(), brand: brand || null };
    writeJSON(K_EXP, map);
  }
}
export function getExplored(){
  const map = readJSON(K_EXP, {});
  return (typeof map === 'object' && map) ? map : {};
}

/* ---------- 徽章（即时推导） ---------- */
export const BADGE_DEFS = [
  { id: 'first-teardown', zh: '初次拆解', desc: '完成 1 台设备的结构探索' },
  { id: 'wide-eye', zh: '五湖四海', desc: '探索 5 台设备' },
  { id: 'ten-gallery', zh: '十馆之约', desc: '探索 10 台设备' },
  { id: 'brand-hopper', zh: '跨界考察', desc: '考察 3 个及以上品牌' },
  { id: 'collector', zh: '收藏家', desc: '收藏 3 台设备' },
];
export function getBadges(){
  const favs = getFavorites();
  const explored = Object.keys(getExplored());
  const brands = new Set(Object.values(getExplored()).map(v => v && v.brand).filter(Boolean));
  const earned = new Set();
  if(explored.length >= 1) earned.add('first-teardown');
  if(explored.length >= 5) earned.add('wide-eye');
  if(explored.length >= 10) earned.add('ten-gallery');
  if(brands.size >= 3) earned.add('brand-hopper');
  if(favs.length >= 3) earned.add('collector');
  return BADGE_DEFS.map(d => ({ ...d, earned: earned.has(d.id) }));
}
