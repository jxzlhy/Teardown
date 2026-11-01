# PHASE F · 通用组件与状态反馈升级（2026-10-31）

> 依据 `UI_UX_REFACTOR_SPEC.md` §UI阶段F。

## 改动清单

| 项 | 文件 | 说明 |
| --- | --- | --- |
| 帮助卡文案去黑话 | `DeviceViewer.vue` | 「自动导览（一键装杯）」→「自动导览（逐部件讲解）」 |
| 帮助卡移动端单列 | `style.css` | ≤700px `.g-cols` 单列 + 面板 `max-height:84vh` 内滚；键帽 nowrap（截图 `e2-guide-mobile.png` 验证） |
| 编年数量口径 | `TimelineView.vue` | 「64 台馆藏」→「64 / 103 台馆藏」（诚实留白口径前置） |
| 编年 tech 配色 token 化 | `TimelineView.vue` | `#c792ea` 系 → `var(--tech)` 派生 |
| toast 状态色可用性 | `style.css` | `--err`/`--warn` token 就位（本阶段未新增错误分支，供后续使用） |

## 未改动说明

- Loading/Empty/Error 三态在 3.0 已完备（loader 分段进度、`#loadErr` 恢复路径、`.hub-empty`），本轮仅复核未改。
- GraphView 品牌标签重叠与搜索定位（P2-5）为独立功能项，转 backlog 不在本阶段强修。
