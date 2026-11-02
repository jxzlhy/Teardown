/* 机械锻造所 · 生成物注册与复现（V3.0 任务书 §5/§9）
   运行时注册表 = Map；持久层只存 {生成器, 参数, 种子}——同版本+参数+种子确定性重建（§4.1），
   几何不落盘。id 约定：forge-<generator>-<seed36>，DeviceViewer 按前缀分流。 */

import { buildV8, GENERATOR_ID as V8_ID, GENERATOR_VERSION as V8_VER } from './v8.js';
import { buildTurbofan, GENERATOR_ID as TF_ID, GENERATOR_VERSION as TF_VER } from './turbofan.js';
import { buildRingDrive, GENERATOR_ID as RD_ID, GENERATOR_VERSION as RD_VER } from './ringdrive.js';
import { buildLockstitch, GENERATOR_ID as LS_ID, GENERATOR_VERSION as LS_VER } from './lockstitch.js';
import { buildWankel, GENERATOR_ID as WK_ID, GENERATOR_VERSION as WK_VER } from './wankel.js';
import { buildGovernor, GENERATOR_ID as GV_ID, GENERATOR_VERSION as GV_VER } from './governor.js';

const GENERATORS = {
  [V8_ID]: { build: buildV8, version: V8_VER, label: 'V8 内燃机（交叉曲柄）' },
  [TF_ID]: { build: buildTurbofan, version: TF_VER, label: '大涵道比涡扇（双转子）' },
  [RD_ID]: { build: buildRingDrive, version: RD_VER, label: 'FORGE-99 环式磁耦合核心（虚构概念）' },
  [LS_ID]: { build: buildLockstitch, version: LS_VER, label: '锁式线迹机构（缝纫原理）' },
  [WK_ID]: { build: buildWankel, version: WK_VER, label: '转子发动机（Wankel 偏心轴系）' },
  [GV_ID]: { build: buildGovernor, version: GV_VER, label: '瓦特离心调速器（飞球反馈）' },
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

/* 生成并注册（params/seed 已校验由生成器内部处理）；返回设备配置 */
export function createForgeDevice(generatorId, params, seed) {
  const gen = GENERATORS[generatorId];
  if (!gen) throw new Error(`未注册的生成器：${generatorId}`);
  const dev = gen.build(params, seed);
  reg.set(dev.id, dev);
  const idx = readIndex().filter(e => e.id !== dev.id);
  idx.unshift({ id: dev.id, generator: generatorId, params: dev.forge.params, seed: dev.forge.seed, name: dev.name, ts: Date.now() });
  writeIndex(idx);
  return dev;
}

/* DeviceViewer 装载入口：先查运行时表，再按持久化记录确定性重建 */
export function getForgeDevice(id) {
  if (reg.has(id)) return reg.get(id);
  const rec = readIndex().find(e => e.id === id);
  if (!rec) return null;
  const dev = createForgeDevice(rec.generator, rec.params, rec.seed);
  return dev;
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

export function importForgeConfig(text) {
  const cfg = decodeForgeConfig(text);
  return createForgeDevice(cfg.generator, cfg.params, cfg.seed);
}

export { GENERATORS };
