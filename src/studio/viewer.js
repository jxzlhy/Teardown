/* 创作工作室 · 预览视口（V5.0.0 CREATE FOUNDATION）
   轻量 three 视口：导入模型取景/环视/点选高亮/网格地面，完整资源释放。
   渲染参数与主引擎一致（ACES 1.12、pixelRatio≤2、RoomEnvironment PMREM），
   保证「工作台里看到的」与「馆内展示的」材质表现同口径。 */

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

const REDUCED = typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;

export function createViewer(canvas) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.12;

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

  const camera = new THREE.PerspectiveCamera(42, 1, 0.01, 1000);
  camera.position.set(3, 2, 4);

  const key = new THREE.DirectionalLight(0xffffff, 1.6);
  key.position.set(3, 6, 4);
  scene.add(key, new THREE.HemisphereLight(0xdfe8ff, 0x30281c, 0.5));

  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;

  /* 网格地面颜色随日/夜厅 token 走（读不到再退中性灰） */
  const css = getComputedStyle(document.documentElement);
  const v = (n, fb) => (css.getPropertyValue(n).trim() || fb);
  const acc = new THREE.Color(v('--acc', '#c4a460'));
  const line = new THREE.Color(v('--txt-3', '#777777')).multiplyScalar(0.5);

  let grid = null;
  let model = null;
  let lastBbox = null;
  let highlight = null;          // { meshes, mats:[{m, emissive, emissiveIntensity}] }
  let pulseT = 0;
  let disposed = false;

  const ray = new THREE.Raycaster();
  const ptr = new THREE.Vector2();
  let onPick = null;             // (path|null) => void
  let downXY = null;

  function frameTo(bbox) {
    const size = bbox.getSize(new THREE.Vector3());
    const center = bbox.getCenter(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z) || 1;
    const dist = (maxDim / 2) / Math.tan((camera.fov * Math.PI / 360)) * 1.5;
    const dir = new THREE.Vector3(1, 0.55, 1).normalize();
    camera.position.copy(center).addScaledVector(dir, dist);
    camera.near = maxDim / 500;
    camera.far = maxDim * 60;
    camera.updateProjectionMatrix();
    controls.target.copy(center);
    controls.update();
    return { maxDim, center };
  }

  function rebuildGrid(bbox, maxDim) {
    if (grid) { scene.remove(grid); grid.geometry.dispose(); grid.material.dispose(); }
    const span = Math.pow(10, Math.ceil(Math.log10(maxDim * 2)));
    grid = new THREE.GridHelper(span, 20, acc.clone().multiplyScalar(0.55), line);
    grid.position.y = bbox.min.y;
    grid.material.transparent = true;
    grid.material.opacity = 0.5;
    scene.add(grid);
  }

  function clearHighlight() {
    if (!highlight) return;
    for (const h of highlight.mats) { h.m.emissive.copy(h.emissive); h.m.emissiveIntensity = h.intensity; }
    highlight = null;
  }

  function setHighlight(mesh, path) {
    clearHighlight();
    if (!mesh) { if (onPick) onPick(null); return; }
    const mats = [];
    const list = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    for (const m of list) {
      if (!m || !m.emissive) continue;
      mats.push({ m, emissive: m.emissive.clone(), intensity: m.emissiveIntensity });
      m.emissive.copy(acc);
      m.emissiveIntensity = REDUCED ? 0.35 : 0.85;
    }
    highlight = { mats, path };
    pulseT = 0;
    if (onPick) onPick(path);
  }

  function setModel(obj) {
    clearHighlight();
    if (model) { scene.remove(model); disposeTree(model); }
    model = obj;
    scene.add(model);
    model.updateMatrixWorld(true);
    const bbox = new THREE.Box3().setFromObject(model);
    if (!isFinite(bbox.min.x)) { // 空几何兜底：给一个可用的默认取景
      bbox.setFromCenterAndSize(new THREE.Vector3(), new THREE.Vector3(2, 2, 2));
    }
    const { maxDim } = frameTo(bbox);
    rebuildGrid(bbox, maxDim);
    lastBbox = bbox;
  }

  function reframe() {           // 视角复位：不重建网格地面，仅重新取景
    if (lastBbox) frameTo(lastBbox);
  }

  function disposeTree(root) {
    root.traverse((o) => {
      if (o.geometry) o.geometry.dispose();
      const mats = Array.isArray(o.material) ? o.material : (o.material ? [o.material] : []);
      for (const m of mats) {
        for (const k in m) {
          const t = m[k];
          if (t && t.isTexture) t.dispose();
        }
        m.dispose();
      }
    });
  }

  function pickAt(ev) {
    if (!model) return;
    const r = canvas.getBoundingClientRect();
    ptr.x = ((ev.clientX - r.left) / r.width) * 2 - 1;
    ptr.y = -((ev.clientY - r.top) / r.height) * 2 + 1;
    ray.setFromCamera(ptr, camera);
    const hit = ray.intersectObject(model, true)[0];
    if (hit) {
      setHighlight(hit.object, hit.object.userData.__studioPath || null);
    } else {
      clearHighlight();
      if (onPick) onPick(null);
    }
  }

  /* —— 事件（pointerdown/up 距离判别，避免拖拽旋转误触发点选） —— */
  canvas.addEventListener('pointerdown', (e) => { downXY = [e.clientX, e.clientY]; });
  canvas.addEventListener('pointerup', (e) => {
    if (!downXY) return;
    const dx = e.clientX - downXY[0], dy = e.clientY - downXY[1];
    downXY = null;
    if (dx * dx + dy * dy > 25) return;
    pickAt(e);
  });

  const ro = new ResizeObserver(() => {
    const w = canvas.clientWidth || 1, h = canvas.clientHeight || 1;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  });
  ro.observe(canvas);

  let raf = 0;
  const clock = new THREE.Clock();
  (function tick() {
    if (disposed) return;
    raf = requestAnimationFrame(tick);
    if (highlight && !REDUCED) { // 选中脉冲（reduced-motion 下为静态高亮）
      pulseT += clock.getDelta();
      const s = 0.55 + 0.3 * Math.sin(pulseT * 6);
      for (const h of highlight.mats) h.m.emissiveIntensity = s;
    }
    controls.update();
    renderer.render(scene, camera);
  })();

  return {
    setModel,
    reframe,
    setAutoRotate: (v) => { controls.autoRotate = v; controls.autoRotateSpeed = 1.4; },
    setHighlight,               // (mesh|null, path) — 层级树点选回写视口
    set onPick(fn) { onPick = fn; },
    get renderer() { return renderer; },
    dispose() {
      disposed = true;
      cancelAnimationFrame(raf);
      ro.disconnect();
      controls.dispose();
      clearHighlight();
      if (model) { scene.remove(model); disposeTree(model); model = null; }
      if (grid) { scene.remove(grid); grid.geometry.dispose(); grid.material.dispose(); grid = null; }
      pmrem.dispose();
      scene.environment = null;
      renderer.dispose();
    },
  };
}
