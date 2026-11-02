# V3_VISUAL_DIRECTION_PROPOSALS · 三方向真实页面探索结果

> 2026-11-02。依据任务书 §3.3/§17 PHASE 2 执行：**真实运行页面 + 真实截图**，非概念图。
> 预览机制：`?dir=a|b|c` URL 参数或控制台 `__setDir('a'|'b'|'c')` 实时切换（`src/main.js` 脚手架 + `src/style.css` 尾部方向预览层，定稿后吸收/移除）。
> 截图：`docs/ui-ux/v3/references/directions/`（9 张：a/b/c × 大厅 top+grid + 工作空间；日厅均 1440×900，含移动基线）。

## 方向 A · Natural Contemporary Museum「暖白画廊」（日厅）

- 色彩：象牙纸面 `#f4f1ea` / 暖墨 `#211d15→#837967` / 深青绿 accent `#0f766e`；无辉光无玻璃，暖 hairline `rgba(110,95,70,.18)`。
- 结构处理：卡片 = **照片版画**（`#fffdf8` 实底 + 细边 + 分层微阴影，4px 圆角）；页面去掉径向光斑（`hub::before` 移除），纯留白；搜索框/胶囊暖色描边圆角；焦点展台暖砂底。
- 工作空间：顶栏暖白高对比（解决基线"顶栏消失"）；左 rail 展开模式白面板深字层级清晰。
- 气质：印刷品/美术馆展签；对日厅缩略图"夜底"的兼容度最高（版画装裱感让深色图块读作刻意为之）。
- 截图：`a-lobby-top/grid.png`、`a-workspace.png`。

## 方向 B · Precision Engineering Gallery「精密工程」（日厅）

- 色彩：冷纸 `#edf0f3` / 蓝图墨 `#16202b→#64798a` / 工程 teal `#0a7ea4`（延续现日厅 accent）。
- 结构处理：页面 36px **蓝图细网格**底纹；卡片 3px 近直角 + **左上/右下青色 L 形角标记**（registration marks）；chip/搜索方角化；焦点展台加同心刻度环纹。
- 工作空间：顶栏带角标记，仪器面板感。
- 气质：图纸/检测仪器；与"精密刻度底座"（§09）血缘最近，但整体比 A 冷、密。
- 截图：`b-lobby-top/grid.png`、`b-workspace.png`。

## 方向 C · Immersive Dark Exhibition「暗厅精修」（夜厅演进）

- 夜厅已是成熟资产，C 不换方向只做精修：底色加深一档（`#020408/#040810/#0c141f` 三层纵深）、馆导视条下缘换**暖金 hairline**（`rgba(196,164,96,.22)`）、后续接入六层底座与材质升级（Phase 6）。
- 大厅层面变化克制（本来已协调），价值在 3D 展陈层。
- 截图：`c-lobby-top.png`、`c-workspace.png`。

## 对照结论

| 维度 | A 暖白画廊 | B 精密工程 | C 暗厅精修 |
| --- | --- | --- | --- |
| 与夜厅的互补性 | 高（冷暖对偶明确） | 中（同冷调，昼夜差异弱） | —（即夜厅） |
| 缩略图夜底兼容 | **最高**（版画装裱） | 中 | 最高（同底） |
| 与"精密展陈底座"血缘 | 中 | **最高** | 高 |
| 割裂感根因（F1/F2）缓解 | 直接 | 直接 | 不涉及 |
| 独特辨识度 | 高（当代馆） | 中（工程风常见） | 已有 |

- 任务书 §3.4 推荐"A+B 整体、C 夜厅"：落地口径 = **A 的纸面材质与留白为日厅基调 + B 的结构语汇（角标记/刻度/网格）只在"数据与工具"层点缀**（filter/工具栏/HUD 用 B，展品卡片与留白用 A），避免全页网格。
- UUPM design-system 检索结果（Swiss minimal + gallery black/white + Space Grotesk）与 A/B 融合口径一致。
- Oil UI 方法论已采纳（真实页面多方向对比）；其独立风格对比页生成器未使用——对既有 SPA 无必要，`data-dir` 零依赖实现同等效果（记录于 DESIGN_TOOLCHAIN_VERIFICATION §2）。

## 底座三方案（§9.4）预告

UI 方向定稿后进入 Phase 6：Precision Ring（B 血缘）/ Architectural Plinth（A 血缘）/ Holographic Platform 三套 Three.js 几何方案，双厅材质共享几何，含选中/拆解态取证。
