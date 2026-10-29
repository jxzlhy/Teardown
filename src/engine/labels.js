/* =============================================================
   标签系统 · 3.0（engine/labels.js）
   每个标签 = 锚点圆点 → SVG 折线（45° 拐角 + 水平段）→ 标签框。
   - Y 轴分箱避让：同侧标签按桶高上下推开，消灭叠字
   - 分级显示：labelsMode = auto（爆炸时只显示外侧 1/3）/ all / off
   引擎每帧调 update()；本模块不知道 Vue 的存在。
============================================================= */
import * as THREE from 'three';

const OFFSET_X = 56;      // 标签框相对锚点的水平偏移
const OFFSET_Y = 72;      // 垂直偏移（框在锚点上方）
const BUCKET = 30;        // 避让桶高 ≈ 标签框高
const EDGE = 8;           // 屏幕边缘留白

const _v = new THREE.Vector3();

export function createLabelSystem(root, { onHover, onSelect } = {}){
  const NS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('class', 'label-svg');
  root.appendChild(svg);

  let parts = [];          // 引擎部件引用 { data, idx, anchor, worldOffset }
  let items = [];          // 本模块的每件状态 { p, el, path, dot, side, boxW, boxH }

  function build(engineParts){
    root.querySelectorAll('.p-label').forEach(el => el.remove());
    svg.innerHTML = '';
    parts = engineParts;
    items = parts.map(p => {
      const el = document.createElement('div');
      el.className = 'p-label';
      el.tabIndex = 0;
      el.setAttribute('role', 'button');
      el.setAttribute('aria-label', `${p.data.zh}${p.data.en ? ' · ' + p.data.en : ''}`);
      el.innerHTML = `<span class="pl-idx">${String(p.idx + 1).padStart(2, '0')}</span><span class="pl-name">${p.data.zh}</span>`;
      if(onHover){
        el.addEventListener('pointerenter', () => onHover(p.data.id));
        el.addEventListener('pointerleave', () => onHover(null));
      }
      if(onSelect){
        el.addEventListener('click', e => { e.stopPropagation(); onSelect(p.data.id); });
        el.addEventListener('keydown', e => {
          if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); e.stopPropagation(); onSelect(p.data.id); }
        });
      }
      root.appendChild(el);

      const path = document.createElementNS(NS, 'path');
      path.setAttribute('class', 'll-line');
      const dot = document.createElementNS(NS, 'circle');
      dot.setAttribute('class', 'll-dot');
      dot.setAttribute('r', '2.6');
      svg.appendChild(path); svg.appendChild(dot);
      return { p, el, path, dot, side: 1, boxW: 0, boxH: 0 };
    });
  }

  /* 该件这一帧是否该显示（分级规则） */
  function wanted(it, opt){
    const id = it.p.data.id;
    const isSel = id === opt.selected, isHot = id === opt.hovered;
    if(opt.labelsMode === 'off') return isSel;          // off 只保留选中件
    if(isSel || isHot) return true;
    if(opt.labelsMode === 'all') return true;
    /* auto：整机态隐藏；爆炸后外侧 1/3 常显 */
    if(opt.explode <= 0.35) return false;
    return opt.outerThird.has(id);
  }

  function update(opt){
    const W = opt.W, H = opt.H;
    const visible = [];

    for(const it of items){
      it.show = wanted(it, opt);
      if(!it.show){ it.el.classList.remove('on'); it.el.style.display = 'none'; it.path.style.display = 'none'; it.dot.style.display = 'none'; continue; }
      it.p.anchor.getWorldPosition(_v);
      _v.project(opt.camera);
      if(!Number.isFinite(_v.x) || !Number.isFinite(_v.y) || _v.z > 1){
        it.el.style.display = 'none'; it.path.style.display = 'none'; it.dot.style.display = 'none';
        it.show = false; continue;
      }
      const ax = (_v.x * 0.5 + 0.5) * W;
      const ay = (-_v.y * 0.5 + 0.5) * H;
      it.ax = ax; it.ay = ay;
      if(!it.boxW){ it.boxW = it.el.offsetWidth || 90; it.boxH = it.el.offsetHeight || 24; }
      /* 左右交替出发，靠屏幕边自动反弹 */
      it.side = it.p.idx % 2 === 0 ? 1 : -1;
      if(ax > W - (OFFSET_X + it.boxW + EDGE + 24)) it.side = -1;
      else if(ax < OFFSET_X + it.boxW + EDGE + 24) it.side = 1;
      visible.push(it);
    }

    /* Y 轴分箱避让：同侧按锚点 y 排序后依次上推（外侧部件优先占位） */
    for(const side of [1, -1]){
      const list = visible.filter(it => it.side === side)
        .sort((a, b) => (a.p.rank - b.p.rank) || (a.ay - b.ay));
      let lastY = -Infinity;
      for(const it of list){
        let boxY = it.ay - OFFSET_Y;
        if(boxY > lastY - BUCKET) boxY = lastY - BUCKET;
        if(boxY < EDGE) boxY = Math.min(it.ay + 18, H - it.boxH - EDGE);  // 顶部溢出改放锚点下方
        it.boxY = boxY;
        lastY = boxY;
        it.boxX = it.side > 0 ? it.ax + OFFSET_X : it.ax - OFFSET_X - it.boxW;
        if(it.boxX < EDGE) it.boxX = EDGE;
        if(it.boxX + it.boxW > W - EDGE) it.boxX = W - EDGE - it.boxW;
      }
    }

    for(const it of visible){
      const el = it.el;
      el.style.display = '';
      el.style.transform = `translate(${(it.boxX).toFixed(1)}px,${(it.boxY).toFixed(1)}px)`;
      const sel = it.p.data.id === opt.selected;
      const hot = sel || it.p.data.id === opt.hovered;
      el.classList.toggle('on', true);
      el.classList.toggle('hot', hot);

      /* 引线：锚点 → 45° 拐角 → 标签框近侧边中点 */
      const by = it.boxY + it.boxH / 2;
      const bx = it.side > 0 ? it.boxX : it.boxX + it.boxW;
      const dx = bx - it.ax, dy = by - it.ay;
      let d;
      if(Math.abs(dy) <= Math.abs(dx)){
        const ex = it.ax + Math.sign(dx || 1) * Math.abs(dy);
        d = `M${it.ax.toFixed(1)},${it.ay.toFixed(1)}L${ex.toFixed(1)},${by.toFixed(1)}L${bx.toFixed(1)},${by.toFixed(1)}`;
      }else{
        const ey = it.ay + Math.sign(dy || 1) * Math.abs(dx);
        d = `M${it.ax.toFixed(1)},${it.ay.toFixed(1)}L${bx.toFixed(1)},${ey.toFixed(1)}L${bx.toFixed(1)},${by.toFixed(1)}`;
      }
      it.path.style.display = '';
      it.path.setAttribute('d', d);
      it.path.classList.toggle('sel', sel);
      it.dot.style.display = '';
      it.dot.setAttribute('cx', it.ax.toFixed(1));
      it.dot.setAttribute('cy', it.ay.toFixed(1));
    }

    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  }

  function dispose(){
    svg.remove();
    items.forEach(it => it.el.remove());
    parts = []; items = [];
  }

  return { build, update, dispose, svg };
}
