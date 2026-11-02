# AI HANDOFF — 接手须知

> 馆名沿革：2026-10-31「拆解馆」更名「格物馆」（原 DJI 拆解馆），见 `docs/design/BRAND.md`；历史文档保留原名。
> **当前任务（2026-11-02）**：《MUSEUM OF MACHINES · V3 DESIGN SYSTEM & FULL UI/UX REDESIGN》**权威全文**存档于 `docs/ui-ux/v3/MUSEUM_OF_MACHINES_V3_UI_UX_REDESIGN_MASTER_PLAN.md`（2688 行，含四件套工具接入、双厅体系、六层底座、模型真实性、分阶段路线 §17）。已完成：Phase 0 审计（`V3_CURRENT_STATE_AUDIT.md`）、Phase 1 工具链（`DESIGN_TOOLCHAIN_VERIFICATION.md`）、Phase 2 三方向探索（`V3_VISUAL_DIRECTION_PROPOSALS.md`，裁定 A+B 融合 + 夜厅 C 精修）、Phase 3 双厅语义 token 体系（`docs/ui-ux/v3/DESIGN_SYSTEM.md`，日厅 ~90 条硬编码已清零）、Phase 6 首切片（六层精密展底座）。下一垂直切片：**V4.0 MECHANICAL INTELLIGENCE（权威任务书 `docs/roadmap/GEWU_V4_MECHANICAL_INTELLIGENCE_AUTONOMOUS_EXECUTION.md`，2026-11-02 用户下达）**——六大系统：①Mechanism Graph（数据层 src/forge/mech.js + 校验 + 锻造 V8 试点 14 边 + DeviceViewer 总览「机构关系」面板 **已落地**，工具 v4-mech-verify.mjs）→ ②Kinematics（统一时钟/速度控制/曲轴转角精确显示）→ ③探索增强 → ④工作原理分步演示 → ⑤模型 QA 诊断 → ⑥工作台 UX。前置工程：OPEN_MUSEUM 自主路线图 Slice 1-4（双厅缩略图/接地治理/发布就绪/预设库）已收官（`GEWU_V4_OPEN_MUSEUM_ROADMAP.md`）。前序收官：V3 UI/UX（docs/ui-ux/v3/ 四件套）与 V3.0 MECHANICAL FORGE PHASE 0-8（任务书 docs/roadmap/GEWU_V3_MECHANICAL_FORGE_AUTONOMOUS_EXECUTION.md；三大标杆 V8/涡扇/FORGE-99 + GLB 导出 + 预设深链 + meshSpin 扩展）。前序：V2 任务书 `docs/roadmap/GEWUGUAN_V2_REQUIREMENTS_SUPPLEMENT.md`（双厅/导航/收藏/评分等已全落地）；屏幕方案策略（native|painted 禁止双层）与展品 `quality` 分级（A/B/C/D）为长期约定；3D 真实性台账 `docs/AUDIT-3D-AUTHENTICITY.md`；分阶段日志 `docs/changelog/`。用户工作方式（2026-11-02 明示）：**全程自主决策，不询问，没叫停不要停**。

> 后续任何 AI 接手本项目时，**必须先阅读**以下文件，再开始工作：

1. `AGENTS.md` — 自主研发总则（最高工作规则）。
2. `docs/design/UI_UX_REFACTOR_SPEC.md` — **UI/UX 系统性审计与界面重构规范（用户于 2026-10-31 下达的完整指令原文）**。凡涉及 UI/UX 改造、页面重构、设计系统调整，必须优先遵循该规范：先读 UI Skill（`frontend-design` / `impeccable` / `frontend-skill`）→ 审计（记入 `docs/design/UI_UX_AUDIT.md`）→ 设计系统（`docs/design/DESIGN_SYSTEM.md`）→ 分阶段重构（阶段档案入 `docs/phases/`）→ 真实浏览器验证 → Design QA 复查。
3. `TECH.md` — 技术架构现状。
4. `AUTONOMOUS_LOG.md` / `AUTONOMOUS_BACKLOG.md` — 最近迭代与待办。
5. `MODEL_INVENTORY.md` — 自动生成，只读。
6. **`docs/audit/PROJECT_AUDIT_REPORT.md` + `PROJECT_ISSUES.md` + `PROJECT_ROADMAP.md` + `PROJECT_AUDIT_SCORE.md` + `PROJECT_OPTIMIZATION_LOG.md`** — 2026-11-02 全维度项目审计五件套（指令原文归档于 `docs/audit/MASTER_PROJECT_AUDIT.md`）。**接手即读**：问题按 P0–IDEA 分级带 `file:line` 证据，整改按 ROADMAP Phase 0–7 推进，每完成一次整改在 `PROJECT_OPTIMIZATION_LOG.md` 追加台账。当前评分 **75/100**；两条 P0（14 台 ≥4096 纹理显存 / 主拾取未走 BVH）与三条可信度 P1（TODO 占位展品 / 全站数字不一致 / 日厅对比度）为最高优先。审计已撤销 5 条误报（见 `PROJECT_ISSUES.md` 末节），**不要重复排查**。

## 工作红线（摘自 AGENTS.md §4–5 与 UI 重构规范 §六）

- 不重写 Three.js 引擎核心；不破坏模型加载、Raycaster 拾取、爆炸拆解、X-Ray/Clip、相机控制。
- 不手改 `MODEL_INVENTORY.md`；不覆盖原始资产与来源/许可记录。
- 源码变更走 Write/Edit 工具（Mimosa 钩子拦截 Bash 写源码）。
- UI 改动必须真实构建 + 浏览器验证，不得只凭代码检查宣称完成。
