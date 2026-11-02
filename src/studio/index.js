/* 创作工作室 · 编排器（V5.0.0/V5.0.1）
   状态机 idle → parsing → ready | error，串起 导入 → 报告 → 规则诊断 → 视口。
   Vue 壳只消费状态回调，不碰 three —— 与 src/engine、src/forge 同一分工哲学。 */

import * as THREE from 'three';
import { importFrom, normalizeInput, DEFAULT_CAP_MB, ERR, surveyScene } from './importer.js';
import { runDiagnostics } from './diagnostics.js';
import { createViewer } from './viewer.js';
import { createWorkshop } from './workshop.js';
import { exportGlb, downloadBlob } from './exporter.js';
import * as library from './library.js';
import { planRepairs, buildRepairCommands, REPAIR_LABELS } from './repair.js';

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
  let workshop = null;
  let selectedPath = null;

  const emit = (patch) => {
    onState({
      phase, report, diag, selectedPath,
      canUndo: workshop ? workshop.canUndo() : false,
      canRedo: workshop ? workshop.canRedo() : false,
      lastEditLabel: workshop ? workshop.lastLabel() : '',
      ...patch,
    });
  };

  const capMB = readCapMB();

  /* 重普查：保证报告与场景一致（修复/撤销/重做后法线与拓扑都可能变化；
     stats 合并保留 file/fileSize/animationCount） */
  function resurvey() {
    if (!report) return;
    const s = surveyScene(report.root);
    Object.assign(report, s, { stats: { ...report.stats, ...s.stats } });
    diag = runDiagnostics(report);
  }

  async function importFiles(fileList) {
    const inputs = normalizeInput(fileList);
    if (!inputs.length) return;
    phase = 'parsing';
    emit({});
    try {
      const r = await importFrom(inputs, capMB);
      report = r;
      diag = runDiagnostics(r);
      if (workshop) workshop.dispose();
      workshop = createWorkshop(r);
      viewer.setModel(r.root);
      selectedPath = null;
      viewer.onPick = (path) => { selectedPath = path; emit({ selectedPath: path }); };
      phase = 'ready';
      emit({});
    } catch (e) {
      report = null; diag = null;
      if (workshop) { workshop.dispose(); workshop = null; }
      selectedPath = null;
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

  /* —— 编辑器 API（V5.0.2）：网格级变换/材质 + 撤销重做 + GLB 导出 —— */
  const commit = (fn) => { const ok = fn(); if (ok) emit({}); return ok; };

  const api = {
    importFiles, loadSample, highlightByPath,
    reset() {
      report = null; diag = null; phase = 'idle';
      if (workshop) { workshop.dispose(); workshop = null; }
      selectedPath = null;
      viewer.setModel(new THREE.Group());
      emit({ error: null });
    },
    reframe: () => viewer.reframe(),
    setAutoRotate: (v) => viewer.setAutoRotate(v),
    dispose: () => viewer.dispose(),

    /* 编辑器（无选中/未就绪返回 false/null） */
    getTransform: (p) => workshop && p ? workshop.getTransform(p) : null,
    setTransform: (p, t, l) => commit(() => workshop && workshop.setTransform(p, t, l)),
    resetTransform: (p) => commit(() => workshop && workshop.resetTransform(p)),
    getMaterial: (p) => workshop && p ? workshop.getMaterial(p) : null,
    setMaterialProp: (p, patch, l) => commit(() => workshop && workshop.setMaterialProp(p, patch, l)),
    undo: () => { if (!workshop) return false; const ok = workshop.undo(); if (ok) { resurvey(); emit({ report: report ? { ...report } : null }); } return ok; },
    redo: () => { if (!workshop) return false; const ok = workshop.redo(); if (ok) { resurvey(); emit({ report: report ? { ...report } : null }); } return ok; },
    canUndo: () => workshop ? workshop.canUndo() : false,
    canRedo: () => workshop ? workshop.canRedo() : false,
    lastEditLabel: () => workshop ? workshop.lastLabel() : '',

    /* —— 诊断→修复（V5.0.5 部分）：可确定性修复的规则 → 单条可撤销命令组 —— */
    planRepairs: () => (diag ? planRepairs(diag) : { fixable: [], manual: [] }),
    repair: (rule) => {
      if (!report || !diag || !workshop) return null;
      const built = buildRepairCommands(report, rule);
      if (!built) return null;
      const before = diag.bySeverity;
      workshop.applyCommands(built.cmds, `修复：${REPAIR_LABELS[rule] || rule}`);
      built.cmds.forEach((c) => c.redo());   // 命令契约：push 只入栈，执行由调用方触发
      resurvey();
      emit({ report: { ...report } });
      return {
        before, after: diag.bySeverity,
        touched: built.touched,
        label: REPAIR_LABELS[rule] || rule,
      };
    },
    selected: () => selectedPath,
    exportGlb: async (filename) => {
      if (!report) throw new Error('没有可导出的模型');
      const out = await exportGlb(report, filename);
      return out;
    },
    downloadGlb: async () => {
      if (!report) return false;
      const base = (report.stats.file || 'model').replace(/\.(glb|gltf)$/i, '');
      const out = await exportGlb(report, `${base}-gewu-edited.glb`);
      downloadBlob(out.blob, out.filename);
      return true;
    },

    /* —— 本地作品库（V5.0.8）：IndexedDB 持久化 —— */
    saveWork: async (name) => {
      if (!report) throw new Error('先载入模型再保存作品');
      const out = await exportGlb(report);
      const rec = await library.saveWork({ name, glbData: out.blob, meta: { ...report.stats, bbox: undefined } });
      return rec;
    },
    listWorks: () => library.listWorks(),
    loadWork: async (id) => {
      const rec = await library.getWork(id);
      if (!rec) throw new Error('作品不存在或已被删除');
      const src = rec.glb;   // 存的是 Blob（结构化克隆）；兼容 ArrayBuffer 旧档
      await importFiles([{
        name: (rec.name || 'work') + '.glb',
        size: src.size ?? src.byteLength,
        read: async () => (src.arrayBuffer ? src.arrayBuffer() : src.slice(0)),
      }]);
      return { id: rec.id, name: rec.name };
    },
    deleteWork: (id) => library.deleteWork(id),
    renameWork: (id, name) => library.renameWork(id, name),
    backupJson: () => library.exportBackup(),
    restoreBackup: (data) => library.importBackup(data),
  };

  /* 馆内调试/测试钩子（与 __ENGINE/__RAW 同约定） */
  if (typeof window !== 'undefined') window.__STUDIO = api;

  emit({});
  return api;
}
