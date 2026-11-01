# PHASE H · 最终 Design QA 与归档（2026-10-31）

> 依据 `UI_UX_REFACTOR_SPEC.md` §UI阶段H、§七、§八。

## 机械检测

- `impeccable detect --json src/style.css src/ui/hud.css src/components/ src/engine/engine.js`：
  **0 新增反模式**；仅 1 条既有 advisory（`--ease-spring` 弹性缓动——基线已记录，MOTION_GUIDELINES 定位为点缀保留，与改造前结论一致）。

## 功能回归

| 命令 | 结果 |
| --- | --- |
| `npm run build` | ✓ 2.63s（three chunk 771KB 不变，无包体退化） |
| `npm run smoke` | ✓ **28/28 全绿**（含移动端 6 项断言；「大厅统计 6→5 项」为审计有意变更并同步断言） |
| `npm run lint:devices` | ✓ 知识库校验通过（设备配置零改动） |

## 首次审计问题闭环对照（UI_UX_AUDIT.md §3 → 修复）

| 编号 | 问题 | 状态 |
| --- | --- | --- |
| P0-1 | 竖屏取景裁切 | ✅ 引擎取景修正（PHASE_E） |
| P0-2 | 移动筛选占满整屏 | ✅ 收合+条件吸顶（PHASE_D） |
| P0-3 | 移动顶栏折行 | ✅ 单列布局（PHASE_D） |
| P1-1 | sheet 被 dock 遮挡 | ✅ 底部预留（PHASE_E） |
| P1-2 | 大厅筛选失衡 | ✅ IA 重排+品牌折叠（PHASE_D） |
| P1-3 | Hero 展台偏弱 | ✅ 提亮+CTA（PHASE_D） |
| P1-4 | 焦点态缺失 | ✅ 全站 focus-visible（PHASE_C） |
| P1-5 | 统计条工程味/0 值文案 | ✅（PHASE_D） |
| P1-6 | 帮助卡文案/响应式 | ✅（PHASE_F） |
| P2-1~7 | dock 权重/滑杆/tooltip/卡片 hover/timeline 口径/toast 让位/眉题 | ✅ 全部落地（C/D/E/F） |

## 遗留（转 backlog）

1. GraphView 品牌标签重叠 + 无搜索定位（P2-5，功能项）。
2. 移动 dock 溢出无滚动渐隐提示。
3. 触控 ≥44px 真机实测（headless 无法覆盖，未验证项如实标注）。
4. 星图/编年页头可复用为共享组件（结构性优化，低优先）。

## 验收标准自评（SPEC §七）

视觉统一性 ✓（token 收口，0 硬编码新增）· 产品辨识度 ✓（既有档案馆语言保留强化）· 交互体验 ✓（P0/P1 全清）· 响应式 ✓（三视口+横屏实测）· 功能完整性 ✓（smoke 28/28，3D 能力零回归）· 代码质量 ✓（死代码清理、impeccable 0 新增、包体不变）。
