/* 机械锻造所 · 种子随机（V3.0 任务书 §4.1：同版本+同参数+同 Seed ⇒ 可复现，禁用裸 Math.random） */

/* mulberry32：32bit 种子 → 确定性伪随机流 */
export function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* 包装出常用取值器；rng() ∈ [0,1) */
export function makeRng(seed) {
  const next = mulberry32(seed);
  return {
    next,
    /* [min,max) 均匀浮点 */
    range: (min, max) => min + (max - min) * next(),
    /* [min,max] 整数 */
    int: (min, max) => Math.floor(min + (max - min + 1) * next()),
    /* 从数组等概率取一个 */
    pick: (arr) => arr[Math.floor(next() * arr.length) % arr.length],
    /* 近似正态（Box-Muller 截断在 ±2σ），center±sigma */
    gauss: (center, sigma) => {
      const u = Math.max(1e-9, next()), v = next();
      const g = Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
      return center + Math.max(-2, Math.min(2, g)) * sigma;
    },
    /* 以 1/2 概率布尔 */
    chance: (p = 0.5) => next() < p,
  };
}

/* 字符串种子 → 32bit（简单 FNV-1a），允许用户输入任意种子文本 */
export function seedFromString(str) {
  const s = String(str ?? '');
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193); }
  return h >>> 0;
}
