/* =============================================================
   知识库聚合入口（src/knowledge/index.js）
   - technologies：6 项全量词条（含实证 sources）+ 14 项占位登记（待编写）
   - techForPart(partId)：精确命中优先，其次最长前缀匹配（speaker-l → speaker）
   禁止臆造：principle 为空 = UI 显示「原理编写中」；lint-knowledge 强制
   非空 principle 必须携带 ≥1 条 sources。
============================================================= */
import cmosSensor from './technologies/cmos-sensor.js';
import liPoBattery from './technologies/li-po-battery.js';
import loudspeaker from './technologies/loudspeaker.js';
import threeAxisGimbal from './technologies/three-axis-gimbal.js';
import escapement from './technologies/escapement.js';
import superheterodyne from './technologies/superheterodyne.js';
import stubs from './technologies/_stubs.js';

export const technologies = [
  cmosSensor, liPoBattery, loudspeaker, threeAxisGimbal, escapement, superheterodyne,
  ...stubs,
];

const sorted = [...technologies].sort((a, b) => b.id.length - a.id.length);

export function techForPart(partId){
  if(!partId) return null;
  for(const t of sorted){
    if(t.relatedParts.includes(partId)) return t;      // 精确命中优先
  }
  for(const t of sorted){
    if(t.relatedParts.some(p => partId.startsWith(p + '-'))) return t;   // speaker-l → speaker
  }
  return null;
}
