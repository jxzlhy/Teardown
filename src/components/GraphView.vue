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
      <div class="gb-filters">
        <button v-for="t in TYPES" :key="t.id" class="gb-chip" :class="{ off: !visibleTypes.has(t.id) }" @click="toggleType(t.id)">
          <i :style="{ background: t.color }"></i>{{ t.zh }}
        </button>
      </div>
    </header>
    <div id="graphHint" v-show="hoverLabel">{{ hoverLabel }}</div>
  </div>
</template>

<script setup>
/* =============================================================
   知识星图 /graph：零依赖 Canvas 2D 力导向（不引入 three 主 chunk 复本，
   2D 对 575 节点足够且移动端省电；3D 模式为后续可选项）
   物理：库仑斥力 + 弹簧（produces/has-part/uses）+ 向心力，alpha 衰减
   交互：滚轮/双指缩放、拖拽平移与节点、悬停一跳高亮、点击设备跳深链
============================================================= */
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const canvasRef = ref(null);
const graph = ref(null);
const hoverLabel = ref('');

const TYPES = [
  { id: 'brand', zh: '品牌', color: '#9aa8b8' },
  { id: 'device', zh: '设备', color: '#45e0ff' },
  { id: 'part', zh: '部件类', color: '#3d566e' },
  { id: 'tech', zh: '技术', color: '#c792ea' },
];
const TYPE_COLOR = Object.fromEntries(TYPES.map(t => [t.id, t.color]));
const visibleTypes = ref(new Set(TYPES.map(t => t.id)));

let canvas, ctx, W = 0, H = 0, dpr = 1;
let nodes = [], links = [], adj = new Map();
let view = { x: 0, y: 0, k: 1 };
let alpha = 1;
let hoverId = null, dragNode = null, panning = false;
let panStart = null, raf = 0, running = false;

function toggleType(id){
  const s = new Set(visibleTypes.value);
  s.has(id) ? s.delete(id) : s.add(id);
  /* 至少保留一类，避免全空画面 */
  if(s.size) visibleTypes.value = s;
}
const isVisible = n => visibleTypes.value.has(n.type);

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
  running = true;
  raf = requestAnimationFrame(tick);
});

onBeforeUnmount(() => {
  running = false;
  cancelAnimationFrame(raf);
  window.removeEventListener('resize', onResize);
  window.removeEventListener('pointerup', onPointerUp);
});

function onResize(){
  dpr = Math.min(devicePixelRatio || 1, 2);
  W = innerWidth; H = innerHeight;
  canvas.width = W * dpr; canvas.height = H * dpr;
  canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
}

function tick(){
  if(!running) return;
  if(alpha > 0.015) simulate();
  draw();
  raf = requestAnimationFrame(tick);
}

function simulate(){
  /* 斥力（网格无关 O(n²)，575 节点 ×~3s 收敛可接受） */
  for(let i = 0; i < nodes.length; i++){
    const a = nodes[i];
    for(let j = i + 1; j < nodes.length; j++){
      const b = nodes[j];
      let dx = a.x - b.x, dy = a.y - b.y;
      let d2 = dx * dx + dy * dy;
      if(d2 < 1){ dx = Math.random() - 0.5; dy = Math.random() - 0.5; d2 = 1; }
      if(d2 > 360000) continue;            // 600² 以外忽略，长尾剪枝
      const rep = (a.r + b.r) * 14 / d2;
      const d = Math.sqrt(d2);
      const fx = dx / d * rep, fy = dy / d * rep;
      a.vx += fx; a.vy += fy; b.vx -= fx; b.vy -= fy;
    }
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
  /* 向心 + 阻尼 + 积分（被拖拽节点除外） */
  for(const n of nodes){
    n.vx += -n.x * 0.0022; n.vy += -n.y * 0.0022;
    n.vx *= 0.86; n.vy *= 0.86;
    if(n === dragNode) continue;
    n.x += n.vx * alpha; n.y += n.vy * alpha;
  }
  alpha *= 0.985;
}

function draw(){
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = '#04070c';
  ctx.fillRect(0, 0, W, H);
  ctx.translate(W / 2 + view.x, H / 2 + view.y);
  ctx.scale(view.k, view.k);

  const hl = hoverId ? adj.get(nodes.find(n => n.id === hoverId) || {}) : null;
  const hoverNode = hoverId ? nodes.find(n => n.id === hoverId) : null;

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
    const showLabel = n.type === 'device' ? (hot || view.k > 1.15)
      : n.type === 'part' ? (hot || view.k > 1.6) : true;
    if(showLabel){
      ctx.font = (n.type === 'device' ? 11 : n.type === 'part' ? 9 : 10) + 'px ui-monospace, Menlo, monospace';
      ctx.fillStyle = dimmed ? 'rgba(160,180,200,.15)' : n.type === 'device' ? 'rgba(220,240,250,.92)' : 'rgba(170,190,210,.75)';
      ctx.fillText(n.label, n.x, n.y - n.r - 4);
    }
  }
  ctx.globalAlpha = 1;
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
function onPointerDown(e){
  lastPt = { x: e.clientX, y: e.clientY };
  const n = pick(e.clientX, e.clientY);
  if(n){ dragNode = n; hoverId = n.id; }
  else { panning = true; panStart = { ...view, ...lastPt }; }
  canvas.setPointerCapture(e.pointerId);
}
function onPointerMove(e){
  if(panning && panStart && lastPt){
    view.x = panStart.x + (e.clientX - panStart.x);
    view.y = panStart.y + (e.clientY - panStart.y);
    return;
  }
  if(dragNode && lastPt){
    const p = toWorld(e.clientX, e.clientY);
    dragNode.x = p.x; dragNode.y = p.y;
    dragNode.vx = dragNode.vy = 0;
    alpha = Math.max(alpha, 0.3);
    return;
  }
  const n = pick(e.clientX, e.clientY);
  if(n !== (hoverId && nodes.find(x => x.id === hoverId))){
    hoverId = n ? n.id : null;
    hoverLabel.value = n ? `${n.label} · ${TYPES.find(t => t.id === n.type).zh}${n.device ? ' · 点击进入拆解' : ''}` : '';
    canvas.style.cursor = n ? 'pointer' : 'grab';
  }
}
function onPointerUp(e){
  if(dragNode){
    const moved = lastPt && Math.hypot(e.clientX - lastPt.x, e.clientY - lastPt.y) < 4;
    if(moved && dragNode.type === 'device') router.push('/device/' + dragNode.device);
    dragNode = null;
  }
  panning = false; panStart = null;
}
function onWheel(e){
  e.preventDefault();
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
.gb-chip{
  display:flex; align-items:center; gap:5px; padding:4px 9px; border-radius:999px;
  border:1px solid rgba(120,150,180,.25); background:rgba(7,13,20,.5);
  color:var(--txt-2); font-size:10px; letter-spacing:.1em; cursor:pointer; font-family:var(--mono);
}
.gb-chip i{ width:7px; height:7px; border-radius:50%; }
.gb-chip.off{ opacity:.35; }
#graphHint{
  position:absolute; left:50%; bottom:22px; transform:translateX(-50%); z-index:5;
  padding:6px 14px; border-radius:999px; background:rgba(4,10,16,.9);
  border:1px solid color-mix(in srgb, var(--acc) 40%, transparent);
  color:var(--acc); font-family:var(--mono); font-size:11px; letter-spacing:.1em;
  pointer-events:none; white-space:nowrap;
}
@media (max-width:700px){
  #graphBar{ left:10px; right:10px; flex-wrap:wrap; }
  .gb-title h2{ font-size:11px; }
  .gb-filters{ width:100%; justify-content:flex-start; }
}
</style>
