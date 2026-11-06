/* =============================================================
   Teardown Engine — 设备无关的 3D 拆解引擎（纯 Vanilla ES Module）
   Vue 壳通过 createEngine(canvas, labelsRoot, hooks) 获得实例；
   引擎不知道任何 UI 框架的存在。
   3.0：OutlinePass 描边 · 开场装配演出 · flyToPart 镜头飞行 · Tour 导览 ·
        径向爆炸布局 · X光/隔离/剖切（view-modes.js） · SVG 引线标签（labels.js）
============================================================= */
import * as THREE from 'three';
import { analyseModel } from '../forge/qa.js';
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
import { fetchGlb, lastFetchSource } from './glbCache.js';
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
  /* AURORA R3：全项目渲染都走 composer（含缩略图/特写实例），renderer 的 MSAA
     backbuffer 从不参与最终输出——antialias:true 是纯白付成本，改由 composer RT
     samples:4 承担（见下）。特写捕获走自建 samples:4 RT，不受影响。 */
  const renderer = new THREE.WebGLRenderer({ canvas, antialias:false });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setSize(innerWidth, innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.12;

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x04070c, 0.02);

  let nightBgTex = null;   // 夜厅背景纹理（创建时生成；日厅另懒生成 hallBgTex）
  { /* 背景径向渐变 */
    const c = document.createElement('canvas'); c.width = c.height = 1024;
    const g = c.getContext('2d');
    const rg = g.createRadialGradient(512, 420, 60, 512, 512, 720);
    rg.addColorStop(0, '#0e1c2b'); rg.addColorStop(.55, '#071019'); rg.addColorStop(1, '#03050a');
    g.fillStyle = rg; g.fillRect(0,0,1024,1024);
    nightBgTex = new THREE.CanvasTexture(c); nightBgTex.colorSpace = THREE.SRGBColorSpace;
    scene.background = nightBgTex;
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

  /* AURORA PHASE 6 设备分级（一次性探测，声明于 composerRT 之前供 samples 联动） */
  function detectDeviceTier(){
    try{
      const mem = navigator.deviceMemory;                 // Chrome 近似 GB；Safari/Firefox undefined
      const cores = navigator.hardwareConcurrency || 4;
      if(mem !== undefined && mem <= 4) return 'low';
      if(mem !== undefined && mem >= 8 && cores >= 8) return 'high';
      return 'mid';
    }catch{ return 'mid'; }
  }
  const deviceTier = detectDeviceTier();

  /* ---------- 后期：OutlinePass（选中/悬停描边）+ 辉光 ---------- */
  /* 剖切 stencil 封盖要求渲染目标带 stencil buffer（composer 默认 RT 没有）：
     自建 HalfFloat+stencil RT 传入，renderTarget2 由 composer 克隆继承同配置。
     AURORA R3：RT 显式 4x MSAA（WebGL2 多采样 RT）——此前 renderer.antialias 对
     composer 输出无效（白付成本），RT 无 samples 则全馆锯齿裸奔；缩略图模式
     （adaptive=false）保持旧输出一致性不加 samples。 */
  const composerRT = new THREE.WebGLRenderTarget(innerWidth, innerHeight,
    { type: THREE.HalfFloatType, stencilBuffer: true, samples: (hooks.adaptive !== false) ? (deviceTier === 'low' ? 2 : 4) : 0 });
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
     L2 满配 → L1 pixelRatio 1.5 / 阴影 1024 → L0 pixelRatio 1 / 关辉光/描边 / 阴影 512
     AURORA PHASE 6：设备分级决定**起步档**——low 档（内存≤4GB）从 L1 起步，避免首屏
     帧率骤降触发看门狗连锁降档；mid（其余/探测不可用）/high 现状不变。
     纹理运行时降采样经评估缓行（2048 已是 lint 闸门口径）。 ---------- */
  const adaptive = hooks.adaptive !== false;
  let quality = adaptive && deviceTier === 'low' ? 1 : 2, fpsAcc = 0, fpsFrames = 0, fpsWindow = 0, watchdogStep = false;
  let renderCount = 0, frameMsAcc = 0;   // AURORA：渲染帧计数与帧耗累计（均值经 getState 暴露）
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

  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

  /* ---------- 灯光 / 地面 / 粒子 ---------- */
  const hemiLight = new THREE.HemisphereLight(0x44525f, 0x0a0e14, 0.55);
  scene.add(hemiLight);
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

  let grid, glow, glowWarm, warmLight, reticle, shadowPlane, particles, axisX, axisZ, axisMat;
  {
    /* V2 第五章 极简方向式坐标装置 → V5.1 P1-S3 样式移植（参考站细方格地面，自研重写）：
       极坐标环阵 → GridHelper(30, 60) 细密方格低透明铺底；地面 XYZ 轴线保留；
       gizmo（右下角罗盘）负责与相机同步的方向读数 */
    grid = new THREE.GridHelper(30, 60, 0x1c4f70, 0x102c42);
    grid.material.transparent = true; grid.material.opacity = 0.7;
    grid.position.y = -3.9; scene.add(grid);

    axisMat = new THREE.LineBasicMaterial({ color: 0x1e4a63, transparent: true, opacity: 0.9 });
    const axisGeoX = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-15, 0, 0), new THREE.Vector3(15, 0, 0)]);
    const axisGeoZ = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, -15), new THREE.Vector3(0, 0, 15)]);
    axisX = new THREE.Line(axisGeoX, axisMat); axisX.position.y = -3.88; scene.add(axisX);
    axisZ = new THREE.Line(axisGeoZ, axisMat); axisZ.position.y = -3.885; scene.add(axisZ);

    const gc = document.createElement('canvas'); gc.width = gc.height = 512;
    const gg = gc.getContext('2d');
    const rg = gg.createRadialGradient(256,256,20,256,256,250);
    rg.addColorStop(0,'rgba(69,224,255,.30)'); rg.addColorStop(.5,'rgba(69,224,255,.07)'); rg.addColorStop(1,'rgba(69,224,255,0)');
    gg.fillStyle = rg; gg.fillRect(0,0,512,512);
    const gtex = new THREE.CanvasTexture(gc); gtex.colorSpace = THREE.SRGBColorSpace;
    glow = new THREE.Mesh(new THREE.CircleGeometry(8, 48),
      new THREE.MeshBasicMaterial({ map:gtex, transparent:true, depthWrite:false, blending:THREE.AdditiveBlending }));
    glow.rotation.x = -Math.PI/2; glow.position.y = -3.89; scene.add(glow);

    /* V5.1 P1-S4 · 地面暖辉 + 暖色底光（参考站电影光口径）：橙色径向渐变铺在模型后侧地面，
       与暖点光（-6.5,-1.2,-5.5 后左低位）共同构成"冷主光 + 暖逆光"的双色氛围；日厅双隐 */
    const wc = document.createElement('canvas'); wc.width = wc.height = 512;
    const wg = wc.getContext('2d');
    const wgr = wg.createRadialGradient(256,256,20,256,256,250);
    wgr.addColorStop(0,'rgba(255,150,70,.42)'); wgr.addColorStop(.55,'rgba(255,130,50,.12)'); wgr.addColorStop(1,'rgba(255,130,50,0)');
    wg.fillStyle = wgr; wg.fillRect(0,0,512,512);
    const wtex = new THREE.CanvasTexture(wc); wtex.colorSpace = THREE.SRGBColorSpace;
    glowWarm = new THREE.Mesh(new THREE.CircleGeometry(7.5, 48),
      new THREE.MeshBasicMaterial({ map:wtex, transparent:true, opacity:0.8, depthWrite:false, blending:THREE.AdditiveBlending }));
    glowWarm.rotation.x = -Math.PI/2; glowWarm.position.set(-2.2, -3.885, -1.6); scene.add(glowWarm);
    warmLight = new THREE.PointLight(0xff9a45, 70, 34, 2);
    warmLight.position.set(-5.5, -0.8, -4.5); scene.add(warmLight);
    if(hooks.adaptive === false){ glowWarm.visible = false; warmLight.visible = false; }   // thumb 模式：保持既有缩略图光影口径

    /* V5.1 P3-S3 · 弹出件 reticle：虚线圆环 + 4 角刻线（参考站部件标示形态，自研实现）。
       单位半径几何 + 逐帧按部件包围球缩放；billboard 朝相机；depthTest 关（叠显不遮挡） */
    reticle = new THREE.Group();
    {
      const SEGS = 96, pts = [];
      for(let i = 0; i <= SEGS; i++){
        const a = i / SEGS * Math.PI * 2;
        pts.push(new THREE.Vector3(Math.cos(a), Math.sin(a), 0));
      }
      const ringMat = new THREE.LineDashedMaterial({
        color:0x45e0ff, transparent:true, opacity:0.62, dashSize:0.085, gapSize:0.065, depthTest:false });
      const ring = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), ringMat);
      ring.computeLineDistances();
      reticle.add(ring);
      for(let i = 0; i < 4; i++){
        const a = i / 4 * Math.PI * 2 + Math.PI / 4;
        const tick = new THREE.Line(new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(Math.cos(a) * 1.07, Math.sin(a) * 1.07, 0),
          new THREE.Vector3(Math.cos(a) * 1.2, Math.sin(a) * 1.2, 0),
        ]), ringMat);
        tick.computeLineDistances();
        reticle.add(tick);
      }
    }
    reticle.visible = false;
    reticle.renderOrder = 25;
    reticle.name = 'popReticle';
    scene.add(reticle);

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

  /* ---------- 精密环形展陈底座（V3 §09 六层结构 · 2026-11-03 雷达刻度盘升级） ----------
     顶面与设备地面接触面齐平（y=-3.9），设备位置不变；整组随 deviceRadius 缩放。
     层次：①承载墩身（双层立体：墩体+下基座）②台面 ③台缘 accent 定位环
          ④雷达刻度盘面（单张 canvas：外缘实线环 + 虚线同心环 ×2 + 三级放射刻度 + 30° 分段弧块，
            全部 hairline 线元素、无数字——不伪造测量；参考调研 REFERENCE_STUDY_2026-11-03 R1）
          ⑤外缘渐变弧光 ×2（顶点色沿弧长黑→accent→黑 + Additive：黑即不可见，纯氛围非数据）。
     坐标语义沿用网格/轴线（setGridVisible）与 gizmo，与盘面刻度视觉分离。
     不参与拾取（raycaster 只查 pickMeshes）；thumb 模式整组隐藏；双厅共享几何，setPedestalHall 只切材质。 */
  let plinth, plinthRing, plinthCap, stageDial, plinthBase, plinthRim;
  let dialMats = [], plumbLine = null;
  let setPlinthTop = () => {};   // 装载后由 finalize 按设备 hull 底面调用（创建块内赋值）
  /* V5.1 P1 · 展台三型（任务书 §4.1/§4.2）：category → 展台类型；device.presn.plinth 可覆盖。
     缩放只作用 x/z（半径放大），y 不缩放避免底座升沉；bbox 驱动的 k 由 finalize 写入。 */
  let plinthScaleK = 1;
  /* V5.1 P8-S1 · Viewer Presentation Config（任务书 §11.1）：每设备展示配置统一入口。
     device.presn 可逐台覆盖，未声明的键回退默认值——单一事实源，展示层不再散落读取。
     现有键：plinth（precision/industrial/large，null=按 category 映射）；
     预留：labelsMode/spaceAid（用户会话偏好优先，仅在无偏好时作为初始档）。 */
  function presnFor(device){
    const p = (device && device.presn) || {};
    return {
      plinth: ['precision', 'industrial', 'large'].includes(p.plinth) ? p.plinth : null,
      labelsMode: ['auto', 'all', 'off'].includes(p.labelsMode) ? p.labelsMode : null,
      spaceAid: ['off', 'simple', 'standard', 'engineering'].includes(p.spaceAid) ? p.spaceAid : null,
    };
  }
  function plinthTypeFor(device){
    const explicit = presnFor(device).plinth;
    if(explicit) return explicit;
    const c = (device && device.category) || '';
    if(/汽车|航天|飞机|飞行器/.test(c)) return 'large';
    if(/发动机|机械|工具|枪械|市政/.test(c)) return 'industrial';
    return 'precision';
  }
  function applyPlinthPreset(device){
    const type = plinthTypeFor(device);
    const bb = new THREE.Box3().setFromObject(deviceGroup);
    /* V5.1 P10-S1 · k 改按 XZ 足印驱动（原 3D maxDim/9.5 会低估大件——内燃机 XZ 超出盘缘）：
       盘半径须 ≥ 足印半宽 + 8% 边距；类型系数与足印 k 相乘后**统一钳制 ≤1.9**
       （足印钳 1.6 × large 1.35 曾叠加到 2.16——盘比车还大的反向失配） */
    const sz = bb.isEmpty() ? new THREE.Vector3(8, 8, 8) : bb.getSize(new THREE.Vector3());
    const xzSpan = Math.max(sz.x, sz.z);
    const typeMul = type === 'large' ? 1.35 : type === 'industrial' ? 1.06 : 1;
    plinthScaleK = clamp(clamp(xzSpan / (PED_BASE_R * 2 * 0.92), 0.85, 1.6) * typeMul, 0.85, 1.9);
    plinth.scale.set(plinthScaleK, 1, plinthScaleK);
    /* V5.1 P1-S4 · 铅垂点线：台面 → 设备顶（参考站中心轴虚线贯通口径）。实心设备装配态时
       线段隐入机身（无害）；浮动设备与爆炸态显形为中心轴参照。plumbLine 是 plinth 子节点且
       plinth 位于原点（local==world），setPlinthTop 已把 position.y 写为台面世界高——几何只存相对长度 */
    if(plumbLine && !bb.isEmpty()){
      const topWorld = bb.max.y - 0.05;
      const len = Math.max(0.1, topWorld - plumbLine.position.y);
      plumbLine.geometry.dispose();
      plumbLine.geometry = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, len, 0),
      ]);
      plumbLine.computeLineDistances();
    }
    return { type, k: +plinthScaleK.toFixed(2), xzSpan: +xzSpan.toFixed(2) };
  }
  const PED_BASE_R = 4.2;
  /* V5.1 P1-S4 · 底座形态移植（参考站"薄盘展台"）：高鼓墩身 → 薄盘（0.16 厚锥盘）+ 薄基板，
     台缘亮环（emissive Torus）承担参考站的 rim ring 视觉；台面锚定地面（浮动设备模型悬于其上，
     与参考站一致），落地钳制仅保留"模型底低于地面时台面随之下沉"。 */
  {
    plinth = new THREE.Group();
    plinth.name = 'plinth';   // 观测点名（P10-S1 探针读 scale.x 验证足印适配）

    const sideMat = new THREE.MeshStandardMaterial({ color:0x0d1722, metalness:.55, roughness:.42 });
    const body = new THREE.Mesh(new THREE.CylinderGeometry(PED_BASE_R + 0.14, PED_BASE_R + 0.02, 0.16, 72), sideMat);
    body.position.y = -3.9 - 0.08;
    body.receiveShadow = true;

    const capMat = new THREE.MeshStandardMaterial({ color:0x18283a, metalness:.4, roughness:.55 });
    plinthCap = new THREE.Mesh(new THREE.CylinderGeometry(PED_BASE_R + 0.14, PED_BASE_R + 0.14, 0.03, 72), capMat);
    plinthCap.position.y = -3.895;
    plinthCap.receiveShadow = true;

    const baseMat = new THREE.MeshStandardMaterial({ color:0x080e15, metalness:.6, roughness:.5 });
    plinthBase = new THREE.Mesh(new THREE.CylinderGeometry(PED_BASE_R + 0.34, PED_BASE_R + 0.42, 0.1, 72), baseMat);
    plinthBase.position.y = -4.05 - 0.05;
    plinthBase.receiveShadow = true;

    plinthRing = new THREE.Mesh(
      new THREE.TorusGeometry(PED_BASE_R + 0.13, 0.028, 10, 96),
      new THREE.MeshStandardMaterial({ color:0x0a2a36, emissive:0x45e0ff, emissiveIntensity:0.95, metalness:.3, roughness:.4 }));
    plinthRing.rotation.x = -Math.PI / 2;
    plinthRing.position.y = -3.9;

    /* ④ 陈列刻度盘（V5.1 P1-S3 参考站样式移植，自研几何实现——替代旧 canvas 雷达盘面）：
       细环 ×2 + 72 放射刻度（每 6 主刻加长）+ 断弧 Torus，全部 Additive 细线；
       整组随主循环 0.035rad/s 慢旋（陈列动画，非数据）。几何线稿在掠射角下比纹理锐利，
       且随 plinth x/z 缩放自适应（applyPlinthPreset / hull 缩放自动生效）。 */
    const FACE_R_OUT = PED_BASE_R + 1.5;
    stageDial = new THREE.Group();
    const dialAdd = (op) => new THREE.MeshBasicMaterial({
      color:0x45e0ff, transparent:true, opacity:op, depthWrite:false,
      blending:THREE.AdditiveBlending, side:THREE.DoubleSide });
    const flat = (m, y) => { m.rotation.x = -Math.PI / 2; m.position.y = y; return m; };
    stageDial.add(flat(new THREE.Mesh(
      new THREE.RingGeometry(PED_BASE_R + 0.4, PED_BASE_R + 0.408, 180), dialAdd(0.4)), 0));
    stageDial.add(flat(new THREE.Mesh(
      new THREE.RingGeometry(FACE_R_OUT + 0.14, FACE_R_OUT + 0.146, 180), dialAdd(0.22)), 0));
    { // 72 刻度：r1 起步，主刻（每 6 枚）+0.16 / 副刻 +0.07（P1-S4 提亮加长，参考站刻度环可见度口径）
      const N = 72, r1 = PED_BASE_R + 0.98;
      const tp = new Float32Array(N * 6);
      for(let i = 0; i < N; i++){
        const a = i / N * Math.PI * 2, len = i % 6 === 0 ? 0.16 : 0.07;
        const j = i * 6;
        tp[j]   = Math.cos(a) * r1;        tp[j+1] = 0; tp[j+2] = Math.sin(a) * r1;
        tp[j+3] = Math.cos(a) * (r1+len);  tp[j+4] = 0; tp[j+5] = Math.sin(a) * (r1+len);
      }
      const tg = new THREE.BufferGeometry();
      tg.setAttribute('position', new THREE.BufferAttribute(tp, 3));
      stageDial.add(new THREE.LineSegments(tg, new THREE.LineBasicMaterial({
        color:0x45e0ff, transparent:true, opacity:0.55, depthWrite:false, blending:THREE.AdditiveBlending })));
    }
    { // 断弧：细 Torus 弧段（1.12π），叠在刻度环上方，慢旋时成为盘面动势焦点
      const arc = new THREE.Mesh(
        new THREE.TorusGeometry(PED_BASE_R + 1.16, 0.008, 4, 90, Math.PI * 1.12), dialAdd(0.6));
      arc.rotation.x = -Math.PI / 2;
      arc.rotation.z = 0.38;
      arc.position.y = 0.012;
      stageDial.add(arc);
    }
    stageDial.position.y = -3.878;
    stageDial.renderOrder = 2;
    stageDial.name = 'stageDial';   // 观测点名（探针/验证脚本遍历用，与 __RAW/__CAM 同约定）
    dialMats = [];
    stageDial.traverse(o => { if(o.material) dialMats.push(o.material); });

    /* ⑤ 外缘渐变弧光 ×2：RingGeometry 扇段 + 顶点色正弦渐变（Additive 下黑=不可见）。
       细线克制口径：0.044 世界单位宽，亮度由 setPedestalHall 按厅收敛。 */
    plinthRim = new THREE.Group();
    const rimR = FACE_R_OUT + 0.1;
    const ACC = new THREE.Color(0x45e0ff);
    const mkArc = (lenDeg, rot, alpha) => {
      const geo = new THREE.RingGeometry(rimR - 0.022, rimR + 0.022, 96, 1, 0, lenDeg * Math.PI / 180);
      const pos = geo.attributes.position;
      const colors = new Float32Array(pos.count * 3);
      for(let i = 0; i < pos.count; i++){
        const ang = Math.atan2(pos.getY(i), pos.getX(i));
        const t = (ang < 0 ? ang + Math.PI * 2 : ang) / (lenDeg * Math.PI / 180);
        const k = Math.sin(Math.min(Math.max(t, 0), 1) * Math.PI) * alpha;
        colors[i*3] = ACC.r * k; colors[i*3+1] = ACC.g * k; colors[i*3+2] = ACC.b * k;
      }
      geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
      const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({
        vertexColors:true, transparent:true, opacity:.6, blending:THREE.AdditiveBlending,
        depthWrite:false, side:THREE.DoubleSide }));
      m.rotation.x = -Math.PI / 2;
      m.rotation.z = rot;          // Euler XYZ：先盘面内旋转，再放平
      m.position.y = -3.87;
      return m;
    };
    plinthRim.add(mkArc(96, Math.PI * 0.08, 1), mkArc(58, Math.PI * 0.72, .62));

    /* 铅垂点线（V5.1 P1-S3 坐标空间移植）：台面中心 → 设备下部 45% 高度的中心轴参照。
       LineDashedMaterial 需按实际长度重建几何（虚线段长不随 scale 拉伸）；空间辅助
       standard/engineering 档显示（applySpaceAid），off/simple 收起 */
    plumbLine = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 1, 0)]),
      new THREE.LineDashedMaterial({ color:0x45e0ff, transparent:true, opacity:0.3, dashSize:0.14, gapSize:0.11 }));
    plumbLine.position.y = -3.9;   // 默认台面高（groundKeep/未调 setPlinthTop 的设备不至于悬在场景中部）
    plumbLine.visible = false;
    plumbLine.renderOrder = 1;
    plumbLine.name = 'plumbLine';   // 观测点名（部件 axisLine 也是 LineDashedMaterial，探针需按名区分）

    plinth.add(body, plinthCap, plinthBase, plinthRing, stageDial, plinthRim, plumbLine);
    scene.add(plinth);
    if(hooks.adaptive === false) plinth.visible = false;   // thumb 模式（旧缩略图一致性）

    /* V3 §9.1 接地：台面高度随设备 hull 底面动态调整（博物馆展台本就该各件不同高）。
       墩身向下延伸至地面（y=-4.05），底座步层固定于地面——只长高、不悬空。
       device.groundOffset（米）可逐台微调；'keep' 保持固定台面（-3.9，兼容特殊机位调校）。
       V5.1 P1-S4：台面锚定地面（topY 不高于 -3.92——浮动设备模型悬于薄盘上方，参考站口径）；
       落地钳制改为仅"模型底低于地面时台面随之下沉"（Math.min）。 */
    const PLINTH_FLOOR = -4.05;
    const BODY_H = 0.16;
    setPlinthTop = (topY) => {
      const dy = topY - (-3.9);
      body.scale.y = (BODY_H + dy) / BODY_H;
      body.position.y = -3.9 - BODY_H / 2 + dy / 2;
      plinthCap.position.y = -3.895 + dy;
      plinthRing.position.y = -3.9 + dy;
      stageDial.position.y = -3.878 + dy;
      plinthRim.children.forEach(a => { a.position.y = -3.87 + dy; });
      plinthBase.position.y = PLINTH_FLOOR - 0.05;
      if(plumbLine) plumbLine.position.y = topY;   // 铅垂线从台面起（长度由 applyPlinthPreset 按设备写）
    };
  }
  function setPedestalHall(mode){
    const day = mode === 'day';
    plinth.children[0].material.color.setHex(day ? 0xdde4ea : 0x0d1722);
    plinth.children[0].material.roughness = day ? .65 : .42;
    plinthCap.material.color.setHex(day ? 0xf0f4f8 : 0x18283a);
    plinthBase.material.color.setHex(day ? 0xcfd8de : 0x080e15);
    plinthRing.material.emissiveIntensity = day ? 0.35 : 0.95;
    /* 刻度盘：夜厅冷青 Additive 细线；日厅换 Normal 混合暖石墨浅刻线
       （Additive 在纸面上发灰即隐——参考站为纯夜厅应用，日厅口径沿用 V3 白模厅克制） */
    dialMats.forEach(m => {
      m.blending = day ? THREE.NormalBlending : THREE.AdditiveBlending;
      m.color.setHex(day ? 0x6f6553 : 0x45e0ff);
      m.opacity = day ? 0.46 : Math.min(0.7, m.userData.baseOp || (m.userData.baseOp = m.opacity));
    });
    if(plumbLine) plumbLine.material.color.setHex(day ? 0x6f6553 : 0x45e0ff);
    /* 弧光：日厅收敛为点缀（Additive 在纸面上会发灰，压低即隐） */
    plinthRim.children.forEach(a => { a.material.opacity = day ? .1 : .6; });
  }

  /* 坐标辅助：网格显隐（V2）——网格与轴线一起，地面光晕与接触阴影保留 */
  function setGridVisible(v){
    state.gridVisible = !!v;
    /* V5.1 P1：统一走空间辅助档位（旧布尔开关兼容映射——开=standard 关=off），
       避免与 setSpaceAid 双写 grid.visible 的单一事实源冲突 */
    state.spaceAid = v ? 'standard' : 'off';
    applySpaceAid();
  }

  /* ---------- 设备容器与状态 ---------- */
  const deviceGroup = new THREE.Group();
  scene.add(deviceGroup);

  /* ---------- 白天/黑夜双厅（V2）----------
     夜厅 = 现状（深空冷光 + 星点 + 霓虹轮辉）；日厅 = 明亮美术馆（浅色渐变 + 高环境光 + 霓虹收敛 + 星点隐藏）。
     只动光照/背景/氛围层，不改模型与取景；reduced-motion 不受影响。 */
  let hallBgTex = null;   // 日厅背景纹理懒生成缓存
  let hallTween = null;   // 双厅切换渐变（0.6s 灯光渐变，V2 第二章 2.5）
  const NIGHT = {
    fog: 0x04070c, fogDensity: 0.02, hemi: [0x44525f, 0x0a0e14, 0.55],
    key: 2.4, rim1: 1.1, rim2: 0.55, front: 8, exposure: 1.12,
    bloom: 0.42, grid: [0x14364a, 0x0b1e2c], glowOpacity: 1, shadow: 0.38, stars: true,
    warm: 70, glowWarmOpacity: 0.8,   // V5.1 P1-S4：暖逆光 + 地面暖辉（参考站电影光口径）
  };
  const DAY = {
    fog: 0xd9e2ea, fogDensity: 0.013, hemi: [0xf2f6fa, 0x99a3ad, 0.95],
    key: 2.0, rim1: 0.3, rim2: 0.16, front: 3, exposure: 1.0,
    bloom: 0.16, grid: [0xa9b7c3, 0x96a5b2], glowOpacity: 0.22, shadow: 0.26, stars: false,
    warm: 2, glowWarmOpacity: 0,   // 日厅：暖光收敛为极弱点缀（纸面不留橙池）
  };
  function makeHallBg(top, mid, base){
    const c = document.createElement('canvas'); c.width = c.height = 1024;
    const g = c.getContext('2d');
    const rg = g.createRadialGradient(512, 420, 60, 512, 512, 720);
    rg.addColorStop(0, top); rg.addColorStop(.55, mid); rg.addColorStop(1, base);
    g.fillStyle = rg; g.fillRect(0, 0, 1024, 1024);
    const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }
  function setHallMode(mode){
    const C = mode === 'day' ? DAY : NIGHT;
    state.hallMode = mode === 'day' ? 'day' : 'night';
    if(mode === 'day'){
      if(!hallBgTex) hallBgTex = makeHallBg('#e8eef4', '#cfd9e2', '#b4c1cd');
      scene.background = hallBgTex;
    }else{
      scene.background = nightBgTex;
    }
    /* 瞬时切换项（显隐/结构类）；光强/雾/曝光/辉光走 hallTween 0.6s 渐变 */
    grid.visible = state.gridVisible !== false;
    axisX.visible = state.gridVisible !== false; axisZ.visible = state.gridVisible !== false;
    particles.visible = C.stars;
    setPedestalHall(mode);
    /* V2 第二章 2.5：灯光/雾/曝光/辉光 0.6s 渐变过渡（背景纹理为一次性切换，CSS 侧同步过渡） */
    hallTween = {
      t: 0,
      from: {
        hemiC0: hemiLight.color.clone(), hemiC1: hemiLight.groundColor.clone(), hemiI: hemiLight.intensity,
        keyI: key.intensity, r1: rim1.intensity, r2: rim2.intensity, frontI: front.intensity,
        exposure: renderer.toneMappingExposure, bloomS: bloom.strength,
        fogC: scene.fog.color.clone(), fogD: scene.fog.density,
        glowO: glow.material.opacity, shadowO: shadowPlane.material.opacity, gridO: grid.material.opacity,
        glowWarmO: glowWarm.material.opacity, warmI: warmLight.intensity,
        axisO: axisMat.opacity,
      },
      to: C, mode,
    };
    emit();
  }
  function applyHallFrame(k){
    const A = hallTween.from, B = hallTween.to;
    /* V4.1 照明治理：device.lightBoost（默认 1）按倍率提升 key/hemi 强度——
       供深色材质设备（黑色机身在深夜馆模型区亮度不足）逐台微调，双厅同乘 */
    const boost = (state.device && state.device.lightBoost) || 1;
    hemiLight.color.lerpColors(A.hemiC0, new THREE.Color(B.hemi[0]), k);
    hemiLight.groundColor.lerpColors(A.hemiC1, new THREE.Color(B.hemi[1]), k);
    hemiLight.intensity = (A.hemiI + (B.hemi[2] - A.hemiI) * k) * boost;
    key.intensity = (A.keyI + (B.key - A.keyI) * k) * boost;
    rim1.intensity = (A.r1 + (B.rim1 - A.r1) * k) * boost;   /* 轮廓塑形：黑机身设备的边缘可读性随 boost */
    rim2.intensity = (A.r2 + (B.rim2 - A.r2) * k) * boost;
    rim1.intensity = A.r1 + (B.rim1 - A.r1) * k;
    rim2.intensity = A.r2 + (B.rim2 - A.r2) * k;
    front.intensity = A.frontI + (B.front - A.frontI) * k;
    renderer.toneMappingExposure = A.exposure + (B.exposure - A.exposure) * k;
    bloom.strength = A.bloomS + (B.bloom - A.bloomS) * k;
    scene.fog.color.lerpColors(A.fogC, new THREE.Color(B.fog), k);
    scene.fog.density = A.fogD + (B.fogDensity - A.fogD) * k;
    glow.material.opacity = A.glowO + (B.glowOpacity - A.glowO) * k;
    /* V5.1 P1-S4：暖辉/暖光随双厅渐变 */
    glowWarm.material.opacity = A.glowWarmO + (B.glowWarmOpacity - A.glowWarmO) * k;
    warmLight.intensity = A.warmI + (B.warm - A.warmI) * k;
    shadowPlane.material.opacity = A.shadowO + (B.shadow - A.shadowO) * k;
    grid.material.opacity = A.gridO + ((hallTween.mode === 'day' ? 0.35 : 0.7) - A.gridO) * k;
    axisMat.opacity = A.axisO + ((hallTween.mode === 'day' ? 0.4 : 0.9) - A.axisO) * k;  }

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
    hiddenParts: [],                 // V5.1 P2 · 单部件隐藏（任务书 §6.1 Hide/Show）——id 数组经 getState 暴露
    loadTiming: null,                // AURORA PHASE 4：装载分环节打点（loadDevice 每次装载重建）
    plinthType: null,                // V5.1 P1：展台三型（precision/industrial/large，装载时选型）
    demoSpeed: 1, demoClock: 0,      // V4.0 MI②：统一演示时钟（积分 dt×speed）与播放速度乘子
    selected: null, hovered: null,
    labelsMode: 'auto',              // 'auto' | 'all' | 'off'
    spaceAid: 'standard',            // V5.1 P1 空间辅助档位：'off' | 'simple' | 'standard' | 'engineering'
    scrubbing: false,
    camTween: null, modelStatus: '',
    tour: null,                      // { ids, i, wait, playing }
    flewTo: null,                    // 最近 flyToPart 的部件（点空白飞回全景的依据）
    popped: null,                    // V5.1 P3-S3 单件拆解：当前弹出部件 id（点同件归位/点他件轮换）
    popMoving: false,                // 弹出/归位动画进行中（R1 全速渲染判据）
  };
  let bboxHelper = null;   // engineering 档包围盒辅助（声明前置见 applySpaceAid 注记）
  applySpaceAid();   // V5.1 P1-S3：初始档位（standard）落盘——铅垂点线等空间辅助件随默认档显隐（state 声明后才可调，避开 TDZ）

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
  /* AURORA PHASE 3 · I4 选中层次（任务书 §6.2）：选中时**其他零件弱化**——
     部件材质透明度渐变至 0.32（baseOpacity×dimK），取消选中/悬停收敛后逐帧还原并
     恢复原 transparent 标志。xray/isolate 模式下不启用（它们的材质透明语义独立，避免叠加）。 */
  const DIM_LEVEL = 0.32;
  function applyGlow(dt, t){
    const kBase = outlineOn && quality > 0 ? 0.06 : 0.12;
    const dimOn = !!state.selected && modes.state.mode !== 'xray' && modes.state.mode !== 'isolate';
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
      /* 非选中弱化：dimK 逐帧收敛；材质只在偏离稳态时写（收敛/还原后停写）。
         V5.1 P3/P4 · 三级层次：选中件 → 相连件（mech 边对端，保持原亮度）→ 其他弱化。 */
      const dimT = (dimOn && p.data.id !== state.selected && !(state._connSet && state._connSet.has(p.data.id))) ? DIM_LEVEL : 1;
      p.dimK = p.dimK === undefined ? 1 : p.dimK;
      p.dimK += (dimT - p.dimK) * Math.min(dt*7, 1);
      const settled = dimT === 1 && p.dimK > 0.999;
      if(!settled){
        const kk = clamp(p.dimK, DIM_LEVEL, 1);
        p.mats.forEach(m=>{
          if(m.userData.__baseOpacity === undefined){
            m.userData.__baseOpacity = m.opacity;
            m.userData.__baseTransparent = m.transparent;
          }
          m.transparent = true;
          m.opacity = m.userData.__baseOpacity * kk;
          if(dimT === 1 && kk >= 0.999){   // 还原闭环：精确回原状（含 transparent 标志）
            m.opacity = m.userData.__baseOpacity;
            m.transparent = m.userData.__baseTransparent;
          }
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
    bvhJob++;              // 打断在途的增量 BVH 构建任务
    state.parts = []; state.partsById = {}; state.pickMeshes = [];
    state.selected = null; state.hovered = null; state.flewTo = null;
    state.popped = null; state.popMoving = false; state.popUntil = 0;   // V5.1 P3-S3：切台清弹出态
    state.explodeCurrent = 0; state.explodeTarget = 0; state.explodeBasis = null;
    state.explodeSpeed = 0.9; state.explodeLayout = 'axis';
    state.stepMode = false; state.stepCur = 0; state.stepTarget = 0;
    state.stepGroups = null; state.stepExitPending = false; state.stepEmitPending = false;
    state.demos = null; state.demoActive = null;
    state.demoSpeed = 1; state.demoClock = 0;   // V4.0 MI②：切台复位统一时钟
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
  let curCamDist = 1;
  let introPushDone = false;   // 开场推近只做一次（首次装载的 intro）
  /* 竖屏取景修正（审计 P0-1）：aspect < 1 时水平视场收窄，按 ~1/aspect 拉远相机保证主体完整可见。
     横屏 aspect ≥ 1 恒为 1，桌面历史取景零影响；1.05 为留白余量，2.6 为极端窄屏上限。 */
  function portraitBoost(){
    const a = innerWidth / Math.max(innerHeight, 1);
    return a < 1 ? Math.min(1 / a, 2.6) * 1.05 : 1;
  }
  function applyCamHomes(){
    const b = portraitBoost();
    CAM_HOME.copy(CAM_HOME_BASE).multiplyScalar(curCamDist * b);
    CAM_EXPLODE.copy(CAM_EXPLODE_BASE).multiplyScalar(curCamDist * b);
    controls.maxDistance = Math.max(36, 36 * curCamDist * b);
  }
  async function loadDevice(device, opts = {}){
    const token = ++loadSeq;   // 装载序号：切换设备后，旧装载的网络/解析回调一律作废
    if(loadAbort) loadAbort.abort();   // 旧设备的下载不再占用带宽
    loadAbort = new AbortController();
    const signal = loadAbort.signal;
    const intro = opts.intro !== false && adaptive;   // 缩略图渲染器不开场
    window.__LOADS = (window.__LOADS || []).concat(device.id + '@' + (Date.now() % 100000));
    /* AURORA PHASE 4 装载分环节打点（任务书 §8.1）：fetch / parse(含 draco) / scene(归一化映射) /
       finalize / firstRender / bvh(分帧累计)——经 getState().loadTiming 暴露，探针程序化读取；
       DevTools 时间轴同步 performance.mark（观测面与代码面同值）。 */
    const _lt = { id: device.id, t0: performance.now(), cached: false, bytes: 0,
      fetchMs: 0, parseMs: 0, sceneMs: 0, finalizeMs: 0, doneMs: 0, firstRenderMs: 0, bvhMs: 0 };
    state.loadTiming = _lt;
    performance.mark('gewu-load-start');
    disposeDevice();
    state.device = device;
    state.hiddenParts = [];   // V5.1 P2：切台清空单件隐藏集（新台从全可见开始）
    state.demos = Array.isArray(device.demos) ? device.demos : null;
    state.demoActive = null;
    /* 每设备相机距离：大尺寸设备按比例拉远；竖屏另乘取景修正 */
    curCamDist = device.camDist || 1;
    applyCamHomes();
    key.shadow.camera.left = key.shadow.camera.bottom = -11*curCamDist;
    key.shadow.camera.right = key.shadow.camera.top = 11*curCamDist;
    key.shadow.camera.updateProjectionMatrix();
    /* OutlinePass 强调色随设备换肤 */
    if(outlineSel && device.accent){
      try{ _color.set(device.accent); outlineSel.visibleEdgeColor.copy(_color); }catch{}
    }
    state.modelStatus = device.glb ? 'LOADING 0%' : 'PROCEDURAL';
    emit();
    const _sp0 = performance.now();
    buildProceduralParts(device);
    labelSystem.build(state.parts);
    _lt.sceneMs += Math.round(performance.now() - _sp0);
    if(!device.glb){
      const _sf0 = performance.now();
      finalize(intro);
      _lt.finalizeMs = Math.round(performance.now() - _sf0);
      _lt.doneMs = Math.round(performance.now() - _lt.t0);
      performance.mark('gewu-load-done');
      return;
    }
    const loader = new GLTFLoader();
    /* 无条件挂单例 Draco 解码器：对未压缩文件无副作用，且杜绝配置漏标 draco 导致的装载失败 */
    loader.setDRACOLoader(getDracoLoader());
    try{
      /* GLB 均为单文件自包含：优先命中 Cache Storage，未命中流式下载（带进度）并回填 */
      const _sf0 = performance.now();
      const buffer = await fetchGlb(device.glb, (loaded, total)=>{
        if(token !== loadSeq || !total) return;
        if(total) _lt.bytes = total;
        state.modelStatus = 'LOADING ' + Math.round(loaded/total*100) + '%';
        emit();
      }, signal);
      if(token !== loadSeq) return;   // 等待期间已切换设备：丢弃本次结果
      _lt.fetchMs = Math.round(performance.now() - _sf0);
      _lt.cached = lastFetchSource() === 'cache';
      performance.mark('gewu-load-fetched');
      state.modelStatus = 'PARSING';
      emit();
      const _sp0 = performance.now();
      const gltf = await new Promise((resolve, reject)=> loader.parse(buffer, '', resolve, reject));
      if(token !== loadSeq) return;
      _lt.parseMs = Math.round(performance.now() - _sp0);
      performance.mark('gewu-load-parsed');
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
        /* 映射标定观测点（__RAW 同约定）：mapByPosition 收到的 p/rel 即此帧系，校准阈值用它 */
        window.__MAPPTS = localPts.map(m => ({ name: m.name, p: [+m.p.x.toFixed(2), +m.p.y.toFixed(2), +m.p.z.toFixed(2)] }));
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
          if(!p || !byPart[pid]) continue;   // 防御：realPartIds 引用了未注册部件时降级为程序化外观
          p.group.clear();
          p.group.add(byPart[pid]);
          p.base.set(0,0,0);
          p.group.position.set(0,0,0);
          collectGlowMats(p);
          /* GLB 合并替换了组内网格：演示状态作废（D.strokes 等缓存引用旧网格/空组），
             下一帧按真实网格重建——修复「选中早于合并 → 演示永远写不进真实网格」竞态 */
          p.__demo = null;
        }
        /* 资产↔配置对账（审计 P2-16）：未被任何部件消费的网格分组会被静默丢弃，
           资产重导出/改名后展品会"凭空少一块"。当前静态校验为 0 命中，此告警防未来回归。 */
        { const consumed = new Set(device.realPartIds || []);
          const dropped = Object.keys(byPart).filter(pid => !consumed.has(pid));
          if(dropped.length){
            const n = dropped.reduce((s, pid) => s + byPart[pid].children.length, 0);
            const msg = `[mapping] ${device.id}：${n} 个网格未接入任何部件（pid: ${dropped.slice(0, 5).join(', ')}${dropped.length > 5 ? ' …' : ''}）`;
            (window.__LOAD_WARN = (window.__LOAD_WARN || []).concat(msg));
            console.warn(msg);
          } }
        deviceGroup.updateMatrixWorld(true);

        /* 设备特有后处理（传感器对位、保护镜、点亮屏幕等） */
        if(device.postLoad) device.postLoad({ partsById: state.partsById, addLiveScreen });

        _lt.sceneMs += Math.round(performance.now() - _sp0);   // 归一化/映射/后处理段
        const _sf1 = performance.now();
        finalize(intro);
        _lt.finalizeMs = Math.round(performance.now() - _sf1);
        _lt.doneMs = Math.round(performance.now() - _lt.t0);
        performance.mark('gewu-load-done');
      }
    }catch(err){
      if(token !== loadSeq) return;   // 已被新装载/切换取代：不覆盖当前状态
      if(err && err.name === 'AbortError') return;   // 切台/卸载主动中止：正常路径，不当错误打印
      console.error('GLB 装载/接入失败，保留程序化模型\n', (device && device.id) || '?', '\n', err && err.stack || err);
      window.__LOAD_ERR = (err && (err.stack || err.message)) || String(err || 'GLB load failed');
      state.modelStatus = 'FALLBACK · PROCEDURAL';
      if(token === loadSeq){
        finalize(intro);
        _lt.doneMs = Math.round(performance.now() - _lt.t0);
      }
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
      /* V5.1 P3-S3 · 弹出件 reticle 缓存：部件包围球心（世界系相对 group 原点）+ 半径 */
      if(!_bb.isEmpty()){
        p.popCenter = _bb.getCenter(new THREE.Vector3()).sub(p.group.position).sub(deviceGroup.position);
        /* reticle 半径取最长边半长×1.35（包围球对角线会把扁平件圆环撑过大半台） */
        p.popRadius = Math.max(..._bb.getSize(new THREE.Vector3()).toArray()) / 2;
      }
      if(p.axisLine){
        p.axisLine.geometry.setFromPoints([p.base.clone(), p.base.clone().add(p.worldOffset || p.offset)]);
        p.axisLine.computeLineDistances();
      }
    }
    state.pickMeshes = [];
    deviceGroup.traverse(o=>{ if(o.isMesh) state.pickMeshes.push(o); });
    { const T = THREE, fb = new T.Box3(); deviceGroup.traverse(o=>{ if(o.isMesh) fb.expandByObject(o); });
      if(window.__RAW) window.__RAW.finalBbox = fb.getSize(new T.Vector3()).toArray().map(v=>+v.toFixed(2));
      /* 整机真实 hull（mesh 级合并包围盒）：flyToPart 小部件取景用。
         不能用 p.base 半径 —— GLB 直映射件的坐标在 mesh 上，group 全在原点会低估（iphone-13 实测 3.9 vs 7.9） */
      if(!fb.isEmpty()){
        state.hullRadius = +fb.getSize(new T.Vector3()).length().toFixed(3) / 2;
        const hc = fb.getCenter(new T.Vector3());
        state.hullCenter = [+hc.x.toFixed(2), +hc.y.toFixed(2), +hc.z.toFixed(2)];
        /* V3 接地 + V4 治理：台面基准用"网格级稳健下沿"——最低四分位 mesh-min 的中位数。
           官方/社区 GLB 常含远处杂点网格（如 s22-ultra 配件跨度 14u），raw bbox 底会让展台沉入地下；
           四分位中位把少数离群 mesh 滤掉，同时"少腿着地"类模型（钢琴）最低 25% 仍在腿部区域。 */
        if(hooks.adaptive !== false && device.groundKeep !== true){
          const mins = [];
          deviceGroup.traverse(o => { if(o.isMesh){ const b = _bb.setFromObject(o); if(!b.isEmpty()) mins.push(b.min.y); } });
          mins.sort((a,b) => a-b);
          const q = Math.max(1, Math.ceil(mins.length * 0.25));
          const mid = q >> 1;
          const robustBottom = mins.length ? (q % 2 ? mins[mid] : (mins[mid-1] + mins[mid]) / 2) : -3.9;
          /* V5.1 P1-S4 · 台面锚定地面：浮动设备（无人机等）台面不随 hull 底面抬升——
             模型悬于薄盘上方（参考站口径）；仅当模型底低于地面（落地式切入地面）时台面随之下沉 */
          setPlinthTop(Math.min(robustBottom - 0.02, -3.92) - (device.groundOffset || 0));
        }
      } }
    /* 径向布局半径：装配态部件基准位置的包围球半径 */
    { const bb = new THREE.Box3();
      for(const p of state.parts) bb.expandByPoint(p.base);
      state.deviceRadius = bb.isEmpty() ? 5 : Math.max(2.2, bb.getSize(new THREE.Vector3()).length()/2); }
    /* 展台随设备缩放：半径 = hull×0.66（mesh 级真实包围，deviceRadius 对 GLB 直映射件低估），钳制 [2.6, 6.4] */
    { const rr = state.hullRadius || state.deviceRadius;
      const pr = clamp(rr * 0.66, 2.6, 6.4), k = pr / PED_BASE_R;
      plinth.scale.set(k, 1, k); }
    captureExplodeBasis(CAM_EXPLODE);
    /* V4.1：设备级 lightBoost 装载即生效（切厅走 applyHallFrame；无切厅动作时在此补挂） */
    if (!hallTween) {
      const boost = device.lightBoost || 1;
      if (boost !== 1) {
        const C = state.hallMode === 'day' ? DAY : NIGHT;
        hemiLight.intensity = C.hemi[2] * boost;
        key.intensity = C.key * boost;
        rim1.intensity = C.rim1 * boost;
        rim2.intensity = C.rim2 * boost;
      }
    }
    /* rAF 停摆环境下立即同步位置并渲染一帧 */
    for(const p of state.parts){ p.group.position.copy(p.base).addScaledVector(p.worldOffset || p.offset, 0); }
    /* 开场演出：以 55% 爆炸散开状态出现，1.4s 内自动装配（首次装载且非缩略图模式） */
    if(intro && !booted){
      state.explodeCurrent = 0.55;
      state.explodeTarget = 0;
      state.explodeSpeed = 0.42;
      camera.position.copy(CAM_EXPLODE).multiplyScalar(1.42).add(new THREE.Vector3(0, 2.2, 0));
    }
    /* 开场推近：从散开远景滑向取景位（此刻 CAM_HOME 已含 camDist 与竖屏修正）；
       introPush 独立于 booted（booted 在引擎首帧即翻转，不能在此复用） */
    if(intro && !introPushDone){
      introPushDone = true;
      state.camTween = { t:0, dur:1.9, fp:camera.position.clone(), tp:CAM_HOME.clone(), ft:controls.target.clone(), tt:CAM_TARGET.clone() };
    }
    composer.render();
    updateLabelsFrame();
    /* 取景调试观测点（与 __RAW/__ENGINE 同约定）：pos/home/explode/boost/aspect */
    window.__CAM = {
      pos: camera.position.toArray().map(v => +v.toFixed(1)),
      home: CAM_HOME.toArray().map(v => +v.toFixed(1)),
      explode: CAM_EXPLODE.toArray().map(v => +v.toFixed(1)),
      boost: +portraitBoost().toFixed(2),
      aspect: +(innerWidth / Math.max(innerHeight, 1)).toFixed(3),
      maxDist: controls.maxDistance,
    };
    /* V5.1 P1 · 展台三型自适应：category/presn 选型 + bbox 驱动 x/z 缩放（装载完成实测） */
    const _pp = applyPlinthPreset(device);
    state.plinthType = _pp.type;
    scheduleBVH();   // 悬停/点击拾取与测量共用 BVH（审计 P0-2）
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
    if(t <= 0.001) state.popped = null;   // V5.1 P3-S3：全局归位=弹出件一并回位
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
      /* 先补齐装配再交还爆炸系统，避免两套插值口径跳变；退出用更快的补齐速度 */
      state.stepTarget = state.stepGroups.length;
      state.stepExitPending = true;
      state.stepEmitPending = true;
      state.stepSpeed = 3.2;
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
  /* spin 演示的枢轴修正：GLB 拆解件的组枢轴常不在几何中心，
     直接转 group 会「公转」。按 bbox 中心建内枢轴组并补偿子件位移，
     世界位姿不变；退出归零后保留（identity 无副作用）。 */
  const _viewDir = new THREE.Vector3();   // getViewDir 复用
  function ensureSpinPivot(p){
    if(p.__spinPivot) return p.__spinPivot;
    const g = p.group;
    const bb = _bb.setFromObject(g);
    if(bb.isEmpty()) return g;
    const c = bb.getCenter(new THREE.Vector3());
    g.worldToLocal(c);
    const pivot = new THREE.Group();
    pivot.position.copy(c);
    g.add(pivot);
    for(const k of [...g.children]){
      if(k === pivot) continue;
      k.position.sub(c);
      pivot.add(k);
    }
    p.__spinPivot = pivot;
    return pivot;
  }

  /* 视觉原理演示主循环。V3.0 forge 扩展：d.also = 伴随演示条目 —— 选中主部件时
     同步驱动其他部件（曲轴旋转 + 活塞连杆往复的跨部件联动），生命周期与主条目一致；
     不影响既有单部件演示（正文逻辑原样提取为 stepDemo）。 */
  function runDemos(dt, t){
    if(!state.demos || !state.demos.length || reducedMotion) return;
    for(const d of state.demos){
      const p = state.partsById[d.partId];
      if(p) stepDemo(p, d, state.selected === d.partId, dt, t, d.label || null);
      for(const c of (d.also || [])){
        const p2 = state.partsById[c.partId];
        if(p2) stepDemo(p2, c, state.selected === d.partId, dt, t, null);
      }
    }
  }
  function stepDemo(p, d, active, dt, t, label){
    if(active && !p.__demo){
      const target = d.spinPivot === 'center' ? ensureSpinPivot(p) : p.group;
      p.__demo = { base: { x: target.rotation.x, y: target.rotation.y, z: target.rotation.z }, t: 0, target };
      if(label){ state.demoActive = label; emit(); }
    }else if(!active && p.__demo && !p.__demo.exit){
      p.__demo.exit = true;
      p.__demo.t = 0;
      p.__demo.fromRot = { x: p.__demo.target.rotation.x, y: p.__demo.target.rotation.y, z: p.__demo.target.rotation.z };
    }
    const D = p.__demo;
    if(!D) return;
    if(D.exit){
      D.t = Math.min(1, D.t + dt * 2.2);
      const k = easeIO(D.t);
      D.target.rotation.x = D.fromRot.x + (D.base.x - D.fromRot.x) * k;
      D.target.rotation.y = D.fromRot.y + (D.base.y - D.fromRot.y) * k;
      D.target.rotation.z = D.fromRot.z + (D.base.z - D.fromRot.z) * k;
      /* stroke 演示：mesh 位置同步缓动回 base（与旋转退出同一段 t） */
      if(D.strokes){
        if(!D.fromStrokes) D.fromStrokes = D.strokes.map(s => ({ o: s.o, from: s.o.position.clone(), base: s.base }));
        for(const s of D.fromStrokes) s.o.position.lerpVectors(s.from, s.base, k);
      }
      /* meshSpin：自转角缓动回基角（同一段 t） */
      if(D.ms && D.ms.length){
        if(!D.fromMs) D.fromMs = D.ms.map(s => ({ o: s.o, from: s.o.rotation.z, base: s.base }));
        for(const s of D.fromMs) s.o.rotation.z = s.from + (s.base.z - s.from) * k;
      }
      /* slide：刚性平移缓动回基位（同一段 t） */
      if(D.slides && D.slides.length){
        if(!D.fromSlides) D.fromSlides = D.slides.map(s => ({ o: s.o, from: s.o.position.clone(), base: s.base }));
        for(const s of D.fromSlides) s.o.position.lerpVectors(s.from, s.base, k);
      }
      /* eccOrbit：公转平移 + 1/3 自转缓动回基态（同一段 t） */
      if(D.ecc && D.ecc.length){
        if(!D.fromEcc) D.fromEcc = D.ecc.map(s => ({ o: s.o, fromPos: s.o.position.clone(), fromRot: s.o.rotation.z, basePos: s.basePos, baseRot: s.baseRot }));
        for(const s of D.fromEcc){
          s.o.position.lerpVectors(s.fromPos, s.basePos, k);
          s.o.rotation.z = s.fromRot + (s.baseRot - s.fromRot) * k;
        }
      }
      if(D.t >= 1){
        D.target.rotation.set(D.base.x, D.base.y, D.base.z);
        if(D.fromStrokes) for(const s of D.fromStrokes) s.o.position.copy(s.base);
        if(D.ms) for(const s of D.ms) s.o.rotation.set(s.base.x, s.base.y, s.base.z);
        if(D.slides) for(const s of D.slides) s.o.position.copy(s.base);
        if(D.ecc) for(const s of D.ecc){ s.o.position.copy(s.basePos); s.o.rotation.z = s.baseRot; }
        p.__demo = null;
        if(label && state.demoActive){ state.demoActive = null; emit(); }
      }
      return;
    }
    if(d.spin){
      if(Array.isArray(d.spin)){
        /* 数组 = 各轴角速度（rad/s），jet-engine 试点沿用的显式写法 */
        D.target.rotation.x += d.spin[0] * dt;
        D.target.rotation.y += d.spin[1] * dt;
        D.target.rotation.z += d.spin[2] * dt;
      }else{
        /* 'auto' = 按包围盒最薄轴推导旋转轴 */
        if(!D.axis){
          _bb.setFromObject(p.group);
          const s = _bb.getSize(new THREE.Vector3());
          D.axis = s.x <= s.y && s.x <= s.z ? [1, 0, 0] : (s.y <= s.z ? [0, 1, 0] : [0, 0, 1]);
        }
        const sp = d.speed || 4;
        D.target.rotation.x += D.axis[0] * sp * dt;
        D.target.rotation.y += D.axis[1] * sp * dt;
        D.target.rotation.z += D.axis[2] * sp * dt;
      }
    }
    if(d.wobble){
      const f = d.wobbleF || 1.0;
      p.group.rotation.x = D.base.x + Math.sin(t * f) * d.wobble[0];
      p.group.rotation.y = D.base.y + Math.sin(t * f * 0.83 + 1.3) * d.wobble[1];
      p.group.rotation.z = D.base.z + Math.sin(t * f * 1.21 + 2.6) * d.wobble[2];
    }
    if(d.meshSpin){
      /* V3.0 forge 扩展：部件内指定子对象（Mesh 或 Group）绕各自原点自转（行星轮自转等复合运动）。
         pick(o)=>bool 过滤；齿轮类应选其 Group（整体绕轮心转），而非逐齿 Mesh。进入记录基角，退出缓动复位。 */
      if(!D.ms){
        D.ms = [];
        p.group.traverse(o => {
          if(o === p.group) return;
          if(d.meshSpin.pick && !d.meshSpin.pick(o)) return;
          D.ms.push({ o, base: { x: o.rotation.x, y: o.rotation.y, z: o.rotation.z } });
        });
      }
      if(D.ms.length){
        const sp = d.meshSpin.speed ?? 2.2;
        for(const s of D.ms) s.o.rotation.z += sp * dt;
      }
    }
    if(d.eccOrbit){
      /* V4.1 forge 扩展：偏心轴系复合运动（转子发动机）——部件内指定内核 Group 同时
         公转（绕设备原点小圆平移，半径=偏心距 e）与自转（轴速 1/3 同向，内齿圈 3:1 约束）。
         pick(o) 选中内核 Group；相位内部累加（激活瞬间=装配位，无跳变），退出同段 t 缓动复位。
         位移仍在子对象级：group.position 由爆炸管线每帧覆写，不可碰。 */
      if(!D.ecc){
        D.ecc = [];
        p.group.traverse(o => {
          if(o === p.group) return;
          if(d.eccOrbit.pick && !d.eccOrbit.pick(o)) return;
          D.ecc.push({ o, basePos: o.position.clone(), baseRot: o.rotation.z, ph: 0 });
        });
      }
      if(D.ecc.length){
        const f = d.eccOrbit.f ?? 0.4, r = d.eccOrbit.radius ?? 0.15;
        for(const s of D.ecc){
          s.ph += dt * f * Math.PI * 2;
          s.o.position.set(s.basePos.x + r * (Math.cos(s.ph) - 1), s.basePos.y + r * Math.sin(s.ph), s.basePos.z);
          s.o.rotation.z = s.baseRot + s.ph / 3;
        }
      }
    }
    if(d.slide){
      /* V4.1 forge 扩展：刚性平移演示 —— 部件内全部 mesh 沿同一轴作同相正弦平移
         （针杆/送布牙等单自由度机构）。不走 stroke 的分相位路径：刚性件各 mesh
         相位必须一致，否则会被"撕开"。可选 axis2/amp2/phase2 合成李萨如闭环
         （送布牙椭圆轨迹近似）。位移改在 mesh 级：group.position 每帧被爆炸
         管线覆写不可碰；进入记录基位，退出缓动归位（与 strokes 同段 t）。 */
      if(!D.slides){
        D.slides = [];
        p.group.traverse(o => { if(o.isMesh) D.slides.push({ o, base: o.position.clone() }); });
      }
      const S = d.slide, f = S.f ?? 1, amp = S.amp ?? 0.2;
      const a1 = new THREE.Vector3(...(S.axis || [0, 1, 0])).normalize();
      const off1 = Math.sin(t * f * Math.PI * 2 + (S.phase || 0)) * amp;
      let vx = a1.x * off1, vy = a1.y * off1, vz = a1.z * off1;
      if(S.axis2 && S.amp2){
        const a2 = new THREE.Vector3(...S.axis2).normalize();
        const off2 = Math.sin(t * f * Math.PI * 2 + (S.phase2 ?? Math.PI / 2)) * S.amp2;
        vx += a2.x * off2; vy += a2.y * off2; vz += a2.z * off2;
      }
      for(const s of D.slides) s.o.position.set(s.base.x + vx, s.base.y + vy, s.base.z + vz);
    }
    if(d.stroke){
      /* 往复演示（v8-engine 试点）：部件内每个 mesh 沿各自缸轴往复；
         相位按 mesh 在曲轴轴向的投影分桶为交叉曲柄相位 [0,90,270,180]，
         同销连杆共享相位 —— 机械关系成立（90° V8 四销曲轴） */
      if(!D.strokes || !D.strokes.length){
        D.strokes = [];
        const bb = _bb.setFromObject(p.group);
        const bc = bb.getCenter(new THREE.Vector3());
        const crankAxis = new THREE.Vector3(...(d.stroke.crankAxis || [0, 0, 1])).normalize();
        p.group.traverse(o => {
          if(!o.isMesh) return;
          const mb = new THREE.Box3().setFromObject(o);
          const mc = mb.getCenter(new THREE.Vector3());
          const proj = mc.clone().sub(bc).dot(crankAxis);
          const bank = mc.x < (d.stroke.splitX ?? bc.x) ? 0 : 1;
          const axis = new THREE.Vector3(...(bank === 0 ? (d.stroke.axisL || [0, 1, 0]) : (d.stroke.axisR || [0, 1, 0]))).normalize();
          D.strokes.push({ o, base: o.position.clone(), axis, proj, mc: mc.clone() });
        });
        const projs = D.strokes.map(s => s.proj);
        D.projMin = Math.min(...projs); D.projMax = Math.max(...projs);
        if(d.stroke.phaseMode === 'radial'){
          /* 星型均布相位：活塞轴 = 环心→活塞中心的径向（⊥曲轴），
             相位 = 绕曲轴方位角排序后均布 —— 环心取部件包围盒中心（9 活塞对称即环心） */
          const up = Math.abs(crankAxis.y) > 0.9 ? new THREE.Vector3(1, 0, 0) : new THREE.Vector3(0, 1, 0);
          const u = new THREE.Vector3().crossVectors(crankAxis, up).normalize();
          const v = new THREE.Vector3().crossVectors(crankAxis, u).normalize();
          for(const s of D.strokes){
            const rel = s.mc.clone().sub(bc);
            const radial = rel.clone().addScaledVector(crankAxis, -rel.dot(crankAxis));
            if(radial.lengthSq() < 1e-6) radial.copy(u);
            s.axis = radial.normalize();
            s.ang = Math.atan2(rel.dot(v), rel.dot(u));
          }
          D.strokes.sort((a, b) => a.ang - b.ang);
          D.strokes.forEach((s, i) => { s.rank = i; });
        }
      }
      const S = d.stroke, f = (S.f ?? 1.2), amp = S.amp ?? 0.35;
      /* 相位表：默认 4 相位交叉曲柄 [0,90,270,180]（90° V8）；phaseN = n 缸均布（径向发动机用 360/n） */
      const PHASES = S.phaseN
        ? Array.from({ length: S.phaseN }, (_, i) => i * Math.PI * 2 / S.phaseN)
        : [0, Math.PI / 2, Math.PI * 1.5, Math.PI];
      const span = Math.max(D.projMax - D.projMin, 1e-4);
      for(const s of D.strokes){
        const bucket = S.phaseMode === 'radial'
          ? Math.min(PHASES.length - 1, Math.floor((s.rank ?? 0) / Math.max(1, D.strokes.length) * PHASES.length))
          : Math.min(PHASES.length - 1, Math.floor((s.proj - D.projMin) / span * PHASES.length));
        const off = Math.sin(t * f * Math.PI * 2 + PHASES[bucket]) * amp;
        s.o.position.copy(s.base).addScaledVector(s.axis, off);
      }
    }
  }
  function selectPart(id){
    state.selected = id;
    /* V5.1 P3/P4 · mech 联动（§6.6）：选中件的相连件集合缓存——I4 弱化豁免用。
       数据源=device.mech.edges（from/to 端真实引用，无 mech 不建集合）。 */
    state._connSel = id || null;
    state._connSet = null;
    if(id && state.device && state.device.mech && Array.isArray(state.device.mech.edges)){
      const set = new Set();
      for(const e of state.device.mech.edges){
        if(e.from === id && e.to !== id) set.add(e.to);
        else if(e.to === id && e.from !== id) set.add(e.from);
      }
      state._connSet = set;
    }
    if(!id) state.flewTo = null;
    syncOutlineEnabled();
    emit();
  }
  /* 退出聚焦：取消选中 + 相机飞回全景（Esc / 详情卡「关闭」用——用户预期「还原」） */
  function deselect(){
    const restore = state.flewTo;
    selectPart(null);
    if(restore) resetView();
  }
  /* ---------- V5.1 P3-S3 · 单件拆解（参考站点击交互移植，自研实现） ----------
     点击部件 = 选中 + 飞近 + 该件单独弹出；再点同件=归位，点他件=轮换弹出。
     与全局拆解正交：部件实际离位量 = max(全局插值, 单件弹出量 p.popK)。
     触发面：模型点击（pickAt）与清单点击（Vue pickFromList）；导览/深链/逐步装配不触发。
     setExplode(0)（全局归位）同时清空弹出件——「归位」语义=全部回位。 */
  function popPart(id){
    state.popped = (id && state.popped !== id && state.partsById[id]) ? id : null;
    if(state.popped) state.popUntil = performance.now() + 2400;   // 弹出动画期保持全速渲染
    invalidateMeasure();
    emit();
    return state.popped;
  }
  /* 点击部件 = 相机飞近：包围盒中心 + 对角线×2.2（竖屏按水平视场修正保证部件完整），复用 camTween 缓动 0.8s */
  function flyToPart(id){
    const p = id && state.partsById[id];
    if(!p){ resetView(); return; }
    _bb.setFromObject(p.group);
    if(_bb.isEmpty()){ return; }
    const c = _bb.getCenter(new THREE.Vector3());
    const diag = _bb.getSize(new THREE.Vector3()).length();
    const halfV = THREE.MathUtils.degToRad(camera.fov / 2);
    const half = Math.min(halfV, Math.atan(Math.tan(halfV) * camera.aspect));
    const distFit = (diag / 2) / Math.tan(half) * 1.15;   // 部件完整可见（含 15% 边距）
    const hullR = state.hullRadius || state.deviceRadius || diag;
    /* 小部件（diag < hull/4：薄片听筒/螺丝等）不飞相机——退化网格特写无意义，
       保持全景 + 选中高亮 + 标签（labelOffsets）指示位置（PART-02 实测裁掉公式化取景） */
    if(diag < hullR * 0.25){
      state.flewTo = id;
      return;
    }
    const dir = _v.copy(camera.position).sub(controls.target);
    if(![dir.x, dir.y, dir.z].every(isFinite) || dir.lengthSq() < 1e-6) dir.set(0.55, 0.38, 0.74);
    dir.normalize();
    const dist = clamp(Math.max(diag * 2.2, distFit, hullR * 0.3), 3.2, controls.maxDistance * 0.9);
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
  /* ---------- V5.1 P2 · 单部件 Hide/Show（任务书 §6.1 统一部件交互） ----------
     hidden 集合独立于 X-Ray/Isolate（其透明语义走 modes isoLerp）；mainLoop 末尾
     后置强制 visible=false——任何模式重放/归位动画都不会把隐藏件带回来。 */
  function setPartHidden(id, hidden){
    const p = state.partsById[id];
    if(!p) return false;
    if(hidden) state.hiddenParts.push(id);
    else state.hiddenParts = state.hiddenParts.filter(x => x !== id);
    p.group.visible = !hidden;
    if(!hidden && state.selected === id) selectPart(id);   // 重新显示时恢复选中态可见
    emit();
    return true;
  }
  function showAllParts(){
    for(const id of state.hiddenParts){
      const p = state.partsById[id];
      if(p) p.group.visible = true;
    }
    state.hiddenParts = [];
    emit();
  }
  /* ---------- V5.1 P1 空间辅助分级（任务书 §4.3） ----------
     off：全隐 ｜ simple：仅地面网格 ｜ standard（默认）：网格+地面 XYZ 轴线（V2 坐标装置现状）
     engineering：+ 模型包围盒辅助（Box3Helper，装载后/切档时按 deviceGroup 实测计算）。
     轴线读数数值由 DeviceViewer 层经 getState().camPos 呈现（相机世界坐标，CAM 标注区分口径）。
     bboxHelper 声明前置：applySpaceAid 的初始调用在 state 声明后立即执行（P1-S3），
     不能让 else-if 分支读到 TDZ 的 let（曾致 createEngine 整体抛出、__ENGINE 不挂载）。 */
  const SPACE_AID_MODES = ['off', 'simple', 'standard', 'engineering'];
  function applySpaceAid(){
    const m = state.spaceAid;
    grid.visible = m !== 'off';
    axisX.visible = axisZ.visible = (m === 'standard' || m === 'engineering');
    /* V5.1 P1-S3：铅垂点线归入空间辅助（standard/engineering 显示——中心轴参照，off/simple 收起） */
    if(plumbLine) plumbLine.visible = (m === 'standard' || m === 'engineering');
    if(m === 'engineering'){
      if(!bboxHelper){
        bboxHelper = new THREE.Box3Helper(new THREE.Box3(), 0x2a6a8a);
        bboxHelper.material.transparent = true;
        bboxHelper.material.opacity = 0.55;
        scene.add(bboxHelper);
      }
      const bb = new THREE.Box3().setFromObject(deviceGroup);
      if(!bb.isEmpty()){
        bboxHelper.box.copy(bb);
        bboxHelper.visible = true;
      } else {
        bboxHelper.visible = false;
      }
    } else if(bboxHelper){
      bboxHelper.visible = false;
    }
  }
  function setSpaceAid(mode){
    if(!SPACE_AID_MODES.includes(mode)) return false;
    state.spaceAid = mode;
    applySpaceAid();
    emit();
    return true;
  }
  function cycleSpaceAid(){
    const i = SPACE_AID_MODES.indexOf(state.spaceAid);
    return setSpaceAid(SPACE_AID_MODES[(i + 1) % SPACE_AID_MODES.length]);
  }
  /* engineering 档 bbox 刷新：装载完成与爆炸/归位收敛点调用（非逐帧 traverse） */
  function refreshSpaceAidBBox(){
    if(state.spaceAid !== 'engineering' || !bboxHelper) return;
    const bb = new THREE.Box3().setFromObject(deviceGroup);
    if(!bb.isEmpty()){ bboxHelper.box.copy(bb); bboxHelper.visible = true; }
  }
  function setAutoRotate(on){
    controls.autoRotate = on;
    state.userInteracted = true;
    stopTour(false);
    emit();
  }
  function resetView(){
    controls.minDistance = 6;
    /* AURORA PHASE 3：trackHome——目标每帧引用 live CAM_HOME。
       切台时 resetView 与 applyCamHomes/装载完成时序存在漂移窗口（实测 tween 结束位
       ≠ 最终 home：pos 冻结 [8.7,6,14.7] vs [12.1,6.9,15.5]），快照 tp 会把相机
       停在旧 home；「回到当前台取景位」的语义本就该跟随最新值。
       视角预设/爆炸取景（flyToView/setExplode）目标独立，保持快照语义不变。 */
    state.camTween = { t:0, dur:0.9, trackHome: true,
      fp:camera.position.clone(), tp:CAM_HOME.clone(),
      ft:controls.target.clone(), tt:CAM_TARGET.clone() };
  }
  /* 视角预设（任务书 §5）：正/背/左/右一键机位——距离沿用 CAM_HOME（含 camDist 与竖屏修正），
     方向绕目标点旋转，Y 分量保持与主视角同族的俯角。影响范围：仅相机，不触碰模型。 */
  const VIEW_PRESETS = {
    front: [0, 0.42, 1], back: [0, 0.42, -1], left: [-1, 0.42, 0], right: [1, 0.42, 0],
    interior: [0.15, 0.08, 0.3],   // 内部：低角度近距离（联动 X-Ray 由 UI 侧协调）
    /* V5.1 P1 · 顶/底视角（任务书 §9.1）：up 共线规避——方向向量带 0.02 z 偏移， */
    top: [0, 1, 0.02], bottom: [0, -1, 0.02],
  };
  function flyToView(preset){
    if(!VIEW_PRESETS[preset]) return false;
    state.userInteracted = true;
    controls.autoRotate = false;
    stopTour(false);
    invalidateMeasure();
    const dist = CAM_HOME.length();
    const tp = new THREE.Vector3(...VIEW_PRESETS[preset]).normalize().multiplyScalar(dist).add(CAM_TARGET);
    state.camTween = { t:0, dur:0.9,
      fp:camera.position.clone(), tp,
      ft:controls.target.clone(), tt:CAM_TARGET.clone() };
    emit();
    return true;
  }
  function pickAt(clientX, clientY, fly){
    pointer.x = (clientX/innerWidth)*2-1;
    pointer.y = -(clientY/innerHeight)*2+1;
    raycaster.setFromCamera(pointer, camera);
    const hit = raycaster.intersectObjects(state.pickMeshes, false)[0];
    const id = hit ? hit.object.userData.partId : null;
    /* 还原语义（用户实测 bug）：若正聚焦某部件，点空白 = 退出聚焦 → 相机飞回全景。
       必须在 selectPart 之前保存——selectPart(null) 会清 flewTo（历史顺序缺陷） */
    const wasFlew = state.flewTo;
    selectPart(id);
    /* V5.1 P3-S3：点击部件 = 单件弹出（轮换：点他件时前件归位）；已弹出件再点=仅重聚焦不误触归位
       （弹出件常悬停在视线前方遮挡区域，误触会把「重看一眼」变成「收回」）；stepMode 不接管 */
    if(id && !state.stepMode && fly !== false && state.popped !== id) popPart(id);
    if(fly !== false){
      if(id) flyToPart(id);
      else if(wasFlew) resetView();
    }
  }

  /* ---------- 测量工具（LAB · Phase 2） ----------
     两点表面取点连线读距；BVH 惰性构建只发生在首次激活。
     读数标定：模型等比缩放，targetWidth 场景单位 ↔ realSizeMM 真实毫米，
     故 mm = 场景距离 / targetWidth × realSizeMM（未标定设备显示场景单位）。 */
  let bvhBuilt = false;
  let bvhJob = 0;                 // 装载/卸载令牌：分帧构建必须能被新装载打断
  let measureTip = null;
  const measureMat = new THREE.MeshBasicMaterial({ color: 0x45e0ff, depthTest:false, transparent:true, opacity:.95 });
  const measureLineMat = new THREE.LineBasicMaterial({ color: 0x45e0ff, depthTest:false, transparent:true, opacity:.9 });
  function buildBVHFor(mesh){
    if(!mesh.isMesh || !mesh.geometry || mesh.geometry.boundsTree) return false;
    mesh.geometry.computeBoundsTree();
    return true;
  }
  /* 同步全量构建：测量工具进入时必须立即可用，不能等分帧队列 */
  function ensureBVH(){
    if(bvhBuilt) return;
    const t0 = performance.now();
    let n = 0;
    deviceGroup.traverse(o=>{ if(buildBVHFor(o)) n++; });
    bvhBuilt = true;
    raycaster.firstHitOnly = true;
    console.log('[pick] BVH ×' + n + ' built in ' + Math.round(performance.now()-t0) + 'ms');
  }
  /* 装载后分帧增量构建：悬停/点击拾取与测量共用同一棵棵 BVH（审计 P0-2）。
     每帧只处理一小批，避免 combustion-engine（143 mesh / 231 万三角）那种 90ms 长任务。 */
  function scheduleBVH(){
    if(bvhBuilt || hooks.adaptive === false) return;   // 缩略图渲染进程短，不值得建
    const job = ++bvhJob;
    const queue = [];
    deviceGroup.traverse(o=>{ if(o.isMesh && o.geometry && !o.geometry.boundsTree) queue.push(o); });
    if(!queue.length){ bvhBuilt = true; raycaster.firstHitOnly = true; return; }
    const t0 = performance.now();
    const total = queue.length;
    const step = ()=>{
      if(job !== bvhJob || !running) return;           // 已被新装载/卸载取代
      const budgetEnd = performance.now() + 6;         // 每帧 ≤6ms，给渲染留 10ms
      let k = 0;
      while(k < queue.length && performance.now() < budgetEnd) k++;
      for(let i = 0; i < k; i++) buildBVHFor(queue[i]);
      queue.splice(0, k);
      if(queue.length) requestAnimationFrame(step);
      else {
        bvhBuilt = true;
        raycaster.firstHitOnly = true;
        if(state.loadTiming) state.loadTiming.bvhMs = Math.round(performance.now()-t0);   // AURORA：分帧累计
        console.log('[pick] BVH 增量 ×' + total + '，跨帧累计 ' + Math.round(performance.now()-t0) + 'ms');
      }
    };
    requestAnimationFrame(step);
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
  function startTour(mode = 'auto'){
    modes.setMode(null);   // 导览件必须完整可见：自动退出 X 光/隔离/剖切
    invalidateMeasure();
    /* 无策展顺序时按爆炸偏移从外到内排：贴合“先拆外壳再进内部”的直觉，
       也避免直接沿用配置里的任意部件顺序。
       条目兼容两种写法：'partId' 字符串 / { id, note } 带讲解词对象 */
    const raw = (state.device && state.device.tour) || [];
    const curated = raw
      .map(e => typeof e === 'string' ? { id: e } : (e && e.id ? e : null))
      .filter(e => e && state.partsById[e.id]);
    const ids = curated.length ? curated.map(e => e.id)
      : [...state.parts]
          .sort((a, b) => (b.worldOffset ? b.worldOffset.length() : 0) - (a.worldOffset ? a.worldOffset.length() : 0))
          .map(p => p.data.id);
    if(!ids.length) return;
    state.tour = {
      ids,
      notes: curated.map(e => e.note || null),
      i: -1, wait: 0, playing: true,
      mode: mode === 'manual' ? 'manual' : 'auto',
    };
    state.userInteracted = true;
    tourStep(1);
  }
  function setTourMode(m){
    if(!state.tour) return;
    state.tour.mode = m === 'manual' ? 'manual' : 'auto';
    emit();
  }
  function tourStep(dir){
    const tour = state.tour;
    if(!tour) return;
    tour.i = clamp(tour.i + dir, 0, tour.ids.length - 1);
    const id = tour.ids[tour.i];
    const pd = state.partsById[id] && state.partsById[id].data;
    selectPart(id);
    flyToPart(id);
    /* 停留时长：自动连播才计时；讲解词长的步多留 1.5s */
    if(tour.mode === 'auto'){
      const noteLen = (tour.notes && tour.notes[tour.i] ? tour.notes[tour.i].length : 0);
      tour.wait = ((pd && pd.hot) ? 5 : 3.5) + (noteLen > 60 ? 1.5 : 0);
    }
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
    return t ? { playing: t.playing, i: t.i, total: t.ids.length, id: t.ids[t.i], mode: t.mode, note: (t.notes && t.notes[t.i]) || null } : null;
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
  let lastEmitExN = -1;   // V5.1 P3-S3：弹出件进出也触发 emit（单件拆解不改变 explode% 曾漏报计数）

  function emit(){
    onChange({
      explode: Math.round(state.explodeCurrent*100),
      explodeTarget: state.explodeTarget,
      selected: state.selected,
      modelStatus: state.modelStatus,
      labelsOn: state.labelsMode !== 'off',
      labelsMode: state.labelsMode,
      spaceAid: state.spaceAid,
      hiddenParts: state.hiddenParts,
      explodedParts: state.explodedParts || 0,   // V5.1 P2：已离位部件数（§6.4 拆解统计）
      popped: state.popped,                       // V5.1 P3-S3：单件拆解弹出件 id（emit/getState 双路同步）
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
    const _fms0 = performance.now();   // AURORA：帧耗统计（getState 暴露均值/计数，供 fps-probe 实测）
    const rawDt = Math.min(clock.getDelta(), 1);
    const dt = Math.min(rawDt, 0.05);
    const t = clock.elapsedTime;
    /* 双厅灯光渐变（V2）：0.6s ease 过渡 */
    if(hallTween){
      hallTween.t = Math.min(1, hallTween.t + rawDt / 0.6);
      applyHallFrame(easeIO(hallTween.t));
      if(hallTween.t >= 1) hallTween = null;
    }
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
      refreshSpaceAidBBox();   // 爆炸/归位收敛点：engineering 档包围盒刷新
    }
    const ex = state.explodeCurrent;
    const n = state.parts.length || 1;
    /* 拆分悬浮（V2 用户反馈）：选中零件且整机装配态时，沿爆炸方向浮出——
       相机不飞近，用户在全景中看到「哪个零件从哪里弹出来」。取消选中或爆炸度
       >0.2 时自动收回。渐入渐出由 focusFloatK 驱动（速度 3.5/s ≈ 0.3s）。 */
    const floatTarget = (state.selected && ex < 0.2 && !state.stepMode) ? 1 : 0;
    state.focusFloatK = state.focusFloatK ?? 0;
    state.focusFloatK += (floatTarget - state.focusFloatK) * Math.min(1, dt * 3.5);
    const floatK = state.focusFloatK > 0.001 ? easeIO(clamp(state.focusFloatK, 0, 1)) : 0;
    let exN = 0;   // V5.1 P2：已离位部件计数（任务书 §6.4 拆解统计）
    let popMoving = false;   // V5.1 P3-S3：弹出/归位动画进行中（R1 全速判据）
    for(const p of state.parts){
      let lt;
      if(state.stepMode){
        lt = easeIO(1 - clamp(state.stepCur - (p.stepIdx || 0), 0, 1));
      }else{
        const stag = (p.idx/n)*0.32;
        lt = clamp((ex-stag)/(1-0.32), 0, 1);
        lt = easeIO(lt);
        /* V5.1 P3-S3 · 单件弹出量（独立于全局插值，指数趋近 2.6/s≈0.4s）；
           部件实际离位 = max(全局, 弹出)——全局归位后弹出件仍在外，popPart(null) 才收回 */
        const popTgt = state.popped === p.data.id ? 1 : 0;
        p.popK = p.popK || 0;
        p.popK += (popTgt - p.popK) * Math.min(1, dt * 2.6);
        if(popTgt === 0 && p.popK < 0.002) p.popK = 0;
        if(Math.abs(p.popK - popTgt) > 0.004) popMoving = true;
        lt = Math.max(lt, p.popK);
      }
      const wo = p.worldOffset || p.offset;
      /* 选中零件的拆分悬浮偏移（仅装配态生效；弹出态已到 1，天然被 max 覆盖） */
      if(floatK > 0 && state.selected === p.data.id){
        lt = clamp(lt + floatK * 0.3, 0, 1);
      }
      p.group.position.copy(p.base).addScaledVector(wo, lt);
      if(!isFinite(p.group.position.x)) p.group.position.copy(p.base);
      if(p.axisLine){ p.axisLine.material.opacity = lt*0.38; p.axisLine.visible = lt>0.03; }
      /* V5.1 P2 · 全局拆解统计（任务书 §6.4）：lt>0.02 记为「已离位」——
         与渲染状态同源（本循环刚写入 position），零额外遍历成本 */
      if(lt > 0.02) exN++;
    }
    state.explodedParts = exN;
    state.popMoving = popMoving;
    /* V5.1 P3-S3 · reticle 跟随弹出件：中心=部件包围球心（popCenter 缓存，finalize 实测），
       直径=包围球×1.6，billboard 朝相机 */
    if(reticle){
      const pp = state.popped && state.partsById[state.popped];
      if(pp && pp.popCenter){
        reticle.visible = true;
        reticle.position.copy(pp.group.position).add(pp.popCenter).add(deviceGroup.position);
        reticle.quaternion.copy(camera.quaternion);
        reticle.scale.setScalar(Math.max(0.3, pp.popRadius * 1.35));
      }else{
        reticle.visible = false;
      }
    }
    modes.tick(dt);
    applyGlow(dt, t);
    /* V4.0 MI②：统一演示时钟——全部演示（spin/stroke/wobble/meshSpin）共用同一积分时钟，
       速度乘子只改积分速率不改相位基准（变速无跳变）；reducedMotion 时 runDemos 自行短路 */
    state.demoClock += dt * (state.demoSpeed || 1);
    runDemos(dt * (state.demoSpeed || 1), state.demoClock);

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

    /* Tour 停留计时（走真实墙钟，低帧率/看门狗步进环境下停留时长依然准确）；手动模式不自动前进 */
    if(state.tour && state.tour.playing && state.tour.mode === 'auto'){
      state.tour.wait -= rawDt;
      if(state.tour.wait <= 0){
        if(state.tour.i >= state.tour.ids.length - 1) stopTour();
        else tourStep(1);
      }
    }
    if(!controls.autoRotate && !state.userInteracted && ex===0) controls.autoRotateSpeed = 0.5;
    controls.update();
    /* ---------- 相机补间（AURORA PHASE 3 移至 controls.update() 之后） ----------
       裁决实验实证：controls.update() 每帧用内部 spherical 状态重建 camera.position，
       任何外部写入（tween lerp/绝对赋值/直写）都会被下一帧 update 完全恢复——
       这是「切台后相机停在旧 home」的根因。把补间移到 update 之后，
       tween 写入成为每帧最终状态；补间结束后 update 从新 position/target 重算，平滑接管。 */
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
        if(tw.trackHome){
          /* resetView：跟随 live home（切台时 applyCamHomes 与装载完成存在时序漂移窗口，
             快照 tp 会停在旧 home；「回到当前台取景位」语义本就该用最新值） */
          camera.position.copy(CAM_HOME);
          controls.target.copy(CAM_TARGET);
          if(k >= 1) state.camTween = null;
        }else{
          camera.position.lerpVectors(tw.fp, tw.tp, k);
          controls.target.lerpVectors(tw.ft, tw.tt, k);
          if(k >= 1) state.camTween = null;
        }
      }
    }

    deviceGroup.position.y = reducedMotion ? 0 : Math.sin(t*0.7)*0.1;
    if(!reducedMotion) particles.rotation.y = t*0.012;
    /* V5.1 P1-S3 · 陈列刻度盘慢旋（参考站 0.035rad/s 口径，自研实现）：
       与星点同级的最轻量环境动势；reducedMotion 静止；R1 idle 半率采样下随渲染帧自然变慢（诚实节奏）。
       软渲染环境装载饱和慢为已知既有特性（无头冻结记忆条目），非本改动引入——探针按 300s 规程判定 */
    if(!reducedMotion && stageDial) stageDial.rotation.y = t * 0.035;

    composer.render();
    try{ updateLabelsFrame(); }
    catch(e){ hooks.onLabelError && hooks.onLabelError(String((e && e.message) || e)); }
    updateMeasureTip();
    /* V5.1 P2：隐藏件后置强制——任何模式重放/归位动画/装载流程都不会把隐藏件带回 */
    if(state.hiddenParts.length){
      for(const id of state.hiddenParts){
        const p = state.partsById[id];
        if(p && p.group.visible) p.group.visible = false;
      }
    }

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
      /* 开场推近不在首帧做：CAM_HOME 须等 loadDevice 应用 camDist/竖屏修正后再取（finalize 内补间），
         否则 tween 目标被钉在装载前的基值，竖屏修正失效 */
      hooks.onBooted && hooks.onBooted();
      emit();
    } else {
      const pct = Math.round(ex*100);
      /* V5.1 P3-S3：已离位数变化（单件弹出/归位不改变 explode%）同样触发 UI 同步 */
      if(pct !== lastEmitExp || state.explodedParts !== lastEmitExN){
        lastEmitExp = pct; lastEmitExN = state.explodedParts; emit();
      }
    }
    renderCount++; frameMsAcc += performance.now() - _fms0;
    /* AURORA：装载完成（doneMs 已写）后的首个渲染帧 → firstRenderMs。
       不可挂 booted 块（那是引擎生命周期首帧，远早于 loadTiming 存在）；独立每帧检查。 */
    if(state.loadTiming && state.loadTiming.doneMs > 0 && !state.loadTiming.firstRenderMs){
      state.loadTiming.firstRenderMs = Math.round(performance.now() - state.loadTiming.t0);
    }
  }

  /* ---------- AURORA R1 按需渲染（审计 P2-1） ----------
     静止画面降为半帧率采样：待机自转（0.5rad/s 慢速环绕）、展品浮动、粒子在 30fps
     采样下均无感知损失，GPU/CPU 帧成本约减半；任一用户交互/显式动画立即恢复全速。
     判定边界：**待机自转不算活动**（26s 无交互后开启，engine idleTimer——它是主要
     降频对象）；用户主动输入以 1.5s 余波窗口覆盖拖拽惯性 damping；
     OrbitControls 'change' 事件不可用作判定（update() 每次都 dispatch，含静止后）。 */
  let inputUntil = 0;         // 用户交互余波窗口（拖拽/滚轮/惯性 damping 收敛前保持全速）
  let frameParity = 0;
  let lastActiveT = 0;        // 时间基准（帧数基准在低帧率环境永不进入）：无活动 1.2s 即降频
  const IDLE_AFTER_MS = 1200;
  const markInput = () => { inputUntil = performance.now() + 1500; };
  canvas.addEventListener('pointerdown', markInput, { passive: true });
  canvas.addEventListener('wheel', markInput, { passive: true });
  canvas.addEventListener('touchmove', markInput, { passive: true });
  function isSceneActive(){
    if(!booted) return true;
    if(performance.now() < inputUntil) return true;            // 拖拽/缩放/惯性期
    if(hoverDirty || hallTween || state.camTween) return true;
    if(Math.abs(state.explodeCurrent - state.explodeTarget) > 0.0004) return true;
    /* V5.1 P3-S3：弹出/归位动画期与动画余波窗口保持全速 */
    if(state.popMoving) return true;
    if(state.popUntil && performance.now() < state.popUntil) return true;
    if(state.stepMode && state.stepGroups && Math.abs(state.stepCur - state.stepTarget) > 0.0004) return true;
    const ft = (state.selected && state.explodeCurrent < 0.2 && !state.stepMode) ? 1 : 0;
    if(Math.abs(ft - (state.focusFloatK ?? 0)) > 0.001) return true;   // 拆分悬浮渐变
    if(state.tour && state.tour.playing) return true;
    if(state.demoActive) return true;                          // 部件演示动画
    if(state.selected || state.hovered) return true;           // 选中呼吸/悬停辉光
    if(state.measureOn) return true;
    if(state.device && state.device.tick) return true;         // 动态屏幕贴图（native 屏方案）
    const m = modes.state.mode;
    if(m && m !== 'xray') return true;                         // 剖切滑杆/隔离渐变交互期
    return false;                                              // 含待机自转：允许降频
  }
  function animate(){
    if(!running) return;
    requestAnimationFrame(animate);
    if(watchdogStep){ try{ mainLoop(); } catch(err){ recordAnimErr(err); } return; }   // 看门狗兜底帧恒渲染
    const nowMs = performance.now();
    if(isSceneActive()) lastActiveT = nowMs;
    else if(nowMs - lastActiveT > IDLE_AFTER_MS){
      frameParity = 1 - frameParity;
      if(frameParity === 0){
        clock.getDelta();   // 丢弃本帧间隔：下一渲染帧 dt 仍为真实墙钟差（演示/导览/爆炸速率不变）
        return;
      }
    }
    try{ mainLoop(); }
    catch(err){ recordAnimErr(err); }
  }
  function recordAnimErr(err){
    if(!window.__animErr){ window.__animErr = (err && (err.stack || err.message)) || String(err); console.error(err); }
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
    applyCamHomes();   // 旋转屏幕/改窗口后重算竖屏取景（审计 P0-1）
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
    loadDevice, setExplode, setExplodeLayout, selectPart, deselect, setHover, setLabels, setAutoRotate, setSpaceAid, cycleSpaceAid, setPartHidden, showAllParts, popPart,   // V5.1 P3-S3：单件拆解
    setHallMode, setGridVisible,
    setDemoSpeed: (v) => { state.demoSpeed = clamp(Number(v) || 1, 0.25, 3); emit(); return state.demoSpeed; },
    /* V4.0 MI⑤：模型质量诊断（五类×四级，任务书 §8；只诊断不修复） */
    runQA: () => {
      const mins = [];
      let faces = 0;
      const qb = new THREE.Box3();
      deviceGroup.traverse(o => {
        if (!o.isMesh) return;
        qb.setFromObject(o);
        if (qb.isEmpty()) return;
        mins.push(qb.min.y);
        faces += (o.geometry.index ? o.geometry.index.count : o.geometry.attributes.position.count) / 3;
      });
      mins.sort((a, b) => a - b);
      const q = Math.max(1, Math.ceil(mins.length * 0.25));
      const mid = q >> 1;
      const robustBottom = mins.length ? (q % 2 ? mins[mid] : (mins[mid - 1] + mins[mid]) / 2) : NaN;
      const report = analyseModel({
        device: state.device, parts: state.parts, partsById: state.partsById,
        hullCenter: state.hullCenter, hullRadius: state.hullRadius,
        faces: Math.round(faces), robustBottom, rawBottom: mins.length ? mins[0] : NaN,
      });
      report.faces = Math.round(faces);
      return report;
    },
    resetView, pickAt, onResize, thumbView, snapshot,
    flyToView,
    flyToPart, setMode, isolate, setClipT,
    setMeasure, stepAssembly, stepNext, stepPrev,
    capturePartThumb,
    startTour, stopTour, tourNext, tourPrev, setTourMode,
    step: mainLoop,
    getCamera: () => camera,
    getScene: () => scene,   // 调试观测点（__RAW/__CAM 同约定）：审计/测试遍历用
    getViewDir: () => camera.getWorldDirection(_viewDir),   // 坐标辅助 gizmo 用（复用向量，只读）
    getPartOffset: (id) => {
      const p = state.partsById[id];
      return p ? +p.group.position.distanceTo(p.base).toFixed(4) : null;
    },
    getPartRotation: (id) => {
      const p = state.partsById[id];
      return p ? { x: +p.group.rotation.x.toFixed(4), y: +p.group.rotation.y.toFixed(4), z: +p.group.rotation.z.toFixed(4) } : null;
    },
    /* V5.1 P3-S3 · 纯查询拾取（无副作用）：单件拆解后部件会占据新屏幕区域，
       验证脚本需要先找「真正空白」的点击点——dry-run 版 pickAt。 */
    getPickIdAt: (x, y) => {
      pointer.x = (x / innerWidth) * 2 - 1;
      pointer.y = -(y / innerHeight) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      const hit = raycaster.intersectObjects(state.pickMeshes, false)[0];
      return hit ? hit.object.userData.partId : null;
    },
    getState: () => ({ ...state,
      booted, autoRotate: controls.autoRotate, quality,   // V4.1：自适应画质档（0-2）可观测，探针/测试用
      viewMode: modes.state.mode, isolateId: modes.state.isolateId, clipCap: modes.state.capKind,
      tool: state.measureOn ? 'measure' : null,
      step: state.stepMode && state.stepGroups ? { i: Math.round(state.stepCur), n: state.stepGroups.length } : null,
      demoActive: state.demoActive || null,
      /* AURORA 性能度量：渲染帧计数 / 均值帧耗 / 装载分环节打点 / 实时相机位置遥测
         （__CAM 是 finalize 快照非实时；切台相机回归断言需要实时位） */
      renderCount,
      frameMsAvg: renderCount ? +(frameMsAcc / renderCount).toFixed(2) : 0,
      loadTiming: state.loadTiming || null,
      camPos: camera.position.toArray().map(v => +v.toFixed(2)),
      explodedParts: state.explodedParts || 0,   // V5.1 P2：已离位部件数（§6.4 拆解统计）
      popped: state.popped,                       // V5.1 P3-S3：单件拆解弹出件 id
      /* V5.1 P8-S1 · 能力检测（任务书 §11.3）：按真实数据声明可用功能——
         UI 层据此不得为无数据能力显示可用入口（防虚假入口红线） */
      capabilities: {
        explode: state.parts.length > 1,                                 // 多部件才可拆
        sizeAssist: !!(state.device && state.device.realSizeMM),         // 可信真实尺寸（mm 标定测量）
        mech: !!(state.device && state.device.mech),                     // 机构关系
        tour: !!(state.device && state.device.tour),                     // 策展巡览
        labels: state.parts.length > 0,                                  // 部件标注
      },
      deviceTier,   // AURORA PHASE 6：low/mid/high（探针与降档诊断用）
      plinthType: state.plinthType || null,   // V5.1 P1：precision/industrial/large
      /* parts/partsById 含 THREE 对象，不进响应式/跨页传输，只出计数字段 */
      partsCount: state.parts.length,
    }),
    dispose(){
      running = false;
      clearInterval(watchdog);
      clearTimeout(idleTimer);
      if(lpTimer) clearTimeout(lpTimer);
      if(loadAbort) loadAbort.abort();
      window.removeEventListener('resize', onResize);
      canvas.removeEventListener('pointermove', onPointerMove);
      canvas.removeEventListener('pointerdown', onPointerDown);
      canvas.removeEventListener('pointerup', onPointerUp);
      canvas.removeEventListener('pointermove', onPointerMoveCancel);
      modes.dispose();
      labelSystem.dispose();
      disposeDevice();
      /* 引擎自有 GPU 资源（审计 P1-6）：环境贴图 / 背景纹理 / 特写 RT / 控制器 */
      if(scene.environment && scene.environment.dispose) scene.environment.dispose();
      scene.environment = null;
      pmrem.dispose();
      if(nightBgTex) nightBgTex.dispose();
      if(hallBgTex) hallBgTex.dispose();
      scene.background = null;
      if(thumbRT) thumbRT.dispose();
      controls.dispose();
      renderer.dispose();
      if(composer.dispose) composer.dispose();
      /* Draco worker 池随页面卸载终止（审计 RS-11）：单例只管同页复用，
         不终止则每次进出设备页净留存 4 个 worker；下次装载会在 getDracoLoader 重建 */
      if(_dracoLoader){ _dracoLoader.dispose(); _dracoLoader = null; }
    }
  };
}
