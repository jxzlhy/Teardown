<template>
  <div id="compareView">
    <header id="cmpBar" class="hud-panel">
      <router-link :to="focusId ? '/device/' + focusId : '/'" class="hud-icon" aria-label="返回">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M15 5l-7 7 7 7"/></svg>
      </router-link>
      <div class="gb-title">
        <span class="hud-eyebrow">GENERATION COMPARE · 代际对比</span>
        <h2>{{ group ? group.zh : '加载中…' }}</h2>
      </div>
      <span class="cmp-note">规格行按同名键自动聚类 · 缺项显示 —</span>
    </header>

    <div id="cmpScroll" v-if="group">
      <table class="cmp-table">
        <thead>
          <tr>
            <th class="cmp-rowhead"></th>
            <th v-for="d in cols" :key="d.id" :class="{ focus: d.id === focusId }">
              <router-link :to="'/device/' + d.id" class="cmp-dev">
                <img :src="assetUrl(`/thumbs/${d.id}.webp`)" alt="" loading="lazy" @error="e => e.target.style.display = 'none'">
                <b>{{ d.name }}</b>
                <i v-if="d.era != null" class="cmp-era">{{ d.era }}</i>
              </router-link>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in rows" :key="row.k">
            <th class="cmp-rowhead">{{ row.k }}</th>
            <td v-for="d in cols" :key="d.id" :class="{ diff: row.diff && d.id === focusId }">{{ row.cells[d.id] || '—' }}</td>
          </tr>
          <tr v-if="!rows.length"><td class="cmp-empty" :colspan="cols.length + 1">该组设备暂无规格数据</td></tr>
        </tbody>
      </table>
    </div>
    <div v-else id="cmpEmpty" class="hud-panel">未找到对比分组</div>
  </div>
</template>

<script setup>
/* 代际对比（Phase 4 试点）：同系列设备按 specs 同名键自动聚类成表。
   设备配置经 device-loaders 按需加载（懒 chunk），不进主包。 */
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import comparisons from '../knowledge/comparisons.js';
import { loaders } from 'virtual:device-loaders';
import { assetUrl } from '../lib/url.js';

const route = useRoute();
const group = ref(null);
const cols = ref([]);
const focusId = computed(() => (route.query.focus || '').toString());

async function load(){
  const g = comparisons.find(x => x.id === route.params.group);
  if(!g){ group.value = null; cols.value = []; return; }
  group.value = g;
  const mods = await Promise.all(g.ids.map(id => (loaders[id] || (() => null))()));
  cols.value = mods.filter(Boolean).map(m => m.default);
}
watch(() => route.params.group, load, { immediate: true });

const rows = computed(() => {
  /* 行 = 组内规格键的并集（按首次出现排序）；cell = 各设备同名键的值 */
  const keys = [];
  const seen = new Set();
  const cellMap = cols.value.map(d => new Map((d.specs || []).map(([k, v]) => [k, v])));
  for(const m of cellMap) for(const k of m.keys()) if(!seen.has(k)){ seen.add(k); keys.push(k); }
  return keys.map(k => {
    const cells = {};
    let diff = false, first = cellMap[0] ? cellMap[0].get(k) : undefined;
    cols.value.forEach((d, i) => {
      cells[d.id] = cellMap[i].get(k) || '';
      if(cells[d.id] !== (first || '')) diff = true;
    });
    return { k, cells, diff };
  });
});

</script>

<style scoped>
#compareView{ position:fixed; inset:0; background:#04070c; overflow:hidden; }
#cmpBar{ position:absolute; left:16px; right:16px; top:12px; z-index:5; display:flex; align-items:center; gap:14px; padding:10px 14px; }
.gb-title{ flex:1; min-width:0; }
.gb-title h2{ margin:3px 0 0; font-size:13px; font-weight:600; color:var(--txt-1); font-family:var(--sans); }
.cmp-note{ font-family:var(--mono); font-size:9px; letter-spacing:.12em; color:var(--txt-dim); flex:none; }
#cmpScroll{ position:absolute; inset:74px 16px 16px; overflow:auto; }
.cmp-table{ border-collapse:separate; border-spacing:0 4px; width:100%; min-width:640px; }
.cmp-table th, .cmp-table td{
  padding:9px 12px; font-size:11.5px; line-height:1.7; text-align:left;
  background:rgba(7,13,20,.55); vertical-align:top;
}
.cmp-table td{ color:#aebfd2; font-family:var(--sans); }
.cmp-table td:first-of-type, .cmp-table th.cmp-rowhead{
  position:sticky; left:0; z-index:2; color:var(--txt-2);
  font-family:var(--mono); font-size:10px; letter-spacing:.1em; font-weight:normal;
  border-right:1px solid rgba(69,224,255,.12); min-width:88px;
}
.cmp-table thead th{ background:none; }
.cmp-dev{ display:flex; flex-direction:column; gap:6px; min-width:150px; color:var(--txt-1); text-decoration:none; }
.cmp-dev img{ width:100%; aspect-ratio:19/12; object-fit:cover; border-radius:7px; background:#060b12; }
.cmp-dev b{ font-size:12px; font-family:var(--sans); }
.cmp-era{ font-family:var(--mono); font-size:10px; letter-spacing:.14em; color:var(--acc-dim); font-style:normal; }
.cmp-dev:focus-visible, .cmp-table td.diff{ outline:none; }
td.diff{ box-shadow:inset 3px 0 0 color-mix(in srgb, var(--acc) 55%, transparent); }
.cmp-empty{ color:var(--txt-3); text-align:center; padding:30px !important; }
@media (max-width:700px){
  #cmpBar{ left:10px; right:10px; }
  .cmp-note{ display:none; }
  #cmpScroll{ inset:86px 10px 10px; }
}
</style>
