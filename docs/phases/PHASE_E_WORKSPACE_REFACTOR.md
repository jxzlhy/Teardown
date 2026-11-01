# PHASE E · 3D 工作空间重构（2026-10-31）

> 依据 `UI_UX_REFACTOR_SPEC.md` §UI阶段E、§四。本阶段含一次引擎侧取景修正（P0-1），影响范围与回归见文末。

## P0-1 竖屏取景裁切（引擎修正，最重要）

**问题**：390×844 竖屏下设备左右被裁（违反 3D_EXPERIENCE_GUIDELINES §1「相机取景不裁切主体」）。

**根因（两层）**：
1. `CAM_HOME/CAM_EXPLODE = BASE × camDist`，与视口 aspect 无关；竖屏水平视场收窄（fov 38° → halfH ≈ 9°）；
2. 深层时序缺陷：`booted` 在引擎**首帧**翻转并创建「开场推近」tween，目标是**装载前**的 CAM_HOME 基值；loadDevice 后 intro 分支因 `booted` 已真被跳过 —— 即使 homes 后来被修正，相机也永远停在基值附近。

**修复**（`src/engine/engine.js`）：
- `portraitBoost()`：`aspect < 1` 时 `min(1/aspect, 2.6) × 1.05`；**横屏恒为 1，桌面历史取景零影响**（实测 1440×900 截图与改造前逐像素级一致）。
- `applyCamHomes()`：统一计算 CAM_HOME/CAM_EXPLODE/maxDistance（含 boost），在 `loadDevice` 与 `onResize`（旋屏）调用。
- 开场推近 tween 从首帧移入 `finalize`（`introPushDone` 独立标志），此刻 homes 已含 camDist+竖屏修正。
- `flyToPart`：`distFit = (diag/2)/tan(min(halfV,halfH)) × 1.15`，竖屏部件特写完整可见；横屏 `distFit < diag×2.2` 行为不变。
- 新增 `window.__CAM` 取景调试观测点（与 `__RAW`/`__ENGINE` 同约定）。

**验证**：`e2-workspace-mobile.png`（整机完整）/ `e2-workspace-mobile-exploded.png`（爆炸全景+标签）/ `e2-workspace-desktop.png`（桌面零变化）/ `h2-workspace-landscape.png`（844×390 横屏正常）；相机半径实测 41.05 = boost 后 home。

## HUD 层级与细节（P2-1/P2-2/P2-6/P1-1）

| 改动 | 文件 |
| --- | --- |
| dock「视图」组微标 `.dock-glabel`（仅 ≥861px 显示）；切台按钮低饱和弱化 | `DeviceViewer.vue` / `style.css` |
| 拆解滑杆端点标记（`#exWrap::before/::after`），0 态可辨识 | `style.css` |
| toast 与剖切条让位：`.viewer.clip-on #toast` 上移（桌面 132px / 移动 108px） | `DeviceViewer.vue` / `style.css` |
| 移动端 sheet 底部预留 `calc(64px + safe-area)`：内容可滚过 dock 不被压（P1-1，截图验证） | `style.css` |

## 红线复核

未触碰：Raycaster 拾取、爆炸/装配逻辑、X-Ray/Isolate/Clip、测量、Tour、自适应画质、深链时序。引擎改动仅限**相机取景**（home 距离与开场 tween 时序），交互控制全部保留；`npm run smoke` 28/28 全绿为证。
