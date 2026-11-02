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
            <p class="st-note">{{ st.report.stats.file }} · {{ (st.report.stats.fileSize / 1048576).toFixed(2) }}MB
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
                <b>{{ f.title }}</b><span v-if="f.node"> · {{ f.node }}</span>
                <p>{{ f.detail }}</p>
              </li>
            </ul>
          </div>

          <!-- 05 资源 -->
          <div v-if="st.report" class="st-panel">
            <div class="st-eyebrow">05 · 材质与资源</div>
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

          <p class="st-foot">阶段口径：V5.0.0 基础架构 + V5.0.1 导入/体检。编辑工作台、本地作品库与程序化建模在后续版本接入；诊断结论为确定性规则检查，供人工复核。</p>
        </template>
      </aside>
    </main>

    <input ref="file" type="file" multiple accept=".glb,.gltf,.bin,.png,.jpg,.jpeg,.webp,.ktx2" hidden @change="onFilePick" />
  </div>
</template>

<script setup>
import { ref, reactive, computed, markRaw, onMounted, onBeforeUnmount } from 'vue';
import { createStudio, readCapMB } from '../studio/index.js';

const cv = ref(null);
const studio = ref(null);
const dragging = ref(false);
const spin = ref(false);
const st = reactive({ phase: 'idle', report: null, diag: null, error: null, selectedPath: null });
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
    },
  });
});
onBeforeUnmount(() => { studio.value && studio.value.dispose(); });

const MAX_TREE_ROWS = 500;
const shownNodes = computed(() => (st.report ? st.report.nodes.slice(0, MAX_TREE_ROWS) : []));
const dims = computed(() => {
  if (!st.report || !st.report.stats.bbox.ok) return '—';
  const s = st.report.stats.bbox.size;
  return s.map((n) => (Math.abs(n) >= 100 ? Math.round(n) : +n.toFixed(2))).join(' × ');
});
const fmt = (n) => (n >= 1e6 ? (n / 1e6).toFixed(1) + 'M' : n >= 1e3 ? (n / 1e3).toFixed(1) + 'k' : String(n));

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

.st-tools{ position:absolute; left:12px; bottom:12px; display:flex; gap:8px; z-index:2; }
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
.st-errmsg{ margin:0 0 6px; font-size:13px; line-height:1.7; color:var(--txt-1); overflow-wrap:anywhere; }
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
