/* GLB 缓存淘汰策略：纯计算，便于在 Node 下直接验证。
   meta 形如 { [url]: { at: 上次使用时间戳, size: 字节数 } }。 */

export const GLB_CACHE_CAP = 512 * 1024 * 1024;

export function planEviction(meta, cap = GLB_CACHE_CAP, keepUrl = null){
  const items = Object.entries(meta || {}).map(([url, v]) => ({
    url, at: (v && v.at) || 0, size: Math.max(0, (v && v.size) || 0),
  }));
  const total = items.reduce((s, it) => s + it.size, 0);
  if(total <= cap) return { evict: [], total, after: total };
  items.sort((a, b) => a.at - b.at);   // 最久未使用的先淘汰
  const evict = [];
  let after = total;
  for(const it of items){
    if(after <= cap) break;
    if(keepUrl && it.url === keepUrl) continue;   // 刚写入的不淘汰
    evict.push(it.url);
    after -= it.size;
  }
  return { evict, total, after };
}
