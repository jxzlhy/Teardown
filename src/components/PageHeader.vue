<template>
  <header class="hud-panel page-header">
    <router-link :to="backTo" class="hud-icon" :aria-label="backLabel">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M15 5l-7 7 7 7"/></svg>
    </router-link>
    <div class="gb-title">
      <span class="hud-eyebrow">{{ eyebrow }}</span>
      <h2>{{ title }}</h2>
    </div>
    <!-- 具名 slot：页级操作按钮/搜索框直接成为 header 的 flex 子项，
         保持原三页（graph/timeline/compare）的布局与移动端换行行为不变 -->
    <slot name="right"></slot>
  </header>
</template>

<script setup>
/* 次级页面共享页头（/graph /timeline /compare/:group 三页超集合并）：
   返回按钮 + eyebrow 眉题 + 标题 + 右侧操作 slot。
   基础布局样式在此（非 scoped，沿用原 class 名）；页面级差异仍由各页
   scoped 样式负责：id 定位（#graphBar/#tlBar/#cmpBar）、移动端断点、
   标题字体覆盖（:deep 穿透）。 */
defineProps({
  backTo: { type: String, default: '/' },
  eyebrow: { type: String, required: true },
  title: { type: String, default: '' },
  backLabel: { type: String, default: '返回大厅' },
});
</script>

<style>
/* 合并自 GraphView #graphBar / TimelineView #tlBar / CompareView #cmpBar 的公共基样 */
.page-header{
  position:absolute; left:16px; right:16px; top:12px; z-index:5;
  display:flex; align-items:center; gap:14px; padding:10px 14px;
}
.gb-title{ flex:1; min-width:0; }
.gb-title h2{
  margin:3px 0 0; font-size:13px; font-weight:600; color:var(--txt-1); font-family:var(--sans);
  white-space:nowrap; overflow:hidden; text-overflow:ellipsis;
}
</style>
