<template>
  <div class="hub">
    <div class="hub-top">
      <div class="hub-eyebrow"><span class="dot"></span>MULTI-BRAND · TEARDOWN GALLERY</div>
      <div class="hub-top-meta">VOL.04 — 2026 · {{ totalDevices }} DEVICES</div>
    </div>

    <div class="hub-hero">
      <div class="hub-hero-copy">
        <h1 class="hub-title">
          <span class="line"><i>拆</i><i>解</i><i>馆</i></span>
          <span class="line alt">DEVICE<br>TEARDOWN</span>
        </h1>
        <p class="hub-sub">把每一台机器，拆到最后一颗螺丝。<br>选择任意设备，进入可交互的 3D 结构拆解。</p>
      </div>

      <!-- Hero 焦点展台：招牌设备轮播（离线实机快照 + 缓慢推近 + 点击进拆解页） -->
      <div v-if="heroDevice" class="hub-stage" :style="{ '--stage-acc': heroDevice.accent || 'var(--acc)' }"
        @click="goHero(heroDevice)"
        @pointerenter="stopHero" @pointerleave="startHero">
        <img :key="heroDevice.id" class="st-img z" :class="{ swapping: stageSwap }"
          :src="assetUrl(`/thumbs/${heroDevice.id}.webp`)" :alt="heroDevice.name">
        <div class="hud-scan"></div>
        <div class="st-shade"></div>
        <div class="st-dots"><i v-for="(d, i) in heroList" :key="d.id" :class="{ cur: i === heroIdx }"></i></div>
        <div class="st-meta">
          <div><span class="st-brand">{{ heroDevice.brand }} · FEATURED</span>
            <div class="st-name">{{ heroDevice.name }}</div></div>
          <span class="st-go">开始拆解 →</span>
        </div>
      </div>
      <div class="hub-stage-tag" v-if="heroDevice">FOCUS · 焦点展台 · 每 6 秒换台 · hover 暂停</div>
    </div>

    <div class="hub-stats">
      <div class="stat"><b>{{ totalDevices }}</b><span>台设备</span></div>
      <div class="stat"><b>{{ totalParts }}</b><span>个部件</span></div>
      <div class="stat"><b>{{ officialCount }}</b><span>套官方模型</span></div>
      <div class="stat"><b>{{ communityCount }}</b><span>套社区模型</span></div>
      <div class="stat"><b>{{ brands.length }}</b><span>个品牌</span></div>
      <div class="stat"><b>WEBGL</b><span>实时渲染</span></div>
    </div>

    <!-- 最近浏览 -->
    <div class="hub-recent" v-if="recent.length">
      <span class="hr-label"><i class="dot"></i>继续拆解 · RECENT</span>
      <router-link v-for="d in recent" :key="d.id" class="hr-chip" :to="`/device/${d.id}`">
        <i class="hr-dot" :style="{ background: d.accent || 'var(--acc)' }"></i>{{ d.name }}
      </router-link>
    </div>

    <!-- 筛选与搜索（滚动吸顶） -->
    <div class="hub-filter">
      <div class="filter-row">
        <div class="filter-group" v-for="fg in filterGroups" :key="fg.key">
          <span class="fg-label">{{ fg.label }}</span>
          <div class="fg-chips">
            <button class="chip" :class="{ on: fg.value === '全部' }" @click="fg.set('全部')">全部</button>
            <button v-for="opt in fg.options" :key="opt" class="chip"
              :class="{ on: fg.value === opt }" @click="fg.set(opt)">{{ opt }}</button>
          </div>
        </div>
        <div class="filter-search">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">
            <circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/>
          </svg>
          <input type="text" v-model="query" placeholder="搜索设备…">
        </div>
        <div class="view-toggle">
          <button class="hud-icon" :class="{ on: view === 'grid' }" @click="view = 'grid'" aria-label="卡片视图">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">
              <rect x="3.5" y="3.5" width="7" height="7" rx="1.4"/><rect x="13.5" y="3.5" width="7" height="7" rx="1.4"/>
              <rect x="3.5" y="13.5" width="7" height="7" rx="1.4"/><rect x="13.5" y="13.5" width="7" height="7" rx="1.4"/>
            </svg>
          </button>
          <button class="hud-icon" :class="{ on: view === 'list' }" @click="view = 'list'" aria-label="紧凑列表">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">
              <path d="M4 6h16M4 12h16M4 18h16"/>
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- 设备网格：TransitionGroup FLIP —— 筛选/搜索时卡片从旧位置平滑滑到新位置 -->
    <TransitionGroup tag="div" class="hub-grid" :class="{ 'as-list': view === 'list' }" name="grid">
      <router-link v-for="(d, i) in filtered" :key="d.id"
        class="card" :class="{ 'no-thumb': thumbFailed(d.id) }" :to="`/device/${d.id}`"
        :style="{ '--acc': d.accent, '--d': (0.05 + (i % 12) * 0.05) + 's' }"
        @pointerenter="onCardEnter(d)">
        <span class="card-thumbwrap">
          <img v-if="!thumbFailed(d.id)" class="card-thumb" :src="assetUrl(`/thumbs/${d.id}.webp`)"
            :alt="d.name" loading="lazy" @error="onThumbError(d.id)">
          <span v-else class="card-fallback"><b>{{ String(d.idx + 1).padStart(2,'0') }}</b><i>{{ d.en }}</i></span>
          <span class="card-idx">{{ String(d.idx + 1).padStart(2,'0') }}</span>
        </span>
        <span class="card-body">
          <span class="card-brand">{{ d.brand }}</span>
          <span class="card-name">{{ d.name }}</span>
          <span class="card-tag">{{ d.tagline }}</span>
          <span class="card-meta">
            <i>{{ d.parts }} 部件</i>
            <i>{{ d.category }}</i>
            <i class="glb-badge">{{ modelClassLabel(d) }}</i>
          </span>
        </span>
        <span class="card-arrow">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M4 12h15M13 5l7 7-7 7"/>
          </svg>
        </span>
      </router-link>
      <div v-if="!filtered.length" class="hub-empty" key="__empty">没有匹配的设备 — 换个筛选条件试试</div>
    </TransitionGroup>

    <div class="hub-foot">
      <span>ENGINE · THREE.JS + VUE 3</span>
      <span>官方模型几何版权归各品牌所有 · 仅用于交互式技术演示</span>
      <span class="hub-credit">Switch OLED by rtql8d (CC-BY 4.0) via SceneView</span>
      <span>© 2026 TEARDOWN LAB</span>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';
/* 大厅只取构建期元数据（不拉 three.js / 设备实现），完整配置在设备页按需加载 */
import devices from 'virtual:device-manifest';
import { prefetchGlb } from '../engine/glbCache.js';
import { assetUrl } from '../lib/url.js';
import { isCommunityModel, modelClassLabel } from '../lib/model-class.js';

const router = useRouter();
const devicesIndexed = devices.map((d, idx) => ({ ...d, idx }));
const totalDevices = devices.length;
const totalParts = devices.reduce((s, d) => s + d.parts, 0);
const officialCount = devices.filter(d => d.glb && !isCommunityModel(d)).length;
const communityCount = devices.filter(d => d.glb && isCommunityModel(d)).length;
const brands = [...new Set(devices.map(d => d.brand))];
const categories = [...new Set(devices.map(d => d.category))];
const byId = Object.fromEntries(devices.map(d => [d.id, d]));

const brandSel = ref('全部');
const catSel = ref('全部');
const query = ref('');
const view = ref('grid');   // 'grid' 卡片 | 'list' 紧凑列表

/* ---------- Hero 焦点展台：招牌设备轮播 ---------- */
const FEATURED = ['action4', 'mavic3pro', 'vision-pro', 'switch-2'];
const heroList = FEATURED.map(id => byId[id]).filter(Boolean);
const heroIdx = ref(0);
const stageSwap = ref(false);
const heroDevice = computed(() => heroList[heroIdx.value] || devicesIndexed[0]);
let heroTimer = null;
function nextHero(){
  if(heroList.length < 2) return;
  stageSwap.value = true;
  setTimeout(() => {
    heroIdx.value = (heroIdx.value + 1) % heroList.length;
    stageSwap.value = false;
  }, 280);
}
function startHero(){
  stopHero();
  if(heroList.length > 1) heroTimer = setInterval(nextHero, 6000);
}
function stopHero(){ clearInterval(heroTimer); heroTimer = null; }
function goHero(d){
  if(d && d.id) router.push(`/device/${d.id}`);
}

/* 最近浏览（设备页写入 localStorage）+ 进入大厅时预热最近一台的 GLB */
const recent = ref([]);
try{
  recent.value = JSON.parse(localStorage.getItem('teardown-recent') || '[]').map(id => byId[id]).filter(Boolean).slice(0, 8);
}catch{}

onMounted(() => {
  startHero();
  const last = recent.value.find(d => d.glb);
  if(last) prefetchGlb(last.glb);
  if(heroDevice.value && heroDevice.value.glb) prefetchGlb(heroDevice.value.glb);
});
onBeforeUnmount(stopHero);

/* 卡片 hover 预取 GLB（低优先级 + 写入 Cache Storage），点击进入基本秒开 */
function onCardEnter(d){ if(d.glb) prefetchGlb(d.glb); }

/* 缩略图 404 时回退纯排版卡片 */
const thumbErr = ref(new Set());
function onThumbError(id){ const s = new Set(thumbErr.value); s.add(id); thumbErr.value = s; }
function thumbFailed(id){ return thumbErr.value.has(id); }

const filterGroups = [
  { key:'brand', label:'品牌', options: brands, get value(){ return brandSel.value; }, set(v){ brandSel.value = v; } },
  { key:'cat', label:'类型', options: categories, get value(){ return catSel.value; }, set(v){ catSel.value = v; } },
];

const filtered = computed(() => devicesIndexed.filter(d => {
  if(brandSel.value !== '全部' && (d.brand || 'OTHER') !== brandSel.value) return false;
  if(catSel.value !== '全部' && d.category !== catSel.value) return false;
  if(query.value){
    const q = query.value.toLowerCase();
    return (d.name + ' ' + d.en + ' ' + d.tagline + ' ' + d.category).toLowerCase().includes(q);
  }
  return true;
}));
</script>
