# DJI 拆解馆 · 技术总结文档

> 多品牌设备 3D 交互拆解平台。当前版本 3.0.0（package.json）。
> 设备数量与清单以 `MODEL_INVENTORY.md`（`npm run gen:inventory` 自动生成）为准，文档里勿手抄数字。
> 另保留 `legacy.html` —— 1.0 单机版（纯 vanilla + 官方 GLB 的 Action 4 拆解页），仅作参考。

---

## 1. 技术栈与框架

| 层 | 选型 | 说明 |
|---|---|---|
| 构建 | **Vite 5** | dev 服务 `127.0.0.1:8200`；`npm run dev / build / preview` |
| Vue 插件 | @vitejs/plugin-vue 6 | SFC 编译 |
| UI 框架 | **Vue 3.5**（Composition API，`<script setup>`） | 仅做"壳"：大厅页、详情面板、工具栏、键盘/路由 |
| 路由 | **vue-router 4** | `createWebHashHistory`，两条路由：`/`（GalleryHub 大厅）、`/device/:id`（DeviceViewer 拆解页） |
| 状态管理 | 无 | 引擎 `hooks.onChange` 回调 → Vue `ref` 单向推状态；曾装未用的 Pinia 已移除 |
| 3D 引擎 | **three 0.164**（npm 安装，非 CDN） | 核心 + `examples/jsm` 的 addons |
| UI 动画 | **GSAP 3**（仅 DeviceViewer chunk，+25KB gzip） | 设备页开机时间线编排；**ticker 不接管 three 主循环**；大厅筛选动画用 Vue 原生 TransitionGroup，未用 GSAP Flip |
| 语言 | 纯 JavaScript ESM（无 TypeScript） | |
| 样式 | 原生 CSS（`src/style.css`），CSS 变量主题（`--acc` 每设备强调色） | 无 UI 组件库、无 Tailwind |
| 浏览器 API | Canvas 2D（程序化贴图 / 屏幕 UI）、WebGL2、Pointer Events、requestAnimationFrame | |

### Vite 自定义插件（vite.config.js）
- `device-manifest`（virtual:device-manifest + virtual:device-loaders）：dev/build 时在 Node 侧 import
  `registry.js`（配 `tools/lib-node-shim.mjs` DOM 桩），提取卡片所需的纯元数据
  （id/名称/品牌/分类/部件数/glb 路径/accent），同时生成 `id → () => import('./设备文件')` 的加载表；
  设备文件变动自动失效重算。**大厅因此完全不加载 three.js 与设备实现**；
  设备页也只动态加载当前这一台配置，不再全量解析（设备路由 chunk 1.2MB → 904KB，gzip 404KB → 249KB，
  其中 three.js 单独成 chunk：771KB / gzip 199KB，版本稳定可长期命中缓存）。
- `copy-draco-decoder`：build 时把 `node_modules/three/examples/jsm/libs/draco/` 下的
  `draco_decoder.js`、`draco_decoder.wasm`、`draco_wasm_wrapper.js` 拷到产物 `assets/draco/`
  （目录跟随 `build.outDir`）；dev 模式由 Vite 直接服 `node_modules` 路径，无需拷贝。
- `clean-dist-junk`：build 后剔除误随 `public/` 拷入产物的 `.mimosa` 缓存与 `.DS_Store`
  （同样跟随 `build.outDir`）。
- 路由级代码分割：两条路由均为 `() => import(...)`，three.js（约 771KB min）只出现在
  设备页加载的 `three` chunk，进大厅不加载（`npm run smoke` 有断言）。

### 架构分层（壳 / 引擎分离）
```
src/
├─ main.js / App.vue            入口 + 路由
├─ components/                  Vue 壳
│  ├─ GalleryHub.vue            大厅：统计、品牌/分类筛选、搜索、设备卡片
│  └─ DeviceViewer.vue          拆解页：挂 canvas、部件清单、详情面板、工具栏、快捷键
├─ engine/                      设备无关的 3D 拆解引擎（纯 Vanilla，不知道 Vue 的存在）
│  ├─ engine.js                 主引擎（渲染/装载/爆炸/拾取/标签/主循环/自适应画质/缩略图拍摄）
│  ├─ glbCache.js               GLB 获取层：Cache Storage 持久缓存 + 低优先级预取 + 流式进度 + 并发合并/取消
│  ├─ materials.js              材质工厂 + 几何辅助（makeTex / box / addMesh / 9 种预设材质）
│  └─ previewScene.js           程序化"黄昏海岸"取景画面（供各设备屏幕贴图共用）
└─ devices/                     每台设备一个声明式配置文件
   ├─ registry.js               注册表（唯一事实源）：设备数组 + getDevice/brands/categories
   │                            仅 Node 工具 / manifest 插件使用；浏览器端走 virtual:device-loaders
   ├─ _kit/factory.js           makeDevice() 工厂：补全缺省（draco/frontAxis/explode offset/labelOffsets…）
   │                            anchorParts()：程序化内构件锚定到实机包围盒；composePostLoad()
   ├─ _kit/internals.js         13 种参数化程序化内构件（见 §4.4）
   └─ <device>.js               设备配置（action4.js / s25-ultra.js / phone4apro.js …）
```

引擎与壳的契约：`createEngine(canvas, labelsRoot, hooks)` → 引擎实例；
壳调 `loadDevice / setExplode / selectPart / setHover / setLabels / setAutoRotate / resetView / pickAt / dispose`，
缩略图离线渲染脚本另用 `thumbView() / snapshot()`；
引擎通过 `hooks.onChange({explode, selected, modelStatus, labelsOn, autoRotate, booted, quality})`
单向推状态给 Vue（`quality` 为自适应画质档位 2/1/0）；`hooks.adaptive:false` 可关闭自适应（缩略图模式用）。

---

## 2. 3D 模型实现

### 2.1 渲染管线（engine.js）
- `THREE.WebGLRenderer`：antialias，`pixelRatio ≤ 2`，**ACESFilmicToneMapping**（曝光 1.12），PCFSoftShadowMap。
- 后期：`EffectComposer` + `RenderPass` + **UnrealBloomPass**（辉光，强度 0.42）+ `OutputPass`。
- 环境光：`PMREMGenerator.fromScene(new RoomEnvironment())` 生成 IBL 环境贴图。
- 场景氛围：FogExp2 指数雾、CanvasTexture 径向渐变背景、`PolarGridHelper` 极坐标网格、
  AdditiveBlending 光晕面片、`ShadowMaterial` 接影地面、420 个漂浮粒子（`THREE.Points`）。
- 布光：半球光 + 主平行光（2048² 阴影贴图）+ 青/紫双轮廓光 + 前置点光（强调色）。

### 2.2 交互
- `OrbitControls`：阻尼、限距、限俯角；无操作 2.6s 后待机自转。
- `Raycaster` 拾取：pointermove 悬停高亮、pointerup 点击选中；按下/抬起位移 > 6px 视为拖拽不触发选择。
- 部件标签：**自实现投影**（世界坐标 → NDC → 屏幕坐标，`transform` 定位 DOM 元素），非 CSS2DRenderer；
  标签 DOM 支持悬停/点击联动。
- 快捷键：`SPACE` 一键拆解/组装、`R` 重置视角、`H` 沉浸模式（隐藏全部面板）、`Esc` 取消。
- 爆炸（拆解）动画：每个部件一个**相机朝向基向量**偏移（`captureExplodeBasis` 把部件的 x/y/z 语义偏移
  换算为右/上/朝向观察者的世界向量），分段错峰（`stag = idx/n*0.32`）+ easeInOut 缓动；
  爆炸时绘制虚线轴线（`LineDashedMaterial`）指示位移方向。
- 高亮：部件所有材质 `emissive` 向强调色 lerp（系数克制 0.12，防止金属材质经 Bloom 泛白），
  选中态附加正弦脉冲。
- **看门狗**：`setInterval(500ms)` 兜底调用 `mainLoop`——rAF 被挂起的环境（如无头测试）也能推进。

### 2.3 设备装载流程（核心机制）
采用 **"程序化占位 → GLB 替换 → 失败回退"** 三段式：

1. `buildProceduralParts`：按设备配置的程序化 builders 先建一套完整模型（含内构件），立即可看。
2. 若配置了 `glb`，`GLTFLoader` 挂**引擎级单例** `DRACOLoader`（模块级复用，避免每次装载新建 worker 池泄漏；
   无条件挂载，对未压缩文件无副作用）异步加载官方模型：
   - **朝向声明**：`frontAxis`（±x/±z）把模型原生机头轴旋转到 +Z；
   - **归一化**：遍历全部网格取几何包围盒（烘顶点资产节点枢轴可能脱节，故逐 mesh 变换包围盒），
     按缩放基准缩放到 `targetWidth`；`normalize:'shell'`（默认）只按外壳网格测量，`'full'` 按全部网格最大维度；
   - **网格 → 部件归类**（优先级从高到低）：
     ① `mapping` 网格名精确映射表 → ② `materialMapping` 材质名映射 → ③ `mappingPrefix` 前缀匹配
     → ④ `mapByPosition(meshName, 本地坐标, 包围盒相对坐标0..1)` 位置聚类函数（匿名命名资产用）
     → ⑤ 兜底 `unmappedTo`（默认归入 shell）；
   - 命中网格用 `group.attach()` 归入对应部件组，材质克隆，替换 `realPartIds` 声明的程序化外观；
   - **orientationProbe**：比较两组件的世界 z 均值，自动 180° 翻转纠正朝向；
   - **postLoad 钩子**（设备特有后处理）：传感器按镜头轴对位、保护镜按实机镜头尺寸重建、
     `addLiveScreen()` 屏幕点亮（按部件包围盒贴自发光 CanvasTexture 平面）；
   - **tick 钩子**：每帧回调，驱动屏幕实时 UI（录制约 0.5s 刷新一次计时/电量）。
3. 任何一步失败（网络 / 解析 / 接入异常）：`catch` 后保留程序化模型，状态显示 `FALLBACK · PROCEDURAL`。

资源管理：切设备时 `disposeDevice()` 全量释放 geometry / material / map（含 6 种贴图槽位），防止泄漏。

### 2.4 材质与程序化建模
- 材质：`MeshPhysicalMaterial`（clearcoat / transmission / ior 做玻璃与镜头镀膜）、`MeshStandardMaterial`；
  `materials.js` 预设 9 种工厂（matShell 金属机身 / matGlass 透射玻璃 / matLensCoat 镀膜 / matGold / matScreen…）。
- 程序化贴图：全部用 Canvas 2D 现画（`makeTex`）——PCB 走线丝印、电池标签、扬声器开孔、
  镜头镀膜渐变、铜箔纹理、二维码/条码等，零外部图片资源。
- 屏幕实时 UI：双缓冲 canvas → `CanvasTexture.needsUpdate`；大厅共用的"黄昏海岸"取景画面
  由 `previewScene.js` 一次预渲染。
- `_kit/internals.js` 参数化内构件库（传入尺寸/文字/配色即得统一质感部件）：
  `battery` 电池、`mainboard` 主板（SoC/屏蔽罩/存储/PMIC）、`shield` 屏蔽罩、`thermal` 散热（均热板+热管+翅片）、
  `fan` 轴流风扇（返回转子可旋转）、`speakerBox` 扬声器、`cameraModule` 摄像头模组、`chargeCoil` 无线充电线圈、
  `taptic` LRA 马达、`flex` FPC 排线（可折弯）、`driver` 动圈单元、`displayPanel` 屏幕面板、
  `simTray` SIM 托、`portPcb` 尾插小板、`graphite` 石墨贴片、`screws` 螺丝。
- 随机纹理用固定种子 Lehmer LCG（`rnd`），保证每次刷新外观一致。

### 2.5 设备配置文件结构（devices/*.js）
必填：`id / brand / name / en / category / tagline / description / specs / accent / targetWidth / parts`；
模型相关：`glb`（路径）、`draco`、`frontAxis`、`normalize`、`mapping / materialMapping / mappingPrefix / mapByPosition`、
`orientationProbe`、`realPartIds`（GLB 网格归入的部件）、`postLoad`、`tick`、`camDist`（大设备相机拉远系数）；
部件数据：`zh / en / tag / desc / specs` + `ex`（爆炸方向偏移）、`lo`（标签锚点偏移）、`pos`（装配位置）。

### 2.6 调试 / 自动化测试钩子
引擎与壳在 `window` 上暴露：`__THREE`（运行时包围盒测量）、`__ENGINE`、`__RAW`（缩放/包围盒/网格名/材质名/相对坐标）、
`__NORMDBG`（归一化诊断）、`__LOADS`（装载历史）、`__LOAD_ERR`（装载错误栈）、`__animErr`（主循环异常）、
`engine.step()`（手动步进一帧）——专为 rAF 挂起的无头测试环境设计。

---

## 3. 模型文件：需要的格式与约定

### 3.1 运行时唯一格式：**GLB**（glTF 2.0 Binary）
- 存放位置：`public/assets/<设备id>.glb`（Vite 构建时原样拷入 `dist/assets/`，无需配置）；
  **原始未压缩资产备份在 `vendor/assets/originals/`**，需要重新处理时从那里取。
- 现有资产已全部经压缩流水线处理（见 §3.4）：总体积约 **184MB / 85 个 GLB**（2026-10-29 实测，
  设备持续接入中，数量与体积以 `npm run gen:inventory` 为准；原始备份约 1.1GB）。
  全部 85 个均含 Draco（含补压的 flipper-zero / framework-laptop13）。
- **贴图内嵌** GLB，格式 WebP / PNG / JPEG，引擎只读取几何 + 材质/网格命名，
  不支持外部 `.bin` / 贴图散文件的单 gltf。
- **Draco 压缩：全部资产已启用**（`KHR_draco_mesh_compression`）。引擎无条件挂单例解码器，
  设备配置里的 `draco` 字段已不再影响装载（仅作历史兼容保留）。
- **glTF 扩展**：引擎依赖 three 0.164 内置支持，已实际遇到并正常渲染的有
  `EXT_texture_webp`、`KHR_materials_specular`、`KHR_materials_ior`、`KHR_materials_clearcoat`、
  `KHR_materials_transmission`、`KHR_materials_volume`、`KHR_materials_emissive_strength`、`KHR_texture_transform`。

### 3.2 对模型内容的约定（接入新设备的关键）
| 项 | 要求 / 兜底 |
|---|---|
| 命名 | 网格名或材质名**有意义**最理想（直接写 `mapping` / `materialMapping` 表）；完全匿名（01..06）也能接，用 `mapByPosition` 按坐标聚类；网格名甚至可以是中文（如"挤压""镜头丝印"） |
| 朝向 | 任意（±x / ±z 原生机头轴均可），用 `frontAxis` 声明；拿不准就配 `orientationProbe: ['A部件','B部件']` 自动翻转 |
| 尺度 | 任意（cm / m / Y 直立 / Z 长轴皆可），引擎按 `targetWidth` 归一化；平铺/直立长轴在任意方向的资产配 `normalize:'full'` |
| 层级 | 不要求拆好组——引擎遍历全部 mesh 按归类表重新分组（`group.attach`），单一大网格也能按材质拆分部件 |
| 构件缺口 | 官方模型通常只有外观；主板/电池/散热等内构件由程序化 builders 补齐，`anchorParts` 把它们锚定到实机部件包围盒内 |

### 3.3 模型来源与转换管线（各品牌实际取材；设备数以 `npm run gen:inventory` 输出为准）
| 品牌 | 来源 | 方式 |
|---|---|---|
| DJI（6 台） | 官网产品页 AR 资产 | 官方 GLB 直链（如 Action 4 = AC203 机型码资产）；2025 后新品无 3D viewer |
| Samsung（5 台） | 官网产品页 `<model-viewer>` 资产 | GLB 直链（Y 直立、命名网格，多带 Draco） |
| Nothing（3 台） | 官网产品页资产（Sanity CDN） | GLB 直链（cm 尺度、匿名命名网格 → 位置聚类映射；材质名带 Glyph/Led → materialMapping） |
| Apple（16 台） | 官网产品页 AR 资产 | **USDZ → `tools/usd2glb.py`（Blender headless）转 GLB** 后接入 |
| Nintendo（2 台） | Sketchfab 社区模型 | Switch OLED = SceneView 仓库 CC-BY 4.0（rtql8d）；Switch 2 = NAIT Studio "Realistic"（**CC-BY 4.0**，`modelCredit` 署名） |
| Flipper（1 台） | 官方 3D 模型仓库 | STL → `tools/cad2glb.py stl`（**GPL-3.0**，`modelCredit` 署名 flipperdevices） |
| Framework（1 台） | 官方 CAD 仓库 | 整机 STEP → `tools/cad2glb.py step`（**CC-BY 4.0**；产品名泛名 → 位置+尺寸聚类） |

> 许可提示：厂商官网 AR 资产仅限本机研究/演示用途，勿再分发；社区模型必须遵守其许可
> （CC-BY 需署名、GPL 需注明来源、NC 类默认不接），接入时在设备配置 `source` / `modelCredit` 字段注明来源。
> 直链规律与排除清单详见 `.zcode/skills/convert-asset/references/sources.md`。

### 3.4 资产压缩流水线与配套工具
- **压缩流水线**（@gltf-transform CLI，已对全部资产执行）：
  ```bash
  npx @gltf-transform/cli webp  in.glb out.glb --quality 85   # ① 先压贴图
  npx @gltf-transform/cli draco in.glb out.glb                # ② 后压几何（必须最后一步）
  ```
  ⚠️ **顺序不可颠倒**：gltf-transform 的任何后处理命令都会把已有 Draco 解码回内存重写，
  先 draco 后 webp 会导致几何压缩丢失（体积反弹 15 倍的实测案例）。
  WebP 质量 85 下未见可见画质劣化（phone4apro / s25-ultra 截图抽查通过）。
- `tools/inspect-glb.mjs` —— 零依赖 GLB 结构检查器：
  `node tools/inspect-glb.mjs <file.glb> [--json]`
  解析 GLB 的 JSON chunk + POSITION accessor，输出节点树、网格名、三角数、世界包围盒、材质名清单——
  用于接新模型前快速摸清命名结构、编写 mapping 表。
- **`tools/usd2glb.py`** —— Blender headless 转换器（Apple USDZ → GLB，已收编并全链路实测）：
  `/Applications/Blender.app/Contents/MacOS/Blender --background --python tools/usd2glb.py -- <src.usdz> <dst.glb>`
  输出 `RESULT meshes=… tris=… materials=…`；导出参数带 TypeError 版本回退（本机 Blender 4.x 不认 `export_colors`）；
  入口带 `safe_path` 路径守卫（拒 `..` 穿越）。Apple 资产特征：哈希节点名（全走 `mapByPosition`）、
  纯色材质 + roughness/normal/occlusion 贴图、米制、部分屏幕朝 -Z 且熄屏。
- **`tools/cad2glb.py`** —— CAD → GLB（Framework 13 的 STEP 与 Flipper 的 STL 都是它转的）：
  `python3 tools/cad2glb.py step <in.stp> <out.glb> [meshSizeMax_mm]`（gmsh 按体积实体分组 + 名称关键词调色）；
  `python3 tools/cad2glb.py stl <in.stl> <out.glb>`（零依赖）。meshSizeMax 越小越精越慢（2.4mm 15 分钟+ / 4.5mm 90 秒实测）。
- **`tools/optimize-glb.mjs`** —— 压缩包装（`npm run optimize -- <in.glb> [out.glb]`）：把上面 webp→draco
  铁律固化成固定顺序执行 + 体积汇报。全链路实测：AirPods Pro USDZ 6.88MB → 907KB（13%）。
- 完整操作 SOP 已固化为项目技能 `.zcode/skills/convert-asset/`（直链规律见其 `references/sources.md`）与
  `.zcode/skills/add-device/`（设备接入与校准清单）——重启 ZCode 后可自动触发。

---

## 4. 运行

```bash
npm install
npm run dev        # http://127.0.0.1:8200
npm run build      # 产物 dist/（含自动拷贝的 Draco 解码器）
npm run preview
```

### 4.1 工具链 npm scripts（规模化的维护设施）

| 命令 | 作用 |
|---|---|
| `npm run lint:devices` | **设备配置静态校验**：mapping/materialMapping/mappingPrefix/realPartIds 引用的 partId 必须存在于 `parts[]`（拼错会静默归入 shell）、parts id 不重复、GLB 文件存在。接入/改动设备后必跑；有错退出码 1 |
| `npm run gen:inventory` | 自动生成 `MODEL_INVENTORY.md`（registry 唯一事实来源），并列出孤儿 GLB（有文件未注册）与缺失 GLB（已注册无文件）。**该文档不要手改** |
| `npm run add -- --id x --zh 名 --en EN --brand 品牌 --category 分类` | 新设备脚手架：查重 → 生成 `src/devices/<id>.js` 模板 → 自动插入 registry 对应品牌分组 |
| `npm run thumbs [-- --all / --only id1,id2]` | 离线渲染大厅缩略图 `public/thumbs/<id>.webp`：Vite dev server + 无头 Chrome（SwiftShader WebGL）逐台打开 `?thumb=1`，等 GLB 合入后 `engine.thumbView()` 取景、`engine.snapshot()` 导出 WebP。默认只渲染缺图设备 |
| `npm run optimize -- <in.glb> [out.glb]` | GLB 压缩包装：固定 webp(85)→draco 顺序 + 体积汇报（铁律见 §3.4） |
| `npm run smoke` | 端到端冒烟：自起 Vite（8211 端口）→ 无头 Chrome 跑大厅 / 设备页 / X-Ray / 移动端 sheet，含"进大厅不加载 three"断言；需本机 Chrome/Chromium/Edge，无则打印 SKIP |

`tools/lib-node-shim.mjs`：Node 端 DOM 桩（万能 Proxy），使设备配置可在 Node 里 import
（gen-inventory / lint / add / thumbs / vite 插件共用）。

### 4.2 性能与体验设施（2.1 引入）

- **GLB 缓存层（engine/glbCache.js）**：大厅卡片 hover 低优先级预取（`fetch priority:'low'`）并写入
  Cache Storage（`teardown-glb-v1`）；设备页装载先查缓存，未命中流式下载（进度条）后回填。
  二次进入/最近设备基本零请求。同 URL 并发合并、订阅者全部取消才中止；引擎装载带序号 token，
  切换设备后旧装载回调全部作废（防竞态）。
  缓存上限 512MB（`cache-policy.js` 纯函数计算，`localStorage['teardown-glb-meta-v1']` 记账），
  超限按最久未使用淘汰；localStorage 不可用时退化为不限额。已缓存条目在下次命中时补记体积。
- **最近浏览**：设备页写 `localStorage['teardown-recent']`（≤8 台），大厅顶部快捷入口 + 启动预热最近一台。
- **自适应画质**：引擎按 3s 窗口帧率采样（watchdog 步进的帧不计入），<42fps 逐级降档
  L2（满配）→ L1（pixelRatio 1.5 / 阴影 1024）→ L0（pixelRatio 1 / 关辉光 / 阴影 512），
  只降不升防振荡；状态栏实时显示 HIGH/MED/LOW。
- **指针拾取节流**：pointermove 只记坐标置脏标记，raycast 合并到每帧一次。
- **看门狗可见性门控**：500ms 兜底步进在 `document.hidden` 时跳过（后台标签页不渲染省电；
  前台 rAF 挂起环境如 IAB 仍有效）。
- **上下台导航**：设备页工具栏 `‹ 上一台 / 下一台 ›` 按钮 + `←`/`→` 快捷键（输入框聚焦时让位）。
- **移动端（≤700px）**：部件清单/详情面板收为左右抽屉，左下按钮唤出；工具栏导航钮隐藏。
- **GSAP 开机时间线（仅设备页）**：`onBooted` 触发 UI 编排（loader 揭幕 → 标题浮现 → 双面板错峰滑入 → 工具栏弹起），
  结束后 `clearProps` 清除全部内联样式——沉浸模式/移动抽屉的显隐仍由 CSS class 控制，两者不打架；
  GSAP ticker 不接管 three 主循环（IAB 看门狗逻辑独立）。≤700px 只编排标题。缩略图模式跳过。
- **大厅筛选 FLIP**：`TransitionGroup name="grid"` 实现卡片换位动画（move .5s / 进场沿用 rowIn 错峰 /
  离场 0.26s 淡出），零额外依赖——未用 GSAP Flip 插件。
- **缩略图卡片**：大厅卡片展示离线渲染的整机快照（19:14 WebP，均约 20KB），加载失败自动回退
  纯排版卡片。`.viewer.thumb` 模式隐藏全部 UI 且关闭自适应，保证出图一致。
  设备可配 `thumbDir:[x,y,z]`（设备指向相机的拍摄方向，缺省与首页相机同向；
  macbook-pro/macbook-air/airpods-max 已配置）。注意：部分 Apple 资产熄屏状态下
  屏幕本身就是深色的，缩略图与设备页首屏一致，属忠实还原而非取景错误。

---

## 5. UI 3.0（UPGRADE-3.0.md 实施记录，2026-10-29）

按 `Downloads/UPGRADE-3.0.md` 规划落地，四阶段全量交付。架构（壳/引擎分离、设备配置体系、缓存层、
离线缩略图）不变，以下全部为增量。

### 5.1 视觉基建（P1）
- **HUD tokens**：`style.css :root` 新增 `--acc-08/16`（color-mix 派生，随 --acc 换肤）、`--bg-0/1/2`、
  `--txt-1/2/3`、`--glass`、`--corner/--notch`、`--ease-out/--ease-spring`、`--dur-1/2/3`、`--fs-hud`。
- **HUD 组件库 `src/ui/hud.css`**（main.js 全站引入）：`.hud-panel`（玻璃+切角）、`.hud-corner`（四角 L 角标）、
  `.hud-eyebrow`、`.hud-scan`（持续/一次性扫描光带）、`.hud-glow-btn`、`.hud-chip`、`.hud-icon`（带 tooltip）。
- **开场演出**：loader 分段进度（构建场景 → 加载官方模型 x% → 编译材质 → 装配，来自 modelStatus）
  → 开场大字（bootTitle）→ 相机 dolly-in（1.9s）→ 模型以 55% 爆炸散开状态出现、1.4s 自动装配
  （`explodeCurrent=0.55 + explodeSpeed=0.42`，仅首次装载且非缩略图模式）→ HUD stagger 点亮 →
  扫描光带 → 提示 toast。
- **rAF 挂起兜底**：GSAP ticker 依赖 rAF，在 IAB 后台等环境会冻结 boot 时间线——`bootTimeline()`
  末尾挂 700ms 间隔的漂移检测（`tl.time() < 墙钟*0.35` 即判定挂起），`tl.totalProgress(1, false)`
  直接跳终态（suppressEvents=false 保 call() 回调触发）。

### 5.2 拆解页布局 3.0（P2，DeviceViewer.vue 全量重构）
- **细顶栏** `#topbar`：返回 ‖ 型号徽章+设备名 ‖ 状态灯（绿=OFFICIAL/PROCEDURAL，黄=FALLBACK）‖ ⓘ。
  规格总览/模型状态/画质/布局信息收进 **ⓘ 弹出卡** `#infoPop`。
- **部件清单 → 可折叠 rail** `#rail`：头部点击折叠（localStorage `teardown-rail`）；折叠态为
  **序号圆点列** `#railDots`（hover 弹出名称，选中色环）。
- **上下文详情卡** `#ctxCard`：仅选中部件时右下滑入（340px，含描述/参数表/聚焦 F/关闭 Esc）；
  取代常驻右面板，画布无部件选中时完全无遮挡。
- **图标 dock** `#dock` 三组：①拆解主按钮+滑杆（**长按 520ms 切换 轴向/径向 布局**）②查看模式
  整机/X光/隔离/剖切 ③标签(三态循环)/旋转/截图/导览/沉浸/帮助 + 上/下一台。全部带快捷键 tooltip。
- **导览进度条** `#tourBar`（AUTO TOUR + 14 进度点 + 步进/停止）与 **剖切滑杆** `#clipStrip`
  按需出现在 dock 上方；boot 提示与临时消息共用 `#toast`。

### 5.3 标签系统 3.0（`engine/labels.js`，新模块）
- 每标签 = 锚点圆点（SVG circle）→ 45° 拐角折线（SVG path）→ 标签框（DOM 复用 .p-label）。
- **Y 轴分箱避让**：同侧按锚点 y 排序、桶高 30px 依次上推，外侧部件（rank 优先）先占位，消灭叠字。
- **分级显示** `labelsMode = auto/all/off`：auto 下爆炸 >0.35 时只显示**外侧 1/3 部件**（按爆炸偏移
  长度降序取前 1/3，`computeOuterThird()`），选中/悬停件始终显示。
- 左右交替出发，靠屏幕边自动反弹；`#labels` 内含全屏 `<svg class="label-svg">`。

### 5.4 查看模式（`engine/view-modes.js`，新模块；四态互斥，快捷键 1-4）
- **X 光**：外壳材质 → `transparent+opacity .16+depthWrite false`、关投影；内构件不动。外壳缺省推断：
  `xrayShellIds`（配置）→ `realPartIds`（GLB 外观件）→ 关键词兜底（纯程序化设备）。
- **隔离**：非目标件透明度逐帧 lerp 至 0.06 + 关投影；再点同一件/Esc 退出；隔离中可换目标件。
- **剖切**：`renderer.localClippingEnabled` + 世界坐标水平面（clipT 0..1 顶部→底部），全设备材质挂
  `clippingPlanes`；剖切面常量抵消设备呼吸浮动。**无 stencil 封盖**（UPGRADE-3.0 §9 允许的降级）。
- 进入模式快照材质/投影属性，退出精确还原（透明度/depthWrite/clippingPlanes/castShadow）。

### 5.5 引擎交互 3.0（engine.js 增量，对外 API 只增不改）
- **OutlinePass ×2**（选中 3.2 强调色 / 悬停 1.6 暗色），仅桌面 + `hardwareConcurrency>4` + 画质>L0；
  描边启用时 emissive 高亮系数 0.12→0.06 防双层过曝；强调色随设备 accent 换肤。
- **`flyToPart(partId)`**：部件包围盒中心 + 对角线×2.2（钳制），沿当前视线方向飞近 0.8s；
  点击部件=自动飞近，点空白（曾飞近过时）飞回全景；`camTween` 改**墙钟驱动**（rAF 挂起环境
  动画时长依然准确）。
- **Tour 自动导览**：`startTour/stopTour/tourNext/tourPrev`，顺序取 `device.tour` 或 parts 顺序，
  每件 3.5s（`parts[].hot` 5s），走主循环时钟；任何交互/切台/拆解即停；启动时自动退出查看模式。
- **径向布局** `setExplodeLayout('axis'|'radial')`：radial 把语义爆炸向量归一化后统一放到
  半径 = 设备包围球×1.5 的球壳（花瓣排布，适配截图）。
- **截图** `snapshot('image/png')`（壳负责触发下载）；移动端手势：长按部件=隔离。
- **emit 增量字段**：`labelsMode/viewMode/isolateId/clipT/layout/tour`（全部向后兼容）。
- `dispose()` 增：view-modes 还原、labelSystem SVG/DOM 清理、composer.dispose。

### 5.6 URL 状态同步与数据层（P3/P4）
- 分享链接 `#/device/:id?e=<0..1爆炸度>&p=<部件id>&t=1导览` 打开即还原现场：e 在装载完成后
  `setExplode`，p/t 经 `pendingDeeplink` 在 `loadDevice().then()` 后应用（早于部件就绪会被
  disposeDevice 清掉）；`pendingDeeplink` 未应用前 syncUrl 不回写。ui → URL 回写以**字符串键
  watch** 比较（数组 getter 引用不等会在每次 emit 误触发，开场空状态会把深链 query 洗掉）。
- 设备配置新可选字段（全部缺省安全）：`xrayShellIds`、`tour`、`unmappedTo`、`parts[].hot`。
  （早期设计稿里的 `hero`、`parts[].icon` 未落地，已不再作为配置契约。）

### 5.7 大厅与移动端（P4）
- **Hero 焦点展台**：标题右侧 16:10 展台轮播 4 台招牌设备（action4/mavic3pro/vision-pro/switch-2），
  6s 换台 + Ken Burns 推近 + 扫描线 + 呼吸光晕，hover 暂停、点击进拆解页。**用离线缩略图而非
  UPGRADE 文档提议的共享 WebGL 渲染器**（缩略图管线 2.1 已有，省一个 WebGL context 与 80 行渲染器）。
- **吸顶筛选**（sticky+毛玻璃）、**视图切换**（卡片/紧凑列表 `.as-list`）、VOL.04。
- **移动端 ≤700px**：部件清单 → 顶栏下横滑 chips；详情卡 → **底部 46vh sheet**（把手点击关闭）；
  dock 单行可横滑（滑杆收起）；模型零遮挡。断点 1080/860/700 三档。

### 5.8 已验证与已知边界
- `npm run build` + `lint:devices` 通过（设备数量以 `MODEL_INVENTORY.md` 为准）；浏览器实测（桌面 1440×900 + 移动 390×844）：
  开场演出、四模式、导览、截图、深链还原、引线避让、移动 sheet 全链路通过。
- 实测中修复：重写事故丢失的 `onPointerUp` 拾取、`flyToPart` 对 Vector3 误用 `.every()` 的
  TypeError、IAB rAF 挂起下 GSAP/camTween 冻结、深链与 URL 回写的竞态。
- 已知边界：剖切无封盖切口；详情卡无部件特写小图（缩略图管线不支持按部件取景，暂以序号+强调色
  代替）；`?thumb=1` 离线拍摄模式与全部新 UI 隔离（`.viewer.thumb` 隐藏清单已同步更新）。
- **3.0 复查优化（同日第二轮）**：爆炸推进与 Tour 计时改未钳制墙钟 rawDt（低帧率设备/后台恢复不拖长）；
  外侧 1/3 标签集按爆炸度分桶缓存；OutlinePass 目标集合仅变化时重赋；`#dock`/`#topbar` 取消切角
  （tooltip 定位在面板外会被 clip-path 裁掉）；拆解滑杆/剖切滑杆 `--p` 填充实时绑定（2.0 起从未生效）；
  dock 拆解键长按后松开不再误触发 click 的拆解切换；卸载清理 urlTimer/toastTimer/lpTimer；
  挂载期 `loadDevice().then()` 加切台守卫（快速切台不再把旧台 e 值套到新台）。
- **资产与装载复查（同日第三轮，本机浏览器实测）**：`lint:devices` 全量通过 + `build` 成功；
  抽查 10 台跨新分类设备（flipper-zero / framework-laptop13 / jet-engine / v6-engine / ak-47 /
  hubble-telescope / tr-808 / royal-typewriter / countach-lpi800-4 / iphone-17）全部 `OFFICIAL`
  装载、无装载/动画错误、包围盒正常（含 13MB 级大模型与刚补压的 2 台）；
  全库扫描确认 85/85 GLB 均含 Draco；`optimize-glb.mjs` 修复压缩前体积读数时序 bug（自报 100% 问题）。
