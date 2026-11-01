# PROGRESS · 项目进度总览

> 高层进度索引；细节见各专项文档。

## 里程碑

| 日期 | 里程碑 | 证据 |
| --- | --- | --- |
| 2026-10 前 | 2.x 多设备平台（Vue3 壳 + vanilla 引擎分离） | TECH.md |
| 2026-10 中 | 4.0 批量接入至 92 台；知识库/对比/探索系统 | AUTONOMOUS_LOG.md |
| 2026-10-30 | 92 台/761 部件；署名 lint 强制；博物馆化路线研究 | AUTONOMOUS_LOG.md |
| 2026-10-31 | **第一轮 UI/UX 审计重构（阶段 A–H）**：103 台/815 部件/38 品牌；P0×3+P1×6+P2×7 全闭环；smoke 28/28 | `docs/phases/PHASE_A..H`、`docs/design/UI_UX_AUDIT.md` |
| 2026-10-31 | **第二轮彻底重构（阶段 R1–R5，用户授权）**：「深夜展馆」概念落地——门厅海报式首屏（衬线巨字+墙面展台）、展签卡、名字/数据/操作三层字体系、编年时序脊柱、对比展签化、工作空间铭牌化；smoke 28/28、impeccable 0 新增 | `docs/phases/PHASE_R1..R5` |

## 当前质量基线（2026-10-31）

- 构建：`npm run build` ✓ 2.63s；大厅不加载 three chunk。
- 回归：`npm run smoke` 28/28；`npm run lint:devices` ✓；`impeccable detect` 0 新增反模式。
- 已知留白：见 `docs/phases/PHASE_H_DESIGN_QA.md` §遗留。

## 下一步（摘自 AUTONOMOUS_BACKLOG.md）

1. GraphView 标签去重与设备搜索定位；
2. 移动 dock 溢出渐隐提示；
3. 星图/编年/对比页头组件化。
