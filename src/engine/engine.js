/* =============================================================
   Teardown Engine — 设备无关的 3D 拆解引擎（纯 Vanilla ES Module）
   Vue 壳通过 createEngine(canvas, labelsRoot, hooks) 获得实例；
   引擎不知道任何 UI 框架的存在。
   3.0：OutlinePass 描边 · 开场装配演出 · flyToPart 镜头飞行 · Tour 导览 ·
        径向爆炸布局 · X光/隔离/剖切（view-modes.js） · SVG 引线标签（labels.js）
============================================================= */
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { isCommunityModel } from '../lib/model-class.js';
import { OutlinePass } from 'three/addons/postprocessing/OutlinePass.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { matScreen } from './materials.js';
import { fetchGlb } from './glbCache.js';
import { assetUrl } from '../lib/url.js';
import { createLabelSystem } from './labels.js';
import { createViewModes } from './view-modes.js';
import { computeBoundsTree, disposeBoundsTree, acceleratedRaycast } from 'three-mesh-bvh';

/* BVH 加速拾取/测量：全局换装 Mesh.raycast；boundsTree 按需构建（测量工具首次激活时），
   未构建的几何自动回退标准 raycast，默认装载路径零开销 */
THREE.Mesh.prototype.raycast = acceleratedRaycast;
THREE.BufferGeometry.prototype.computeBoundsTree = computeBoundsTree;
THREE.BufferGeometry.prototype.disposeBoundsTree = disposeBoundsTree;

window.__THREE = THREE;   // 调试用：运行时包围盒测量

const clamp = (v,a,b)=>Math.min(b,Math.max(a,v));
const easeIO = t => t<.5 ? 4*t*t*t : 1-Math.pow(-2*t+2,3)/2;
const easeO  = t => 1-Math.pow(1-t,3);

const CAM_HOME_BASE    = new THREE.Vector3(10.5, 6.0, 13.5);
const CAM_EXPLODE_BASE = new THREE.Vector3(13.5, 7.5, 17.5);
let CAM_HOME = CAM_HOME_BASE.clone();
let CAM_EXPLODE = CAM_EXPLODE_BASE.clone();
const CAM_TARGET  = new THREE.Vector3(0, 0.4, 0);
const ACCENT = new THREE.Color(0x45e0ff);
const _color = new THREE.Color();

/* OutlinePass 仅桌面 + 中高画质启用（移动端自动跳过，见 UPGRADE-3.0 §7） */
const OUTLINE_OK = typeof matchMedia !== 'undefined'
  && matchMedia('(min-width: 861px)').matches
  && (navigator.hardwareConcurrency || 8) > 4;

/* Draco 解码器引擎级单例：每次 new DRACOLoader 都会创建 worker 池，切换设备必须复用 */
let _dracoLoader = null;
function getDracoLoader(){
  if(!_dracoLoader){
    _dracoLoader = new DRACOLoader();
    /* dev：Vite 直服 node_modules；build：自定义插件拷贝到 /assets/draco/ */
    _dracoLoader.setDecoderPath(import.meta.env.DEV
      ? '/node_modules/three/examples/jsm/libs/draco/'
      : assetUrl('/assets/draco/'));
  }
  return _dracoLoader;
}

export function createEngine(canvas, labelsRoot, hooks = {}){
  const onChange = hooks.onChange || (()=>{});
  const reducedMotion = !!hooks.reducedMotion;

  /* ---------- 渲染器 / 场景 / 相机 ---------- */
  const renderer = new THREE.WebGLRenderer({ canvas, antialias:true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setSize(innerWidth, innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.12;

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x04070c, 0.02);

  { /* 背景径向渐变 */
    const c = document.createElement('canvas'); c.width = c.height = 1024;
    const g = c.getContext('2d');
    const rg = g.createRadialGradient(512, 420, 60, 512, 512, 720);
    rg.addColorStop(0, '#0e1c2b'); rg.addColorStop(.55, '#071019'); rg.addColorStop(1, '#03050a');
    g.fillStyle = rg; g.fillRect(0,0,1024,1024);
    const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace;
    scene.background = tex;
  }

  const camera = new THREE.PerspectiveCamera(38, innerWidth/innerHeight, 0.1, 200);
  camera.position.set(21, 13, 27);

  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;
  controls.dampingFactor = 0.06;
  controls.rotateSpeed = 0.9;
  controls.minDistance = 6;
  controls.maxDistance = 36;
  controls.maxPolarAngle = Math.PI * 0.62;
  controls.target.copy(CAM_TARGET);
  controls.autoRotate = false;
  controls.autoRotateSpeed = 0.7;

  /* ---------- 后期：OutlinePass（选中/悬停描边）+ 辉光 ---------- */
  /* 剖切 stencil 封盖要求渲染目标带 stencil buffer（composer 默认 RT 没有）：
     自建 HalfFloat+stencil RT 传入，renderTarget2 由 composer 克隆继承同配置 */
  const composerRT = new THREE.WebGLRenderTarget(innerWidth, innerHeight,
    { type: THREE.HalfFloatType, stencilBuffer: true });
  const composer = new EffectComposer(renderer, composerRT);
  composer.setSize(innerWidth, innerHeight);   // 让 composer 记住 CSS 口径（乘自身 pixelRatio）
  composer.addPass(new RenderPass(scene, camera));
  let outlineSel = null, outlineHover = null, outlineOn = false;
  if(OUTLINE_OK && hooks.adaptive !== false){
    outlineSel = new OutlinePass(new THREE.Vector2(innerWidth, innerHeight), scene, camera);
    outlineSel.edgeStrength = 3.2; outlineSel.edgeGlow = 0.35; outlineSel.edgeThickness = 1.6;
    outlineSel.visibleEdgeColor.set(0x45e0ff); outlineSel.hiddenEdgeColor.set(0x0a1622);
    outlineHover = new OutlinePass(new THREE.Vector2(innerWidth, innerHeight), scene, camera);
    outlineHover.edgeStrength = 1.6; outlineHover.edgeGlow = 0.2; outlineHover.edgeThickness = 1.1;
    outlineHover.visibleEdgeColor.set(0x9fd4e6); outlineHover.hiddenEdgeColor.set(0x0a1622);
    composer.insertPass(outlineSel, 1);
    composer.insertPass(outlineHover, 2);
    outlineOn = true;
  }
  const bloom = new UnrealBloomPass(new THREE.Vector2(innerWidth, innerHeight), 0.42, 0.7, 0.85);
  composer.addPass(bloom);
  composer.addPass(new OutputPass());

  /* ---------- 自适应画质：帧率不达标时逐级降档（只降不升，避免振荡）
     L2 满配 → L1 pixelRatio 1.5 / 阴影 1024 → L0 pixelRatio 1 / 关辉光/描边 / 阴影 512 ---------- */
  const adaptive = hooks.adaptive !== false;
  let quality = 2, fpsAcc = 0, fpsFrames = 0, fpsWindow = 0, watchdogStep = false;
  function applyQuality(l){
    quality = l;
    renderer.setPixelRatio(l === 2 ? Math.min(devicePixelRatio, 2) : (l === 1 ? 1.5 : 1));
    composer.setPixelRatio(renderer.getPixelRatio());
    const sm = l === 2 ? 2048 : (l === 1 ? 1024 : 512);
    if(key.shadow.mapSize.x !== sm){
      key.shadow.mapSize.set(sm, sm);
      if(key.shadow.map){ key.shadow.map.dispose(); key.shadow.map = null; }
    }
    bloom.enabled = l > 0;
    syncOutlineEnabled();
    emit();
  }
  function syncOutlineEnabled(){
    if(!outlineSel) return;
    const en = outlineOn && quality > 0 && booted;
    outlineSel.enabled = en && !!state.selected;
    outlineHover.enabled = en && !!state.hovered && state.hovered !== state.selected;
  }

  { const pmrem = new THREE.PMREMGenerator(renderer);
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture; }

  /* ---------- 灯光 / 地面 / 粒子 ---------- */
  scene.add(new THREE.HemisphereLight(0x44525f, 0x0a0e14, 0.55));
  const key = new THREE.DirectionalLight(0xffffff, 2.4);
  key.position.set(7, 12, 8); key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  key.shadow.camera.left = key.shadow.camera.bottom = -11;
  key.shadow.camera.right = key.shadow.camera.top = 11;
  key.shadow.camera.near = 1; key.shadow.camera.far = 45;
  key.shadow.bias = -0.0004;
  scene.add(key);
  const rim1 = new THREE.DirectionalLight(0x2fd8ff, 1.1); rim1.position.set(-9, 4, -7); scene.add(rim1);
  const rim2 = new THREE.DirectionalLight(0x8a5cff, 0.55); rim2.position.set(9, -4, -8); scene.add(rim2);
  const front = new THREE.PointLight(0x45e0ff, 8, 22, 2); front.position.set(0, 1.2, 7.5); scene.add(front);

  let grid, glow, shadowPlane, particles;
  {
    grid = new THREE.PolarGridHelper(15, 12, 6, 72, 0x14364a, 0x0b1e2c);
    grid.position.y = -3.9; scene.add(grid);

    const gc = document.createElement('canvas'); gc.width = gc.height = 512;
    const gg = gc.getContext('2d');
    const rg = gg.createRadialGradient(256,256,20,256,256,250);
    rg.addColorStop(0,'rgba(69,224,255,.30)'); rg.addColorStop(.5,'rgba(69,224,255,.07)'); rg.addColorStop(1,'rgba(69,224,255,0)');
    gg.fillStyle = rg; gg.fillRect(0,0,512,512);
    const gtex = new THREE.CanvasTexture(gc); gtex.colorSpace = THREE.SRGBColorSpace;
    glow = new THREE.Mesh(new THREE.CircleGeometry(8, 48),
      new THREE.MeshBasicMaterial({ map:gtex, transparent:true, depthWrite:false, blending:THREE.AdditiveBlending }));
    glow.rotation.x = -Math.PI/2; glow.position.y = -3.89; scene.add(glow);

    shadowPlane = new THREE.Mesh(new THREE.CircleGeometry(9.5, 48), new THREE.ShadowMaterial({ opacity:0.38 }));
    shadowPlane.rotation.x = -Math.PI/2; shadowPlane.position.y = -3.88;
    shadowPlane.receiveShadow = true; scene.add(shadowPlane);

    const N = 420, pos = new Float32Array(N*3);
    for(let i=0;i<N;i++){
      const r = 10 + Math.random()*11, th = Math.random()*Math.PI*2, ph = Math.acos(Math.random()*2-1);
      pos[i*3]   = r*Math.sin(ph)*Math.cos(th);
      pos[i*3+1] = (Math.random()-0.35)*14;
      pos[i*3+2] = r*Math.sin(ph)*Math.sin(th);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    particles = new THREE.Points(geo, new THREE.PointsMaterial({
      color:0x3ac8e8, size:0.055, transparent:true, opacity:0.4,
      blending:THREE.AdditiveBlending, depthWrite:false, sizeAttenuation:true }));
    scene.add(particles);
  }

  /* ---------- 设备容器与状态 ---------- */
  const deviceGroup = new THREE.Group();
  scene.add(deviceGroup);

  const state = {
    device: null,
    parts: [], partsById: {}, pickMeshes: [],
    explodeCurrent: 0, explodeTarget: 0, explodeBasis: null, explodeSpeed: 0.9,
    explodeLayout: 'axis',           // 'axis' 相机基向量 | 'radial' 花瓣球壳
    deviceRadius: 5,
    stepMode: false,                 // 逐步装配：见 stepAssembly
    stepCur: 0,                      // 已装配组数（连续值，动画用）
    stepTarget: 0, stepSpeed: 2.0, stepGroups: null, stepExitPending: false, stepEmitPending: false,
    demos: null, demoActive: null,   // 视觉原理演示（Phase 5）：device.demos + 当前激活标签
    selected: null, hovered: null,
    labelsMode: 'auto',              // 'auto' | 'all' | 'off'
    scrubbing: false,
    camTween: null, modelStatus: '',
    tour: null,                      // { ids, i, wait, playing }
    flewTo: null,                    // 最近 flyToPart 的部件（点空白飞回全景的依据）
  };

  /* ---------- 查看模式（X 光/隔离/剖切） ---------- */
  const modes = createViewModes({
    renderer,
    getParts: () => state.parts,
    getDeviceGroup: () => deviceGroup,
    getDevice: () => state.device,
    getBobY: () => deviceGroup.position.y,
    onChange: () => emit(),
    useStencilCap: composer.renderTarget1.stencilBuffer === true,
  });

  /* ---------- 标签系统（SVG 引线 + 避让 + 分级） ---------- */
  const labelSystem = createLabelSystem(labelsRoot, {
    onHover: (id) => setHover(id),
    onSelect: (id) => { selectPart(id); flyToPart(id); },
  });

  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2(-10,-10);
  const _v = new THREE.Vector3();
  const _bb = new THREE.Box3();

  /* ---------- 高亮（克制：金属材质上过亮会经 Bloom 泛白；有 OutlinePass 时进一步调低） ---------- */
  function applyGlow(dt, t){
    const kBase = outlineOn && quality > 0 ? 0.06 : 0.12;
    for(const p of state.parts){
      const target = p.data.id===state.selected ? 0.7 : (p.data.id===state.hovered ? 0.4 : 0);
      p.glow += (target-p.glow)*Math.min(dt*9, 1);
      if(p.glow > 0.003 || target > 0){
        const pulse = p.data.id===state.selected ? (0.03+0.03*Math.sin(t*4)) : 0;
        const k = clamp(p.glow+pulse, 0, 0.8);
        p.mats.forEach(m=>{
          if(!m.emissive) return;
          m.emissive.copy(m.userData.baseEmissive).lerp(ACCENT, Math.min(k,1)*kBase);
          m.emissiveIntensity = m.userData.baseEI + k*0.1;
        });
      }
    }
  }

  /* ---------- 设备装载 ---------- */
  function disposeDevice(){
    modes.setMode(null);
    stopTour(false);
    setMeasure(false, true);
    deviceGroup.traverse(o=>{
      if(o.isMesh){
        if(o.geometry.boundsTree) o.geometry.disposeBoundsTree();
        o.geometry.dispose();
        const ms = Array.isArray(o.material) ? o.material : [o.material];
        ms.forEach(m=>{
          for(const k of ['map','emissiveMap','normalMap','roughnessMap','metalnessMap','aoMap']){
            if(m[k] && m[k].dispose) m[k].dispose();
          }
          m.dispose();
        });
      }
      if(o.isLine){
        o.geometry.dispose();
        if(o.material.dispose) o.material.dispose();
      }
    });
    deviceGroup.clear();
    state.parts = []; state.partsById = {}; state.pickMeshes = [];
    state.selected = null; state.hovered = null; state.flewTo = null;
    state.explodeCurrent = 0; state.explodeTarget = 0; state.explodeBasis = null;
    state.explodeSpeed = 0.9; state.explodeLayout = 'axis';
    state.stepMode = false; state.stepCur = 0; state.stepTarget = 0;
    state.stepGroups = null; state.stepExitPending = false; state.stepEmitPending = false;
    state.demos = null; state.demoActive = null;
    bvhBuilt = false;
  }

  function buildProceduralParts(device){
    for(const pd of device.parts){
      const g = new THREE.Group();
      const builder = device.builders && device.builders[pd.id];
      if(builder) builder(g);
      g.position.fromArray(device.assembledPos[pd.id]);
      deviceGroup.add(g);
      registerPart(pd, g, new THREE.Vector3().fromArray(device.assembledPos[pd.id]),
        new THREE.Vector3().fromArray(pd.offset));
    }
  }

  function registerPart(pd, group, base, offset){
    const p = {
      data: pd, idx: state.parts.length, group,
      base, offset, rank: state.parts.length,
      mats: new Set(), glow: 0,
      anchor: new THREE.Object3D()
    };
    p.anchor.position.fromArray(state.device.labelOffsets ? (state.device.labelOffsets[pd.id]||[0,1,0]) : [0,1,0]);
    group.add(p.anchor);
    group.traverse(o=>{
      if(o.isMesh){
        o.castShadow = o.receiveShadow = true;
        o.userData.partId = pd.id;
        state.pickMeshes.push(o);
        const ms = Array.isArray(o.material) ? o.material : [o.material];
        ms.forEach(m=>{
          if(!m.emissive) return;
          if(!m.userData.baseEmissive){ m.userData.baseEmissive = m.emissive.clone(); m.userData.baseEI = m.emissiveIntensity; }
          p.mats.add(m);
        });
      }
    });
    if(offset.lengthSq() > 0.001){
      const geo = new THREE.BufferGeometry().setFromPoints([base.clone(), base.clone().add(offset)]);
      const line = new THREE.Line(geo, new THREE.LineDashedMaterial({ color:0x45e0ff, dashSize:0.16, gapSize:0.12, transparent:true, opacity:0 }));
      line.computeLineDistances();
      deviceGroup.add(line);
      p.axisLine = line;
    }
    state.parts.push(p);
    state.partsById[pd.id] = p;
  }

  function collectGlowMats(p){
    p.mats.clear();
    p.group.traverse(o=>{
      if(!o.isMesh) return;
      const ms = Array.isArray(o.material) ? o.material : [o.material];
      ms.forEach(m=>{
        if(!m.emissive) return;
        if(!m.userData.baseEmissive){ m.userData.baseEmissive = m.emissive.clone(); m.userData.baseEI = m.emissiveIntensity; }
        p.mats.add(m);
      });
    });
  }

  /* 爆炸偏移换算：语义偏移(x右/y上/z朝观察者) → 世界向量；radial 布局归一化到花瓣球壳 */
  function captureExplodeBasis(fromPos){
    outerDirty = -1;   // 偏移向量变化，外侧 1/3 集合需重算
    const m = new THREE.Matrix4().lookAt(fromPos || camera.position, CAM_TARGET, new THREE.Vector3(0,1,0));
    const R = new THREE.Vector3().setFromMatrixColumn(m,0).normalize();
    const U = new THREE.Vector3().setFromMatrixColumn(m,1).normalize();
    const B = new THREE.Vector3().setFromMatrixColumn(m,2).normalize();
    state.explodeBasis = { R, U, B };
    const radial = state.explodeLayout === 'radial';
    const RADIUS = radial ? state.deviceRadius * 1.5 : 0;
    for(const p of state.parts){
      const o = p.offset;   // Vector3：x=右 y=上 z=朝观察者
      const wo = new THREE.Vector3()
        .addScaledVector(R, o.x).addScaledVector(U, o.y).addScaledVector(B, o.z);
      if(radial){
        const dir = wo.lengthSq() > 0.04 ? wo : _v.set(0, 1, 0).addScaledVector(B, 0.6).clone();
        if(dir.lengthSq() < 1e-6) dir.set(0, 1, 0);
        wo.copy(dir.normalize()).multiplyScalar(RADIUS);
      }
      if(!wo.toArray().every(isFinite)) wo.copy(o);
      p.worldOffset = wo;
      if(p.axisLine){
        p.axisLine.geometry.setFromPoints([p.base.clone(), p.base.clone().add(wo)]);
        p.axisLine.computeLineDistances();
      }
    }
  }

  let loadSeq = 0;
  let loadAbort = null;
  async function loadDevice(device, opts = {}){
    const token = ++loadSeq;   // 装载序号：切换设备后，旧装载的网络/解析回调一律作废
    if(loadAbort) loadAbort.abort();   // 旧设备的下载不再占用带宽
    loadAbort = new AbortController();
    const signal = loadAbort.signal;
    const intro = opts.intro !== false && adaptive;   // 缩略图渲染器不开场
    window.__LOADS = (window.__LOADS || []).concat(device.id + '@' + (Date.now() % 100000));
    disposeDevice();
    state.device = device;
    state.demos = Array.isArray(device.demos) ? device.demos : null;
    state.demoActive = null;
    /* 每设备相机距离：大尺寸设备按比例拉远 */
    const cd = device.camDist || 1;
    CAM_HOME.copy(CAM_HOME_BASE).multiplyScalar(cd);
    CAM_EXPLODE.copy(CAM_EXPLODE_BASE).multiplyScalar(cd);
    controls.maxDistance = Math.max(36, 36*cd);
    key.shadow.camera.left = key.shadow.camera.bottom = -11*cd;
    key.shadow.camera.right = key.shadow.camera.top = 11*cd;
    key.shadow.camera.updateProjectionMatrix();
    /* OutlinePass 强调色随设备换肤 */
    if(outlineSel && device.accent){
      try{ _color.set(device.accent); outlineSel.visibleEdgeColor.copy(_color); }catch{}
    }
    state.modelStatus = device.glb ? 'LOADING 0%' : 'PROCEDURAL';
    emit();
    buildProceduralParts(device);
    labelSystem.build(state.parts);
    if(!device.glb){
      finalize(intro);
      return;
    }
    const loader = new GLTFLoader();
    /* 无条件挂单例 Draco 解码器：对未压缩文件无副作用，且杜绝配置漏标 draco 导致的装载失败 */
    loader.setDRACOLoader(getDracoLoader());
    try{
      /* GLB 均为单文件自包含：优先命中 Cache Storage，未命中流式下载（带进度）并回填 */
      const buffer = await fetchGlb(device.glb, (loaded, total)=>{
        if(token !== loadSeq || !total) return;
        state.modelStatus = 'LOADING ' + Math.round(loaded/total*100) + '%';
        emit();
      }, signal);
      if(token !== loadSeq) return;   // 等待期间已切换设备：丢弃本次结果
      state.modelStatus = 'PARSING';
      emit();
      const gltf = await new Promise((resolve, reject)=> loader.parse(buffer, '', resolve, reject));
      if(token !== loadSeq) return;
      {
        const root = gltf.scene;
        /* 网格排除：剔除展示地面/背景板等非设备网格（须在归一化之前，
           否则巨型背景板会撑爆归一化与取景包围盒） */
        if(device.excludeMeshes && device.excludeMeshes.length){
          const kill = new Set(device.excludeMeshes);
          const doomed = [];
          root.traverse(o => { if (o.isMesh && kill.has(o.name)) doomed.push(o); });
          for(const o of doomed) o.parent.remove(o);
          if(doomed.length) root.updateMatrixWorld(true);
        }
        /* 基础姿态修正（俯仰）：平躺展示模型转正。
           以几何中心建 pivot 旋转——模型长轴常偏离原点，绕 root 原点转会甩飞 */
        if(device.baseRotation){
          root.updateMatrixWorld(true);
          const bb = new THREE.Box3().setFromObject(root);
          const pivot = new THREE.Group();
          pivot.position.copy(root.worldToLocal(bb.getCenter(new THREE.Vector3())));
          pivot.rotation.set(device.baseRotation[0] || 0, device.baseRotation[1] || 0, device.baseRotation[2] || 0);
          for(const ch of [...root.children]) pivot.attach(ch);
          root.add(pivot);
          root.updateMatrixWorld(true);
          console.log('[baseRotation] applied, pivot children =', pivot.children.length, 'root children =', root.children.length);
        }
        /* 朝向声明：把模型原生机头轴转到 +Z */
        if(device.frontAxis && device.frontAxis !== '+z'){
          root.rotation.y = { '+x': -Math.PI/2, '-x': Math.PI/2, '-z': Math.PI }[device.frontAxis] || 0;
          root.updateMatrixWorld(true);
        }
        /* 归一化：以机身框架包围盒为准，缩放到 device.targetWidth */
        const allMeshes = [];
        root.traverse(o=>{ if(o.isMesh) allMeshes.push(o); });
        root.updateMatrixWorld(true);
        /* 以 root 本地坐标计算每格网格的几何包围盒（中心 + min/max），
           供归一化与位置映射使用 —— 节点枢轴可能与几何位置脱节（烘顶点资产） */
        const _mbb = new THREE.Box3();
        const localPts = allMeshes.map(m => {
          m.geometry.computeBoundingBox();
          _mbb.copy(m.geometry.boundingBox);
          const min = new THREE.Vector3(+Infinity,+Infinity,+Infinity), max = new THREE.Vector3(-Infinity,-Infinity,-Infinity);
          for(let i=0;i<8;i++){
            _v.set(i&1?_mbb.max.x:_mbb.min.x, i&2?_mbb.max.y:_mbb.min.y, i&4?_mbb.max.z:_mbb.min.z);
            m.localToWorld(_v); root.worldToLocal(_v);
            min.min(_v); max.max(_v);
          }
          const c = _mbb.getCenter(new THREE.Vector3());
          m.localToWorld(c); root.worldToLocal(c);
          return { name: m.name, p: c, min, max };
        });
        const resolvePartId = (name, matName)=>{
          if(device.mapping && device.mapping[name]) return device.mapping[name];
          if(device.materialMapping && matName && device.materialMapping[matName]) return device.materialMapping[matName];
          if(device.mappingPrefix){
            for(const [pre, pid] of Object.entries(device.mappingPrefix)){
              if(name.startsWith(pre)) return pid;
            }
          }
          return device.unmappedTo || 'shell';
        };
        const normSel = device.normalize === 'full' ? localPts : localPts.filter(m => resolvePartId(m.name) === (device.unmappedTo || 'shell'));
        window.__NORMDBG = { normalize: device.normalize, localN: localPts.length, selN: normSel.length,
          localExtent: localPts.length ? ['x','y','z'].map((a,i)=>{
            const vs = localPts.map(m=>m.p[i] !== undefined ? m.p[i] : m.p.getComponent ? m.p.getComponent(i) : 0);
            return [(Math.min(...vs)), (Math.max(...vs))];
          }) : null };
        const sbox = new THREE.Box3();
        normSel.forEach(m => { sbox.expandByPoint(m.min); sbox.expandByPoint(m.max); });
        const ssize = sbox.getSize(new THREE.Vector3());
        const scenter = sbox.getCenter(new THREE.Vector3());
        /* full 模式按最大维度缩放（平铺/直立资产的长轴可能在任意方向） */
        const s = device.targetWidth / Math.max(
          device.normalize === 'full' ? Math.max(ssize.x, ssize.y, ssize.z) : ssize.x, 0.001);
        root.scale.setScalar(s);
        root.position.set(-scenter.x*s, -scenter.y*s, -scenter.z*s);
        deviceGroup.add(root);
        root.updateMatrixWorld(true);
        window.__RAW = { ssize: ssize.toArray(), s, finalBbox: null, rel: null,
          names: allMeshes.slice(0, 60).map(m => m.name),
          matNames: [...new Set(allMeshes.slice(0, 60).map(m => m.material && m.material.name).filter(Boolean))] };

        /* 朝向自检（未声明 frontAxis 时） */
        const zSum = {}, zCnt = {};
        root.traverse(o=>{
          if(!o.isMesh) return;
          const pid = resolvePartId(o.name, o.material && o.material.name);
          if(!pid) return;
          zSum[pid] = (zSum[pid]||0) + o.getWorldPosition(_v).z;
          zCnt[pid] = (zCnt[pid]||0) + 1;
        });
        const probePair = device.orientationProbe;
        if(probePair && zSum[probePair[0]] !== undefined && zSum[probePair[1]] !== undefined){
          if(zSum[probePair[0]]/zCnt[probePair[0]] < zSum[probePair[1]]/zCnt[probePair[1]]){
            root.rotation.y = Math.PI;
            root.updateMatrixWorld(true);
          }
        }

        /* 网格按映射归入部件组，材质按部件克隆 */
        const byPart = {};
        const relDump = [];
        for(let mi = 0; mi < allMeshes.length; mi++){
          const mesh = allMeshes[mi];
          let pid;
          if(device.mapByPosition){
            /* 传原生本地坐标 p 与 full-bbox 相对坐标 rel(0..1) */
            const p = localPts[mi].p;
            const rel = new THREE.Vector3(
              (p.x - sbox.min.x)/Math.max(ssize.x, 1e-6),
              (p.y - sbox.min.y)/Math.max(ssize.y, 1e-6),
              (p.z - sbox.min.z)/Math.max(ssize.z, 1e-6));
            relDump.push([mesh.name.slice(0,14), +rel.x.toFixed(3), +rel.y.toFixed(3), +rel.z.toFixed(3)]);
            const lp = localPts[mi];
            const matName = Array.isArray(mesh.material)
              ? mesh.material.map(m => m.name).join('+')
              : (mesh.material && mesh.material.name) || '';
            pid = device.mapByPosition(mesh.name, lp.p, rel, { x: lp.max.x - lp.min.x, y: lp.max.y - lp.min.y, z: lp.max.z - lp.min.z }, matName);
          } else {
            pid = resolvePartId(mesh.name, mesh.material && mesh.material.name);
          }
          const g = byPart[pid] || (byPart[pid] = new THREE.Group());
          g.attach(mesh);
          mesh.castShadow = mesh.receiveShadow = true;
          mesh.userData.partId = pid;
          mesh.material = Array.isArray(mesh.material) ? mesh.material.map(m=>m.clone()) : mesh.material.clone();
        }
        if(window.__RAW) window.__RAW.rel = relDump;
        deviceGroup.remove(root);

        /* 替换程序化外观（先归零位置） */
        for(const pid of device.realPartIds){
          const p = state.partsById[pid];
          if(!byPart[pid]) continue;
          p.group.clear();
          p.group.add(byPart[pid]);
          p.base.set(0,0,0);
          p.group.position.set(0,0,0);
          collectGlowMats(p);
        }
        deviceGroup.updateMatrixWorld(true);

        /* 设备特有后处理（传感器对位、保护镜、点亮屏幕等） */
        if(device.postLoad) device.postLoad({ partsById: state.partsById, addLiveScreen });

        finalize(intro);
      }
    }catch(err){
      if(token !== loadSeq) return;   // 已被新装载/切换取代：不覆盖当前状态
      if(err && err.name === 'AbortError') return;   // 切台/卸载主动中止：正常路径，不当错误打印
      console.error('GLB 装载/接入失败，保留程序化模型', err);
      window.__LOAD_ERR = (err && (err.stack || err.message)) || String(err || 'GLB load failed');
      state.modelStatus = 'FALLBACK · PROCEDURAL';
      if(token === loadSeq) finalize(intro);
    }
  }

  /* GLB 合入后的通用收尾：锚点重定位、轴线重绘、拾取重建、强制同步一帧 */
  function buildLabelAnchors(){
    for(const p of state.parts){
      p.group.add(p.anchor);
      p.anchor.position.fromArray(state.device.labelOffsets ? (state.device.labelOffsets[p.data.id]||[0,1,0]) : [0,1,0]);
    }
  }
  function finalize(intro){
    const device = state.device;
    const LABEL_ANCHOR_DX = device.labelAnchorDx || {};
    for(const p of state.parts){
      p.group.add(p.anchor);
      _bb.setFromObject(p.group);
      const c = _bb.getCenter(new THREE.Vector3());
      if(_bb.isEmpty()){ continue; }
      const ax = LABEL_ANCHOR_DX[p.data.id] !== undefined ? _bb.max.x - LABEL_ANCHOR_DX[p.data.id] : c.x;
      if([ax, _bb.max.y, c.z].every(isFinite)){
        /* 世界坐标锚点 → 部件组局部坐标（兼容被旋转过的程序化部件组） */
        _v.set(ax, _bb.max.y + 0.2, c.z);
        p.group.worldToLocal(_v);
        p.anchor.position.copy(_v);
      }
      if(p.axisLine){
        p.axisLine.geometry.setFromPoints([p.base.clone(), p.base.clone().add(p.worldOffset || p.offset)]);
        p.axisLine.computeLineDistances();
      }
    }
    state.pickMeshes = [];
    deviceGroup.traverse(o=>{ if(o.isMesh) state.pickMeshes.push(o); });
    { const T = THREE, fb = new T.Box3(); deviceGroup.traverse(o=>{ if(o.isMesh) fb.expandByObject(o); });
      if(window.__RAW) window.__RAW.finalBbox = fb.getSize(new T.Vector3()).toArray().map(v=>+v.toFixed(2)); }
    /* 径向布局半径：装配态部件基准位置的包围球半径 */
    { const bb = new THREE.Box3();
      for(const p of state.parts) bb.expandByPoint(p.base);
      state.deviceRadius = bb.isEmpty() ? 5 : Math.max(2.2, bb.getSize(new THREE.Vector3()).length()/2); }
    captureExplodeBasis(CAM_EXPLODE);
    /* rAF 停摆环境下立即同步位置并渲染一帧 */
    for(const p of state.parts){ p.group.position.copy(p.base).addScaledVector(p.worldOffset || p.offset, 0); }
    /* 开场演出：以 55% 爆炸散开状态出现，1.4s 内自动装配（首次装载且非缩略图模式） */
    if(intro && !booted){
      state.explodeCurrent = 0.55;
      state.explodeTarget = 0;
      state.explodeSpeed = 0.42;
      camera.position.copy(CAM_EXPLODE).multiplyScalar(1.42).add(new THREE.Vector3(0, 2.2, 0));
    }
    composer.render();
    updateLabelsFrame();
    const community = isCommunityModel(device);
    state.modelStatus = device.glb ? ((community ? 'COMMUNITY' : 'OFFICIAL') + ' · ' + device.en) : 'PROCEDURAL';
    /* 慢网时模式可能在部件注册前就被切入（applyClip/applyXray 落在空部件集上）：
       装载完成后重放当前模式，否则剖切/透视对新部件永不生效 */
    if(modes.state.mode){
      const m = modes.state.mode, iso = modes.state.isolateId;
      modes.setMode(null);
      modes.setMode(m, iso);
    }
    emit();
  }

  /* ---------- 屏幕点亮辅助（postLoad 可用） ---------- */
  function addLiveScreen(pid, facing, tex, canvas, cover){
    const p = state.partsById[pid];
    if(!p) return;
    const bb = new THREE.Box3().setFromObject(p.group);
    if(bb.isEmpty()) return;                       // 部件无网格：跳过，避免 NaN 几何铺满全屏
    const size = bb.getSize(new THREE.Vector3());
    if(![size.x, size.y].every(isFinite) || size.x <= 0 || size.y <= 0) return;
    const c = bb.getCenter(new THREE.Vector3());
    const aspect = canvas.width / canvas.height;
    let w = size.x * cover, h = w / aspect;
    if(h > size.y * cover){ h = size.y * cover; w = h * aspect; }
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h), matScreen(tex));
    mesh.position.set(c.x, c.y, facing > 0 ? bb.max.z + 0.015 : bb.min.z - 0.015);
    if(facing < 0) mesh.rotation.y = Math.PI;
    mesh.userData.partId = pid;
    p.group.add(mesh);
  }

  /* ---------- 公开 API ---------- */
  function setExplode(t){
    if(state.stepMode){
      /* 爆炸滑杆/空格接管：退出逐步模式（口径近似切换，可有轻微跳变） */
      state.stepMode = false;
      state.stepExitPending = false;
      state.explodeCurrent = 1 - state.stepCur / Math.max(1, state.stepGroups ? state.stepGroups.length : 1);
    }
    state.explodeTarget = t;
    state.explodeSpeed = 0.9;
    state.userInteracted = true;
    stopTour(false);
    invalidateMeasure();   // 部件位移后测量点位失效（工具保持开启，重测即可）
    controls.autoRotate = false;
    if(t > 0.5) captureExplodeBasis(CAM_EXPLODE);
    state.camTween = { t:0, dur:1.2,
      fp:camera.position.clone(),
      tp:(t > 0.5 ? CAM_EXPLODE : CAM_HOME).clone(),
      ft:controls.target.clone(), tt:CAM_TARGET.clone() };
    emit();
  }
  /* 爆炸布局：'axis'（语义方向） | 'radial'（花瓣球壳） */
  function setExplodeLayout(layout){
    state.explodeLayout = layout === 'radial' ? 'radial' : 'axis';
    invalidateMeasure();
    captureExplodeBasis(CAM_EXPLODE);
    emit();
  }
  /* ---------- 逐步装配（LAB · Phase 2）：策展 assembleStep 组序，缺省按爆炸偏移分层 ---------- */
  function computeStepGroups(){
    const d = state.device;
    const present = new Set(state.parts.map(p => p.data.id));
    let groups = null;
    if(d && Array.isArray(d.assembleStep) && d.assembleStep.length){
      groups = d.assembleStep
        .map(g => Array.isArray(g) ? g.filter(id => present.has(id)) : [])
        .filter(g => g.length);
    }
    if(!groups){
      /* 兜底：按爆炸偏移长度升序分约 5 层（内件先装） */
      const sorted = [...state.parts].sort((a, b) =>
        (a.worldOffset ? a.worldOffset.length() : 0) - (b.worldOffset ? b.worldOffset.length() : 0));
      const per = Math.max(1, Math.ceil(sorted.length / 5));
      groups = [];
      for(let i = 0; i < sorted.length; i += per){
        groups.push(sorted.slice(i, i + per).map(p => p.data.id));
      }
    }
    /* 未列入策展组的部件追加为末组，保证全件可装 */
    const listed = new Set(groups.flat());
    const rest = state.parts.filter(p => !listed.has(p.data.id)).map(p => p.data.id);
    if(rest.length) groups.push(rest);
    return groups.filter(g => g.length);
  }
  function stepAssembly(on){
    if(on){
      if(!state.parts.length) return false;
      stopTour(false);
      state.stepGroups = computeStepGroups();
      for(const p of state.parts){
        p.stepIdx = state.stepGroups.findIndex(g => g.includes(p.data.id));
      }
      state.stepMode = true;
      /* 与当前画面无缝衔接：装配态→先逐组拆开展示；爆炸态→直接从 0 开始装 */
      state.stepCur = state.stepGroups.length * (1 - clamp(state.explodeCurrent, 0, 1));
      state.stepTarget = 0;
      state.stepExitPending = false;
      state.stepEmitPending = true;
      state.stepSpeed = 2.0;
      invalidateMeasure();
      controls.autoRotate = false;
      state.userInteracted = true;
      state.camTween = { t:0, dur:1.2,
        fp:camera.position.clone(), tp:CAM_EXPLODE.clone(),
        ft:controls.target.clone(), tt:CAM_TARGET.clone() };
    }else{
      if(!state.stepMode) return false;
      /* 先补齐装配再交还爆炸系统，避免两套插值口径跳变 */
      state.stepTarget = state.stepGroups.length;
      state.stepExitPending = true;
      state.stepEmitPending = true;
    }
    emit();
    return true;
  }
  function stepNext(){
    if(!state.stepMode) return;
    state.stepTarget = Math.min(state.stepGroups.length, state.stepTarget + 1);
    state.stepExitPending = false;
    state.stepEmitPending = true;
    invalidateMeasure();
    emit();
  }
  function stepPrev(){
    if(!state.stepMode) return;
    state.stepTarget = Math.max(0, state.stepTarget - 1);
    state.stepEmitPending = true;
    invalidateMeasure();
    emit();
  }
  /* ---------- 视觉原理演示（Phase 5）：选中对应部件时运行程序旋转动画 ----------
     只动 rotation（与爆炸/装配的位置管线无冲突）；退出 0.5s 缓动回初始姿态；
     示意动画而非仿真，UI 侧以「视觉原理演示」toast 明确标注。
     spin:'auto' → 按部件包围盒最薄轴推导旋转轴（圆盘/薄板类零件的最薄维度即转轴）；
     reducedMotion 下整体静帧（晕动症友好）。 */
  function runDemos(dt, t){
    if(!state.demos || !state.demos.length || reducedMotion) return;
    for(const d of state.demos){
      const p = state.partsById[d.partId];
      if(!p) continue;
      const active = state.selected === d.partId;
      if(active && !p.__demo){
        p.__demo = { base: { x: p.group.rotation.x, y: p.group.rotation.y, z: p.group.rotation.z }, t: 0 };
        state.demoActive = d.label;
        emit();
      }else if(!active && p.__demo && !p.__demo.exit){
        p.__demo.exit = true;
        p.__demo.t = 0;
        p.__demo.fromRot = { x: p.group.rotation.x, y: p.group.rotation.y, z: p.group.rotation.z };
      }
      const D = p.__demo;
      if(!D) continue;
      if(D.exit){
        D.t = Math.min(1, D.t + dt * 2.2);
        const k = easeIO(D.t);
        p.group.rotation.x = D.fromRot.x + (D.base.x - D.fromRot.x) * k;
        p.group.rotation.y = D.fromRot.y + (D.base.y - D.fromRot.y) * k;
        p.group.rotation.z = D.fromRot.z + (D.base.z - D.fromRot.z) * k;
        if(D.t >= 1){
          p.group.rotation.set(D.base.x, D.base.y, D.base.z);
          p.__demo = null;
          if(state.demoActive){ state.demoActive = null; emit(); }
        }
        continue;
      }
      if(d.spin){
        if(Array.isArray(d.spin)){
          /* 数组 = 各轴角速度（rad/s），jet-engine 试点沿用的显式写法 */
          p.group.rotation.x += d.spin[0] * dt;
          p.group.rotation.y += d.spin[1] * dt;
          p.group.rotation.z += d.spin[2] * dt;
        }else{
          /* 'auto' = 按包围盒最薄轴推导旋转轴 */
          if(!D.axis){
            _bb.setFromObject(p.group);
            const s = _bb.getSize(new THREE.Vector3());
            D.axis = s.x <= s.y && s.x <= s.z ? [1, 0, 0] : (s.y <= s.z ? [0, 1, 0] : [0, 0, 1]);
          }
          const sp = d.speed || 4;
          p.group.rotation.x += D.axis[0] * sp * dt;
          p.group.rotation.y += D.axis[1] * sp * dt;
          p.group.rotation.z += D.axis[2] * sp * dt;
        }
      }
      if(d.wobble){
        const f = d.wobbleF || 1.0;
        p.group.rotation.x = D.base.x + Math.sin(t * f) * d.wobble[0];
        p.group.rotation.y = D.base.y + Math.sin(t * f * 0.83 + 1.3) * d.wobble[1];
        p.group.rotation.z = D.base.z + Math.sin(t * f * 1.21 + 2.6) * d.wobble[2];
      }
    }
  }
  function selectPart(id){
    state.selected = id;
    if(!id) state.flewTo = null;
    syncOutlineEnabled();
    emit();
  }
  /* 点击部件 = 相机飞近：包围盒中心 + 对角线×2.2，复用 camTween 缓动 0.8s */
  function flyToPart(id){
    const p = id && state.partsById[id];
    if(!p){ resetView(); return; }
    _bb.setFromObject(p.group);
    if(_bb.isEmpty()){ return; }
    const c = _bb.getCenter(new THREE.Vector3());
    const diag = _bb.getSize(new THREE.Vector3()).length();
    const dist = clamp(diag * 2.2, 3.2, controls.maxDistance * 0.85);
    const dir = _v.copy(camera.position).sub(controls.target);
    if(![dir.x, dir.y, dir.z].every(isFinite) || dir.lengthSq() < 1e-6) dir.set(0.55, 0.38, 0.74);
    dir.normalize();
    controls.minDistance = Math.min(controls.minDistance, Math.max(dist * 0.8, 2));
    state.flewTo = id;
    state.camTween = { t:0, dur:0.8,
      fp:camera.position.clone(),
      tp:c.clone().addScaledVector(dir, dist),
      ft:controls.target.clone(), tt:c.clone() };
  }
  function setHover(id){
    state.hovered = id;
    canvas.style.cursor = id ? 'pointer' : '';
    syncOutlineEnabled();
  }
  /* v: boolean 兼容旧签名；true→'auto' false→'off'；也接受 'auto'|'all'|'off' */
  function setLabels(v){
    state.labelsMode = v === true ? 'auto' : v === false ? 'off' : (['auto','all','off'].includes(v) ? v : 'auto');
    emit();
  }
  function setAutoRotate(on){
    controls.autoRotate = on;
    state.userInteracted = true;
    stopTour(false);
    emit();
  }
  function resetView(){
    controls.minDistance = 6;
    state.camTween = { t:0, dur:0.9,
      fp:camera.position.clone(), tp:CAM_HOME.clone(),
      ft:controls.target.clone(), tt:CAM_TARGET.clone() };
  }
  function pickAt(clientX, clientY, fly){
    pointer.x = (clientX/innerWidth)*2-1;
    pointer.y = -(clientY/innerHeight)*2+1;
    raycaster.setFromCamera(pointer, camera);
    const hit = raycaster.intersectObjects(state.pickMeshes, false)[0];
    const id = hit ? hit.object.userData.partId : null;
    selectPart(id);
    if(fly !== false){
      if(id) flyToPart(id);
      else if(state.flewTo) resetView();     // 点空白：若正聚焦某部件则飞回全景
    }
  }

  /* ---------- 测量工具（LAB · Phase 2） ----------
     两点表面取点连线读距；BVH 惰性构建只发生在首次激活。
     读数标定：模型等比缩放，targetWidth 场景单位 ↔ realSizeMM 真实毫米，
     故 mm = 场景距离 / targetWidth × realSizeMM（未标定设备显示场景单位）。 */
  let bvhBuilt = false;
  let measureTip = null;
  const measureMat = new THREE.MeshBasicMaterial({ color: 0x45e0ff, depthTest:false, transparent:true, opacity:.95 });
  const measureLineMat = new THREE.LineBasicMaterial({ color: 0x45e0ff, depthTest:false, transparent:true, opacity:.9 });
  function ensureBVH(){
    if(bvhBuilt) return;
    bvhBuilt = true;
    raycaster.firstHitOnly = true;
    const t0 = performance.now();
    let n = 0;
    deviceGroup.traverse(o=>{ if(o.isMesh && o.geometry && !o.geometry.boundsTree){ o.geometry.computeBoundsTree(); n++; } });
    console.log('[measure] BVH ×' + n + ' built in ' + Math.round(performance.now()-t0) + 'ms');
  }
  function ensureMeasureTip(){
    if(measureTip) return;
    measureTip = document.createElement('div');
    measureTip.className = 'measure-tip';
    labelsRoot.appendChild(measureTip);   // labels.build 只清理 .p-label 与自家 svg，外挂节点安全
  }
  function clearMeasureObjects(){
    const m = state.measure;
    if(!m) return;
    if(m.markerGeo) m.markerGeo.dispose();
    if(m.line) m.line.geometry.dispose();
    deviceGroup.remove(m.ma); if(m.mb) deviceGroup.remove(m.mb); if(m.line) deviceGroup.remove(m.line);
    state.measure = null;
  }
  function invalidateMeasure(){
    clearMeasureObjects();
    if(measureTip) measureTip.style.display = 'none';
  }
  function setMeasure(on, silent){
    if(on){
      ensureBVH();
      ensureMeasureTip();
      state.measureOn = true;
      stopTour(false);
    }else{
      state.measureOn = false;
      invalidateMeasure();
    }
    if(!silent) emit();
  }
  function measurePick(clientX, clientY){
    pointer.x = (clientX/innerWidth)*2-1;
    pointer.y = -(clientY/innerHeight)*2+1;
    raycaster.setFromCamera(pointer, camera);
    const hit = raycaster.intersectObjects(state.pickMeshes, false)[0];
    if(!hit) return;
    const local = deviceGroup.worldToLocal(hit.point.clone());
    let m = state.measure;
    if(m && m.b){ clearMeasureObjects(); m = null; }   // 第三次点击：重新测量
    if(!m){
      const geo = new THREE.SphereGeometry(clamp(state.deviceRadius*0.016, .03, .09), 14, 10);
      const ma = new THREE.Mesh(geo, measureMat); ma.renderOrder = 999;
      ma.position.copy(local); deviceGroup.add(ma);
      state.measure = { a: local.clone(), b: null, ma, mb: null, line: null, markerGeo: geo };
      return;
    }
    const mb = new THREE.Mesh(m.markerGeo, measureMat); mb.renderOrder = 999;
    mb.position.copy(local); deviceGroup.add(mb);
    m.b = local.clone(); m.mb = mb;
    m.line = new THREE.Line(new THREE.BufferGeometry().setFromPoints([m.a, m.b]), measureLineMat);
    m.line.renderOrder = 999;
    deviceGroup.add(m.line);
    const d = m.a.distanceTo(m.b);
    const dev = state.device;
    if(dev && dev.realSizeMM && dev.targetWidth){
      const mm = d / dev.targetWidth * dev.realSizeMM;
      measureTip.textContent = (mm >= 100 ? mm.toFixed(0) : mm.toFixed(1)) + ' mm';
    }else{
      measureTip.textContent = d.toFixed(2) + ' u · 未标定';
    }
  }
  function updateMeasureTip(){
    const m = state.measure;
    if(!m || !m.b || !measureTip) return;
    _v.copy(m.a).add(m.b).multiplyScalar(0.5);
    deviceGroup.localToWorld(_v);
    _v.project(camera);
    if(!Number.isFinite(_v.x) || _v.z > 1){ measureTip.style.display = 'none'; return; }
    measureTip.style.display = 'block';   // 类默认 display:none，必须内联覆盖
    measureTip.style.left = ((_v.x*0.5+0.5)*innerWidth).toFixed(1) + 'px';
    measureTip.style.top = ((-_v.y*0.5+0.5)*innerHeight).toFixed(1) + 'px';
  }

  /* ---------- 查看模式门面 ---------- */
  function setMode(m, partId){
    stopTour(false);
    invalidateMeasure();
    if(m === 'isolate' && !partId) partId = state.selected;
    if(m === 'isolate' && !partId) return;
    modes.setMode(m === 'xray' || m === 'isolate' || m === 'clip' ? m : null, partId);
    if(m && m !== 'clip') selectPart(partId || state.selected);
  }
  function isolate(id){ setMode(modes.state.mode === 'isolate' && modes.state.isolateId === id ? null : 'isolate', id); }
  function setClipT(t){ modes.setClipT(t); }

  /* ---------- 自动导览 Tour ---------- */
  function startTour(){
    modes.setMode(null);   // 导览件必须完整可见：自动退出 X 光/隔离/剖切
    invalidateMeasure();
    /* 无策展顺序时按爆炸偏移从外到内排：贴合“先拆外壳再进内部”的直觉，
       也避免直接沿用配置里的任意部件顺序 */
    const curated = (state.device && state.device.tour && state.device.tour.filter(id => state.partsById[id])) || [];
    const ids = curated.length ? curated
      : [...state.parts]
          .sort((a, b) => (b.worldOffset ? b.worldOffset.length() : 0) - (a.worldOffset ? a.worldOffset.length() : 0))
          .map(p => p.data.id);
    if(!ids.length) return;
    state.tour = { ids, i: -1, wait: 0, playing: true };
    state.userInteracted = true;
    tourStep(1);
  }
  function tourStep(dir){
    const tour = state.tour;
    if(!tour) return;
    tour.i = clamp(tour.i + dir, 0, tour.ids.length - 1);
    const id = tour.ids[tour.i];
    const pd = state.partsById[id] && state.partsById[id].data;
    selectPart(id);
    flyToPart(id);
    tour.wait = (pd && pd.hot) ? 5 : 3.5;
    emit();
  }
  function tourNext(){ if(state.tour) tourStep(1); }
  function tourPrev(){ if(state.tour) tourStep(-1); }
  function stopTour(emitAfter = true){
    if(state.tour){
      state.tour = null;
      if(emitAfter) emit();
    }
  }
  function tourInfo(){
    const t = state.tour;
    return t ? { playing: t.playing, i: t.i, total: t.ids.length, id: t.ids[t.i] } : null;
  }

  /* ---------- 拾取事件 ---------- */
  let downX0=0, downY0=0;
  let hoverDirty = false;
  let lpTimer = null;   // 长按 = 隔离（移动端手势）
  const isMobile = typeof matchMedia !== 'undefined' && matchMedia('(max-width: 700px)').matches;
  function onPointerMove(e){
    pointer.x = (e.clientX/innerWidth)*2-1;
    pointer.y = -(e.clientY/innerHeight)*2+1;
    hoverDirty = true;   // 节流：拾取合并到每帧一次（主循环内执行）
  }
  function onPointerDown(e){
    downX0 = e.clientX; downY0 = e.clientY;
    state.userInteracted = true; controls.autoRotate = false; emit();
    if(isMobile && e.pointerType !== 'mouse' && !state.measureOn){
      const x = e.clientX, y = e.clientY;
      lpTimer = setTimeout(()=>{
        lpTimer = null;
        pointer.x = (x/innerWidth)*2-1; pointer.y = -(y/innerHeight)*2+1;
        raycaster.setFromCamera(pointer, camera);
        const hit = raycaster.intersectObjects(state.pickMeshes, false)[0];
        if(hit) isolate(hit.object.userData.partId);
      }, 550);
    }
  }
  function onPointerUp(e){
    if(lpTimer){ clearTimeout(lpTimer); lpTimer = null; }
    if(Math.hypot(e.clientX - downX0, e.clientY - downY0) > 6) return;   // 拖拽视角不触发选择
    if(state.measureOn){ measurePick(e.clientX, e.clientY); return; }    // 测量工具接管点击
    pickAt(e.clientX, e.clientY);
  }
  function onPointerMoveCancel(){ if(lpTimer){ clearTimeout(lpTimer); lpTimer = null; } }
  canvas.addEventListener('pointermove', onPointerMove);
  canvas.addEventListener('pointerdown', onPointerDown);
  canvas.addEventListener('pointerup', onPointerUp);
  canvas.addEventListener('pointermove', onPointerMoveCancel, { passive:true });
  controls.addEventListener('start', ()=>{
    state.userInteracted = true; controls.autoRotate = false; stopTour(false); emit();
  });

  /* ---------- 主循环 ---------- */
  const clock = new THREE.Clock();
  let lastHalf = 0, running = true, booted = false;
  let lastEmitExp = -1;

  function emit(){
    onChange({
      explode: Math.round(state.explodeCurrent*100),
      explodeTarget: state.explodeTarget,
      selected: state.selected,
      modelStatus: state.modelStatus,
      labelsOn: state.labelsMode !== 'off',
      labelsMode: state.labelsMode,
      autoRotate: controls.autoRotate,
      viewMode: modes.state.mode,
      isolateId: modes.state.isolateId,
      clipT: modes.state.clipT,
      layout: state.explodeLayout,
      tour: tourInfo(),
      tool: state.measureOn ? 'measure' : null,
      step: state.stepMode && state.stepGroups ? { i: Math.round(state.stepCur), n: state.stepGroups.length } : null,
      booted, quality
    });
  }

  /* 外侧 1/3 部件集合（auto 标签分级）：按爆炸偏移长度降序取前 1/3。
     结果按爆炸度分桶缓存，桶不变不重算（避免每帧排序分配） */
  const outerThird = new Set();
  let outerDirty = -1;
  function computeOuterThird(){
    const sorted = [...state.parts].sort((a, b) =>
      (b.worldOffset ? b.worldOffset.length() : 0) - (a.worldOffset ? a.worldOffset.length() : 0));
    const nShow = Math.max(1, Math.ceil(state.parts.length / 3));
    outerThird.clear();
    sorted.forEach((p, i) => { p.rank = i; if(i < nShow) outerThird.add(p.data.id); });
  }

  function updateLabelsFrame(){
    if(!state.parts.length) return;
    if(state.explodeCurrent > 0.35){
      const bucket = Math.round(state.explodeCurrent * 20);
      if(bucket !== outerDirty){ computeOuterThird(); outerDirty = bucket; }
    }
    labelSystem.update({
      camera, W: innerWidth, H: innerHeight,
      selected: state.selected, hovered: state.hovered,
      labelsMode: state.labelsMode,
      explode: state.explodeCurrent,
      outerThird,
    });
  }

  function mainLoop(){
    /* rawDt 未钳制：爆炸推进/导览计时按真实墙钟走（低帧率设备与后台恢复时节奏不拖长）；
       dt 钳到 0.05 供呼吸/高亮等连续效果保持稳定 */
    const rawDt = Math.min(clock.getDelta(), 1);
    const dt = Math.min(rawDt, 0.05);
    const t = clock.elapsedTime;
    const viaWatchdog = watchdogStep; watchdogStep = false;

    /* 设备动态贴图刷新（屏幕 UI 等） */
    if(state.device && state.device.tick) state.device.tick(dt);

    if(state.stepMode && state.stepGroups){
      if(Math.abs(state.stepCur - state.stepTarget) > 0.0004){
        const dir = Math.sign(state.stepTarget - state.stepCur);
        state.stepCur = clamp(
          state.stepCur + dir*Math.min(rawDt*state.stepSpeed, Math.abs(state.stepTarget-state.stepCur)),
          0, state.stepGroups.length);
      }else if(state.stepEmitPending){
        state.stepEmitPending = false;   // 到位后同步一次 UI（步进计数/按钮态）
        emit();
      }
      /* 标签外侧 1/3 桶口径与爆炸度对齐 */
      state.explodeCurrent = 1 - state.stepCur / state.stepGroups.length;
      if(state.stepExitPending && state.stepCur >= state.stepGroups.length - 0.0004){
        state.stepMode = false; state.stepExitPending = false;
        state.explodeCurrent = 0; state.explodeTarget = 0;
      }
    }else if(Math.abs(state.explodeCurrent-state.explodeTarget) > 0.0004){
      const dir = Math.sign(state.explodeTarget - state.explodeCurrent);
      state.explodeCurrent = clamp(
        state.explodeCurrent + dir*Math.min(rawDt*state.explodeSpeed, Math.abs(state.explodeTarget-state.explodeCurrent)), 0, 1);
      if(state.explodeCurrent === state.explodeTarget) state.explodeSpeed = 0.9;
    }
    const ex = state.explodeCurrent;
    const n = state.parts.length || 1;
    for(const p of state.parts){
      let lt;
      if(state.stepMode){
        lt = easeIO(1 - clamp(state.stepCur - (p.stepIdx || 0), 0, 1));
      }else{
        const stag = (p.idx/n)*0.32;
        lt = clamp((ex-stag)/(1-0.32), 0, 1);
        lt = easeIO(lt);
      }
      const wo = p.worldOffset || p.offset;
      p.group.position.copy(p.base).addScaledVector(wo, lt);
      if(!isFinite(p.group.position.x)) p.group.position.copy(p.base);
      if(p.axisLine){ p.axisLine.material.opacity = lt*0.38; p.axisLine.visible = lt>0.03; }
    }
    modes.tick(dt);
    applyGlow(dt, t);
    runDemos(dt, t);

    if(outlineSel){
      /* 仅在目标集合变化时重赋，避免每帧产生新数组 */
      const selGroup = (outlineSel.enabled && state.selected && state.partsById[state.selected])
        ? state.partsById[state.selected].group : null;
      const hovGroup = (outlineHover.enabled && state.hovered && state.hovered !== state.selected && state.partsById[state.hovered])
        ? state.partsById[state.hovered].group : null;
      if(outlineSel.selectedObjects[0] !== selGroup) outlineSel.selectedObjects = selGroup ? [selGroup] : [];
      if(outlineHover.selectedObjects[0] !== hovGroup) outlineHover.selectedObjects = hovGroup ? [hovGroup] : [];
    }

    /* 指针悬停拾取：每帧最多一次 */
    if(hoverDirty){
      hoverDirty = false;
      if(state.pickMeshes.length){
        raycaster.setFromCamera(pointer, camera);
        const hit = raycaster.intersectObjects(state.pickMeshes, false)[0];
        setHover(hit ? hit.object.userData.partId : null);
      }
    }

    if(state.camTween){
      const tw = state.camTween;
      if(reducedMotion){
        camera.position.copy(tw.tp);
        controls.target.copy(tw.tt);
        state.camTween = null;
      }else{
        /* 墙钟驱动：rAF 挂起环境（看门狗 500ms 步进）下动画时长依然准确 */
        if(tw.start === undefined) tw.start = performance.now();
        const k = easeO(clamp((performance.now() - tw.start)/(tw.dur*1000), 0, 1));
        camera.position.lerpVectors(tw.fp, tw.tp, k);
        controls.target.lerpVectors(tw.ft, tw.tt, k);
        if(k >= 1) state.camTween = null;
      }
    }
    /* Tour 停留计时（走真实墙钟，低帧率/看门狗步进环境下停留时长依然准确） */
    if(state.tour && state.tour.playing){
      state.tour.wait -= rawDt;
      if(state.tour.wait <= 0){
        if(state.tour.i >= state.tour.ids.length - 1) stopTour();
        else tourStep(1);
      }
    }
    if(!controls.autoRotate && !state.userInteracted && ex===0) controls.autoRotateSpeed = 0.5;
    controls.update();

    deviceGroup.position.y = reducedMotion ? 0 : Math.sin(t*0.7)*0.1;
    if(!reducedMotion) particles.rotation.y = t*0.012;

    composer.render();
    try{ updateLabelsFrame(); }
    catch(e){ hooks.onLabelError && hooks.onLabelError(String((e && e.message) || e)); }
    updateMeasureTip();

    /* 帧率采样 → 自适应降档（watchdog 步进的帧不计入，否则 rAF 挂起环境会误判卡顿） */
    if(adaptive && booted && !viaWatchdog){
      fpsAcc += dt; fpsFrames++; fpsWindow += dt;
      if(fpsWindow >= 3){
        if(fpsFrames / Math.max(fpsAcc, 1e-4) < 42 && quality > 0) applyQuality(quality - 1);
        fpsAcc = fpsFrames = fpsWindow = 0;
      }
    }

    if(!booted){
      booted = true;
      syncOutlineEnabled();
      state.camTween = { t:0, dur:1.9, fp:camera.position.clone(), tp:CAM_HOME.clone(), ft:controls.target.clone(), tt:CAM_TARGET.clone() };
      hooks.onBooted && hooks.onBooted();
      emit();
    } else {
      const pct = Math.round(ex*100);
      if(pct !== lastEmitExp){ lastEmitExp = pct; emit(); }
    }
  }

  function animate(){
    if(!running) return;
    requestAnimationFrame(animate);
    try{ mainLoop(); }
    catch(err){
      if(!window.__animErr){ window.__animErr = (err && (err.stack || err.message)) || String(err); console.error(err); }
    }
  }
  animate();

  /* 看门狗：rAF 被挂起时低频续跑（前台 IAB 等环境），clock 差值保证不双重步进；后台标签页跳过以省电 */
  const watchdog = setInterval(()=>{ if(running && !document.hidden){ watchdogStep = true; mainLoop(); } }, 500);

  /* 待机自转（减少动态偏好下不启用） */
  let idleTimer = null;
  if(!reducedMotion){
    idleTimer = setTimeout(()=>{ if(!state.userInteracted){ controls.autoRotate = true; emit(); } }, 2600);
  }

  function onResize(){
    camera.aspect = innerWidth/innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight);
    composer.setSize(innerWidth, innerHeight);
  }
  window.addEventListener('resize', onResize);

  /* ---------- 缩略图拍摄（离线渲染脚本用）：整机取景 + 同步帧快照 ---------- */
  function thumbView(){
    state.labelsMode = 'off';
    controls.autoRotate = false;
    state.userInteracted = true;
    state.camTween = null;
    const fb = new THREE.Box3();
    deviceGroup.traverse(o=>{ if(o.isMesh) fb.expandByObject(o); });
    if(!fb.isEmpty()){
      const c = fb.getCenter(new THREE.Vector3());
      const R = fb.getSize(new THREE.Vector3()).length() / 2;
      const halfV = THREE.MathUtils.degToRad(camera.fov / 2);
      const half = Math.min(halfV, Math.atan(Math.tan(halfV) * camera.aspect));
      const dist = (R / Math.tan(half)) * 1.14;
      /* 拍摄方向：默认与大厅/首页相机同向；设备可配 thumbDir:[x,y,z]（设备指向相机的方向） */
      let dir = new THREE.Vector3(1, 0.5, 1.4);
      const td = state.device && state.device.thumbDir;
      if(Array.isArray(td) && td.length === 3 && td.every(isFinite) && Math.hypot(td[0], td[1], td[2]) > 1e-4){
        dir = new THREE.Vector3(td[0], td[1], td[2]);
      }
      camera.position.copy(c).addScaledVector(dir.normalize(), dist);
      controls.target.copy(c);
      controls.minDistance = Math.min(controls.minDistance, dist * 0.9);
      controls.maxDistance = Math.max(controls.maxDistance, dist * 2);
    }
    composer.render();
    emit();
  }
  function snapshot(type = 'image/webp', q = 0.88){
    composer.render();
    return renderer.domElement.toDataURL(type, q);
  }
  /* 部件特写小图：离屏 RT 直渲（不经 composer，主画面零干扰）。
     隐藏其余部件、以当前视角方向取景，返回 PNG dataURL。 */
  let thumbRT = null;
  function capturePartThumb(id, size = 352){
    const p = state.partsById[id];
    if(!p || !booted) return null;
    _bb.setFromObject(p.group);
    if(_bb.isEmpty()) return null;
    const c = _bb.getCenter(new THREE.Vector3());
    const radius = Math.max(_bb.getSize(new THREE.Vector3()).length() * 0.5, 1e-3);
    const dir = _v.copy(camera.position).sub(controls.target);
    if(![dir.x, dir.y, dir.z].every(isFinite) || dir.lengthSq() < 1e-6) dir.set(0.55, 0.38, 0.74);
    dir.normalize();
    const cam = new THREE.PerspectiveCamera(38, 1, radius * 0.01, radius * 60);
    cam.position.copy(c).addScaledVector(dir, radius / Math.sin(THREE.MathUtils.degToRad(19)) * 1.15);
    cam.lookAt(c);
    cam.updateMatrixWorld(true);
    const hidden = [];
    for(const [pid, q] of Object.entries(state.partsById)){
      if(pid === id || !q.group.visible) continue;
      q.group.visible = false; hidden.push(q.group);
    }
    const prevBg = scene.background;
    const prevClear = renderer.getClearColor(new THREE.Color());
    const prevAlpha = renderer.getClearAlpha();
    scene.background = null;
    renderer.setClearColor(0x0b1622, 1);
    const prevSel = state.selected, prevHover = state.hovered;
    state.selected = null; state.hovered = null; syncOutlineEnabled();
    /* 特写补光：场景灯按整机布置，背光部件在特写里近全黑——
       在特写相机位加一盏临时方向光，随 finally 移除 */
    const thumbLight = new THREE.DirectionalLight(0xffffff, 2.4);
    thumbLight.position.copy(cam.position);
    thumbLight.target.position.copy(c);
    scene.add(thumbLight); scene.add(thumbLight.target);
    modes.setCapHidden(true);   // 离屏 RT 无 stencil buffer，剖切盖板会整面误绘
    try {
      if(!thumbRT || thumbRT.width !== size){
        if(thumbRT) thumbRT.dispose();
        thumbRT = new THREE.WebGLRenderTarget(size, size, { samples: 4 });
        /* 直渲 RT 不走 OutputPass 的 sRGB 变换，显式指定目标色彩空间，
           否则 readRenderTargetPixels 读到线性值（特写近全黑） */
        thumbRT.texture.colorSpace = THREE.SRGBColorSpace;
      }
      const prevTarget = renderer.getRenderTarget();
      renderer.setRenderTarget(thumbRT);
      renderer.clear();
      renderer.render(scene, cam);
      renderer.setRenderTarget(prevTarget);
      const buf = new Uint8Array(size * size * 4);
      renderer.readRenderTargetPixels(thumbRT, 0, 0, size, size, buf);
      const cnv = document.createElement('canvas');
      cnv.width = cnv.height = size;
      const ctx = cnv.getContext('2d');
      const img = ctx.createImageData(size, size);
      for(let y = 0; y < size; y++){
        img.data.set(buf.subarray(y * size * 4, (y + 1) * size * 4), (size - 1 - y) * size * 4);
      }
      ctx.putImageData(img, 0, 0);
      return cnv.toDataURL('image/png');
    } finally {
      scene.remove(thumbLight); scene.remove(thumbLight.target);
      for(const g of hidden) g.visible = true;
      modes.setCapHidden(false);
      scene.background = prevBg;
      renderer.setClearColor(prevClear, prevAlpha);
      state.selected = prevSel; state.hovered = prevHover;
      syncOutlineEnabled();
    }
  }

  return {
    loadDevice, setExplode, setExplodeLayout, selectPart, setHover, setLabels, setAutoRotate,
    resetView, pickAt, onResize, thumbView, snapshot,
    flyToPart, setMode, isolate, setClipT,
    setMeasure, stepAssembly, stepNext, stepPrev,
    capturePartThumb,
    startTour, stopTour, tourNext, tourPrev,
    step: mainLoop,
    getCamera: () => camera,
    getPartOffset: (id) => {
      const p = state.partsById[id];
      return p ? +p.group.position.distanceTo(p.base).toFixed(4) : null;
    },
    getPartRotation: (id) => {
      const p = state.partsById[id];
      return p ? { x: +p.group.rotation.x.toFixed(4), y: +p.group.rotation.y.toFixed(4), z: +p.group.rotation.z.toFixed(4) } : null;
    },
    getState: () => ({ ...state,
      booted, autoRotate: controls.autoRotate,
      viewMode: modes.state.mode, isolateId: modes.state.isolateId, clipCap: modes.state.capKind,
      tool: state.measureOn ? 'measure' : null,
      step: state.stepMode && state.stepGroups ? { i: Math.round(state.stepCur), n: state.stepGroups.length } : null,
      demoActive: state.demoActive || null,
      /* parts/partsById 含 THREE 对象，不进响应式/跨页传输，只出计数字段 */
      partsCount: state.parts.length,
    }),
    dispose(){
      running = false;
      clearInterval(watchdog);
      clearTimeout(idleTimer);
      if(loadAbort) loadAbort.abort();
      window.removeEventListener('resize', onResize);
      modes.dispose();
      labelSystem.dispose();
      disposeDevice();
      renderer.dispose();
      if(composer.dispose) composer.dispose();
    }
  };
}
