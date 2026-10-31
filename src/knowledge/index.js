/* =============================================================
   知识库聚合入口（src/knowledge/index.js）
   - technologies：20 项全量词条（含实证 sources）；_stubs 为占位暂存区（当前为空）
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
import cameraOptics from './technologies/camera-optics.js';
import oledDisplay from './technologies/oled-display.js';
import wirelessPower from './technologies/wireless-power.js';
import hapticEngine from './technologies/haptic-engine.js';
import pcbSoc from './technologies/pcb-soc.js';
import usbC from './technologies/usb-c.js';
import coolingModule from './technologies/cooling-module.js';
import mainspringDrive from './technologies/mainspring-drive.js';
import wheelTrain from './technologies/wheel-train.js';
import turbineEngine from './technologies/turbine-engine.js';
import vacuumTube from './technologies/vacuum-tube.js';
import typebarLinkage from './technologies/typebar-linkage.js';
import acousticHorn from './technologies/acoustic-horn.js';
import internalCombustion from './technologies/internal-combustion.js';
import stubs from './technologies/_stubs.js';

export const technologies = [
  cmosSensor, liPoBattery, loudspeaker, threeAxisGimbal, escapement, superheterodyne,
  cameraOptics, oledDisplay, wirelessPower, hapticEngine,
  pcbSoc, usbC, coolingModule, mainspringDrive, wheelTrain,
  turbineEngine, vacuumTube, typebarLinkage, acousticHorn, internalCombustion,
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
