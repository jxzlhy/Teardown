/* 创作工作室 · 编排器（V5.0.0/V5.0.1）
   状态机 idle → parsing → ready | error，串起 导入 → 报告 → 规则诊断 → 视口。
   Vue 壳只消费状态回调，不碰 three —— 与 src/engine、src/forge 同一分工哲学。 */

import * as THREE from 'three';
import { importFrom, normalizeInput, DEFAULT_CAP_MB, ERR } from './importer.js';
import { runDiagnostics } from './diagnostics.js';
import { createViewer } from './viewer.js';

export { ERR, DEFAULT_CAP_MB };

/* ?cap=N（MB）：部署方/测试可调体积上限，默认 256MB。
   hash 路由下查询串在 location.hash 内（/#/studio?cap=1），search 与 hash 两处都查 */
export function readCapMB() {
  const hashQ = location.hash.split('?')[1] || '';
  const v = Number(new URLSearchParams(hashQ + '&' + location.search.replace(/^\?/, '')).get('cap'));
  return Number.isFinite(v) && v >= 1 ? Math.min(v, 2048) : DEFAULT_CAP_MB;
}

export function createStudio({ canvas, onState }) {
  const viewer = createViewer(canvas);
  let report = null;
  let diag = null;
  let phase = 'idle';

  const emit = (patch) => {
    onState({
      phase, report, diag, selectedPath: null, ...patch,
    });
  };

  const capMB = readCapMB();

  async function importFiles(fileList) {
    const inputs = normalizeInput(fileList);
    if (!inputs.length) return;
    phase = 'parsing';
    emit({});
    try {
      const r = await importFrom(inputs, capMB);
      report = r;
      diag = runDiagnostics(r);
      viewer.setModel(r.root);
      viewer.onPick = (path) => emit({ selectedPath: path });
      phase = 'ready';
      emit({});
    } catch (e) {
      report = null; diag = null;
      viewer.setModel(new THREE.Group()); // 清空视口
      phase = 'error';
      emit({
        error: {
          code: e.code || ERR.UNKNOWN,
          message: String(e.message || e).slice(0, 300),
          cause: e.cause ? String(e.cause).slice(0, 200) : '',
        },
      });
    }
  }

  /* 馆内示例：与用户导入完全同一条管线（fetch → read() → importFrom） */
  async function loadSample(url, name) {
    phase = 'parsing';
    emit({});
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`示例资源加载失败（HTTP ${res.status}）`);
      const buf = await res.arrayBuffer();
      await importFiles([{ name, size: buf.byteLength, read: async () => buf }]);
    } catch (e) {
      phase = 'error';
      emit({ error: { code: ERR.READ, message: String(e.message || e) } });
    }
  }

  function highlightByPath(path) {
    if (!report) return;
    const obj = path ? report.nodesByPath.get(path) : null;
    viewer.setHighlight(obj && obj.isMesh ? obj : null, path);
  }

  function reset() {
    report = null; diag = null; phase = 'idle';
    viewer.setModel(new THREE.Group());
    emit({ error: null });
  }

  emit({});
  return {
    importFiles, loadSample, highlightByPath, reset,
    reframe: () => viewer.reframe(),
    setAutoRotate: (v) => viewer.setAutoRotate(v),
    dispose: () => viewer.dispose(),
  };
}
