/* =============================================================
   查看模式状态机 · 3.0（engine/view-modes.js）
   四态互斥：null(整机) / 'xray'（外壳半透明） / 'isolate'（部件隔离） / 'clip'（剖切）
   - 进入时快照材质属性，退出精确还原（透明度/depthWrite/阴影/裁剪面）
   - 隔离的非目标件透明度逐帧 lerp 到 0.06
   - 剖切封盖：composer RT 带 stencilBuffer 时为 stencil 实体封盖，否则回退指示板
   引擎是唯一调用方；本模块不知道 Vue 的存在。
============================================================= */
import * as THREE from 'three';

/* 纯程序化设备（无 GLB）推断内构件的关键词兜底；有 realPartIds 时优先用它 */
const INTERNAL_KEYS = ['battery','mainboard','board','thermal','fan','speaker','taptic','coil',
  'sim','haptic','sensor','driver','flex','screw','chip','gear','piston','crank','shaft',
  'valve','cam','rod','spring','escapement','balance','train','combustion','cylinder'];
/* 光学件不做半透明：镜筒/传感器被“雾化”后既挡视线又容易叠 Bloom 过曝 */
const NON_SHELL_KEYS = ['lens','sensor','cmos','optic'];

export function createViewModes({ renderer, getParts, getDeviceGroup, getDevice, getBobY, onChange, useStencilCap = false }){
  const clipPlane = new THREE.Plane(new THREE.Vector3(0, -1, 0), 0);
  let mode = null;
  let isolateId = null;
  let clipT = 0.62;                       // 剖切高度（0..1，1=顶 0=底），缺省切到上 62%
  /* 快照：material → 属性快照；mesh → castShadow/renderOrder 快照（每次进入模式重建，退出还原） */
  let matSnap = new Map();
  let meshSnap = new Map();
  const isoLerp = new Map();              // material → { cur, target }（隔离淡出用）

  function eachMesh(fn){
    for(const p of getParts()){
      p.group.traverse(o => { if(o.isMesh) fn(o, p); });
    }
  }
  function collectMats(){
    const set = new Set();
    eachMesh(o => (Array.isArray(o.material) ? o.material : [o.material]).forEach(m => m && set.add(m)));
    return set;
  }
  function shellIds(){
    const d = getDevice();
    if(!d) return [];
    const present = new Set(getParts().map(p => p.data.id));
    if(d.xrayShellIds && d.xrayShellIds.length) return d.xrayShellIds.filter(id => present.has(id));
    if(d.realPartIds && d.realPartIds.length){
      const ids = d.realPartIds.filter(id => present.has(id) &&
        !NON_SHELL_KEYS.some(k => id.toLowerCase().includes(k)));
      if(ids.length) return ids;
    }
    /* 兜底：非关键词部件视为外壳 */
    return [...present].filter(id =>
      !INTERNAL_KEYS.some(k => id.toLowerCase().includes(k)));
  }

  function snapMaterial(m){
    if(!matSnap.has(m)) matSnap.set(m, {
      transparent: m.transparent, opacity: m.opacity, depthWrite: m.depthWrite,
      clippingPlanes: m.clippingPlanes, clipShadows: m.clipShadows, side: m.side,
    });
  }
  function snapMesh(o){
    if(!meshSnap.has(o)) meshSnap.set(o, { castShadow: o.castShadow, renderOrder: o.renderOrder });
  }
  /* 剖切封盖。stencil 方案（engine 侧 composer RT 带 stencilBuffer 时启用）：
     背面 IncrementWrap / 正面 DecrementWrap 奇偶计数求"截面区域"掩码，半透明
     剖面玻璃仅在 stencil≠0 处绘制（three 官方 webgl_clipping_stencil 改款）。
     三个实机修正：
     ① 求掩码的裁剪面比可视剖切面低 δ——宽大水平面被剖切面斜切出的近共面碎片会
        污染计数（逐像素斑驳），下移 δ 避开碎片带；
     ② 盖板本体不挂 clippingPlanes（否则微量抬升后自裁）；
     ③ 盖板半透明不写深度——实机拓扑非水密时掩码可能灌满内腔，实心盖板会遮挡
        内部组件；半透明形态对全馆混合拓扑安全且内腔始终可见。 */
  const stencilClipPlane = new THREE.Plane(new THREE.Vector3(0, -1, 0), 0);
  let stencilKids = [];                  // { parent, back, front } —— 挂在源网格下的 stencil 求掩码子网格
  let stencilMats = null;                // 两片共享 MeshBasicMaterial（colorWrite:false）
  let capSolid = null;                   // stencil 实体盖板
  let capHidden = false;                 // 特写离屏捕获期间隐藏（离屏 RT 无 stencil）
  let capMesh = null;
  function ensureCapMesh(bb){
    const d = getDevice();
    const accent = (d && d.accent) || '#45e0ff';
    if(!capMesh){
      capMesh = new THREE.Mesh(
        new THREE.PlaneGeometry(1, 1),
        new THREE.MeshBasicMaterial({
          color: new THREE.Color(accent), transparent: true, opacity: 0.09,
          side: THREE.DoubleSide, depthWrite: false,
        }));
      capMesh.rotation.x = -Math.PI / 2;
      capMesh.renderOrder = 5;
    } else {
      capMesh.material.color.set(accent);
    }
    const sx = (bb.max.x - bb.min.x) * 1.02 + 0.12;
    const sz = (bb.max.z - bb.min.z) * 1.02 + 0.12;
    capMesh.scale.set(sx, sz, 1);
    capMesh.position.set((bb.min.x + bb.max.x) / 2, 0, (bb.min.z + bb.max.z) / 2);
    if(!capMesh.parent) getDeviceGroup().parent.add(capMesh);
    capMesh.visible = true;
  }
  function removeCapMesh(){
    if(!capMesh) return;
    if(capMesh.parent) capMesh.parent.remove(capMesh);
    capMesh.geometry.dispose();
    capMesh.material.dispose();
    capMesh = null;
  }
  function ensureStencilMats(){
    if(stencilMats) return;
    const base = { colorWrite:false, depthWrite:false, depthTest:false,
      stencilWrite:true, stencilFunc:THREE.AlwaysStencilFunc, clippingPlanes:[stencilClipPlane] };
    stencilMats = {
      back: new THREE.MeshBasicMaterial({ ...base, side:THREE.BackSide,
        stencilFail:THREE.IncrementWrapStencilOp, stencilZFail:THREE.IncrementWrapStencilOp, stencilZPass:THREE.IncrementWrapStencilOp }),
      front: new THREE.MeshBasicMaterial({ ...base, side:THREE.FrontSide,
        stencilFail:THREE.DecrementWrapStencilOp, stencilZFail:THREE.DecrementWrapStencilOp, stencilZPass:THREE.DecrementWrapStencilOp }),
    };
  }
  function ensureStencilCap(bb){
    /* 掩码统计全部部件的奇偶穿越（非水密模型的开口由相邻部件的封闭盒抵消，
       如壳底开口由电池/背板封闭）；宽大水平面被剖切面斜切出的碎片带已由
       求掩码裁剪面下移 δ 排除。仅统计外壳会因壳体自身开口而灌满内腔 */
    ensureStencilMats();
    const meshes = [];
    eachMesh((o, p) => meshes.push(o));
    for(const o of meshes){
      /* 挂为源网格子节点：继承爆炸/呼吸全部变换，无需逐帧同步矩阵；
         geometry 共享不额外占显存，随 removeStencilCap 一并摘除 */
      const back = new THREE.Mesh(o.geometry, stencilMats.back);
      const front = new THREE.Mesh(o.geometry, stencilMats.front);
      back.renderOrder = front.renderOrder = 1;
      o.add(back, front);
      stencilKids.push({ parent:o, back, front });
    }
    const d = getDevice();
    const accent = (d && d.accent) || '#45e0ff';
    if(!capSolid){
      /* 剖面玻璃：掩码约束的半透明截面版（不写深度，内部组件始终可见）。
         实机模型拓扑普遍非水密，奇偶掩码无法保证逐模型"只盖实体材料"，
         实心盖板会遮挡内腔——半透明是全馆 103 台混合拓扑下的安全形态，
         相比旧的全方形指示板，掩码让截面版严格贴合剖切轮廓 */
      capSolid = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshStandardMaterial({
        color:new THREE.Color(accent), emissive:new THREE.Color(accent), emissiveIntensity:0.08,
        metalness:0.1, roughness:0.85, transparent:true, opacity:0.30, depthWrite:false,
        stencilWrite:true, stencilRef:0, stencilFunc:THREE.NotEqualStencilFunc,
        stencilFail:THREE.ReplaceStencilOp, stencilZFail:THREE.ReplaceStencilOp, stencilZPass:THREE.ReplaceStencilOp,
      }));
      capSolid.rotation.x = -Math.PI / 2;
      capSolid.renderOrder = 1.1;
      capSolid.onAfterRender = r => r.clearStencil();
    } else {
      capSolid.material.color.set(accent);
      capSolid.material.emissive.set(accent);
    }
    const sx = (bb.max.x - bb.min.x) * 1.02 + 0.12;
    const sz = (bb.max.z - bb.min.z) * 1.02 + 0.12;
    capSolid.scale.set(sx, sz, 1);
    capSolid.position.set((bb.min.x + bb.max.x) / 2, 0, (bb.min.z + bb.max.z) / 2);
    if(!capSolid.parent) getDeviceGroup().parent.add(capSolid);
    capSolid.visible = !capHidden;
  }
  function removeStencilCap(){
    for(const k of stencilKids){ k.parent.remove(k.back); k.parent.remove(k.front); }
    stencilKids = [];
    if(stencilMats){ stencilMats.back.dispose(); stencilMats.front.dispose(); stencilMats = null; }
    if(capSolid){
      if(capSolid.parent) capSolid.parent.remove(capSolid);
      capSolid.geometry.dispose();
      capSolid.material.dispose();
      capSolid = null;
    }
  }
  /* 特写离屏捕获（RT 无 stencil buffer）期间隐藏盖板，NotEqual 测试会整面误绘 */
  function setCapHidden(v){
    capHidden = v;
    if(capSolid) capSolid.visible = !v;
  }
  function restoreAll(){
    for(const [m, s] of matSnap){
      m.transparent = s.transparent; m.opacity = s.opacity; m.depthWrite = s.depthWrite;
      m.clippingPlanes = s.clippingPlanes; m.clipShadows = s.clipShadows; m.side = s.side;
    }
    for(const [o, s] of meshSnap){ o.castShadow = s.castShadow; o.renderOrder = s.renderOrder; }
    matSnap = new Map(); meshSnap = new Map(); isoLerp.clear();
    removeCapMesh();
    removeStencilCap();
    renderer.localClippingEnabled = false;
  }

  function applyXray(){
    const shells = new Set(shellIds());
    eachMesh((o, p) => {
      if(!shells.has(p.data.id)) return;
      snapMesh(o); o.castShadow = false;
      (Array.isArray(o.material) ? o.material : [o.material]).forEach(m => {
        if(!m) return;
        snapMaterial(m);
        m.transparent = true; m.opacity = 0.16; m.depthWrite = false;
      });
    });
  }

  function applyIsolate(id){
    isolateId = id;
    eachMesh((o, p) => {
      const isTarget = p.data.id === id;
      snapMesh(o); o.castShadow = isTarget;
      (Array.isArray(o.material) ? o.material : [o.material]).forEach(m => {
        if(!m) return;
        snapMaterial(m);
        const cur = isoLerp.get(m) || { cur: m.opacity, target: m.opacity };
        cur.target = isTarget ? (matSnap.get(m)?.opacity ?? m.opacity) : 0.06;
        isoLerp.set(m, cur);
        m.transparent = true;
        if(!isTarget) m.depthWrite = false;
      });
    });
  }

  function applyClip(){
    renderer.localClippingEnabled = true;
    const bb = new THREE.Box3();
    getDeviceGroup().traverse(o => { if(o.isMesh) bb.expandByObject(o); });
    if(!bb.isEmpty()) state.bbox = { min: bb.min.y, max: bb.max.y };
    for(const m of collectMats()){
      snapMaterial(m);
      m.clippingPlanes = [clipPlane];
      m.clipShadows = true;
      m.side = THREE.DoubleSide;   // 切腔内壁可见（背面渲染），避免"切空看穿"
    }
    /* 设备网格统一后绘：盖板（renderOrder 1.1）先写深度，腔内壁被遮挡成实体截面 */
    eachMesh(o => { snapMesh(o); o.renderOrder = 6; });
    if(!bb.isEmpty()){
      if(useStencilCap) ensureStencilCap(bb);
      else ensureCapMesh(bb);
    }
    updateClipPlane();
  }
  function updateClipPlane(){
    const bb = state.bbox || { min: -4, max: 4 };
    const y = bb.max + (bb.min - bb.max) * clipT;   // clipT=1 → 顶，0 → 底
    /* 设备整体有 ±0.1 呼吸浮动，剖切面跟着抵消，避免切口随呼吸上下漂 */
    /* 可视剖切面上移 ε：恰好擦过水平面时，被斜切的近共面碎片会污染 stencil
       计数并在盖板上叠绘噪点——上移 ε 让水平面完整保留在切面之下；
       求掩码的裁剪面再下移 δ，双保险避开碎片带 */
    const h = state.bbox ? (state.bbox.max - state.bbox.min) : 2;
    const eps = h * 0.0015, delta = h * 0.009;
    clipPlane.constant = y + eps - (getBobY ? getBobY() : 0);
    stencilClipPlane.constant = y - delta - (getBobY ? getBobY() : 0);
    if(capMesh) capMesh.position.y = y - (getBobY ? getBobY() : 0);
    if(capSolid) capSolid.position.y = y + eps - (getBobY ? getBobY() : 0);
  }

  const state = { get mode(){ return mode; }, get isolateId(){ return isolateId; },
    get clipT(){ return clipT; },
    get capKind(){ return capSolid ? 'stencil' : (capMesh ? 'indicator' : null); },
    bbox: null };

  /* mode: null|'xray'|'isolate'|'clip'，隔离需带 partId */
  function setMode(next, partId = null){
    if(mode === 'isolate' && next === 'isolate' && partId && partId !== isolateId){
      applyIsolate(partId);                      // 隔离中切换目标件：直接换
      onChange && onChange();
      return true;
    }
    restoreAll();
    mode = next;
    if(mode === 'xray') applyXray();
    else if(mode === 'isolate' && partId) applyIsolate(partId);
    else if(mode === 'clip') applyClip();
    else mode = null;
    onChange && onChange();
    return mode === next;
  }

  function setClipT(t){
    clipT = Math.min(1, Math.max(0, t));
    if(mode === 'clip') updateClipPlane();
    onChange && onChange();
  }

  /* 隔离淡出的逐帧 lerp（引擎主循环调用） */
  function tick(dt){
    if(!isoLerp.size) return;
    const k = Math.min(dt * 7, 1);
    for(const [m, s] of isoLerp){
      s.cur += (s.target - s.cur) * k;
      m.opacity = s.cur;
    }
  }

  function dispose(){ restoreAll(); mode = null; }

  return { setMode, setClipT, tick, state, dispose, setCapHidden };
}
