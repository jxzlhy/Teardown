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
| [AGENTS.md](AGENTS.md) | 自主研发总则（长期工作规则） |
| [TECH.md](TECH.md) | 技术架构与收口记录 |
| [MODEL_INVENTORY.md](MODEL_INVENTORY.md) | 自动生成的模型清单（勿手改） |
| [docs/design/UI_UX_REFACTOR_SPEC.md](docs/design/UI_UX_REFACTOR_SPEC.md) | **UI/UX 系统性审计与重构规范（长期有效，UI 工作必读）** |
| [docs/roadmap/GEWUGUAN_AUTONOMOUS_3D_ITERATION.md](docs/roadmap/GEWUGUAN_AUTONOMOUS_3D_ITERATION.md) | 自主通宵迭代任务书（3D 真实性专项，2026-11-01） |
| [docs/roadmap/GEWUGUAN_V2_REQUIREMENTS_SUPPLEMENT.md](docs/roadmap/GEWUGUAN_V2_REQUIREMENTS_SUPPLEMENT.md) | **V2 权威任务书：新增需求与深度优化（双厅/导航/工具栏/坐标台/收藏/评分/诊断/审计）** |
| [docs/AUDIT-3D-AUTHENTICITY.md](docs/AUDIT-3D-AUTHENTICITY.md) | 3D 展品真实性问题清单（屏幕方案/分级/径向评估） |
| [docs/changelog/](docs/changelog/) | 分阶段开发日志 |
| [docs/design/BRAND.md](docs/design/BRAND.md) | 馆牌与命名规范（格物馆，原拆解馆） |
| [docs/design/UI_UX_AUDIT.md](docs/design/UI_UX_AUDIT.md) | UI 实际审计问题清单 |
| [docs/design/DESIGN_SYSTEM.md](docs/design/DESIGN_SYSTEM.md) | 设计系统与 Design Tokens |
| [docs/design/UI_GUIDELINES.md](docs/design/UI_GUIDELINES.md) | UI 组件与页面规范 |
| [docs/phases/](docs/phases/) | UI 重构各阶段实施档案 |
| [docs/AI_HANDOFF.md](docs/AI_HANDOFF.md) | AI 接手须知 |
| [AUTONOMOUS_LOG.md](AUTONOMOUS_LOG.md) | 自主研发迭代日志 |
| [AUTONOMOUS_BACKLOG.md](AUTONOMOUS_BACKLOG.md) | 待办池 |
| [MUSEUM-ROADMAP.md](docs/MUSEUM-ROADMAP.md) | 博物馆化路线研究 |

## 资产与许可

- 运行时模型仅 GLB（`webp → draco` 压缩顺序）；原始资产备份于 `vendor/assets/originals/`（不入库）。
- 来源与许可记录见 `docs/credit-research-raw.json` 与各设备配置的 `modelCredit` 字段。
