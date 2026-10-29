# 自主迭代日志

> 只记录可核实的事实：改了什么、怎么验证、还剩什么。设备/部件数量以 `MODEL_INVENTORY.md` 为准。

## 2026-10-29 · 审计后第一批修复（P0/P1/P2）

### 背景
全面阅读项目后确认的基线：82 台设备 / 692 部件 / 82 个 Draco GLB；设备页因 `registry.js` 静态全量 import，
进入任意一台都会解析全部 82 份配置；移动端浮层与详情 sheet 压盖；大厅统计把全部 GLB 计为“官方模型”；
X-Ray 回退把所有外观件透明化导致镜头/玻璃叠 Bloom 过曝；另有缓存无并发合并、无障碍与打包卫生问题。

### 改动
1. **设备配置按需加载**
   - `vite.config.js`：新增 `virtual:device-loaders`，构建期生成 `id → () => import('./设备文件')`；与 manifest
     共用缓存并在设备文件变更时失效。
   - `src/components/DeviceViewer.vue`：改用 manifest 元数据 + 按 id 动态加载完整配置；切台带序号守卫，
     配置加载完成前用元数据占位；`isMobile` 改为媒体查询监听。
   - `src/devices/registry.js`：注明仅 Node/工具使用。
2. **移动端浮层让位**
   - `DeviceViewer.vue` 用 ResizeObserver 实测 `#ctxCard` 高度写入 `--sheet-h`；
   - `src/style.css` 在 ≤700px 下让 `#clipStrip / #tourBar / #toast` 上移到 sheet 之上。
3. **大厅口径与布局**
   - `GalleryHub.vue`：官方/社区模型分开统计；焦点展台标签移入 `.hub-hero` 网格，不再压副标题。
4. **X-Ray 收敛**
   - `src/engine/view-modes.js`：`xrayShellIds` → `realPartIds`（排除 lens/sensor 等光学件）→ 关键词兜底；
   - `action4 / mavic3pro / vision-pro / switch2` 补 `xrayShellIds`，并配置策展后的 `tour` 顺序。
5. **引擎 / 缓存 / 无障碍**
   - `engine.js`：切台时 AbortController 取消旧 GLB 下载；过期装载异常不再覆盖当前状态；清理待机自转定时器；
     Draco 路径走 `assetUrl`；归一化落点跟随各设备的 `unmappedTo`。
   - `glbCache.js`：同 URL 并发合并、引用计数取消、`assetUrl` 统一路径；`prefetchGlb` 复用在途请求。
   - `labels.js`：标签可聚焦（role=button / tabindex / Enter·Space 选中）。
   - `_kit/factory.js`：未映射网格落点改为真实存在的部件（shell/body/case/frame… → realPartIds → parts[0]）。
   - `tools/lint-mapping.mjs`：新增 `xrayShellIds`、`unmappedTo` 错误校验与 `tour` 警告。
   - 新增 `src/lib/url.js`（BASE_URL 前缀）、`public/favicon.svg`，`index.html` 引用图标。
6. **工程卫生**
   - 将 `public/assets/.mimosa`、`src/devices/.mimosa` 与 4 个 `.DS_Store` 移至 `/tmp/dji-junk-backup/`（可恢复）；
   - `vite.config.js` 新增 `clean-dist-junk`；新增 `.gitignore`；
   - 新增 `tools/smoke.mjs` 与 `npm run smoke`（自起 Vite + 无头 Chrome 的 10 项断言）。
7. **文档**
   - `TECH.md` 更新插件/架构说明、GLB 体积、设备数量口径；`docs/UPGRADE-3.0.md` 去掉过时台数。

### 验证
- `npm run lint:devices` → 全部 82 台通过（0 错 0 警）。
- `npm run gen:inventory` → 82 台 / 692 部件 / 82 GLB / 27 品牌。
- `npm run build` → 1.71s；`DeviceViewer` chunk 883.82KB（gzip 248.11KB）；dist 201MB；无 `.mimosa/.DS_Store`。
- `npm run smoke` → 10/10 通过：大厅 82 卡、统计 6 项、标签不重叠、action4 14 部件、
  仅请求当前配置、X-Ray 可进入、移动端 sheet 与剖切条间距 19.6px、无控制台错误。
- 实测数据：设备页 heap 34.4–35MB（修复前记录 ~41MB）；DOM 挂载 canvas 1 个。

### 已知限制
- 浏览器验证仅覆盖无头 Chrome + SwiftShader；未做 iOS Safari / 真实 Android 回归。
- 49 台社区模型的 credit 仍是泛化文案，缺作者与许可证链接；本轮未编造署名。
- 项目仍不是 git 仓库；未做任何提交。

### 下一项
见 `AUTONOMOUS_BACKLOG.md`：优先补社区模型署名与更多机型的 Tour/X-Ray 策展。

## 2026-10-29 · 生产构建预览 + 多机型 / 缩略图回归

### 改动
- `tools/render-thumbs.mjs`：等待条件增加 `state.device.id === 目标 id`。原因：hash 切台是页内导航，
  `getState().booted` 不会复位，批量渲染在多台连渲时可能截到上一台画面（本轮验证中实际复现：
  旧的等待条件在 `switch-2` 上读到 `LOADING 0%` 的中间态）。

### 验证
- `npm run preview -- --port 8222`（生产构建）+ 无头 Chrome，13 项全通过：
  - 大厅 82 卡，统计 33 官方 / 49 社区（另 82 设备 / 692 部件 / 27 品牌 / WEBGL）；
  - `action4` OFFICIAL · AC203 · 14 部件，Tour 启动 `total=14`；
  - 多机型抽查均 OFFICIAL：`vcr-hanseatic` 5 / `tr-808` 11 / `marshall-jcm800` 4 /
    `polaroid-coolcam` 8 / `switch-2` 6 / `vision-pro` 10 部件；
  - 移动端 390×844：sheet 与剖切条间距 19.6px；
  - 全程无控制台错误。
- `npm run thumbs -- --only action4,switch-2,marshall-jcm800` → 3/3 成功
  （20.5s / 3.9s / 5.9s），逐张检视画面为对应设备，未截到旧设备。
- 临时 dev(8201) / preview(8222) 已停止；用户自有 8200 未触碰。

### 备注
- 首次预览脚本的 2 项“失败”是脚本断言的错误（统计列索引、`getState().tour` 为原始对象无 `total`），
  修正后通过；产品侧仅 `render-thumbs` 存在真实竞态，已修复。

## 2026-10-29 · 导览兜底 + 缓存容量上限

### 改动
1. **无策展设备的 Tour 兜底**（`engine.js`）
   - 原逻辑：没有 `tour` 配置就按 `parts` 配置顺序导览；配置顺序与拆解顺序无关。
   - 现逻辑：按爆炸偏移长度从外到内排序（外壳→内部），策展 `tour` 仍优先；策展 ids 全部失效时也走兜底。
2. **GLB 缓存容量上限与 LRU 淘汰**
   - 新增 `src/engine/cache-policy.js`：纯函数 `planEviction(meta, cap, keepUrl)`，默认 512MB，
     最久未使用优先，刚写入的条目不淘汰。
   - `glbCache.js`：写入成功后记 `localStorage['teardown-glb-meta-v1']`（url → at/size）并同步淘汰；
     缓存命中刷新 `at`；localStorage 不可用时退化为不限额。淘汰在返回数据前完成，避免并发下超限窗口。
3. **回归脚本**
   - `tools/smoke.mjs` 增至 11 项断言（新增“无策展设备 Tour 按外→内兜底”，并给移动端等待加设备 id 守卫）。

### 验证
- `node` 直接 import `cache-policy.js`：5 项断言通过（未超限/最旧优先/keep 不淘汰/缺省体积/边界）。
- 浏览器缓存测试 8/8：写入 Cache Storage 且记账 0.35MB；二次进入 0 次 GLB 网络请求；
  命中刷新 LRU 时间；伪造 800MB 旧条目后淘汰最旧一条，保留未超限条目，元数据同步删除。
- `npm run lint:devices` 82/82；`npm run build` 1.88s（DeviceViewer gzip 248.13KB）。
- `npm run smoke` 11/11；生产预览 14/14（含 Tour 兜底、6 机型、移动端间距 19.6px）。
- 临时 dev(8213) / preview(8222) 在收尾时停止。

### 已知限制
- 旧版本已写入缓存的条目在首次命中前不参与容量统计（命中时补记体积）；当前资产总量 174MB，
  低于 512MB 上限，短期无影响。

## 2026-10-29 · 子路径部署实测

### 改动
- `vite.config.js`：`copy-draco-decoder` 与 `clean-dist-junk` 改为从 `configResolved` 读取 `build.outDir`，
  不再写死 `dist/`。此前 `vite build --outDir dist-subpath` 会把 Draco 解码器拷进真实 `dist/`，
  子路径产物缺解码器。

### 验证
- `npx vite build --base=/x/ --outDir dist-subpath` → Draco 落入 `dist-subpath/assets/draco/`，
  `index.html` 资源前缀为 `/x/`。
- 静态服务把 `/x/` 映射到产物目录，无头 Chrome 7/7 通过：大厅 82 卡、缩略图 `/x/thumbs/`、
  action4 OFFICIAL 14 部件、Draco 解码器 `/x/assets/draco/`、无 4xx、无越界同源请求、无控制台错误。
- 之后删除临时 `dist-subpath/`，重新执行默认构建（1.69s，dist 201MB）。

### 备注
- 检查过程中出现的随机 UUID 请求为 `blob:` URL（GLTFLoader 内嵌纹理），并非越界网络请求；
  断言已按协议过滤。

## 2026-10-29 · 社区模型署名状态标注

### 背景
49 台社区模型里 22 台署名为泛化文案（如 “... by community (Sketchfab)”），没有作者和许可证；
原 UI 只显示 MODEL CREDIT 文本，容易被当成已核实署名。

### 改动
- `DeviceViewer.vue`：设备总览中，泛化署名后追加 “来源待核实” 标记（title 说明：仅标注社区来源，
  作者与许可证尚未核实）；有明确作者/许可证的 27 台不显示。
- `style.css`：`.credit-flag` 胶囊样式，宽度自适应，不溢出面板。

### 验证
- 无头 Chrome 5/5：galaxy-s22-ultra 显示标记且 title 正确、不溢出面板；switch-2（NAIT Studio, CC-BY 4.0）
  不显示；无控制台错误；截图 `/tmp/dji-credit-generic.png` 目视确认层级与字号。
- `npm run build` 1.71s；`npm run smoke` 11/11。

### 未完成
- 22 台泛化署名的真实作者/许可证仍需外部查证，未编造。

## 2026-10-29 · three.js 独立 chunk

### 改动
- `vite.config.js`：`build.rollupOptions.output.manualChunks` 把 `node_modules/three/` 拆为 `three` chunk。
  目的不是减小总量，而是让版本稳定的 three 在发版后继续命中旧缓存；engine/设备逻辑仍单独成块。
- `tools/smoke.mjs`：新增“大厅不加载 three.js”断言（12 项）。

### 验证
- 构建：`DeviceViewer` 903.95KB → 132.74KB（gzip 248.13 → 50.08KB）+ `three` 771.32KB（gzip 198.73KB）；
  总量基本不变（+0.11KB / +0.68KB gzip）。
- 生产预览 3/3：大厅 0 次 three chunk 请求；设备页恰好 1 次 `three-*.js`；action4 OFFICIAL 14 部件。
- `npm run smoke` 12/12（含新增断言）。

## 2026-10-29 · 设备配置加载失败态

### 问题
配置 chunk 动态 import 失败（发版后旧 chunk 404、弱网）时，挂载路径只写 `window.__ENGINE_ERR` 和 console，
页面停在空场景；切台路径只有 toast，没有恢复入口。

### 改动
- `DeviceViewer.vue`：新增 `loadFailed` 状态与错误面板（`role="alert"`）：
  “重新加载”（整页刷新）/“返回大厅”；挂载与切台失败都置位，导航/重试时复位。
- `style.css`：`#loadErr` 居中遮罩面板，宽度 `min(340px, 100vw - 48px)`。

### 验证
- 无头 Chrome 请求拦截 abort `action4.js`：4/4 通过——错误面板可见、文案与两个按钮正确；
  解除拦截点“重新加载”恢复 14 部件；再次阻断后点“返回大厅”回到 `#/`。
- 截图 `/tmp/dji-loaderr.png` 目视确认层级与对比。
- `npm run build` 1.71s；`npm run smoke` 12/12。

## 2026-10-29 · prefers-reduced-motion 支持

### 问题
项目此前完全没有处理 `prefers-reduced-motion`：开场 GSAP 编排、相机缓动、设备呼吸浮动、待机自转、
CSS 装饰动画（扫描线/脉冲）都照常播放，不符合无障碍与 AGENTS 的降级要求。

### 改动
- `DeviceViewer.vue`：读取 `prefers-reduced-motion`；命中时跳过开场时间线（直接显示控制条并给出操作提示），
  并把该偏好传给引擎。
- `engine.js`：`reducedMotion` 选项——相机缓动直接落到终点、关闭呼吸浮动与粒子旋转、不启动待机自转；
  `getState()` 补 `autoRotate` 字段便于验证。
- `style.css`：`@media (prefers-reduced-motion: reduce)` 将动画/过渡压缩到 0.001ms。

### 验证
- 无头 Chrome 模拟 `prefers-reduced-motion: reduce`，7/7 通过：开场标题立即隐藏、控制条 opacity=1、
  相机缓动已清空、过渡时长 1e-06s、3.5s 后 `autoRotate=false`、Space+2 仍可拆解与进入 X-Ray、无控制台错误。
- 截图 `/tmp/dji-reduced-motion.png`。
- 常规模式回归：`npm run build` 1.97s；`npm run smoke` 12/12。

### 本批收束验证
- `npm run lint:devices` 82/82。
- 生产预览 14/14（大厅口径、action4 14 部件与 Tour、6 机型抽查、移动端间距 19.6px、无控制台错误）。
- three chunk 3/3（大厅不加载、设备页恰好 1 次、装载正常）。
- `dist` 201MB，无 `.mimosa/.DS_Store`；临时 dev/preview/静态服务均已停止，用户自有 8200 未触碰。
