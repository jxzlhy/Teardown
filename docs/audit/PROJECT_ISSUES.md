# 格物馆 · 问题清单（PROJECT_ISSUES）

> 审计日期：2026-11-02 ｜ 代码基线：git `e8106be` + 工作区 345 项未提交改动 ｜ 规模：117 台设备 / 882 部件 / 39 品牌
> 分级：P0 阻断·数据丢失·重大安全 ｜ P1 明显影响核心体验或稳定 ｜ P2 影响质量·性能·可维护 ｜ P3 细节 ｜ IDEA 创新方向
> 证据栏一律给 `file:line` 或实测数值。标注 **待验证** 的条目＝本次环境无法测量，不得当作已确认结论。
> 每条含：现象 / 根因 / 影响 / 建议 / 成本 / 是否立即实施。

## 编号规则

`维度前缀-序号`：ARC 架构代码 · PER 性能 · UIA 视觉与令牌 · UX 交互 · MOB 移动 · A11Y 无障碍与语义 · DAT 数据一致性 · CON 内容与产品 · SEC 安全许可 · REPO 工程与仓库

## 整改状态速览（2026-11-02 第 1–5 轮后）

| 编号 | 状态 | 证据 |
|---|---|---|
| **P0-1** 纹理显存 | ✅ **已关闭**（14 台降到 ≤2048，最大单台 3259→815MB，全馆纹理显存 -43%） | `PROJECT_OPTIMIZATION_LOG.md` 第 3 轮 |
| **P0-2** 拾取未走 BVH | ✅ **已关闭**（装载后分帧增量建 BVH；combustion-engine p95 88.5→18.0ms，长任务 24→0；smoke 新增护栏断言） | 第 2 轮 |
| **P1-1** 占位展品 | ✅ **已关闭**（`unlisted` 机制 + TODO ⇒ lint error，反向测试通过） | 第 1 轮 |
| **P1-2** 数字不一致 | ✅ **已关闭**（五处统一 115 台 + `tools/lint-consistency.mjs` 自动闸门） | 第 1 轮 |
| **P1-3** 日厅对比度 | ✅ **已关闭**（11 组「页面×厅别」AA 不达标节点 **→ 0**；`tools/contrast-verify.mjs` + `npm run verify:contrast` 成为常驻闸门） | 第 4 轮 |
| **P1-4** 首屏发现路径 | ⬜ 未整改（属产品判断，需馆方定位确认） | — |
| **P1-5 / P1-6** `__ENGINE` / PMREM 泄漏 | ⬜ 未整改（Phase 3，需与 P2-14 调试面收敛协同，顺序见 ROADMAP 依赖说明） | — |
| ~~P1-7~~ → **P2-16** 映射对账 | 🔻 **降级**（全馆 117 台静态对账：0 台活动缺陷，仅 2 台占位展品命中，已随 P1-1 归零） | `/tmp/mapping-audit.mjs` |
| **P1-8** 许可与再分发 | 🟡 **部分关闭**（判定去循环化 + 34 台补 `distribution` 标记 + `npm run build:release` 排除 40 台/删 78 文件，dist 274→179MB）；**上游许可逐台人工复核仍未做**（见该条"遗留"） | 第 6 轮 |
| **P1-9** 移动端导视 | ✅ **已关闭**（导视条横滚 + 双厅按钮 sticky 钉右；390×844 七页 386 目标 **不达标 0**） | 第 5 轮 |
| **P2-10** 触控与 safe-area | ✅ **已关闭**（24 类控件 `::after` 扩命中盒 + 表单 `min-height:44px` + `env(safe-area-inset-*)`；滑杆 A/B 验证未破坏交互） | 第 5 轮 |


---

## P0（阻断级：真实用户会失败的场景）

### P0-1 · PER-01 单台展品解压显存最高 3.26GB，集显/移动端有 context lost 风险
- **现象**：`v6-engine.glb` 含 38 张 4096² 纹理，按 RGBA8+MIP（×1.34）估算 **3259MB 显存**；`phone4apro.glb` 含 **8192²** 纹理（1222MB）；`porsche-911-930` 952MB；`ak-47 / gl-06-launcher / nikon-d6 / walther-p99` 各 515MB。全馆 14 台 ≥4096。
- **证据**：`/tmp/glb-audit.json`（本次独立解析 117 个 GLB 的 JSON chunk + WebP/PNG/JPEG 头，非引用旧文档）；文件清单见上。
- **根因**：资产接入链 `webp → draco` 只压了**传输体积**（226.3MB），未约束**解压后尺寸**；`tools/optimize-glb.mjs` 无纹理分辨率上限策略。
- **影响**：iPhone/集显 Win 笔记本进入这 14 台展品可能黑屏、WebGL context lost、或 Safari 直接杀标签页；这是"点进去就崩"级别的失败。
- **建议**：① 在 `tools/optimize-glb.mjs` 增加 `--max-texture 2048` 策略，对这 14 台先做纹理降采样重导出（gltf-transform `resize`），原件保留 `vendor/assets/originals/`；② 二阶：KTX2/Basis（`uastc`）落地，显存再降 4–8×；③ 装载后按 `renderer.capabilities.maxTextureSize` 与 `device.memory` 做运行时兜底降采样。
- **成本**：中（14 台重导出 + 管线改一处；不改渲染架构）
- **立即实施**：**是**（先做 2048 上限的 3 台试点：v6-engine / phone4apro / porsche-911-930）
- **待验证**：真机（iOS Safari / Android Chrome / 集显 Win）实测显存与是否真的 context lost。

### P0-2 · PER-02 拾取射线未走 BVH，2.3M 三角展品悬停即掉帧
- **现象**：`three-mesh-bvh` 已引入并挂到 `BufferGeometry.prototype.computeBoundsTree`，但 `ensureBVH()` **只在测量工具开启时调用**；悬停与点击拾取仍是普通 `intersectObjects`。
- **证据**：`src/engine/engine.js:25`（import）、`src/engine/engine.js:1282-1289`（ensureBVH 定义）、`src/engine/engine.js:1311`（唯一调用点＝`setMeasure(true)`）、消费点 `src/engine/engine.js:1262 / 1325 / 1453 / 1611`（均为无加速射线）。高面数展品：`combustion-engine` 2,313,030 三角、`radial-engine` 2,251,655、`v8-engine` 2,003,742、`v6-engine` 1,290,048（本次 GLB 解析实测）。
- **根因**：BVH 是作为"测量工具"的依赖引入的（Phase 2 切片），没有回补到主拾取路径。
- **影响**：悬停一次＝对全部 pickMeshes 做完整三角形求交；高面数展品上鼠标划过即卡死数百毫秒，且这是**默认交互**，不是高级功能。
- **建议**：装载完成（`finalize` 前）在空闲帧增量 `computeBoundsTree()` + `raycaster.firstHitOnly = true`；构建耗时超阈值（>120ms/台）时降级为现状并 `console.info` 记录。
- **成本**：低（约 15 行，行为等价、可回滚）
- **立即实施**：**是**
- **待验证**：本次 hover 帧耗时探针因脚本缺陷未取到数值（见"未竟验证"），修复后需给出 radial-engine 修复前后 p95 帧时间对比。

---

## P1（高优先级）

### P1-1 · CON-01 两台"脚手架占位展品"已在馆内展出
- **现象**：`spitzer-space-telescope`、`chandra-x-ray-observatory` 的 tagline/description/部件 desc 全是字面 `TODO · 一句话卖点` / `TODO · 设备介绍。` / `TODO · 部件介绍。`，几何是 `box(6,3,1)` 一只黑箱，部件清单只有 1 项"机身"。
- **证据**：`src/devices/spitzer-space-telescope.js:10,21,22,32`、`src/devices/chandra-x-ray-observatory.js:10,21,22,32`；注册于 `src/devices/registry.js:120-121,192`；截图 `/tmp/audit/60-placeholder-spitzer.png`（黑箱 + "PROCEDURAL" 标签 + 1 部件）。
- **根因**：`tools/addDevice.mjs` 脚手架产出的半成品被计入正式馆藏，`npm run lint:devices` 无"禁止 TODO 字面量"规则（实测 0 错 11 警全绿）。
- **影响**：直接违反 AGENTS.md §1/§4 真实性约束；用户点进"斯皮策空间望远镜"看到一只黑箱 + TODO 文案，是可信度的硬伤；同时污染 117 台/882 部件的对外口径。
- **建议**：① `tools/lint-mapping.mjs` 增规则：`tagline/description/parts[].desc` 命中 `TODO` 即 **error**；② 这两台从 registry 摘出（保留文件与 GLB，加 `hidden: true` 或直接下线），等真实 CAD 到位再入馆；③ 大厅统计与 `gen:inventory` 随之回落到 115 台。
- **成本**：低
- **立即实施**：**是**（lint 规则先落地，防止后续再混入）

### P1-2 · DAT-01 三份生成物与 registry 台数不一致（对外数字互相打脸）
- **现象**：大厅显示 **117 台 · 882 部件 · 39 品牌**；`MODEL_INVENTORY.md` 写 **110 台 · 855 部件 · 110 GLB**；`public/timeline.json` 写 `total: 104`（页面渲染 "64 / 104 台馆藏"）；`public/knowledge-graph.json` 写 104 台 / 38 品牌（页面渲染 "104 台设备 · 38 品牌 · 1203 连边"）；`index.html` 的 description 写 "110 台设备"。
- **证据**：`grep -c` registry 117 条 import；`MODEL_INVENTORY.md:5`；`public/timeline.json` → `{'generated':'2026-11-01','coverage':{'devices':64,'total':104,'techs':20}}`；`public/knowledge-graph.json` → `nodes:577, device:104, brand:38`；`index.html` meta description；页面文本实测抓取（`/tmp/audit-results.json` routes 段）。
- **根因**：NASA 双件与后续 7 台入馆时只重跑了 `gen:inventory` 的一部分，`gen:timeline` / `gen:graph` / `index.html` 文案未随批次执行；AGENTS.md §4 明令"设备数量必须来自实际生成的 inventory"，当前生成物本身已过期。
- **影响**：四个页面四个数字，用户与任何后续接手者都无法判断真值；知识星图/编年页静默少 13 台展品。
- **建议**：① 立即 `npm run gen:inventory && npm run gen:graph && npm run gen:timeline` 并把 `index.html` description 改为动态（构建期由 `vite.config.js` 注入台数）；② 新增 `tools/lint-consistency.mjs`：断言 registry 台数 == inventory == graph == timeline == meta，纳入 `lint:devices` 链尾。
- **成本**：低
- **立即实施**：**是**

### P1-3 · UIA-01 日厅文字对比度大面积不达标（最严重 1.16:1）
- **现象**：日厅网格实测 **109 个文本节点 / 81 个不同 class** 低于 WCAG AA 阈值，最差 `1.16:1`（`.card-brand` "APPLE · 2026"，9px）、`1.21:1`（`.st-brand` "DJI · 2023"）；夜厅网格 262 节点 / 23 class，最差 `1.93:1`；日厅设备页 6 节点（`SPACE 一键拆解…` 1.62:1）。
- **证据**：本次 `contrastScan` 运行时计算（相对亮度公式，背景取最近不透明祖先），`/tmp/audit-results5.json`；截图 `/tmp/audit/42-hall-grid-day.png`、`/tmp/audit/05-hall-day-grid.png`。
- **根因**：日厅换肤走"逐选择器补皮"路线（`html[data-hall="day"]` 165 条 / 约 670 条规则），暗厅里"深底+微亮灰字"的层级表达搬到浅底后没有对应反转，`--txt-3`/`--txt-dim` 系在日厅未重定义到足够深。
- **影响**：日厅（面向投影/办公环境的那一厅）品牌行、年代行、徽标行接近不可读；屏幕阅读器用户不受影响，但低视力用户直接失去信息。
- **建议**：在日厅 token 段一次性定义 `--txt-2/--txt-3/--txt-dim/--acc-dim` 的浅底值（目标：正文 ≥4.5:1、辅助 ≥3:1），并删除逐选择器补丁中与之冲突的 color 覆盖；把 `tools/day-contrast-verify.mjs` 复活为 CI 断言（当前 backlog 里它状态是"待办/退役"）。
- **成本**：低-中（改 token + 回归截图）
- **立即实施**：**是**（这是"日厅能不能用"的问题）

### P1-4 · UIA-02 大厅首屏没有发现路径：搜索在折叠线以下 1366px
- **现象**：1440×900 首屏内可交互元素仅 **6 个**（导航 5 + 双厅切换），搜索框不在首屏（`searchInFold: false`），第一张展品卡片的绝对位置 **y=1366**（`.hub` 滚动容器 scrollHeight 19086）。
- **证据**：`/tmp/audit-results4.json` fold 段；截图 `/tmp/audit/01-hall-night-top.png`（首屏只有牌记 + 一台焦点展品 + 统计数字）。
- **根因**：门厅版式（牌记 + 焦点展台 + 常设展标题）按"展览序厅"设计，把 117 件藏品的检索入口推到第三屏；`.hub` 用 `position:fixed; inset:0; overflow-y:auto`（`src/style.css:39-43`）自管滚动，进一步弱化了原生滚动暗示。
- **影响**：带着明确目标来的用户（"我要看 Mavic 3"）必须先滚动约 1.5 屏才找到搜索；首屏转化路径只剩"碰运气看焦点展台"。
- **建议**：把搜索/筛选主行上移到焦点展台之上（或牌记右侧），并在首屏给"按品牌/按类别进入展线"的 2 个显性入口；保留序厅叙事但压缩到一屏内。
- **成本**：中（版式重排，需双厅 + 三视口回归截图）
- **立即实施**：建议（属产品判断，需与馆方定位确认后再动）

### P1-5 · ARC-01 离开设备页后 `window.__ENGINE` 仍强引用已 dispose 的场景
- **现象**：`window.__ENGINE = engine` 在挂载时写入，`onBeforeUnmount` 只 `engine.dispose(); engine = null`，**不删全局**；对照 `GraphView.vue:313` 有 `delete window.__GRAPH`。
- **证据**：`src/components/DeviceViewer.vue:1175`（写入）、`src/components/DeviceViewer.vue:1225-1234`（卸载块，无 delete）；`src/components/GraphView.vue:313`（正确做法）。
- **根因**：`__ENGINE` 被 66 个 `tools/*verify*.mjs` 当测试钩子使用（实测 `grep -rl "__ENGINE" tools/ | wc -l` = 66），删除会"破坏测试"，于是长期只写不删。
- **影响**：回到大厅后，整棵 Three 场景图（几何/材质/贴图 JS 侧对象）仍被 window 持有，直到下次进设备页才被替换；大厅停留期间内存不降。
- **建议**：卸载时 `delete window.__ENGINE`；测试脚本改为"进页后重新取钩子"（本来就是这种用法），并在 AGENTS/TECH 里把"调试钩子契约"写清：钩子只在页面存活期存在。
- **成本**：低
- **立即实施**：**是**
- **待验证**：本次泄漏探针（往返 3 次测 heap）在断言前崩溃，未取到 heap 曲线；修复后需补一次实测。

### P1-6 · ARC-02 PMREM 环境与贴图未释放
- **现象**：`new THREE.PMREMGenerator(renderer)` 建完 `scene.environment` 后既不 `pmrem.dispose()`，`scene.environment.texture` 也不在任何 dispose 路径里；`engine.dispose()` 只 dispose 了 renderer/composer/设备组。
- **证据**：`src/engine/engine.js:153-154`；`src/engine/engine.js:1861-1871`（dispose 体）；`disposeDevice()` `src/engine/engine.js:466-497` 只遍历 `deviceGroup`。
- **根因**：dispose 清单是按"设备网格"建的，环境贴图属于引擎自身资源，被漏在职责外。
- **影响**：每次进出设备页泄漏一份 PMREM RT + 环境贴图（数 MB 级 GPU）；与 P1-5 叠加后，长会话（导览/演示）内存单调上升。
- **建议**：`dispose()` 内补 `scene.environment?.dispose()`、`pmrem.dispose()`、`nightBgTex`/`thumbRT` 释放；最后 `renderer.forceContextLoss()`。
- **成本**：低
- **立即实施**：**是**

### ~~P1-7~~ → **P2-16** · ARC-03 未映射网格缺少运行时对账（**全馆取证后降级**）
- **原判断**：GLB 网格映射不到部件时静默丢弃，无告警。
- **取证修正**：`resolvePartId()` 其实有兜底落点 `device.unmappedTo || 'shell'`（`src/engine/engine.js:694-703`），且 `_kit/factory.js:53-58` 会为 `unmappedTo` 自动挑选 shell/body/case/… 或首个部件。本次**逐台静态对账 117 台**（`/tmp/mapping-audit.mjs`，Node 侧实跑）结果：
  - `mapping` / `materialMapping` / `mappingPrefix` 指向不存在部件的设备：**0 台**
  - `realPartIds` 引用不存在部件（幽灵 id）：**0 台**
  - `unmappedTo ∉ realPartIds` ⇒ 未映射网格会被丢弃：**2 台**，恰为两台占位展品 `spitzer-space-telescope` / `chandra-x-ray-observatory`（P1-1 处理后即归零）
- **结论**：**当前无活动缺陷**，映射质量良好；但"资产重导出/改名后静默少一块"这条**风险路径确实存在**（丢弃发生在 `engine.js:775-781` 的 `realPartIds` 消费循环，无差集告警）。
- **建议**（仍值得做，成本极低）：装载收尾比对 `Object.keys(byPart)` 与 `partsById`，差集 `console.warn('[mapping] 未接入网格 N 个：…')` 并写 `window.__LOAD_WARN`，让 smoke 可断言"0 条 mapping warn"。
- **成本**：低 ｜ **立即实施**：可延后到 Phase 3-C

### P1-8 · SEC-01 许可与再分发风险：3 台 NC + 1 台 Sketchfab Free + 1 台 GPL-3.0 随 dist 发布，35 台无 `modelCredit`
- **现象**：`combustion-engine`、`galaxy-s22-ultra`、`hydraulic-jack` 标 **CC-BY-NC 4.0**（禁商用）；`iphone-16` 标 **Sketchfab Free Standard License**（禁止独立再分发模型文件）；`flipper-zero` 外壳标 **GPL-3.0**；另有 **35/117** 台配置里没有 `modelCredit` 字段（其中多数在 `source:` 里写了"Apple 官网 AR 模型（USDZ 转制）"）。`dist/assets/` 实际打包 117 个 GLB（274MB）。
- **证据**：`src/devices/combustion-engine.js:27`、`galaxy-s22-ultra.js:36`、`hydraulic-jack.js:26`、`iphone-16.js:40`、`flipper-zero.js:73`；`grep -L modelCredit src/devices/*.js | wc -l` = 35；`ls dist/assets/*.glb | wc -l` = 117。
- **根因**：`tools/lint-mapping.mjs:103-105` 的署名规则是**循环判定**——只有当 credit 文本里已经出现"Sketchfab/社区"时才强制署名，完全没写 credit 的第三方模型可以静默通过。
- **影响**：一旦公开发布（站点、仓库、演示），这几类许可都可能构成违约；"117 台全馆"的对外口径也建立在未澄清的再分发权利上。
- **建议**：① lint 改为**独立判定**：无 `modelSource` 域名证据 ⇒ error（Apple/DJI 官方 AR 需显式 `distribution: 'local-demo-only'` 标记）；② 提供 `npm run build -- --exclude-nc` 的"可发布构建"，把 NC/Free Standard/GPL 与未授权 AR 资产排除；③ 展品信息浮层已有 NC 琥珀徽标（做得好），补一句"再分发限制"说明。
- **成本**：中（逐台复核需人工）
- **立即实施**：**是**（先做 lint 与排除构建，避免误发布；逐台授权复核列进 roadmap 人工项）
- **已排除的误报**：子代理报告称 `countach-lpi800-4` 署名与调研记录矛盾（CC-BY vs NC）。本次直查 `docs/credit-research-raw.json`：实际采用的 `uid 9c94c70a`（作者 fa001569）许可为 **CC Attribution（允许商用）**，NC 属于同搜索结果里另一件 `uid d76b9488`（Lexyc16）。**该条不成立，已撤销。**

### P1-9 · UX-01 移动端导视条在"我的探索 · 足迹N"变长时挤出视口
- **现象**：390×844 下导视条目宽 41–55px、高 **17px**；当"我的探索"带足迹计数后缀时，`button.hall-link`（双厅切换）右边界到达 **x=438**（视口 390），即被裁掉；同一状态下截图 `/tmp/audit/30-mobile-hall.png` 可见"足迹7"贴边截断。
- **证据**：`/tmp/audit-results.json` mobileHall（`overflowing: BUTTON.hall-link@438`、`smallExamples`）；`/tmp/audit-results4.json` mobile（`navLinks`、`smallTargets: 128 / totalTargets: 299`）。
- **根因**：导视条为不换行 flex，长度随文案变化，无 `overflow-x` 处理也无省略策略。
- **影响**：手机上"切日厅/夜厅"这个一级功能可能整颗按钮消失；导视本身误触率高。
- **建议**：导视条移动端改横向滚动（`overflow-x:auto` + 隐藏滚动条 + 右缘渐隐），足迹计数改为徽标而非后缀文本；触控高度补到 ≥44px（伪元素负 inset 扩热区）。
- **成本**：低
- **立即实施**：**是**

---

## P2（中优先级）

### P2-1 · PER-03 后处理链常驻 + 无按需渲染
- **现象**：`EffectComposer` 常驻 OutlinePass×2 + Bloom + Output，rAF 恒定空转（含 500ms watchdog 空转），静止画面也全量重绘。
- **证据**：`src/engine/engine.js:1647`、`src/engine/engine.js:1674`（rAF 循环）、`src/engine/engine.js:1685`（watchdog）、`src/engine/engine.js:109`（composer RT 无 `samples`，`antialias:true` 对 composer 无效）。
- **影响**：笔记本发热/掉电快，移动端续航差；`antialias` 白付一份 MSAA 成本却对 composer 输出无效。
- **建议**：脏标记按需渲染（相机静止 + 无动画 + 无 hover 时跳帧或降 30fps）；composer RT 显式 `samples: 4` 并关 renderer antialias。
- **成本**：中（涉及自转/导览/演示动画的状态判定，需回归）
- **✅ 已关闭（2026-11-04 AURORA PHASE 5 R1+R3）**：R1 时间基准 idle（无活动 1.2s）半帧率降频——待机自转允许降频（慢速环绕 30fps 无感知，为主要降频对象），用户输入 1.5s 余波窗口恢复全速；跳帧帧丢弃 clock 间隔保墙钟速率；watchdog 兜底帧恒渲染。R3 composer RT samples:4 + renderer antialias:false（thumb 模式保持旧输出）。实测（swiftshader@load4.5）：idle render 16.9 ≈ rAF 30.8×0.5（降频生效）；交互恢复 28.5≈30.8（全速+R3 无回退）；smoke 27/28（唯一失败=历史 tour 抖动同项）。踩坑：OrbitControls change 事件不可用作 idle 判定（update() 每次 dispatch）——两轮实测抓出后改输入窗口方案。真实 GPU 绝对帧耗待真机。

### P2-2 · PER-04 标签层每帧全量写 DOM
- **现象**：`labels.js` 在更新循环里对每个部件标签写 `style.display / transform / setAttribute('d') / viewBox`，无脏检查。
- **证据**：`src/engine/labels.js:77`、`src/engine/labels.js:112-141`。
- **影响**：部件多的展品（14–45 部件）60fps 下持续触发样式重算与 GC 压力。
- **建议**：位置/可见性做上一帧比较，未变则跳过；标签数 >N 时按距离裁剪。
- **成本**：低
- **✅ 已关闭（2026-11-04 AURORA PHASE 5 R2）**：帧间签名脏检查（boxX|boxY|sel|hot|pathD|dotCx|dotCy 字符串签名，相机静止时浮点确定性→整件跳过 DOM 写；viewBox 仅尺寸变化写；隐藏/离屏分支 prevShow 判定）。build 2.76s + lint ✓；smoke 标签断言见当轮 LOG。

### P2-3 · PER-05 单台 >6MB 下载共 10 台，中位 0.94MB
- **现象**：>6MB：v6-engine 13.7 / ak-47 13.0 / curta-type2 9.5 / gl-06-launcher 9.4 / porsche-911-930 9.1 / phone4apro 7.8 / combustion-engine 6.7 / iphone-12-teardown 6.4 / walther-p99 6.2 / computer-parts 6.1（MB，实测）。
- **证据**：`/tmp/glb-audit.json`；v6-engine 设备页实测传输 24.4MB / 128 请求 / JS heap 115.2MB（对照组 action4：6.0MB / 94 请求 / 36.9MB）。
- **建议**：与 P0-1 合并处理（纹理降采样即可让多数大户掉到 3MB 内）；meshopt 与 draco 做一次 A/B 基准（社区口径解码快 5–10×，**未自测**）。
- **成本**：低-中

### P2-4 · REPO-01 生成物/文档/工具链三处漂移
- **现象**：① `AGENTS.md §4` 列的检查命令与 `package.json` scripts 不完全一致（无 `gen:timeline` 之外的 graph/timeline 组合口径）；② `docs/design/DESIGN_SYSTEM.md` 与代码取值不符（`--bg-0` 文档 `#030509` vs 代码 `#020408`；馆名 clamp 文档 `clamp(76,11.5vw,172)` vs 代码 `clamp(44,6vw,84)`）；③ `legacy.html`（79KB）、`rotate_m4.tmp.mjs` 无任何引用（`grep` 0 命中）；④ `tools/` 95 个 `.mjs` 里约 40 个 verify 脚本的 puppeteer 启动块逐字重复。
- **证据**：`MODEL_INVENTORY.md:5`、`src/style.css:8,154`、`legacy.html`、`rotate_m4.tmp.mjs`、`tools/hall-verify.mjs:1-6` 与 `tools/float-verify.mjs:1-6` 等。
- **影响**：接手者按文档做会做错；改一次浏览器启动参数要改 40 处。
- **建议**：文档回填以代码为准（AGENTS §9 已有此规则，缺执行）；抽 `tools/lib-browser.mjs`；死文件归档到 `docs/archive/`（不删，尊重用户资产）。
- **成本**：低-中

### P2-5 · REPO-02 工作区 345 项未提交改动 + `.gitignore` 未覆盖新工具目录
- **现象**：`git status --short` = 345 行（216 webp / 27 mjs / 17 js / 15 png / 11 md / 11 glb / 3 vue …）；`.agents/`（7.3MB）、`.claude/`、`.zcode/skills/*`（约 40 个新技能目录）未被 ignore，全部出现在未跟踪列表。
- **证据**：`git status --short | wc -l` = 345；`cat .gitignore`（仅 node_modules/dist/.DS_Store/.mimosa/vendor/rotate_m4.tmp.mjs/.v2c）；`du -sh .agents` = 7.3M。
- **影响**：无法用一次 diff 审查本轮改动，回滚粒度失控；AGENTS §5"绝不覆盖用户未提交工作"的护栏在这种体量下形同虚设。
- **建议**：补 `.gitignore`（`.agents/ .claude/ .zcode/skills/ skills-lock.json`）；把资产类改动（缩略图/GLB）与代码类改动**分提交**；此后每完成一个切片即提交。
- **成本**：低
- **立即实施**：**是**（提交动作需用户授权，先只改 .gitignore）

### P2-6 · A11Y-01 语义与地标缺失：无 `<main>`、无跳转链接、`<figcaption>` 位置非法
- **现象**：大厅 DOM 实测 `header:1 nav:1 main:0 footer:0 aside:0`；无 skip link（`skipLink: false`）；`<figcaption>` 直接挂在 `<div>` 下（Vite 每次 dev 编译都告警）。
- **证据**：`/tmp/audit-results.json` hall.landmarks / keyboard.skipLink；`src/components/GalleryHub.vue:54-60`；dev 日志实测告警文本"`<figcaption> cannot be child of <div>`"。
- **影响**：读屏用户失去结构导航；非法嵌套在未来若引入 SSR/hydration 会直接出错。
- **建议**：`.hub` 内容包 `<main id="main">` + 顶部 skip link；`figcaption` 改 `div`（或把外层补成 `figure`）。
- **成本**：低

### P2-7 · A11Y-02 焦点与按压反馈：`CompareView` 直接杀掉焦点环，全项目 0 条 `:active`
- **现象**：`.cmp-dev:focus-visible, .cmp-table td.diff{ outline:none; }`（把设备链接的焦点环一起关掉）；`grep -c ":active"` 在 `style.css`、`hud.css` 与 8 个 `.vue` 中全部为 **0**；`aria-live` 区域 **0** 个（toast 不播报）。
- **证据**：`src/components/CompareView.vue:104`；本次 grep 实测；`/tmp/audit-results.json` devices.*.ariaLive = 0。
- **影响**：键盘用户在对比页看不见焦点；所有按钮缺按压反馈（"点了没有？"）；状态变更（装载完成、评分保存）对读屏静默。
- **建议**：焦点改全局基线 `:where(a,button,input,select,textarea,[tabindex]):focus-visible{outline:2px solid var(--acc);outline-offset:2px}`；给主操作补 `:active{transform:translateY(1px)}`；toast 容器加 `aria-live="polite"`。
- **成本**：低

### P2-8 · UIA-03 组件重复实现与令牌债（"半套设计系统"）
- **现象**：药丸按钮 6 套（`.chip` / `.hud-chip` / `.gb-chip` / `.fp-seg button` / `.motion-speed button` / `.fav-cat`）、搜索框 2 套、textarea 2 套近逐行相同、eyebrow 3 套、tooltip 4 套；CSS 变量 39 个（死变量 3、别名重复 2、`var(--accent, #7fb0d0)` 拼写事故 1 处）；字号 24 种（含 7 个半 px 档）、行高 11 种、字距 21 种、z-index 14 种魔法数、`rgba(69,224,255,…)` 青色字面量 42 处、hex 72 处、px 1199 处。
- **证据**：`src/style.css:10-13,26-28,795`、`src/ui/hud.css:80`、`src/components/GraphView.vue:683,701,722,734`、`src/components/ForgeView.vue:203-205,229`、`src/style.css:1005-1011 vs 1060-1066`。
- **影响**：改一处样式要改六处；换肤靠字面量的地方在日厅必然漏。
- **建议**：不引入 UI 库（规范禁止），做"令牌补全 + class 归一"：`:root` 三层（原始/语义/组件）、日厅只改语义层、旧 class 保留为别名一版；青色字面量统一 `color-mix(in srgb,var(--acc) N%,transparent)`。
- **成本**：中

### P2-9 · UIA-04 用字符当图标约 28 处，与 24 个内联 SVG 体系打架
- **现象**：正式控件上出现 `✕ ★ ✎ ◆ ▴ ‹ › ＋ ↗ ⬇ ⧉ ⇥ ⚒` 等字符图标（ForgeView 整页、GalleryHub 星标/关闭/步进、DeviceViewer 外链与下载）。
- **证据**：`src/components/GalleryHub.vue:15,79,95,115,130,172,177,179,215,220,353,393`、`src/components/DeviceViewer.vue:120,350,361,373,378`、`src/components/ForgeView.vue:5,55,70,71,82`。
- **影响**：跨平台字形漂移（Windows/Android 上 ✕/★ 宽窄不一）、与 SVG 图标视觉语言不统一、读屏可能读出符号名。
- **建议**：建一份内联 SVG sprite（close/star/edit/download/copy/back/arrow），逐点替换；字符图标处至少补 `aria-hidden="true"` + 文本标签。
- **成本**：中
- **✅ 已关闭（2026-11-04 AURORA PHASE 1 轮 18）**：新建 `src/ui/Icon.vue`（21 图形内联 sprite，currentColor/aria-hidden）；38 处控件字符逐点替换为 SVG（含动态展开 caret、收藏/徽章实心态 name 切换）；控件字符 grep 残留 0；按键描述文本与空状态说明按语义保留。build 3.07s ✓ + forge 页截图目检。

### P2-10 · MOB-01 触控目标 <44px 成规模（128/299），safe-area 全站仅 1 处
- **现象**：390×844 实测 299 个可交互元素中 **128 个** 宽或高 <44px（导视 41×17、圆点导航 30、星标 28、步进/关闭 26、chip ≈25）；`env(safe-area-inset-*)` 仅 `src/style.css:928` 一处，`#dock{bottom:10px}`（`src/style.css:941`）无 env()。
- **证据**：`/tmp/audit-results4.json` mobile；`grep -c "safe-area-inset" src/**/*.css` = 1。
- **影响**：误触；iPhone 横屏/带 Home 条机型 dock 被手势区吃掉。
- **建议**：移动端统一伪元素扩热区（`::after{position:absolute;inset:-8px}`）；dock/topbar 补 `env(safe-area-inset-bottom/top)`。
- **成本**：中

### P2-11 · SEC-02 生成型数据静态可发布，但缺 CSP / robots / sitemap / og:image
- **现象**：`index.html` 无 CSP、无 `Referrer-Policy`、无 `og:image`/twitter 卡、无 canonical；`dist/` 与 `public/` 无 `robots.txt`、`sitemap.xml`、`manifest.webmanifest`；hash 路由 + 无预渲染 ⇒ 117 个设备页实际不可索引。
- **证据**：`index.html`（实测仅 title/description/3 个 og 属性）；`ls dist public` 无上述文件；`src/main.js:14` `createWebHashHistory()`。
- **影响**：分享无卡片（微信/X 只显示裸链接），搜索引擎进不去设备页，纵深防御缺一层。
- **建议**：① 补 `og:image`（用现成 `public/thumbs/<id>.webp`）+ `robots.txt` + `manifest`；② 若要 SEO，做构建期预渲染静态设备页（无需后端）；③ 加 CSP meta（`default-src 'self'; img-src 'self' data:; connect-src 'self'`）并实测不破坏 Draco/Cache Storage。
- **成本**：低（①③）/ 中（②）

### P2-12 · SEC-03 `labels.js` 用 innerHTML 拼部件名
- **现象**：`el.innerHTML = \`<span class="pl-idx">…</span><span class="pl-name">${p.data.zh}</span>\``。
- **证据**：`src/engine/labels.js:36`（另 `:28` 为 `svg.innerHTML=''` 清空，安全）。
- **影响**：当前数据全部来自开发者静态配置，**不可被用户输入**，故非活动漏洞；但一旦部件名来自 localStorage/导入 JSON 即成 XSS 注入口。
- **建议**：改 `createElement` + `textContent`（防御性，成本极低）。
- **成本**：低 ｜ **立即实施**：是

### P2-13 · CON-02 功能宽度已超过数据深度（5 项功能覆盖率 <20%）
- **现象**：117 台中——`tour` 115、`xrayShellIds` 115、`specs` 117（这三项健康）；但 `demos` 20（17%）、`quality` 分级 19（16%）、`mech` 机构关系 **3（2.6%）**、`assembleStep` 逐步装配 **2（1.7%）**、`realSizeMM` 测量标定 **1（0.9%）**。
- **证据**：`grep -l "<field>" src/devices/*.js | wc -l` 实测。
- **影响**：工具栏里"测量/机构关系/逐步装配"对 98% 的展品是空转或降级态（做得好的是：未标定显示 `X.XX u · 未标定`、mech 面板无数据即隐藏，见 `src/engine/engine.js:1349`、`src/components/DeviceViewer.vue:315`）。
- **建议**：停止"再加工具"，转入**深度补齐**：优先 `realSizeMM`（按 targetWidth 换算，一台 5 分钟）与 `mech`（已有 lint-mech 校验与 6 台样例）各补 30 台；`quality` 分级按 screen-audit 证据继续铺。
- **成本**：中（纯内容工作，可批量滚动）

### P2-14 · ARC-04 引擎对外契约依赖 window 全局，且 `__LOADS` 只增不清
- **现象**：引擎在 `window` 上挂 `__THREE / __LOADS / __MAPPTS / __NORMDBG / __RAW / __CAM / __LOAD_ERR / __animErr`，其中 `__LOADS` 每次装载 push 一条永不清理；66 个 verify 脚本把这些当事实 API 用。设备配置层反向依赖：`src/devices/marshall-jcm800.js:49` 用 `window.__THREE`。
- **证据**：`src/engine/engine.js:33,607,706,707,723,772,796,881,1679`。
- **影响**：调试面即公共面——重构引擎会静默打断工具链；配置层破单向依赖。
- **建议**：收进单一 `window.__GEWU_DEBUG = { loads:[], caps:…, clear(){} }`（限长），文档化"仅 dev/测试可见"；`marshall-jcm800.js` 改 `import * as THREE`（其余 11 台已如此）。
- **成本**：中

### P2-15 · ARC-05 两个超大文件承载过多职责
- **现象**：`src/engine/engine.js` 1873 行（装载/归一化 595-800、测量 1274-1364、Tour 1376-1433、缩略图捕获 1702-1803 混在一起）；`src/components/DeviceViewer.vue` 1235 行（键盘映射 1101-1146、URL 同步 971-1004、评分收藏 526-790）。
- **证据**：`wc -l` 实测 + 上述行段。
- **影响**：改动定位成本高、回归面大（历史上 "Maximum recursive updates" 类问题就发生在这两个文件的并发编辑中）。
- **建议**：按既有注释段做**纯搬运式**拆分（`model-loader.js / measure.js / tour.js / capture.js`；Vue 侧 `useKeyboard/useUrl/useRatings` composable），一次一个文件、每步 `npm run smoke` 全绿。
- **成本**：中（低风险但需完整回归）

---

## P3（低优先级细节）

| 编号 | 问题 | 证据 | 建议 | 成本 |
|---|---|---|---|---|
| P3-01 | `import { createEngine } from '../engine/engine.js?v=30'` 硬编码 cache-busting | `src/components/DeviceViewer.vue:471`（dist 实测未产生重复 chunk，故仅 dev 语义问题） | 去掉查询串，靠构建哈希 | 低 |
| P3-02 | localStorage 前缀混用 `dtm.*` 与 `teardown-*` | `DeviceViewer.vue:528` vs `:1005`；实测键清单 11 个 | 统一 `gewu.` 前缀 + 一次性迁移 | 低 |
| P3-03 | 死/别名令牌：`--bg-2`、`--dur-3`、`--ease-spring` 消费 0 次；`--glass`≡`--panel-bg`、`--txt-dim`≡`--txt-3` | `src/style.css:8,10-13,25-28` | 删除或启用 | 低 |
| P3-04 | 日厅专属令牌（`--wash-1/2`、`--hairline*`、`--raise`）只在 day 块定义，夜厅消费点无 fallback ⇒ IAC 回退 | 定义 `style.css:1105-1108`，消费 `style.css:1335,1346,1352,1359,1377,1387`、`ForgeView.vue:215,231,262,268` | 在 `:root` 给夜厅默认值 | 低 |
| P3-05 | 大厅卡片缩略图无 `srcset`（118 张 img：alt 118、decoding 118、lazy 117、srcset 0） | `/tmp/audit-results4.json` gridStats | 出 2× 变体或按 DPR 出图 | 低 |
| P3-06 | `matchMedia('(prefers-reduced-motion)')` 只在启动读一次，运行中改系统偏好不响应 | `DeviceViewer.vue:606` | 监听 `change` | 低 |
| P3-07 | 自定义分类名仅 UI 层 `maxlength=12`，逻辑层无上限 | `src/lib/explore.js:116-123` | 写入侧 `slice(0,12)` | 低 |
| P3-08 | 孪生配置：`iphone-18-pro-max` 与 `-burgundy` 仅配色/id 差异 | 两文件 diff | `_kit` 增 variants 工厂 | 中 |
| P3-09 | DJI 6 台（action4 等）未迁 `_kit`（其余 111/117 已收敛） | `grep -L "_kit" src/devices/*.js` | 迁移或记录不迁原因 | 中 |
| P3-10 | 无 ESLint/Prettier（lint 全为自研 `tools/lint-*.mjs`） | 根目录无配置文件 | 上 ESLint flat config（仅风格+no-unused，不改行为） | 中 |
| P3-11 | `npm audit` dev 侧 2 项（esbuild GHSA-67mh-4wv8-2f99 high ⇒ vite≤6.4.3）；prod 0 | 实测输出 | 单独评估 vite 升级（破坏性，需全量回归） | 中 |
| P3-12 | 对比页表格仅"行标签左粘"（`position:sticky; left:0`），无列头顶粘 | `src/components/CompareView.vue:95` | 表头行 `position:sticky; top:0` | 低 |
| P3-13 | 触摸端仍显示"hover 暂停"文案 | 大厅焦点展台说明行（截图 `/tmp/audit/30-mobile-hall.png`） | 按 `(hover: none)` 媒体特性换文案 | 低 |
| P3-14 | `dist` 274MB 全量拷贝 GLB，无 CDN/长缓存分层 | `du -sh dist` | 部署层配 `Cache-Control: immutable` + GLB 独立前缀 | 低（部署项） |

---

## IDEA（创新方向，非缺陷）

| 编号 | 方向 | 依据与理由 | 最小切片 | 验证 |
|---|---|---|---|---|
| I-01 | **机构谱系志**：把 `mech` 边从 3 台扩到全馆，生成"同一机构跨 80 年怎么变"的专页 | `src/forge/mech.js` 已有 10 类关系 + `validateMech`，`tools/lint-mech.mjs` 已能校验；当前仅 3 台有数据（P2-13） | 先做"擒纵"一条谱系串 5 台，设备详情卡尾部加"同宗机构" | 深链可达 + 谱系页截图 + lint 全绿 |
| I-02 | **一页展品档案（可打印）**：爆炸图快照 + 部件清单 + 来源分级 + credibility | 现无 print CSS（实测 `@media print` 命中 0）；`capturePartThumb` 离屏捕获管线已存在可复用 | DeviceViewer 加 `/device/:id/dossier` 视图 + print 样式 | 两台代表机型桌面/移动打印实测 |
| I-03 | **离线 PWA「掌上格物馆」**：manifest + SW，把 `glbCache` 升级为正式离线策略 | 已有 Cache Storage LRU（`src/engine/glbCache.js:11` `teardown-glb-v1`），只差 SW 编排；纯静态托管可行 | `vite-plugin-pwa`（MIT）+ 收藏的 5 台 prefetch | DevTools offline 断言 + 冷启动二次进入零请求 |
| I-04 | **网页 AR 小切口**：`<model-viewer>` 只做"把这台机器放到我桌上"，主引擎不动 | Google 组件 Apache-2.0、活跃维护；竞品拆解显示这是格物馆目前唯一缺的展示维度 | 设备页加"AR 视图"按钮，隔离成懒加载元件 | iOS Quick Look / Android Scene Viewer 真机各 1 次 |
| I-05 | **词条反查展品**：`/graph` 技术节点加"使用此技术的展品"清单 | 20 条技术词条 + 460 部件 id 映射已在 `src/knowledge/`，纯查询层 | GraphView 详情面板加一个区块 | 10 个高频词条清单正确性 lint |
| I-06 | **策展专题（Story）**：跨展品动线（如"从发条到擒纵：计时的 600 年"） | Google Arts & Culture 的 Story 模型验证了留存价值；本项目 tour 已 115/117 | 1 个专题 6 台，静态 JSON 驱动 | 完读率（本地埋点）+ 分享链接数 |

---

## 明确撤销 / 不成立的条目（防止后续接手者重复排查）

1. ~~countach-lpi800-4 署名与许可矛盾~~ —— 实测采用的 `uid 9c94c70a`（fa001569）为 **CC-BY（允许商用）**，NC 属另一候选件。见 P1-8 附注。
2. ~~jet-engine 为 Sketchfab Free Standard~~ —— 实为 **CC-BY 4.0**（`src/devices/jet-engine.js:26`）。
3. ~~"悬停拾取每帧执行一次射线"~~ —— 实为 `hoverDirty` 脏标记驱动（`src/engine/engine.js:1608-1615`），问题不在频率而在**未走 BVH**（P0-2 已按此重写）。
4. ~~"日厅 `.nc-badge` 金色 1.65:1 不可读"~~ —— 运行时实测日厅该元素为 `rgb(111,101,83)`，对比度 **5.08:1 合格**（`/tmp/audit-results5.json` dayHallStates）；日厅真实问题是 81 个 class 的辅助文字（P1-3）。
5. ~~"20 台 GLB 纹理未走 webp"~~ —— 实测 97 台有纹理且 **97/97 全为 EXT_texture_webp**，其余 20 台本就无纹理（程序化材质）。压缩链无漏网。

## 本次未竟验证（诚实记账）

| 项 | 状态 | 补测方式 |
|---|---|---|
| hover 帧耗时（radial-engine 修复前后 p95） | 探针脚本崩溃未取数 | 修 `/tmp/audit-probe3.mjs` 第 117 行断言后重跑 |
| 切台往返 heap 曲线（P1-5/P1-6 的实际收益） | 同上 | 同上 |
| 真机（iOS Safari / Android / 集显 Win）显存与 context lost | 环境缺失 | 需真机或 BrowserStack 类条件 |
| 生产服务器 HTTP 缓存头 / CSP 实际生效 | 本机不可测 | 部署后复测 |
| 弱网下 10 台大件首载耗时 | 未做网络节流实验 | DevTools throttling 慢 3G |
| 读屏（VoiceOver/NVDA）真实走查 | 未做 | 桌面 VoiceOver + 移动各 1 轮 |
| 长时间（>10 分钟）连续导览的帧率与内存 | 未做 | 需要专门的 soak 脚本 |

---

## 追加：2026-11-03 复审新增问题（RS 系列）

> 触发：HEAD 由 `e8106be` 前进 22 个提交至 `6f5ed70`，规模 115→**128 台 · 952 部件 · 44 品牌**，新增 `src/studio/`（2181 行）+ `StudioView.vue`（749 行）+ `/studio` 路由。
### RS 整改状态（2026-11-04 续轮后，RS 全表收官；详见 `REAUDIT-2026-11-03.md` §七/§八）

| 编号 | 状态 |
|---|---|
| RS-01 `__STUDIO` 泄漏 | ✅ 已关闭（运行时验证：离开 /studio 钩子消失；5 次往返 heap 10.3MB） |
| RS-02 path 失配 | 🟡 已实现+对照验证（基线组合后选中态丢失→修复后跟随；"指向别的对象"未端到端复现） |
| RS-03 兄弟序还原 | ✅ 已关闭（新增 2 用例 + 反向证明；单测 21/21） |
| RS-04 导入预算 | ✅ 已关闭（合计上限 + size 未知补判 + content-length 预拒） |
| RS-05 blob 泄漏 | ✅ 已关闭（try/finally） |
| RS-06 移动端右列 | ✅ 已关闭（overflow-y:auto；触控未覆盖 131→7） |
| RS-07 外链外发 | ✅ 已关闭（canary：修复前 1 次真实请求 → 0 次；data: 放行） |
| RS-08 资产格式 | ✅ 已关闭（4 台重编码，几何全等闸门；lint-assets 128/128） |
| RS-09 组合命令幽灵记录 | ✅ 已关闭（2026-11-04：`applyCommands` 执行先行+逆序回滚，全部成功才入栈） |
| RS-10 studio PMREM | ❌ **撤销（误报）**——viewer.js:193-194 已有 pmrem.dispose |
| RS-11 DRACO 双单例不终止 | ✅ 已关闭（2026-11-04：引擎与 studio 两侧 dispose 时 terminate worker 池） |
| RS-12 修复粒度文案失真 | ✅ 已关闭（2026-11-04：新增 `repairAll`，全部可修规则合并为**一条**组合命令，文案承诺为真） |
| RS-13 textgen unknown/上限 | ✅ 已关闭（2026-11-04：成功路径列出未识别子句 + textarea maxlength=600 + API 层 4000 兜底） |
| RS-14 IDB 连接/原子性 | ✅ 已关闭（2026-11-04：整页单连接+onversionchange 关闭；恢复单事务原子+同 id 跳过不覆盖；base64 分块编解码；浏览器断言含「同 id 重复恢复跳过」） |
| RS-15 无确认替换/失败毁现场 | ✅ 已关闭（2026-11-04：失败导入保留已载入模型+01 面板横幅报错；生成前确认；loadWork 按返回值如实报失败。衍生 RS-15b 确认框无头挂起已由 studio-verify 对话框自动接受解决，55/55） |
| RS-16 设备页付费整包生成器 | ✅ 已关闭（2026-11-04：registry 懒加载化——registry chunk gzip 29.17→**1.35KB（−95%）**，6 生成器拆独立异步 chunk；生产 preview 实证普通设备页零生成器 chunk；CREATE/深链 async 化，冷加载重建路径实测正常；GENERATOR_ID 运行时断言防表漂移） |
| RS-17 诊断异常静默 | ✅ 已关闭（2026-11-04：`failedRules` 上报 + UI 与「未命中任何规则」明确区分） |
| RS-18 aria-live/页脚 | ✅ 已关闭（2026-11-04：polite status 区汇总四路结果消息；页脚更正为实际交付口径） |
| 新增闸门 | ✅ `tools/lint-hooks.mjs`、`tools/lint-assets.mjs`（已挂 lint:devices，现 6 段） |

> 观察记录（2026-11-04 无头取证，非本轮回归）：设备页 **A→B 同文档 hash 热切换**（如 iphone-13 → forge 深链经 `page.goto` 仅变 hash）config 不换新、模型永久 LOADING——**干净 HEAD worktree 复现同样行为**，属既有缺陷/伪影；正常用户路径（/forge 生成后 router.push、冷加载深链）实测正常。
> **✅ 已关闭（2026-11-04 AURORA PHASE 3 前置项）**：根因两层——① RS-16 的 `forgeRequested` 纯前缀化已修复主装载路径（HEAD 复验的失败发生在该修复之前）；② `DeviceViewer.vue:1222` watcher 的 `metaById[id]?id:FALLBACK` 对 forge id 一律回落（双保险已加固为 `metaById[id]||isForgeId(id)`）。实证：forge 热切换 ✓（booted+PROCEDURAL）+ 普通设备热切换回归 ✓。

> 本文件上方所有原始结论**保留不改**；旧条目的存续核查（哪些仍关闭、哪些已被内容工作真正解决）与完整证据见 **`REAUDIT-2026-11-03.md`**。
> 上轮两处测量错误也在该文件第四节自查纠正（"星图加载 three" 系 `three-axis-gimbal.js` 文件名误判；"Apollo 纹理 64547 / 34GB 显存" 系我的 JPEG marker 解析未在 SOS 处停止）。

### P0

**RS-01 · `/studio` 卸载不删 `window.__STUDIO`**
- 证据：`src/studio/index.js:240` 写入；`src/components/StudioView.vue:300` 卸载只调 `api.dispose()`，而 `api.dispose` 仅 `viewer.dispose()`。留存链：`api → report → nodesByPath（全部 Object3D）→ 几何/贴图` + `workshop.history` 50 条命令闭包 + 已 dispose 的 renderer + 脱离 DOM 的 canvas（匿名 pointer 监听 `viewer.js:147-154` 无法移除）。
- 定性：与**上一轮刚修好并写进注释**的 `__ENGINE` 是同一缺陷类别在新模块重演（对照 `DeviceViewer.vue:1258`）。是项目自述"OOM 崩页"的代码侧放大器之一；**根因归因未定论**（另一路运行时观察显示单轮访问可回收，环境负载亦是触发器）。
- 建议：`api.dispose` 内 `delete window.__STUDIO` + `workshop.dispose()` + `report = null`；canvas 监听改具名并 remove。**成本：低**。**立即实施：是**。

### P1

| 编号 | 问题 | 证据 | 影响 | 成本 |
|---|---|---|---|---|
| RS-02 | 结构性操作后索引型 path 全线失配（`resurvey` 重建 path，但 snapshot 键 / `selectedPath` / `checked` 不重映射） | `importer.js:170`、`workshop.js:15`、`index.js:48-53`、`StudioView.vue:360` | 复位静默失效；"应用变换"可能改到**另一块网格**并写入历史 | 中 |
| RS-03 | 乱序选择的兄弟序还原不确定（`snaps` 依选择序、`splice(index)` 假设升序） | `groupops.js:24,41`；探针选择 [C,A] 撤销后 `A,B,D,C` | 与提交信息"精确还原兄弟序"不符；19/19 单测未覆盖同父乱序 | 低 |
| RS-04 | 导入无总量/顶点预算；`size ?? 0` 使未知 size **绕过体积守卫**；`loadSample` 先全量读入内存再校验 | `importer.js:12,33,43-48`、`index.js:92-95` | 大文件直接崩页 | 中 |
| RS-05 | `URL.createObjectURL` 仅在成功路径 revoke（位于所有 throw 之后） | `importer.js:58-62` vs `:112` | 每次失败导入永久留存全部文件字节 | 低 |
| RS-06 | `/studio` 移动端右列不可滚动 + 触控热区未覆盖 | `StudioView.vue:744-748`；实测 390×844：aside 高 329px、`overflowY:visible`、**14 目标 11 个 <44px** | 手机上下半屏功能触不到 | 低 |
| RS-07 | 外链 URI 被真实 `fetch`，与 UI 承诺"文件不离开浏览器"冲突 | `importer.js:63-68`、`StudioView.vue:24,78` | 隐私 + 真实性双违背（AGENTS §1.2）；canary 实测待补 | 低 |
| RS-08 | 新入馆资产违反项目自有压缩铁律：Apollo 三件贴图为 **JPEG**（13 张），`apollo-hatch` **未走 DRACO** | `/tmp/glb-audit-v3.json`：`{webp:1154, jpeg:13}`、`noDraco:['apollo-hatch']` | 体积/显存白付 2–3×；铁律只写在工具注释里，**无闸门** | 低 |

### P2 / P3

| 编号 | 级别 | 问题 | 证据 |
|---|---|---|---|
| RS-09 | P2 | 组合命令"先入栈后执行"，子命令抛错留半生效幽灵记录 | `workshop.js:118-126`；`index.js:145-146,157-158,190-191` |
| RS-10 | P2 | `/studio` 自建 PMREM + RoomEnvironment 不 dispose（P1-6 同类在新模块重演） | `viewer.js:19-20` vs `:185-196` |
| RS-11 | P2 | 主引擎与 studio 各持一个 DRACO 单例（workerLimit=4 各一组，均不 terminate）；注释"同约定"易误读为复用 | `importer.js:27` vs `engine.js:53-62` |
| RS-12 | P2 | `doRepairAll` 多规则各成一条命令，UI 却称"撤销可整体还原" | `StudioView.vue:346-357` vs `index.js:185-199` |
| RS-13 | P2 | 文字生成成功路径不展示未识别子句（只在失败时列）；textarea 无长度上限，超长粘贴可主线程冻结 | `StudioView.vue:407 vs :410`；`textgen.js:61-62,98-110` |
| RS-14 | P2 | IDB 每次 `openDb()` 不 close、无 `onversionchange/blocked`；备份恢复逐条事务非原子、可携带任意 id 覆盖既有作品；备份全量 base64 是堆尖峰 | `library.js:10-23,127-136,96-103` |
| RS-15 | P2 | `generateFromText` 无确认、不入历史替换当前场景；失败导入顺手 dispose 上一份好模型 | `index.js:165-184`、`index.js:75` |
| RS-16 | P3 | `DeviceViewer.vue:492` 静态 import `isForgeId/getForgeDevice` ⇒ 每台设备页付费整个生成器集合（registry chunk gzip 14.59→**29.17KB，+100%**） | `src/forge/registry.js:7-12` |
| RS-17 | P3 | 单条诊断规则异常被静默吞掉，仍可显示"未命中任何规则" | `diagnostics.js:108`、`StudioView.vue:135` |
| RS-18 | P3 | `/studio` 无 `aria-live`（导入/修复/保存对读屏静默）；页脚仍称编辑/作品库/程序化建模"后续版本接入"（实际已上线） | 实测 `ariaLive: 0`；`StudioView.vue:261` |

### 本轮新增的正面记录（防后续误删）

- studio 与主引擎**真解耦**（不 import engine；`markRaw` 阻止 Three 对象深代理，`StudioView.vue:286-297`）。
- 真实性约束落到实现：8 类不可自动修复逐条给理由（`repair.js:7-16`）、诊断标"本地规则 · 非 AI 推断"（`StudioView.vue:129`）、程序化产物 `fileSize:0`（`index.js:169`）。
- `tools/studio-verify.mjs` 显式区分"环境冻结 vs 代码路径"，带负载守护与懒加载边界独立验证。
- 零新依赖（7 个 studio 提交均未动 `package.json`）；工作区 411→38 项，提交按主题拆分且带验证数值。

### 建议新增的两道机器闸门（成本极低，防同类复发）

1. `tools/lint-hooks.mjs`：任何 `window.__<NAME> = ` 写入点必须存在配对 `delete`（当前会命中 RS-01）。
2. `tools/lint-assets.mjs`：断言有纹理的 GLB 一律 `EXT_texture_webp` + `KHR_draco_mesh_compression`（当前命中 Apollo 三件，即 RS-08）。
