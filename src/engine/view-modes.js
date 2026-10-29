/* =============================================================
   查看模式状态机 · 3.0（engine/view-modes.js）
   四态互斥：null(整机) / 'xray'（外壳半透明） / 'isolate'（部件隔离） / 'clip'（剖切）
   - 进入时快照材质属性，退出精确还原（透明度/depthWrite/阴影/裁剪面）
   - 隔离的非目标件透明度逐帧 lerp 到 0.06
   - 剖切为无封盖实现（stencil 封盖降级，见 UPGRADE-3.0 §9 风险表）
   引擎是唯一调用方；本模块不知道 Vue 的存在。
============================================================= */
import * as THREE from 'three';

/* 纯程序化设备（无 GLB）推断内构件的关键词兜底；有 realPartIds 时优先用它 */
const INTERNAL_KEYS = ['battery','mainboard','board','thermal','fan','speaker','taptic','coil',
  'sim','haptic','sensor','driver','flex','screw','chip','gear','piston','crank','shaft',
  'valve','cam','rod','spring','escapement','balance','train','combustion','cylinder'];
/* 光学件不做半透明：镜筒/传感器被“雾化”后既挡视线又容易叠 Bloom 过曝 */
const NON_SHELL_KEYS = ['lens','sensor','cmos','optic'];

export function createViewModes({ renderer, getParts, getDeviceGroup, getDevice, getBobY, onChange }){
  const clipPlane = new THREE.Plane(new THREE.Vector3(0, -1, 0), 0);
  let mode = null;
  let isolateId = null;
  let clipT = 0.62;                       // 剖切高度（0..1，1=顶 0=底），缺省切到上 62%
  /* 快照：material → 属性快照；mesh → castShadow 快照（每次进入模式重建，退出还原） */
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
      clippingPlanes: m.clippingPlanes, clipShadows: m.clipShadows,
    });
  }
  function snapMesh(o){
    if(!meshSnap.has(o)) meshSnap.set(o, o.castShadow);
  }
  function restoreAll(){
    for(const [m, s] of matSnap){
      m.transparent = s.transparent; m.opacity = s.opacity; m.depthWrite = s.depthWrite;
      m.clippingPlanes = s.clippingPlanes; m.clipShadows = s.clipShadows;
    }
    for(const [o, cs] of meshSnap) o.castShadow = cs;
    matSnap = new Map(); meshSnap = new Map(); isoLerp.clear();
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
    }
    updateClipPlane();
  }
  function updateClipPlane(){
    const bb = state.bbox || { min: -4, max: 4 };
    const y = bb.max + (bb.min - bb.max) * clipT;   // clipT=1 → 顶，0 → 底
    /* 设备整体有 ±0.1 呼吸浮动，剖切面跟着抵消，避免切口随呼吸上下漂 */
    clipPlane.constant = y - (getBobY ? getBobY() : 0);
  }

  const state = { get mode(){ return mode; }, get isolateId(){ return isolateId; },
    get clipT(){ return clipT; }, bbox: null };

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

  return { setMode, setClipT, tick, state, dispose };
}
