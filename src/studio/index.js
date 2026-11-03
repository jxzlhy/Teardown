/* 创作工作室 · 编排器（V5.0.0/V5.0.1）
   状态机 idle → parsing → ready | error，串起 导入 → 报告 → 规则诊断 → 视口。
   Vue 壳只消费状态回调，不碰 three —— 与 src/engine、src/forge 同一分工哲学。 */

import * as THREE from 'three';
import { importFrom, normalizeInput, DEFAULT_CAP_MB, ERR, surveyScene, disposeDraco } from './importer.js';
import { runDiagnostics } from './diagnostics.js';
import { createViewer } from './viewer.js';
import { createWorkshop } from './workshop.js';
import { exportGlb, downloadBlob } from './exporter.js';
import * as library from './library.js';
import { planRepairs, buildRepairCommands, REPAIR_LABELS } from './repair.js';
import { generateFromText, buildFromSpec, specToJSON, specFromJSON, TEXTSPEC_FMT } from './textgen.js';
import { buildTemplate, detectTemplate, templateClamps } from './templates.js';
import { createGroupCommands, ungroupCommands, filterAncestors } from './groupops.js';

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
     stats 合并保留 file/fileSize/animationCount）。
     path 是 `${父}/${兄弟序}:${名}` 形式，任何结构变动都会让旧 path 指向别的节点
     （审计 RS-02）→ 这里用 uuid 做桥，产出「旧 path → 新 path」映射并回写 selectedPath。 */
  function resurvey() {
    if (!report) return null;
    const bridge = new Map();                       // obj.uuid → 旧 path
    for (const [p, obj] of report.nodesByPath) bridge.set(obj.uuid, p);
    const selObj = selectedPath ? report.nodesByPath.get(selectedPath) : null;

    const s = surveyScene(report.root);
    Object.assign(report, s, { stats: { ...report.stats, ...s.stats } });
    diag = runDiagnostics(report);

    const pathMap = new Map();                      // 旧 path → 新 path
    for (const [np, obj] of s.nodesByPath) {
      const old = bridge.get(obj.uuid);
      if (old !== undefined && old !== np) pathMap.set(old, np);
    }
    if (selObj) {
      let found = null;
      for (const [np, obj] of s.nodesByPath) if (obj === selObj) { found = np; break; }
      selectedPath = found;                         // 对象已被摘除则清空，避免指向同名新节点
    }
    return pathMap.size ? pathMap : null;
  }

  /* 结构变动后的统一同步：重普查 + 把 path 映射交给 UI（Vue 用它重映射勾选集） */
  const resync = (extra) => {
    const pathMap = resurvey();
    emit({ report: report ? { ...report } : null, pathMap, ...extra });
  };

  /* 文字/spec/模板多入口共用的装配路径（V5.0.4/V5.0.6）：报告标注 textGen + spec/template 快照 */
  function mountTextGen(root, spec, fileLabel, template) {
    const s = surveyScene(root);
    const stats = { file: fileLabel, fileSize: 0, ...s.stats, animationCount: 0 };
    report = {
      root, nodes: s.nodes, nodesByPath: s.nodesByPath,
      meshes: s.meshes, materials: s.materials, animations: [],
      stats, missingResources: [], textGen: true, textGenSpec: spec,
      textGenTemplate: template || null,
    };
    diag = runDiagnostics(report);
    if (workshop) workshop.dispose();
    workshop = createWorkshop(report);
    viewer.setModel(root);
    selectedPath = null;
    viewer.onPick = (path) => { selectedPath = path; emit({ selectedPath: path }); };
    phase = 'ready';
    emit({});
  }

  async function importFiles(fileList) {
    const inputs = normalizeInput(fileList);
    if (!inputs.length) return true;
    /* 失败不毁现场（审计 RS-15）：先记住当前好模型的全套引用。
       旧实现在 catch 里无条件清空 report/视口并 dispose workshop——
       一次失败导入会把用户此前载入并编辑过的场景整个毁掉。 */
    const prev = { report, diag, workshop, selectedPath };
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
      return true;
    } catch (e) {
      report = prev.report; diag = prev.diag; workshop = prev.workshop; selectedPath = prev.selectedPath;
      phase = report ? 'ready' : 'error';
      if (phase === 'error') viewer.setModel(new THREE.Group()); // 空场景失败才清空视口
      emit({
        error: {
          code: e.code || ERR.UNKNOWN,
          message: String(e.message || e).slice(0, 300),
          cause: e.cause ? String(e.cause).slice(0, 200) : '',
        },
      });
      return false;
    }
  }

  /* 馆内示例：与用户导入完全同一条管线（fetch → read() → importFrom）。
     先用 content-length 预拒超大资源，避免把整包读进内存再判（审计 RS-04） */
  async function loadSample(url, name) {
    phase = 'parsing';
    emit({});
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`示例资源加载失败（HTTP ${res.status}）`);
      const declared = Number(res.headers.get('content-length') || 0);
      if (declared && declared > capMB * 1024 * 1024) {
        throw Object.assign(new Error(`示例 ${(declared / 1048576).toFixed(1)}MB 超过上限 ${capMB}MB`), { code: ERR.SIZE });
      }
      const buf = await res.arrayBuffer();
      await importFiles([{ name, size: buf.byteLength, read: async () => buf }]);
    } catch (e) {
      phase = 'error';
      emit({ error: { code: e.code || ERR.READ, message: String(e.message || e) } });
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
    /* 卸载必须连调试钩子与场景引用一起清掉（审计 RS-01）：
       只 viewer.dispose() 会让 api → report → nodesByPath（全部 Object3D）+ workshop 历史闭包
       被 window.__STUDIO 强引用，每次再进 /studio 净留存一整个场景。
       与 DeviceViewer 的 delete window.__ENGINE 同约定：钩子只在页面存活期存在。 */
    dispose: () => {
      viewer.dispose();
      if (workshop) { workshop.dispose(); workshop = null; }
      report = null; diag = null; selectedPath = null; phase = 'idle';
      disposeDraco();   // 审计 RS-11：页面卸载即终止 worker 池，不留给下次导航
      if (typeof window !== 'undefined' && window.__STUDIO === api) delete window.__STUDIO;
    },

    /* 编辑器（无选中/未就绪返回 false/null） */
    getTransform: (p) => workshop && p ? workshop.getTransform(p) : null,
    setTransform: (p, t, l) => commit(() => workshop && workshop.setTransform(p, t, l)),
    resetTransform: (p) => commit(() => workshop && workshop.resetTransform(p)),
    getMaterial: (p) => workshop && p ? workshop.getMaterial(p) : null,
    setMaterialProp: (p, patch, l) => commit(() => workshop && workshop.setMaterialProp(p, patch, l)),
    undo: () => { if (!workshop) return false; const ok = workshop.undo(); if (ok) resync(); return ok; },
    redo: () => { if (!workshop) return false; const ok = workshop.redo(); if (ok) resync(); return ok; },
    canUndo: () => workshop ? workshop.canUndo() : false,
    canRedo: () => workshop ? workshop.canRedo() : false,
    lastEditLabel: () => workshop ? workshop.lastLabel() : '',

    /* —— 诊断→修复（V5.0.5 部分）：可确定性修复的规则 → 单条可撤销命令组 —— */
    planRepairs: () => (diag ? planRepairs(diag) : { fixable: [], manual: [] }),

    /* 一键修复（审计 RS-12）：所有可修规则合并为**一条**组合命令——
       旧 UI 逐规则各入一条历史记录却宣称「撤销可整体还原」，与实际不符 */
    repairAll: () => {
      if (!report || !diag || !workshop) return null;
      const plan = planRepairs(diag);
      if (!plan.fixable.length) return null;
      const before = diag.bySeverity;
      const cmds = [];
      const touched = [];
      const rules = [];
      for (const f of plan.fixable) {
        const built = buildRepairCommands(report, f.rule);
        if (!built) continue;
        cmds.push(...built.cmds);
        touched.push(...built.touched);
        rules.push(REPAIR_LABELS[f.rule] || f.rule);
      }
      if (!cmds.length) return null;
      if (!workshop.applyCommands(cmds, `自动修复（${rules.join('＋')}）`)) return null;
      resync();
      return { before, after: diag.bySeverity, touched, count: touched.length, rules };
    },

    /* —— 组件分组（V5.0.2 收尾）：组合/解散，命令栈可撤销 ——
       applyCommands 自带执行（RS-09 后契约：入栈即已生效） */
    groupSelected: (paths, name) => {
      if (!report || !workshop || !paths || !paths.length) return { ok: false, reason: '未就绪' };
      const meshes = paths.map((p) => report.nodesByPath.get(p)).filter((o) => o && o.isMesh);
      const built = createGroupCommands(report.root, meshes, name);
      if (!built) return { ok: false, reason: '无可入组的网格' };
      if (!workshop.applyCommands(built.cmds, `组合为组件「${built.group.name}」`)) {
        return { ok: false, reason: '组合执行失败（已回滚，未入历史）' };
      }
      resync();
      return { ok: true, groupName: built.group.name, count: built.count };
    },
    ungroupAt: (path) => {
      if (!report || !workshop || !path) return { ok: false, reason: '未就绪' };
      const obj = report.nodesByPath.get(path);
      if (!obj || !obj.userData || !obj.userData.__studioGroup) return { ok: false, reason: '所选不是可解散的组件' };
      const built = ungroupCommands(obj);
      if (!built) return { ok: false, reason: '组件不可解散' };
      if (!workshop.applyCommands(built.cmds, `解散组件「${obj.name}」`)) {
        return { ok: false, reason: '解散执行失败（已回滚，未入历史）' };
      }
      resync();
      return { ok: true, count: built.count };
    },

    /* —— 文字程序化建模（V5.0.4）：关键词模板解析（非 AI），产物走导入同一下游 ——
       mountTextGen：多入口（文字解析 / 模板 / spec 导入）共用的装配路径（确定性契约）。
       模板关键词优先：含「齿轮/曲柄/滑块/活塞/啮合」的描述走参数化模板（V5.0.6）。 */
    generateFromText: (text) => {
      const tpl = detectTemplate(text);
      if (tpl) {
        const built = buildTemplate(tpl.kind, tpl.params);
        if (!built.ok) return { ok: false, reason: built.reason, hint: '模板参数支持：' + Object.keys(templateClamps(tpl.kind)).join('/') };
        mountTextGen(built.root, null, `模板：${tpl.kind}`, { kind: built.kind, params: built.params });
        if (built.feasible === false) {
          return { ok: true, parts: built.parts.length, summary: built.parts.map((p) => p.id).join(', '), unknown: [], infeasible: true };
        }
        return { ok: true, parts: built.parts.length, summary: built.parts.map((p) => p.id).join(', '), unknown: [] };
      }
      const out = generateFromText(text);
      if (!out.ok) return out;
      mountTextGen(out.root, out.spec, '文字生成');
      return { ok: true, parts: out.parts.length, summary: out.summary, unknown: out.spec.unknown };
    },

    /* —— spec 结构化导入/导出（17.6 可扩展描述格式；确定性契约同文字入口） —— */
    exportTextSpec: () => {
      if (!report || !report.textGen) return null;
      try {
        if (report.textGenTemplate) {
          return JSON.stringify({ fmt: TEXTSPEC_FMT, template: report.textGenTemplate }, null, 1);
        }
        if (report.textGenSpec) return JSON.stringify(specToJSON(report.textGenSpec), null, 1);
        return null;
      } catch { return null; }
    },
    generateFromSpec: (jsonText) => {
      let obj;
      try { obj = JSON.parse(jsonText); } catch (e) {
        return { ok: false, reason: `spec 不是合法 JSON：${String(e.message || e).slice(0, 100)}` };
      }
      let spec;
      try { spec = specFromJSON(obj); } catch (e) {
        return { ok: false, reason: String(e.message || e).slice(0, 200) };
      }
      if (spec.template) {
        const built = buildTemplate(spec.template.kind, spec.template.params);
        if (!built.ok) return { ok: false, reason: built.reason };
        mountTextGen(built.root, null, 'spec 导入', { kind: built.kind, params: built.params });
        return { ok: true, parts: built.parts.length, summary: built.parts.map((p) => p.id).join(', '), unknown: [] };
      }
      const { root, parts } = buildFromSpec(spec);
      mountTextGen(root, spec, 'spec 导入');
      return { ok: true, parts: parts.length, summary: parts.map((p) => p.id).join(', '), unknown: [] };
    },
    repair: (rule) => {
      if (!report || !diag || !workshop) return null;
      const built = buildRepairCommands(report, rule);
      if (!built) return null;
      const before = diag.bySeverity;
      if (!workshop.applyCommands(built.cmds, `修复：${REPAIR_LABELS[rule] || rule}`)) return null;
      resync();
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
      /* importFiles 失败不再抛出（RS-15：失败保留现场）——这里按返回值如实把失败传给 UI */
      const ok = await importFiles([{
        name: (rec.name || 'work') + '.glb',
        size: src.size ?? src.byteLength,
        read: async () => (src.arrayBuffer ? src.arrayBuffer() : src.slice(0)),
      }]);
      if (!ok) throw new Error('作品载入失败（模型数据损坏？详见导入面板的失败原因）');
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
