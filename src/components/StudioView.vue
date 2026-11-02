<template>
  <div class="studio" @dragover.prevent="dragging = true" @dragleave.self="dragging = false" @drop.prevent="onDrop">
    <header class="studio-nav">
      <div class="studio-mark">
        <router-link to="/" class="studio-back">← 格物馆</router-link>
        <span class="studio-title">创作工作室</span>
        <small>CREATE STUDIO · 导入与体检</small>
      </div>
    </header>

    <main class="studio-main">
      <!-- 左：3D 视口 -->
      <section class="studio-stage" :class="{ dragging }">
        <canvas ref="cv" class="studio-cv" aria-label="模型预览视口"></canvas>

        <!-- 参考图叠层（V5.0.3）：仅作对照参考——不承诺从图片推断几何 -->
        <img v-if="refImg" ref="refImgEl" class="st-refimg" :src="refImg.src" alt="参考图"
          :style="{ opacity: refCfg.opacity / 100, width: refCfg.scale + '%',
                    left: refCfg.x + '%', top: refCfg.y + '%' }" />

        <div v-if="st.phase === 'idle'" class="st-empty">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2"><path d="M12 3v12m0 0l-4-4m4 4l4-4M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2"/></svg>
          <b>拖入 GLB / GLTF 开始</b>
          <span>.gltf 请连同 .bin 与贴图一起拖入（可多选）；文件仅在本浏览器内解析，不上传任何服务器</span>
          <div class="st-empty-actions">
            <button @click="$refs.file.click()">选择文件</button>
            <button @click="sample('/assets/m4-carbine.glb', 'm4-carbine.glb')">载入馆内示例</button>
          </div>
        </div>

        <div v-else-if="st.phase === 'parsing'" class="st-empty">
          <b class="st-pulse">解析中…</b>
          <span>大模型首次解析可能需要数秒</span>
        </div>

        <div v-if="dragging" class="st-dropmask"><b>松开以导入</b></div>

        <div v-if="st.phase === 'ready'" class="st-tools">
          <button :class="{ on: spin }" @click="toggleSpin" :aria-pressed="spin">⟳ 自动旋转</button>
          <button @click="studio && studio.reframe()">⌖ 复位视角</button>
          <button @click="$refs.file.click()">＋ 导入替换</button>
          <i class="st-tools-sep"></i>
          <button :disabled="!st.canUndo" @click="studio.undo()" aria-label="撤销">↩ 撤销</button>
          <button :disabled="!st.canRedo" @click="studio.redo()" aria-label="重做">↪ 重做</button>
          <button @click="doExport" :disabled="exporting">{{ exporting ? '导出中…' : '⬇ 导出 GLB' }}</button>
          <span v-if="st.lastEditLabel" class="st-history">{{ st.lastEditLabel }}</span>
        </div>
      </section>

      <!-- 右：信息面板列 -->
      <aside class="studio-side">
        <!-- 错误态（完整替换右列，可读的失败原因） -->
        <template v-if="st.phase === 'error'">
          <div class="st-panel st-errpanel">
            <div class="st-eyebrow" style="--c:var(--err)">导入失败 · {{ st.error.code }}</div>
            <p class="st-errmsg">{{ st.error.message }}</p>
            <p v-if="st.error.cause" class="st-errcause">{{ st.error.cause }}</p>
            <ul class="st-errhints">
              <li v-if="st.error.code === 'ERR_FORMAT'">支持 .glb（推荐，单文件自包含）与 .gltf；其它格式请先转换。</li>
              <li v-else-if="st.error.code === 'ERR_SIZE'">可在 URL 加 ?cap=N（MB）临时调高上限；超大模型建议先压缩几何与贴图。</li>
              <li v-else-if="st.error.code === 'ERR_RESOURCES'">.gltf 的外部依赖不完整：把 .bin 与全部贴图和 .gltf 放在同一目录一起拖入。</li>
              <li v-else-if="st.error.code === 'ERR_EMPTY'">文件能解析，但场景里没有任何网格——可能是纯灯光/相机文件或导出设置有误。</li>
              <li v-else-if="st.error.code === 'ERR_PARSE'">文件结构损坏：常见于下载不完整或扩展名被误改。</li>
            </ul>
            <button class="st-retry" @click="studio && studio.reset()">← 重新导入</button>
          </div>
        </template>

        <template v-else>
          <!-- 01 导入 -->
          <div class="st-panel">
            <div class="st-eyebrow">01 · 导入</div>
            <div class="st-actions">
              <button class="st-go" :disabled="st.phase === 'parsing'" @click="$refs.file.click()">{{ st.phase === 'parsing' ? '解析中…' : '选择文件（可多选）' }}</button>
              <button :disabled="st.phase === 'parsing'" @click="sample('/assets/m4-carbine.glb', 'm4-carbine.glb')">馆内示例 A</button>
              <button :disabled="st.phase === 'parsing'" @click="sample('/assets/airtag.glb', 'airtag.glb')">馆内示例 B</button>
            </div>
            <p class="st-note">GLB / GLTF · 上限 {{ capMB }}MB · .gltf 外部依赖需一并拖入 · 文件不离开浏览器</p>
          </div>

          <!-- 02 概览 -->
          <div v-if="st.report" class="st-panel">
            <div class="st-eyebrow">02 · 结构概览</div>
            <div class="st-stats">
              <div><b>{{ st.report.stats.meshCount }}</b><span>网格</span></div>
              <div><b>{{ fmt(st.report.stats.triTotal) }}</b><span>三角形</span></div>
              <div><b>{{ fmt(st.report.stats.vertTotal) }}</b><span>顶点</span></div>
              <div><b>{{ st.report.stats.nodeCount }}</b><span>节点</span></div>
              <div><b>{{ st.report.stats.materialCount }}</b><span>材质</span></div>
              <div><b>{{ st.report.stats.textureCount }}</b><span>贴图引用</span></div>
              <div><b>{{ st.report.stats.animationCount }}</b><span>动画</span></div>
              <div><b>{{ dims }}</b><span>尺寸（原单位）</span></div>
            </div>
            <p class="st-note">{{ st.report.stats.file }}<template v-if="!st.report.textGen"> · {{ (st.report.stats.fileSize / 1048576).toFixed(2) }}MB</template><template v-else> · 程序化生成（无源文件）</template>
              <template v-if="st.report.missingResources.length"> · <em class="st-miss">{{ st.report.missingResources.length }} 个外部资源未命中</em></template>
            </p>
          </div>

          <!-- 03 层级 -->
          <div v-if="st.report" class="st-panel">
            <div class="st-eyebrow">03 · 层级树</div>
            <div class="st-tree" role="listbox" aria-label="节点层级">
              <button v-for="n in shownNodes" :key="n.id" role="option" :aria-selected="st.selectedPath === n.path"
                class="st-node" :class="{ mesh: n.isMesh, on: st.selectedPath === n.path }"
                :style="{ paddingLeft: 8 + n.depth * 13 + 'px' }"
                @click="pick(n)">
                <i>{{ n.isMesh ? '◈' : '▸' }}</i>{{ n.name || '(' + n.type + ')' }}
              </button>
            </div>
            <p v-if="st.report.nodes.length > shownNodes.length" class="st-note">
              大型场景：仅显示前 {{ shownNodes.length }} / {{ st.report.nodes.length }} 个节点（交互性能保护）
            </p>
            <p v-else class="st-note">点击网格行或视口中的模型可互相联动高亮</p>
          </div>

          <!-- 04 诊断 -->
          <div v-if="st.diag" class="st-panel">
            <div class="st-eyebrow">04 · 质量诊断 <small>本地规则 · 非 AI 推断</small></div>
            <div class="st-chips">
              <span class="st-chip" style="--c:var(--err)">错误 {{ st.diag.bySeverity.error }}</span>
              <span class="st-chip" style="--c:var(--warn)">警告 {{ st.diag.bySeverity.warn }}</span>
              <span class="st-chip" style="--c:var(--txt-3)">提示 {{ st.diag.bySeverity.info }}</span>
            </div>
            <p v-if="!st.diag.findings.length" class="st-note">✓ 未命中任何规则</p>
            <ul v-else class="st-findings">
              <li v-for="(f, i) in st.diag.findings" :key="i" :class="'sev-' + f.severity">
                <b>{{ f.title }}</b><i v-if="f.fixable" class="st-fixbadge">可自动修复</i><span v-if="f.node"> · {{ f.node }}</span>
                <p>{{ f.detail }}</p>
              </li>
            </ul>
            <template v-if="repairPlan.fixable.length">
              <div class="st-repairbar">
                <button class="st-apply" @click="doRepairAll">⚡ 自动修复 {{ repairTotal }} 处（可撤销）</button>
              </div>
              <p v-if="repairMsg" class="st-note st-repairmsg">{{ repairMsg }}</p>
            </template>
            <details v-if="repairPlan.manual.length" class="st-manual">
              <summary>{{ repairPlan.manual.length }} 类问题需人工判断（自动修复不做不可证实的改动）</summary>
              <ul><li v-for="m in repairPlan.manual" :key="m.rule"><b>{{ m.rule }}</b> — {{ m.reason }}</li></ul>
            </details>
          </div>

          <!-- 05 编辑器（选中网格的变换/材质，V5.0.2） -->
          <div v-if="st.report && st.selectedPath && ed.t" ref="edPanel" class="st-panel">
            <div class="st-eyebrow">05 · 编辑器 <small>网格级 · 可撤销</small></div>
            <p class="st-ednode"><b>{{ selName }}</b></p>

            <div class="st-grid3">
              <label v-for="(row, axis) in [{ k: 'pos', label: '位置' }, { k: 'rot', label: '旋转°' }, { k: 'scl', label: '缩放' }]" :key="row.k">
                <span>{{ row.label }}</span>
                <span class="st-ax">
                  <input v-for="(n, i) in ed[row.k]" :key="i" type="number" step="0.01" v-model.number="ed[row.k][i]" :aria-label="row.label + ' ' + 'XYZ'[i]" />
                </span>
              </label>
            </div>
            <div class="st-edrow">
              <button class="st-apply" @click="applyTransform">应用变换</button>
              <button @click="studio.resetTransform(st.selectedPath)">复位</button>
            </div>

            <div v-if="ed.mat" class="st-matedit">
              <p v-if="ed.mat.shared > 1" class="st-note st-miss">⚠ 该材质被 {{ ed.mat.shared }} 块网格共享——修改会同时生效</p>
              <div class="st-matrow">
                <label v-if="ed.mat.hasColor" class="st-colorlab"><input type="color" v-model="ed.color" aria-label="材质颜色" /><span>{{ ed.color }}</span></label>
                <label v-if="ed.mat.hasPbr" class="st-rangelab">金属 <input type="range" min="0" max="1" step="0.01" v-model.number="ed.metalness" /><i>{{ ed.metalness.toFixed(2) }}</i></label>
                <label v-if="ed.mat.hasPbr" class="st-rangelab">粗糙 <input type="range" min="0" max="1" step="0.01" v-model.number="ed.roughness" /><i>{{ ed.roughness.toFixed(2) }}</i></label>
              </div>
              <div class="st-edrow">
                <button class="st-apply" @click="applyMaterial">应用材质</button>
              </div>
            </div>
          </div>

          <!-- 06 资源 -->
          <div v-if="st.report" class="st-panel">
            <div class="st-eyebrow">06 · 材质与资源</div>
            <template v-if="st.report.missingResources.length">
              <p class="st-note st-miss">缺失的外部资源（材质将不完整）：</p>
              <ul class="st-findings"><li v-for="m in st.report.missingResources" :key="m" class="sev-warn"><b>{{ m }}</b></li></ul>
            </template>
            <div class="st-mats">
              <div v-for="(m, i) in st.report.materials.slice(0, 60)" :key="i" class="st-mat">
                <b>{{ m.name }}</b><span>{{ m.type }}</span><i>{{ m.textureCount ? m.textureCount + ' 贴图' : '无贴图' }}</i>
              </div>
            </div>
            <p v-if="st.report.materials.length > 60" class="st-note">另有 {{ st.report.materials.length - 60 }} 个材质未列出</p>
          </div>

          <!-- 07 参考图（V5.0.3 图片入口·对照层） -->
          <div class="st-panel">
            <div class="st-eyebrow">07 · 参考图 <small>对照参考 · 不推断几何</small></div>
            <div class="st-actions">
              <button @click="$refs.refimg.click()">{{ refImg ? '更换参考图' : '上传参考图' }}</button>
              <button v-if="refImg" @click="clearRef">清除</button>
            </div>
            <input ref="refimg" id="studioRefInput" type="file" accept="image/png,image/jpeg,image/webp" hidden @change="onRefPick" />
            <template v-if="refImg">
              <div class="st-refcfg">
                <label class="st-rangelab">不透明 <input type="range" min="0" max="100" v-model.number="refCfg.opacity" /><i>{{ refCfg.opacity }}%</i></label>
                <label class="st-rangelab">宽度 <input type="range" min="10" max="100" v-model.number="refCfg.scale" /><i>{{ refCfg.scale }}%</i></label>
                <label class="st-rangelab">横移 <input type="range" min="-50" max="50" v-model.number="refCfg.x" /><i>{{ refCfg.x }}%</i></label>
                <label class="st-rangelab">纵移 <input type="range" min="-50" max="50" v-model.number="refCfg.y" /><i>{{ refCfg.y }}%</i></label>
              </div>
              <p class="st-note">参考图叠在视口上对照观察；可在其上正常旋转/缩放模型（叠层不拦截指针）。图片不会从平面推断 3D 结构。</p>
            </template>
          </div>

          <!-- 09 文字生成（V5.0.4 · 关键词模板解析） -->
          <div class="st-panel">
            <div class="st-eyebrow">08 · 文字生成 <small>关键词模板 · 非 AI</small></div>
            <textarea v-model="genText" class="st-gentext" rows="4"
              placeholder='描述结构，例如：&#10;中央圆柱形能量核心，外围三个环形结构，上下两层机械支撑，四组对称连接装置，钛合金与深色金属材质，核心发光'></textarea>
            <div class="st-edrow" style="margin-top:10px">
              <button class="st-apply" :disabled="!genText.trim()" @click="doGenerate">⚒ 解析并生成</button>
              <button @click="genExample">填入示例</button>
            </div>
            <p v-if="genMsg" class="st-note" :class="{ 'st-miss': genErr }">{{ genMsg }}</p>
            <p class="st-note">确定性模板解析：同一描述恒产生同一结构（无模型推断/无概率输出）；未识别的字词会被如实列出并忽略。支持词：中央/核心 · 外围 N 个 · 上下两层 · N 组支撑/连接 · 圆柱/球/环/立方/圆锥 · 金属/深色/发光/塑料。</p>
          </div>

          <!-- 09 我的作品（V5.0.8 本地作品库） -->
          <div class="st-panel">
            <div class="st-eyebrow">09 · 我的作品 <small>浏览器本地 · 不上传</small></div>
            <div class="st-libsave">
              <input v-model="libName" type="text" maxlength="60" placeholder="作品名称"
                :disabled="st.phase !== 'ready'" aria-label="作品名称" />
              <button :disabled="st.phase !== 'ready' || libBusy" @click="doSaveWork">{{ libBusy ? '保存中…' : '保存当前' }}</button>
            </div>
            <p v-if="libMsg" class="st-note" :class="{ 'st-miss': libErr }">{{ libMsg }}</p>
            <div v-if="works.length" class="st-works">
              <div v-for="w in works" :key="w.id" class="st-work">
                <span class="st-workname" :title="w.name">{{ w.name }}</span>
                <small>{{ new Date(w.ts).toLocaleDateString() }} · {{ fmtTri(w.meta && w.meta.triTotal) }} tri</small>
                <span class="st-workbtns">
                  <button :disabled="libBusy" @click="doLoadWork(w.id)" :aria-label="'载入作品：' + w.name">载入</button>
                  <button :disabled="libBusy" @click="doRename(w)" :aria-label="'改名：' + w.name">改名</button>
                  <button class="st-danger" :disabled="libBusy" @click="doDeleteWork(w)" :aria-label="'删除作品：' + w.name">删</button>
                </span>
              </div>
            </div>
            <p v-else class="st-note">还没有保存的作品——编辑满意后点「保存当前」</p>
            <div class="st-libfoot">
              <button @click="doBackup" :disabled="!works.length">⬇ 备份全部（JSON）</button>
              <button @click="$refs.restore.click()">⬆ 恢复备份</button>
              <input ref="restore" type="file" accept=".json" hidden @change="doRestore" />
            </div>
            <p class="st-note">作品存于本浏览器的 IndexedDB——清理站点数据会丢失，请用「备份全部」导出留底</p>
          </div>

          <p class="st-foot">阶段口径：V5.0.0 基础架构 + V5.0.1 导入/体检。编辑工作台、本地作品库与程序化建模在后续版本接入；诊断结论为确定性规则检查，供人工复核。</p>
        </template>
      </aside>
    </main>

    <input id="studioFileInput" ref="file" type="file" multiple accept=".glb,.gltf,.bin,.png,.jpg,.jpeg,.webp,.ktx2" hidden @change="onFilePick" />
  </div>
</template>

<script setup>
import { ref, reactive, computed, markRaw, watch, onMounted, onBeforeUnmount } from 'vue';
import { createStudio, readCapMB } from '../studio/index.js';

const cv = ref(null);
const edPanel = ref(null);
const studio = ref(null);
const dragging = ref(false);
const spin = ref(false);
const exporting = ref(false);
const st = reactive({ phase: 'idle', report: null, diag: null, error: null, selectedPath: null, canUndo: false, canRedo: false, lastEditLabel: '' });
const capMB = readCapMB();

onMounted(() => {
  studio.value = createStudio({
    canvas: cv.value,
    onState: (s) => {
      st.phase = s.phase;
      /* markRaw：报告内含 three 场景对象/几何引用，禁止 Vue 深代理（性能与正确性） */
      st.report = s.report ? markRaw(s.report) : null;
      st.diag = s.diag ? markRaw(s.diag) : null;
      st.error = s.error ?? null;
      st.selectedPath = s.selectedPath ?? null;
      st.canUndo = s.canUndo ?? false;
      st.canRedo = s.canRedo ?? false;
      st.lastEditLabel = s.lastEditLabel ?? '';
    },
  });
  refreshWorks();
});
onBeforeUnmount(() => { studio.value && studio.value.dispose(); });

/* —— 编辑器草稿（V5.0.2）：选中变化时从实时对象读回，应用时提交为单条可撤销命令 —— */
const ed = reactive({ t: null, mat: null, pos: null, rot: null, scl: null, color: '#ffffff', metalness: 0.5, roughness: 0.5 });
const selName = computed(() => {
  if (!st.report || !st.selectedPath) return '';
  const row = st.report.nodes.find((n) => n.path === st.selectedPath);
  return row ? (row.name || '(' + row.type + ')') : st.selectedPath;
});
watch(() => st.selectedPath, () => {
  const p = st.selectedPath;
  ed.t = p ? studio.value.getTransform(p) : null;
  ed.mat = p ? studio.value.getMaterial(p) : null;
  if (ed.t) { ed.pos = [...ed.t.position]; ed.rot = [...ed.t.rotation]; ed.scl = [...ed.t.scale]; }
  if (ed.mat) { ed.color = ed.mat.color || '#ffffff'; ed.metalness = ed.mat.metalness ?? 0; ed.roughness = ed.mat.roughness ?? 0.5; }
  /* 编辑器在右列下方：选中后滚入视野（reduced-motion 用瞬时跳转） */
  if (p && edPanel.value) {
    edPanel.value.scrollIntoView({ block: 'nearest', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  }
});
function applyTransform() {
  if (!ed.t) return;
  studio.value.setTransform(st.selectedPath, { position: ed.pos.slice(), rotation: ed.rot.slice(), scale: ed.scl.slice() }, '编辑变换');
  ed.t = studio.value.getTransform(st.selectedPath);
}
function applyMaterial() {
  if (!ed.mat) return;
  studio.value.setMaterialProp(st.selectedPath, {
    color: ed.color,
    metalness: ed.metalness,
    roughness: ed.roughness,
  }, '编辑材质');
  ed.mat = studio.value.getMaterial(st.selectedPath);
}
async function doExport() {
  exporting.value = true;
  try { await studio.value.downloadGlb(); } finally { exporting.value = false; }
}

/* —— 诊断→修复（V5.0.5 部分） —— */
const repairMsg = ref('');
const repairPlan = computed(() => {
  if (!st.diag || !studio.value) return { fixable: [], manual: [] };
  return studio.value.planRepairs();
});
const repairTotal = computed(() => repairPlan.value.fixable.reduce((n, f) => n + f.count, 0));
function doRepairAll() {
  const plan = studio.value.planRepairs();
  if (!plan.fixable.length) { repairMsg.value = '没有可自动修复的项'; return; }
  let firstBefore = null, lastAfter = null, n = 0;
  for (const f of plan.fixable) {
    const r = studio.value.repair(f.rule);
    if (r) { if (!firstBefore) firstBefore = r.before; lastAfter = r.after; n += r.touched.length; }
  }
  repairMsg.value = lastAfter
    ? `已修复 ${n} 处：错误 ${firstBefore.error}→${lastAfter.error} · 警告 ${firstBefore.warn}→${lastAfter.warn} · 提示 ${firstBefore.info}→${lastAfter.info}（撤销可整体还原）`
    : '没有可应用的修复';
}

/* —— 文字生成（V5.0.4） —— */
const genText = ref('');
const genMsg = ref('');
const genErr = ref(false);
const GEN_EXAMPLE = '中央圆柱形能量核心，外围三个环形结构，上下两层机械支撑，四组对称连接装置，钛合金与深色金属材质，核心发光';
function genExample() { genText.value = GEN_EXAMPLE; genMsg.value = ''; genErr.value = false; }
function doGenerate() {
  genMsg.value = ''; genErr.value = false;
  const out = studio.value.generateFromText(genText.value);
  if (!out.ok) {
    genErr.value = true;
    genMsg.value = (out.reason || '解析失败') + (out.hint ? ' — ' + out.hint : '') + (out.unknown && out.unknown.length ? '；未识别忽略：' + out.unknown.slice(0, 3).join('、') : '');
    return;
  }
  genMsg.value = `已生成 ${out.parts} 个部件并载入画布（${out.summary}）——可用编辑器调整、保存进作品库`;
}

/* —— 参考图（V5.0.3） —— */
const refImg = ref(null);              // { src, name }
const refCfg = reactive({ opacity: 60, scale: 50, x: 0, y: 0 });
function onRefPick(e) {
  const f = e.target.files[0];
  e.target.value = '';
  if (!f) return;
  if (!/^image\//.test(f.type)) { libNote('参考图仅支持 PNG / JPEG / WebP', true); return; }
  const rd = new FileReader();
  rd.onload = () => { refImg.value = { src: rd.result, name: f.name }; };
  rd.readAsDataURL(f);
}
function clearRef() { refImg.value = null; }

/* —— 我的作品（V5.0.8） —— */
const libName = ref('');
const libBusy = ref(false);
const libMsg = ref('');
const libErr = ref(false);
const works = ref([]);

async function refreshWorks() {
  try { works.value = await studio.value.listWorks(); }
  catch { works.value = []; }
}
function libNote(msg, isErr) { libMsg.value = msg; libErr.value = !!isErr; }
async function doSaveWork() {
  libBusy.value = true; libNote('');
  try {
    const rec = await studio.value.saveWork(libName.value || ('作品 ' + new Date().toLocaleString()));
    libName.value = '';
    libNote('已保存「' + rec.name + '」');
    await refreshWorks();
  } catch (e) { libNote(String(e.message || e).slice(0, 90), true); }
  finally { libBusy.value = false; }
}
async function doLoadWork(id) {
  libBusy.value = true; libNote('');
  try { await studio.value.loadWork(id); libNote('作品已载入画布'); }
  catch (e) { libNote(String(e.message || e).slice(0, 90), true); }
  finally { libBusy.value = false; }
}
async function doRename(w) {
  const name = prompt('新名称（最长 60 字）', w.name);
  if (!name || name === w.name) return;
  try { await studio.value.renameWork(w.id, name); await refreshWorks(); }
  catch (e) { libNote(String(e.message || e).slice(0, 90), true); }
}
async function doDeleteWork(w) {
  if (!confirm(`删除作品「${w.name}」？此操作不可撤销。`)) return;
  try { await studio.value.deleteWork(w.id); libNote('已删除「' + w.name + '」'); await refreshWorks(); }
  catch (e) { libNote(String(e.message || e).slice(0, 90), true); }
}
async function doBackup() {
  try {
    const data = await studio.value.backupJson();
    const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'gewu-studio-backup-' + new Date().toISOString().slice(0, 10) + '.json';
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
    libNote(`备份已导出（${data.works.length} 件作品）`);
  } catch (e) { libNote(String(e.message || e).slice(0, 90), true); }
}
async function doRestore(e) {
  const f = e.target.files[0];
  e.target.value = '';
  if (!f) return;
  libBusy.value = true; libNote('');
  try {
    const data = JSON.parse(await f.text());
    const n = await studio.value.restoreBackup(data);
    libNote(`已恢复 ${n} 件作品`);
    await refreshWorks();
  } catch (err) { libNote(String(err.message || err).slice(0, 90), true); }
  finally { libBusy.value = false; }
}

const MAX_TREE_ROWS = 500;
const shownNodes = computed(() => (st.report ? st.report.nodes.slice(0, MAX_TREE_ROWS) : []));
const dims = computed(() => {
  if (!st.report || !st.report.stats.bbox.ok) return '—';
  const s = st.report.stats.bbox.size;
  return s.map((n) => (Math.abs(n) >= 100 ? Math.round(n) : +n.toFixed(2))).join(' × ');
});
const fmt = (n) => (n >= 1e6 ? (n / 1e6).toFixed(1) + 'M' : n >= 1e3 ? (n / 1e3).toFixed(1) + 'k' : String(n));
const fmtTri = (n) => (n ? fmt(n) : '0');

function onFilePick(e) {
  const files = [...e.target.files];
  e.target.value = '';
  if (files.length) studio.value.importFiles(files);
}
function onDrop(e) {
  dragging.value = false;
  const files = [...(e.dataTransfer?.files || [])];
  if (files.length) studio.value.importFiles(files);
}
function sample(url, name) { studio.value.loadSample(url, name); }
function pick(n) { studio.value.highlightByPath(n.path); }
function toggleSpin() {
  spin.value = !spin.value;
  studio.value.setAutoRotate(spin.value);
}
</script>

<style scoped>
.studio{ position:fixed; inset:0; display:flex; flex-direction:column; background:var(--bg-1); color:var(--txt); }
.studio-nav{ display:flex; align-items:baseline; gap:14px; padding:16px clamp(20px,4vw,48px) 12px; border-bottom:1px solid var(--line); }
.studio-back{ font-size:12px; letter-spacing:.12em; color:var(--txt-2); text-decoration:none; }
.studio-back:hover{ color:var(--acc); }
.studio-title{ font-family:var(--name); font-size:19px; font-weight:900; letter-spacing:.12em; color:var(--txt-1); }
.studio-mark small{ font-family:var(--mono); font-size:9px; letter-spacing:.28em; color:var(--txt-3); margin-left:10px; }

.studio-main{ flex:1; min-height:0; display:grid; grid-template-columns:minmax(0,1fr) minmax(320px,400px); gap:16px; padding:16px clamp(16px,3vw,40px) 20px; }
.studio-stage{ position:relative; min-height:0; border:1px solid var(--line); border-radius:var(--corner); overflow:hidden; background:var(--panel-bg); }
.studio-stage.dragging{ border-color:var(--acc); box-shadow:inset 0 0 0 1px var(--acc); }
.studio-cv{ position:absolute; inset:0; width:100%; height:100%; display:block; touch-action:none; }

.st-empty{
  position:absolute; inset:0; display:flex; flex-direction:column; align-items:center; justify-content:center;
  gap:10px; text-align:center; padding:24px; pointer-events:none;
}
.st-empty svg{ width:44px; height:44px; color:var(--txt-3); }
.st-empty b{ font-size:15px; color:var(--txt-1); }
.st-empty span{ max-width:420px; font-size:11.5px; line-height:1.7; color:var(--txt-3); }
.st-empty-actions{ display:flex; gap:10px; margin-top:10px; pointer-events:auto; }
.st-empty-actions button{
  cursor:pointer; padding:9px 18px; border-radius:9px; font-size:12.5px;
  background:var(--wash-1); border:1px solid var(--hairline); color:var(--txt-1);
}
.st-empty-actions button:hover{ color:var(--acc); border-color:var(--acc); }
.st-pulse{ animation:stPulse 1.4s ease-in-out infinite; }
@keyframes stPulse{ 50%{ opacity:.45; } }
@media (prefers-reduced-motion: reduce){ .st-pulse{ animation:none; } }

.st-dropmask{
  position:absolute; inset:0; display:flex; align-items:center; justify-content:center;
  background:color-mix(in srgb, var(--acc-bg, rgba(69,224,255,.08)) 60%, transparent);
  border:2px dashed var(--acc); border-radius:var(--corner); pointer-events:none; z-index:3;
}
.st-dropmask b{ font-family:var(--mono); font-size:13px; letter-spacing:.2em; color:var(--acc); }

.st-tools-sep{ width:1px; height:18px; background:var(--hairline); margin:0 2px; align-self:center; }
.st-history{ font-family:var(--mono); font-size:9.5px; letter-spacing:.08em; color:var(--txt-3); align-self:center; max-width:120px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.st-tools{ position:absolute; left:12px; bottom:12px; display:flex; gap:8px; z-index:2; flex-wrap:wrap; max-width:calc(100% - 24px); }
.st-tools button{
  cursor:pointer; padding:7px 13px; border-radius:8px; font-size:11.5px;
  background:var(--panel-bg); border:1px solid var(--hairline); color:var(--txt-2);
  backdrop-filter:blur(10px);
}
.st-tools button:hover{ color:var(--acc); border-color:var(--acc); }
.st-tools button.on{ color:var(--acc); border-color:var(--acc); background:var(--acc-bg); }

.studio-side{ overflow-y:auto; min-height:0; display:flex; flex-direction:column; gap:12px; padding-right:2px; }
.st-panel{
  background:var(--panel-bg); border:1px solid var(--line); border-radius:var(--corner);
  padding:14px 16px 16px; backdrop-filter:blur(16px) saturate(1.3);
}
.st-eyebrow{
  font-family:var(--mono); font-size:10px; letter-spacing:.26em; color:var(--acc);
  display:flex; align-items:center; gap:10px; margin-bottom:12px;
}
.st-eyebrow::before{ content:""; width:18px; height:1px; background:var(--acc); }
.st-eyebrow small{ margin-left:auto; letter-spacing:.1em; color:var(--txt-3); }

.st-actions{ display:flex; gap:8px; flex-wrap:wrap; }
.st-actions button{
  cursor:pointer; padding:8px 14px; border-radius:8px; font-size:12px;
  background:var(--wash-1); border:1px solid var(--hairline); color:var(--txt-1);
}
.st-actions button:hover:not(:disabled){ color:var(--acc); border-color:var(--acc); }
.st-actions button:disabled{ opacity:.5; cursor:wait; }
.st-go{ color:var(--acc) !important; border-color:var(--acc) !important; }
.st-note{ margin:10px 0 0; font-size:10.5px; line-height:1.7; color:var(--txt-3); }
.st-miss{ color:var(--warn); font-style:normal; }

.st-stats{ display:grid; grid-template-columns:repeat(4,1fr); gap:8px; }
.st-stats > div{ background:var(--wash-1); border:1px solid var(--hairline); border-radius:8px; padding:8px 6px 7px; text-align:center; }
.st-stats b{ display:block; font-family:var(--mono); font-size:13.5px; font-weight:600; color:var(--txt-1); }
.st-stats span{ font-size:9.5px; color:var(--txt-3); letter-spacing:.06em; }

.st-tree{ max-height:260px; overflow-y:auto; border:1px solid var(--hairline); border-radius:8px; background:var(--wash-1); }
.st-node{
  display:block; width:100%; text-align:left; cursor:pointer; padding:4px 10px;
  font-size:11.5px; font-family:var(--mono); color:var(--txt-2);
  border:0; background:transparent; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;
}
.st-node i{ font-style:normal; margin-right:6px; color:var(--txt-3); font-size:9px; }
.st-node.mesh{ color:var(--txt-1); }
.st-node:hover{ background:var(--acc-bg); color:var(--acc); }
.st-node.on{ background:var(--acc-bg); color:var(--acc); box-shadow:inset 2px 0 0 var(--acc); }

.st-chips{ display:flex; gap:8px; flex-wrap:wrap; margin-bottom:10px; }
.st-chip{
  font-family:var(--mono); font-size:10px; letter-spacing:.1em; padding:3px 10px; border-radius:999px;
  color:var(--c); border:1px solid color-mix(in srgb, var(--c) 45%, transparent); background:var(--wash-1);
}
.st-findings{ list-style:none; margin:0; padding:0; display:flex; flex-direction:column; gap:8px; }
.st-findings li{ border-left:2px solid var(--txt-3); padding:2px 0 2px 10px; font-size:11.5px; color:var(--txt-1); }
.st-findings li.sev-error{ border-color:var(--err); }
.st-findings li.sev-warn{ border-color:var(--warn); }
.st-findings li.sev-info{ border-color:var(--txt-3); color:var(--txt-2); }
.st-findings b{ font-weight:600; }
.st-findings span{ color:var(--txt-3); font-family:var(--mono); font-size:10px; }
.st-findings p{ margin:2px 0 0; font-size:10.5px; line-height:1.6; color:var(--txt-3); }

.st-mats{ display:flex; flex-direction:column; gap:5px; max-height:200px; overflow-y:auto; }
.st-mat{ display:flex; align-items:baseline; gap:8px; font-size:11px; }
.st-mat b{ font-family:var(--mono); font-weight:500; color:var(--txt-1); min-width:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.st-mat span{ color:var(--txt-3); font-size:9.5px; flex:1; }
.st-mat i{ font-style:normal; font-size:9.5px; color:var(--txt-3); }

.st-errpanel{ border-color:color-mix(in srgb, var(--err) 40%, transparent); }

/* —— 编辑器（V5.0.2） —— */
.st-ednode{ margin:0 0 10px; font-size:12px; color:var(--txt-2); overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.st-ednode b{ color:var(--acc); font-family:var(--mono); font-size:11.5px; font-weight:500; }
.st-grid3{ display:flex; flex-direction:column; gap:8px; margin-bottom:10px; }
.st-grid3 label{ display:grid; grid-template-columns:44px 1fr; align-items:center; gap:8px; }
.st-grid3 label > span:first-child{ font-size:11px; color:var(--txt-3); }
.st-ax{ display:grid; grid-template-columns:repeat(3,1fr); gap:5px; }
.st-ax input{
  width:100%; min-width:0; padding:6px 7px; font-family:var(--mono); font-size:11px;
  background:var(--wash-1); border:1px solid var(--hairline); border-radius:6px; color:var(--txt-1);
}
.st-ax input:focus{ outline:1px solid var(--acc); outline-offset:1px; }
.st-edrow{ display:flex; gap:8px; }
.st-edrow button{
  cursor:pointer; padding:7px 14px; border-radius:7px; font-size:11.5px;
  background:var(--wash-1); border:1px solid var(--hairline); color:var(--txt-1);
}
.st-edrow button:hover{ color:var(--acc); border-color:var(--acc); }
.st-edrow .st-apply{ color:var(--acc); border-color:var(--acc); background:var(--acc-bg); }
.st-matedit{ margin-top:12px; padding-top:12px; border-top:1px solid var(--hairline); }
.st-matrow{ display:flex; align-items:center; gap:12px; flex-wrap:wrap; margin-bottom:10px; }
.st-colorlab{ display:flex; align-items:center; gap:7px; cursor:pointer; }
.st-colorlab input{ width:34px; height:26px; padding:0; border:1px solid var(--hairline); border-radius:6px; background:transparent; cursor:pointer; }
.st-colorlab span{ font-family:var(--mono); font-size:10.5px; color:var(--txt-2); }
.st-rangelab{ display:flex; align-items:center; gap:7px; font-size:11px; color:var(--txt-3); flex:1; min-width:120px; }
.st-rangelab input{ flex:1; accent-color:var(--acc); }
.st-rangelab i{ font-style:normal; font-family:var(--mono); font-size:10px; color:var(--txt-2); min-width:30px; }

/* —— 我的作品（V5.0.8） —— */
.st-libsave{ display:flex; gap:8px; margin-bottom:10px; }
.st-libsave input{
  flex:1; min-width:0; padding:7px 10px; font-size:12px;
  background:var(--wash-1); border:1px solid var(--hairline); border-radius:7px; color:var(--txt-1);
}
.st-libsave input:focus{ outline:1px solid var(--acc); outline-offset:1px; }
.st-libsave button{
  cursor:pointer; padding:0 14px; border-radius:7px; font-size:11.5px; white-space:nowrap;
  color:var(--acc); border:1px solid var(--acc); background:var(--acc-bg);
}
.st-libsave button:disabled{ opacity:.5; cursor:not-allowed; }
.st-works{ display:flex; flex-direction:column; gap:6px; margin:10px 0; max-height:220px; overflow-y:auto; }
.st-work{
  display:flex; align-items:center; gap:8px; padding:7px 10px;
  background:var(--wash-1); border:1px solid var(--hairline); border-radius:8px; font-size:11.5px;
}
.st-workname{ flex:1; min-width:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; color:var(--txt-1); }
.st-work small{ font-family:var(--mono); font-size:9px; color:var(--txt-3); white-space:nowrap; }
.st-workbtns{ display:flex; gap:4px; }
.st-workbtns button{
  cursor:pointer; padding:3px 9px; border-radius:6px; font-size:10.5px;
  background:transparent; border:1px solid var(--hairline); color:var(--txt-2);
}
.st-workbtns button:hover:not(:disabled){ color:var(--acc); border-color:var(--acc); }
.st-workbtns .st-danger:hover:not(:disabled){ color:var(--err); border-color:var(--err); }
.st-libfoot{ display:flex; gap:8px; margin-top:8px; }
.st-libfoot button{
  cursor:pointer; padding:5px 11px; border-radius:7px; font-size:10.5px;
  background:var(--wash-1); border:1px solid var(--hairline); color:var(--txt-2);
}
.st-libfoot button:hover:not(:disabled){ color:var(--acc); border-color:var(--acc); }
.st-libfoot button:disabled{ opacity:.45; cursor:not-allowed; }

/* —— 参考图（V5.0.3） —— */
.st-refimg{
  position:absolute; max-width:none; border:1px dashed var(--acc);
  box-shadow:0 2px 18px rgba(0,0,0,.35); pointer-events:none; z-index:1;
}
.st-refcfg{ display:flex; flex-direction:column; gap:6px; margin-top:12px; }

/* —— 修复闭环（V5.0.5 部分） —— */
.st-fixbadge{
  font-style:normal; font-family:var(--mono); font-size:8.5px; letter-spacing:.08em;
  color:var(--acc); border:1px solid var(--acc); border-radius:999px; padding:1px 6px; margin-left:6px; vertical-align:1px;
}
.st-repairbar{ margin-top:12px; }
.st-repairbar .st-apply{ cursor:pointer; padding:8px 14px; border-radius:8px; font-size:12px; color:var(--acc); border:1px solid var(--acc); background:var(--acc-bg); width:100%; }
.st-repairmsg{ color:var(--ok) !important; }
.st-manual{ margin:10px 0 0; font-size:10.5px; color:var(--txt-3); }
.st-manual summary{ cursor:pointer; font-size:10.5px; }
.st-manual ul{ margin:6px 0 0; padding-left:16px; line-height:1.8; }
.st-manual b{ font-family:var(--mono); font-weight:500; color:var(--txt-2); }

/* —— 文字生成（V5.0.4） —— */
.st-gentext{
  width:100%; min-width:0; resize:vertical; padding:10px 12px;
  font-size:12px; line-height:1.7;
  background:var(--wash-1); border:1px solid var(--hairline); border-radius:8px; color:var(--txt-1);
}
.st-gentext:focus{ outline:1px solid var(--acc); outline-offset:1px; }.st-errmsg{ margin:0 0 6px; font-size:13px; line-height:1.7; color:var(--txt-1); overflow-wrap:anywhere; }
.st-errcause{ margin:0 0 10px; font-family:var(--mono); font-size:10.5px; color:var(--txt-3); overflow-wrap:anywhere; }
.st-errhints{ margin:0 0 14px; padding-left:18px; font-size:11px; line-height:1.8; color:var(--txt-2); }
.st-retry{
  cursor:pointer; padding:8px 16px; border-radius:8px; font-size:12px;
  background:var(--wash-1); border:1px solid var(--hairline); color:var(--txt-1);
}
.st-retry:hover{ color:var(--acc); border-color:var(--acc); }

.st-foot{ font-size:10px; line-height:1.8; color:var(--txt-3); padding:2px 4px 8px; }

@media (max-width:900px){
  .studio-main{ grid-template-columns:1fr; grid-template-rows:minmax(320px,48svh) minmax(0,1fr); gap:12px; padding:12px; }
  .studio-side{ overflow:visible; }
  .st-stats{ grid-template-columns:repeat(4,1fr); }
}
</style>
