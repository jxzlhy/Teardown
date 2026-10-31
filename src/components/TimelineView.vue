<template>
  <div id="timelineView">
    <header id="tlBar" class="hud-panel">
      <router-link to="/" class="hud-icon" aria-label="返回大厅">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M15 5l-7 7 7 7"/></svg>
      </router-link>
      <div class="gb-title">
        <span class="hud-eyebrow">TIMELINE · 技术编年</span>
        <h2>{{ data ? `${data.coverage.devices} 台馆藏 + ${data.coverage.techs} 项技术 · ${span}` : '生成时间轴中…' }}</h2>
      </div>
      <span class="tl-note">覆盖 {{ data ? Math.round(data.coverage.devices / data.coverage.total * 100) : 0 }}% 馆藏 · 其余设备无断代信息，诚实留白</span>
    </header>
    <div id="tlScroll" v-if="data">
      <section v-for="band in data.bands" :key="band.name" class="tl-band">
        <div class="tl-bandhead">
          <h3>{{ band.name }}</h3>
          <span class="tl-range">{{ band.from }} — {{ band.to }}</span>
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
#tlBar{ position:absolute; left:16px; right:16px; top:12px; z-index:5; display:flex; align-items:center; gap:14px; padding:10px 14px; }
.gb-title{ flex:1; min-width:0; }
.gb-title h2{ margin:3px 0 0; font-size:13px; font-weight:600; color:var(--txt-1); font-family:var(--sans); }
.tl-note{ font-family:var(--mono); font-size:9px; letter-spacing:.1em; color:var(--txt-dim); flex:none; }
#tlScroll{ position:absolute; inset:74px 16px 16px; overflow-y:auto; padding:0 4px 30px; }
.tl-band{ margin-bottom:26px; }
.tl-bandhead{ display:flex; align-items:baseline; gap:12px; margin-bottom:10px; border-bottom:1px solid rgba(69,224,255,.14); padding-bottom:7px; }
.tl-bandhead h3{ margin:0; font-size:15px; color:var(--acc); font-family:var(--sans); letter-spacing:.06em; }
.tl-range{ font-family:var(--mono); font-size:10px; letter-spacing:.14em; color:var(--txt-dim); }
.tl-items{ display:grid; grid-template-columns:repeat(auto-fill, minmax(230px, 1fr)); gap:6px 10px; }
.tl-item{
  display:grid; grid-template-columns:56px 1fr; grid-template-rows:auto auto; column-gap:10px;
  padding:7px 10px; border-radius:8px; background:rgba(7,13,20,.5);
  border:1px solid rgba(120,150,180,.1);
}
.tl-item .tl-year{ grid-row:1 / span 2; align-self:center; font-family:var(--mono); font-size:12px; letter-spacing:.06em; color:var(--acc-dim); }
.tl-item .tl-label{ font-size:11.5px; color:var(--txt-1); font-family:var(--sans); line-height:1.5; }
.tl-item .tl-sub{ font-family:var(--mono); font-size:9px; letter-spacing:.1em; color:var(--txt-dim); }
.tl-item.tech{ border-color:rgba(199,146,234,.22); }
.tl-item.tech .tl-year{ color:#c792ea; }
.tl-item.tech .tl-sub{ color:rgba(199,146,234,.75); }
.tl-item.link{ cursor:pointer; text-decoration:none; transition:border-color var(--dur-1), transform var(--dur-1); }
.tl-item.link:hover{ border-color:color-mix(in srgb, var(--acc) 45%, transparent); transform:translateY(-1px); }
.tl-foot{ margin-top:18px; text-align:center; font-family:var(--mono); font-size:9px; letter-spacing:.16em; color:var(--txt-dim); }
@media (max-width:700px){
  #tlBar{ left:10px; right:10px; }
  .tl-note{ display:none; }
  #tlScroll{ inset:86px 10px 10px; }
  .tl-items{ grid-template-columns:1fr 1fr; }
}
</style>
