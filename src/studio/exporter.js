/* 创作工作室 · GLB 导出（V5.0.2）
   导出**编辑后**的实时场景为二进制 GLB Blob（下载由壳层触发）。
   GLTFExporter 不改动源场景；动画/扩展按 three 导出器实际支持为准。 */

import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';

export function exportGlb(report, filename) {
  return new Promise((resolve, reject) => {
    const exporter = new GLTFExporter();
    exporter.parse(report.root, (result) => {
      const blob = new Blob([result], { type: 'model/gltf-binary' });
      resolve({ blob, bytes: blob.size, filename: filename || 'gewu-studio-export.glb' });
    }, (err) => reject(new Error('GLB 导出失败：' + String(err && err.message || err).slice(0, 200))), { binary: true });
  });
}

export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}
