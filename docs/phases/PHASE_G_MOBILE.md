# PHASE G · 移动端专项（390×844 基准）（2026-10-31）

> 依据 `UI_UX_REFACTOR_SPEC.md` §UI阶段G。移动端问题在 D/E 阶段已随做，本阶段做专项复验与横屏抽查。

## 复验矩阵（全部真实浏览器截图，存 `docs/design/screenshots/`）

| 视口 | 场景 | 截图 | 结果 |
| --- | --- | --- | --- |
| 390×844 竖 | 大厅首屏（顶栏单列/统计/筛选收合行） | `d2-lobby-mobile-top.png` | ✓ P0-3 修复 |
| 390×844 竖 | 大厅滚动（网格可达、搜索吸顶） | `d2-lobby-mobile-collapsed-scroll.png` | ✓ P0-2 修复 |
| 390×844 竖 | 筛选展开（无吸顶占屏） | `d2-lobby-mobile-filter-open.png` | ✓ |
| 390×844 竖 | 工作空间整机（取景完整） | `e2-workspace-mobile.png` | ✓ P0-1 修复 |
| 390×844 竖 | 工作空间爆炸（全景+标签） | `e2-workspace-mobile-exploded.png` | ✓ |
| 390×844 竖 | 部件 sheet（内容可滚过 dock） | `e2-ctxcard-mobile.png` | ✓ P1-1 修复 |
| 390×844 竖 | 帮助卡（单列可读） | `e2-guide-mobile.png` | ✓ P1-6 修复 |
| 844×390 横 | 工作空间（rail+dock+取景） | `h2-workspace-landscape.png` | ✓ |
| 844×390 横 | 大厅 | `h2-lobby-landscape.png` | ✓ |

## smoke 移动断言（全绿）

sheet 打开 / 剖切条不被 sheet 遮挡（间距 19.8px）/ sheet 高度封顶 46vh（实测 388px）/ 特写限高横幅 150px / sheet 内容可滚动。

## 已知留白

- 移动 dock 溢出项（标签/导览/截图/帮助）依赖横滑，无滚动提示渐隐 —— 低优先，backlog。
- 触控目标 34–38px 视觉 + padding 扩展 ≥44 的实测依赖真机，headless 无法完全验证（未验证项如实标注）。
