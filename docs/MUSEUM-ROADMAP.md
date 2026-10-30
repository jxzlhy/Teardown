# DIGITAL TECH MUSEUM — ULTIMATE PRODUCT & TECHNOLOGY ROADMAP

> 生成：2026-10-31 · 研究基线：**103 台设备 · 815 部件 · 38 品牌**（以 `npm run gen:inventory` 实际输出为准；研究期间馆内并行会话新增 Regency TR-1，口径随清单滚动）
> 性质：**第一阶段研究交付物**。本文只调研与规划，不改动引擎与设备数据。
> 研究方法：仓库逐个用 Web 实证核实（存在性/许可证/维护状态/兼容性）；查不到的一律标注"未证实"或"不存在"，不虚构。
> 配套文档：`docs/DESIGN_SYSTEM.md` · `docs/DESIGN_SKILLS.md` · `docs/DESIGN_QA.md` · `docs/MOTION_GUIDELINES.md` · `docs/3D_EXPERIENCE_GUIDELINES.md`

---

## 第一部分 · 项目现状诊断

### 1.1 技术架构（实际核实，非文档转述）

| 层 | 实况 | 证据 |
|---|---|---|
| 构建 | Vite 5.4 + @vitejs/plugin-vue 6 | package.json |
| UI 壳 | Vue 3.5 `<script setup>`，无 Pinia，vue-router 4（hash） | src/main.js, App.vue |
| 引擎 | vanilla three 0.164（npm，非 CDN），壳/引擎分离，引擎不知 Vue 存在 | src/engine/engine.js（1096 行） |
| 动效 | GSAP 3.15 仅 UI 时间线；大厅用 Vue TransitionGroup | TECH.md §1 |
| 样式 | 原生 CSS 变量主题（--acc 每设备换肤），无组件库 | src/style.css（694 行）+ hud.css |
| 数据 | 103 个设备配置模块（`src/devices/*.js`），registry.js 唯一事实源 | src/devices/registry.js |
| 构建优化 | virtual:device-manifest / device-loaders（大厅 0 KB three）；three 独立 chunk 771KB/gzip 199KB | vite.config.js, TECH.md |
| 缓存 | glbCache：Cache Storage 持久缓存 + 预取 + 并发合并/取消 | src/engine/glbCache.js |
| 工具链 | inspect-glb / optimize-glb / addDevice / lint-mapping / gen-inventory / render-thumbs / smoke / usd2glb.py / cad2glb.py / stl2glb-batch / fix-specgloss | tools/（11 个脚本） |

### 1.2 已有能力清单（后续规划不得重复建设）

- **四态视图模式**：整机 / X-Ray（外壳半透明+内构件淡化）/ Isolate（部件隔离）/ Clip（剖切，材质切 DoubleSide + accent 指示板）
- **爆炸/装配**：逐部件 offset + GSAP 插值，assembledPos 精确复位；程序化内构件（builders/_kit）
- **策展 Tour**：逐部件自动运镜讲解（tour 数组），上一步/下一步、进度点、键盘左右键
- **拾取与详情**：OutlinePass 描边（OUTLINE_OK 探测）、部件详情卡、capturePartThumb 运行时特写小图
- **自适应画质**：L2→L1→L0（pixelRatio 1.5→1、阴影 1024→512、L0 关辉光/描边），FPS<42 降级
- **无障碍**：prefers-reduced-motion 全链路降级（7/7 断言）；错误面板（chunk 404 可恢复）
- **大厅**：品牌/分类筛选、搜索、编辑部式卡片、统计口径自动生成
- **合规**：37 台社区模型全量署名（modelCredit/modelSource）+ lint 强制禁止 "by community" 无署名
- **回归**：`npm run smoke` 断言全绿（当前 15 项，数量随版本滚动）+ 无头 Chrome 场景测试（reduced-motion、深链、移动端间距等）

### 1.3 核心短板（按影响排序）

| # | 短板 | 现状证据 | 影响 |
|---|---|---|---|
| S1 | **部件只有"是什么"，没有"为什么"**：parts[] 有 desc/specs，但无工作原理、无技术关联、无资料来源分级 | src/devices/pocket3.js | 与"拆开科技、理解科技"的愿景差距最大 |
| S2 | **无时间维度**：无品牌档案、无产品发布年/迭代关系（iPhone 12→13→16→17→Air 散落无链） | registry.js | 设备间无叙事连接 |
| S3 | **无跨设备知识网络**：共通技术（无刷电机、锂电、CMOS）重复散写在各设备 desc 里 | 各 device.js | 知识不可检索、不可漫游 |
| S4 | **实验能力缺口**：无测量、剖切无封盖（stencil 降级 LATER）、无装配顺序步骤化 | view-modes.js、BACKLOG P2 | "交互实验室"缺基础件 |
| S5 | **设计规范未成文**：token 只存在于 CSS，无文档；AI 协作无统一标准 | style.css | 每轮改 UI 靠口口相传 |
| S6 | **无音频维度**：完全静音 | 全库无 Audio | 沉浸感缺一角 |
| S7 | **无探索激励**：无收藏/任务/进度 | — | 长期回访动力不足 |
| S8 | **真实移动端回归缺失**：无头 Chrome 模拟 390×844，无真机 iOS/Android 验证 | BACKLOG P2 | 未验证项，不得声称已通过 |

### 1.4 明确的优势（应当保持）

- 拆解/爆炸视图领域**没有可照搬的成熟开源竞品**（调研见第四部分），本项目的映射管线（mapByPosition 位置聚类、inspect 体检、lint 校验）已是自研领先方案。
- 壳/引擎分离 + manifest 分包的架构足以承载后续全部扩展；**不需要框架迁移或引擎重写**。
- 合规链路（署名→lint→inventory 自动生成）已在，这是很多同类项目没有的。

---

## 第二部分 · AI Skill 研究报告

### 2.1 核实结论总表（全部经 Web 实证，2026-10-31）

| 仓库 | 存在性 | 性质 | 许可证 | 维护/热度 | 实际能力 | 本项目结论 |
|---|---|---|---|---|---|---|
| **dickwu/apple-design-skill** | ✅ 存在 | **社区项目**（页面明确声明 "not affiliated with or endorsed by Apple"） | ⚠️ 无标准 OSS 许可证（"provided as they are"；内含 123 个 HIG 页面文本，版权归 Apple） | 23 commits · 2.4k★ | 基于 Apple HIG 的 UI/UX 审查；含策划版 liquid-glass.md；`scripts/pull-hig.mjs` 可更新 HIG 文本；支持 Claude Code/Cursor/Codex | **摘录原则、不直接安装**（许可证不明 + HIG 文本版权） |
| **anthropics/skills** | ✅ 存在 | **Anthropic 官方** | Apache 2.0（多数；docx/pdf/pptx/xlsx 为 source-available） | 61 commits · 185k★ | 19 个官方 skill，含 **frontend-design**、canvas-design、theme-factory、webapp-testing、brand-guidelines、skill-creator | **采用 frontend-design**（生成新 UI 时的品味基线） |
| **pbakaus/impeccable** | ✅ 存在 | 社区（Paul Bakaus，由 Anthropic frontend-design 衍生） | **Apache 2.0** | 2,600 commits · 高热 | `critique`=打分 UX 评审；`audit`=62 条确定性规则（无 LLM 可跑 CI：`npx impeccable detect src/`）；**明确支持 Trae** 等 20+ 工具 | **采用**（审查/CI 主力） |
| **emilkowalski/skills** | ✅ 存在 | 社区（Emil Kowalski，前 Vercel/Linear） | MIT | 51.8k★ | 16 个 skill：animate 系列、apple-design、pick-ui-library、prototype；**React/React Native 导向偏重** | **观望**（动画理念可读，安装价值低） |
| **vercel-labs/agent-skills** | ✅ 存在 | **Vercel 官方** | MIT | 280 commits · 33.3k★ | 8 个 skill；web-design-guidelines（100+ 条 UI/a11y/UX 规则）与框架无关，其余 react-*/deploy 与本项目无关 | **观望**（与 impeccable 功能重叠，二选一即可） |
| **Delanyo32/ux-skill** | ✅ 存在 | 社区个人实验 | ❌ **无许可证** | 3 commits · 0★ | /ux profile→audit→fix 三段式 | **不用**（无许可授权 + 不成熟） |
| **GuidanceStudio/uxui-audit-skill** | ✅ 存在 | 社区早期 | MIT | 26 commits · 0★ | 截图式 13 维可用性/可访问性审计 | **观望**（不重复装，impeccable 已覆盖） |

**未证实项**：独立的"Three.js Skill"仓库（搜索超时未完成核实）。鉴于本项目的 3D 经验已沉淀在 `.zcode/skills/convert-asset/`、`.zcode/skills/add-device/` 与本文第六部分，暂不依赖外部 Three.js skill。

### 2.2 Apple 官方资料（URL 已核实，注意与社区项目区分）

- Human Interface Guidelines 主页：https://developer.apple.com/design/human-interface-guidelines
- Materials（Liquid Glass 材料）：https://developer.apple.com/design/human-interface-guidelines/materials
- Liquid Glass 技术概览：https://developer.apple.com/documentation/technologyoverviews/liquid-glass
- Adopting Liquid Glass：https://developer.apple.com/documentation/technologyoverviews/adopting-liquid-glass
- WWDC25「Meet Liquid Glass」：https://developer.apple.com/videos/play/wwdc2025/219

**关键澄清**：apple-design-skill（dickwu）是**社区项目**，只是把上述官方 HIG 文本抓取成 skill 可读格式；本项目文档中不得表述为"Apple 官方 Skill"。同时，HIG 是 iOS/macOS 原生平台规范，套用到 Vue3 Web 项目时只能取**原则层**（层级、对比、克制、触达目标 ≥44pt、动效语义），不能照抄组件形态。

### 2.3 推荐最小组合（本项目落地）

1. **impeccable**（Apache-2.0）：UI 改动后跑 `critique`/`audit`；CI 可用确定性规则扫描。
2. **anthropics/skills · frontend-design**（Apache-2.0）：新页面/新组件生成时的设计基线。
3. **工作区已有 `.zcode/skills/frontend-skill`**：继续作为本项目"克制构图/图片主导/动效克制"的本地规范。
4. `dickwu/apple-design-skill`：**人工摘录**其中 liquid-glass.md 与 HIG 原则进 `docs/DESIGN_QA.md`，不作为依赖安装。

明确不装：ux-skill（无许可证）、uxui-audit-skill（重复）、vercel react-* 系列（技术栈不符）、emilkowalski animate 系列（React 导向 + 与 GSAP 职责重叠）。完整使用方法见 `docs/DESIGN_SKILLS.md`。

---

## 第三部分 · 技术库研究报告

### 3.1 决策原则

1. **职责不重叠**：每个维度只允许一个库（现有 GSAP+CSS 已覆盖 DOM 动效，则 motion/anime 不进）。
2. **零外网依赖**：运行时不允许 CDN/外部 API（Lucide/Iconify 只能用 offline 包或内联 SVG）。
3. **只增不破坏**：新库必须可与 three 0.164 共存，peer 范围必须核实。

### 3.2 组件库：结论 = 不引入

| 库 | 核实结果 | 结论 |
|---|---|---|
| shadcn-vue（unovue） | MIT · 10.8k★ · 活跃 · 基于 reka-ui | 不引入：自绘玻璃拟态 HUD 已成体系，复制粘贴式组件反而破坏视觉一致性 |
| Reka UI（原 Radix Vue） | MIT · v2 · 2,196 commits · 活跃 · shadcn-vue 的上游 | **备选**：仅当未来需要复杂无障碍弹层/Combobox/ContextMenu 时按需引入原语 |
| Naive UI / Element Plus | 均活跃维护（2026 口径） | 不引入：完整视觉体系与本项目 HUD 语言冲突，体积不可接受 |
| headlessui (Vue) | React 侧为主，Vue 版更新缓慢（未逐项核实，标注） | 不引入（Reka UI 已覆盖此生态位） |
| 图标 Lucide/Iconify | Lucide ISC（免署名可商用）；Iconify 是分发层、许可随各家集合，有 offline 包 | 维持现状：内联手绘 SVG；如需批量补图标，用 `@iconify-json/lucide` 离线包 |

### 3.3 动效库：结论 = 维持 GSAP，零新增

| 库 | 核实结果 | 结论 |
|---|---|---|
| **GSAP 3** | 2025-04 Webflow 收购后 **3.13 起全部插件（含 SplitText/DrawSVG/MorphSVG）免费**，可商用 | **维持现状**；新需求优先用免费插件族（如文字动效 SplitText），不新增他库 |
| motion (motion.dev) | 官方支持 Vue（"React, Vue and JavaScript"），mini `animate` 3.2kb 起 | 不引入：与 GSAP 职责重叠 |
| anime.js v4 | MIT · 74k★ · ES modules 已正式发布 | 不引入：同上 |
| Lenis | MIT · 17k★ · 活跃 · 自带 prefers-reduced-motion | 不引入：本项目全屏 canvas 无长页滚动 |
| Theatre.js | ⚠️ README 声明"开发暂转私有仓库"，公开仓 issues 积压 119；core=Apache-2.0 / studio=AGPL-3.0 | 不引入：发布节奏与许可风险，编排需求用现有 tour 数组 + GSAP 足够 |
| Rive / Lottie-web / AutoAnimate | Rive runtime MIT 且活跃；lottie-web 低维护；AutoAnimate MIT 低维护 | 不引入：无对应需求；UI 微动效 CSS/GSAP 已覆盖 |

### 3.4 Three.js / WebGL 升级（核心结论）

| 库 | 核实结果 | 结论 |
|---|---|---|
| **three-mesh-bvh** | MIT · v0.9.17 · peer three ≥0.159（0.164 兼容） | **引入**：精确拾取加速、测量（两点表面取点）、后续视锥剔除 |
| three-bvh-csg | MIT · 需钉 v0.0.17（peer ≥0.151）才配 0.164；新版要 ≥0.179 | **观望**：仅当 stencil 封盖方案不够时做布尔断面 |
| pmndrs/postprocessing | Zlib · 最新 6.39.5 需 three ≥0.168，**与 0.164 不兼容**；需钉 6.36.x | **观望**：现 OutlinePass 正常，不为此升级 three 或钉旧版 |
| three-gpu-pathtracer | MIT · 活跃 · 需 WebGPU 且仅 Standard/Physical 材质 | 不用（可当离线渲染美术参考） |
| KTX2Loader / MeshoptDecoder | three 0.164 内置（r164 release notes 核实） | 现管线 GLB+webp+draco 够用，**不必需**；未来纹理占比大的设备可评估 |
| WebGPURenderer / TSL | r164 仍破坏性重构期（migration guide + 社区报告节点失效） | **观望**：随 three 大版本升级再评估 |
| GaussianSplats3D | MIT · npm 0.4.7（2025-01）· **作者声明不再活跃开发**，推荐 Spark | 不用：拆解馆不需要 3DGS |

### 3.5 知识图谱库

| 库 | 核实结果 | 结论 |
|---|---|---|
| **3d-force-graph**（vasturiano） | MIT · 6.5k★ · d3-force-3d 物理引擎 · `graphData()` 直吃本地 JSON · 可暴露 scene/renderer/EffectComposer | **采用**（图谱 3D 模式） |
| **sigma.js + graphology** | MIT · v4 · 12.2k★ · WebGL 2D 大图 · OuestWare 商业赞助持续维护 | **备选/采用**（图谱 2D 模式，节点多时更易读） |
| cytoscape.js | （未逐项核实）成熟但偏学术重 | 不引入（上述二选一组合已覆盖 2D+3D） |

### 3.6 音频 / 物理 / 科学可视化

- **音频**：优先**原生 Web Audio API + three `AudioListener`/`PositionalAudio`**（零依赖、three 自带空间化）；howler.js（MIT，spatial 插件内置，7kb）仅当 UI 音效管理复杂化时备选。音源必须用可再分发授权（CC0 首选），默认静音、移动端不自动播放。
- **物理引擎**：Rapier（**仅 Apache-2.0**，此前"MIT/Apache 双许可"记忆有误——已核实修正；Rust+WASM，@dimforge/rapier3d-compat，活跃）；cannon-es 维护停滞。结论：**暂不引入**。工作原理演示（云台三轴、齿轮传动、气流）用程序动画 + Shader 实现，并在 UI 明确标注"视觉原理演示，非工程仿真"。
- **剖切封盖（stencil cap）已知做法**（社区方案核实）：`renderer.localClippingEnabled = true` + 官方 `webgl_clipping_stencil` 模式（正面/背面双 stencil 组 + 盖板）；**坑**：EffectComposer 默认 RenderTarget `stencilBuffer:false` 会静默失效，必须自建 `new WebGLRenderTarget(w,h,{stencilBuffer:true})` 传给 EffectComposer，并注意 OutlinePass 顺序。
- **测量参考实现**：three-mesh-bvh `computeBoundsTree()` + `acceleratedRaycast` 加速取点；成熟开源参考为 ThatOpen/web-ifc-viewer 的 MeasurePlugin（MPL-2.0）与 bernhard-42/three-cad-viewer（MIT）。

---

## 第四部分 · 开源项目研究报告

| 项目 | 真实性 | 许可证 | 技术栈 | 可借鉴点 | 结论 |
|---|---|---|---|---|---|
| **Smithsonian dpo-voyager**（github.com/Smithsonian/dpo-voyager） | ✅ 官方开源（207★） | Apache-2.0 | 前端查看器 + Story 标注/导览 | **标注/导览的数据结构与嵌入组件设计**——直接对标本项目 tour 体系 | 借鉴数据结构 |
| **Smithsonian Open Access**（si.edu/openaccess · 3d.si.edu/cc0 · api.si.edu） | ✅ | CC0（420 万+ 藏品，含 3D 扫描） | 官方 API（需免费 key） | **模型来源渠道**（CC0 可公开再分发）+ 博物馆策展叙事参考 | 内容渠道 |
| **The Museum of All Things**（github.com/m4ym4y/museum-of-all-things） | ✅（579★） | MIT | **Godot**（非 three.js），Wikipedia 无限博物馆 | 展陈分区/导览动线的**思路** | 思路借鉴，代码不可用 |
| **Vestige**（Luma AI 3D 博物馆） | 站点存在 | ❌ 未开源 | Luma web 库 | 仅视觉参考 | 不用 |
| **PRISM Interactive Product Configurator** | ❌ **多渠道检索不存在**，判定为任务书中的虚构候选 | — | — | — | 剔除 |
| 产品配置器（GitHub 高星检索） | 存在但质量普遍低：threejs-3d-room-designer（463★，无 LICENSE）、iosorin/cup-demo（89★，Nuxt+Three，无 LICENSE 仅构建产物） | ❌ 无许可证 | — | 只参考交互模式 | **不可复用代码** |
| 拆解/爆炸视图类 | 无成熟项目；仅 1-3★ 无许可证 demo（如 dji-air-3s 爆炸 demo） | ❌ | — | — | **本实现自研领先，无外部代码可搬** |
| ThatOpen/web-ifc-viewer | ✅ | MPL-2.0 | three.js + BIM | MeasurePlugin 测量交互（距离/角度） | 交互参考 |
| bernhard-42/three-cad-viewer | ✅（397★） | MIT | three.js | 拾取过滤/剖切/爆炸的交互架构 | 交互参考 |
| Mayo / Open 3D Viewer / STPViewer | ✅ 但均为**桌面软件**（C++/Qt 或 Windows 商业） | — | — | 与 Web/JS 无关 | 排除 |

**Awwwards/Behance/Dribbble 类视觉参考**：不直接搬实现，归纳进 `docs/3D_EXPERIENCE_GUIDELINES.md` 的取景/灯光/构图规则（冷光主调 + 每设备强调色 + 编辑部式排版已在项目内形成自有语言）。

---

## 第五部分 · 产品功能设计

### 5.1 信息架构：不新增顶层域，双层演进

任务书提出的 EXHIBITION / DISASSEMBLY / KNOWLEDGE / HISTORY / LAB / DISCOVERY 六域**不全部独立建站**。判断：

- EXHIBITION = 现有 GalleryHub（已达标）；DISASSEMBLY = 现有 DeviceViewer（已达标）。
- **KNOWLEDGE 与 HISTORY 合并为"知识层"**，第一落点是**设备页内**（部件详情卡扩展"原理/技术/历史"区块），第二落点才是独立 `/graph`（知识星图）与 `/timeline`（科技时间轴）路由——先有数据，再有页面。
- **LAB 不建独立页面**：测量/剖切/装配顺序作为 DeviceViewer 工具栏新能力；原理演示挂进部件详情卡的"运行演示"区块。
- **DISCOVERY 以轻量浮层实现**：收藏/进度徽章不入主流程，避免游戏化干扰策展严肃性。

理由：架构约束"新增能力只增不破坏"+ 移动端画布不能被面板挤占 + 内容生产是瓶颈（先保证全馆设备的档案数据，再谈新页面）。

### 5.2 设备数字档案（一切知识功能的地基）

在现有 device.js 上**增量扩展**（不破坏现有字段）：

```js
// 现有字段不动，新增：
era: 1982,                    // 发布年（官方可查才填，未知 null）
series: 'iPhone',             // 产品系列（可缺省）
successors: ['iphone-17'],    // 迭代指向其他设备 id
predecessors: ['iphone-13'],
technologies: ['cmos-sensor','lipoly-battery','wifi-6'],  // → 技术库 id
sources: {                    // 资料来源（官方/可靠第三方/社区）
  official: ['https://www.dji.com/...'],
  teardown: ['https://www.ifixit.com/...'],   // 拆解参考
  museum: []
},
credibility: { structure: 'official', specs: 'official', history: 'verified-3rd' }
// credibility 枚举：official | verified-3rd | community | inferred | unknown —— 每个 UI 呈现都带此标注
```

配套工具：`tools/lint-knowledge.mjs`（technologies id 引用校验、credibility 枚举校验、未知字段禁止空字符串）。

### 5.3 技术故事与科技历史

- **technology 库**（`src/knowledge/technologies/*.js`）：每项技术含 principle（原理）、relatedParts[]、relatedDevices[]、invented（发明年）、history[]（关键节点）、sources[]（必须 ≥1 条官方或权威来源，否则 confidence: 'inferred'）。
- **brand 库**（`src/knowledge/brands/*.js`）：创立、阶段、代表产品（指回设备 id）、关键技术突破。
- **时间轴**：不手工维护，`tools/gen-timeline.mjs` 从 device.era + technology.invented 自动汇总生成，避免手抄全馆数据。
- 呈现：部件详情卡新增"原理"折叠区（首次只做 20 项高频技术：CMOS、OIS、无刷电机、三轴云台、锂聚合物电池、D-Log、热风道、擒纵机构……），未覆盖的技术显示"待编写"，**禁止 AI 编造**。

### 5.4 知识图谱（数字星图）

- 数据：`tools/gen-knowledge-graph.mjs` 从 registry + devices + technologies + brands **构建时自动生成** `knowledge-graph.json`（nodes: brand/device/part-class/technology；links: produces/belongs-to/uses/invented/relates-to）。手写数据为零。
- 渲染：双模式——3D 用 3d-force-graph（three 场景一致性最好，节点 Object3D 可定制）；2D 用 sigma.js（移动端更省电、可读性更高）。两模式共享同一 JSON。
- 交互：节点搜索、分类过滤、关系高亮（一度邻居高亮/其余降透明）、点击品牌/设备跳深链（现有 hash 路由直达）、点击技术跳技术详情浮层。
- 性能：节点数预期 <2000，3d-force-graph 无压力；移动端默认 2D。

### 5.5 交互实验室（DeviceViewer 增量能力）

| 能力 | 实现路线 | 声明分级 |
|---|---|---|
| 两点测量 | three-mesh-bvh 加速取点 + 线体/数值标签；区分**模型原始尺寸**（GLB 反归一化回 mm）与展示尺寸 | 数据近似 |
| 剖切封盖 | 官方 stencil 模式 + 自建 `WebGLRenderTarget({stencilBuffer:true})`；失败自动回退现有 DoubleSide 方案 | 渲染效果 |
| 装配顺序 | parts[] 增 `assembleStep`（数字），"按步骤装配"模式逐步复位并高亮当前步 | 策展数据 |
| 工作原理演示 | builders 内加程序动画（云台三轴、齿轮啮合、风扇转速、指针摆动）；`tick()` 已有基建 | **视觉原理演示**（明确标注，非仿真） |

### 5.6 代际对比

- 数据规范：同 series 设备才可对比；对比维度从 parts[] 自动聚类（电池容量、传感器尺寸、屏幕尺寸等 specs 同名键）；结构对比用"同色部件类"（partClass 字段）左右分屏双模型同步旋转。
- 第一批试点：iPhone 12→13→16→17→Air（5 台官方模型齐全）、Galaxy S25 系列 3 台、DJI Action 4→5 Pro。

### 5.7 沉浸式导览（现有 tour 体系扩展）

- 三种模式挂在现有 tour 管线：快速认识（约 30s，3-4 步：外观→定位→核心特色）/ 结构导览（现有默认）/ 技术深导览（结构导览步上叠加原理讲解段）。
- 数据结构从 `tour: ['a','b']` 升级为对象数组 `{ part, dur, text, demo? }`，**兼容旧格式**（字符串视为一步默认时长）。
- 语音讲解：Web Speech API（本地 TTS，零依赖、零音源许可问题）可选项，默认关闭；不做云端 TTS。

### 5.8 空间音频

- 三类音效：环境底噪（展馆氛围，极低音量）、交互反馈（拆解咔哒、选中提示）、部件运行声（发动机/齿轮，挂 PositionalAudio）。
- 约束：默认全局静音（用户首次显式开启后记忆）；移动端不自动播放；全部音源 CC0（freesound CC0 / 自制合成）；总量 <300KB；`prefers-reduced-motion` 时同时降低动效音。

### 5.9 探索任务与收藏

- localStorage（key 前缀 `dtm.`）：`dtm.favs`（设备收藏）、`dtm.seen`（已探索设备+首次时间）、`dtm.badges`（成就：如"拆解 10 台""读完 5 项原理""集齐 Apple 系列"）。
- 任务示例"认识一台无人机"：查看外观→找到云台→拆解→看电机→读原理→完成——由 tour + 技术面板埋点判定，不打分不排行。
- 成就入口放大厅角落，不给弹窗打断。

---

## 第六部分 · 项目专属设计规范

已落成五份文档（摘要如下，全文见各文件）：

| 文档 | 内容 |
|---|---|
| `docs/DESIGN_SYSTEM.md` | Design Tokens 实测汇编（色彩/字体/间距/圆角/玻璃三级/动效 token）、新组件准入规则、禁止事项 |
| `docs/DESIGN_SKILLS.md` | AI Skill 组合的使用时机与提问模板；官方 vs 社区声明 |
| `docs/DESIGN_QA.md` | 每轮 UI 改动的验收清单（桌面 1440×900 / 移动 390×844、对照 HIG 原则摘录、impeccable audit 流程、smoke 断言对照） |
| `docs/MOTION_GUIDELINES.md` | 动效 token（--dur-1/2/3、--ease-out/spring）、GSAP 与 3D 缓动的职责边界、reduced-motion 规则、禁用模式 |
| `docs/3D_EXPERIENCE_GUIDELINES.md` | 取景/地面接触/材质分级/爆炸方向/标签防遮挡/剖切/画质降级阶梯/新设备质量门槛 |

---

## 第七部分 · 数据架构

### 7.1 原则

1. 本地静态（JS 模块或 JSON），构建期生成、lint 期校验，**零后端零外部 API**。
2. 现有 device.js 字段**只增不改语义**；新数据与旧数据允许部分缺失（lint 只警告不阻断已发布内容）。
3. 一切汇总（inventory/timeline/graph）由脚本生成，禁止手抄数字（延续 gen:inventory 铁律）。

### 7.2 Schema（TypeScript 风格伪码，实存为 JSDoc 注释 + lint 校验）

```ts
// Device（增量字段，详见 §5.2）
interface DeviceExt {
  era?: number | null; series?: string;
  predecessors?: string[]; successors?: string[];      // 引用设备 id，lint 校验存在性
  technologies?: string[];                             // 引用 technology id
  sources?: { official?: string[]; teardown?: string[]; museum?: string[] };
  credibility?: { structure?: Level; specs?: Level; history?: Level };
  parts?: Array<Part & { partClass?: string; assembleStep?: number; technology?: string[] }>;
}
type Level = 'official' | 'verified-3rd' | 'community' | 'inferred' | 'unknown';

// Technology（src/knowledge/technologies/<id>.js）
interface Technology {
  id: string; zh: string; en: string;
  category: 'sensor'|'actuator'|'power'|'optics'|'structure'|'connectivity'|'compute'|'process';
  principle: string;            // ≤200 字原理
  relatedParts?: string[];      // partClass 引用
  relatedDevices?: string[];    // 设备 id
  invented?: { year: number; who: string } | null;
  history?: Array<{ year: number; text: string; source?: string }>;
  sources: string[];            // ≥1，否则 confidence 必须为 inferred
  confidence: Level;
}

// Brand（src/knowledge/brands/<key>.js）
interface Brand { key: string; zh: string; en: string; founded?: number;
  hq?: string; story?: string; milestones?: Array<{ year: number; text: string; device?: string }>;
  sources: string[]; confidence: Level; }

// Knowledge Graph（构建期生成 knowledge-graph.json，勿手写）
interface KG { nodes: Array<{ id: string; type: 'brand'|'device'|'part'|'technology'; label: string; meta?: object }>;
  links: Array<{ source: string; target: string; rel: 'produces'|'belongs'|'uses'|'invented'|'relates' }>; }

// Tour（扩展，兼容旧字符串格式）
type TourStep = string | { part: string; dur?: number; text?: string; demo?: string };

// Achievement / Progress（localStorage，前缀 dtm.）
interface Badges { [badgeId: string]: { at: number } }   // 例：first-teardown, tech-5, brand-apple
```

### 7.3 新增工具与校验

- `npm run lint:knowledge`：technologies/brands 的 id 引用、sources 非空、confidence 枚举、device.technologies 反向引用。
- `npm run gen:timeline` / `npm run gen:graph`：汇总生成，diff 检查。
- 生成物进 `public/data/`（graph JSON）与 `src/knowledge/_generated/`（timeline），与 gen:inventory 同规范（勿手改）。

---

## 第八部分 · 长期版本路线图（8 阶段）

> 排序依据 AGENTS §3 优先级评分。每阶段可独立构建、独立回滚；验收命令强制执行。

### Phase 1 · 规范落地与基线（1 个切片，≈当天）
- **目标**：设计规范五文档生效；DESIGN_QA 纳入每轮验收。
- **改动**：docs/ 五文档；无代码。
- **验收**：文档与实际 token/能力一致（对照 style.css 逐项核对）；无构建影响。

### Phase 2 · 拆解深化：测量 + 剖切封盖 + 装配顺序
- **目标**：补齐 S4 三大实验能力。
- **选型**：three-mesh-bvh（MIT）；stencil 封盖（自建 RenderTarget）；assembleStep 策展字段。
- **改动**：engine.js（测量工具态）、view-modes.js（clip 封盖分支）、DeviceViewer.vue（工具栏+标尺浮层）、2-3 台试点设备配置。
- **验收**：`npm run build` + smoke 全绿 + 无头 Chrome 测量取点/封盖截图/逐步装配断言；移动端工具栏不遮画布（390×844）。
- **性能**：three-mesh-bvh 构建耗时应 <100ms/设备（超时降级普通 raycast）；帧率不低于基线。

### Phase 3 · 数字档案与技术故事（S1、S2 核心）
- **目标**：全馆设备接入 era/series/sources/credibility；20 项高频技术原理上线。
- **改动**：src/knowledge/（technologies/brands）、tools/lint-knowledge.mjs、DeviceViewer 详情卡"原理/历史"区块、`npm run lint:devices` 联动。
- **进度**：基础设施已落地（2026-10-31）——schema + lint-knowledge（principle 非空必须带 sources）+ 详情卡「原理」区；10 项全量词条（CMOS/锂聚合物/扬声器/三轴云台/擒纵/超外差/镜头光学/OLED/无线充电/线性马达，来源均经 Web 实证）+ 10 项占位登记（UI 显示"原理编写中"）。
- **验收**：lint 全绿；详情卡 UI 桌面+移动截图；**所有原理文本有 sources，未编写项显示"待编写"**（诚实降级）。
- **回归**：现有 parts 详情卡不回归（文案字段兼容）。

### Phase 4 · 知识星图与代际对比（S3）
- **选型**：3d-force-graph（3D）+ sigma.js（2D）。
- **改动**：tools/gen-knowledge-graph.mjs、/graph 路由（大厅入口）、对比面板（试点 iPhone/S25/Action 三组）。
- **验收**：graph JSON 由脚本生成 diff 审查；图谱点击→深链可达；对比页双模型同步旋转（桌面 1440×900 + 移动）。
- **性能**：图谱页不加载 three 引擎主 chunk（复用或按需拆分）；节点 <2000 时交互 ≥50fps（实测记录，不空口声称）。

### Phase 5 · 原理演示实验集
- **目标**：≥10 个部件级程序演示（云台三轴、齿轮啮合、擒纵、气流、电流路径…），挂详情卡。
- **改动**：_kit/demos.js + 各设备 builders 扩展；`prefers-reduced-motion` 降级为静帧+说明。
- **验收**：每演示标注"视觉原理演示"；帧率与 adaptive 画质联动（L0 关演示）。

### Phase 6 · 导览扩展与空间音频
- **改动**：tour 对象格式 + 三模式；AudioManager（默认静音/音量记忆/移动端策略）；CC0 音源采购与署名。
- **验收**：Web Speech TTS 可选开关；音源许可表入 docs；smoke 增导览断言。

### Phase 7 · 探索系统
- **改动**：localStorage 进度、成就浮层、大厅完成度统计；`dtm.*` key 规范。
- **验收**：清空存储后从零可复现；无弹窗打断主流程。

### Phase 8 · 前沿探索（实验性，均不承诺发布）
- WebGPU/TSL：待 three 升级到稳定节点体系后做 1 台设备的双渲染器 A/B。
- WebXR：three 自带 WebXR 支持，评估"展厅模式"（Vision Pro Safari 支持 WebXR 的现状需届时核实）。
- 3DGS：仅当引入真实扫描展品（博物馆文物）时评估 Spark（GaussianSplats3D 已停更）。
- 出口条件：任何一项进入主线必须通过 Phase 2 的全部性能验收口径。

### 阶段依赖关系

```
P1 ─→ P2 ─→ P5（工具态复用）
 └──→ P3 ─→ P4（图谱需要档案数据）─→ P7（徽章引用技术阅读进度）
      P3 ─→ P6（导览讲解引用原理文本）
P8 独立支线
```

---

## 附 A · 未验证 / 待验证清单（诚实声明）

1. "Three.js Skill"独立仓库：未完成核实（搜索超时）。
2. headlessui Vue 版维护细节：未逐项核实，仅低优先级排除。
3. emilkowalski/skills 各 skill 的具体平台覆盖（部分 React 导向为 README 口径推断）。
4. 搜索类并发限制导致 2 个后台调研子代理被杀——本报告相应主题已由主会话串行补齐（已覆盖）。
5. 真机 iOS Safari / Android Chrome 回归：环境缺失，沿用 BACKLOG 已登记项。
6. pmndrs/postprocessing 6.36.x 对 0.164 的 peer 区间来自 npm manifest 引用，未实测运行。

## 附 B · 来源索引（本报告全部外链）

- https://github.com/dickwu/apple-design-skill · https://github.com/anthropics/skills（含 /tree/main/skills）· https://github.com/pbakaus/impeccable · https://github.com/emilkowalski/skills · https://github.com/vercel-labs/agent-skills · https://github.com/Delanyo32/ux-skill · https://github.com/GuidanceStudio/uxui-audit-skill
- https://developer.apple.com/design/human-interface-guidelines · …/materials · https://developer.apple.com/documentation/technologyoverviews/liquid-glass · https://developer.apple.com/videos/play/wwdc2025/219
- https://github.com/gkjohnson/three-mesh-bvh · https://github.com/pmndrs/postprocessing · https://registry.npmjs.org/postprocessing/6.36.4 · https://github.com/gkjohnson/three-gpu-pathtracer · https://github.com/mrdoob/three.js/releases/tag/r164 · https://github.com/mkkellogg/GaussianSplats3D
- https://github.com/unovue/shadcn-vue · https://github.com/unovue/reka-ui · https://motion.dev · https://github.com/juliangarnier/anime · https://github.com/darkroomengineering/lenis · https://github.com/theatre-js/theatre · https://github.com/goldfire/howler.js · https://github.com/dimforge/rapier · https://rive.app/docs/runtimes/getting-started
- https://github.com/vasturiano/3d-force-graph · https://github.com/jacomyal/sigma.js
- https://github.com/Smithsonian/dpo-voyager · https://www.si.edu/openaccess · https://3d.si.edu/cc0 · https://api.si.edu/openaccess/api/v1/ · https://github.com/m4ym4y/museum-of-all-things · https://github.com/ThatOpen/web-ifc-viewer · https://github.com/bernhard-42/three-cad-viewer
- GSAP 免费化：gsap.com（3.13 起，Webflow 收购后）及 2025-2026 社区报道
