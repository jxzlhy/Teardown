<template>
  <div id="graphView">
    <canvas ref="canvasRef" id="graphCanvas"></canvas>
    <header id="graphBar" class="hud-panel">
      <router-link to="/" class="hud-icon" aria-label="返回大厅">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M15 5l-7 7 7 7"/></svg>
      </router-link>
      <div class="gb-title">
        <span class="hud-eyebrow">KNOWLEDGE GRAPH · 知识星图</span>
        <h2>{{ graph ? `${graph.stats.devices} 台设备 · ${graph.stats.brands} 品牌 · ${graph.stats.techs} 项技术 · ${graph.stats.links} 连边` : '构建星图中…' }}</h2>
      </div>
      <button class="hud-icon" @click="resetView" aria-label="复位视图" title="复位视图（R）">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><circle cx="12" cy="12" r="6.5"/><path d="M12 2.5v4M12 17.5v4M2.5 12h4M17.5 12h4"/></svg>
      </button>
      <div class="gb-search">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">
          <circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/>
        </svg>
        <input type="text" v-model="searchQuery" @keydown.enter="locateDevice"
          placeholder="定位设备…" aria-label="定位设备" list="graph-devices">
        <datalist id="graph-devices">
          <option v-for="d in deviceLabels" :key="d" :value="d"/>
        </datalist>
      </div>
      <div class="gb-filters">
        <button class="hud-icon" :class="{ on: liteMode }" @click="toggleLite" aria-label="简洁视图" title="简洁视图：隐藏部件类并冻结其物理（低端设备更流畅）">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M12 3l9 5-9 5-9-5 9-5z"/><path d="M3 13l9 5 9-5" stroke-dasharray="2.5 2.5"/></svg>
        </button>
        <button class="hud-icon" :class="{ on: timeFilter.on }" @click="toggleTime" aria-label="年代过滤" title="按年代过滤馆藏与技术">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><circle cx="12" cy="12" r="8.5"/><path d="M12 7v5l3.5 2"/></svg>
        </button>
        <button v-for="t in TYPES" :key="t.id" class="gb-chip" :class="{ off: !visibleTypes.has(t.id) }" @click="toggleType(t.id)">
          <i :style="{ background: t.color }"></i>{{ t.zh }}
        </button>
      </div>
    </header>
    <!-- 年代过滤条：从/到双滑杆；无断代节点始终显示 -->
    <div id="graphTimeStrip" v-if="timeFilter.on" class="hud-panel">
      <span class="hud-eyebrow">ERA</span>
      <label class="ts-l">从</label>
      <input type="range" min="1800" max="2026" :value="timeFilter.from" @input="setTimeFrom($event)" aria-label="起始年代">
      <span class="ts-v">{{ timeFilter.from }}</span>
      <label class="ts-l">到</label>
      <input type="range" min="1800" max="2026" :value="timeFilter.to" @input="setTimeTo($event)" aria-label="结束年代">
      <span class="ts-v">{{ timeFilter.to }}</span>
      <span class="ts-note">隐藏 {{ hiddenCount }} 节点 · 无断代馆藏始终显示</span>
      <button class="ts-clear" @click="resetTime">全期</button>
    </div>
    <div id="graphHint" v-show="hoverLabel">{{ hoverLabel }}</div>
    <div id="graphMiss" v-if="searchMiss">未找到「{{ searchMiss }}」设备</div>
    <!-- 技术详情浮层：点击技术节点（知识库词条：原理/沿革/应用设备/来源） -->
    <Transition name="fade">
      <aside v-if="panelTech" id="techPanel" class="hud-panel">
        <button class="tp-close" @click="closePanel" aria-label="关闭">✕</button>
        <div class="hud-eyebrow">TECHNOLOGY · 技术词条</div>
        <h3>{{ panelTech.zh }}<small v-if="panelTech.invented"> · {{ panelTech.invented }}</small></h3>
        <p class="tp-principle">{{ panelTech.principle }}</p>
        <div v-if="panelTech.history && panelTech.history.length" class="tp-hist">
          <div v-for="([y, txt], i) in panelTech.history" :key="i" class="tp-hrow"><span class="hy">{{ y }}</span><span class="ht">{{ txt }}</span></div>
        </div>
        <div class="tp-sec" v-if="panelRelated.length">
          <h4>应用设备 <small>{{ panelRelated.length }}+</small></h4>
          <router-link v-for="d in panelRelated" :key="d.id" :to="'/device/' + d.device" class="tp-dev" @click="closePanel">
            {{ d.label }}<i>拆解 ↗</i>
          </router-link>
        </div>
        <div class="tp-sec" v-if="panelTech.sources && panelTech.sources.length">
          <h4>来源</h4>
          <a v-for="s in panelTech.sources" :key="s.url" :href="s.url" target="_blank" rel="noopener" class="tp-src">{{ s.label }} ↗</a>
        </div>
      </aside>
    </Transition>
    <!-- 品牌档案浮层：点击品牌节点（史料已核证者显示创立年与一句话；待考者只列馆藏） -->
    <Transition name="fade">
      <aside v-if="panelBrand" id="brandPanel" class="hud-panel">
        <button class="tp-close" @click="closePanel" aria-label="关闭">✕</button>
        <div class="hud-eyebrow">BRAND · 品牌档案</div>
        <h3>{{ panelBrand.id }}<small v-if="panelBrand.founded"> · {{ panelBrand.founded }}</small></h3>
        <p v-if="panelBrand.note" class="tp-principle">{{ panelBrand.note }}</p>
        <p v-else-if="panelBrand.kind === 'company'" class="tp-principle tp-todo">品牌史料待考 · 以下为馆藏事实，不臆造历史。</p>
        <p v-else-if="panelBrand.kind === 'author'" class="tp-principle tp-todo">社区模型作者 · 署名与许可见各设备页。</p>
        <p v-else class="tp-principle tp-todo">教学/概念型号 · 无品牌史可考。</p>
        <div class="tp-sec">
          <h4>馆藏设备 <small>{{ panelBrandRelated.length }}</small></h4>
          <router-link v-for="d in panelBrandRelated" :key="d.id" :to="'/device/' + d.device" class="tp-dev" @click="closePanel">
            {{ d.label }}<i>拆解 ↗</i>
          </router-link>
        </div>
        <div class="tp-sec" v-if="panelBrand.sources && panelBrand.sources.length">
          <h4>来源</h4>
          <a v-for="s in panelBrand.sources" :key="s.url" :href="s.url" target="_blank" rel="noopener" class="tp-src">{{ s.label }} ↗</a>
        </div>
      </aside>
    </Transition>
  </div>
</template>

<script setup>
/* =============================================================
   知识星图 /graph：零依赖 Canvas 2D 力导向（不引入 three 主 chunk 复本，
   2D 对 575 节点足够且移动端省电；3D 模式为后续可选项）
   物理：库仑斥力 + 弹簧（produces/has-part/uses）+ 向心力，alpha 衰减
   交互：滚轮/双指缩放、拖拽平移与节点、悬停一跳高亮、点击设备跳深链
============================================================= */
import { ref, reactive, watch, onMounted, onBeforeUnmount } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { technologies } from '../knowledge/index.js';
import { brandFor } from '../knowledge/brands.js';
import { getExplored } from '../lib/explore.js';

const route = useRoute();
const router = useRouter();
const canvasRef = ref(null);
const graph = ref(null);
const hoverLabel = ref('');
const searchQuery = ref('');
const searchMiss = ref('');
const deviceLabels = ref([]);
const panelTech = ref(null);          // 技术详情浮层（点击技术节点打开知识库词条）
const panelRelated = ref([]);         // 浮层内的应用设备列表
const panelBrand = ref(null);         // 品牌档案浮层（点击品牌节点）
const panelBrandRelated = ref([]);    // 浮层内的馆藏设备列表

const TYPES = [
  { id: 'brand', zh: '品牌', color: '#9aa8b8' },
  { id: 'device', zh: '设备', color: '#45e0ff' },
  { id: 'part', zh: '部件类', color: '#3d566e' },
  { id: 'tech', zh: '技术', color: '#c792ea' },
];
const TYPE_COLOR = Object.fromEntries(TYPES.map(t => [t.id, t.color]));
const visibleTypes = ref(new Set(TYPES.map(t => t.id)));
const liteMode = ref(false);            // 简洁视图：隐藏部件类并冻结其物理
const timeFilter = reactive({ on: false, from: 1800, to: 2026 });   // 年代过滤
const hiddenCount = ref(0);             // 模板展示用

let hiddenNodes = new Set();            // 被过滤器隐藏的节点 id（类型/简洁/年代；物理冻结）
const isVisible = n => !hiddenNodes.has(n.id);

let canvas, ctx, W = 0, H = 0, dpr = 1;
let nodes = [], links = [], adj = new Map();
let view = { x: 0, y: 0, k: 1 };
let alpha = 1;
let hoverId = null, dragNode = null, panning = false;
let panStart = null, raf = 0, running = false;
let pinnedId = null;                  // 钉住的一跳高亮（点击品牌/技术/部件；Esc/点空白解除）
let exploredSet = new Set();          // 已探索设备（探索系统联动标记）
const pointers = new Map();           // 活动指针（双指捏合缩放）
let pinch = null, multiTouch = false;

function recomputeHidden(){
  hiddenNodes = new Set();
  if(timeFilter.on){
    for(const n of nodes){
      /* 无断代节点始终显示（诚实留白：无法判定年代的馆藏不做臆断） */
      if(n.year == null){ continue; }
      if(n.year < timeFilter.from || n.year > timeFilter.to){ hiddenNodes.add(n.id); continue; }
      if(n.type !== 'part' && n.type !== 'brand') continue;
      /* 部件/品牌：所有可见关联（设备）都被隐藏时跟随隐藏 */
      const isPart = n.type === 'part';
      let linked = false;
      for(const l of links){
        const other = isPart ? (l.type === 'has-part' && l.b === n ? l.a : null)
          : (l.type === 'produces' && l.a === n ? l.b : null);
        if(other && !hiddenNodes.has(other.id)){ linked = true; break; }
      }
      if(!linked) hiddenNodes.add(n.id);
    }
  }
  for(const n of nodes){
    if(hiddenNodes.has(n.id)) continue;
    if(!visibleTypes.value.has(n.type) || (liteMode.value && n.type === 'part')) hiddenNodes.add(n.id);
  }
  hiddenCount.value = hiddenNodes.size;
}
function toggleType(id){
  const s = new Set(visibleTypes.value);
  s.has(id) ? s.delete(id) : s.add(id);
  /* 至少保留一类，避免全空画面 */
  if(s.size) visibleTypes.value = s;
  recomputeHidden();
}
/* ---------- 简洁视图 / 年代过滤 ---------- */
function toggleLite(){
  liteMode.value = !liteMode.value;
  recomputeHidden();
}
function toggleTime(){
  timeFilter.on = !timeFilter.on;
  recomputeHidden();
}
function setTimeFrom(e){
  timeFilter.from = Math.min(parseInt(e.target.value, 10), timeFilter.to);
  e.target.value = timeFilter.from;
  recomputeHidden();
}
function setTimeTo(e){
  timeFilter.to = Math.max(parseInt(e.target.value, 10), timeFilter.from);
  e.target.value = timeFilter.to;
  recomputeHidden();
}
function resetTime(){
  timeFilter.from = Math.min(...nodes.map(n => n.year == null ? Infinity : n.year).filter(isFinite));
  timeFilter.to = Math.max(...nodes.map(n => n.year == null ? -Infinity : n.year).filter(isFinite));
  recomputeHidden();
}

onMounted(async () => {
  canvas = canvasRef.value;
  ctx = canvas.getContext('2d');
  onResize();
  window.addEventListener('resize', onResize);
  canvas.addEventListener('pointerdown', onPointerDown);
  canvas.addEventListener('pointermove', onPointerMove);
  window.addEventListener('pointerup', onPointerUp);
  canvas.addEventListener('wheel', onWheel, { passive: false });

  const res = await fetch('knowledge-graph.json');
  const data = await res.json();
  graph.value = data;
  nodes = data.nodes.map((n, i) => ({
    ...n,
    x: (Math.random() - 0.5) * 1400,
    y: (Math.random() - 0.5) * 1000,
    vx: 0, vy: 0, r: n.type === 'brand' ? 7 : n.type === 'tech' ? 6 : n.type === 'device' ? 5 : 2.5,
  }));
  const byId = new Map(nodes.map(n => [n.id, n]));
  links = data.links
    .map(l => ({ ...l, a: byId.get(l.source), b: byId.get(l.target) }))
    .filter(l => l.a && l.b);
  for(const l of links){
    if(!adj.has(l.a)) adj.set(l.a, new Set());
    if(!adj.has(l.b)) adj.set(l.b, new Set());
    adj.get(l.a).add(l.b); adj.get(l.b).add(l.a);
  }
  /* 起始居中 + 按类型分层散布，收敛更快更可读 */
  for(const n of nodes){
    const base = n.type === 'brand' ? 0 : n.type === 'tech' ? 1 : n.type === 'device' ? 2 : 3;
    const ang = Math.random() * Math.PI * 2;
    const rad = 200 + base * 220 + Math.random() * 160;
    n.x = Math.cos(ang) * rad; n.y = Math.sin(ang) * rad;
  }
  /* 搜索定位：设备标签清单（去重） */
  deviceLabels.value = [...new Set(nodes.filter(n => n.type === 'device').map(n => n.label))];
  /* 度数驱动节点半径 + 已探索标记 + 键盘 + 观测钩子 */
  sizeNodes();
  exploredSet = new Set(Object.keys(getExplored()));
  /* 年代过滤量程：数据极值（公元前负数）；无断代节点不受过滤 */
  let yMin = Infinity, yMax = -Infinity;
  for(const n of nodes){
    if(n.year == null) continue;
    if(n.year < yMin) yMin = n.year;
    if(n.year > yMax) yMax = n.year;
  }
  timeFilter.from = Math.floor(yMin); timeFilter.to = Math.ceil(yMax);
  recomputeHidden();
  window.addEventListener('keydown', onKey);
  window.__GRAPH = {   // 调试/无头验证观测钩子（同 __ENGINE 惯例）
    get view(){ return { ...view }; },
    get nodes(){ return nodes; },
    get ui(){ return {
      pinnedId,
      panelTechId: panelTech.value ? panelTech.value.id : null,
      panelBrandId: panelBrand.value ? panelBrand.value.id : null,
      lite: liteMode.value, timeOn: timeFilter.on, hiddenCount: hiddenNodes.size,
      yearRange: [timeFilter.from, timeFilter.to],
    }; },
    get bench(){ return (iters = 60) => {
      const a0 = alpha; alpha = 1;
      const t0 = performance.now();
      for(let i = 0; i < iters; i++) simulate();
      alpha = a0;
      return +(performance.now() - t0).toFixed(1);
    }; },
  };
  /* URL 深链：?focus=<nodeId>（定位+钉住+技术浮层）；?q= 预填搜索。
     布局收敛会带走节点位置——4.6s 后对钉住节点补一次镜头 tween */
  if(route.query.q) searchQuery.value = String(route.query.q);
  const initialFocus = route.query.focus ? nodes.find(x => x.id === route.query.focus) : null;
  if(initialFocus){
    lastFocusId = initialFocus.id;
    applyFocus(initialFocus, false);
    setTimeout(() => {
      if(!running || pinnedId !== initialFocus.id) return;
      const n2 = nodes.find(x => x.id === initialFocus.id);
      if(n2) viewTween = { x: -n2.x * view.k, y: -n2.y * view.k, k: view.k };
    }, 4600);
  }else if(route.query.q){
    locateDevice();
  }
  /* 同路由 query 变化（组件不重挂）：focus 定位 / q 预填搜索；
     applyFocus 写回 URL 前先记 lastFocusId，watcher 见同值即跳过防回环 */
  watch(() => [route.query.focus, route.query.q], ([id, q]) => {
    q = q == null ? null : String(q);
    if(q != null && q !== searchQuery.value){
      searchQuery.value = q;
      locateDevice();
      return;
    }
    id = id == null ? null : String(id);
    if(id && id !== lastFocusId){
      lastFocusId = id;
      focusById(id);
    }
  });
  running = true;
  raf = requestAnimationFrame(tick);
});

onBeforeUnmount(() => {
  running = false;
  cancelAnimationFrame(raf);
  window.removeEventListener('resize', onResize);
  window.removeEventListener('pointerup', onPointerUp);
  window.removeEventListener('keydown', onKey);
  pointers.clear();
  delete window.__GRAPH;
});

function onResize(){
  dpr = Math.min(devicePixelRatio || 1, 2);
  W = innerWidth; H = innerHeight;
  canvas.width = W * dpr; canvas.height = H * dpr;
  canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
}

/* 度数 → 半径：枢纽一眼可辨（159 部件的 iPhone 拆解 > 2 部件设备；大牌/多关联技术同理） */
function sizeNodes(){
  for(const n of nodes){
    const d = adj.get(n) ? adj.get(n).size : 0;
    if(n.type === 'brand') n.r = 7 + Math.min(6, d * 0.4);
    else if(n.type === 'device') n.r = 5 + Math.min(7, Math.log2(d + 1));
    else if(n.type === 'tech') n.r = 6 + Math.min(5, d * 0.25);
    else n.r = 2.5 + Math.min(3, d * 0.22);
  }
}

function tick(){
  if(!running) return;
  if(alpha > 0.015) simulate();
  if(pulseNode && pulseT < 1) pulseT += 0.014;
  draw();
  raf = requestAnimationFrame(tick);
}

function simulate(){
  /* 斥力：Barnes-Hut 四叉树近似（θ=0.9），O(n log n)；隐藏节点物理冻结不参与。
     质量模型与旧 O(n²) 等价：远处簇合力 ≈ (a.r + 簇均半径) × 14 × count / d² */
  const vis = [];
  for(const n of nodes) if(isVisible(n)) vis.push(n);
  if(vis.length > 1){
    const root = buildQuadtree(vis);
    for(const a of vis) applyRepulsion(a, root);
  }
  /* 弹簧 */
  for(const l of links){
    if(!isVisible(l.a) || !isVisible(l.b)) continue;
    const rest = l.type === 'produces' ? 90 : l.type === 'uses' ? 130 : l.type === 'applies-to' ? 70 : 46;
    const dx = l.b.x - l.a.x, dy = l.b.y - l.a.y;
    const d = Math.max(Math.hypot(dx, dy), 0.01);
    const f = (d - rest) / d * 0.028;
    l.a.vx += dx * f; l.a.vy += dy * f;
    l.b.vx -= dx * f; l.b.vy -= dy * f;
  }
  /* 向心 + 阻尼 + 积分（被拖拽节点与隐藏节点除外） */
  for(const n of nodes){
    if(!isVisible(n)) continue;
    n.vx += -n.x * 0.0022; n.vy += -n.y * 0.0022;
    n.vx *= 0.86; n.vy *= 0.86;
    if(n === dragNode) continue;
    n.x += n.vx * alpha; n.y += n.vy * alpha;
  }
  alpha *= 0.985;
}

/* ---------- Barnes-Hut 四叉树 ---------- */
function buildQuadtree(items){
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for(const n of items){
    if(n.x < x0) x0 = n.x; if(n.x > x1) x1 = n.x;
    if(n.y < y0) y0 = n.y; if(n.y > y1) y1 = n.y;
  }
  if(x1 - x0 < 1){ x1 = x0 + 1; }
  if(y1 - y0 < 1){ y1 = y0 + 1; }
  const root = { x0, y0, x1, y1, size: Math.max(x1 - x0, y1 - y0), items, children: null, count: 0, cx: 0, cy: 0, rSum: 0, bodyNode: null };
  subdivide(root, 0);
  return root;
}
function subdivide(cell, depth){
  cell.count = cell.items.length;
  if(cell.count === 0) return;
  if(cell.count === 1 || depth > 22){
    /* 深度封底：重合节点聚为簇（自身排除由 bodyNode 判定，重合时 d²<1 剪枝兜底） */
    cell.cx = 0; cell.cy = 0; cell.rSum = 0;
    for(const n of cell.items){ cell.cx += n.x; cell.cy += n.y; cell.rSum += n.r; }
    cell.cx /= cell.count; cell.cy /= cell.count;
    cell.bodyNode = cell.items[0];
    return;
  }
  const mx = (cell.x0 + cell.x1) / 2, my = (cell.y0 + cell.y1) / 2;
  const q = [
    { x0: cell.x0, y0: cell.y0, x1: mx, y1: my, size: 0, items: [], children: null, count: 0, cx: 0, cy: 0, rSum: 0, bodyNode: null },
    { x0: mx, y0: cell.y0, x1: cell.x1, y1: my, size: 0, items: [], children: null, count: 0, cx: 0, cy: 0, rSum: 0, bodyNode: null },
    { x0: cell.x0, y0: my, x1: mx, y1: cell.y1, size: 0, items: [], children: null, count: 0, cx: 0, cy: 0, rSum: 0, bodyNode: null },
    { x0: mx, y0: my, x1: cell.x1, y1: cell.y1, size: 0, items: [], children: null, count: 0, cx: 0, cy: 0, rSum: 0, bodyNode: null },
  ];
  for(const n of cell.items) q[(n.x >= mx ? 1 : 0) + (n.y >= my ? 2 : 0)].items.push(n);
  cell.items = null;
  cell.children = q;
  let cnt = 0, cx = 0, cy = 0, rSum = 0;
  for(const c of q){
    c.size = Math.max(c.x1 - c.x0, c.y1 - c.y0);
    subdivide(c, depth + 1);
    if(c.count){ cx += c.cx * c.count; cy += c.cy * c.count; rSum += c.rSum; cnt += c.count; }
  }
  cell.count = cnt; cell.cx = cnt ? cx / cnt : 0; cell.cy = cnt ? cy / cnt : 0; cell.rSum = rSum;
}
function applyRepulsion(a, root){
  const stack = [root];
  while(stack.length){
    const nd = stack.pop();
    if(!nd.count) continue;
    const dx = a.x - nd.cx, dy = a.y - nd.cy;
    const d2 = dx * dx + dy * dy;
    if(nd.count === 1 || nd.size / (Math.sqrt(d2) + 1e-9) < 0.9){
      if(nd.bodyNode === a || d2 < 1) continue;
      const rm = nd.count === 1 ? nd.bodyNode.r : nd.rSum / nd.count;
      const rep = (a.r + rm) * 14 * (nd.count === 1 ? 1 : nd.count) / d2;
      const d = Math.sqrt(d2);
      a.vx += dx / d * rep; a.vy += dy / d * rep;
    }else if(nd.children){
      for(const c of nd.children) if(c && c.count) stack.push(c);
    }
  }
}

function draw(){
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = '#04070c';
  ctx.fillRect(0, 0, W, H);
  /* 搜索定位/复位的镜头缓动：视图中心与缩放同步滑向目标 */
  if(viewTween){
    view.x += (viewTween.x - view.x) * 0.14;
    view.y += (viewTween.y - view.y) * 0.14;
    view.k += (viewTween.k - view.k) * 0.14;
    if(Math.abs(viewTween.x - view.x) < 0.5 && Math.abs(viewTween.y - view.y) < 0.5 && Math.abs(viewTween.k - view.k) < 0.004){
      view.x = viewTween.x; view.y = viewTween.y; view.k = viewTween.k; viewTween = null;
    }
  }
  ctx.translate(W / 2 + view.x, H / 2 + view.y);
  ctx.scale(view.k, view.k);

  /* 钉住优先：pin 存在时高亮冻结在其一跳子图（hover 暂停），Esc/点空白解除 */
  const activeId = pinnedId || hoverId;
  const activeNode = activeId ? nodes.find(n => n.id === activeId) : null;
  const hl = activeNode ? adj.get(activeNode) : null;
  const hoverNode = activeNode;

  /* 连边 */
  for(const l of links){
    if(!isVisible(l.a) || !isVisible(l.b)) continue;
    const hot = hoverNode && (l.a === hoverNode || l.b === hoverNode);
    ctx.strokeStyle = hot ? 'rgba(69,224,255,.55)'
      : hoverNode ? 'rgba(90,110,130,.06)'
      : l.type === 'uses' || l.type === 'applies-to' ? 'rgba(199,146,234,.14)' : 'rgba(90,120,150,.10)';
    ctx.lineWidth = hot ? 1.6 / view.k : 1 / view.k;
    ctx.beginPath(); ctx.moveTo(l.a.x, l.a.y); ctx.lineTo(l.b.x, l.b.y); ctx.stroke();
  }
  /* 节点 */
  ctx.textAlign = 'center';
  for(const n of nodes){
    if(!isVisible(n)) continue;
    const hot = hoverNode && (n === hoverNode || (hl && hl.has(n)));
    const dimmed = hoverNode && !hot;
    ctx.globalAlpha = dimmed ? 0.18 : 1;
    ctx.fillStyle = hot ? '#bffbff' : TYPE_COLOR[n.type];
    ctx.beginPath(); ctx.arc(n.x, n.y, n.r + (hot ? 1 : 0), 0, Math.PI * 2); ctx.fill();
    if(n.type === 'tech' && hot){
      ctx.strokeStyle = 'rgba(199,146,234,.8)'; ctx.lineWidth = 1.2 / view.k;
      ctx.beginPath(); ctx.arc(n.x, n.y, n.r + 3.5, 0, Math.PI * 2); ctx.stroke();
    }
    /* 探索系统联动：已探索设备描常驻细环 */
    if(n.type === 'device' && exploredSet.has(n.device)){
      ctx.strokeStyle = 'rgba(69,224,255,.5)';
      ctx.lineWidth = 1.3 / view.k;
      ctx.beginPath(); ctx.arc(n.x, n.y, n.r + 2.5, 0, Math.PI * 2); ctx.stroke();
    }
    /* 搜索命中脉冲：外扩圆环 1.5s */
    if(pulseNode && n === pulseNode && pulseT < 1){
      ctx.strokeStyle = `rgba(69,224,255,${(1 - pulseT) * 0.9})`;
      ctx.lineWidth = 2 / view.k;
      ctx.beginPath(); ctx.arc(n.x, n.y, n.r + 6 + pulseT * 26, 0, Math.PI * 2); ctx.stroke();
    }
    const showLabel = n.type === 'device' ? (hot || view.k > 1.15)
      : n.type === 'part' ? (hot || view.k > 1.6) : true;
    if(showLabel){
      /* 标签去碰撞（审计 P2-5）：候选按优先级入列，绘制时与已绘矩形相交则跳过。
         优先级：搜索命中 > 悬停/邻接 > 品牌/技术 > 设备 > 部件 */
      const prio = n === pulseNode ? 0 : hot ? 1 : (n.type === 'brand' || n.type === 'tech') ? 2
        : n.type === 'device' ? 3 : 4;
      labelCandidates.push({ n, prio, font: (n.type === 'device' ? 11 : n.type === 'part' ? 9 : 10) + 'px ui-monospace, Menlo, monospace',
        color: dimmed ? 'rgba(160,180,200,.15)' : n.type === 'device' ? 'rgba(220,240,250,.92)' : 'rgba(170,190,210,.75)' });
    }
  }
  ctx.globalAlpha = 1;
  /* 统一绘制标签：低优先级先到先占位会导致品牌挤掉设备——按 prio 升序绘制（0 最优先） */
  labelCandidates.sort((a, b) => a.prio - b.prio);
  for(const c of labelCandidates){
    ctx.font = c.font;
    const w = ctx.measureText(c.n.label).width + 8;
    const y = c.n.y - c.n.r - 4;
    const rect = [c.n.x - w / 2, y - 10, w, 13];
    if(labelRects.some(r => rect[0] < r[0] + r[2] && rect[0] + rect[2] > r[0] && rect[1] < r[1] + r[3] && rect[1] + rect[3] > r[1])) continue;
    ctx.fillStyle = c.color;
    ctx.fillText(c.n.label, c.n.x, y);
    labelRects.push(rect);
  }
  labelCandidates.length = 0; labelRects.length = 0;
}
let labelCandidates = [], labelRects = [];
let viewTween = null, pulseNode = null, pulseT = 1;
/* ---------- 定位 / URL 深链（/graph?focus=<nodeId>；?q= 预填搜索） ---------- */
let lastFocusId = null;   // 防回环：自己写入 URL 的 focus 不再触发 watch
function applyFocus(n, write = true){
  searchMiss.value = '';
  pulseNode = n; pulseT = 0;
  pinnedId = n.id;        // 深链/搜索定位都钉住：分享出去的是"高亮该节点的一跳子图"
  if(n.tech){
    panelTech.value = technologies.find(t => t.id === n.tech) || null;
    panelRelated.value = panelTech.value
      ? links.filter(l => l.type === 'uses' && l.b === n).map(l => l.a).slice(0, 20)
      : [];
  }else if(n.type === 'brand'){
    openBrandPanel(n);
  }
  hoverLabel.value = `${n.label} · ${TYPES.find(t => t.id === n.type).zh}${n.device ? ' · 点击进入拆解' : n.tech ? ' · 点击看原理' : n.type === 'brand' ? ' · 点击聚焦' : ''}`;
  viewTween = { x: -n.x * view.k, y: -n.y * view.k, k: view.k };
  alpha = Math.max(alpha, 0.02);
  if(write && String(route.query.focus || '') !== n.id){
    lastFocusId = n.id;
    router.replace({ query: { ...route.query, focus: n.id } }).catch(() => {});
  }
}
function focusById(id){
  const n = nodes.find(x => x.id === id);
  if(!n){ searchMiss.value = String(id).split(':').pop(); return; }
  applyFocus(n, false);
}
function locateDevice(){
  const q = searchQuery.value.trim().toLowerCase();
  if(!q){ searchMiss.value = ''; return; }
  const n = nodes.find(x => x.type === 'device' && x.label.toLowerCase().includes(q))
    || nodes.find(x => x.label.toLowerCase().includes(q));
  if(!n){ searchMiss.value = searchQuery.value.trim(); return; }
  applyFocus(n);
}

/* ---------- 交互 ---------- */
function toWorld(px, py){
  return { x: (px - W / 2 - view.x) / view.k, y: (py - H / 2 - view.y) / view.k };
}
function pick(px, py){
  const p = toWorld(px, py);
  let best = null, bestD = 1e9;
  for(const n of nodes){
    if(!isVisible(n)) continue;
    const d = Math.hypot(n.x - p.x, n.y - p.y);
    if(d < n.r + 6 && d < bestD){ best = n; bestD = d; }
  }
  return best;
}
let lastPt = null;
/* ---------- 复位 / 键盘 ---------- */
function resetView(){
  viewTween = { x: 0, y: 0, k: 1 };
  pinnedId = null; panelTech.value = null;
}
function closePanel(){ panelTech.value = null; panelBrand.value = null; pinnedId = null; }
function openBrandPanel(node){
  panelBrand.value = brandFor(node.label);
  panelBrandRelated.value = links.filter(l => l.type === 'produces' && l.a === node).map(l => l.b).slice(0, 24);
}
function onKey(e){
  if(e.target instanceof HTMLInputElement) return;
  if(e.key === 'Escape'){ pinnedId = null; panelTech.value = null; }
  else if(e.code === 'KeyR'){ resetView(); }
}
/* ---------- 双指捏合缩放（移动端；初始中点下的世界点为锚，随中点平移） ---------- */
function pinchUpdate(){
  const pts = [...pointers.values()];
  const d = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
  const mx = (pts[0].x + pts[1].x) / 2, my = (pts[0].y + pts[1].y) / 2;
  view.k = Math.min(4, Math.max(0.25, pinch.k * d / pinch.d));
  view.x = mx - W / 2 - pinch.wx * view.k;
  view.y = my - H / 2 - pinch.wy * view.k;
}
function onPointerDown(e){
  pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
  lastPt = { x: e.clientX, y: e.clientY };
  viewTween = null;   // 用户手势优先于搜索定位的镜头缓动，否则平移被 lerp 吃掉
  if(pointers.size === 2){
    /* 第二指落下：取消单指手势，进入捏合缩放 */
    panning = false; dragNode = null; multiTouch = true;
    const pts = [...pointers.values()];
    const mx = (pts[0].x + pts[1].x) / 2, my = (pts[0].y + pts[1].y) / 2;
    pinch = { d: Math.max(Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y), 1), k: view.k,
      wx: (mx - W / 2 - view.x) / view.k, wy: (my - H / 2 - view.y) / view.k };
    return;
  }
  const n = pick(e.clientX, e.clientY);
  if(n){ dragNode = n; hoverId = n.id; }
  /* 平移起点：视图偏移与指针坐标分开存——此前 {...view, ...lastPt} 让指针 x/y
     覆盖 view.x/y，首次 move 后 view 被置成原始屏幕坐标，整图甩向右下角 */
  else { panning = true; panStart = { vx: view.x, vy: view.y, px: e.clientX, py: e.clientY }; }
  try{ canvas.setPointerCapture(e.pointerId); }catch{ /* 合成事件/已释放指针：不影响状态 */ }
}
function onPointerMove(e){
  if(pointers.has(e.pointerId)) pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
  if(pinch){ if(pointers.size >= 2) pinchUpdate(); return; }
  if(panning && panStart){
    view.x = panStart.vx + (e.clientX - panStart.px);
    view.y = panStart.vy + (e.clientY - panStart.py);
    return;
  }
  if(dragNode && lastPt){
    const p = toWorld(e.clientX, e.clientY);
    dragNode.x = p.x; dragNode.y = p.y;
    dragNode.vx = dragNode.vy = 0;
    alpha = Math.max(alpha, 0.3);
    return;
  }
  if(pinnedId){ canvas.style.cursor = 'grab'; return; }   // 钉住时高亮冻结，hover 暂停
  const n = pick(e.clientX, e.clientY);
  if(n !== (hoverId && nodes.find(x => x.id === hoverId))){
    hoverId = n ? n.id : null;
    hoverLabel.value = n ? `${n.label} · ${TYPES.find(t => t.id === n.type).zh}${n.device ? ' · 点击进入拆解' : n.tech ? ' · 点击看原理' : n.type === 'brand' ? ' · 点击聚焦' : ''}` : '';
    canvas.style.cursor = n ? 'pointer' : 'grab';
  }
}
function onPointerUp(e){
  pointers.delete(e.pointerId);
  if(pinch && pointers.size < 2) pinch = null;
  const moved = lastPt && Math.hypot(e.clientX - lastPt.x, e.clientY - lastPt.y) < 4;
  if(dragNode){
    if(moved && !multiTouch){
      if(dragNode.type === 'device') router.push('/device/' + dragNode.device);
      else if(dragNode.type === 'tech'){
        /* 技术节点：钉住一跳高亮 + 打开知识库词条浮层 */
        pinnedId = dragNode.id;
        panelTech.value = technologies.find(t => t.id === dragNode.tech) || null;
        panelRelated.value = panelTech.value
          ? links.filter(l => l.type === 'uses' && l.b === dragNode).map(l => l.a).slice(0, 20)
          : [];
      }else if(dragNode.type === 'brand' || dragNode.type === 'part'){
        pinnedId = dragNode.id;
        if(dragNode.type === 'brand') openBrandPanel(dragNode);
      }
    }
    dragNode = null;
  }else if(moved && !multiTouch){
    /* 点空白：解除钉住/浮层 */
    pinnedId = null; panelTech.value = null;
  }
  panning = false; panStart = null;
  if(pointers.size === 0) multiTouch = false;
}
function onWheel(e){
  e.preventDefault();
  viewTween = null;
  const k = Math.min(4, Math.max(0.25, view.k * (e.deltaY < 0 ? 1.12 : 0.89)));
  /* 以指针为缩放锚点 */
  const p = toWorld(e.clientX, e.clientY);
  view.k = k;
  const p2 = toWorld(e.clientX, e.clientY);
  view.x += (p2.x - p.x) * view.k;
  view.y += (p2.y - p.y) * view.k;
}
</script>

<style scoped>
#graphView{ position:fixed; inset:0; background:#04070c; }
#graphCanvas{ position:absolute; inset:0; cursor:grab; touch-action:none; }
#graphBar{
  position:absolute; left:16px; right:16px; top:12px; z-index:5;
  display:flex; align-items:center; gap:14px; padding:10px 14px;
}
.gb-title{ flex:1; min-width:0; }
.gb-title h2{ margin:3px 0 0; font-size:13px; font-weight:600; color:var(--txt-1); font-family:var(--sans); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.gb-filters{ display:flex; gap:6px; flex:none; }
/* 搜索定位 */
.gb-search{
  display:flex; align-items:center; gap:7px; flex:none;
  border:1px solid rgba(120,150,180,.2); border-radius:999px; padding:5px 13px;
  background:rgba(120,150,180,.05); min-width:170px;
}
.gb-search svg{ width:13px; height:13px; color:var(--txt-dim); flex:none; }
.gb-search input{
  background:none; border:none; outline:none; color:var(--txt);
  font-family:var(--sans); font-size:12px; letter-spacing:.04em; width:100%;
}
.gb-search input::placeholder{ color:rgba(125,143,163,.5); }
.gb-search:focus-within{ border-color:var(--acc); box-shadow:0 0 12px var(--acc-16); }
#graphMiss{
  position:absolute; top:74px; left:50%; transform:translateX(-50%); z-index:5;
  padding:6px 14px; border-radius:999px; background:rgba(4,10,16,.9);
  border:1px solid color-mix(in srgb, var(--warn) 45%, transparent);
  color:var(--warn); font-family:var(--mono); font-size:11px; letter-spacing:.08em;
}
.gb-chip{
  display:flex; align-items:center; gap:5px; padding:4px 9px; border-radius:999px;
  border:1px solid rgba(120,150,180,.25); background:rgba(7,13,20,.5);
  color:var(--txt-2); font-size:10px; letter-spacing:.1em; cursor:pointer; font-family:var(--mono);
}
.gb-chip i{ width:7px; height:7px; border-radius:50%; }
.gb-chip.off{ opacity:.35; }
/* 年代过滤条 */
#graphTimeStrip{
  position:absolute; z-index:5; left:50%; top:70px; transform:translateX(-50%);
  display:flex; align-items:center; gap:8px; padding:7px 14px; max-width:calc(100vw - 32px);
}
#graphTimeStrip .ts-l{ font-family:var(--mono); font-size:9px; letter-spacing:.2em; color:var(--txt-3); }
#graphTimeStrip .ts-v{ font-family:var(--mono); font-size:11px; color:var(--acc); min-width:38px; }
#graphTimeStrip input[type=range]{ width:110px; accent-color:var(--acc); }
#graphTimeStrip .ts-note{ font-family:var(--mono); font-size:9px; letter-spacing:.08em; color:var(--txt-dim); white-space:nowrap; }
#graphTimeStrip .ts-clear{
  background:none; border:1px solid rgba(120,150,180,.3); border-radius:999px;
  color:var(--txt-2); font-size:10px; padding:3px 10px; cursor:pointer; font-family:var(--mono);
}
#graphTimeStrip .ts-clear:hover{ color:var(--acc); border-color:var(--acc); }
#graphHint{
  position:absolute; left:50%; bottom:22px; transform:translateX(-50%); z-index:5;
  padding:6px 14px; border-radius:999px; background:rgba(4,10,16,.9);
  border:1px solid color-mix(in srgb, var(--acc) 40%, transparent);
  color:var(--acc); font-family:var(--mono); font-size:11px; letter-spacing:.1em;
  pointer-events:none; white-space:nowrap;
}
/* ---------- 技术详情浮层（点击技术节点；紫 = 技术类识别色） ---------- */
#techPanel, #brandPanel{
  position:absolute; right:16px; top:74px; bottom:16px; width:min(370px, calc(100vw - 32px)); z-index:6;
  overflow-y:auto; padding:16px 18px; scrollbar-width:thin; scrollbar-color:rgba(199,146,234,.3) transparent;
}
.tp-close{
  position:absolute; top:10px; right:10px; width:26px; height:26px;
  background:none; border:1px solid rgba(125,143,163,.3); border-radius:7px;
  color:var(--txt-3); cursor:pointer; font-size:12px;
}
.tp-close:hover{ color:var(--txt-1); border-color:var(--acc); }
#techPanel h3{ margin:8px 0 10px; font-size:15px; color:var(--txt-1); font-family:var(--sans); }
#techPanel h3 small{ font-family:var(--mono); font-size:10px; letter-spacing:.1em; color:#c792ea; }
.tp-principle{ margin:0; font-size:12px; line-height:1.85; color:#b9c8da; }
.tp-todo{ color:var(--txt-3); font-size:11.5px; }
.tp-hist{ margin-top:10px; border-top:1px dashed rgba(199,146,234,.25); padding-top:8px; }
.tp-hrow{ display:flex; gap:10px; padding:2.5px 0; font-size:11.5px; line-height:1.7; }
.tp-hrow .hy{ flex:none; min-width:56px; font-family:var(--mono); color:#c792ea; letter-spacing:.06em; }
.tp-hrow .ht{ color:#a9bacd; }
.tp-sec{ margin-top:14px; }
.tp-sec h4{
  margin:0 0 8px; font-family:var(--mono); font-size:10px; letter-spacing:.18em;
  color:var(--txt-2); border-bottom:1px solid rgba(199,146,234,.18); padding-bottom:5px;
}
.tp-sec h4 small{ color:#c792ea; margin-left:6px; }
.tp-dev{
  display:flex; justify-content:space-between; align-items:baseline; gap:10px;
  padding:5.5px 2px; font-size:11.5px; color:var(--txt-2); text-decoration:none;
  border-bottom:1px solid rgba(199,146,234,.08);
}
.tp-dev:hover{ color:var(--acc); }
.tp-dev i{ font-family:var(--mono); font-style:normal; font-size:9px; letter-spacing:.12em; color:var(--txt-dim); }
.tp-src{ display:inline-block; margin:0 12px 6px 0; font-size:10.5px; color:var(--acc-dim); text-decoration:none; border-bottom:1px dashed rgba(69,224,255,.25); }
.tp-src:hover{ color:var(--acc); }
.fade-enter-active, .fade-leave-active{ transition:opacity .25s ease, transform .25s ease; }
.fade-enter-from, .fade-leave-to{ opacity:0; transform:translateX(16px); }
@media (max-width:700px){
  #graphBar{ left:10px; right:10px; flex-wrap:wrap; }
  .gb-title h2{ font-size:11px; }
  .gb-search{ order:5; width:100%; }
  .gb-filters{ width:100%; justify-content:flex-start; }
  #graphMiss{ top:112px; }
  #techPanel{ right:10px; left:10px; width:auto; top:112px; }
}
</style>
