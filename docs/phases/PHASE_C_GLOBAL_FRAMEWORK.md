# PHASE C · 全局框架与导航重构（2026-10-31）

> 依据 `UI_UX_REFACTOR_SPEC.md` §UI阶段C。全局框架改动以 token 层与可退出性为主。

## 改动清单

| 改动 | 文件 | 对应审计项 |
| --- | --- | --- |
| 全站键盘焦点环：18 类控件 `:focus-visible` 统一 2px `--acc` outline | `src/ui/hud.css` | P1-4 |
| 状态色 token 替换硬编码（hud-dot.ok/.warn、nc-badge、credit-flag.warn、timeline tech 条目） | `style.css` / `hud.css` / `TimelineView.vue` | 阶段B落地 |
| 顶栏 tooltip 下弹变体 `.tip-below`（防视口顶裁切） | `hud.css` + `DeviceViewer.vue` | P2-3 |
| 卡片 hover 瘦身：删右上径向光斑 `::after` 与标题变色，保留抬升+边框+箭头三件套 | `style.css` | P2-4 |
| chip 选中态去 `scale(1.04)` 跳动（改为描边+底色变化） | `hud.css` | UI_GUIDELINES §1.5 |
| 我的探索抽屉：Esc 关闭（window keydown 随开关挂卸）+ 半透明遮罩点击关闭 + `role="dialog"` | `GalleryHub.vue` / `style.css`（`.drawer-scrim`） | 可退出性 |
| 死代码清理：`.row/.row-info/.row-ghost` 孤立媒体查询、重复 `.hub-filter` 双定义块 | `style.css` | diff 审查 |

## 验证

- `npm run build` ✓；Tab 遍历大厅/工作空间焦点环可见（截图抽查）；抽屉 Esc/遮罩退出人工验证。
- `impeccable detect`：本次改动 0 新增反模式。
