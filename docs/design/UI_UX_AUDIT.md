# UI_UX_AUDIT · DIGITAL TECH MUSEUM 全站 UI/UX 审计

> 阶段 A 交付物（2026-10-31）。依据 `docs/design/UI_UX_REFACTOR_SPEC.md` 执行。
> 审计人：ZCode Agent。基线：commit `303922b`（main）。

## 0. 使用的 UI Skill（已实际读取完整说明）

| Skill | 路径 | 在本次审计/重构中的角色 |
| --- | --- | --- |
| `frontend-design`（Anthropic 官方，Apache-2.0） | `.zcode/skills/frontend-design/SKILL.md` | 品味基线：反 AI 模板清单、token 化、克制与自我批判；本审计 §P 系列问题多以其「默认 SaaS 卡片/眉题滥用」对照项排查 |
| `impeccable`（pbakaus，Apache-2.0，v4.8.0 已装） | `.zcode/skills/impeccable/SKILL.md` + `impeccable context` 已运行 | 审查主力：`context` 输出 NO_PRODUCT_MD/SCOPED_EXISTING_ALLOWED（既有实现即权威，允许细化重构）；改版完成后运行 `impeccable detect`（MANUAL_DETECTOR_REQUIRED） |
| `frontend-skill`（工作区本地） | `/Users/admin/.zcode/skills/frontend-skill/SKILL.md` | 构图/信息层级基线：无卡片默认、每屏一个主导想法、app UI 的 Linear 式克制、utility copy 口径 |

冲突处理：三份 Skill 无硬冲突；frontend-design 的「避免 ALL-CAPS 眉题滥用」与本项目 DESIGN_SYSTEM 的 mono eyebrow 体例存在张力 —— 裁决：本项目为 HUD 科技档案馆定位，eyebrow 是其信息体例的一部分，**保留但收紧使用密度**（不做双重眉题堆叠），在 UI_GUIDELINES 中写明使用边界。

项目既有规范（审计同时以其为标准）：`docs/DESIGN_SYSTEM.md`、`docs/DESIGN_QA.md`、`docs/MOTION_GUIDELINES.md`、`docs/3D_EXPERIENCE_GUIDELINES.md`、`docs/DESIGN_SKILLS.md`。

## 1. 审计范围与方法

- **页面**：大厅 `/`（桌面 1440×900、笔电 1280×720、移动 390×844）、工作空间 `/device/:id`（桌面/移动、整机/爆炸/选中部件/总览弹层/帮助卡）、知识星图 `/graph`、技术编年 `/timeline`、代际对比 `/compare/:group`（桌面/移动）。
- **方法**：源码走查（App.vue/main.js/style.css 814 行/hud.css 127 行/GalleryHub 292 行/DeviceViewer 793 行/GraphView/TimelineView/CompareView）× 真实浏览器截图取证（puppeteer-core + `--enable-unsafe-swiftshader`，17 张，存 `docs/design/screenshots/`）× console 全程零报错确认。
- **功能基线**：`npm run build` ✓（2.76s，three chunk 771.48KB）；功能回归随后续阶段复跑 `npm run smoke`。

## 2. 当前 UI 结构（事实）

- 路由：`/` GalleryHub（大厅档案索引）→ `/device/:id` DeviceViewer（3D 工作空间：顶栏+左 rail+底部 dock+右详情卡+总览弹层+引导卡）→ `/compare/:group`、`/graph`（Canvas 2D 力导向）、`/timeline`（四段时代分带）。
- 设计体系：深空冷底（#030509/#04070c）+ 全站单一强调色 `--acc`（每设备 accent 换肤）+ 三级玻璃拟态 + mono eyebrow 体例。既有 token 相当完整（颜色/玻璃/动效/字号），主要缺口在**令牌外硬编码值**与**移动端信息架构**。

## 3. 问题清单（P0=阻断体验，P1=显著损伤，P2=打磨）

### P0-1 移动端竖屏 3D 取景裁切主体
- 证据：`workspace-mobile.png`、`workspace-mobile-exploded.png`（390×844）：Action 4 机身左右两侧均被画布裁掉，看不到完整设备；违反 `3D_EXPERIENCE_GUIDELINES.md` §1「相机取景不裁切主体」。
- 定位：引擎取景按 targetWidth 归一化，未按竖屏宽高比放宽相机距离（`src/engine/engine.js` 取景逻辑）。
- 方案：取景距离加入 aspect 修正（portrait 时按视口短边/长边比放大距离或收窄 FOV 覆盖），只动默认取景与 resetView，不动交互控制； explodes 后同样复检。需 smoke + 双端截图回归。
- 风险：中（3D 侧改动，需隔离验证；不得影响桌面取景）。

### P0-2 移动端大厅吸顶筛选器占满整屏，网格不可达
- 证据：`lobby-mobile-grid.png`：滚动后 390×844 全屏被「快捷/品牌（38 chips）/类型（37 chips）/搜索」占据，sticky 背景+blur 使设备网格完全不可见。
- 定位：`src/style.css` `.hub-filter{ position:sticky }` 未做小屏收合；`.filter-row` 全量平铺。
- 方案：≤860px 筛选器默认收合为一行「筛选」入口（展示激活条件数与清除），品牌/类型收进可展开面板；搜索独立成行置顶；桌面保持现状。

### P0-3 移动端大厅顶栏折行破碎
- 证据：`lobby-mobile.png`：`.hub-eyebrow` "MULTI-BRAND · TEARDOWN GALLERY" 断成 4 行且圆点孤行；右侧 meta 两栏挤压。`style.css:43-56` 无小屏处理。
- 方案：≤860px 顶栏改为单列纵向布局：eyebrow 一行（缩小字距/隐藏英文副标），meta 链接换行到下方独立行；或隐藏 eyebrow 英文只留中文入口。

### P1-1 移动端部件详情 sheet 被 dock 遮挡
- 证据：`ctxcard-mobile.png`：底部 sheet 内容（规格行）与 dock（z-index 6）重叠，文字被按钮压住；sheet `padding-bottom:18px` 小于 dock 高度。
- 定位：`style.css:761-774`（≤700px #ctxCard）与 `#dock{bottom:10px}` 层级冲突。
- 方案：sheet 展开时内容区底部预留 `calc(dock 高度 + 安全边距)`；或 sheet 打开时 dock 下沉淡出。取「预留 padding + 渐变遮罩」最小改动。

### P1-2 大厅筛选区信息架构失衡（桌面）
- 证据：`lobby-desktop-top.png` / `lobby-desktop-grid.png`：「快捷 ★收藏(0)」孤行+大空隙；品牌 38 枚 + 类型 37 枚 mono chip 墙视觉噪音大；搜索框独占右侧与 chips 断联；视图切换按钮 32px 弱 affordance。frontend-skill「chip soup」典型症。
- 方案：重构 `.filter-row` 为「搜索为主输入（第一行，占主宽）→ 类型为主轴 chip 行 → 品牌折叠为次级行（默认显示前 N+『更多』）」；收藏并入类型行首；行高统一。

### P1-3 Hero 焦点展台氛围偏弱
- 证据：`lobby-desktop-top.png`：焦点展台截图整体偏暗（thumb 缩略图本身暗 + `.st-shade` 底部 82% 遮罩叠加），招牌设备像剪影；「开始拆解 →」描边按钮对比弱。展台是首屏记忆点，应更亮更有舞台感。
- 方案：`.st-img` 提亮（filter brightness/saturate 校正）+ 减轻 shade 顶部；CTA 改为 primary 发光样式；轮播指示点与 FOCUS 标注保留。

### P1-4 键盘焦点态缺失面广
- 走查：`.hud-icon`、`.chip`、`.hud-chip`、`.card`、`.gb-chip`、`.prow`、`.tb-back` 均无 `:focus-visible` 样式（仅 .fav-star/.p-label/.step-btn/.rdot 有）。深色底上 UA 默认 ring 几乎不可见；DESIGN_QA §2 要求四态完备。
- 方案：hud.css 增加 token 化 `:focus-visible`（2px `--acc` outline + offset），一次覆盖全站按钮/chip/卡片类。

### P1-5 统计条与文案的「工程味」
- 证据：`lobby-desktop-top.png`：`WEBGL 实时渲染` 混入馆藏统计（WEBGL 是技术词非馆藏事实）；`我的探索 · ★0 足迹0 ↗` 空状态仍显示 0 计数，读感差；hub-foot `© 2026 TEARDOWN LAB` 与顶部 VOL.04 重复系列感。utility copy 口径（frontend-skill）：状态数字应可扫读、无功能数字不展示。
- 方案：统计条 5 项（设备/部件/官方/社区/品牌）；WEBGL 改为 eyebrow 行的「实时 3D · WEBGL」标注或页脚；我的探索在 0 值时只显示「我的探索」。

### P1-6 帮助卡（QUICK GUIDE）文案与响应式
- 证据：`guide-desktop.png`：「自动导览（一键装杯）」黑话（装杯）；「拖拽 / 滚轮」键帽折行「右键平 移」断词；`.g-cols` 固定两列无小屏断点（390px 下键帽 86px + 文本挤压不可读，`style.css:656-664`）。
- 方案：文案去黑话（「自动导览（逐部件讲解）」）；≤700px 单列；键帽 `white-space:nowrap` + 文本允许换行。

### P2-1 dock 工具项无差别同权
- 证据：`workspace-desktop.png`：底部 dock 12 个动作全部同尺寸同色；「拆解」主按钮有 primary 态但视图四模式/测量/装配/导览/沉浸/帮助权重一致，高频（视图模式）与低频（帮助）不分。
- 方案：保持图标语言（移动端空间所限），但把「整机/X光/隔离/剖切」做成视觉上的一组（已有 sep 分组，强化为 label 微标「视图」），帮助/切台弱化为低饱和；不改 DOM 结构只调样式与间距层级。

### P2-2 拆解滑杆 0 态不可辨识
- 证据：`workspace-desktop.png`：装配态滑杆位于 0，轨道 2px 高、thumb 12px 贴边，看不出可拖。爆炸态（`workspace-exploded.png`）可读。
- 方案：轨道加最低可见度（刻度点/起止端点标记），thumb 加 hover/active 放大；不改交互。

### P2-3 顶栏 tooltip 顶部裁切
- 证据：`infopop-desktop.png`：顶栏 ⓘ 按钮 tooltip 弹到面板上方，贴近视口顶被裁。hud.css `.hud-icon .tip{ bottom:calc(100%+9px) }` 对顶栏场景应向下弹。
- 方案：顶栏内 tooltip 用 `.tip-below` 变体向下弹出。

### P2-4 卡片 hover 效果堆叠
- 走查：`.card` hover 同时有 translateY(-4px)+边框变色+背景渐变+右上角径向光斑(::after)+标题变强调色+索引变亮+箭头浮现 —— 7 处同时变化（frontend-design「remove one accessory」）。
- 方案：保留抬升+边框+箭头浮现，去掉径向光斑 ::after 与标题变色（hover 焦点集中在层级），降低装饰密度。

### P2-5 图/编年/对比页边角
- `/timeline`：标题「64 台馆藏」未带总数（103），首次读会误以为全量；top-right 注释有解释但层级弱。改为「64 / 103 台馆藏」。
- `/graph`：品牌标签偶发重叠（`LAIMERSANTA CRUZ`）、`"WALTHER` 出现引号前缀（label 数据含引号）；无搜索定位。低优先，标注 backlog。
- `/compare` 移动端横向滚动可用，sticky 左列正常；无明显问题。

### P2-6 toast 与 clipStrip 同位重叠
- 走查：`#toast` 与 `#clipStrip` 同为 `bottom:86px`（≤700px 同 66px），测量提示 toast 与剖切条可同时出现互相压盖。方案：toast 有 strip 时上移一档（复用 has-sheet 机制）。

### P2-7 眉题（eyebrow）体例密度
- 走查：同一视图内 eyebrow 可达 2-3 处（详情卡 PART 08/14 + 原理·xxx + 总览 OVERVIEW），与 frontend-design「避免每个标题上方挂 eyebrow」冲突但属 HUD 体例。裁决：保留，规则写入 UI_GUIDELINES（一层信息一个 eyebrow，禁止 eyebrow 套 eyebrow）。

## 4. 不应被破坏的现有能力（重构红线）

1. 引擎能力：模型加载/分段进度、Raycaster 拾取、爆炸/装配（滑杆+长按布局切换）、X-Ray/Isolate/Clip、测量、逐步装配、Tour+TTS、截图、沉浸模式、自适应画质、reduced-motion 降级、深链 `?e/p/t`、错误面板。
2. 大厅：TransitionGroup FLIP 筛选动画、卡片 hover GLB 预热、收藏/足迹/徽章（localStorage）、最近浏览、Hero 轮播（hover 暂停）。
3. 数据口径：设备/部件/品牌数量必须来自 `virtual:device-manifest`（103 台/815 部件/38 品牌，实测生成值），不得手写。
4. 性能红线：大厅不加载 three chunk；G1~G3 三级玻璃配方不新增；移动端由 CSS 断点而非 JS UA 探测。
5. 合规署名：`modelCredit`/`modelSource`/NC 徽标/「来源待核实」标照旧展示。

## 5. 优先级汇总与重构顺序

| 级别 | 编号 | 归属阶段 |
| --- | --- | --- |
| P0 | 1 竖屏取景 | E（3D 工作空间，引擎取景修正） |
| P0 | 2 移动筛选占屏 | G（移动端专项，与 D 联动） |
| P0 | 3 移动顶栏折行 | D（大厅重构随做） |
| P1 | 1 sheet 遮挡 | G |
| P1 | 2 筛选失衡 | D |
| P1 | 3 展台氛围 | D |
| P1 | 4 焦点态 | C（全局 token 层一次覆盖） |
| P1 | 5 统计/文案 | D |
| P1 | 6 帮助卡 | F |
| P2 | 1-7 | E/F/G 随阶段清 |

## 6. 截图索引

`docs/design/screenshots/`：lobby-{desktop-top,desktop-grid,laptop,mobile,mobile-grid}、workspace-{desktop,exploded,mobile,mobile-exploded}、ctxcard-{desktop,mobile}、infopop-desktop、guide-desktop、graph-desktop、timeline-desktop、compare-{desktop,mobile}。取证脚本：`tools/ui-audit-shots.mjs`、`tools/ui-audit-shots2.mjs`（只读，不写源码）。
