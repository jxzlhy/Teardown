/* m4a1 长轴在 y → 绕 X 轴 +90° 抬正（+y → +z），供 optimize 前预处理 */
import { NodeIO } from '@gltf-transform/core';
const io = new NodeIO();
const doc = await io.read('vendor/assets/originals/low-poly_m4a1.glb');
const q = [Math.SQRT1_2, 0, 0, Math.SQRT1_2]; /* 绕 +X 转 +90°：y→z */
for (const node of doc.getRoot().getDefaultScene().listChildren()) {
  node.setRotation(q);
}
await io.write('/tmp/m4_rot.glb', doc);
console.log('ROTATED ok');
