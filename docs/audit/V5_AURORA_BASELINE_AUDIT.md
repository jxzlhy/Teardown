# V5.0.10 AURORA · 基线审查（PHASE 0）

> 审查日期：2026-11-04 ｜ 基线：工作区（含本轮 RS-09~18 整改 + 并行会话 R9/V5.0.6 未提交中间态），HEAD `e10255b`
> 方法：真实代码检索 + 本会话实测门禁数据 + 既有审计（`PROJECT_ISSUES.md` / `REAUDIT-2026-11-03.md`）复核；所有结论带 `file:line` 或工具名证据。未经实测的项标注 UNVERIFIED。
> 任务书：`docs/roadmap/GEWU_V5_AURORA_EXPERIENCE_PERFORMANCE.md`（字节级归档 ✓）

## 1. 当前项目架构

- **技术栈**：Vue 3.5 + Vite 5 + vue-router 4（hash）+ Three.js 0.164 + three-mesh-bvh + GSAP（仅 UI 时间线）；原生 CSS，无 UI 库（package.json ✓）。
- **路由 8 条**（`src/main.js:16-23`）：`/` `/collection`（大厅双厅同壳）`/device/:id` `/compare/:group` `/forge` `/studio` `/graph` `/timeline`。全部路由级懒加载；星图/编年/大厅不加载 three 主 chunk（生产 preview 实测，REAUDIT §一）。
- **引擎与壳解耦**：`src/engine/`（vanilla three，`engine.js` 2078 行）与 Vue 壳经 `window.__ENGINE` 钩子 + 状态回调通信；`src/studio/`（10 模块，V5.0 系列）与主引擎互不 import（REAUDIT「正面记录 1」）。
- **馆藏规模**：**129 台 · 956 部件 · 45 品牌**（`MODEL_INVENTORY.md` 2026-11-04 生成，五处一致闸门 `tools/lint-consistency.mjs` 挂 lint 链尾）。
- **验证资产**：Node 单测 4 套件 77 项 + `smoke`（28 项）+ `studio-verify`（55 项）+ `hud-verify`（12 项）+ `verify:contrast` + lint 六段链（含 `lint-hooks`/`lint-assets` 两道 2026-11-03 新闸门）。

## 2. 当前 UI 设计体系

- **已有**：`docs/design/DESIGN_SYSTEM.md` 13 节——视觉定位/Color Tokens（代码唯一来源 `src/style.css :root`）/Typography/Spacing/Glass 三级配方/Motion Tokens/Focus States/Z-Index 汇编/组件准入/禁止事项/换肤流程/展陈空间组件模式（§13，R9 参考站语法）。
- **双厅体系**：夜厅（默认）+ 日厅 `html[data-hall="day"]` 语义 token 层（`src/style.css:1146-1149` 等），AA 对比度 0 不达标（`verify:contrast` 常绿）。
- **样式规模**：`src/style.css` 1569 行 + `src/ui/hud.css` 142 行 + 各 Vue scoped。
- **既有债（P2-8，2026-11-02 审计，部分仍开放）**：字号 29 种唯一值（本轮重测 `grep -oE "font-size:" | sort -u` = 29）、青色字面量 29 处（`rgba(69,224,255,…)`）、hex 49 处（style.css 内）、药丸按钮 6 套/搜索框 2 套/eyebrow 3 套/tooltip 4 套；Phase 4「令牌补全 + class 归一」未启动。

## 3. UI/UX 问题清单（按 AURORA 视角重组既有审计）

| # | 问题 | 证据 | AURORA 归属 |
|---|---|---|---|
| U1 | 令牌债：29 种字号/多套同功能组件并存，设计语言不统一 | 本节 §2 数据 + P2-8 | PHASE 1 设计系统 |
| U2 | 首屏无发现路径：搜索在 1366px 折叠线下，首屏可交互元素仅 6 个 | P1-4（产品裁定挂账） | PHASE 2 |
| U3 | 字符图标 ~28 处与内联 SVG 并存，跨平台字形漂移 | P2-9 | PHASE 2 |
| U4 | `:active` 按压反馈 0 条、aria-live 此前 0 处（/studio 已补） | P2-7 + RS-18 已关 | PHASE 2 |
| U5 | 视角菜单 Tooltip 遮挡历史缺陷、dock 移动端溢出提示缺失 | V2 §20 任务书 + backlog | PHASE 3 |
| U6 | og:image/robots/sitemap/manifest 缺失（分享无卡片） | P2-11（backlog 已排） | PHASE 2 顺带 |
| U7 | 页面间版式语法不均：R9 已升级设备页，星图/编年/对比页头未对齐（已裁定「数据密集页无需重构」，保持） | PHASE_R4 审计结论 | PHASE 2（克制：不做过度设计） |

## 4. 交互问题清单

| # | 问题 | 证据 | AURORA 归属 |
|---|---|---|---|
| I1 | 切台时序/动画手感（loader 表现/相机回位/面板状态清理连贯性）——并行会话已立项 V4.1a 候选 | NEXT_SESSION 11-04 | PHASE 3（与 V4.1a 合流，避免双头建设） |
| I2 | 设备页 A→B 同文档 hash 热切换 config 不换新（既有缺陷，无头实证） | PROJECT_ISSUES 观察记录 | PHASE 3 前置修复 |
| I3 | 零件导航大模型性能保护已有（500 行上限 + 提示），但无搜索/分类 | `StudioView.vue:499-502`（studio 侧）；设备页 rail 为两行行结构（R9） | PHASE 3 |
| I4 | 选中反馈：hover 高亮/轮廓/聚焦已有（OutlinePass×2 + flyToPart），缺「其他零件弱化」的层次表达 | engine.js:115,484 | PHASE 3 |
| I5 | 触控热区：24 类控件已扩 44px（P2-10 关闭），/studio 已覆盖（RS-06 关闭）；真机复核仍缺 | REAUDIT §二 | PHASE 6 |

## 5. Skills 资源清单（38 个项目本地 + 全局若干）

**设计/UX 相关（AURORA 优先激活池）**：`frontend-design`、`impeccable`、`oil-ui`、`ui-craft`（+dense-dashboard/editorial/minimal 变体）、`ui-ux-pro-max`、`design-system`、`tokens`、`polish`、`redesign`、`audit`、`critique`、`heuristic`、`delight`、`friction-log`、`animate`、`typeset`、`bolder`、`quieter`、`craft`、`shape`、`harden`、`ui-styling`、`brand`、`banner-design`。
**工程相关**：`add-device`、`convert-asset`、`machine`。其余为流程/文本类（start/brief/clarify/distill/extract/finalize/remember/slides/skill-creator 等）。
路径：`.zcode/skills/<name>/SKILL.md`（`.agents/skills/` 38 个镜像）。
**使用规则（任务书 §4.2）**：逐项记录名称/路径/能力/应用场景/执行任务/结果/文件/验收——随各 PHASE 执行档记录；不适用不强行调用。

## 6. 模型加载链路（现状，实测证据）

```
进入设备页 → loaders[id] 动态 import 设备配置（virtual:device-loaders 分包）
→ fetchGlb（src/engine/glbCache.js）：Cache Storage LRU（teardown-glb-v1 + meta LRU 淘汰）
   ├─ 命中缓存 → 直接 ArrayBuffer（二次进入零请求）
   ├─ 未命中 → 流式下载 + onProgress（LOADING N%）+ 回填缓存
   └─ 并发同 URL 合并一次下载；全部订阅取消即 abort
→ GLTFLoader.parse + DRACOLoader（引擎级单例，dispose 时 terminate，RS-11 已关）
→ 归一化/映射 → scheduleBVH 分帧增量建 BVH（P0-2 已关）→ finalize → 首渲染
```
- **未使用**：KTX2/Basis 纹理压缩、meshopt、LOD 管线、InstancedMesh（全库 grep 仅资产名含 "LOD0" 字样，无管线实现）。
- **纹理现状**：webp ≤2048px 全量强制（`lint-assets` 128→129 台合规常绿）；显存口径最大单台 v6-engine 815MB（估算值）。
- **压缩管线工具**：`tools/optimize-glb.mjs`（webp→draco 铁律+resize）、`inspect-glb.mjs`、`join-materials.mjs`、`strip-nodes.mjs`、`usd2glb.py`、`cad2glb.py`。

## 7. 渲染性能问题（诚实清单）

| # | 问题 | 证据 | 状态 |
|---|---|---|---|
| R1 | 后处理链常驻 + 无按需渲染（rAF 恒转，含 500ms watchdog 空转） | P2-1（`engine.js:1674` 一带） | **开放**，AURORA PHASE 5 主目标 |
| R2 | 标签层每帧全量写 DOM 无脏检查 | P2-2（labels.js:77,112-141） | **开放**，PHASE 5 |
| R3 | composer RT 无 samples、renderer antialias 对 composer 无效 | P2-1 证据栏 | **开放**，PHASE 5 |
| R4 | >6MB GLB 10 台（v6-engine 13.7MB…）；中位 0.94MB | P2-3 / REAUDIT 表 | 部分（2048 上限已收显存，传输体积未再压） |
| R5 | 自适应画质已有三级（quality 2/1/0 + fps watchdog，`engine.js:132-149`），但无 DPR 动态调整与设备内存分级 | 代码 | PHASE 6 |
| R6 | LOD/InstancedMesh 无管线（当前不需要盲目上；真实拆解件独立性优先——任务书 §9.1 红线） | §6 证据 | 评估后缓行 |

## 8. 内存与 GPU 资源管理

- **已关闭项**（不重复建设）：`__ENGINE`/`__STUDIO` 卸载删除（P1-5/RS-01）、PMREM 释放（P1-6/RS-10 撤销误报）、设备组遍历 dispose、draco worker terminate（RS-11）、studio viewer 全量 dispose、IDB 连接治理+原子恢复（RS-14）。
- **开放项**：`window.__LOADS` 只增（P2-14，建议收敛为 `__GEWU_DEBUG` 限长）；切台往返 heap 曲线缺长期 soak 数据（历史探针两次崩溃未取数）；`glbCache` 有 LRU 淘汰（`cache-policy.js`）但容量上限值 UNVERIFIED 需实测校准。

## 9. 移动端性能问题

- 已有：`prefers-reduced-motion` 全链降级（7/7）、自适应画质三级、44px 触控热区、safe-area、移动端 sheet/dock 布局、thumbs 管线 129 台双厅图。
- 开放：DPR 上限策略仅 `min(devicePixelRatio,2)`（viewer 侧），引擎侧 UNVERIFIED；纹理预算/复杂度预算无按设备分档；真机实测缺席（环境限制，长期挂账）；A→B hash 热切换缺陷（I2）在移动端同样存在。

## 10. 已有优化与不能重复建设的功能（防重复投入清单）

1. BVH 拾取加速（P0-2）、纹理 2048 上限（P0-1）、webp→draco 铁律 + lint-assets 闸门、glbCache LRU+预取+并发合并、自适应画质三级、日/夜双厅语义 token、对比度 0 不达标常绿闸门、hooks/assets 双 lint 闸门、缩略图双厅管线、清单/星图/编年三生成器 + 五处一致闸门、forge 懒加载（−95% gzip）、studio 全链真实性口径。
2. **禁止回退**：日厅 token 体系勿回退硬编码；plinth「无数字」红线；`MODEL_INVENTORY.md` 只读；原始资产不可覆盖（`vendor/assets/originals/`）。
3. **不得新建**：第二套设计 token 层、第二套图标体系（扩展现有 SVG sprite 即可）、第二套缓存层、LOD 管线（未评估收益前）。

## 11. 实施顺序（PHASE 0 结论）

结合「影响×置信度×可回滚」与任务书 PHASE 0-7：

1. **PHASE 1 设计系统先行**（令牌归一：字号/间距/组件类收敛，扩展而非新建 DESIGN_SYSTEM §2-6；同时清 U4/U6 低垂果实）——理由：后续所有 UI 工作的地基，纯前端可回滚。
2. **PHASE 3 前置修 I2（hash 热切换）**——数据正确性缺陷，先行修复避免交互升级建立在坏地基上；随后与 V4.1a 切台手感合流。
3. **PHASE 4 资产管线**（加载阶段化反馈 §8.3 + KTX2 试点评估 + glbCache 容量实测校准）——KTX2 先 2-3 台 A/B 验证材质无损再扩量（任务书 §8.2 红线）。
4. **PHASE 5 渲染引擎**（按需渲染 R1 + 标签脏检查 R2 + composer samples R3——三项都有明确证据，收益可测）。
5. **PHASE 2 全局 UI 随 PHASE 1 令牌落地滚动推进**（首屏发现路径 P1-4 需出方案稿，属产品裁定，先提案后动工）。
6. **PHASE 6/7** 移动端分档与终验收口。

> PHASE 0 完成判定：本档 + 执行状态档建立 + 版本号核定（V5.0.10 未占用 ✓）+ Skills 清单 ✓ + 加载链路图 ✓。
