<template>
  <div class="forge">
    <header class="forge-nav">
      <div class="forge-mark">
        <router-link to="/" class="forge-back">← 格物馆</router-link>
        <span class="forge-title">机械锻造所</span>
        <small>MECHANICAL FORGE · 程序化生成</small>
      </div>
    </header>

    <main class="forge-main">
      <section class="forge-panel">
        <div class="forge-eyebrow">01 · 选择生成器</div>
        <div class="forge-gens">
          <button v-for="g in gens" :key="g.id" class="forge-gen" :class="{ on: gen === g.id }" @click="gen = g.id">
            <b>{{ g.label }}</b>
            <small>GEN v{{ g.version }}</small>
          </button>
        </div>

        <div class="forge-eyebrow">02 · 预设方案</div>
        <div class="fp-seg" style="margin-bottom:16px">
          <button v-for="pr in presets" :key="pr.id" @click="applyPreset(pr)">{{ pr.label }}</button>
        </div>

        <div class="forge-eyebrow">03 · 参数</div>
        <div class="forge-params">
          <div v-for="(s, key) in schema" :key="key" class="forge-param">
            <label>
              <span class="fp-label">{{ s.label }}</span>
              <span class="fp-val">{{ params[key] }}<i v-if="s.unit">{{ s.unit }}</i></span>
            </label>
            <div v-if="s.type === 'enum'" class="fp-seg">
              <button v-for="o in s.options" :key="o" :class="{ on: params[key] === o }"
                @click="params[key] = o">{{ o }}{{ s.unit || '' }}</button>
            </div>
            <input v-else type="range" :min="s.min" :max="s.max" :step="s.step" v-model.number="params[key]" />
            <p v-if="s.note" class="fp-note">{{ s.note }}</p>
          </div>
          <div class="forge-param">
            <label>
              <span class="fp-label">种子</span>
              <span class="fp-val mono">{{ seedText || '—' }}</span>
            </label>
            <div class="fp-seed">
              <input v-model="seedText" type="text" maxlength="24" placeholder="任意文本，可复现" />
              <button @click="seedText = randomSeed()">随机</button>
            </div>
            <p class="fp-note">同生成器版本 + 同参数 + 同种子 ⇒ 同一模型（确定性重建，几何不落盘）</p>
          </div>
        </div>

        <div class="forge-actions">
          <button class="forge-go" :disabled="busy" @click="generate">
            {{ busy ? '生成中…' : '⚒ 生成并进入拆解' }}
          </button>
          <span v-if="err" class="forge-err">{{ err }}</span>
        </div>
        <p class="forge-disclaim">生成物为<b>结构示意概念模型</b>：可拆解、可联动演示、可复现；非真实可制造工程模型，不标注性能参数。</p>
      </section>

      <section v-if="recent.length" class="forge-panel">
        <div class="forge-eyebrow">04 · 近期生成</div>
        <div class="forge-list">
          <div v-for="r in recent" :key="r.id" class="forge-row">
            <router-link class="forge-item" :to="'/device/' + r.id">
              <b>{{ r.name }}</b>
              <small>{{ r.generator }} · 种子 {{ r.seed }} · {{ new Date(r.ts).toLocaleString() }}</small>
            </router-link>
            <button class="forge-glb" :aria-label="'复制配置：' + r.name" @click="copyConfig(r.id)">⧉ 配置</button>
            <button class="forge-glb" :aria-label="'导出 GLB：' + r.name" @click="exportGlb(r.id)">⬇ GLB</button>
          </div>
        </div>
        <p v-if="glbMsg" class="fp-note" style="margin-top:10px">{{ glbMsg }}</p>
      </section>

      <section class="forge-panel">
        <div class="forge-eyebrow">05 · 导入配置</div>
        <textarea v-model="importText" class="forge-import" rows="4"
          placeholder='粘贴配置 JSON（{"fmt":"gewu-forge/1",...}）——生成器+参数+种子，确定性复现'></textarea>
        <div class="forge-actions" style="margin-top:10px">
          <button class="forge-go" style="padding:9px 18px" :disabled="busy" @click="importConfig">⇥ 导入并生成</button>
          <span v-if="importMsg" class="fp-note">{{ importMsg }}</span>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref, reactive, watch, onMounted, nextTick } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { createForgeDevice, forgeGeneratorList, listForgeDevices, encodeForgeConfig, importForgeConfig, getForgeDevice } from '../forge/registry.js';
import { exportForgeGLB } from '../forge/export.js';
import { SCHEMA as V8_SCHEMA, defaultParams as v8Default, PRESETS as V8_PRESETS } from '../forge/v8.js';
import { SCHEMA as TF_SCHEMA, defaultParams as tfDefault, PRESETS as TF_PRESETS } from '../forge/turbofan.js';
import { SCHEMA as RD_SCHEMA, defaultParams as rdDefault, PRESETS as RD_PRESETS } from '../forge/ringdrive.js';
import { SCHEMA as LS_SCHEMA, defaultParams as lsDefault, PRESETS as LS_PRESETS } from '../forge/lockstitch.js';
import { SCHEMA as WK_SCHEMA, defaultParams as wkDefault, PRESETS as WK_PRESETS } from '../forge/wankel.js';
import { SCHEMA as GV_SCHEMA, defaultParams as gvDefault, PRESETS as GV_PRESETS } from '../forge/governor.js';

const router = useRouter();
const route = useRoute();
const gens = forgeGeneratorList();
const GEN_META = {
  v8: { schema: V8_SCHEMA, defaults: v8Default, presets: V8_PRESETS },
  turbofan: { schema: TF_SCHEMA, defaults: tfDefault, presets: TF_PRESETS },
  ringdrive: { schema: RD_SCHEMA, defaults: rdDefault, presets: RD_PRESETS },
  lockstitch: { schema: LS_SCHEMA, defaults: lsDefault, presets: LS_PRESETS },
  wankel: { schema: WK_SCHEMA, defaults: wkDefault, presets: WK_PRESETS },
  governor: { schema: GV_SCHEMA, defaults: gvDefault, presets: GV_PRESETS },
};
const gen = ref(gens[0] && gens[0].id);
const schema = ref(GEN_META[gen.value].schema);
const presets = ref(GEN_META[gen.value].presets);
const params = reactive(GEN_META[gen.value].defaults());
const seedText = ref('');
const busy = ref(false);
const err = ref('');
const recent = ref([]);

watch(gen, (id) => {
  const meta = GEN_META[id];
  schema.value = meta.schema;
  presets.value = meta.presets;
  Object.keys(params).forEach(k => delete params[k]);
  Object.assign(params, meta.defaults());
});

function applyPreset(pr) {
  Object.keys(params).forEach(k => delete params[k]);
  Object.assign(params, pr.params);
}

onMounted(async () => {
  recent.value = listForgeDevices();
  /* 深链：/forge?gen=lockstitch&seed=abc&preset=teach&needleStroke=36&auto=1
     gen 切换会触发 watch 重置 params（pre-flush 在本同步体之后才跑），
     故先 await nextTick 等 watch 落定，再应用 preset/参数覆盖——否则覆盖被默认值吞掉 */
  const q = route.query || {};
  if (q.gen && GEN_META[q.gen]) gen.value = q.gen;
  await nextTick();
  if (q.preset) { const pr = presets.value.find(p => p.id === q.preset); if (pr) applyPreset(pr); }
  for (const [k, v] of Object.entries(q)) if (schema.value[k] !== undefined && v !== '') params[k] = schema.value[k].type === 'range' ? Number(v) : v;
  if (q.seed) seedText.value = String(q.seed);
  if (!seedText.value) seedText.value = randomSeed();
  if (q.auto === '1') generate();
});

function randomSeed() { return Math.floor(Math.random() * 0xffffffff).toString(36); }

const glbMsg = ref('');
async function exportGlb(id) {
  glbMsg.value = '导出中…';
  try {
    const r = await exportForgeGLB(id);
    glbMsg.value = `已导出 ${r.file}（${r.parts} 部件 · ${(r.bytes / 1024).toFixed(0)}KB）`;
  } catch (e) {
    glbMsg.value = '导出失败：' + String(e.message || e).slice(0, 70);
  }
}

/* V4.0 Slice 4：配置文本化复制/导入 */
const importText = ref('');
const importMsg = ref('');
async function copyConfig(id) {
  const dev = getForgeDevice(id);
  if (!dev) { glbMsg.value = '配置不存在：' + id; return; }
  const text = encodeForgeConfig(dev.forge.generator, dev.forge.params, dev.forge.seed);
  try { await navigator.clipboard.writeText(text); glbMsg.value = '配置已复制到剪贴板（' + id + '）'; }
  catch { glbMsg.value = '剪贴板不可用，配置已显示在导入框'; importText.value = text; }
}
function importConfig() {
  importMsg.value = '';
  try {
    const dev = importForgeConfig(importText.value);
    recent.value = listForgeDevices();
    router.push('/device/' + dev.id);
  } catch (e) {
    importMsg.value = String(e.message || e).slice(0, 80);
  }
}

function generate() {
  err.value = '';
  busy.value = true;
  try {
    const dev = createForgeDevice(gen.value, { ...params }, seedText.value);
    recent.value = listForgeDevices();
    router.push('/device/' + dev.id);
  } catch (e) {
    err.value = String(e.message || e).slice(0, 80);
  } finally {
    busy.value = false;
  }
}
</script>

<style scoped>
.forge{
  position:fixed; inset:0; overflow-y:auto; background:var(--bg-1); color:var(--txt);
  padding:0 clamp(20px,6vw,96px) 60px;
}
.forge-nav{ display:flex; align-items:baseline; gap:14px; padding:22px 0 16px; border-bottom:1px solid rgba(196,164,96,.2); }
.forge-back{ font-size:12px; letter-spacing:.12em; color:var(--txt-2); text-decoration:none; }
.forge-back:hover{ color:var(--acc); }
.forge-title{ font-family:var(--name); font-size:20px; font-weight:900; letter-spacing:.12em; color:var(--txt-1); }
.forge-mark small{ font-family:var(--mono); font-size:9px; letter-spacing:.28em; color:var(--txt-3); margin-left:10px; }
.forge-main{ display:grid; grid-template-columns:minmax(0,520px) minmax(0,1fr); gap:24px; padding-top:26px; align-items:start; }
@media (max-width:860px){ .forge-main{ grid-template-columns:1fr; } }
.forge-panel{
  background:var(--panel-bg); border:1px solid var(--line); border-radius:var(--corner);
  padding:18px 20px 20px; backdrop-filter:blur(16px) saturate(1.3);
}
.forge-eyebrow{
  font-family:var(--mono); font-size:10px; letter-spacing:.28em; color:var(--acc);
  display:flex; align-items:center; gap:10px; margin:14px 0 12px;
}
.forge-eyebrow::before{ content:""; width:18px; height:1px; background:var(--acc); }
.forge-panel .forge-eyebrow:first-child{ margin-top:0; }
.forge-gens{ display:flex; gap:10px; flex-wrap:wrap; }
.forge-gen{
  flex:1 1 180px; text-align:left; cursor:pointer; padding:12px 14px;
  background:var(--wash-1); border:1px solid var(--hairline); border-radius:8px; color:var(--txt);
}
.forge-gen b{ display:block; font-size:13px; color:var(--txt-1); }
.forge-gen small{ font-family:var(--mono); font-size:9px; letter-spacing:.2em; color:var(--txt-3); }
.forge-gen.on{ border-color:var(--acc); background:var(--acc-bg); }
.forge-gen:hover{ border-color:var(--acc); }
.forge-param{ margin-bottom:14px; }
.forge-param label{ display:flex; justify-content:space-between; align-items:baseline; margin-bottom:6px; }
.fp-label{ font-size:12.5px; color:var(--txt-2); }
.fp-val{ font-size:13px; color:var(--txt-1); font-weight:600; }
.fp-val i{ font-style:normal; font-size:10px; color:var(--txt-3); margin-left:2px; }
.fp-val.mono{ font-family:var(--mono); font-size:11px; }
.forge-param input[type=range]{ width:100%; accent-color:var(--acc); }
.fp-seg{ display:flex; gap:6px; flex-wrap:wrap; }
.fp-seg button{
  cursor:pointer; padding:5px 12px; border-radius:999px; font-size:11.5px;
  background:var(--wash-1); border:1px solid var(--hairline); color:var(--txt-2);
}
.fp-seg button.on{ color:var(--acc); border-color:var(--acc); background:var(--acc-bg); }
.fp-note{ margin:5px 0 0; font-size:10.5px; line-height:1.6; color:var(--txt-3); }
.fp-seed{ display:flex; gap:8px; }
.fp-seed input{
  flex:1; min-width:0; padding:7px 10px; font-family:var(--mono); font-size:12px;
  background:var(--wash-1); border:1px solid var(--hairline); border-radius:7px; color:var(--txt-1);
}
.fp-seed button{
  cursor:pointer; padding:0 14px; border-radius:7px; font-size:11.5px;
  background:var(--wash-1); border:1px solid var(--hairline); color:var(--txt-2);
}
.fp-seed button:hover{ color:var(--acc); border-color:var(--acc); }
.forge-actions{ display:flex; align-items:center; gap:12px; margin-top:18px; }
.forge-go{
  cursor:pointer; padding:11px 22px; border-radius:9px; font-size:13.5px; font-weight:600;
  color:var(--acc); border:1px solid var(--acc); background:var(--acc-bg);
  transition:transform var(--dur-1) var(--ease-out), box-shadow var(--dur-1);
}
.forge-go:hover{ transform:translateY(-1px); box-shadow:0 4px 14px var(--acc-16); }
.forge-go:disabled{ opacity:.55; cursor:wait; }
.forge-err{ font-size:11.5px; color:var(--err); }
.forge-disclaim{ margin:14px 0 0; font-size:10.5px; line-height:1.7; color:var(--txt-3); }
.forge-disclaim b{ color:var(--txt-2); }
.forge-list{ display:flex; flex-direction:column; gap:8px; }
.forge-row{ display:flex; align-items:stretch; gap:8px; }
.forge-row .forge-item{ flex:1; min-width:0; }
.forge-glb{
  flex:none; cursor:pointer; padding:0 12px; border-radius:8px; font-size:11px;
  font-family:var(--mono); letter-spacing:.06em;
  background:var(--wash-1); border:1px solid var(--hairline); color:var(--txt-2);
}
.forge-glb:hover{ color:var(--acc); border-color:var(--acc); }
.forge-import{
  width:100%; min-width:0; resize:vertical; padding:10px 12px;
  font-family:var(--mono); font-size:11px; line-height:1.6;
  background:var(--wash-1); border:1px solid var(--hairline); border-radius:8px; color:var(--txt-1);
}
.forge-import:focus{ outline:1px solid var(--acc); outline-offset:1px; }
.forge-item{
  padding:10px 14px; border:1px solid var(--hairline); border-radius:8px;
  background:var(--wash-1); text-decoration:none; color:var(--txt);
}
.forge-item b{ display:block; font-size:12.5px; color:var(--txt-1); }
.forge-item small{ font-family:var(--mono); font-size:9.5px; letter-spacing:.08em; color:var(--txt-3); }
.forge-item:hover{ border-color:var(--acc); }
</style>
