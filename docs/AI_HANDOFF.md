# AI HANDOFF — 接手须知

> 馆名沿革：2026-10-31「拆解馆」更名「格物馆」（原 DJI 拆解馆），见 `docs/design/BRAND.md`；历史文档保留原名。
> **当前任务（2026-11-01）**：《格物馆 V2｜今日新增需求与深度优化任务书》**权威全文**存档于 `docs/roadmap/GEWUGUAN_V2_REQUIREMENTS_SUPPLEMENT.md`（早期摘要 `GEWUGUAN_V2_TODAY_SUPPLEMENT.md`；前序：《自主通宵迭代任务书》同目录）——章节优先级：P0 第三章零件导航（紧凑/展开双模式+映射准确性）与第四章工具栏（浮层遮挡/视角/X光/测量）→ P1 第二章双厅、第五章坐标台、第六章收藏馆（自定义分类+备注+收藏时间）、第七章评分体系（总体+6维细分+备注）、第九章全站审计 → P1/P2 第八章质量诊断（含追溯）——四阶段：A 遮挡+导航 → B 双厅+坐标台 → C 收藏+评分 → D 诊断+审计。V2 新增长期约定：白天/黑夜双厅模式、零件导航双模式、收藏馆模式、五星多维评分（localStorage `dtm.ratings`）、模型质量诊断报告（docs/QUALITY_DIAGNOSIS.md）。前序任务书要点：屏幕方案策略（native|painted，禁止双层）与展品 `quality` 分级（A/B/C/D，宁缺勿滥）；3D 真实性台账在 `docs/AUDIT-3D-AUTHENTICITY.md`；分阶段日志在 `docs/changelog/`——屏幕方案策略（native|painted，禁止双层）与展品 `quality` 分级（A/B/C/D，宁缺勿滥）是新增长期约定；3D 真实性问题台账在 `docs/AUDIT-3D-AUTHENTICITY.md`；分阶段日志在 `docs/changelog/2026-11-01-autonomous-3d-iteration.md`。下一垂直切片：径向发动机集成（候选与路线已评估入档）。

> 后续任何 AI 接手本项目时，**必须先阅读**以下文件，再开始工作：

1. `AGENTS.md` — 自主研发总则（最高工作规则）。
2. `docs/design/UI_UX_REFACTOR_SPEC.md` — **UI/UX 系统性审计与界面重构规范（用户于 2026-10-31 下达的完整指令原文）**。凡涉及 UI/UX 改造、页面重构、设计系统调整，必须优先遵循该规范：先读 UI Skill（`frontend-design` / `impeccable` / `frontend-skill`）→ 审计（记入 `docs/design/UI_UX_AUDIT.md`）→ 设计系统（`docs/design/DESIGN_SYSTEM.md`）→ 分阶段重构（阶段档案入 `docs/phases/`）→ 真实浏览器验证 → Design QA 复查。
3. `TECH.md` — 技术架构现状。
4. `AUTONOMOUS_LOG.md` / `AUTONOMOUS_BACKLOG.md` — 最近迭代与待办。
5. `MODEL_INVENTORY.md` — 自动生成，只读。

## 工作红线（摘自 AGENTS.md §4–5 与 UI 重构规范 §六）

- 不重写 Three.js 引擎核心；不破坏模型加载、Raycaster 拾取、爆炸拆解、X-Ray/Clip、相机控制。
- 不手改 `MODEL_INVENTORY.md`；不覆盖原始资产与来源/许可记录。
- 源码变更走 Write/Edit 工具（Mimosa 钩子拦截 Bash 写源码）。
- UI 改动必须真实构建 + 浏览器验证，不得只凭代码检查宣称完成。
