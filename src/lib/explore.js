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
/** 切换收藏，返回切换后的状态；收藏时自动记入收藏时间（V2 第六章） */
export function toggleFavorite(id){
  const cur = getFavorites();
  const i = cur.indexOf(id);
  if(i >= 0) cur.splice(i, 1); else cur.push(id);
  writeJSON(K_FAV, cur);
  if(i < 0){
    const map = ensureMeta(id);
    if(!map[id].at) map[id].at = Date.now();
    writeJSON(K_META, map);
  }
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

/* ---------- 收藏馆元数据（V2 第六章）：自定义分类 / 备注 / 收藏时间 ----------
   dtm.favmeta = { [deviceId]: { cats: [分类名], note: '', at: 收藏时间戳 } }
   dtm.cats = [分类名...]（有序）；首次使用时给两个默认分类。
   一个模型可加入多个分类；分类删除时自动从所有模型摘除。 ---------- */
const K_META = 'dtm.favmeta';
const K_CATS = 'dtm.cats';
const DEFAULT_CATS = ['最喜欢的模型', '值得研究'];

export function getFavMeta(){
  const v = readJSON(K_META, {});
  return (typeof v === 'object' && v) ? v : {};
}
export function getFavMetaOf(id){
  return getFavMeta()[id] || null;
}
function ensureMeta(id){
  const map = getFavMeta();
  if(!map[id]) map[id] = { cats: [], note: '', at: Date.now() };
  if(!map[id].at) map[id].at = Date.now();
  if(!Array.isArray(map[id].cats)) map[id].cats = [];
  return map;
}
export function getCats(){
  const v = readJSON(K_CATS, null);
  if(Array.isArray(v) && v.every(x => typeof x === 'string')) return v;
  return [...DEFAULT_CATS];
}
export function addCat(name){
  const name2 = (name || '').trim();
  if(!name2) return false;
  const list = getCats();
  if(list.includes(name2)) return false;
  writeJSON(K_CATS, [...list, name2]);
  return true;
}
export function renameCat(oldName, newName){
  const name2 = (newName || '').trim();
  if(!name2 || oldName === name2) return false;
  const list = getCats();
  const i = list.indexOf(oldName);
  if(i < 0 || list.includes(name2)) return false;
  list[i] = name2;
  writeJSON(K_CATS, list);
  const map = getFavMeta();
  for(const id of Object.keys(map)){
    const m = map[id];
    if(m.cats?.includes(oldName)) m.cats = m.cats.map(c => c === oldName ? name2 : c);
  }
  writeJSON(K_META, map);
  return true;
}
export function delCat(name){
  writeJSON(K_CATS, getCats().filter(c => c !== name));
  const map = getFavMeta();
  for(const id of Object.keys(map)){
    const m = map[id];
    if(m.cats?.includes(name)) m.cats = m.cats.filter(c => c !== name);
  }
  writeJSON(K_META, map);
}
export function toggleFavCat(id, cat){
  const map = ensureMeta(id);
  const m = map[id];
  m.cats = m.cats.includes(cat) ? m.cats.filter(c => c !== cat) : [...m.cats, cat];
  writeJSON(K_META, map);
}
export function setFavNote(id, note){
  const map = ensureMeta(id);
  map[id].note = String(note || '').slice(0, 200);
  writeJSON(K_META, map);
}
