<template>
  <div id="timelineView">
    <PageHeader id="tlBar" eyebrow="TIMELINE · 技术编年"
      :title="data ? `${data.coverage.devices} / ${data.coverage.total} 台馆藏 + ${data.coverage.techs} 项技术 · ${span}` : '生成时间轴中…'">
      <template #right>
        <span class="tl-note">覆盖 {{ data ? Math.round(data.coverage.devices / data.coverage.total * 100) : 0 }}% 馆藏 · 其余设备无断代信息，诚实留白</span>
      </template>
    </PageHeader>
    <div id="tlScroll" v-if="data">
      <section v-for="band in data.bands" :key="band.name" class="tl-band">
        <div class="tl-bandhead">
          <h3>{{ band.name }}</h3>
          <span class="tl-range">{{ band.from }} — {{ band.to }}</span>
          <span class="tl-count">{{ band.events.length }} 条目</span>
        </div>
        <div class="tl-items">
          <component
            v-for="(e, i) in band.events" :key="band.name + i"
            :is="e.kind === 'device' ? 'router-link' : 'div'"
            :to="e.kind === 'device' ? '/device/' + e.id : undefined"
            class="tl-item" :class="[e.kind, { link: e.kind === 'device' }]">
            <span class="tl-year">{{ e.display || e.year }}</span>
            <span class="tl-label">{{ e.label }}</span>
            <span class="tl-sub">{{ e.sub }}</span>
          </component>
        </div>
      </section>
      <footer class="tl-foot">同一年的事件按设备/技术并列 · 点击设备名进入拆解</footer>
    </div>
  </div>
</template>

<script setup>
/* 技术编年（Phase 3 衍生）：device.era + technology.invented 构建期汇总（gen:timeline），
   视图只读产物——四段时代分带，设备可点进拆解，技术条目展示实用化起点。 */
import { ref, computed, onMounted } from 'vue';
import PageHeader from './PageHeader.vue';

const data = ref(null);
const span = computed(() => {
  if(!data.value) return '';
  const b = data.value.bands;
  return `${b[0].from} — ${b[b.length - 1].to}`;
});
onMounted(async () => {
  data.value = await (await fetch('timeline.json')).json();
});
</script>

<style scoped>
#timelineView{ position:fixed; inset:0; background:#04070c; overflow:hidden; }
/* 页头基样（.page-header / .gb-title）已合并进 PageHeader.vue */
.tl-note{ font-family:var(--mono); font-size:9px; letter-spacing:.1em; color:var(--txt-dim); flex:none; }
#tlScroll{ position:absolute; inset:74px 16px 16px; overflow-y:auto; padding:6px 4px 40px; }
/* 展厅分带：衬线展区题 + mono 年代跨度（带宽约束保证可读行长） */
.tl-band{ margin-bottom:34px; max-width:980px; }
.tl-bandhead{ display:flex; align-items:baseline; gap:14px; margin-bottom:14px; padding-bottom:9px; border-bottom:1px solid rgba(69,224,255,.14); }
.tl-bandhead h3{ margin:0; font-family:var(--name); font-size:24px; font-weight:900; letter-spacing:.12em; color:var(--acc); }
.tl-range{ font-family:var(--mono); font-size:10px; letter-spacing:.18em; color:var(--txt-dim); }
.tl-count{ font-family:var(--mono); font-size:9px; letter-spacing:.2em; color:var(--txt-3); margin-left:auto; }
/* 时序脊柱：连续轴线 + 菱形节点，年份右对齐在轴左侧 */
.tl-items{ position:relative; display:flex; flex-direction:column; }
.tl-items::before{
  content:""; position:absolute; left:88px; top:10px; bottom:10px; width:1px;
  background:linear-gradient(180deg, rgba(69,224,255,.30), rgba(69,224,255,.05));
}
.tl-item{
  position:relative; display:grid; grid-template-columns:64px minmax(0,1fr); grid-template-rows:auto auto;
  column-gap:40px; align-items:baseline;
  padding:9px 14px 9px 0; border:none; border-bottom:1px solid rgba(120,150,180,.07);
  border-radius:0; background:none;
}
.tl-item::before{
  content:""; position:absolute; left:88px; top:50%; width:8px; height:8px; z-index:1;
  transform:translate(-50%,-50%) rotate(45deg);
  background:#0a121c; border:1.5px solid rgba(120,150,180,.45); transition:border-color var(--dur-1), background var(--dur-1);
}
.tl-item .tl-year{ grid-row:1 / span 2; align-self:center; text-align:right; font-family:var(--mono); font-size:12.5px; letter-spacing:.06em; color:var(--acc); }
.tl-item .tl-label{ font-size:13px; color:var(--txt-1); font-family:var(--sans); line-height:1.5; }
.tl-item .tl-sub{ grid-column:2; font-family:var(--mono); font-size:9px; letter-spacing:.14em; color:var(--txt); margin-top:2px; }
.tl-item.tech::before{ border-color:color-mix(in srgb, var(--tech) 60%, transparent); }
.tl-item.tech .tl-year{ color:var(--tech); }
.tl-item.tech .tl-sub{ color:var(--tech); }
.tl-item.link{ cursor:pointer; text-decoration:none; transition:background var(--dur-1); }
.tl-item.link:hover{ background:var(--acc-08); }
.tl-item.link:hover::before{ border-color:var(--acc); background:var(--acc-16); }
.tl-item.link:hover .tl-label{ color:var(--acc); }
.tl-foot{ margin-top:18px; text-align:center; font-family:var(--mono); font-size:9px; letter-spacing:.16em; color:var(--txt-dim); }
@media (max-width:700px){
  #tlBar{ left:10px; right:10px; }
  .tl-note{ display:none; }
  #tlScroll{ inset:86px 10px 10px; }
  .tl-bandhead h3{ font-size:19px; }
  /* 窄屏：轴线左移，年份列收窄 */
  .tl-item{ grid-template-columns:52px minmax(0,1fr); column-gap:26px; }
  .tl-items::before, .tl-item::before{ left:70px; }
}
</style>
