/* =============================================================
   个人评分（V2 第七章）：五星总体 + 展开式多维评价 + 个人备注，纯本地 localStorage
   存储键 dtm.ratings = { [deviceId]: { overall, appearance, structure, parts, material, explode, interact, note, at } }
   维度即第七章 7.2 建议六维；不要求全部评分。pub-sub 与 explore.js 一致。
============================================================= */
const KEY = 'dtm.ratings';
const BASE_KEYS = ['overall', 'appearance', 'structure', 'parts', 'material', 'explode', 'interact'];
let cache = load();
const subs = new Set();

function load(){
  try{ return JSON.parse(localStorage.getItem(KEY) || '{}'); }catch{ return {}; }
}
function save(){
  try{ localStorage.setItem(KEY, JSON.stringify(cache)); }catch{ /* 隐私模式等：静默降级 */ }
}

export function getRatings(){ return cache; }
export function getRating(id){ return cache[id] || null; }
export function setRating(id, patch){
  const base = {};
  for(const k of BASE_KEYS) base[k] = cache[id]?.[k] || 0;
  const next = { ...base };
  for(const [k, v] of Object.entries(patch)){
    if(k === 'note'){ next.note = String(v || '').slice(0, 300); continue; }
    if(k in base) next[k] = Math.max(0, Math.min(5, Math.round(v) || 0));
  }
  next.at = Date.now();
  cache[id] = next;
  save();
  subs.forEach(f => f());
}
export function clearRating(id){
  if(cache[id]){ delete cache[id]; save(); subs.forEach(f => f()); }
}
export function subscribeRatings(f){ subs.add(f); return () => subs.delete(f); }
