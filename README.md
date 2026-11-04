# 格物馆 · MUSEUM OF MACHINES（原 DJI 拆解馆）

高质感、多品牌、可交互的 3D 产品拆解数字博物馆：把机器拆到最后一颗螺丝，格一物，致一知。
Vue 3.5 + Vite 5 UI 壳 + 原生 Three.js 引擎（`src/engine/`），设备声明式配置（`src/devices/`），运行时模型统一 GLB。

## 快速开始

```bash
npm install
npm run dev        # 本地开发
npm run build      # 生产构建
npm run smoke      # 端到端冒烟回归（详见 package.json）
```

## 核心文档索引

| 文档 | 说明 |
| --- | --- |
| [docs/roadmap/GEWU_AUTONOMOUS_MASTER_DEVELOPMENT_MISSION.md](docs/roadmap/GEWU_AUTONOMOUS_MASTER_DEVELOPMENT_MISSION.md) | **自主研发总任务书 v2.0.0（长期总纲 · 28 部分 51 章：最高目标/真实性红线/资产标准/四类体验能力/机械模拟分级/PHASE 01-07 路线/GOAL 模式/停止条件）** |
| [docs/roadmap/GEWU_V5_AURORA_EXPERIENCE_PERFORMANCE.md](docs/roadmap/GEWU_V5_AURORA_EXPERIENCE_PERFORMANCE.md) | **V5.0.10 AURORA 体验与性能专项任务书（当前执行中：体验第一优先级/性能第二，PHASE 0-7；独立专项，不转长期 goal）** |
| [AGENTS.md](AGENTS.md) | 自主研发总则（长期工作规则） |
| [TECH.md](TECH.md) | 技术架构与收口记录 |
| [MODEL_INVENTORY.md](MODEL_INVENTORY.md) | 自动生成的模型清单（勿手改） |
| [docs/design/UI_UX_REFACTOR_SPEC.md](docs/design/UI_UX_REFACTOR_SPEC.md) | **UI/UX 系统性审计与重构规范（长期有效，UI 工作必读）** |
| [docs/roadmap/GEWUGUAN_AUTONOMOUS_3D_ITERATION.md](docs/roadmap/GEWUGUAN_AUTONOMOUS_3D_ITERATION.md) | 自主通宵迭代任务书（3D 真实性专项，2026-11-01） |
| [docs/roadmap/GEWUGUAN_V2_REQUIREMENTS_SUPPLEMENT.md](docs/roadmap/GEWUGUAN_V2_REQUIREMENTS_SUPPLEMENT.md) | **V2 权威任务书：新增需求与深度优化（双厅/导航/工具栏/坐标台/收藏/评分/诊断/审计）** |
| [docs/roadmap/GEWU_V3_MECHANICAL_FORGE_AUTONOMOUS_EXECUTION.md](docs/roadmap/GEWU_V3_MECHANICAL_FORGE_AUTONOMOUS_EXECUTION.md) | **V3.0 机械锻造所总指令：程序化机械创造引擎（持续自主研发协议）** |
| [docs/roadmap/GEWU_V4_OPEN_MUSEUM_ROADMAP.md](docs/roadmap/GEWU_V4_OPEN_MUSEUM_ROADMAP.md) | **V4.0 OPEN MUSEUM 路线图（自主编制）：双厅缩略图/接地治理/发布就绪/预设库** |
| [docs/ui-ux/v3/MUSEUM_OF_MACHINES_V3_UI_UX_REDESIGN_MASTER_PLAN.md](docs/ui-ux/v3/MUSEUM_OF_MACHINES_V3_UI_UX_REDESIGN_MASTER_PLAN.md) | **V3 UI/UX 重构主任务书（双厅语义体系/六层底座/工具链）** |
| [docs/AUDIT-3D-AUTHENTICITY.md](docs/AUDIT-3D-AUTHENTICITY.md) | 3D 展品真实性问题清单（屏幕方案/分级/径向评估） |
| [docs/changelog/](docs/changelog/) | 分阶段开发日志 |
| [docs/design/BRAND.md](docs/design/BRAND.md) | 馆牌与命名规范（格物馆，原拆解馆） |
| [docs/design/UI_UX_AUDIT.md](docs/design/UI_UX_AUDIT.md) | UI 实际审计问题清单 |
| [docs/design/DESIGN_SYSTEM.md](docs/design/DESIGN_SYSTEM.md) | 设计系统与 Design Tokens |
| [docs/design/UI_GUIDELINES.md](docs/design/UI_GUIDELINES.md) | UI 组件与页面规范 |
| [docs/phases/](docs/phases/) | UI 重构各阶段实施档案 |
| [docs/AI_HANDOFF.md](docs/AI_HANDOFF.md) | AI 接手须知 |
| [docs/audit/MASTER_PROJECT_AUDIT.md](docs/audit/MASTER_PROJECT_AUDIT.md) | **全维度项目审计指令原文归档（2026-11-02）** |
| [docs/audit/PROJECT_AUDIT_REPORT.md](docs/audit/PROJECT_AUDIT_REPORT.md) | **审计报告：现状 / 架构 / 十二维度结果 / 优秀实现 / 风险矩阵** |
| [docs/audit/PROJECT_ISSUES.md](docs/audit/PROJECT_ISSUES.md) | **问题清单：P0×2 · P1×9 · P2×15 · P3×14 · IDEA×6（含已撤销的 5 条误报）** |
| [docs/audit/PROJECT_ROADMAP.md](docs/audit/PROJECT_ROADMAP.md) | **优化路线图 Phase 0–7（含依赖顺序与验收标准）** |
| [docs/audit/PROJECT_AUDIT_SCORE.md](docs/audit/PROJECT_AUDIT_SCORE.md) | **综合评分 75/100（十维加权，逐项证据）** |
| [docs/audit/PROJECT_OPTIMIZATION_LOG.md](docs/audit/PROJECT_OPTIMIZATION_LOG.md) | 审计驱动的整改台账 |
| [docs/audit/REAUDIT-2026-11-03.md](docs/audit/REAUDIT-2026-11-03.md) | **复审记录（2026-11-03）**：128 台 / 新增 `/studio` 后的增量重审、旧结论存续核查、RS-01~18 新问题、上轮两处测量纠错、复评 77/100 |
| [AUTONOMOUS_LOG.md](AUTONOMOUS_LOG.md) | 自主研发迭代日志 |
| [AUTONOMOUS_BACKLOG.md](AUTONOMOUS_BACKLOG.md) | 待办池 |
| [MUSEUM-ROADMAP.md](docs/MUSEUM-ROADMAP.md) | 博物馆化路线研究 |

## 机械锻造所（MECHANICAL FORGE）

`/forge` 路由：程序化生成概念机械（V8 / 涡扇 / FORGE-99 虚构核心），参数+种子确定性复现。

- **生成物导出**：设备页或 `/forge` 近期列表 → `⬇ GLB`（层级/命名/材质保留；运行时演示动画不导出）。文件名规约：`<模型名>_<生成器>v<版本>_seed-<种子>.glb`。
- **配置分享**：`⧉ 配置` 复制 JSON（`gewu-forge/1` 格式），粘贴到「05 · 导入配置」即可在他机/他日复现同一模型——同生成器版本+参数+种子 ⇒ 同结果。
- 生成物为**概念示意模型**（虚构件明确标注），不进 `MODEL_INVENTORY`（manifest 之外），不标注性能参数。

## 资产与许可

- 运行时模型仅 GLB（`webp → draco` 压缩顺序）；原始资产备份于 `vendor/assets/originals/`（不入库）。
- 来源与许可记录见 `docs/credit-research-raw.json` 与各设备配置的 `modelCredit` 字段。
