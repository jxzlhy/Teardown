# 格物馆 · 优化路线图（PROJECT_ROADMAP）

> 编制：2026-11-02 全维度审计 ｜ 依据：`PROJECT_ISSUES.md` 的问题编号 ｜ 约束：AGENTS.md §4 技术约束（不换框架、不引 UI 库、不写死后端、数量以生成物为准）
> 原则：每个 Phase 都是**可独立交付、可独立回滚、可独立验证**的垂直切片；完成即更新 `PROJECT_OPTIMIZATION_LOG.md` 与 `AUTONOMOUS_LOG.md`。

## 总览

> **执行进度（2026-11-02 同日更新）**：Phase 0 **全部完成并验证**（0-A/0-B/0-C/0-D）；Phase 1 完成 1-A/1-B（1-C/1-D 与人工许可复核待办）；Phase 2 完成 2-A/2-B/2-D（2-C 首屏发现路径待产品裁定）；Phase 3–7 未开始。逐项证据见 `PROJECT_OPTIMIZATION_LOG.md` 第 1–6 轮。

| Phase | 主题 | 包含问题 | 预估 | 准入门槛 | 出口 | 状态 |
|---|---|---|---|---|---|---|
| **0** | 止血：不崩、不卡、不丢人 | P0-1 P0-2 P1-1 P1-2 | 1.5–2 天 | 无 | 14 台重展品显存降档 + BVH 全拾取覆盖 + 0 占位展品 + 全站数字一致 | ✅ **完成** |
| **1** | 发布就绪：许可与合规 | P1-8 P2-11 P3-14 | 1–2 天（+人工复核） | Phase 0 | 一条命令产出"可公开发布的 dist" | 🟡 1-A/1-B 完成 |
| **2** | 日厅可用 + 发现路径 | P1-3 P1-4 P1-9 | 2–3 天 | Phase 0 | 日厅 0 处 AA 不达标 + 首屏可搜索 | 🟡 2-A/2-B/2-D 完成，2-C 待定 |
| **3** | 生命周期与内存 | P1-5 P1-6 P2-16 P2-1 P2-2 | 2 天 | Phase 0 | 30 分钟 soak 内存曲线平稳 + 映射差集可见 | ⬜ |
| **4** | 设计系统收敛 | P2-8 P2-9 P2-7 P2-10 | 4–6 天 | Phase 2 | 令牌三层 + 组件归一 + 对比度/触控进 CI | ⬜（触控项已随 2-D 提前完成） |
| **5** | 结构与可维护性 | P2-15 P2-4 P2-14 REPO-01/02 | 4–5 天 | Phase 3 | engine.js <800 行 + 文档零漂移 + 提交纪律 | ⬜ |
| **6** | 内容深度（差异化） | P2-13 I-01 I-05 | 持续滚动 | Phase 1 | mech 3→40 台、realSizeMM 1→40 台 | ⬜ |
| **7** | 留存与传播 | I-02 I-03 I-04 I-06 | 按需 | Phase 1 | 离线可用 / 可打印档案 / AR 试点 / 1 个 Story | ⬜ |

---

## Phase 0 · 止血（最高优先，全部可验证）

### 切片 0-A：BVH 回补主拾取路径（P0-2）
- **目标**：任何展品上"悬停 + 点击"都不产生 >50ms 的帧。
- **方案**：装载完成（`finalize` 前）在空闲帧增量 `computeBoundsTree()`，全局 `raycaster.firstHitOnly = true`；构建耗时 >120ms/台时保持现状并 `console.info` 记录降级。
- **涉及**：`src/engine/engine.js`（`ensureBVH` 提为 `buildBVHIncremental`，在 `finalize` 调用；移除对 `setMeasure` 的独占）
- **验收**：① `npm run smoke` 32 项全绿；② 新增 `tools/perf-pick.mjs`：radial-engine / combustion-engine / v8-engine 三台，各 40 次 hover，p95 帧时间 **<50ms**（修复前需先取基线）；③ BVH 构建耗时写入 `AUTONOMOUS_METRICS.md`。
- **风险**：BVH 构建占主线程 → 用"空闲帧增量"而非同步全量；回滚＝一行调用注释掉。
- **成本**：低 ｜ **立即实施：是**

### 切片 0-B：纹理 2048 上限（P0-1）
- **目标**：单台估算解压显存 <250MB。
- **方案**：`tools/optimize-glb.mjs` 增 `--max-texture 2048`（gltf-transform `resize`），先试点 v6-engine / phone4apro / porsche-911-930；原件保留 `vendor/assets/originals/`；重跑 `npm run thumbs -- --only <id>` 与 `tools/inspect-glb.mjs` 复核。
- **验收**：① 三台重导后 GLB 体积不升、纹理最大边 ≤2048；② 三台设备页截图与前后对比（细节损失主观评审 + `runQA` 报告不降级）；③ 显存估算表更新进 `AUTONOMOUS_METRICS.md`。
- **风险**：细节变糊（尤其 ak-47 纹理占文件 97%）→ 逐台目视验收，必要时对该台保留 4096 但只降 `normalMap/roughnessMap`。
- **成本**：中 ｜ **立即实施：是**

### 切片 0-C：占位展品下线 + TODO 硬闸（P1-1）
- **方案**：`tools/lint-mapping.mjs` 增规则：`tagline/description/parts[].desc` 命中 `TODO` ⇒ **error**；`spitzer-space-telescope`、`chandra-x-ray-observatory` 从 `registry.js` 摘出（文件与 GLB 保留，加 `docs/audit/PENDING-EXHIBITS.md` 记录待补条件）。
- **验收**：`npm run lint:devices` 在人为塞回 TODO 时报 error；大厅统计与 `MODEL_INVENTORY.md` 同步回落；截图确认馆内无黑箱展品。
- **成本**：低 ｜ **立即实施：是**

### 切片 0-D：生成物重跑 + 一致性 lint（P1-2）
- **方案**：`npm run gen:inventory && npm run gen:graph && npm run gen:timeline`；新增 `tools/lint-consistency.mjs` 断言 registry 台数 == inventory == graph.devices == timeline.coverage.total == `index.html` description 数字；挂到 `lint:devices` 链尾。`index.html` description 改为构建期注入（`vite.config.js` `transformIndexHtml`）。
- **验收**：五个页面（大厅/星图/编年/锻造/meta）数字完全一致；故意改坏一处时 lint 报 error。
- **成本**：低 ｜ **立即实施：是**

---

## Phase 1 · 发布就绪（许可与合规）

- **1-A lint 独立判定来源**（P1-8）：`isCommunity` 不再由 credit 文本自证；改为"无 `modelSource` 的 https 域名证据 ⇒ error"，官方 AR 资产需显式 `distribution: 'local-demo-only'`。
- **1-B 可发布构建**：`npm run build -- --release` 产出排除 NC/Free Standard/GPL/未授权 AR 的 `dist-release/`，并在构建日志打印被排除清单；`PROJECT_ISSUES.md` 的 5 台为初始名单。
- **1-C 分享与索引最小集**（P2-11）：`og:image` 复用 `public/thumbs/<id>.webp`、`robots.txt`、`manifest.webmanifest`、CSP meta（实测不破坏 Draco/Cache Storage 后再合入）。
- **1-D 部署缓存头**（P3-14）：`/assets/*.glb` `Cache-Control: public,max-age=31536000,immutable`，文档写清托管侧配置。
- **验收**：`npm run build -- --release` 成功且清单可解释；分享链接在 X/微信出卡片；`npm audit --omit=dev` 仍 0。
- **人工依赖**：逐台上游许可页面复核（35 台无 credit 字段者 + 5 台风险许可），**无法自动化**，登记为持续任务。

---

## Phase 2 · 日厅可用 + 发现路径

- **2-A 日厅令牌反转**（P1-3）：在 `html[data-hall="day"]` 定义 `--txt-2/--txt-3/--txt-dim/--acc-dim` 浅底值；删除与之冲突的逐选择器 color 覆盖（先量化：当前 165 条 day 覆盖，目标 <120）。
- **2-B 对比度进 CI**：复活/重写 `tools/day-contrast-verify.mjs` 为运行时扫描（本审计的 `contrastScan` 逻辑），断言 **AA 不达标节点数 = 0**（辅助文字 ≥3:1、正文 ≥4.5:1），双厅 × 大厅/设备页四组。
- **2-C 首屏发现路径**（P1-4）：搜索/筛选主行上移到焦点展台之上；牌记区压缩到一屏；验收＝1440×900 首屏 `searchInFold === true` 且第一张卡片 `y < 900`。
- **2-D 移动端导视**（P1-9）：导视条横向滚动 + 右缘渐隐；足迹计数改徽标；双厅按钮永不移出视口（断言 `hall-link.right <= innerWidth`）。
- **验收**：三视口（1440×900 / 860 / 390×844）双厅截图对比归档 `docs/design/screenshots/audit-2026-11/`；对比度脚本 EXIT 0。

---

## Phase 3 · 生命周期与内存

- **3-A** `delete window.__ENGINE`（P1-5）+ 工具脚本适配（66 个 verify 脚本改用"进页后重取钩子"，实测其现有写法本就如此）。
- **3-B** `dispose()` 补 `scene.environment` / `pmrem` / `nightBgTex` / `thumbRT` / `controls.dispose()` / canvas pointer 监听解除 + `renderer.forceContextLoss()`（P1-6、架构 P3 项）。
- **3-C** 映射差集告警（P1-7）：`[mapping] 未接入网格 N 个` + `window.__LOAD_WARN`，smoke 增断言"0 条 mapping warn"。
- **3-D** 按需渲染（P2-1）：脏标记（相机静止 + 无爆炸/导览/演示 + 无 hover）跳帧或降 30fps；composer RT `samples:4` 且关 renderer antialias。
- **3-E** 标签层脏检查（P2-2）。
- **验收**：新增 `tools/soak.mjs`：连续进出 10 台 × 3 轮 + 大厅停留，heap 曲线**首尾差 <15%**、`renderer` 上下文不丢；静止 30s GPU 占用显著下降（Chrome 任务管理器口径）；smoke 全绿。

---

## Phase 4 · 设计系统收敛（不动架构）

- **4-A 令牌三层**：`:root` 拆 原始（`--c-slate-900`…）/ 语义（`--surface-1`、`--text-1`、`--state-warn`）/ 组件（`--hud-*`）；日厅只改语义层；补 `--z-*`、`--fs-1..9`、`--r-1..4`、`--s-1..6`。
- **4-B 字面量清零**：42 处青色 → `color-mix(in srgb,var(--acc) N%,transparent)`；72 处 hex 归入令牌；`var(--accent,…)` 拼写事故修正；死变量删除。
- **4-C 组件归一**：`.hud-chip / .hud-field / .hud-eyebrow / .tip` 单套实现，旧 class 保留一版别名（GraphView/ForgeView/DeviceViewer 逐个迁移）。
- **4-D 图标体系**：内联 SVG sprite（close/star/edit/download/copy/back/arrow/measure），替换约 28 处字符图标；字符处补 `aria-hidden`。
- **4-E 交互态**：全局 `:focus-visible` 基线（修 CompareView 杀焦点环）、`:active` 按压反馈、disabled 统一样式、`aria-live` toast 区。
- **4-F 触控与 safe-area**（P2-10）：移动端伪元素扩热区，dock/topbar 补 `env(safe-area-inset-*)`；断言 <44px 目标数从 128 降到 0（视觉尺寸可仍小，热区达标）。
- **验收**：`docs/design/DESIGN_SYSTEM.md` 与代码逐项回填一致（含 `--bg-0`、馆名 clamp、4px 网格、hit-area 声明）；对比度/触控/焦点三项进 CI。

---

## Phase 5 · 结构与可维护性

- **5-A engine.js 纯搬运拆分**（P2-15）：`model-loader.js`(595-800) / `measure.js`(1274-1364) / `tour.js`(1376-1433) / `capture.js`(1702-1803)；**一次一个文件，每步 smoke 全绿**。
- **5-B DeviceViewer.vue 抽 composable**：`useKeyboard` / `useUrlState` / `useRatings` / `useFavorites`。
- **5-C 调试面收敛**（P2-14）：`window.__GEWU_DEBUG` 单对象 + 限长 + `clear()`；`marshall-jcm800.js` 改 `import * as THREE`。
- **5-D 工具链去重**（P2-4）：抽 `tools/lib-browser.mjs`（约 40 个 verify 脚本共用启动块）；`legacy.html`/`rotate_m4.tmp.mjs` 归档 `docs/archive/`（不删）。
- **5-E 仓库纪律**（REPO-02）：`.gitignore` 补 `.agents/ .claude/ .zcode/skills/ skills-lock.json`；资产类与代码类改动分提交；每切片一提交。
- **5-F ESLint（可选）**：flat config，只开风格与 `no-unused-vars`，不改行为。
- **验收**：`engine.js` <800 行；`wc -l` 与 `npm run smoke` 双绿；`git status` 干净（改动均已分主题提交）。

---

## Phase 6 · 内容深度（差异化，持续滚动）

| 任务 | 目标 | 依据 |
|---|---|---|
| `mech` 机构关系 3→40 台 | 支撑 I-01 谱系志 | `validateMech` + `lint-mech` 已就绪 |
| `realSizeMM` 标定 1→40 台 | 让测量工具对主力展品有意义 | 一台约 5 分钟（targetWidth 换算） |
| `quality` 分级 19→80 台 | 质量诊断可信 | screen-audit/assembly-screen 证据链现成 |
| `demos` 20→40 台 | 教育价值 | `device.demos` 声明式字段已成型 |
| `era` 70→100 台（可查证者） | 编年页覆盖 | lint 已强制"非空必带来源" |
| 词条反查展品（I-05） | 知识层闭环 | 20 词条 + 460 部件映射已在库 |

**真实性红线**：所有字段逐台查证，禁止 AI 批量生成文案（AGENTS §1、roadmap §5.3）。

---

## Phase 7 · 留存与传播（按需启动）

- **I-03 离线 PWA**：`vite-plugin-pwa`（MIT）+ 现有 Cache Storage 策略对齐；验收＝DevTools offline 下二次进入收藏展品零请求。
- **I-02 可打印档案**：`/device/:id/dossier` + print CSS（当前 `@media print` 命中 0）；复用 `capturePartThumb`。
- **I-04 网页 AR 试点**：`<model-viewer>` 隔离懒加载元件，主引擎不动；真机各 1 次验证。
- **I-06 策展 Story**：1 个专题 6 台，静态 JSON 驱动。
- **前置**：无埋点情况下先做"本地推导式指标"（`dtm.explored` 已有足迹），或明确接受"按策展判断排优先级"。

---

## 依赖与顺序说明

1. Phase 0 无前置，**必须最先**（P0 与可信度类 P1）。
2. Phase 2-B（对比度 CI）依赖 2-A 的令牌反转先落地，否则 CI 会一直红。
3. Phase 3-A（删 `__ENGINE`）需与 5-C（调试面收敛）协同，否则 66 个 verify 脚本可能大面积报错——**顺序：先 5-C 建 `__GEWU_DEBUG`，再 3-A**。这是本路线图里唯一的"看似简单实则有依赖"的点。
4. Phase 4 依赖 Phase 2（否则日厅改动会与令牌改造冲突）。
5. Phase 5-A 拆分建议在 Phase 3 之后（先把生命周期修完，再搬代码，避免同一文件两处并发改动）。
6. Phase 6/7 可与 4/5 并行（纯内容与增量能力，不碰引擎）。

## 每 Phase 统一验收动作

`npm run build` → `npm run lint:devices`（含新增 consistency）→ `npm run smoke` → 相关 `tools/*verify*.mjs` → 三视口双厅截图对比 → `git diff` 自查（无 TODO/调试残留/死代码）→ 更新 `PROJECT_OPTIMIZATION_LOG.md` + `AUTONOMOUS_LOG.md` + `AUTONOMOUS_METRICS.md`。
