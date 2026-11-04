<template>
  <div class="hub">
    <!-- 馆导视条 -->
    <header class="hub-nav">
      <div class="hub-mark">
        <span class="hub-mark-zh">{{ BRAND.name }}</span>
        <small>{{ BRAND.en }}</small>
      </div>
      <nav class="hub-links" aria-label="馆内导览">
        <router-link v-if="!collectionMode" to="/collection">收藏馆</router-link>
        <router-link v-else to="/">常设展</router-link>
        <router-link to="/graph">知识星图</router-link>
        <router-link to="/timeline">技术编年</router-link>
        <router-link to="/forge">锻造所</router-link>
        <router-link to="/studio">创作室</router-link>
        <button class="explore-link" @click="drawerOpen = true">我的探索<template v-if="favs.length || Object.keys(explored).length"><span class="el-badge" v-if="favs.length"><Icon name="star" />{{ favs.length }}</span><span class="el-badge" v-if="Object.keys(explored).length">迹{{ Object.keys(explored).length }}</span></template></button>
        <button class="hall-link" @click="toggleLobbyHall" :aria-label="lobbyHall === 'day' ? '切换夜厅' : '切换日厅'">
          <svg v-if="lobbyHall === 'day'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="12" r="4.2"/><path d="M12 2.5v2.6M12 18.9v2.6M2.5 12h2.6M18.9 12h2.6M5 5l1.9 1.9M17.1 17.1L19 19M19 5l-1.9 1.9M6.9 17.1L5 19"/></svg>
          <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M20.5 14.5A8.5 8.5 0 019.5 3.5a8.5 8.5 0 1011 11z"/></svg>
          {{ lobbyHall === 'day' ? '夜厅' : '日厅' }}
        </button>
      </nav>
    </header>

    <a class="skip-link" href="#main">跳到馆藏列表</a>
    <main id="main">
    <!-- 门厅：收藏馆模式换厅（V2） -->
    <section class="hub-hero">
      <div class="hub-hero-copy">
        <p class="hub-vol">{{ collectionMode ? `私人展厅 · MY COLLECTION · ${favs.length} 件在展` : `常设展 · VOL.04 — 2026 · ${totalDevices} DEVICES` }}</p>
        <h1 class="hub-title"><span v-for="c in (collectionMode ? ['收','藏','馆'] : BRAND.nameChars)" :key="c">{{ c }}</span></h1>
        <p class="hub-sub">{{ collectionMode ? '你的印记，你的展线——收藏即策展。' : BRAND.tagline }}<br>{{ collectionMode ? '收藏与评分只存在本机。' : BRAND.tagline2 }}</p>
        <div class="hub-stats" v-if="!collectionMode">
          <div class="stat"><b>{{ totalDevices }}</b><span>台设备</span></div>
          <div class="stat"><b>{{ totalParts }}</b><span>个部件</span></div>
          <div class="stat"><b>{{ officialCount }}</b><span>套官方模型</span></div>
          <div class="stat"><b>{{ communityCount }}</b><span>套社区模型</span></div>
          <div class="stat"><b>{{ brands.length }}</b><span>个品牌</span></div>
        </div>
        <div class="hub-stats" v-else>
          <div class="stat"><b>{{ favs.length }}</b><span>台收藏</span></div>
          <div class="stat"><b>{{ ratedCount }}</b><span>台已评</span></div>
        </div>
      </div>

      <!-- 焦点展台：招牌设备轮播（离线实机快照 + 缓慢推近 + 点击进拆解页） -->
      <div class="hub-stage-col">
        <div v-if="heroDevice" class="hub-stage" :style="{ '--stage-acc': heroDevice.accent || 'var(--acc)' }"
          @click="goHero(heroDevice)"
          @pointerenter="stopHero" @pointerleave="startHero">
          <img :key="heroDevice.id" class="st-img z" :class="{ swapping: stageSwap }"
            :src="thumbSrc(heroDevice.id)" :alt="heroDevice.name">
          <div class="hud-scan"></div>
          <div class="st-shade"></div>
          <span class="st-no">{{ String(heroDevice.idx + 1).padStart(3, '0') }}</span>
          <div class="st-dots"><i v-for="(d, i) in heroList" :key="d.id" :class="{ cur: i === heroIdx }"></i></div>
          <div class="st-meta">
            <div>
              <span class="st-brand">{{ heroDevice.brand }} · {{ heroDevice.era || 'FOCUS' }}</span>
              <span class="st-name">{{ heroDevice.name }}</span>
            </div>
            <span class="st-go">开始拆解 →</span>
          </div>
        </div>
        <div class="hub-stage-tag" v-if="heroDevice">FOCUS · 焦点展台 · 每 6 秒换台 · hover 暂停</div>
      </div>
    </section>

    <!-- 分区头：常设展 / 收藏馆（V2 第六章：分类导航 + 排序） -->
    <div class="hub-sect">
      <h2>{{ collectionMode ? '我的收藏' : '常设展' }}</h2>
      <span class="sect-en" v-if="!collectionMode">COLLECTION · <b>{{ totalDevices }}</b> 件展品 · {{ totalParts }} 部件</span>
      <span class="sect-en" v-else>MY SHELF · <b>{{ favs.length }}</b> 件 · {{ ratedCount }} 台已评</span>
    </div>
    <!-- 收藏馆分类导航 + 排序（V2 第六章 6.3/6.4） -->
    <div class="coll-nav" v-if="collectionMode && favs.length" style="margin-top:16px">
      <button class="chip" :class="{ on: collCat === '全部' }" @click="collCat = '全部'">全部（{{ favs.length }}）</button>
      <button v-for="cat in collCats" :key="cat" class="chip" :class="{ on: collCat === cat }" @click="collCat = cat">
        {{ cat }}（{{ catCount(cat) }}）
      </button>
      <button class="chip" :class="{ on: collCat === '未分类' }" @click="collCat = '未分类'">未分类（{{ catCount('未分类') }}）</button>
      <button class="chip" :class="{ on: collManage }" @click="collManage = !collManage" title="重命名 / 删除分类"><Icon name="edit" /> 管理</button>
      <div class="coll-sort">
        排序
        <select v-model="collSort" aria-label="收藏排序">
          <option value="default">默认序</option>
          <option value="recent">最近收藏</option>
          <option value="rating">我的评分</option>
        </select>
      </div>
    </div>
    <!-- 分类管理：重命名 / 删除（V2 第六章 6.3） -->
    <div class="coll-nav" v-if="collectionMode && collManage" style="margin-top:10px">
      <button v-for="cat in collCats" :key="'m' + cat" class="chip" :class="{ on: manageSel === cat }" @click="manageSel = cat">{{ cat }}</button>
      <template v-if="manageSel">
        <input class="chip" style="width:130px; cursor:text" v-model="manageName" maxlength="12" aria-label="分类新名称">
        <button class="chip" @click="doRenameCat">重命名</button>
        <button class="chip clear-chip" @click="doDelCat"><Icon name="close" /> 删除「{{ manageSel }}」</button>
      </template>
    </div>

    <!-- 最近浏览 -->
    <div class="hub-recent" v-if="recent.length">
      <span class="hr-label"><i class="dot"></i>继续拆解 · RECENT</span>
      <router-link v-for="d in recent" :key="d.id" class="hr-chip" :to="`/device/${d.id}`">
        <i class="hr-dot" :style="{ background: d.accent || 'var(--acc)' }"></i>{{ d.name }}
      </router-link>
    </div>

    <!-- 筛选与搜索：主行整页吸顶（.hub 直接子元素），筛选组随页滚动；
         移动端展开时取消吸顶防止占满整屏（审计 P0-2 / P1-2） -->
    <div class="filter-main" :class="{ collapsed: isNarrow && !filterExpanded, expanded: isNarrow && filterExpanded }">
      <div class="filter-search">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">
          <circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/>
        </svg>
        <input type="text" v-model="query" placeholder="搜索设备…" aria-label="搜索设备">
        <button v-if="query" class="search-clear" @click="query = ''" aria-label="清空搜索"><Icon name="close" /></button>
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
      <button class="chip fav-chip" :class="{ on: favOnly }" @click="favOnly = !favOnly" :aria-pressed="favOnly ? 'true' : 'false'"><Icon name="star" /> 收藏（{{ favs.length }}）</button>
      <button v-if="isNarrow" class="chip filter-toggle" @click="filterExpanded = !filterExpanded" :aria-expanded="filterExpanded ? 'true' : 'false'">
        筛选<span v-if="activeFilters" class="ft-count">{{ activeFilters }}</span><Icon name="caret" :style="filterExpanded ? '' : 'transform:rotate(180deg)'" />
      </button>
    </div>
    <div class="filter-groups" v-show="!isNarrow || filterExpanded">
      <div class="filter-group" v-for="fg in filterGroups" :key="fg.key">
        <span class="fg-label">{{ fg.label }}</span>
        <div class="fg-chips">
          <button class="chip" :class="{ on: fg.value === '全部' }" @click="fg.set('全部')">全部</button>
          <button v-for="opt in fg.options" :key="opt" class="chip"
            :class="{ on: fg.value === opt }" @click="fg.set(opt)">{{ opt }}</button>
        </div>
      </div>
      <div class="filter-group" v-if="brandOverflow">
        <span class="fg-label">更多品牌</span>
        <div class="fg-chips">
          <button class="chip" :class="{ on: brandExpanded }" @click="brandExpanded = !brandExpanded">
            {{ brandExpanded ? '收起' : `展开其余 ${brands.length - BRAND_PREVIEW} 个` }}
          </button>
        </div>
      </div>
      <button v-if="activeFilters" class="chip clear-chip" @click="clearFilters"><Icon name="close" /> 清除全部筛选</button>
    </div>

    <!-- 设备网格：TransitionGroup FLIP —— 筛选/搜索时卡片从旧位置平滑滑到新位置 -->
    <TransitionGroup tag="div" class="hub-grid" :class="{ 'as-list': view === 'list' }" name="grid">
      <router-link v-for="(d, i) in filtered" :key="d.id"
        class="card" :class="{ 'no-thumb': thumbFailed(d.id) }" :to="`/device/${d.id}`"
        :style="{ '--acc': d.accent, '--d': (0.05 + (i % 12) * 0.05) + 's' }"
        @pointerenter="onCardEnter(d)">
        <span class="card-thumbwrap">
          <img v-if="!thumbFailed(d.id)" class="card-thumb" :src="thumbSrc(d.id)"
            :alt="d.name" loading="lazy" @error="onThumbError(d.id + (lobbyHall === 'day' ? ':day' : ''))">
          <span v-else class="card-fallback"><b>{{ String(d.idx + 1).padStart(2,'0') }}</b><i>{{ d.en }}</i></span>
          <span class="card-idx">NO.{{ String(d.idx + 1).padStart(3,'0') }}</span>
        </span>
        <span class="card-body">
          <span class="card-brand">{{ d.brand }}<template v-if="eraLabel(d)"> · {{ eraLabel(d) }}</template></span>
          <span class="card-name">{{ d.name }}</span>
          <span class="card-tag">{{ d.tagline }}</span>
          <span class="card-meta">
            <i v-if="myRatings[d.id] && myRatings[d.id].overall > 0" class="rate-badge" title="我的评分"><Icon name="star" /> {{ myRatings[d.id].overall }}</i>
            <i>{{ d.parts }} 部件</i>
            <i>{{ d.category }}</i>
            <i class="glb-badge">{{ modelClassLabel(d) }}</i>
            <i v-if="isNc(d.modelCredit)" class="glb-badge nc-badge" title="CC-BY-NC · 非商业许可">NC</i>
          </span>
          <span class="card-note" v-if="collectionMode && getFavMetaOf(d.id)?.note">{{ getFavMetaOf(d.id).note }}</span>
          <span class="card-favat" v-if="collectionMode && getFavMetaOf(d.id)?.at">收藏于 {{ new Date(getFavMetaOf(d.id).at).toLocaleDateString() }}<template v-if="getFavMetaOf(d.id)?.cats?.length"> · {{ getFavMetaOf(d.id).cats.join(' / ') }}</template></span>
        </span>
        <span class="fav-star" :class="{ on: favSet.has(d.id) }" role="button" tabindex="0"
          :aria-label="(favSet.has(d.id) ? '取消收藏 ' : '收藏 ') + d.name"
          :title="favSet.has(d.id) ? '取消收藏' : '收藏'"
          @click.stop.prevent="toggleFav(d.id)"
          @keydown.enter.stop.prevent="toggleFav(d.id)" @keydown.space.stop.prevent="toggleFav(d.id)">
          <svg viewBox="0 0 24 24" :fill="favSet.has(d.id) ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="1.6"><path d="M12 3l2.7 5.6 6.1.8-4.5 4.2 1.1 6-5.4-2.9-5.4 2.9 1.1-6L3.2 9.4l6.1-.8L12 3z"/></svg>
        </span>
        <span class="card-arrow">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M4 12h15M13 5l7 7-7 7"/>
          </svg>
        </span>
      </router-link>
      <div v-if="!filtered.length && collectionMode && !favs.length" class="hub-empty" key="__coll_empty">
        收藏馆还是空的 —— 去常设展点击卡片右上角的 ★ 收藏设备
        <div style="margin-top:14px"><router-link to="/" class="hud-glow-btn primary" style="text-decoration:none">前往常设展 →</router-link></div>
      </div>
      <div v-else-if="!filtered.length" class="hub-empty" key="__empty">没有匹配的设备 — 换个筛选条件试试</div>
    </TransitionGroup>
    </main>

    <div class="hub-foot">
      <span>ENGINE · THREE.JS + VUE 3</span>
      <span>官方模型几何版权归各品牌所有 · 仅用于交互式技术演示</span>
      <span class="hub-credit">Switch OLED by rtql8d (CC-BY 4.0) via SceneView</span>
      <span>© 2026 {{ BRAND.name }} {{ BRAND.en }}</span>
    </div>

    <!-- 我的探索抽屉（Phase 7）：收藏 / 已探索 / 徽章；纯本地数据；Esc / 遮罩可退（审计：可退出性） -->
    <Transition name="fade">
      <div v-if="drawerOpen" class="drawer-scrim" @click="drawerOpen = false" aria-hidden="true"></div>
    </Transition>
    <Transition name="drawer">
      <aside v-if="drawerOpen" id="exploreDrawer" class="hud-panel" role="dialog" aria-label="我的探索">
        <div class="hub-eyebrow">MY EXPLORE · 我的探索</div>
        <button class="drawer-close" @click="drawerOpen = false" aria-label="关闭"><Icon name="close" /></button>
        <div class="dw-sec">
          <h4>徽章 <small>{{ badges.filter(b => b.earned).length }}/{{ badges.length }}</small></h4>
          <div class="dw-badges">
            <div v-for="b in badges" :key="b.id" class="dw-badge" :class="{ earned: b.earned }" :title="b.desc">
              <i><Icon :name="b.earned ? 'diamond' : 'diamond-o'" /></i><span>{{ b.zh }}</span>
            </div>
          </div>
        </div>
        <div class="dw-sec">
          <h4>收藏 <small>{{ favDevices.length }}</small></h4>
          <p v-if="!favDevices.length" class="dw-empty">点击卡片右上角的星标收藏设备</p>
          <router-link v-for="d in favDevices" :key="d.id" :to="'/device/' + d.id" class="dw-item" @click="drawerOpen = false">
            {{ d.name }}<i>{{ d.brand }}</i>
          </router-link>
        </div>
        <div class="dw-sec">
          <h4>已探索 <small>{{ exploredDevices.length }}</small></h4>
          <p v-if="!exploredDevices.length" class="dw-empty">进入任意设备页即记入足迹</p>
          <router-link v-for="d in exploredDevices" :key="d.id" :to="'/device/' + d.id" class="dw-item" @click="drawerOpen = false">
            {{ d.name }}<i>{{ d.brand }}</i>
          </router-link>
        </div>
      </aside>
    </Transition>
  </div>
</template>

<script setup>
import { computed, ref, watch, onMounted, onBeforeUnmount } from 'vue';
import { useRoute, useRouter } from 'vue-router';
/* 大厅只取构建期元数据（不拉 three.js / 设备实现），完整配置在设备页按需加载 */
import devices from 'virtual:device-manifest';
import { BRAND } from '../lib/brand.js';
import Icon from '../ui/Icon.vue';
import { prefetchGlb } from '../engine/glbCache.js';
import { assetUrl } from '../lib/url.js';
import { isCommunityModel, modelClassLabel } from '../lib/model-class.js';
import { getRatings, subscribeRatings } from '../lib/ratings.js';
import { getFavMetaOf, getCats, renameCat, delCat } from '../lib/explore.js';
const getFavMetaOfRef = getFavMetaOf;  // 模板内直接调用（同 explore 其它导出）
import {
  getFavorites, toggleFavorite, getExplored, getBadges,
  BADGE_DEFS, subscribeExplore,
} from '../lib/explore.js';

/* 设备发布年/年代（era）：number → 年份；'1950s' → 年代串 */
function eraLabel(d){
  if(d.era == null) return '';
  return typeof d.era === 'number' ? String(d.era) : d.era;
}
/* CC-BY-NC（非商业）许可需在列表层醒目提示（合规透明） */
function isNc(credit){
  return !!credit && /CC-BY-NC/.test(credit);
}

const router = useRouter();
const route = useRoute();
/* 个人收藏馆（V2）：/collection 路由 = 同壳不同厅 */
const collectionMode = computed(() => route.path === '/collection');
/* 个人评分（V2）：卡片角标 + 收藏馆已评数 */
const rateVer = ref(0);
subscribeRatings(() => { rateVer.value++; });
const myRatings = computed(() => { rateVer.value; return getRatings(); });
const ratedCount = computed(() => { rateVer.value; return Object.values(getRatings()).filter(r => (r.overall || 0) > 0).length; });
/* ---------- 收藏馆分类导航 / 排序 / 管理（V2 第六章 6.3/6.4） ---------- */
const collCat = ref('全部');
const collSort = ref('default');
const collManage = ref(false);
const manageSel = ref('');
const manageName = ref('');
const collCats = computed(() => getCats());
function catCount(cat){
  if(cat === '全部') return favs.value.length;
  return favs.value.filter(id => {
    const cats = getFavMetaOf(id)?.cats || [];
    return cat === '未分类' ? cats.length === 0 : cats.includes(cat);
  }).length;
}
function doRenameCat(){
  if(manageSel.value && manageName.value.trim()){
    if(renameCat(manageSel.value, manageName.value.trim())){
      if(collCat.value === manageSel.value) collCat.value = manageName.value.trim();
      manageSel.value = manageName.value.trim();
      manageName.value = '';
      favVer.value++;
    }
  }
}
function doDelCat(){
  if(manageSel.value){
    delCat(manageSel.value);
    if(collCat.value === manageSel.value) collCat.value = '全部';
    manageSel.value = '';
    favVer.value++;
  }
}
/* 双厅（V2 第二章）：大厅切换入口与工作空间共享 dtm.hall 记忆 + data-hall 驱动 CSS */
const lobbyHall = ref((() => { try{ return localStorage.getItem('dtm.hall') === 'day' ? 'day' : 'night'; }catch{ return 'night'; } })());
function applyLobbyHall(){
  document.documentElement.dataset.hall = lobbyHall.value;
  try{ localStorage.setItem('dtm.hall', lobbyHall.value); }catch{}
}
function toggleLobbyHall(){
  lobbyHall.value = lobbyHall.value === 'day' ? 'night' : 'day';
  applyLobbyHall();
}
onMounted(applyLobbyHall);   // 初次进入恢复记忆主题
const devicesIndexed = devices.map((d, idx) => ({ ...d, idx }));
const totalDevices = devices.length;

/* ---------- 探索系统（Phase 7）：收藏 / 已探索 / 徽章（纯本地） ---------- */
const exploreVer = ref(0);
subscribeExplore(() => { exploreVer.value++; });
const favs = computed(() => { exploreVer.value; return getFavorites(); });
const favSet = computed(() => new Set(favs.value));
const explored = computed(() => { exploreVer.value; return getExplored(); });
const badges = computed(() => { exploreVer.value; return getBadges(); });
const drawerOpen = ref(false);
/* 抽屉可退出性：Esc 关闭（focus 不在抽屉内也生效） */
function onDrawerKey(e){ if(e.key === 'Escape') drawerOpen.value = false; }
watch(drawerOpen, (open) => {
  if(open) window.addEventListener('keydown', onDrawerKey);
  else window.removeEventListener('keydown', onDrawerKey);
});
onBeforeUnmount(() => window.removeEventListener('keydown', onDrawerKey));
const favDevices = computed(() => favs.value
  .map(id => devices.find(d => d.id === id)).filter(Boolean));
const exploredDevices = computed(() => Object.keys(explored.value)
  .map(id => devices.find(d => d.id === id)).filter(Boolean)
  .sort((a, b) => (explored.value[b.id].at || 0) - (explored.value[a.id].at || 0)));
function toggleFav(id){ toggleFavorite(id); }
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

/* ---------- 筛选 IA（审计 P1-2 / P0-2）：搜索为第一入口 → 类型主轴 → 品牌折叠 ----------
   ≤860px：筛选默认收合（「筛选」按钮 + 激活数徽标），展开时取消吸顶防止占满整屏 */
const BRAND_PREVIEW = 12;
const narrowMq = window.matchMedia('(max-width: 860px)');
const isNarrow = ref(narrowMq.matches);
function onNarrowMq(e){ isNarrow.value = e.matches; if(!e.matches) filterExpanded.value = false; }
narrowMq.addEventListener('change', onNarrowMq);
onBeforeUnmount(() => narrowMq.removeEventListener('change', onNarrowMq));
const filterExpanded = ref(false);
const brandExpanded = ref(false);
const activeFilters = computed(() =>
  (brandSel.value !== '全部' ? 1 : 0) + (catSel.value !== '全部' ? 1 : 0) +
  (favOnly.value ? 1 : 0) + (query.value ? 1 : 0));
function clearFilters(){
  brandSel.value = '全部'; catSel.value = '全部'; favOnly.value = false; query.value = '';
}

/* ---------- Hero 焦点展台：招牌设备轮播（收藏馆模式 = 收藏位轮播） ---------- */
const FEATURED = ['action4', 'mavic3pro', 'vision-pro', 'switch-2'];
const heroList = computed(() => {
  if(collectionMode.value){
    return devicesIndexed.filter(d => favSet.value.has(d.id)).slice(0, 4);
  }
  return FEATURED.map(id => devicesIndexed.find(d => d.id === id)).filter(Boolean);
});
const heroIdx = ref(0);
const stageSwap = ref(false);
const heroDevice = computed(() => heroList.value[heroIdx.value] || (collectionMode.value ? null : devicesIndexed[0]));
let heroTimer = null;
function nextHero(){
  if(heroList.value.length < 2) return;
  stageSwap.value = true;
  setTimeout(() => {
    heroIdx.value = (heroIdx.value + 1) % heroList.value.length;
    stageSwap.value = false;
  }, 280);
}
function startHero(){
  stopHero();
  if(heroList.value.length > 1) heroTimer = setInterval(nextHero, 6000);
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
function onThumbError(key){ const s = new Set(thumbErr.value); s.add(key); thumbErr.value = s; }
function thumbFailed(id){
  if (lobbyHall.value === 'day') {
    if (thumbErr.value.has(id + ':day')) return thumbErr.value.has(id);   /* 日变体缺失 → 回退夜图（不空卡） */
    return false;
  }
  return thumbErr.value.has(id);
}
/* V4.0 Slice 1：双厅缩略图——日厅用 -day 变体（render-thumbs 双布光产出），缺失回退夜图 */
function thumbSrc(id){
  return assetUrl(`/thumbs/${id}${lobbyHall.value === 'day' && !thumbFailed(id) ? '-day' : ''}.webp`);
}

const filterGroups = computed(() => [
  { key:'cat', label:'类型', options: categories, get value(){ return catSel.value; }, set(v){ catSel.value = v; } },
  { key:'brand', label:'品牌', options: brandExpanded.value ? brands : brands.slice(0, BRAND_PREVIEW),
    get value(){ return brandSel.value; }, set(v){ brandSel.value = v; } },
]);
const brandOverflow = brands.length > BRAND_PREVIEW;

/* ★ 收藏快捷筛选（探索系统闭环） */
const favOnly = ref(false);

const filtered = computed(() => {
  const base = collectionMode.value
    ? devicesIndexed.filter(d => favSet.value.has(d.id))
    : devicesIndexed;
  let arr = base.filter(d => {
  if(favOnly.value && !favSet.value.has(d.id)) return false;
  if(brandSel.value !== '全部' && (d.brand || 'OTHER') !== brandSel.value) return false;
  if(catSel.value !== '全部' && d.category !== catSel.value) return false;
  if(query.value){
    const q = query.value.toLowerCase();
    return (d.name + ' ' + d.en + ' ' + d.tagline + ' ' + d.category).toLowerCase().includes(q);
  }
  return true;
  });
  /* 收藏馆：分类导航过滤 + 排序（V2 第六章 6.4） */
  if(collectionMode.value){
    if(collCat.value !== '全部'){
      arr = arr.filter(d => {
        const cats = getFavMetaOf(d.id)?.cats || [];
        return collCat.value === '未分类' ? cats.length === 0 : cats.includes(collCat.value);
      });
    }
    if(collSort.value === 'recent'){
      arr = [...arr].sort((a, b) => (getFavMetaOf(b.id)?.at || 0) - (getFavMetaOf(a.id)?.at || 0));
    }else if(collSort.value === 'rating'){
      arr = [...arr].sort((a, b) => (myRatings.value[b.id]?.overall || 0) - (myRatings.value[a.id]?.overall || 0));
    }
  }
  return arr;
});
</script>
