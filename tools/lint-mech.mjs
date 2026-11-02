/* V4.0 MI① 校验入 lint：全部 manifest 设备的 mech 关系数据校验（稳定 ID/引用/类型/kinematic 口径）。
   forge 生成物的 mech 由生成器内 validateMech 在渲染前校验（DeviceViewer 面板隐藏兜底）。 */
import { pathToFileURL } from 'node:url';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { installDomShim } from './lib-node-shim.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
installDomShim();
const { devices } = await import(pathToFileURL(path.join(ROOT, 'src/devices/registry.js')).href);
const { validateMech } = await import(pathToFileURL(path.join(ROOT, 'src/forge/mech.js')).href);

let checked = 0, bad = 0;
for (const device of devices) {
  if (!device.mech) continue;
  checked++;
  const { ok, errors } = validateMech(device);
  if (!ok) { bad++; console.log(`✗ ${device.id}: ${errors.join('；')}`); }
  else console.log(`✓ ${device.id}: mech ${device.mech.edges.length} 边`);
}
console.log(`\nmech 校验：${checked} 台含关系数据，${bad} 台失败`);
process.exit(bad ? 1 : 0);
