/* 机械锻造所 · 生成物注册与复现（V3.0 任务书 §5/§9）
   运行时注册表 = Map；持久层只存 {生成器, 参数, 种子}——同版本+参数+种子确定性重建（§4.1），
   几何不落盘。id 约定：forge-<generator>-<seed36>，DeviceViewer 按前缀分流。
   审计 RS-16：生成器模块改为**动态 import 按需加载**——旧实现静态引入全部 6 个生成器，
   导致每台普通设备页都为整包生成器代码付费（registry chunk gzip 14.59→29.17KB，+100%）。
   生成器体量只由 /forge 页（本就需要）与 forge- 深链装载路径承担。
   注意：createForgeDevice / getForgeDevice 相应为 async（装载点本就在异步流程内）。 */

const GENERATORS = {
  v8:        { label: 'V8 内燃机（交叉曲柄）',            version: 1, build: 'buildV8',        load: () => import('./v8.js') },
  turbofan:  { label: '大涵道比涡扇（双转子）',           version: 1, build: 'buildTurbofan',  load: () => import('./turbofan.js') },
  ringdrive: { label: 'FORGE-99 环式磁耦合核心（虚构概念）', version: 1, build: 'buildRingDrive', load: () => import('./ringdrive.js') },
  lockstitch:{ label: '锁式线迹机构（缝纫原理）',         version: 1, build: 'buildLockstitch', load: () => import('./lockstitch.js') },
  wankel:    { label: '转子发动机（Wankel 偏心轴系）',    version: 1, build: 'buildWankel',    load: () => import('./wankel.js') },
  governor:  { label: '瓦特离心调速器（飞球反馈）',       version: 1, build: 'buildGovernor',  load: () => import('./governor.js') },
};

const reg = new Map();
const LS_INDEX = 'dtm.forge.index';

export function isForgeId(id) {
  return typeof id === 'string' && id.startsWith('forge-');
}

function readIndex() {
  try { return JSON.parse(localStorage.getItem(LS_INDEX) || '[]'); } catch { return []; }
}
function writeIndex(list) {
  try { localStorage.setItem(LS_INDEX, JSON.stringify(list.slice(0, 60))); } catch { /* 隐私模式等：仅内存 */ }
}

/* 生成并注册（params/seed 已校验由生成器内部处理）；返回设备配置。
   GENERATOR_ID 断言：注册表 key 与模块内声明不一致立即抛错（防表内硬编码漂移） */
export async function createForgeDevice(generatorId, params, seed) {
  const gen = GENERATORS[generatorId];
  if (!gen) throw new Error(`未注册的生成器：${generatorId}`);
  const mod = await gen.load();
  if (mod.GENERATOR_ID !== generatorId) {
    throw new Error(`生成器注册表不一致：表键 ${generatorId} ≠ 模块声明 ${mod.GENERATOR_ID}`);
  }
  const build = mod[gen.build];
  if (typeof build !== 'function') {
    throw new Error(`生成器模块缺少导出 ${gen.build}（注册表与模块实现不一致）`);
  }
  const dev = build(params, seed);
  reg.set(dev.id, dev);
  const idx = readIndex().filter(e => e.id !== dev.id);
  idx.unshift({ id: dev.id, generator: generatorId, params: dev.forge.params, seed: dev.forge.seed, name: dev.name, ts: Date.now() });
  writeIndex(idx);
  return dev;
}

/* DeviceViewer 装载入口：先查运行时表，再按持久化记录确定性重建 */
export async function getForgeDevice(id) {
  if (reg.has(id)) return reg.get(id);
  const rec = readIndex().find(e => e.id === id);
  if (!rec) return null;
  return createForgeDevice(rec.generator, rec.params, rec.seed);
}

/* /forge 页列出历史生成记录（可复现入口） */
export function listForgeDevices() {
  return readIndex();
}

export function forgeGeneratorList() {
  return Object.entries(GENERATORS).map(([id, g]) => ({ id, label: g.label, version: g.version }));
}

/* ===== V4.0 Slice 4：配置文本化（生成器+参数+种子 → 可粘贴 JSON，跨会话/跨工具复现） ===== */
export function encodeForgeConfig(generatorId, params, seed) {
  return JSON.stringify({ fmt: 'gewu-forge/1', generator: generatorId, params, seed });
}

export function decodeForgeConfig(text) {
  let obj;
  try { obj = JSON.parse(String(text).trim()); } catch { throw new Error('不是有效的 JSON 文本'); }
  if (!obj || obj.fmt !== 'gewu-forge/1' || !GENERATORS[obj.generator]) {
    throw new Error('无法识别的锻造配置（缺 fmt 或生成器未注册）');
  }
  return { generator: obj.generator, params: obj.params || {}, seed: obj.seed };
}

export async function importForgeConfig(text) {
  const cfg = decodeForgeConfig(text);
  return createForgeDevice(cfg.generator, cfg.params, cfg.seed);
}

export { GENERATORS };
