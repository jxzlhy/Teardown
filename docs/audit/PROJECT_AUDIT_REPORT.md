# 格物馆 · 全维度项目审计报告（PROJECT_AUDIT_REPORT）

- **审计日期**：2026-11-02（单轮次，含并行专项 + 浏览器实测）
- **审计执行**：Qoder Agent（架构 / UI / 性能 / 安全无障碍 / 产品竞品 五路并行 + 主代理实测复核）
- **代码基线**：git `e8106be`，工作区 345 项未提交改动（含 216 张缩略图、11 个 GLB）
- **版本口径**：`package.json` 3.0.0；实测规模 **117 台设备 / 882 部件 / 39 品牌 / 226.3MB GLB**
- **配套文档**：`MASTER_PROJECT_AUDIT.md`（指令原文）、`PROJECT_ISSUES.md`（问题清单）、`PROJECT_ROADMAP.md`（路线图）、`PROJECT_AUDIT_SCORE.md`（评分）、`PROJECT_OPTIMIZATION_LOG.md`（整改记录）

---

## 一、执行摘要（先说结论）

格物馆已经**不是**一个"能跑的 demo"：117 台真实展品的资产管线、构建期知识生成、双主题展厅、程序化机械锻造所、32 项端到端冒烟断言、以及一整套自我记账（LOG/BACKLOG/METRICS）在同类个人项目里属于头部水平。构建、lint、smoke 三条基线**全绿**，`npm audit` 生产依赖 **0 漏洞**。

问题集中在三处，且都不是"缺功能"：

1. **资产侧的性能天花板**（P0×2）。传输已经压到位（117/117 DRACO、97/97 纹理 webp），但**解压后尺寸无人管**：`v6-engine` 38 张 4096² 纹理估算 **3.26GB 显存**、`phone4apro` 有 **8192²**、9 台展品 >50 万三角（最高 231 万）；同时**拾取射线没走已引入的 BVH**（BVH 只在测量工具里建），于是"鼠标划过就卡"和"点进去就崩"这两个最坏的用户体验，恰好落在最贵的那批展品上。
2. **内容完整性与数字一致性失控**（P1×3）。两台**脚手架占位展品**（黑箱 + 字面 `TODO · 设备介绍`）已在馆内展出并被计入 117 台口径；同时 `MODEL_INVENTORY.md` 说 110、`timeline.json` 与 `knowledge-graph.json` 说 104、`index.html` 说 110、大厅说 117 —— 四个页面四个数字。项目自己的 AGENTS.md §4 明令"数量必须来自生成的 inventory"，而生成物本身已过期。
3. **日厅（浅色厅）没做完**（P1×1）。运行时对比度扫描：日厅网格 **109 个文本节点 / 81 个 class** 低于 WCAG AA，最差 **1.16:1**（品牌·年代行），而夜厅同类问题只有 23 个 class。日厅换肤走的是"逐选择器补皮"（165 条覆盖 / 约 670 条规则），必然漏。

另有 1 项**发布即违约风险**的许可问题（3 台 CC-BY-NC + 1 台 Sketchfab Free Standard + 1 台 GPL-3.0 随 `dist` 打包，35 台无 `modelCredit` 字段），以及一批工程与无障碍细节。

**综合评分 75/100**（详见 `PROJECT_AUDIT_SCORE.md`）。按本路线图 Phase 0–2 执行后，预期可达 **85 左右**，且不需要任何架构级重写。

---

## 二、项目现状与架构概览

### 2.1 技术栈（实测）

| 层 | 实现 | 备注 |
|---|---|---|
| UI 壳 | Vue 3.5 + vue-router 4（**hash 路由**）+ Vite 5 | `src/main.js:14` |
| 3D 引擎 | 原生 Three.js **0.164**，与 Vue 解耦于 `src/engine/` | `src/engine/engine.js` 1873 行 |
| 拾取加速 | three-mesh-bvh 0.9.17（**仅测量工具启用**） | 见 P0-2 |
| 动效 | GSAP 3.15（Webflow "no-charge" 许可，非 OSS） | 仅 UI 时间线 |
| 资产 | 运行时仅 GLB（DRACO + EXT_texture_webp），原始件备份 `vendor/assets/originals/`（1.7GB，gitignore） | 117 GLB / 226.3MB |
| 字体 | @fontsource/noto-sans-sc 900（196 分片 / 5.6MB，unicode-range 懒加载） | `src/main.js:5` |
| 缓存 | Cache Storage `teardown-glb-v1` + 512MB LRU（`cache-policy.js`） | 成熟 |
| 测试 | 自研 `npm run smoke`（32 项）+ 约 40 个 `tools/*verify*.mjs` + `lint-mapping/knowledge/mech` | 无 ESLint/Prettier |

### 2.2 模块地图

```
src/
  main.js / App.vue          路由与壳（7 条路由，全部懒加载）
  components/                GalleryHub 476 · DeviceViewer 1235 · GraphView 773
                             ForgeView · CompareView · TimelineView · PageHeader
  engine/                    engine.js 1873（装载/拾取/爆炸/剖切/X光/导览/测量/捕获）
                             view-modes 293 · labels 151 · glbCache 140 · materials · previewScene
  devices/                   117 份声明式配置 + _kit/{factory,internals,screen}
  forge/                     程序化机械生成（v8 471 · turbofan 380 · ringdrive 332 · mech QA）
  knowledge/                 brands / comparisons / 20 条 technologies 词条
  lib/                       brand · explore（收藏/足迹/徽章）· ratings · model-class · url
tools/                       95 个 .mjs：gen-inventory/graph/timeline · lint-* · smoke · thumbs · optimize-glb · usd2glb/cad2glb
```

### 2.3 数据流与契约（实测评价）

引擎↔Vue 的**正式**契约是 `createEngine()` 返回的方法集 + `hooks.onChange` 标量快照（`engine.js:1478-1499`、`getState()` 刻意只出计数，`engine.js:1851-1859`）——这部分设计干净，且引擎实例用普通 `let` 持有、**不进响应式**（`DeviceViewer.vue:488`），全库无 deep watch。

但**事实契约**是 window 全局：`__THREE / __LOADS / __RAW / __CAM / __ENGINE / __LOAD_ERR / __animErr`，其中 `__ENGINE` 被 66 个工具脚本当 API 用，`__LOADS` 只增不清；设备配置层还反向依赖它（`src/devices/marshall-jcm800.js:49`）。这是可测试性与架构纯洁性之间的**未记账债务**。

---

## 三、审计范围与覆盖情况

| 维度 | 覆盖方式 | 覆盖度 | 未覆盖 |
|---|---|---|---|
| UI 视觉 | CSS/模板静态审计 + 1440×900 与 390×844 截图 14 张 + 运行时对比度扫描 | 高 | 真机色彩、读屏 |
| UX 交互 | 浏览器实测（搜索/筛选/空态/双厅切换/拆解/浮层/键盘 Tab） | 中-高 | 长导览、多设备横屏 |
| 产品功能 | 字段覆盖率统计（8 个功能字段 × 117 台）+ 页面文本抓取 | 高 | 用户行为数据（项目无埋点） |
| 代码质量 | 全量读 engine/DeviceViewer/registry + grep 生命周期配对 | 高 | 未逐读 117 份配置 |
| 架构 | 契约与依赖方向分析、分包与懒加载实测 | 高 | — |
| 性能 | **117 个 GLB 独立解析取证** + 设备页运行时 heap/请求/帧率 + dist gzip | 高 | 真机显存、弱网 |
| 响应式兼容 | 390×844 实测（触控目标、溢出、safe-area） | 中 | iOS/Android 真机 |
| 安全 | XSS 面 grep、深链参数校验、依赖 audit、存储键清单 | 高 | 渗透（无后端，面很小） |
| 许可合规 | 逐台 credit 抽查 + 调研 JSON 交叉比对 | 中 | **需人工逐台复核上游页面** |
| SEO/无障碍 | DOM 语义/地标/焦点/ARIA/对比度实测 | 高 | 读屏软件走查 |
| 动效 | reduced-motion 覆盖、`:active` 缺失、动画常驻渲染 | 中 | 主观流畅度（帧率见实测） |
| 竞品与最佳实践 | 联网核实 9 个参照产品 + 11 项技术方案 | 中-高 | 部分二手数据已标"未核实" |

**实测环境**：macOS 24.6 / Chrome 156（headless，`--use-angle=metal` 真 GPU 路径）/ Vite 5 dev server；测量时段系统 load average 3.6–7.4，故**帧率与耗时为下界口径**（真实空闲机更好）。

---

## 四、各维度审计结果

### 4.1 UI 视觉

**做得好**：三层字体语义（名字层 Noto Sans SC Black / 数据层 mono / 操作层 sans）是真正的系统化思路；`color-mix` 派生梯度令牌（`--acc-08/16`）随展品主色自动换肤；hud.css 提供零依赖 HUD 组件基座；"恒夜厅"的研究翼范围有明确裁定并写进注释（`style.css:1092-1093`），避免了双主题无边界扩散。

**问题**：
- **P1-3 日厅对比度**：见执行摘要。根因是"逐选择器补皮"而非"语义层换色"。
- **P2-8 令牌债**：39 个变量全平铺在单一 `:root`，无原始/语义/组件分层；死变量 3 个、别名重复 2 组、`var(--accent, #7fb0d0)` 拼写事故 1 处（`--accent` 从未定义，永远走 fallback，`style.css:795`）；青色字面量 `rgba(69,224,255,…)` 42 处直接击穿换肤；hex 72 / rgba 184 / px 1199。
- **P2-9 字符当图标**：正式控件上约 28 处 `✕ ★ ✎ ◆ ▴ ‹ › ＋ ↗ ⬇ ⧉ ⇥ ⚒`，与已有的 24 个内联 SVG 图标体系混用。
- **组件重复**：药丸按钮 6 套、搜索框 2 套、textarea 2 套近逐行相同、eyebrow 3 套、tooltip 4 套。
- **量化噪声**：字号 24 种（含 8.5/9.5/10.5/11.5/12.5/13.5/15.5 七个半 px 档）、行高 11 种、字距 21 种、z-index 14 种魔法数（且 `#exploreDrawer` 与 `#loadErr` 同为 z30 撞层）。
- **视觉判断（截图证据）**：① 1440×900 首屏左列牌记上下留空约 300px、右列焦点展台模型只占卡片中部，构图松散（`/tmp/audit/01-hall-night-top.png`）；② `/forge` 首屏左列长表单、右列只有一个近乎空白的导入面板，且页头 `← 格物馆` 与 H1 `机械锻造所` 视觉相撞（`/tmp/audit/20-route-forge.png`）；③ `/timeline` 在 1440 宽下只用掉左侧约 1000px，右侧整片空白，且每条目重复"技术 · 实用化"（8 条完全相同）——信息密度低（`/tmp/audit/20-route-timeline.png`）；④ 日厅设备页白底白台座，展品缺少接地感（`/tmp/audit/10-action4-view.png`）。

### 4.2 UX 交互

**做得好**：搜索空态有明确文案与出路（实测"没有匹配的设备 — 换个筛选条件试试"）；未标定设备的测量显示 `X.XX u · 未标定` 而不是假装精确（`engine.js:1349`）；机构面板无数据即整体隐藏（`DeviceViewer.vue:315`）；设备页 28 个可见按钮**全部带 aria-label**（实测"视角预设/白天/黑夜双厅/网格显隐"）；首访有 QUICK GUIDE 操作引导卡；URL 深链可分享且参数全白名单钳制。

**问题**：
- **P1-4 发现路径**：首屏可交互元素仅 6 个，搜索框在折叠线以下，第一张卡片在 y=1366（滚动容器高 19086）。带着目标来的用户第一动作找不到。
- **P1-9 移动端导视**：文案变长即把"双厅切换"挤出视口（实测右边界 x=438 > 390）。
- **P2-10 触控**：299 个可交互元素里 128 个 <44px；safe-area 全站仅 1 处。
- **P3-12/13**：对比页表头不顶粘（下滑后不知道哪列是哪台）；触摸端仍显示"hover 暂停"。
- **认知负荷**：设备页 dock 有 15 个图标按钮（DOM 文本含快捷键提示，但视觉上是图标墙），"整机/X光/隔离/剖切/测量/逐步装配/视角"混在一排，缺少分组语义标签（现有一个竖排"视图"小标签，8.5px、对比度 2.81:1）。

### 4.3 产品功能

**广度**：拆解/装配/逐步装配、整机·X光·隔离·剖切四视图模式、两点测量、5 视角预设、自动导览（连播/手动 + TTS）、标签系统、坐标辅助、六维评分+备注、收藏与自定义分类、徽章与足迹、知识星图、技术编年、代际对比、机械锻造所（参数+种子确定性复现 + GLB/配置导出）。这个功能面**超过** iFixit（无 3D 交互）与 Sketchfab（无逐部件语义拆解）。

**深度不足（P2-13，实测覆盖率）**：

| 字段 | 覆盖 | 说明 |
|---|---|---|
| `specs` | 117/117 | 健康 |
| `tour` | 115/117 | 健康 |
| `xrayShellIds` | 115/117 | 健康 |
| `demos` 运行演示 | 20/117 (17%) | 中等 |
| `quality` 质量分级 | 19/117 (16%) | 偏低 |
| `mech` 机构关系 | **3/117 (2.6%)** | 差异化能力，数据几乎空 |
| `assembleStep` 逐步装配 | **2/117 (1.7%)** | 兜底分 5 层，非策展 |
| `realSizeMM` 测量标定 | **1/117 (0.9%)** | 工具对 116 台无意义 |

**内容完整性（P1-1）**：`spitzer-space-telescope` / `chandra-x-ray-observatory` 是脚手架半成品（黑箱 + TODO 文案 + 1 部件），却在馆内、被计入 117 台口径、并出现在知识星图里。这是本次审计**最刺眼**的一条——因为它违背的是项目自己写在 AGENTS.md §1 的最高目标。

**功能冲突/冗余**：`/collection` 与 `/` 同壳不同态（合理）；但"我的探索"抽屉、收藏馆、设备页信息浮层三处都能收藏，状态同步靠 pub-sub，尚无冲突证据但已是三入口。

### 4.4 代码质量与架构

**做得好（值得明确肯定）**：
1. `loadSeq` + `AbortController` 双重防陈旧装载，且 AbortError 不误报为错误（`engine.js:602-605,640,793`）——切台竞态处理是教科书级。
2. `disposeDevice()` 对几何/材质/贴图/BoundsTree 成对释放（`engine.js:466-497`）。
3. `glbCache` 并发单飞合并 + LRU + 全链 try/catch，Cache Storage 不可用即透明降级。
4. 路由级分包彻底：大厅**零 three**，设备配置按台懒加载（`vite.config.js:8-14` 虚拟模块），实测进入设备页只请求 1 份配置。
5. 构建期生成（inventory/graph/timeline）替代 CMS —— 在"无后端 + 许可受限"约束下这是**结构性优势**，不是欠账。

**问题**：P1-5（`__ENGINE` 不删）、P1-6（PMREM 不释放）、P1-7（未映射网格静默丢弃）、P2-4（文档/工具漂移）、P2-14（window 全局当契约）、P2-15（两个超大文件）、P3-01（`engine.js?v=30`）、P3-02（存储前缀混用）、P3-10（无 ESLint）。

### 4.5 性能（本次取证最充分的维度）

**JS/构建**：`build` 2.74s ✓；gzip 实测 index 42.5KB / DeviceViewer 80KB / **three 209KB** / GalleryHub 7.3KB / GraphView 11.5KB / registry 14.6KB / ratings 13.2KB。首屏不加载 three（实测大厅 `canvasCount: 0`）。`registry` 的 117 行静态 import 只在构建期执行，不构成运行时线性膨胀（子代理误报已核实纠正）。

**资产（独立解析 117 个 GLB，非引用旧文档）**：

| 指标 | 实测 |
|---|---|
| 总量 | 226.3MB / 117 台，中位 **0.94MB** |
| 压缩 | DRACO **117/117**；有纹理的 97 台 **97/97 全 webp**（无漏网） |
| >6MB | 10 台（v6-engine 13.7 / ak-47 13.0 / curta 9.5 / gl-06 9.4 / porsche-911-930 9.1 / phone4apro 7.8 / combustion 6.7 / iphone-12 6.4 / walther 6.2 / computer-parts 6.1） |
| >50 万三角 | 9 台（combustion 231.3 万 / radial 225.2 万 / v8 200.4 万 / v6 129.0 万 / hubble 81.8 万 / wankel 76.9 万 / carrera 65.3 万 / santacruz 59.7 万 / +1） |
| ≥4096 纹理 | **14 台**；估算解压显存：v6-engine **3259MB**、phone4apro 1222MB（含 8192²）、porsche-911-930 952MB、ak-47/gl-06/nikon-d6/walther 各 515MB、iphone-12 464MB、wankel 343MB（8192²）、phone3 289MB、mini4pro 135MB、avata2 118MB、nikon-z6 86MB、iphone-13 47MB |

**运行时（真 GPU headless Chrome，load 3.6–7.4）**：

| 场景 | 请求 | 传输 | JS heap | FPS |
|---|---|---|---|---|
| 大厅 1440×900 | 50 | 2.39MB（dev） | — | 无 canvas |
| action4 设备页 | 94 | 6.01MB | **36.9MB** | 60 |
| v6-engine 设备页 | 128 | **24.4MB** | **115.2MB** | 60 |
| 5 台连切后回大厅 | — | — | 回落至 **19.2MB**，canvas 0 | — |

结论：**JS 侧健康**（分包/懒加载/缓存都做对了），**风险全在 GPU 资源侧**；连切 5 台后 heap 回落到 19.2MB 说明主泄漏路径已被 `disposeDevice` 覆盖，但 P1-5/P1-6 的残留属于"每次访问都漏一点"的类型，需专项复测（本次探针崩溃未取数）。

**渲染**：后处理链常驻 + rAF 恒转（P2-1）、标签层每帧全量写 DOM（P2-2）、`antialias:true` 对 composer 无意义（P2-1）。已有 L2/L1/L0 自适应降级（pixelRatio/阴影/后处理分级，42fps 触发）与 reduced-motion 短路——**降级机制在，缺的是"别一直满载"**。

### 4.6 响应式与兼容性

3 个断点（700/860/1080）。390×844 实测：无横向溢出（`scrollWidth == innerWidth`）、卡片懒加载生效（118 img 中仅 19 张已加载）、sheet 与画布共存、dock 保留步进器作为移动端唯一装配入口（细节到位）。缺陷集中在触控尺寸（P2-10）、导视溢出（P1-9）、safe-area 仅 1 处、以及**从未在真 iOS/Android 上验证过**（BACKLOG 自己也标为待办）。

### 4.7 安全

**攻击面极小且干净**：`v-html` 0 处、`eval/new Function/document.write/window.open/location.href=` 0 处；用户输入（分类名/备注/评分/Forge 导入 JSON）全部走 Vue 插值转义 + 长度/数值钳制；深链 `?e/?p` 白名单与 clamp 齐备；`npm audit --omit=dev` **0 漏洞**（dev 2 项：esbuild GHSA-67mh-4wv8-2f99 → vite≤6.4.3）。存储键 11 个全为非敏感偏好。

**真实风险不在 XSS，在许可**（P1-8）。次要：无 CSP / 无 Referrer-Policy（P2-11）、`labels.js:36` 的 innerHTML 属**潜在**注入口而非活动漏洞（P2-12）。

### 4.8 SEO 与无障碍

hash 路由 + 无预渲染 ⇒ 117 个设备页事实上不可索引；缺 `robots.txt`/`sitemap.xml`/`og:image`/`twitter`/`canonical`/`manifest`/结构化数据；分享无卡片。语义层缺 `<main>`/`<footer>` 地标与 skip link，`<figcaption>` 非法嵌套（每次 dev 编译告警），`aria-live` 0 个，`CompareView.vue:104` 关掉焦点环，全项目 `:active` 0 条。对比度问题见 P1-3。

**做得好**：`prefers-reduced-motion` 用全局 `* !important` + 引擎侧短路双层覆盖；118 张缩略图 **alt 118/118**、`decoding` 118/118、`loading="lazy"` 117/118；Tab 顺序可用且控件带 aria-label。

### 4.9 动效

GSAP 仅用于 UI 时间线（未污染 3D 主循环）；开场/缓动/浮动/自转均有 reduced-motion 降级；`@keyframes` 8 个。问题：常驻满载（P2-1）、缺 `:active` 按压反馈（P2-7）、`matchMedia` 只读一次（P3-06）。

### 4.10 竞品与最佳实践（摘要，全文见研究报告）

- **iFixit**：照片式逐步拆解 + 可修性评分语言 → 可借鉴"难度/工具/步骤编号"元数据；我们**优于**它：全 3D 可自由检视。
- **Sketchfab**（2026-08 起 Epic→KitBash 易主）：标注锚点+热点浮层值得借鉴；平台主权不可控，**不建议**整体嵌入。
- **Apple 产品页**：滚动编排的"拆解演出"镜头语言值得学；观众无自主权，我们可操作、可回溯。
- **`<model-viewer>`（Apache-2.0，4.2.0）**：唯一缺的展示维度是**网页 AR**（把无人机放桌上），可作隔离元件试点（I-04）。
- **Google Arts & Culture / Smithsonian Open Access / 卢浮宫《蒙娜丽莎：越界视野》**：策展 Story 动线、CC0 资产源、"揭示隐藏层"的叙事包装（正好是我们 X-Ray 的讲法）。
- **技术侧值得做**：KTX2/Basis（显存 1/4–1/8）、meshopt A/B（社区口径解码快 5–10×，**未自测**）、vite-plugin-pwa（离线，MIT）、d3-scale/axis（编年页刻度）。
- **明确不做**：换引擎（PlayCanvas/R3F）、three 大版本跃迁捆绑重构、上后端 CMS、整体嵌入第三方查看器、用 AI 批量生成"部件原理"文案（违反真实性约束）。

---

## 五、现有优秀实现（清单，供后续改动时保护）

1. 切台竞态防护：`loadSeq` + `AbortController` + AbortError 静默（`engine.js:602-605,640,793`）。
2. 设备资源成对释放：几何/材质/贴图/BoundsTree（`engine.js:466-497`）。
3. 缓存策略：Cache Storage 存**原始字节**（不是解码对象图，避免内存翻倍）+ 512MB LRU + 并发单飞 + 可中止。
4. 路由级分包与按台懒加载：大厅零 three（实测 `canvasCount:0`、只请求 1 份设备配置）。
5. 构建期知识生成：inventory/graph/timeline + 三个自研 lint（mapping/knowledge/mech）。
6. 诚实降级文化：未标定显示 `u · 未标定`、无 mech 数据即隐藏面板、无策展设备曾显式兜底。
7. 无障碍细节：缩略图 alt/decoding/lazy 全覆盖、dock 按钮全带 aria-label、reduced-motion 双层降级。
8. 自我记账体系：`AUTONOMOUS_LOG/BACKLOG/METRICS` + 分阶段档案 + 指标只记可复现测量。

---

## 六、风险矩阵（如果什么都不做）

| 风险 | 触发条件 | 后果 | 概率 | 缓解 |
|---|---|---|---|---|
| 移动端/集显打开重展品即崩 | 用户访问 v6-engine/phone4apro/porsche | 黑屏、context lost、标签页被杀 | 高 | P0-1 纹理 2048 上限 |
| 高面数展品悬停卡顿 | 鼠标划过 combustion/radial/v8 | 数百 ms 冻结，观感"不专业" | 高 | P0-2 BVH 回补主拾取 |
| 公开发布触发许可争议 | 站点/仓库公开 | NC/Free Standard/GPL/Apple AR 再分发争议 | 中-高 | P1-8 lint + 排除构建 |
| 数字不一致损害可信度 | 用户跨页对比 | "博物馆"的严谨人设受损 | 已发生 | P1-2 生成物 + 一致性 lint |
| 占位展品被看到 | 用户点进 spitzer/chandra | 直接暴露未完成 | 已发生 | P1-1 下线 + TODO 规则 |
| 日厅不可读 | 投影/办公环境使用 | 一半展厅失去价值 | 已发生 | P1-3 token 反转 |
| 长会话内存单调上升 | 导览/演示 30 分钟 | 移动端被系统回收 | 中 | P1-5/P1-6 |
| 无埋点导致按感觉排优先级 | 持续 | 资源投到低价值功能 | 已发生 | 见 ROADMAP Phase 4 |

---

## 七、综合评价

**定位判断**：格物馆当前是"内容资产驱动的实验型精品"，工程成熟度高于同体量个人项目均值一档，但**产品化收尾（一致性、发布合规、浅色主题、发现路径）没有跟上功能扩张**。它的问题几乎全部是"最后一公里"性质的：不需要重写引擎，不需要换栈，不需要加后端——需要的是把已有的管线纪律（lint、生成、断言）覆盖到**新出现的维度**上（资产显存、数字一致性、对比度、许可）。

**最该先做的三件事**（详见 ROADMAP Phase 0）：
1. 14 台 ≥4096 纹理降到 2048 + BVH 回补主拾取（两条 P0，成本中/低，收益是"不崩不卡"）。
2. 下线 2 台占位展品 + 重生成 3 份生成物 + 加一致性 lint（一天内可完成，直接止血可信度）。
3. 日厅对比度在 token 层重做（不是再补 165 条覆盖）。

**不建议做**：任何引擎重写/框架迁移/three 大版本跃迁；引入 UI 组件库；上后端 CMS；用生成文本填充知识层。
